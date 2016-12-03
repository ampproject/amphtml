/**
 * @license
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
 * limitations under the license.
 */

const gulp = require('gulp');
const gulpAmpHtmlValidator = require('gulp-amphtml-validator');

gulp.task('amphtml:validate', () => {
  return gulp.src('../../testdata/feature_tests/*.html')
    // Valide the input and attach the validation result to the "amp" property
    // of the file object. 
    .pipe(gulpAmpHtmlValidator.validate())
    // Print the validation results to the console.
    .pipe(gulpAmpHtmlValidator.format())
    // Exit the process with error code (1) if an AMP validation error
    // occurred.
    .pipe(gulpAmpHtmlValidator.failAfterError());
});

gulp.task('default', ['amphtml:validate'], function () {
  // This will only run if the validation task is successful...
});
