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
const {headerRegExpForTesting, overrideToc, overrideTocGlob} = require('../');
const {readFile} = require('fs-extra');

const dirname = path.relative(process.cwd(), __dirname);

test('README.md includes correct header', async (t) => {
  const expectedFoundTimes = 3;

  const filename = path.join(dirname, '../README.md');
  const content = await readFile(filename, 'utf-8');

  const {length} = content.match(
    new RegExp(headerRegExpForTesting.source, 'gim')
  );
  t.is(
    length,
    expectedFoundTimes,
    `${filename} should include TOC header comment ${expectedFoundTimes} times`
  );
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
