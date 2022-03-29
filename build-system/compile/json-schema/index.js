/**
 * @fileoverview
 * Compiles JSON Schema to a validate() function using ajv.
 */
const {_: ajvCode, Name: AjvName, default: Ajv} = require('ajv');
const {fastFormats: ajvFormats} = require('ajv-formats/dist/formats');
const {once} = require('../../common/once');
const {default: AjvStandalone} = require('ajv/dist/standalone');
const babel = require('@babel/core');
const iso4217 = require('./iso4217.json');

const iso4217DescriptionRe = /iso[_\- ]*4217/i;

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
    fn: 'isIso4217CurrencyCode',
    error: {message: 'must be a valid ISO 4217 currency code'},
    shouldUse(schema) {
      if (!iso4217DescriptionRe.test(schema.description)) {
        return false;
      }
      if (
        !Array.isArray(schema.enum) ||
        JSON.stringify(schema.enum.sort()) !== JSON.stringify(iso4217.sort())
      ) {
        throw new Error(
          'ISO 4217 schema must contain an `enum` keyword including all valid currency codes.'
        );
      }
      delete schema.enum;
      return true;
    },
  },
];

/**
 * Creates a vocabulary keyword for each custom validator.
 * We name keywords by prefing the validator function name with an underscore:
 *   { "_isIso4217CurrencyCode": true }
 * This format prevents them from clobbering the standard namespace
 * @param {Set<string>} used
 * @return {import('ajv').KeywordDefinition[]}
 */
function getCustomValidatorKeywords(used) {
  return customValidators.map(({error, fn}) => ({
    keyword: `_${fn}`,
    error,
    code(ctx) {
      used.add(fn);
      ctx.pass(ajvCode`${new AjvName(fn)}(${ctx.data})`);
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
 * @param {any} schema
 * @return {string}
 */
function ajvCompile(schema) {
  const validatorFns = new Set();
  const ajv = new Ajv({
    code: {
      esm: true,
      source: true,
      lines: true,
    },
    inlineRefs: false,
    allErrors: true,
    validateSchema: false,
    formats: getFormats(),
    keywords: getCustomValidatorKeywords(validatorFns),
  });
  const ajvResult = ajv.compile(addCustomValidatorsToSchema(schema));
  const importCode = getImportCode(validatorFns);
  const ajvCode = AjvStandalone(ajv, ajvResult);
  return importCode + ajvCode;
}

/**
 * @param {Set<string>} validatorFns
 * @return {string}
 */
function getImportCode(validatorFns) {
  if (!validatorFns.size) {
    return '';
  }
  const specifiers = Array.from(validatorFns).join(', ');
  return `import {${specifiers}} from '#core/json-schema';\n\n`;
}

/**
 * Transforms ajv's generated code to make it usable in a bundle:
 *  - Creates strings for error messages instead of an object.
 *  - If provided a "scope" of used names, it will rescope the current code
 *    to prevent collisions, and remove `export`.
 * @param {string} code
 * @param {string[]=} scope
 * @param {babel.TransformOptions=} config
 * @return {{result: babel.BabelFileResult | null, name: string}}
 */
function transformAjvCode(code, scope, config) {
  const {types: t} = babel;

  const scopeSet = scope ? new Set(scope) : null;

  // ajvCompile's generated name
  let name = 'validate';

  const isObjectProperty = (node, name) =>
    (t.isObjectProperty(node) && t.isIdentifier(node.key, {name})) ||
    t.isStringLiteral(node.key, {value: name});

  const findProperty = (properties, name) =>
    properties.find((node) => isObjectProperty(node, name));

  /** @type {babel.PluginObj} */
  const plugin = {
    visitor: {
      Program: {
        exit(path) {
          // Prevent collisions with outer scope
          if (!scopeSet) {
            return;
          }
          for (const binding in path.scope.bindings) {
            let renamed = binding;
            while (scopeSet.has(renamed)) {
              renamed = path.scope.generateUid(binding);
            }
            if (renamed === binding) {
              continue;
            }
            path.scope.rename(binding, renamed);
            if (binding === name) {
              name = renamed;
            }
          }
        },
      },
      ExportDefaultDeclaration(path) {
        // Remove `export default validate`
        if (!scope) {
          return;
        }
        path.remove();
      },
      ExportNamedDeclaration(path) {
        // Unexport named exports.
        if (!scope) {
          return;
        }
        if (path.node.declaration) {
          path.replaceWith(path.node.declaration);
        } else {
          path.remove();
        }
      },
      ObjectExpression(path) {
        // Replace objects with {instancePath} with a string corresponding
        // to the `instancePath`, or `instancePath` and `message` combined.
        const {properties} = path.node;
        const instancePath = findProperty(properties, 'instancePath');
        if (!instancePath) {
          return;
        }
        const message = findProperty(properties, 'message');
        if (!message) {
          path.replaceWith(instancePath.value);
          return;
        }
        path.replaceWith(babel.template.expression.ast`
          (${instancePath.value} + ' ' + ${message.value}).trim()
        `);
      },
      ObjectPattern(path) {
        // Replace destructuring of arguments with {instancePath} with just
        // instancePath
        const replacedPath = path.parentPath.isAssignmentPattern()
          ? path.parentPath
          : path;
        if (!replacedPath.parentPath.isFunctionDeclaration()) {
          return;
        }
        const {properties} = path.node;
        const instancePath = findProperty(properties, 'instancePath');
        if (instancePath) {
          replacedPath.replaceWith(instancePath);
        }
      },
    },
  };
  const result = babel.transformSync(code, {
    ...config,
    plugins: [...(config?.plugins || []), plugin],
  });
  return {result, name};
}

module.exports = {
  ajvCompile,
  transformAjvCode,
};
