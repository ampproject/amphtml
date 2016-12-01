const gulp = require('gulp');
const gulpAmpValidator = require('../');

gulp.task('amphtml:validate', () => {
  return gulp.src(['../../testdata/feature_tests/*.html'])
    // Valide the input and attach the validation result to the "amp" property
    // of the file object. 
    .pipe(gulpAmpValidator.validate())
    // Print the validation results to the console.
    .pipe(gulpAmpValidator.format())
    // Exit the process with error code (1) if an AMP validation error
    // occurred.
    .pipe(gulpAmpValidator.failAfterError());
});

gulp.task('default', ['amphtml:validate'], function () {
  // This will only run if the validation task is successful...
});
