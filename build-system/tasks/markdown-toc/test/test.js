const fastGlob = require('fast-glob');
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
  for (const filename of await fastGlob(
    `${dirname}/all-are-complete/**/*.md`
  )) {
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
