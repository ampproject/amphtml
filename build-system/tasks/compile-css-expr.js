/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

var jison = require('jison');
var gulp = require('gulp');
var fs = require('fs-extra');

gulp.task('compile-css-expr', function() {
  var path = 'extensions/amp-animation/0.1/';

  var bnf = fs.readFileSync(path + 'css-expr-impl.jison', 'utf8');
  var settings = {type: 'lalr', debug: false, moduleType: 'js'};
  var generator = new jison.Generator(bnf, settings);
  var jsModule = generator.generate(settings);

  var license = fs.readFileSync(
      'build-system/tasks/js-license.txt', 'utf8');
  var suppressCheckTypes = '/** @fileoverview ' +
      '@suppress {checkTypes, suspiciousCode, uselessCode} */';
  var imports = 'import * as ast from \'./css-expr-ast\';';
  var jsExports = 'exports.parser = parser;';

  var out = [
      license,
      suppressCheckTypes,
      imports,
      jsModule,
      jsExports].join('\n\n') + '\n';
  fs.writeFileSync(path + 'css-expr-impl.js', out);
});
