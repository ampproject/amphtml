'use strict';

const test = require('ava');
const {createTable, getZindexChainsInJs, getZindexSelectors} = require('.');

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
