/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

const fs = require('fs-extra');
const gulp = require('gulp');
const jison = require('jison');

gulp.task('compile-access-expr', function() {
  const path = 'extensions/amp-access/0.1/';

  const bnf = fs.readFileSync(path + 'access-expr-impl.jison', 'utf8');
  const settings = {type: 'lalr', debug: false, moduleType: 'js'};
  const generator = new jison.Generator(bnf, settings);
  const jsModule = generator.generate(settings);

  const license = fs.readFileSync(
      'build-system/tasks/js-license.txt', 'utf8');
  const suppressCheckTypes = '/** @fileoverview ' +
      '@suppress {checkTypes, suspiciousCode, uselessCode} */';
  const jsExports = 'export const accessParser = parser;';

  const out = [
    license,
    suppressCheckTypes,
    jsModule,
    jsExports].join('\n\n') + '\n';
  fs.writeFileSync(path + 'access-expr-impl.js', out);
});
