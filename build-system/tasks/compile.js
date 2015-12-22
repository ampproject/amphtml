var closureCompiler = require('gulp-closure-compiler');
var gulp = require('gulp');

gulp.task('compile', function() {
  /*eslint "google-camelcase/google-camelcase": 0*/
  //return gulp.src(['{src,3p,ads,extensions,builtins}/**.js'])
  return gulp.src([
    'ads/**.js',
    'build/css.js',
    'src/**/*.js',
    'builtins/**.js',
    'third_party/caja/html-sanitizer.js',
    'third_party/closure-library/sha384-generated.js',
    'node_modules/document-register-element/build/document-register-element.max.js',
    'node_modules/core-js/modules/es6.math.sign.js',
    'node_modules/core-js/modules/$.sign.js',
    'node_modules/core-js/modules/$.def.js',
    'node_modules/core-js/modules/$.global.js',
    'node_modules/core-js/modules/$.core.js',
    'node_modules/core-js/modules/$.redef.js',
    'node_modules/core-js/modules/$.hide.js',
    'node_modules/core-js/modules/$.uid.js',
    'node_modules/core-js/modules/$.property-desc.js',
    'node_modules/core-js/modules/$.support-desc.js',
    'node_modules/core-js/modules/$.fails.js',
    'node_modules/core-js/modules/$.js',
    'node_modules/core-js/modules/$.library.js',
    'node_modules/core-js/modules/$.ctx.js',
    'node_modules/core-js/modules/$.classof.js',
    'node_modules/core-js/modules/$.is-object.js',
    'node_modules/core-js/modules/$.an-object.js',
    'node_modules/core-js/modules/$.a-function.js',
    'node_modules/core-js/modules/$.cof.js',
    'node_modules/core-js/modules/$.wks.js',
    'node_modules/core-js/modules/$.strict-new.js',
    'node_modules/core-js/modules/$.for-of.js',
    'node_modules/core-js/modules/$.set-proto.js',
    'node_modules/core-js/modules/$.same.js',
    'node_modules/core-js/modules/$.species.js',
    'node_modules/core-js/modules/$.microtask.js',
    'node_modules/core-js/modules/$.iter-call.js',
    'node_modules/core-js/modules/$.is-array-iter.js',
    'node_modules/core-js/modules/$.to-length.js',
    'node_modules/core-js/modules/core.get-iterator-method.js',
    'node_modules/core-js/modules/$.task.js',
    'node_modules/core-js/modules/$.shared.js',
    'node_modules/core-js/modules/$.mix.js',
    'node_modules/core-js/modules/$.tag.js',
    'node_modules/core-js/modules/$.iterators.js',
    'node_modules/core-js/modules/$.has.js',
    'node_modules/core-js/modules/$.invoke.js',
    'node_modules/core-js/modules/$.html.js',
    'node_modules/core-js/modules/$.dom-create.js',
    'node_modules/core-js/modules/$.to-integer.js',
    'node_modules/core-js/modules/$.iter-detect.js',
    'node_modules/core-js/modules/es6.promise.js',
    '!node_modules/core-js/modules/library/**.js',
    '!**_test.js'
  ]).pipe(closureCompiler({
      compilerPath: 'node_modules/google-closure-compiler/compiler.jar',
      fileName: 'build-cc.js',
      compilerFlags: {
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT5',
        js_module_root: 'node_modules/',
        common_js_entry_module: 'src/amp.js',
        process_common_js_modules: null,
        manage_closure_dependencies: null
      }
    }))
    .pipe(gulp.dest('dist'));
});
