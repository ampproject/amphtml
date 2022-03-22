const glob = require('fast-glob');
const {basename, relative} = require('path');
const test = require('ava');
const esbuild = require('esbuild');
const {esbuildCompile} = require('../../../tasks/helpers');
const {pathExists, readFile} = require('fs-extra');
const tempy = require('tempy');
const {outputFile} = require('fs-extra');
const {customValidatorsModule, esbuildJsonSchemaPlugin} = require('..');

const inputFilenames = glob.sync(`${__dirname}/input/*.js`);

const normalizeNlEof = (str) => `${str.trimEnd()}\n`;

for (const inputFilename of inputFilenames) {
  const inputBasename = basename(inputFilename);
  test(inputBasename, async (t) => {
    const outputFilename = `${__dirname}/output/${basename(inputFilename)}`;
    // Use esbuild directly to print out our plugin's output in isolation.
    const result = await esbuild.build({
      bundle: true,
      entryPoints: [inputFilename],
      external: [customValidatorsModule],
      format: 'esm',
      plugins: [esbuildJsonSchemaPlugin],
      target: 'esnext',
      write: false,
    });
    const actual = normalizeNlEof(result.outputFiles[0].text.trimEnd());
    const expected = (await pathExists(outputFilename))
      ? normalizeNlEof(await readFile(outputFilename, 'utf8'))
      : null;
    if (expected) {
      t.is(actual, expected);
    } else {
      await outputFile(outputFilename, actual);
      t.is(actual, actual);
    }
  });
}

function requireCompiled(filename) {
  return tempy.directory.task(async (tempDir) => {
    // Use our actual bundler.
    await esbuildCompile(`${__dirname}/input/`, filename, tempDir, {
      minify: false,
    });
    require(relative(__dirname, `${tempDir}/${filename}`));
    return globalThis;
  });
}

test('run currency-code.js', async (t) => {
  const {validateCurrencyCode} = await requireCompiled('currency-code.js');
  t.deepEqual(validateCurrencyCode({currencyCode: 'INVALID'}), [
    {
      instancePath: '/currencyCode',
      keyword: '_0',
      message: 'must be a valid currency code',
      params: {},
      schemaPath: '#/properties/currencyCode/_0',
    },
  ]);
  const schema = require('./input/currency-code.schema.json');
  for (const currencyCode of schema.properties.currencyCode.enum) {
    t.deepEqual(validateCurrencyCode({currencyCode}), []);
  }
});
