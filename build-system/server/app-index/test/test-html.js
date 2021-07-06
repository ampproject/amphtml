/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const test = require('ava');
const {html, joinFragments} = require('../html');

test('joinFragments joins simple fragments', (t) => {
  t.is(joinFragments(['a', 'b', 'c']), 'abc');
});

test('joinFragments joins mapped fragments', (t) => {
  t.is(
    joinFragments([1, 2, 3], (a) => a + 1),
    '234'
  );
});

test('tagged literal passes through simple string', (t) => {
  t.is(html`foo`, 'foo');
});

test('tagged literal concatenates interpolated args', (t) => {
  // eslint-disable-next-line local/html-template
  const interpolated = html`quesadilla ${'de'} chicharrón ${'con'} queso`;
  t.is(interpolated, 'quesadilla de chicharrón con queso');
});
