/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

const m = require('./');
const test = require('ava');

const result = {
  'test.css': {
    '.selector-1': '1',
    '.selector-2': '0',
    '.selector-3': '99',
  },
  'test-2.css': {
    '.selector-4': '80',
  },
};

test.cb('collects selectors', t => {
  const data = Object.create(null);
  const testFiles = `${__dirname}/*.css`;
  m.getZindexStream(testFiles)
    .on('data', chunk => {
      data[chunk.name] = chunk.selectors;
    })
    .on('end', () => {
      t.deepEqual(data, result);
      t.end();
    });
});

test('sync - create array of arrays with z index order', t => {
  t.plan(1);
  const table = m.createTable(result);
  const expected = [
    ['.selector-2', '0', 'test.css'],
    ['.selector-1', '1', 'test.css'],
    ['.selector-4', '80', 'test-2.css'],
    ['.selector-3', '99', 'test.css'],
  ];
  t.deepEqual(table, expected);
});
