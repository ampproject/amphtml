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

/**
 * @fileoverview
 * Passes source to functions set as options, which return an array of option
 * objects for context.report.
 */

module.exports = function (context) {
  return {
    Program() {
      const filename = context.getFilename();
      const sourceCode = context.getSourceCode();

      for (const getReports of context.options) {
        for (const report of getReports(filename, sourceCode.text)) {
          context.report(report);
        }
      }
    },
  };
};
