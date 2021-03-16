/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const prettier = require('prettier');

async function sanitize(file) {
  if (!argv.sanitize_vars_for_diff) {
    return;
  }

  const contents = await fs.readFile(file, 'utf-8');
  const config = await prettier.resolveConfig(file);
  const options = {filepath: file, parser: 'babel', ...config};
  // Normalize the length of all jscomp variables, so that prettier will
  // format it the same.
  const replaced = Object.create(null);
  let count = 0;
  const presanitize = contents.replace(
    /(?:[a-zA-Z$_][a-zA-Z$_0-9]*)?(?:JSCompiler|jscomp)[a-zA-Z$_0-9]*/g,
    (match) =>
      replaced[match] ||
      (replaced[match] = `___${String(count++).padStart(6, '0')}___`)
  );
  const formatted = prettier.format(presanitize, options);
  // Finally, strip the numbers from the sanitized jscomp variables. This
  // is so that a single extra variable doesn't cause thousands of diffs.
  const sanitized = formatted.replace(/___\d+___/g, '______');
  await fs.outputFile(file, sanitized);
}

module.exports = {sanitize};
