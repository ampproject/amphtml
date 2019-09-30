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

const assert = require('assert');
const es = require('event-stream');
const File = require('vinyl');
const fs = require('fs');
const gulpAmpHtmlValidator = require('../');

const VALID_FILE = '../testdata/feature_tests/minimum_valid_amp.html';
const INVALID_FILE = '../testdata/feature_tests/empty.html';

describe('gulp-amphtml-validator', function() {

  describe('validate', function() {

    let validate;

    beforeEach(function() {
      validate = gulpAmpHtmlValidator.validate();
    });

    it('passes valid AMPs', function(done) {
      const validFile = createFile(VALID_FILE);
      validate.write(validFile);
      validate.once('data', function(file) {
        assert.equal(file.ampValidationResult.status, 'PASS');
        done();
      });
    });

    it('fails invalid AMPs', function(done) {
      const invalidFile = createFile(INVALID_FILE);
      validate.write(invalidFile);
      validate.once('data', function(file) {
        assert.equal(file.ampValidationResult.status, 'FAIL');
        done();
      });
    });

    it('fails if validator cannot be downloaded', function(done) {
      const faillingValidator = {
        getInstance: function() {
          return new Promise(function(resolve, reject) {
            reject(new Error('expected'));
          });
        },
      };
      validate = gulpAmpHtmlValidator.validate(faillingValidator);
      const validFile = createFile(VALID_FILE);
      validate.write(validFile);
      validate.once('data', function(file) {
        assert.equal(file.ampValidationResult.status, 'N/A');
        done();
      });
    });

  });

  describe('format', function() {

    let logger;
    let format;

    beforeEach(function() {
      logger = new MockLogger();
      format = gulpAmpHtmlValidator.format(logger);
    });

    it('prints passed validation results', function(done) {
      const pass = createFileStub(VALID_FILE);
      pass.ampValidationResult = {
        status: 'PASS',
        errors: [],
      };
      format.write(pass);
      format.end();
      format.once('finish', function() {
        assert.equal(logger.logged, 'AMP Validation results:\n\n' + VALID_FILE +
          ': \u001b[32mPASS\u001b[39m');
        done();
      });
    });

    it('prints failed vaidation results', function(done) {
      const fail = createFileStub(INVALID_FILE);
      fail.ampValidationResult = {
        status: 'FAIL',
        errors: [
          {
            severity: 'ERROR',
            line: 24,
            col: 4,
            message: 'errorMessage',
            specUrl: 'specUrl' ,
            category: 'category',
            code: 'errorCode',
            params: ['img','noscript','amp-img'],
          },
        ],
      };
      format.write(fail);
      format.end();
      format.once('finish', function() {
        assert.equal(logger.logged, 'AMP Validation results:\n\n' +
          INVALID_FILE + ': \u001b[31mFAIL\u001b[39m\n' + INVALID_FILE +
          ':24:4 ' + '\u001b[31merrorMessage\u001b[39m (see specUrl)');
        done();
      });
    });

  });

  describe('failAfterError', function() {

    let failAfterError;

    beforeEach(function() {
      failAfterError = gulpAmpHtmlValidator.failAfterError();
    });

    it('fails after invalid AMP', function(done) {
      const invalidFile = createFailedFile('fail.html');
      failAfterError.write(invalidFile);
      try {
        failAfterError.end();
      } catch (expected) {
        done();
      }
    });

    it('fails if validator fails to load', function(done) {
      const invalidFile = createFileWithValidatorFailure('fail.html');
      failAfterError.write(invalidFile);
      try {
        failAfterError.end();
      } catch (expected) {
        done();
      }
    });

    it('passes valid AMP', function(done) {
      const invalidFile = createPassedFile('pass.html');
      failAfterError.write(invalidFile);
      failAfterError.end();
      done();
    });

  });

  function createFailedFile(name) {
    const file = createFileStub(name);
    file.ampValidationResult = {
      status: 'FAIL',
    };
    return file;
  }

  function createFileWithValidatorFailure(name) {
    const file = createFileStub(name);
    file.ampValidationResult = {
      status: 'N/A',
    };
    return file;
  }

  function createPassedFile(name) {
    const file = createFileStub(name);
    file.ampValidationResult = {
      status: 'PASS',
    };
    return file;
  }

  function createFileStub(name) {
    return new File({
      path: name,
      contents: new Buffer('no contents'),
    });
  }

  function createFile(name) {
    return new File({
      path: name,
      contents: new Buffer(fs.readFileSync(name, 'utf8')),
    });
  }

  class MockLogger {

    constructor() {
      this.logged = '';
    }

    log(string) {
      this.logged += string;
    }
  }
});

