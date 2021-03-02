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
const globby = require('globby');
const path = require('path');
const test = require('ava');
const {headerForTesting, overrideToc, overrideTocGlob} = require('../');
const {readFile} = require('fs-extra');

const dirname = path.relative(process.cwd(), __dirname);

function isIncludedExactlyTimes(t, string, substring, times) {
  let foundIndex = -substring.length;

  for (let i = 0; i <= times; i++) {
    foundIndex = string.indexOf(substring, foundIndex + substring.length);
    if (i < times) {
      t.true(foundIndex > 0, `Found substring ${i} times, expected ${times}`);
    } else {
      t.is(foundIndex, -1, `Found substring over ${times} times`);
    }
  }
}

test('README.md includes correct header', async (t) => {
  const content = await readFile(path.join(dirname, '../README.md'), 'utf-8');

  // Included normally twice
  isIncludedExactlyTimes(t, content, headerForTesting, 2);

  // Included once in a diff code block, in which all lines are once indented.
  const headerIndented = headerForTesting
    .split('\n')
    .map((line) => (line.length > 0 ? `  ${line}` : ''))
    .join('\n');
  isIncludedExactlyTimes(t, content, headerIndented, 1);
});

test('overrideToc ./all-are-complete', async (t) => {
  for (const filename of globby.sync(`${dirname}/all-are-complete/**/*.md`)) {
    const content = await readFile(filename, 'utf-8');
    t.deepEqual(await overrideToc(content), content);
  }
});

test('overrideTocGlob ./some-are-incomplete', async (t) => {
  const dir = `${dirname}/some-are-incomplete`;
  const expected = {
    [`${dir}/complete.md`]: null,
    [`${dir}/incomplete.md`]:
      // Has exact same content but with TOC
      await readFile(`${dir}/complete.md`, 'utf-8'),
  };
  t.deepEqual(await overrideTocGlob(dir), expected);
});
