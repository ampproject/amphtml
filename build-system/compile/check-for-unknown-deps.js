'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const {cyan, red, yellow} = require('kleur/colors');
const {log} = require('../common/logging');

/**
 * Searches for the identifier "module$", which Closure uses to uniquely
 * reference module imports. If any are found, that means Closure couldn't
 * import the module correctly.
 * @param {string} file
 * @return {Promise<void>}
 */
async function checkForUnknownDeps(file) {
  const regex = /[\w$]*module\$[\w$]+/;
  const contents = await fs.readFile(file, 'utf-8');
  if (!contents.includes('module$')) {
    // Fast check, since regexes can backtrack like crazy.
    return;
  }
  const match = regex.exec(contents) || [
    `couldn't parse the dep. Look for "module$" in the file`,
  ];
  log(
    red('Error:'),
    `Unknown dependency ${cyan(match[0])} found in ${cyan(file)}`
  );
  if (argv.debug) {
    log(red('Output file contents:'));
    log(yellow(contents));
  }
  throw new Error('Compilation failed due to unknown dependency');
}

module.exports = {
  checkForUnknownDeps,
};
