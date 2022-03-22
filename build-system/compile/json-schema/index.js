/**
 * @fileoverview
 * esbuild plugin that maps JSON schema imports to validation functions.
 *   ```
 *   import validate from './my-schema.schema.json';
 *   validate("my-data");
 *   ```
 */
const {_: ajvCode, Name: AjvName, default: Ajv} = require('ajv');
const dedent = require('dedent');
const json5 = require('json5');
const {outputFile, pathExists} = require('fs-extra');
const {basename, join, relative} = require('path');
const {once} = require('../../common/once');
const {
  TransformCache,
  batchedRead,
  md5,
} = require('../../common/transform-cache');

/**
 * File filter to match import.
 * It's useful that this always ends in .schema.json, since that suffix enables
 * JSON Schema features on IDEs like VSCode.
 * @type {RegExp}
 */
const importFilter = /\.schema\.json$/;

/**
 * Maps to use a custom validation function when a schema matches certain
 * criteria.
 * - The key is the name of a validator function exported from `#core/json-schema`
 * - The value is a boolean function that tests whether the validator function
 *   should be used.
 *   The boolean function may also modify the schema object in-place. This is
 *   desirable in cases where the validator function should override
 *   configurations validators.
 * @const {{
 *   fn: string,
 *   error: import('ajv/dist/types').KeywordErrorDefinition,
 *   map: (import('ajv/dist/types').SchemaObject) => boolean,
 * }[]}
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
    map(schema) {
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

// https://ajv.js.org/options.html
const ajvOptions = {
  code: {
    esm: true,
    source: true,
    lines: true,
  },
  allErrors: true,
  validateSchema: false,
  // Add a keyword to the vocabulary for each custom validator.
  keywords: customValidators.map(({error, fn}, i) => ({
    keyword: `_${i}`,
    error,
    code(ctx) {
      ctx.pass(ajvCode`${new AjvName(fn)}(${ctx.data})`);
    },
  })),
};

const getAjv = once(() => new Ajv(ajvOptions));

/**
 * Remaps a JSON schema in order to use custom validators.
 * @param {*} schema
 * @return {*}
 */
function remapForCustomValidators(schema) {
  if (typeof schema !== 'object') {
    return schema;
  }
  if (Array.isArray(schema)) {
    return schema.map(remapForCustomValidators);
  }
  for (const [i, entry] of customValidators.entries()) {
    if (entry.map(schema)) {
      schema[`_${i}`] = true;
    }
  }
  for (const k in schema) {
    schema[k] = remapForCustomValidators(schema[k]);
  }
  return schema;
}

const escapeJsIdentifier = (id) => id.replace(/[^a-z_0-9]/gi, '_');

const getTransformCache = once(() => new TransformCache('.json-schema-cache'));

/**
 * Like batchRead(), but considers ajvOptions part of the invalidation hash.
 * @param {string} filename
 * @return {Promise<{contents: string, hash: string}>}
 */
async function ajvBatchedRead(filename) {
  const {contents, hash} = await batchedRead(filename);
  const rehash = md5(JSON.stringify({ajvOptions, hash}));
  return {contents, hash: rehash};
}

/**
 * @param {string} filename
 * @return {Promise<string>}
 */
async function getCompiledJsonSchemaFilename(filename) {
  const {contents, hash} = await ajvBatchedRead(filename);
  const transformCache = getTransformCache();
  const cached = await transformCache.get(hash);
  let output = cached;
  if (!output) {
    const schema = remapForCustomValidators(json5.parse(contents));
    output = avjCompile(filename, schema);
    transformCache.set(hash, Promise.resolve(output));
  }
  const outputFilename = `build/${filename}.js`;
  if (!cached || !(await pathExists(outputFilename))) {
    await outputFile(outputFilename, output);
  }
  return outputFilename;
}

/**
 * @param {string} filename
 * @param {any} schema
 * @return {string}
 */
function avjCompile(filename, schema) {
  const ajv = getAjv();
  const validateAjv = ajv.compile(schema);
  const scopeCode = ajv.scope.scopeCode(validateAjv?.source?.scopeValues, {});
  const validateFnName = escapeJsIdentifier(
    `validate_${basename(filename, '.json')}`
  );
  const customValidatorFns = customValidators.map(({fn}) => fn).join(', ');
  return (
    dedent(`
      import {__customValidatorFns__} from '#core/json-schema';

      __scopeCode__

      const validateAjv = __validateAjv__;

      /**
       * @param {any} data
       * @return {{params?: object, message?: string, data?: any}[]}
       * https://ajv.js.org/api.html#error-objects
       */
      export default function __validateFnName__(data) {
        return validateAjv(data) ? [] : [...validateAjv.errors]
      }
    `)
      .replace('__customValidatorFns__', customValidatorFns)
      .replace('__scopeCode__', scopeCode)
      .replace('__validateFnName__', validateFnName)
      // validateAjv returns a boolean, and modifies a property of the function
      // for errors. The default instead returns an array of errors, which is
      // empty when the input is valid.
      .replace('__validateAjv__', validateAjv?.source?.validateCode)
  );
}

const esbuildJsonSchemaPlugin = {
  name: 'json-schema',
  setup(build) {
    build.onResolve({filter: importFilter}, async ({path, resolveDir}) => {
      const filename = relative(process.cwd(), join(resolveDir, path));
      const compiledFilename = await getCompiledJsonSchemaFilename(filename);
      const resultPath = join(process.cwd(), compiledFilename);
      return {path: resultPath};
    });
  },
};

module.exports = {
  esbuildJsonSchemaPlugin,
};
