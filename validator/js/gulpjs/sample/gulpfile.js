const gulp = require('gulp');
const gulpAmpHtmlValidator = require('gulp-amphtml-validator');

gulp.task('amphtml:validate', () => {
  return gulp.src('../../testdata/feature_tests/*.html')
  // Validate the input and attach the validation result to the "amp" property
  // of the file object.
      .pipe(gulpAmpHtmlValidator.validate())
  // Print the validation results to the console.
      .pipe(gulpAmpHtmlValidator.format())
  // Exit the process with error code (1) if an AMP validation error
  // occurred.
      .pipe(gulpAmpHtmlValidator.failAfterError());
});

gulp.task('default', ['amphtml:validate'], function() {
  // This will only run if the validation task is successful...
});
