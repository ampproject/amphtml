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

const {cyan} = require('kleur/colors');
const {matchForbiddenTerms} = require('../test-configs/forbidden-terms');
const {relative} = require('path');

/**
 * @fileoverview
 * Reports forbidden terms found by regex.
 * See test-configs/forbidden-terms.js
 */

const addPeriod = (str) => (/.\s*$/.test(str) ? str : `${str}.`);

module.exports = function (context) {
  return {
    Program() {
      const filename = relative(process.cwd(), context.getFilename());
      const sourceCode = context.getSourceCode();
      const contents = sourceCode.text;

      for (const terms of context.options) {
        for (const report of matchForbiddenTerms(filename, contents, terms)) {
          const {match, message, loc} = report;
          const formattedMatch = cyan(`"${match}"`);
          context.report({
            loc,
            message:
              `Forbidden: ${formattedMatch}.` +
              (message ? ` ${addPeriod(message)}` : ''),
          });
        }
      }
    },
  };
};
