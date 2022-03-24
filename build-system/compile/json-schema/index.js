/**
 * @fileoverview
 * Compiles JSON Schema to a validate() function using ajv.
 */
const dedent = require('dedent');
const {_: ajvCode, Name: AjvName, default: Ajv} = require('ajv');
const {fastFormats: ajvFormats} = require('ajv-formats/dist/formats');
const {once} = require('../../common/once');
const {default: AjvStandalone} = require('ajv/dist/standalone');
const babel = require('@babel/core');

/**
 * Defines custom validators that we may inject into certain schemas.
 * @const {{
 *   fn: string,
 *   error?: import('ajv/dist/types').KeywordErrorDefinition,
 *   shouldUse: (import('ajv/dist/types').SchemaObject) => boolean,
 * }[]}
 *  - `fn` is the name of a validator function exported from `#core/json-schema`
 *    This function must return a boolean value determining whether the data is
 *    valid
 *  - `error` is optional and determines a `KeywordErrorDefinition` for ajv
 *    that's used when validation fails.
 *  - `shouldUse` is a boolean function that tests whether `fn` should be used
 *    for a certain schema.
 *    This function may also modify the schema object in-place. This is
 *    desirable in cases where the validator function should override validators
 *    with an equivalent implementation.
 */
const customValidators = [
  // A schema may include an `enum` with a list of valid currency codes.
  // When its `description` includes the URL that links to currency codes below,
  // we remove this enum and instead use `Intl.NumberFormat` to validate them
  // natively. This prevents the binary from including a long list of currency
  // codes.
  {
    fn: 'isValidCurrencyCode',
    error: {message: 'must be a valid currency code'},
    shouldUse(schema) {
      if (
        Array.isArray(schema.enum) &&
        schema.description?.includes('https://datahub.io/core/currency-codes')
      ) {
        delete schema.enum;
        return true;
      }
      return false;
    },
  },
];

/**
 * Creates a vocabulary keyword for each custom validator.
 * We name keywords by prefing the validator function name with an underscore:
 *   { "_isValidCurrencyCode": true }
 * This format prevents them from clobbering the standard namespace
 * @param {string} moduleId
 * @return {import('ajv').KeywordDefinition[]}
 */
function getCustomValidatorKeywords(moduleId) {
  const moduleIdName = new AjvName(moduleId);
  return customValidators.map(({error, fn}) => ({
    keyword: `_${fn}`,
    error,
    code(ctx) {
      ctx.pass(ajvCode`${moduleIdName}.${new AjvName(fn)}(${ctx.data})`);
    },
  }));
}

/**
 * @param {*} schema
 * @return {*}
 */
function addCustomValidatorsToSchema(schema) {
  if (typeof schema !== 'object') {
    return schema;
  }
  if (Array.isArray(schema)) {
    return schema.map(addCustomValidatorsToSchema);
  }
  for (const {fn, shouldUse} of customValidators) {
    if (shouldUse(schema)) {
      schema[`_${fn}`] = true;
    }
  }
  for (const k in schema) {
    schema[k] = addCustomValidatorsToSchema(schema[k]);
  }
  return schema;
}

/**
 * Remaps `ajv-formats` in order to only use simple formats (true, string, RegExp).
 * Other types of formats would force bundles to contain *all* format definitions
 * even when unused.
 * @return {{[format: string]: import('ajv').Format}}
 */
const getFormats = once(() => {
  const formats = {};
  for (const k in ajvFormats) {
    let format = ajvFormats[k];
    if (typeof format === 'object' && 'validate' in format) {
      format = format.validate;
    }
    if (
      typeof format === 'string' ||
      format instanceof RegExp ||
      format === true
    ) {
      formats[k] = format;
    }
  }
  return formats;
});

/**
 * @typedef {{
 *   scope?: Set<string>,
 *   name: string,
 * }}
 */
let TransformContextDef;

/**
 * @param {any} schema
 * @param {string=} customValidatorsModuleId
 * @param {string[]=} scope
 * @return {{code: string, name: string}}
 */
function ajvCompile(schema, customValidatorsModuleId = '__jsonSchema', scope) {
  const ajv = new Ajv({
    code: {
      esm: true,
      source: true,
      lines: true,
    },
    allErrors: true,
    validateSchema: false,
    formats: getFormats(),
    keywords: getCustomValidatorKeywords(customValidatorsModuleId),
  });
  const ajvResult = ajv.compile(addCustomValidatorsToSchema(schema));
  const untransformedCode = AjvStandalone(ajv, ajvResult);
  const context = {
    // name should be initially `validate` since that's ajv's output function.
    name: 'validate',
    scope: scope && scope.length ? new Set(scope) : undefined,
  };
  const code = transformAjvResult(untransformedCode, context);
  return {code, name: context.name};
}

// Unwanted properties in ajv's error object
const objectExpressionRemovable = ['schemaPath', 'keyword', 'params'];

// Destructured properties that aren't required when removing ajv error properties.
const objectPatternRemovable = ['parentData', 'parentDataProperty', 'rootData'];

/**
 * @param {babel.types.ObjectPattern|babel.types.ObjectExpression} patternOrExpression
 * @param {string[]} removable
 */
function removePropertiesWhenAllPresent(patternOrExpression, removable) {
  const {properties} = patternOrExpression;
  // @ts-ignore
  const kept = properties.filter(
    ({key}) => !removable.includes(key.name || key.value)
  );
  if (kept.length === properties.length - removable.length) {
    patternOrExpression.properties = kept;
  }
}

/**
 * @param {string} program
 * @param {TransformContextDef} context
 * @return {string}
 */
function transformAjvResult(program, context) {
  const {scope} = context;

  /** @type {babel.Visitor} */
  const visitor = {
    Program: {
      exit(path) {
        // Prevent collisions with outer scope
        if (!scope) {
          return;
        }
        for (const binding in path.scope.bindings) {
          let renamed = binding;
          while (scope.has(renamed)) {
            renamed = path.scope.generateUid(binding);
          }
          if (renamed === binding) {
            continue;
          }
          path.scope.rename(binding, renamed);
          if (binding === context.name) {
            context.name = renamed;
          }
        }
      },
    },
    ExportDefaultDeclaration(path) {
      // Remove `export default validate`
      path.remove();
    },
    ExportNamedDeclaration(path) {
      // Unexport named exports.
      if (path.node.declaration) {
        path.replaceWith(path.node.declaration);
      } else {
        path.remove();
      }
    },
    ObjectExpression(path) {
      removePropertiesWhenAllPresent(path.node, objectExpressionRemovable);
    },
    ObjectPattern(path) {
      removePropertiesWhenAllPresent(path.node, objectPatternRemovable);
    },
  };
  const result = babel.transformSync(program, {plugins: [{visitor}]});
  if (!result?.code) {
    throw new Error();
  }
  return result.code;
}

module.exports = {
  ajvCompile,
};
