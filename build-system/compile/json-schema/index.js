/**
 * @fileoverview
 * esbuild plugin that maps JSON schema imports to validation functions.
 *   ```
 *   import validate from './my-schema.schema.json';
 *   validate("my-data");
 *   ```
 */
const {_, default: Ajv} = require('ajv');
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

// https://ajv.js.org/options.html
const ajvOptions = {
  code: {
    esm: true,
    source: true,
    lines: true,
  },
  allErrors: true,
  validateSchema: false,
};

const getAjv = once(() => decorateAjv(new Ajv(ajvOptions)));

/**
 * @param {Ajv} ajv
 * @return {Ajv}
 */
function decorateAjv(ajv) {
  ajv.addKeyword({
    keyword: 'currencyCode',
    code(ctx) {
      ctx.pass(_`isValidCurrencyCode(${ctx.data})`);
    },
  });
  return ajv;
}

/**
 * Remaps a portable (standard) JSON Schema to our custom format in order to
 * use our custom compilation steps
 * @param {*} schema
 * @return {*}
 */
function remapPortableSchema(schema) {
  if (typeof schema === 'object') {
    if (Array.isArray(schema)) {
      schema = schema.map(remapPortableSchema);
    } else {
      schema = remapCurrencyCodeSchema(schema);
      schema = remapPortableSchemaProps(schema);
    }
  }
  return schema;
}

/**
 * @param {Object} schema
 * @return {Object}
 */
function remapCurrencyCodeSchema(schema) {
  if (
    'enum' in schema &&
    Array.isArray(schema.enum) &&
    'description' in schema &&
    schema.description.includes('https://datahub.io/core/currency-codes')
  ) {
    delete schema.enum;
    schema.currencyCode = true;
  }
  return schema;
}

/**
 * @param {Object} schema
 * @return {Object}
 */
function remapPortableSchemaProps(schema) {
  for (const k in schema) {
    schema[k] = remapPortableSchema(schema[k]);
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
    const schema = remapPortableSchema(json5.parse(contents));
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
  return (
    dedent(`
      import {isValidCurrencyCode} from '#core/json-schema';

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
