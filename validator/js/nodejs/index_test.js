#!/usr/bin/env node

'use strict';

global.assert = require('assert');
const fs = require('fs');
global.path = require('path');

const JasmineRunner = require('jasmine');
const {execFile} = require('child_process');
const jasmine = new JasmineRunner();

const ampValidator = require('./');

it('deployed validator rejects the empty file', function(done) {
  // Note: This will fetch and use the validator from
  // 'https://cdn.ampproject.org/v0/validator_wasm.js', since only one argument
  // is supplied to validateString.
  ampValidator.getInstance()
      .then(function(instance) {
        const validationResult = instance.validateString('');

        expect(validationResult.status).toBe('FAIL');
        done();
      })
      .catch(function(error) {
        fail(error);
        done();
      });
});

it('validator_minified.js was built (run build.py if this fails)', function() {
  expect(fs.statSync('../../dist/validator_minified.js').isFile()).toBe(true);
});

it('built validator rejects the empty file', function(done) {
  // Note: This will use the validator that was built with build.py.
  ampValidator.getInstance(/*validatorJs*/ '../../dist/validator_minified.js')
      .then(function(instance) {
        const validationResult = instance.validateString('');

        expect(validationResult.status).toBe('FAIL');
        done();
      })
      .catch(function(error) {
        fail(error);
        done();
      });
});

it('accepts the minimum valid AMP file', function(done) {
  // Note: This will use the validator that was built with build.py.
  const mini =
      fs.readFileSync(
            '../../testdata/feature_tests/minimum_valid_amp.html', 'utf-8')
          .trim();
  ampValidator.getInstance(/*validatorJs*/ '../../dist/validator_minified.js')
      .then(function(instance) {
        const validationResult = instance.validateString(mini);

        expect(validationResult.status).toBe('PASS');
        done();
      })
      .catch(function(error) {
        fail(error);
        done();
      });
});

it('accepts the minimum valid AMP4ADS file', function(done) {
  // Note: This will use the validator that was built with build.py.
  const mini =
      fs.readFileSync(
            '../../testdata/amp4ads_feature_tests/min_valid_amp4ads.html',
            'utf-8')
          .trim();
  ampValidator.getInstance(/*validatorJs*/ '../../dist/validator_minified.js')
      .then(function(instance) {
        const validationResult = instance.validateString(mini, 'AMP4ADS');

        expect(validationResult.status).toBe('PASS');
        done();
      })
      .catch(function(error) {
        fail(error);
        done();
      });
});

/**
 * Given a line read from a test .out file, returns true iff the line is an
 * actual error, instead of the input file inlined.
 * @param {string} line
 * @return {boolean}
 */
function isErrorLine(line) {
  return !(line.startsWith('|') || line.startsWith('>>'));
}

it('rejects a specific file that is known to have errors', function(done) {
  // Note: This will use the validator that was built with build.py.
  const severalErrorsHtml =
      fs.readFileSync(
            '../../testdata/feature_tests/several_errors.html', 'utf-8')
          .trim();
  const severalErrorsOut =
      fs.readFileSync(
            '../../testdata/feature_tests/several_errors.out', 'utf-8')
          .split('\n')
          .filter(isErrorLine)
          .join('\n');

  ampValidator.getInstance(/*validatorJs*/ '../../dist/validator_minified.js')
      .then(function(instance) {
        const validationResult = instance.validateString(severalErrorsHtml);

        expect(validationResult.status).toBe('FAIL');
        // Here, we assemble the output from the validationResult that was
        // computed by the validator and compare it with the golden file.
        let out = 'FAIL\n';
        for (let ii = 0; ii < validationResult.errors.length; ii++) {
          const error = validationResult.errors[ii];
          out += 'feature_tests/several_errors.html';
          out += ':' + error.line + ':' + error.col + ' ' + error.message;
          if (error.specUrl) {
            out += ' (see ' + error.specUrl + ')';
          }
          out += '\n';
        }

        expect(out).toBe(severalErrorsOut);
        done();
      })
      .catch(function(error) {
        fail(error);
        done();
      });
});

it('handles syntax errors in validator file', function(done) {
  // Note: This points the library at a file that's not even Javascript.
  ampValidator.getInstance(/*validatorJs*/ '../../dist/validator.protoascii')
      .then(function(instance) {
        fail('We should not get here since this is not a good validator.');
        done();
      })
      .catch(function(error) {
        expect(error.message)
            .toMatch(
                /^Could not instantiate validator_wasm\.js -.*[Uu]nexpected token/);
        done();
      });
});

