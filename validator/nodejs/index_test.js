#!/usr/bin/env node
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

'use strict';

global.assert = require('assert');
var fs = require('fs');
global.path = require('path');

var execFile = require('child_process').execFile;
var JasmineRunner = require('jasmine');
var jasmine = new JasmineRunner();

var ampValidator = require('./index.js');

it('deployed validator rejects the empty file', function(done) {
  // Note: This will fetch and use the validator from
  // 'https://cdn.ampproject.org/v0/validator.js', since only one argument
  // is supplied to validateString.
  ampValidator.getInstance()
      .then(function(instance) {
        var validationResult = instance.validateString('');
        expect(validationResult.status).toBe('FAIL');
        done();
      })
      .catch(function(error) {
        fail(error);
        done();
      });
});

it('validator_minified.js was built (run build.py if this fails)', function() {
  expect(fs.statSync('../dist/validator_minified.js').isFile()).toBe(true);
});

it('built validator rejects the empty file', function(done) {
  // Note: This will use the validator that was built with build.py.
  ampValidator.getInstance(/*validatorJs*/ '../dist/validator_minified.js')
      .then(function(instance) {
        var validationResult = instance.validateString('');
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
  var mini = fs.readFileSync(
      '../testdata/feature_tests/minimum_valid_amp.html', 'utf-8').trim();
  ampValidator.getInstance(/*validatorJs*/ '../dist/validator_minified.js')
      .then(function(instance) {
        var validationResult = instance.validateString(mini);
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
  var mini = fs.readFileSync(
      '../testdata/amp4ads_feature_tests/min_valid_amp4ads.html', 'utf-8')
      .trim();
  ampValidator.getInstance(/*validatorJs*/ '../dist/validator_minified.js')
      .then(function(instance) {
        var validationResult = instance.validateString(mini, 'AMP4ADS');
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
  var severalErrorsHtml =
      fs.readFileSync('../testdata/feature_tests/several_errors.html', 'utf-8')
          .trim();
  var severalErrorsOut =
      fs.readFileSync('../testdata/feature_tests/several_errors.out', 'utf-8')
          .split('\n')
          .filter(isErrorLine)
          .join('\n');

  ampValidator.getInstance(/*validatorJs*/ '../dist/validator_minified.js')
      .then(function(instance) {
        var validationResult = instance.validateString(severalErrorsHtml);
        expect(validationResult.status).toBe('FAIL');
        // Here, we assemble the output from the validationResult that was
        // computed by the validator and compare it with the golden file.
        var out = 'FAIL\n';
        for (var ii = 0; ii < validationResult.errors.length; ii++) {
          var error = validationResult.errors[ii];
          out += 'feature_tests/several_errors.html';
          out += ':' + error.line + ':' + error.col + ' ' + error.message;
          if (error.specUrl) {
            out += ' (see ' + error.specUrl + ')';
          }
          out += ' [' + error.category + ']\n';
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
  ampValidator.getInstance(/*validatorJs*/ '../dist/validator.protoascii')
      .then(function(instance) {
        fail('We should not get here since this is not a good validator.');
        done();
      })
      .catch(function(error) {
        expect(error.message)
            .toMatch(
                /^Could not instantiate validator\.js -.*[Uu]nexpected token/);
        done();
      });
});

it('also works with newInstance', function() {
  var mini = fs.readFileSync(
      '../testdata/feature_tests/minimum_valid_amp.html', 'utf-8').trim();
  var validatorJsContents =
      fs.readFileSync('../dist/validator_minified.js', 'utf-8');
  var resultForMini =
      ampValidator.newInstance(validatorJsContents).validateString(mini);
  expect(resultForMini.status).toBe('PASS');

  var severalErrorsHtml =
      fs.readFileSync('../testdata/feature_tests/several_errors.html', 'utf-8')
          .trim();
  var resultForSeveralErrors = ampValidator.newInstance(validatorJsContents)
                                   .validateString(severalErrorsHtml);
  expect(resultForSeveralErrors.status).toBe('FAIL');
});

it('emits text if --format=text is specified on command line', function(done) {
  var severalErrorsOut =
      fs.readFileSync('../testdata/feature_tests/several_errors.out', 'utf-8')
          .split('\n')
          .filter(isErrorLine)
          .splice(1)  // trim 1st line
          .join('\n')
          .replace(/ \[[A-Z_]+\]/g, '');  // trim error categories
  execFile(
      process.execPath,
      [
        '../nodejs/index.js', '--format=text',
        '--validator_js=../dist/validator_minified.js',
        'feature_tests/several_errors.html',
        'feature_tests/minimum_valid_amp.html'
      ],
      {'cwd': '../testdata'},  // Run inside the testdata dir to match paths.
      function (error, stdout, stderr) {
        expect(error).toBeDefined();  // At least one file had errors.
        expect(stderr).toBe(severalErrorsOut);
        expect(stdout).toBe('feature_tests/minimum_valid_amp.html: PASS\n');
        done();
      });
}, 5000);

it('emits json if --format=json is specified on command line', function(done) {
  execFile(
      process.execPath,
      [
        '../nodejs/index.js', '--format=json',
        '--validator_js=../dist/validator_minified.js',
        'feature_tests/several_errors.html',
        'feature_tests/minimum_valid_amp.html'
      ],
      {'cwd': '../testdata'},  // Run inside the testdata dir to match paths.
      function (error, stdout, stderr) {
        expect(error).toBeDefined();  // At least one file had errors
        expect(stderr).toBe('');      // entire json results will be on stdout

        // We inspect the parsed JSON but not very deep, to keep this test
        // relatively robust. We don't want it to churn if the validator
        // changes its outputs slightly.
        var parsedJson = JSON.parse(stdout);
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
  var severalErrorsOut =
      fs.readFileSync(
            '../testdata/amp4ads_feature_tests/style-amp-custom.out',
            'utf-8')
          .split('\n')
          .filter(isErrorLine)
          .splice(1)  // trim 1st line
          .join('\n')
          .replace(/ \[[A-Z_]+\]/g, '');  // trim error categories
  execFile(
      process.execPath,
      [
        '../nodejs/index.js', '--format=text', '--html_format=AMP4ADS',
        '--validator_js=../dist/validator_minified.js',
        'amp4ads_feature_tests/style-amp-custom.html',
        'amp4ads_feature_tests/min_valid_amp4ads.html'
      ],
      {'cwd': '../testdata'},  // Run inside the testdata dir to match paths.
      function(error, stdout, stderr) {
        expect(error).toBeDefined();  // At least one file had errors.
        expect(stderr).toBe(severalErrorsOut);
        expect(stdout).toBe(
            'amp4ads_feature_tests/min_valid_amp4ads.html: PASS\n');
        done();
      });
}, 5000);


jasmine.onComplete(function(passed) { process.exit(passed ? 0 : 1); });
jasmine.execute();
