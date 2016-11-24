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
const gutil = require('gulp-util');
const File = require('vinyl');
const fs = require('fs');
const amphtmlValidator = require('../');

describe('gulp-amphtml-validator', function() {

  describe('validate', function() {

    let validate;

    beforeEach(function() {
      validate = amphtmlValidator.validate();
    });

    it('passes valid AMPs', function(done) {
      const validFile = createFile('valid.html');
      validate.write(validFile);
      validate.once('data', function(file) {
        assert.equal(file.ampValidationResult.status, 'PASS');
        done();
      });
    });

    it('fails invalid AMPs', function(done) {
      const invalidFile = createFile('invalid.html');
      validate.write(invalidFile);
      validate.once('data', function(file) {
        assert.equal(file.ampValidationResult.status, 'FAIL');
        done();
      });
    });

    it('fails if validator cannot be downloaded', function(done) {
      const faillingValidator = {
        getInstance: function() {
          return Promise.resolve().then(function() {
            throw new Error();
          }
          );
        },
      };
      validate = amphtmlValidator.validate(faillingValidator);
      const validFile = createFile('valid.html');
      try {
        validate.write(validFile);
      } catch (expected) {
        done();
      }
    });

  });

  describe('format', function() {

    let logger;
    let format;

    beforeEach(function() {
      logger = new MockLogger();
      format = amphtmlValidator.format(logger);
    });

    it('prints passed validation results', function(done) {
      const pass = createFileStub('valid.html');
      pass.ampValidationResult = {
        status: 'PASS',
        errors: [],
      };
      format.write(pass);
      format.end();
      format.once('finish', function() {
        assert.equal(logger.logged, '\u001b[32mPASS\u001b[39m valid.html');
        done();
      });
    });

    it('prints failed vaidation results', function(done) {
      const fail = createFileStub('invalid.html');
      fail.ampValidationResult = {
        status: 'FAIL',
        errors: [
          {
            severity: 'ERROR',
            line: 24,
            col: 4,
            message: 'The tag \'img\' may only appear as a descendant of ' +
              'tag \'noscript\'. Did you mean \'amp-img\'?',
            specUrl: 'https://www.ampproject.org/docs/reference/amp-img.html' ,
            category: 'DISALLOWED_HTML_WITH_AMP_EQUIVALENT',
            code: 'MANDATORY_TAG_ANCESTOR_WITH_HINT',
            params: ['img','noscript','amp-img'],
          },
        ],
      };
      format.write(fail);
      format.end();
      format.once('finish', function() {
        assert.equal(logger.logged, '\u001b[31mFAIL\u001b[39m invalid.html\n' +
          'line 24, col 4: The tag \'img\' may only appear as a descendant ' +
          'of tag \'noscript\'. Did you mean \'amp-img\'? (see ' +
          'https://www.ampproject.org/docs/reference/amp-img.html)');
        done();
      });
    });

  });

  describe('failAfterError', function() {

    let failAfterError;

    beforeEach(function() {
      failAfterError = amphtmlValidator.failAfterError();
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

    it('passes valid AMP', function(done) {
      const invalidFile = createPassedFile('pass.html');
      failAfterError.write(invalidFile);
      failAfterError.end();
      done();
    });

  });

  function createFailedFile(name) {
    const file = createFileStub(name);
    file.ampValidationResult = {};
    file.ampValidationResult.status = 'FAIL';
    return file;
  }

  function createPassedFile(name) {
    const file = createFileStub(name);
    file.ampValidationResult = {};
    file.ampValidationResult.status = 'PASS';
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
      contents: new Buffer(fs.readFileSync('sample/' + name, 'utf8')),
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

