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

const {readFileSync} = require('fs');
const {resolve, dirname, join, relative} = require('path');

// Transforms JSON imports into a `JSON.parse` call:
//
// Input:
// ```
// import key from './options.json' assert { type: 'json' };
// ```
//
// Output:
// ```
// const key = JSON.parse('{"imported": "json"}');
// ```
module.exports = function ({types: t, template}, options) {
  const {freeze = true} = options;

  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push('importAssertions');
    },

    visitor: {
      ImportDeclaration(path) {
        const {specifiers, assertions, source} = path.node;
        if (!assertions || assertions.length === 0) {
          return;
        }

        if (assertions.length !== 1) {
          throw path.buildCodeFrameError(
            'too many import assertions, we only support `assert { "type": "json" }`'
          );
        }
        const assertion = assertions[0];
        if (
          !t.isIdentifier(assertion.key, {name: 'type'}) &&
          !t.isStringLiteral(assertion.key, {value: 'type'})
        ) {
          throw path.buildCodeFrameError(
            'unknown assertion, we only support `assert { "type": "json" }`'
          );
        }
        if (!t.isStringLiteral(assertion.value, {value: 'json'})) {
          throw path.buildCodeFrameError(
            'unknown type assertion, we only support `assert { "type": "json" }`'
          );
        }

        const specifier = specifiers[0].local;
        const jsonPath = relative(
          join(__dirname, '..', '..', '..'),
          resolve(dirname(this.file.opts.filename), source.value)
        );
        let json;
        try {
          json = JSON.parse(readFileSync(jsonPath, 'utf8'));
        } catch (e) {
          throw path.buildCodeFrameError(
            `could not load JSON file at '${jsonPath}'`
          );
        }

        if (freeze) {
          path.replaceWith(
            template.statement
              .ast`const ${specifier} = JSON.parse('${JSON.stringify(
              json
            )}', function(key, val) {
                if (typeof val === 'object') Object.freeze(val);
                return val;
              });`
          );
          return;
        }

        path.replaceWith(
          template.statement
            .ast`const ${specifier} = JSON.parse('${JSON.stringify(json)}');`
        );
      },
    },
  };
};
