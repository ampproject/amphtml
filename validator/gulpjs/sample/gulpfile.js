const gulp = require('gulp');
const ampValidator = require('../');

gulp.task('amphtml:validate', () => {
  return gulp.src(['*.html'])
    // Valide the input and attach the validation result to the "amp" property
    // of the file object. 
    .pipe(ampValidator.validate())
    // Print the validation results to the console.
    .pipe(ampValidator.format())
    // Exit the process with error code (1) if an AMP validation error
    // occurred.
    .pipe(ampValidator.failAfterError());
});

gulp.task('default', ['amphtml:validate'], function () {
  // This will only run if the validation task is successful...
});
