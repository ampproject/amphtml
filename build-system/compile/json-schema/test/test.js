const glob = require('fast-glob');
const {basename, join, relative} = require('path');
const test = require('ava');
const {esbuildCompile} = require('../../../tasks/helpers');
const {dirname} = require('path/posix');
const {pathExists, readFile} = require('fs-extra');
const tempy = require('tempy');
const {outputFile} = require('fs-extra');

const inputFilenames = glob.sync(`${__dirname}/input/*.js`);

for (const inputFilename of inputFilenames) {
  const inputBasename = basename(inputFilename);
  test(inputBasename, async (t) => {
    const outputTemporaryDir = tempy.directory();
    const outputTemporaryFilename = join(outputTemporaryDir, inputBasename);
    const outputFilename = `${__dirname}/output/${basename(inputFilename)}`;
    await esbuildCompile(
      dirname(inputFilename),
      inputBasename,
      outputTemporaryDir,
      {minify: false}
    );
    const expected = (await pathExists(outputFilename))
      ? await readFile(outputFilename, 'utf8')
      : null;
    const actual = await readFile(outputTemporaryFilename, 'utf8');
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
