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
    const outputFilename = `${__dirname}/output/${inputBasename}`;
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
      t.is(
        actual,
        expected,
        `If you intend to update this expectation, remove output/${inputBasename} and re-run this test.`
      );
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
  t.deepEqual(validateCurrencyCode('INVALID'), [
    {
      instancePath: '',
      keyword: '_0',
      message: 'must be a valid currency code',
      params: {},
      schemaPath: '#/_0',
    },
  ]);
  const schema = require('./input/currency-code.schema.json');
  for (const currencyCode of schema.enum) {
    t.deepEqual(validateCurrencyCode(currencyCode), []);
  }
});

test('run one-of.js', async (t) => {
  const {validateOneOf} = await requireCompiled('one-of.js');
  const expectedErrors = [
    {
      instancePath: '',
      keyword: 'const',
      message: 'must be equal to constant',
      params: {
        allowedValue: 0,
      },
      schemaPath: '#/oneOf/0/const',
    },
    {
      instancePath: '',
      keyword: 'type',
      message: 'must be string',
      params: {
        type: 'string',
      },
      schemaPath: '#/oneOf/1/type',
    },
    {
      instancePath: '',
      keyword: 'oneOf',
      message: 'must match exactly one schema in oneOf',
      params: {
        passingSchemas: null,
      },
      schemaPath: '#/oneOf',
    },
  ];
  t.deepEqual(validateOneOf(true), expectedErrors);
  t.deepEqual(validateOneOf(123), expectedErrors);
  t.deepEqual(validateOneOf(0), []);
  t.deepEqual(validateOneOf('invalid'), []);
});

test('run not-one-of.js', async (t) => {
  const {validateNotOneOf} = await requireCompiled('not-one-of.js');
  const expectedErrors = [
    {
      instancePath: '',
      keyword: 'not',
      message: 'must NOT be valid',
      params: {},
      schemaPath: '#/not',
    },
  ];
  t.deepEqual(validateNotOneOf(true), []);
  t.deepEqual(validateNotOneOf(123), []);
  t.deepEqual(validateNotOneOf(0), expectedErrors);
  t.deepEqual(validateNotOneOf('invalid'), expectedErrors);
});
