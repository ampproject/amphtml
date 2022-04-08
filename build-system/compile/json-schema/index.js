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
 *  - Removes exports (it expects to be included inline).
 *  - Rescopes the current code to prevent collisions with taken names.
 *  - Strips down included schemas so that they only contain the referenced
 *    portions.
 * @param {string} code
 * @param {Set<string>} taken
 * @param {babel.TransformOptions=} config
 * @return {{result: babel.BabelFileResult | null, name: string}}
 */
function transformAjvCode(code, taken, config) {
  const {template, types: t} = babel;

  // ajvCompile's generated name
  let name = 'validate';

  const isObjectProperty = (node, name) =>
    (t.isObjectProperty(node) && t.isIdentifier(node.key, {name})) ||
    t.isStringLiteral(node.key, {value: name});

  const findProperty = (properties, name) =>
    properties.find((node) => isObjectProperty(node, name));

  const evaluatePropertyKey = (property) =>
    property.isIdentifier() ? property.node.name : property.evaluate().value;

  const schemaVariableDeclaratorRe = /^schema[0-9]*$/;

  /**
   * @param {babel.NodePath} path
   * @return {boolean}
   */
  function parentIsHasOwnPropertyCall(path) {
    const {parentPath} = path;
    if (
      !parentPath?.isCallExpression() ||
      parentPath.node.arguments[0] !== path.node
    ) {
      return false;
    }
    const callee = parentPath.get('callee');
    if (
      !callee.isMemberExpression() ||
      !callee.get('property').isIdentifier({name: 'call'})
    ) {
      return false;
    }
    /** @type {babel.NodePath<any>} */
    let resolved = callee.get('object');
    while (resolved.isIdentifier()) {
      const binding = path.scope.getBinding(resolved.node.name);
      if (!binding) {
        break;
      }
      resolved = binding.path;
      if (resolved.isVariableDeclarator()) {
        resolved = resolved.get('init');
      }
    }
    return resolved.getSource().trim() === 'Object.prototype.hasOwnProperty';
  }

  const valueReferences = {};

  /**
   * @param {babel.NodePath<babel.types.Statement>} statement
   * @param {any} value
   * @return {string}
   */
  function getOrInsertValueReference(statement, value) {
    const serial = JSON.stringify(value);
    if (valueReferences[serial]) {
      return valueReferences[serial];
    }
    const name = statement.scope.generateUid('schema');
    statement.insertBefore(template.statement.ast`
      const ${name} = ${t.valueToNode(value)};
    `);
    return (valueReferences[serial] = name);
  }

  /**
   * Strips down an included schema binding so that it only contains the
   * referenced portions.
   * @param {import('@babel/traverse').Binding} binding
   */
  function treeShakeSchema(binding) {
    const {path, referencePaths} = binding;
    if (
      !binding.constant ||
      !path.isVariableDeclarator() ||
      !t.isIdentifier(path.node.id) ||
      !schemaVariableDeclaratorRe.test(path.node.id.name)
    ) {
      return;
    }
    const init = path.get('init');
    if (!init.isObjectExpression()) {
      return;
    }
    const statement = path.getStatementParent();
    if (!statement) {
      return;
    }
    // Re-construct schema from references
    const original = init.evaluate().value;
    if (original == null) {
      // original is dynamic, deopt
      return;
    }
    const queue = [...referencePaths];
    for (const referencePath of queue) {
      // Navigate MemberExpression to find deepest key to insert.
      let value = original;
      let memberExpression;
      let {parentPath} = referencePath;
      while (parentPath?.isMemberExpression()) {
        memberExpression = parentPath;
        parentPath = memberExpression.parentPath;
        const key = evaluatePropertyKey(memberExpression.get('property'));
        if (key == null) {
          break;
        }
        value = value[key];
      }
      // deopt full schema if we can't resolve at least one key deep
      if (!memberExpression) {
        return;
      }
      // Fill indirect references with fully qualified paths, and add those
      // to the queue.
      if (
        parentPath?.isVariableDeclarator() &&
        t.isIdentifier(parentPath.node.id)
      ) {
        const {name} = parentPath.node.id;
        const localBinding = parentPath.scope.getBinding(name);
        if (localBinding?.constant) {
          const {referencePaths} = localBinding;
          for (const referencePath of referencePaths) {
            const [replacedWithMemberExpression] = referencePath.replaceWith(
              t.cloneNode(memberExpression.node)
            );
            let object = replacedWithMemberExpression.get('object');
            while (object.isMemberExpression()) {
              object = object.get('object');
            }
            queue.push(object);
          }
          parentPath.remove();
          continue;
        }
      }
      // Objects may in some cases be referenced only for their key list, in
      // which we define each unset value as a zero rather than the original.
      // If the original value is needed, it will be included during a
      // different loop pass.
      if (parentIsHasOwnPropertyCall(memberExpression)) {
        value = Object.fromEntries(Object.keys(value).map((k) => [k, 0]));
      }
      const name = getOrInsertValueReference(statement, value);
      memberExpression.replaceWith(t.identifier(name));
    }
    path.remove();
  }

  /**
   * Prevents collisions with outer scope
   * @param {babel.NodePath<babel.types.Program>} path
   * @param {string} id
   */
  function rescope(path, id) {
    let renamed = id;
    while (taken.has(renamed)) {
      renamed = path.scope.generateUid(id);
    }
    if (renamed === id) {
      return;
    }
    path.scope.rename(id, renamed);
    if (id === name) {
      name = renamed;
    }
  }

  /** @type {babel.PluginObj} */
  const plugin = {
    visitor: {
      Program: {
        exit(path) {
          path.scope.crawl();
          for (const id in path.scope.bindings) {
            treeShakeSchema(path.scope.bindings[id]);
            rescope(path, id);
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
        path.replaceWith(template.expression.ast`
          (${instancePath.value} + ' ' + ${message.value}).trim()
        `);
      },
      ObjectPattern(path) {
        // Replace destructuring of arguments with {instancePath} with just
        // the assignment or id for instancePath
        const replacedPath = path.parentPath.isAssignmentPattern()
          ? path.parentPath
          : path;
        if (!replacedPath.parentPath.isFunctionDeclaration()) {
          return;
        }
        const {properties} = path.node;
        const value = findProperty(properties, 'instancePath')?.value;
        if (t.isIdentifier(value) || t.isAssignmentPattern(value)) {
          replacedPath.replaceWith(value);
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
