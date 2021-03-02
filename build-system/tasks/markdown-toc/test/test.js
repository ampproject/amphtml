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

const contentWithHeadings = `## Foo

foo

## Foo bar baz

Foo? Bar baz!

### Third-level

abc

### Third-level two

abc
`;

test('inserts new toc', async (t) => {
  const header = `# inserts new toc

  ${headerForTesting}`;
  t.is(
    await overrideToc(`${header}

${contentWithHeadings}`),
    `${header}

-   [Foo](#foo)
-   [Foo bar baz](#foo-bar-baz)
    -   [Third-level](#third-level)
    -   [Third-level two](#third-level-two)

${contentWithHeadings}`
  );
});

test('allows paragraph before header after toc', async (t) => {
  const content = `# allows paragraph before header after toc

${headerForTesting}

-   [section](#section)

allows paragraph before header after toc

# section
`;

  t.is(await overrideToc(content), content);
});

test('uses options', async (t) => {
  const header = `# uses options

${headerForTesting}

<!-- {"maxdepth": 1} -->`;

  t.is(
    await overrideToc(`${header}

${contentWithHeadings}`),
    `${header}

-   [Foo](#foo)
-   [Foo bar baz](#foo-bar-baz)

${contentWithHeadings}`
  );
});

test('ignores unparsable options', async (t) => {
  const content = `# ignores unparsable options

${headerForTesting}

<!-- unparsable -->

-   [foo](#foo)

# foo

foo
`;
  t.is(await overrideToc(content), content);
});

test('maintains correct list', async (t) => {
  const content = `# This list is already correct

${headerForTesting}

-   [Foo](#foo)
-   [Foo bar baz](#foo-bar-baz)
    -   [Third-level](#third-level)
    -   [Third-level two](#third-level-two)

${contentWithHeadings}`;

  t.is(await overrideToc(content), content);
});

test('overrideTocGlob ./all-are-complete', async (t) => {
  t.deepEqual(await overrideTocGlob(`${dirname}/all-are-complete`), {
    // Returns null when no changes need to be made.
    [`${dirname}/all-are-complete/one.md`]: null,
    [`${dirname}/all-are-complete/two.md`]: null,
  });
});

test('overrideTocGlob ./some-are-incomplete', async (t) => {
  t.deepEqual(await overrideTocGlob(`${dirname}/some-are-incomplete`), {
    [`${dirname}/some-are-incomplete/one.md`]: null,
    [`${dirname}/some-are-incomplete/two.md`]:
      // Has same content but with TOC
      await readFile(`${dirname}/all-are-complete/two.md`, 'utf-8'),
  });
});
