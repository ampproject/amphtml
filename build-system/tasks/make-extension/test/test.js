const ava = require('ava');
const path = require('path');
const tempy = require('tempy');
const {mkdirp, readFile, readJson, writeFile, writeJson} = require('fs-extra');

const stubbedCalls = {};

async function stubModule(path, name, fn, callsFake = () => {}) {
  const imported = require(path);
  const original = imported[name];
  imported[name] = (...args) => {
    const calls = stubbedCalls[name] || (stubbedCalls[name] = []);
    calls.push(args);
    return callsFake(...args);
  };
  await fn();
  imported.log = original;
}

const test = (name, cb) =>
  ava(name, (t) =>
    // Disable logging since it clutters the test output.
    stubModule('../../../common/logging', 'log', () =>
      stubModule('../../../common/logging', 'logLocalDev', () =>
        // Disable prettier formatting since it's slow.
        stubModule('../format', 'format', () =>
          // Run test
          cb(t)
        )
      )
    )
  );

test('writeFromTemplateDir', (t) =>
  tempy.directory.task(async (dir) => {
    const {writeFromTemplateDir} = require('..');
    await writeFromTemplateDir(
      path.join(__dirname, 'template/test-1'),
      {
        '__foo__': 'value-of-foo',
        '__bar__': 'bar-value',
        '__baz__': 'bazzzzz',
      },
      dir
    );
    t.is(
      await readFile(`${dir}/x-value-of-foo/bar-value.txt`, 'utf-8'),
      'This file is generated with values value-of-foo, bar-value, bazzzzz.\n'
    );
    t.is(await readFile(`${dir}/file-bazzzzz.txt`, 'utf-8'), 'Constant.\n');
  }));

test('writeFromTemplateDir skips existing files', (t) =>
  tempy.directory.task(async (dir) => {
    const {writeFromTemplateDir} = require('..');
    await mkdirp(`${dir}/x-value-of-foo/`);
    await writeFile(`${dir}/x-value-of-foo/bar-value.txt`, 'Original.\n');
    await writeFromTemplateDir(
      path.join(__dirname, 'template/test-1'),
      {
        '__foo__': 'value-of-foo',
        '__bar__': 'bar-value',
        '__baz__': 'bazzzzz',
      },
      dir
    );
    t.is(
      await readFile(`${dir}/x-value-of-foo/bar-value.txt`, 'utf-8'),
      'Original.\n'
    );
    t.is(await readFile(`${dir}/file-bazzzzz.txt`, 'utf-8'), 'Constant.\n');
  }));

test('makeExtensionFromTemplates merges multiple templates', (t) =>
  tempy.directory.task(async (dir) => {
    const {makeExtensionFromTemplates} = require('..');
    await makeExtensionFromTemplates(
      [
        path.join(__dirname, 'template/test-1'),
        path.join(__dirname, 'template/test-2'),
      ],
      dir,
      {
        name: 'my-extension-name',
      }
    );

    t.is(
      await readFile(`${dir}/from-test-2/my-extension-name.txt`, 'utf-8'),
      'foo\n'
    );

    // Replacement keys for test-1 are placeholders and are not set by
    // makeExtensionFromTemplates, so they remain in the generated files.
    t.is(
      await readFile(`${dir}/x-__foo__/__bar__.txt`, 'utf-8'),
      'This file is generated with values __foo__, __bar__, __baz__.\n'
    );
    t.is(await readFile(`${dir}/file-__baz__.txt`, 'utf-8'), 'Constant.\n');
  }));

test('makeExtensionFromTemplates does not print unit test blurb if a test file is not created', (t) =>
  tempy.directory.task(async (dir) => {
    const {makeExtensionFromTemplates} = require('..');
    await makeExtensionFromTemplates(
      [path.join(__dirname, 'template/test-1')],
      dir,
      {name: 'my-extension-name'}
    );
    t.false(
      !!stubbedCalls.logLocalDev.find((args) =>
        args.find((arg) => arg.includes('amp unit --files'))
      )
    );
  }));

test('makeExtensionFromTemplates does not print Storybook blurb if a Storybook file is not created', (t) =>
  tempy.directory.task(async (dir) => {
    const {makeExtensionFromTemplates} = require('..');
    await makeExtensionFromTemplates(
      [path.join(__dirname, 'template/test-1')],
      dir,
      {name: 'my-extension-name'}
    );
    t.false(
      !!stubbedCalls.logLocalDev.find((args) =>
        args.find((arg) => arg.includes('amp storybook'))
      )
    );
  }));

test('makeExtensionFromTemplates does not print validator blurb if a validator-*.html file is not created', (t) =>
  tempy.directory.task(async (dir) => {
    const {makeExtensionFromTemplates} = require('..');
    await makeExtensionFromTemplates(
      [path.join(__dirname, 'template/test-1')],
      dir,
      {name: 'my-extension-name'}
    );
    t.false(
      !!stubbedCalls.logLocalDev.find((args) =>
        args.find((arg) => arg.includes('amp validator --update_tests'))
      )
    );
  }));

test('makeExtensionFromTemplates prints validator blurb if a validator-*.html file is created', (t) =>
  tempy.directory.task(async (dir) => {
    const {makeExtensionFromTemplates} = require('..');
    await makeExtensionFromTemplates(
      [path.join(__dirname, '../template/shared')],
      dir,
      {name: 'my-extension-name'}
    );
    t.true(
      !!stubbedCalls.logLocalDev.find((args) =>
        args.find((arg) => arg.includes('amp validator --update_tests'))
      )
    );
  }));

test('insertExtensionBundlesConfig inserts new entry', (t) =>
  tempy.file.task(
    async (destination) => {
      const {insertExtensionBundlesConfig} = require('..');
      await writeJson(destination, [
        {
          name: '_',
        },
        {
          name: 'z',
        },
      ]);

      await insertExtensionBundlesConfig(
        {
          version: 'x',
          name: 'a',
          options: {hasCss: true},
        },
        destination
      );

      const items = await readJson(destination);
      t.deepEqual(items, [
        // inserted in lexicographical order by name:
        {
          name: '_',
        },
        {
          name: 'a',
          version: 'x',
          options: {hasCss: true},
        },
        {
          name: 'z',
        },
      ]);

      // expected order of keys
      t.deepEqual(Object.keys(items[1]), ['name', 'version', 'options']);
    },
    {extension: 'json'}
  ));
