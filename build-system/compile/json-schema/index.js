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

  /**
   * @param {babel.NodePath<babel.types.MemberExpression>} memberExpression
   * @return {null | undefined | number | string}
   */
  function evaluatePropertyKey(memberExpression) {
    const property = memberExpression.get('property');
    if (property.isIdentifier()) {
      return property.node.name;
    }
    if (memberExpression.node.computed) {
      return property.evaluate().value;
    }
    return null;
  }

  const schemaIdRegexp = /^schema[0-9]*$/;

  /**
   * @param {babel.NodePath<any>} path
   * @param {string[]} keys
   * @return {boolean}
   */
  function isMemberExpressionLeftwards(path, keys) {
    let i = keys.length - 1;
    while (true) {
      if (path.isMemberExpression()) {
        const key = evaluatePropertyKey(path);
        if (key !== keys[i--]) {
          return false;
        }
        path = path.get('object');
      } else if (path.isVariableDeclarator()) {
        const init = path.get('init');
        if (!init) {
          break;
        }
        path = init;
      } else if (path.isIdentifier()) {
        const binding = path.scope.getBinding(path.node.name);
        if (!binding) {
          break;
        }
        path = binding.path;
      } else {
        break;
      }
    }
    return i === 0 && path.isIdentifier({name: keys[i]});
  }

  /**
   * @param {babel.NodePath} path
   * @return {boolean}
   */
  function isReferenceToObjectKeyList(path) {
    const {parentPath} = path;
    if (parentPath?.isMemberExpression() && path.key === 'object') {
      return (
        t.isIdentifier(parentPath.node.property, {name: 'hasOwnProperty'}) &&
        parentPath.parentPath?.isCallExpression()
      );
    }
    if (
      parentPath?.isCallExpression() &&
      parentPath.node.arguments[0] === path.node
    ) {
      const callee = parentPath.get('callee');
      return (
        isMemberExpressionLeftwards(callee, ['Object', 'keys']) ||
        isMemberExpressionLeftwards(callee, [
          'Object',
          'prototype',
          'hasOwnProperty',
          'call',
        ])
      );
    }
    return false;
  }

  /** @type {{[stringified: string]: string}} */
  const valueReferences = {};

  /**
   * Resolves static references to object properties as deeply as possible,
   * and hoists references to those values.
   * @param {import('@babel/traverse').Binding} binding
   */
  function hoistProperties(binding) {
    const {constant, identifier, path, referencePaths} = binding;
    if (!constant || !path.isVariableDeclarator()) {
      return;
    }
    const init = path.get('init');
    if (!init.isObjectExpression()) {
      return;
    }
    const original = init.evaluate().value;
    if (original == null) {
      // original is dynamic, deopt
      return;
    }
    /** @type {Map<Object, babel.NodePath[]>} */
    const hoisted = new Map();
    /** @type {[any, babel.NodePath[]][]} */
    const queue = [[original, referencePaths]];
    for (const [startValue, referencePaths] of queue) {
      for (let referencePath of referencePaths) {
        let value = startValue;
        let {parentPath} = referencePath;
        while (parentPath?.isMemberExpression()) {
          const key = evaluatePropertyKey(parentPath);
          if (key == null || !value.hasOwnProperty(key)) {
            break;
          }
          value = value[key];
          referencePath = parentPath;
          parentPath = referencePath.parentPath;
        }
        if (value === original) {
          // deopt
          return;
        }
        // Follow references to declared variable.
        if (
          parentPath?.isVariableDeclarator() &&
          t.isIdentifier(parentPath.node.id)
        ) {
          const {name} = parentPath.node.id;
          const binding = parentPath.scope.getBinding(name);
          if (binding?.constant) {
            const {referencePaths} = binding;
            queue.push([value, referencePaths]);
            parentPath.remove();
            continue;
          }
        }
        const hoistedReferences = hoisted.get(value) ?? [];
        hoistedReferences.push(referencePath);
        hoisted.set(value, hoistedReferences);
      }
    }
    for (const [value, referencePaths] of hoisted) {
      // Override every property value as `0` when we only need a key list.
      if (referencePaths.every(isReferenceToObjectKeyList)) {
        for (const k in value) {
          value[k] = 0;
        }
      }
      // Stringify to de-dupe identical objects.
      // (This may occur as a result of some uses of $ref)
      const stringified = JSON.stringify(value);
      let name = valueReferences[stringified];
      if (!name) {
        name = rescope(path, path.scope.generateUid(identifier.name));
        path.scope.push({
          kind: 'const',
          id: t.identifier(name),
          init: t.valueToNode(value),
        });
        valueReferences[stringified] = name;
      }
      for (const referencePath of referencePaths) {
        referencePath.replaceWith(t.identifier(name));
      }
    }
    path.remove();
  }

  /**
   * Prevents collisions with outer scope
   * @param {babel.NodePath} path
   * @param {string} id
   * @return {string}
   */
  function rescope(path, id) {
    let renamed = id;
    while (taken.has(renamed)) {
      renamed = path.scope.generateUid(id);
    }
    if (renamed !== id) {
      path.scope.rename(id, renamed);
      if (id === name) {
        name = renamed;
      }
    }
    return renamed;
  }

  /** @type {babel.PluginObj} */
  const plugin = {
    visitor: {
      Program: {
        exit(path) {
          path.scope.crawl();
          for (const id in path.scope.bindings) {
            const binding = path.scope.bindings[id];
            if (schemaIdRegexp.test(id)) {
              hoistProperties(binding);
            }
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
