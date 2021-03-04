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

const {getOutput, execScriptAsync} = require('../../common/exec');

const command = (args = []) =>
  [
    'npx jscodeshift',
    '--parser=babylon',
    `--parser-config=${__dirname}/parser-config.json`,
    ...args,
  ].join(' ');

/**
 * @param {Array<string>} args
 * @param {Object} opts
 * @return {string}
 */
const jscodeshift = (args = [], opts) => getOutput(command(args), opts);

/**
 * @param {Array<string>} args
 * @param {Object} opts
 * @return {ChildProcess}
 */
const jscodeshiftAsync = (args = [], opts) =>
  execScriptAsync(command(args), opts);

const stripColors = (str) => str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '');

/**
 * @param {string} line
 * @return {Array<string>} [filename, report]
 */
function getJscodeshiftReport(line) {
  const stripped = stripColors(line);

  // Lines starting with " REP " are reports from a transform, which it owns
  // and formats.
  if (!stripped.startsWith(' REP ')) {
    return null;
  }

  const noPrefix = stripped.substr(' REP '.length);
  const [filename] = noPrefix.split(' ', 1);
  const report = noPrefix.substr(filename.length + 1);
  return [filename, report];
}

module.exports = {getJscodeshiftReport, jscodeshift, jscodeshiftAsync};
