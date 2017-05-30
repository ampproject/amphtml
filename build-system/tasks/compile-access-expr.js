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

var jison = require('jison');
var gulp = require('gulp');
var fs = require('fs-extra');

gulp.task('compile-access-expr', function() {
  var path = 'extensions/amp-access/0.1/';

  var bnf = fs.readFileSync(path + 'access-expr-impl.jison', 'utf8');
  var settings = {type: 'lalr', debug: false, moduleType: 'js'};
  var generator = new jison.Generator(bnf, settings);
  var jsModule = generator.generate(settings);

  var license = fs.readFileSync(
      'build-system/tasks/js-license.txt', 'utf8');
  var jsExports = 'exports.parser = parser;';

  var out = license + '\n\n' + jsModule + '\n\n' + jsExports + '\n';
  fs.writeFileSync(path + 'access-expr-impl.js', out);
});
