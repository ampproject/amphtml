/**
 * @fileoverview
 * esbuild plugin that maps JSON schema imports to validation functions.
 *   ```
 *   import validate from './my-schema.schema.json';
 *   validate("my-data");
 *   ```
 */
const {default: Ajv} = require('ajv');
const dedent = require('dedent');
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

const ajv = once(() => new Ajv(ajvOptions));

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
    output = avjCompile(filename, contents);
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
 * @param {string} contents
 * @return {string}
 */
function avjCompile(filename, contents) {
  const schema = JSON.parse(contents);
  const validateAjv = ajv().compile(schema);
  const validateFnName = escapeJsIdentifier(
    `validate_${basename(filename, '.json')}`
  );
  return (
    dedent(`
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
      .replace('__validateFnName__', validateFnName)
      // validateAjv returns a boolean, and modifies a property of the function
      // for errors. The default instead returns an array of errors, which is
      // empty when the input is valid.
      .replace('__validateAjv__', validateAjv.toString())
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
