'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const prettier = require('prettier');

/**
 * Sanitizes variable names in minified output to aid in debugging.
 * 1. Normalizes the length of all jscomp variables, so that prettier will
 *    format it the same.
 * 2. Strips numbers from the sanitized jscomp variables so that a single extra
 *    variable doesn't cause thousands of diffs.
 * @param {string} file
 * @return {Promise<void>}
 */
async function sanitize(file) {
  if (!argv.sanitize_vars_for_diff) {
    return;
  }
  const contents = await fs.readFile(file, 'utf-8');
  const config = await prettier.resolveConfig(file);
  const options = {filepath: file, parser: 'babel', ...config};
  const replaced = Object.create(null);
  let count = 0;
  const presanitize = contents.replace(
    /(?:[a-zA-Z$_][a-zA-Z$_0-9]*)?(?:JSCompiler|jscomp)[a-zA-Z$_0-9]*/g,
    (match) =>
      replaced[match] ||
      (replaced[match] = `___${String(count++).padStart(6, '0')}___`)
  );
  const formatted = await prettier.format(presanitize, options);
  const sanitized = formatted.replace(/___\d+___/g, '______');
  await fs.outputFile(file, sanitized);
}

module.exports = {sanitize};
