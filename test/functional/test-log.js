/**
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
 * limitations under the License.
 */

import {
  Log,
  LogLevel,
  USER_ERROR_SENTINEL,
  dev,
  isUserErrorMessage,
  rethrowAsync,
  setReportError,
  user,
  duplicateErrorIfNecessary,
} from '../../src/log';
import * as sinon from 'sinon';

describe('Logging', () => {

  const RETURNS_FINE = () => LogLevel.FINE;
  const RETURNS_INFO = () => LogLevel.INFO;
  const RETURNS_WARN = () => LogLevel.WARN;
  const RETURNS_ERROR = () => LogLevel.ERROR;
  const RETURNS_OFF = () => LogLevel.OFF;

  let sandbox;
  let mode;
  let win;
  let logSpy;
  let timeoutSpy;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    mode = {};
    window.AMP_MODE = mode;

    logSpy = sandbox.spy();
    timeoutSpy = sandbox.spy();
    win = {
      console: {
        log: logSpy,
      },
      setTimeout: timeoutSpy,
      reportError: error => error,
    };
    sandbox.stub(self, 'reportError', error => error);
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
    window.AMP_MODE = undefined;
  });

  describe('Level', () => {

    it('should be enabled when directly allowed', () => {
      expect(new Log(win, RETURNS_FINE).level_).to.equal(LogLevel.FINE);
    });

    it('should be disabled when directly disallowed', () => {
      expect(new Log(win, RETURNS_OFF).level_).to.equal(LogLevel.OFF);
    });

    it('should be disabled with no console', () => {
      win.console.log = null;
      expect(new Log(win, RETURNS_FINE).level_).to.equal(LogLevel.OFF);

      win.console = null;
      expect(new Log(win, RETURNS_FINE).level_).to.equal(LogLevel.OFF);
    });

    it('should be disabled with hash param log=0', () => {
      mode.log = '0';
      expect(new Log(win, RETURNS_FINE).level_).to.equal(LogLevel.OFF);
    });

    it('should be enabled when forced for tests', () => {
      mode.test = true;
      win.ENABLE_LOG = true;
      expect(new Log(win, RETURNS_OFF).level_).to.equal(LogLevel.FINE);
    });

    it('should be enabled as INFO when forced for localDev', () => {
      mode.localDev = true;
      expect(new Log(win, RETURNS_OFF).level_).to.equal(LogLevel.INFO);
    });
  });

  describe('Level messages', () => {
    it('should log correctly for FINE', () => {
      const log = new Log(win, RETURNS_FINE);
      expect(log.level_).to.equal(LogLevel.FINE);

      log.fine('fine');
      log.info('info');
      log.warn('warn');
      log.error('error');

      expect(logSpy).to.have.callCount(4);
      expect(logSpy.args[0][1]).to.equal('[fine]');
      expect(logSpy.args[1][1]).to.equal('[info]');
      expect(logSpy.args[2][1]).to.equal('[warn]');
      expect(logSpy.args[3][1]).to.equal('[error]');
      expect(timeoutSpy).to.have.not.been.called;
    });

    it('should log correctly for INFO', () => {
      const log = new Log(win, RETURNS_INFO);
      expect(log.level_).to.equal(LogLevel.INFO);

      log.fine('fine');
      log.info('info');
      log.warn('warn');
      log.error('error');

      expect(logSpy).to.have.callCount(3);
      expect(logSpy.args[0][1]).to.equal('[info]');
      expect(logSpy.args[1][1]).to.equal('[warn]');
      expect(logSpy.args[2][1]).to.equal('[error]');
      expect(timeoutSpy).to.have.not.been.called;
    });

    it('should log correctly for WARN', () => {
      const log = new Log(win, RETURNS_WARN);
      expect(log.level_).to.equal(LogLevel.WARN);

      log.fine('fine');
      log.info('info');
      log.warn('warn');
      log.error('error');

      expect(logSpy).to.have.callCount(2);
      expect(logSpy.args[0][1]).to.equal('[warn]');
      expect(logSpy.args[1][1]).to.equal('[error]');
      expect(timeoutSpy).to.have.not.been.called;
    });

    it('should log correctly for ERROR', () => {
      const log = new Log(win, RETURNS_ERROR);
      expect(log.level_).to.equal(LogLevel.ERROR);

      log.fine('fine');
      log.info('info');
      log.warn('warn');
      log.error('error');

      expect(logSpy).to.be.calledOnce;
      expect(logSpy.args[0][1]).to.equal('[error]');
      expect(timeoutSpy).to.have.not.been.called;
    });

    it('should report ERROR even when OFF and coallesce messages', () => {
      const log = new Log(win, RETURNS_OFF);
      expect(log.level_).to.equal(LogLevel.OFF);
      let reportedError;
      setReportError(function(e) {
        reportedError = e;
      });

      log.error('TAG', 'intended', new Error('test'));

      expect(reportedError).to.be.instanceof(Error);
      expect(reportedError.message).to.match(/intended\: test/);
      expect(reportedError.expected).to.be.undefined;
      expect(isUserErrorMessage(reportedError.message)).to.be.false;
    });

    it('should report ERROR and mark with expected flag', () => {
      const log = new Log(win, RETURNS_OFF);
      expect(log.level_).to.equal(LogLevel.OFF);
      let reportedError;
      setReportError(function(e) {
        reportedError = e;
      });

      log.expectedError('TAG', 'intended', new Error('test'));

      expect(reportedError).to.be.instanceof(Error);
      expect(reportedError.message).to.match(/intended\: test/);
      expect(reportedError.expected).to.be.true;
    });

    it('should report ERROR when OFF from a single message', () => {
      const log = new Log(win, RETURNS_OFF);
      expect(log.level_).to.equal(LogLevel.OFF);
      let reportedError;
      setReportError(function(e) {
        reportedError = e;
      });

      log.error('TAG', 'intended');

      expect(reportedError).to.be.instanceof(Error);
      expect(reportedError.message).to.match(/intended/);
      expect(isUserErrorMessage(reportedError.message)).to.be.false;
    });

    it('should report ERROR when OFF from a single error object', () => {
      const log = new Log(win, RETURNS_OFF);
      expect(log.level_).to.equal(LogLevel.OFF);
      let reportedError;
      setReportError(function(e) {
        reportedError = e;
      });

      log.error('TAG', new Error('test'));

      expect(reportedError).to.be.instanceof(Error);
      expect(reportedError.message).to.match(/test/);
      expect(isUserErrorMessage(reportedError.message)).to.be.false;
    });
  });

  describe('UserLog', () => {

    it('should be disabled by default', () => {
      expect(user().levelFunc_(mode)).to.equal(LogLevel.OFF);
    });

    it('should be enabled in development mode', () => {
      mode.development = true;
      expect(user().levelFunc_(mode)).to.equal(LogLevel.FINE);
    });

    it('should be enabled with log=1', () => {
      mode.log = '1';
      expect(user().levelFunc_(mode)).to.equal(LogLevel.FINE);
    });

    it('should be enabled with log>1', () => {
      mode.log = '2';
      expect(user().levelFunc_(mode)).to.equal(LogLevel.FINE);

      mode.log = '3';
      expect(user().levelFunc_(mode)).to.equal(LogLevel.FINE);

      mode.log = '4';
      expect(user().levelFunc_(mode)).to.equal(LogLevel.FINE);
    });

    it('should be configured with USER suffix', () => {
      expect(user().suffix_).to.equal(USER_ERROR_SENTINEL);
    });
  });

  describe('DevLog', () => {

    it('should be disabled by default', () => {
      expect(dev().levelFunc_(mode)).to.equal(LogLevel.OFF);
    });

    it('should NOT be enabled in development mode', () => {
      mode.development = true;
      expect(dev().levelFunc_(mode)).to.equal(LogLevel.OFF);
    });

    it('should NOT be enabled with log=1', () => {
      mode.log = '1';
      expect(dev().levelFunc_(mode)).to.equal(LogLevel.OFF);
    });

    it('should be enabled as INFO with log=2', () => {
      mode.log = '2';
      expect(dev().levelFunc_(mode)).to.equal(LogLevel.INFO);
    });

    it('should be enabled as FINE with log=3', () => {
      mode.log = '3';
      expect(dev().levelFunc_(mode)).to.equal(LogLevel.FINE);
    });

    it('should be configured with no suffix', () => {
      expect(dev().suffix_).to.equal('');
    });
  });

  describe('asserts', () => {

    let log;

    beforeEach(() => {
      log = new Log(win, RETURNS_FINE, USER_ERROR_SENTINEL);
    });

    it('should fail', () => {
      expect(function() {
        log.assert(false, 'xyz');
      }).to.throw(/xyz/);
      try {
        log.assert(false, '123');
      } catch (e) {
        expect(e.message).to.equal('123' + USER_ERROR_SENTINEL);
        return;
      }
      // Unreachable
      expect(false).to.be.true;
    });

    it('should not fail', () => {
      log.assert(true, 'True!');
      log.assert(1, '1');
      log.assert('abc', 'abc');
    });

    it('should substitute', () => {
      expect(function() {
        log.assert(false, 'should fail %s', 'XYZ');
      }).to.throw(/should fail XYZ/);
      expect(function() {
        log.assert(false, 'should fail %s %s', 'XYZ', 'YYY');
      }).to.throw(/should fail XYZ YYY/);
      const div = document.createElement('div');
      div.id = 'abc';
      div.textContent = 'foo';
      expect(function() {
        log.assert(false, 'should fail %s', div);
      }).to.throw(/should fail div#abc/);

      let error;
      try {
        log.assert(false, '%s a %s b %s', 1, 2, 3);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.instanceof(Error);
      expect(error.message).to.equal('1 a 2 b 3' + USER_ERROR_SENTINEL);
      expect(error.messageArray).to.deep.equal([1, 'a', 2, 'b', 3]);
    });

    it('should add element and assert info', () => {
      const div = document.createElement('div');
      let error;
      try {
        log.assert(false, '%s a %s b %s', div, 2, 3);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.instanceof(Error);
      expect(error.associatedElement).to.equal(div);
      expect(error.fromAssert).to.equal(true);
    });

    it('should recognize asserts', () => {
      try {
        log.assert(false, '123');
      } catch (e) {
        expect(isUserErrorMessage(e.message)).to.be.true;
        return;
      }
      // Unreachable
      expect(false).to.be.true;
    });

    it('should recognize non-asserts', () => {
      try {
        throw new Error('123');
      } catch (e) {
        expect(isUserErrorMessage(e.message)).to.be.false;
        return;
      }
      // Unreachable
      expect(false).to.be.true;
    });

    it('should create expected error from message', () => {
      const error = log.createExpectedError('test');
      expect(error).to.be.instanceof(Error);
      expect(error.expected).to.be.true;
    });

    it('should create suffixed errors from message', () => {
      const error = log.createError('test');
      expect(error.expected).to.be.undefined;
      expect(error).to.be.instanceof(Error);
      expect(isUserErrorMessage(error.message)).to.be.true;
      expect(error.message).to.equal('test' + USER_ERROR_SENTINEL);
    });

    it('should create suffixed errors from error', () => {
      const error = log.createError(new Error('test'));
      expect(error).to.be.instanceof(Error);
      expect(isUserErrorMessage(error.message)).to.be.true;
      expect(error.message).to.equal('test' + USER_ERROR_SENTINEL);
    });

    it('should only add suffix once', () => {
      const error = log.createError(new Error('test' + USER_ERROR_SENTINEL));
      expect(error).to.be.instanceof(Error);
      expect(isUserErrorMessage(error.message)).to.be.true;
      expect(error.message).to.equal('test' + USER_ERROR_SENTINEL);
    });

    it('should strip suffix if not available', () => {
      const error = log.createError(new Error('test'));
      expect(isUserErrorMessage(error.message)).to.be.true;

      const noSuffixLog = new Log(win, RETURNS_FINE);
      noSuffixLog.createError(error);
      expect(isUserErrorMessage(error.message)).to.be.false;
    });

    it('should create other-suffixed errors', () => {
      log = new Log(win, RETURNS_FINE, '-other');
      const error = log.createError('test');
      expect(error).to.be.instanceof(Error);
      expect(isUserErrorMessage(error.message)).to.be.false;
      expect(error.message).to.equal('test-other');
    });

    it('should pass for elements', () => {
      log.assertElement(document.documentElement);
      const element = document.createElement('element');
      const ret = log.assertElement(element);
      expect(ret).to.equal(element);
    });

    it('should should identify non-elements', () => {
      expect(() => {
        log.assertElement(document);
      }).to.throw(/Element expected: /);
      expect(() => {
        log.assertElement(null);
      }).to.throw(/Element expected: null/);
      expect(() => {
        log.assertElement(null, 'custom error');
      }).to.throw(/custom error: null/);
    });
  });

  describe('assertString', () => {
    let log;

    beforeEach(() => {
      log = new Log(win, RETURNS_FINE);
    });

    it('should return non-empty string', () => {
      expect(log.assertString('a')).to.equal('a');
    });

    it('should return empty string', () => {
      expect(log.assertString('')).to.equal('');
    });

    it('should fail with on non string', () => {
      expect(() => log.assertString({}))
          .to.throw('String expected: ');
      expect(() => log.assertString(3))
          .to.throw('String expected: ');
      expect(() => log.assertString(null))
          .to.throw('String expected: ');
      expect(() => log.assertString(undefined))
          .to.throw('String expected: ');
      expect(() => log.assertString([]))
          .to.throw('String expected: ');
    });
  });

  describe('assertNumber', () => {
    let log;

    beforeEach(() => {
      log = new Log(win, RETURNS_FINE);
    });

    it('should return the number value', () => {
      expect(log.assertNumber(3)).to.equal(3);
    });

    it('should return zero', () => {
      expect(log.assertNumber(0)).to.equal(0);
    });

    it('should return NaN', () => {
      expect(log.assertNumber(NaN)).to.be.NaN;
    });

    it('should fail with on non number', () => {
      expect(() => log.assertNumber({}))
          .to.throw('Number expected: ');
      expect(() => log.assertNumber('a'))
          .to.throw('Number expected: ');
      expect(() => log.assertNumber(null))
          .to.throw('Number expected: ');
      expect(() => log.assertNumber(undefined))
          .to.throw('Number expected: ');
      expect(() => log.assertNumber([]))
          .to.throw('Number expected: ');
    });
  });

  describe('assertEnumValue', () => {

    let log;

    beforeEach(() => {
      log = new Log(win, RETURNS_FINE);
    });

    it('should return the enum value', () => {
      const enum1 = {a: 'value1', b: 'value2'};
      expect(log.assertEnumValue(enum1, 'value1')).to.equal('value1');
      expect(log.assertEnumValue(enum1, 'value2')).to.equal('value2');
    });

    it('should fail with unknown enum value', () => {
      const enum1 = {a: 'value1', b: 'value2'};
      expect(() => log.assertEnumValue(enum1, 'value3'))
          .to.throw('Unknown enum value: "value3"');
      expect(() => log.assertEnumValue(enum1, 'value3', 'MyEnum'))
          .to.throw('Unknown MyEnum value: "value3"');
    });

    it('should fail with values of different case', () => {
      const enum1 = {a: 'value1', b: 'value2'};
      expect(() => log.assertEnumValue(enum1, 'VALUE1'))
          .to.throw('Unknown enum value: "VALUE1"');
    });
  });

  describe('error', () => {
    let log;
    let reportedError;

    beforeEach(function() {
      log = new Log(win, RETURNS_OFF);
      setReportError(function(e) {
        reportedError = e;
      });
    });

    it('reuse errors', () => {
      let error = new Error('test');

      log.error('TAG', error);
      expect(reportedError).to.equal(error);
      expect(error.message).to.equal('test');

      log.error('TAG', 'should fail', 'XYZ', error);
      expect(reportedError).to.equal(error);
      expect(error.message).to.equal('should fail XYZ: test');

      // #8917
      try {
        // This is an intentionally bad query selector
        document.body.querySelector('#');
      } catch (e) {
        error = e;
      }

      log.error('TAG', error);
      expect(reportedError).not.to.equal(error);
      expect(reportedError.message).to.equal(error.message);

      log.error('TAG', 'should fail', 'XYZ', error);
      expect(reportedError).not.to.equal(error);
      expect(reportedError.message).to.contain('should fail XYZ:');
    });
  });

  describe('rethrowAsync', () => {
    let clock;

    beforeEach(() => {
      clock = sandbox.useFakeTimers();
    });

    it('should rethrow error with single message', () => {
      rethrowAsync('intended');
      expect(() => {
        clock.tick(1);
      }).to.throw(Error, /^intended/);
    });

    it('should rethrow a single error', () => {
      const orig = new Error('intended');
      rethrowAsync(orig);
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error).to.equal(orig);
      expect(error.message).to.match(/^intended/);
    });

    it('should rethrow error with many messages', () => {
      rethrowAsync('first', 'second', 'third');
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error.message).to.match(/^first second third/);
    });

    it('should rethrow error with original error and messages', () => {
      const orig = new Error('intended');
      rethrowAsync('first', orig, 'second', 'third');
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error).to.equal(orig);
      expect(error.message).to.match(/^first second third: intended/);
    });

    it('should preserve error suffix', () => {
      const orig = user().createError('intended');
      expect(isUserErrorMessage(orig.message)).to.be.true;
      rethrowAsync('first', orig, 'second');
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error).to.equal(orig);
      expect(isUserErrorMessage(error.message)).to.be.true;
    });
  });

  describe('duplicateErrorIfNecessary', () => {
    it('should not duplicate if message is writeable', () => {
      const error = {message: 'test'};

      expect(duplicateErrorIfNecessary(error)).to.equal(error);
    });

    it('should duplicate if message is non-writable', () => {
      const error = {};
      Object.defineProperty(error, 'message', {
        value: 'test',
        writable: false,
      });

      expect(duplicateErrorIfNecessary(error)).to.not.equal(error);
    });

    it('copies all the tidbits', () => {
      const error = {
        stack: 'stack',
        args: [1, 2, 3],
        associatedElement: error,
      };

      Object.defineProperty(error, 'message', {
        value: 'test',
        writable: false,
      });

      const duplicate = duplicateErrorIfNecessary(error);
      expect(duplicate.stack).to.equal(error.stack);
      expect(duplicate.args).to.equal(error.args);
      expect(duplicate.associatedElement).to.equal(error.associatedElement);
    });
  });
});

