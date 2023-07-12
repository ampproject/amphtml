const {readFile} = require('fs-extra');
const {writeDiffOrFail} = require('../common/diff');

const ignoreFile = '.gitignore';
const syncIgnoreFiles = ['.prettierignore', '.eslintignore'];

const ignoreListFiles = [ignoreFile, ...syncIgnoreFiles];

const header = '# [GLOBALLY IGNORED]';

/**
 * @param {string} source
 * @return {string[]}
 */
function splitIgnoreListByHeader(source) {
  return source.split(header, 2);
}

/**
 * @return {!Promise}
 */
async function checkIgnoreLists() {
  const [, below] = splitIgnoreListByHeader(await readFile(ignoreFile, 'utf8'));

  for (const file of syncIgnoreFiles) {
    const [above] = splitIgnoreListByHeader(await readFile(file, 'utf8'));
    const tentative = [above, below].join(header);
    await writeDiffOrFail('check-ignore-lists', file, tentative);
  }
}

checkIgnoreLists.description =
  'Check ignore lists to make sure they are in sync';

checkIgnoreLists.flags = {
  'fix': `Fix files out of sync`,
};

module.exports = {
  checkIgnoreLists,
  ignoreListFiles,
  ignoreFile,
  splitIgnoreListByHeader,
};