it('also works with newInstance', function() {
  const mini =
      fs.readFileSync(
            '../../testdata/feature_tests/minimum_valid_amp.html', 'utf-8')
          .trim();
  const validatorJsContents =
      fs.readFileSync('../../dist/validator_minified.js', 'utf-8');
  const resultForMini =
      ampValidator.newInstance(validatorJsContents).validateString(mini);

  expect(resultForMini.status).toBe('PASS');

  const severalErrorsHtml =
      fs.readFileSync(
            '../../testdata/feature_tests/several_errors.html', 'utf-8')
          .trim();
  const resultForSeveralErrors = ampValidator.newInstance(validatorJsContents)
      .validateString(severalErrorsHtml);

  expect(resultForSeveralErrors.status).toBe('FAIL');
});

it('emits text if --format=text is specified on command line', function(done) {
  const severalErrorsOut =
      fs.readFileSync(
            '../../testdata/feature_tests/several_errors.out', 'utf-8')
          .split('\n')
          .filter(isErrorLine)
          .splice(1)  // trim 1st line
          .join('\n')
          .replace(/ \[[A-Z_]+\]/g, '');  // trim error categories
  execFile(
      process.execPath,
      [
        '../js/nodejs/cli.js',
        '--format=text',
        '--validator_js=../dist/validator_minified.js',
        'feature_tests/several_errors.html',
        'feature_tests/minimum_valid_amp.html',
      ],
      {'cwd': '../../testdata'},  // Run inside the testdata dir to match paths.
      function(error, stdout, stderr) {
        expect(error).toBeDefined(); // At least one file had errors.
        expect(stderr).toBe(severalErrorsOut);
        expect(stdout).toBe('feature_tests/minimum_valid_amp.html: PASS\n');
        done();
      });
}, 5000);

it('emits json if --format=json is specified on command line', function(done) {
  execFile(
      process.execPath,
      [
        '../js/nodejs/cli.js',
        '--format=json',
        '--validator_js=../dist/validator_minified.js',
        'feature_tests/several_errors.html',
        'feature_tests/minimum_valid_amp.html',
      ],
      {'cwd': '../../testdata'},  // Run inside the testdata dir to match paths.
      function(error, stdout, stderr) {
        expect(error).toBeDefined(); // At least one file had errors
        expect(stderr).toBe(''); // entire json results will be on stdout

        // We inspect the parsed JSON but not very deep, to keep this test
        // relatively robust. We don't want it to churn if the validator
        // changes its outputs slightly.
        const parsedJson = JSON.parse(stdout);

        expect(parsedJson['feature_tests/minimum_valid_amp.html'])
            .toBeDefined();

        expect(parsedJson['feature_tests/several_errors.html']).toBeDefined();
        expect(parsedJson['feature_tests/minimum_valid_amp.html'].status)
            .toBe('PASS');

        expect(parsedJson['feature_tests/several_errors.html'].status)
            .toBe('FAIL');
        done();
      });
}, 5000);

it('supports AMP4ADS with --html_format command line option', function(done) {
  const severalErrorsOut =
      fs.readFileSync(
            '../../testdata/amp4ads_feature_tests/style-amp-custom.out',
            'utf-8')
          .split('\n')
          .filter(isErrorLine)
          .splice(1)  // trim 1st line
          .join('\n')
          .replace(/ \[[A-Z_]+\]/g, '');  // trim error categories
  execFile(
      process.execPath,
      [
        '../js/nodejs/cli.js',
        '--format=text',
        '--html_format=AMP4ADS',
        '--validator_js=../dist/validator_minified.js',
        'amp4ads_feature_tests/style-amp-custom.html',
        'amp4ads_feature_tests/min_valid_amp4ads.html',
      ],
      {'cwd': '../../testdata'},  // Run inside the testdata dir to match paths.
      function(error, stdout, stderr) {
        expect(error).toBeDefined(); // At least one file had errors.
        expect(stderr).toBe(severalErrorsOut);
        expect(stdout).toBe(
            'amp4ads_feature_tests/min_valid_amp4ads.html: PASS\n');
        done();
      });
}, 5000);


jasmine.onComplete(function(passed) { process.exit(passed ? 0 : 1); });
jasmine.execute();
