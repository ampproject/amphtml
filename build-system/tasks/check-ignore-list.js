const {readFile} = require('fs-extra');
const {writeDiffOrFail} = require('../common/diff');

const ignoreFile = '.gitignore';
const syncIgnoreFiles = ['.prettierignore', '.eslintignore'];

const header = '# Globally ignored below';

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
async function checkIgnoreList() {
  const [, below] = splitIgnoreListByHeader(await readFile(ignoreFile, 'utf8'));

  for (const file of syncIgnoreFiles) {
    const [above] = splitIgnoreListByHeader(await readFile(file, 'utf8'));
    const tentative = [above, below].join(header);
    await writeDiffOrFail('check-ignore-list', file, tentative);
  }
}

checkIgnoreList.description = `Checks that ignore files (${syncIgnoreFiles.join(
  ', '
)}) are in sync using ${ignoreFile} as the source of truth.`;

checkIgnoreList.flags = {
  'fix': `Fix files out of sync`,
};

module.exports = {
  checkIgnoreList,
  ignoreFile,
  splitIgnoreListByHeader,
};
