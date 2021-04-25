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
const path = require('path');
const tempy = require('tempy');
const test = require('ava');
const {readFile, writeJson, readJson} = require('fs-extra');
const {writeFromTemplateDir, insertExtensionBundlesConfig} = require('..');

test('writeFromTemplateDir', async (t) =>
  tempy.directory.task(async (dir) => {
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

test('insertExtensionBundlesConfig inserts new entry', async (t) =>
  tempy.file.task(
    async (destination) => {
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

test('insertExtensionBundlesConfig uses existing latestVersion', async (t) =>
  tempy.file.task(
    async (destination) => {
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

test('insertExtensionBundlesConfig uses passed latestVersion', async (t) =>
  tempy.file.task(
    async (destination) => {
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

test('insertExtensionBundlesConfig uses version as latestVersion', async (t) =>
  tempy.file.task(
    async (destination) => {
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
