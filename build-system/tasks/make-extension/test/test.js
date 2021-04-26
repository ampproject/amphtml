/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ava = require('ava');
const path = require('path');
const tempy = require('tempy');
const {readFile, writeJson, readJson, writeFile, mkdirp} = require('fs-extra');

/**
 * Disables logging since it clutters the test output.
 * @param {*} fn
 * @param  {...any} args
 */
async function captureLog(fn, ...args) {
  const logging = require('../../../common/logging');
  const originalLog = logging.log;
  logging.log = () => {};
  await fn(...args);
  logging.log = originalLog;
}

/**
 * Disables prettier since it's slow.
 * @param {*} fn
 * @param  {...any} args
 */
async function captureFormat(fn, ...args) {
  const format = require('../format');
  const originalFormat = format.format;
  format.format = () => ({stdout: '', stderr: ''});
  await fn(...args);
  format.format = originalFormat;
}

function test(name, cb) {
  return ava(name, (t) => captureFormat((t) => captureLog(cb, t), t));
}

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
    // makeExtensionTemplates, so they remain in the generated files.
    t.is(
      await readFile(`${dir}/x-__foo__/__bar__.txt`, 'utf-8'),
      'This file is generated with values __foo__, __bar__, __baz__.\n'
    );
    t.is(await readFile(`${dir}/file-__baz__.txt`, 'utf-8'), 'Constant.\n');
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
          name: 'a',
          version: 'x',
          options: {hasCss: true},
        },
        destination
      );

      t.deepEqual(await readJson(destination), [
        // inserted in lexicographical order by name:
        {
          name: '_',
        },
        {
          name: 'a',
          version: 'x',
          latestVersion: 'x',
          options: {hasCss: true},
        },
        {
          name: 'z',
        },
      ]);
    },
    {extension: 'json'}
  ));

test('insertExtensionBundlesConfig uses existing latestVersion', (t) =>
  tempy.file.task(
    async (destination) => {
      const {insertExtensionBundlesConfig} = require('..');
      await writeJson(destination, [
        {
          name: 'foo',
          version: 'existing version',
          latestVersion: 'existing version',
        },
      ]);

      await insertExtensionBundlesConfig(
        {
          name: 'foo',
          version: 'new version',
        },
        destination
      );

      t.deepEqual(await readJson(destination), [
        {
          name: 'foo',
          version: 'existing version',
          latestVersion: 'existing version',
        },
        {
          name: 'foo',
          version: 'new version',
          latestVersion: 'existing version',
        },
      ]);
    },
    {extension: 'json'}
  ));

test('insertExtensionBundlesConfig uses passed latestVersion', (t) =>
  tempy.file.task(
    async (destination) => {
      const {insertExtensionBundlesConfig} = require('..');
      await writeJson(destination, [
        {
          name: 'foo',
          version: '_',
        },
      ]);

      await insertExtensionBundlesConfig(
        {
          name: 'foo',
          version: 'new version',
          latestVersion: 'new version',
        },
        destination
      );

      t.deepEqual(await readJson(destination), [
        {
          name: 'foo',
          version: '_',
        },
        {
          name: 'foo',
          version: 'new version',
          latestVersion: 'new version',
        },
      ]);
    },
    {extension: 'json'}
  ));

test('insertExtensionBundlesConfig uses version as latestVersion', (t) =>
  tempy.file.task(
    async (destination) => {
      const {insertExtensionBundlesConfig} = require('..');
      await writeJson(destination, [
        {
          name: 'foo',
          version: '_',
        },
      ]);

      await insertExtensionBundlesConfig(
        {
          name: 'foo',
          version: 'new version',
        },
        destination
      );

      t.deepEqual(await readJson(destination), [
        {
          name: 'foo',
          version: '_',
        },
        {
          name: 'foo',
          version: 'new version',
          latestVersion: 'new version',
        },
      ]);
    },
    {extension: 'json'}
  ));
