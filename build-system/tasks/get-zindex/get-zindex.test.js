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

const test = require('ava');
const {getZindexSelectors, getZindexChainsInJs, createTable} = require('.');

const cssResult = {
  'test.css': {
    '.selector-1': '1',
    '.selector-2': '0',
    '.selector-3': '99',
  },
  'test-2.css': {
    '.selector-4': '80',
    '.selector-5': 'initial',
    '.selector-6': 'auto',
  },
};

const jsResult = {
  'test-0.js': [
    ['<div />', 'initial'],
    ['assignment', 'auto'],
    ['declarator', 0],
    ['setStyle', 15],
    ['setStyles', 9999],
  ],
  'test-1.js': [['<Component />', 12345]],
};

test('collects selectors', async (t) => {
  const data = await getZindexSelectors('*.css', __dirname);
  t.deepEqual(data, cssResult);
});

test('collects chains from js', async (t) => {
  const data = await getZindexChainsInJs('*.js', __dirname);
  t.deepEqual(data, jsResult);
});

test('sync - create array of arrays with z index order', (t) => {
  t.plan(1);
  const table = createTable({...cssResult, ...jsResult});
  const expected = [
    ['`assignment`', 'auto', '[test-0.js](/test-0.js)'],
    ['`.selector-6`', 'auto', '[test-2.css](/test-2.css)'],
    ['`<div />`', 'initial', '[test-0.js](/test-0.js)'],
    ['`.selector-5`', 'initial', '[test-2.css](/test-2.css)'],
    ['`<Component />`', 12345, '[test-1.js](/test-1.js)'],
    ['`setStyles`', 9999, '[test-0.js](/test-0.js)'],
    ['`.selector-3`', '99', '[test.css](/test.css)'],
    ['`.selector-4`', '80', '[test-2.css](/test-2.css)'],
    ['`setStyle`', 15, '[test-0.js](/test-0.js)'],
    ['`.selector-1`', '1', '[test.css](/test.css)'],
    ['`declarator`', 0, '[test-0.js](/test-0.js)'],
    ['`.selector-2`', '0', '[test.css](/test.css)'],
  ];
  t.deepEqual(table, expected);
});
