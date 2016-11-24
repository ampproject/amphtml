## Installation

Install package with NPM and add it to your development dependencies:

```
npm install --save-dev gulp-amphtml-validator
```

## Usage

```js
const ampValidator = require('gulp-amphtml-validator');

gulp.task('amphtml:validate', () => {
  return gulp.src(['samples/*.html'])
    // Valide the input and attach the validation result to the "amp" property
    // of the file object. 
    .pipe(ampValidator.validate())
    // Print the validation results to the console.
    .pipe(ampValidator.format())
    // Exit the process with error code (1) if an AMP validation error
    // occurred.
    .pipe(ampValidator.failAfterError());
});
```

## Release Notes

### 1.0.0

* initial release
