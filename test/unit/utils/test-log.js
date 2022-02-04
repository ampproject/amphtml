import {
  USER_ERROR_SENTINEL,
  isUserErrorEmbedMessage,
  isUserErrorMessage,
} from '#core/error/message-helpers';

import {
  Log,
  LogLevel_Enum,
  dev,
  devAssert,
  setReportError,
  user,
  userAssert,
} from '#utils/log';

describes.sandboxed('Logging', {}, (env) => {
  const RETURNS_FINE = () => LogLevel_Enum.FINE;
  const RETURNS_INFO = () => LogLevel_Enum.INFO;
  const RETURNS_WARN = () => LogLevel_Enum.WARN;
  const RETURNS_ERROR = () => LogLevel_Enum.ERROR;
  const RETURNS_OFF = () => LogLevel_Enum.OFF;

  let mode;
  let win;
  let logSpy;
  let timeoutSpy;

  beforeEach(() => {
    mode = {};
    window.__AMP_MODE = mode;

    logSpy = env.sandbox.spy();
    timeoutSpy = env.sandbox.spy();
    win = {
      console: {
        log: logSpy,
      },
      location: {hash: ''},
      setTimeout: timeoutSpy,
      __AMP_REPORT_ERROR: (error) => error,
    };
    env.sandbox.stub(self, '__AMP_REPORT_ERROR').callsFake((error) => error);
  });

  afterEach(() => {
    window.__AMP_MODE = undefined;
    delete window.__AMP_LOG.user;
    delete window.__AMP_LOG.dev;
  });

  describe('Level', () => {
    it('should be enabled when directly allowed', () => {
      expect(new Log(win, RETURNS_FINE).level_).to.equal(LogLevel_Enum.FINE);
    });

    it('should be disabled when directly disallowed', () => {
      expect(new Log(win, RETURNS_OFF).level_).to.equal(LogLevel_Enum.OFF);
    });

    it('should be disabled with no console', () => {
      win.console.log = null;
      expect(new Log(win, RETURNS_FINE).level_).to.equal(LogLevel_Enum.OFF);

      win.console = null;
      expect(new Log(win, RETURNS_FINE).level_).to.equal(LogLevel_Enum.OFF);
    });

    it('should be disabled with hash param log=0', () => {
      win.location.hash = '#log=0';
      expect(new Log(win, RETURNS_FINE).level_).to.equal(LogLevel_Enum.OFF);
    });

    it('should be enabled when forced for tests', () => {
      mode.test = true;
      win.ENABLE_LOG = true;
      expect(new Log(win, RETURNS_OFF).level_).to.equal(LogLevel_Enum.FINE);
    });

    it('should be enabled as INFO when forced for localDev', () => {
      mode.localDev = true;
      expect(new Log(win, RETURNS_OFF).level_).to.equal(LogLevel_Enum.INFO);
    });
  });

  describe('Level messages', () => {
    it('should log correctly for FINE', () => {
      const log = new Log(win, RETURNS_FINE);
      expect(log.level_).to.equal(LogLevel_Enum.FINE);

      log.fine('test-log', 'fine');
      log.info('test-log', 'info');
      log.warn('test-log', 'warn');
      log.error('test-log', 'error');

      expect(logSpy).to.have.callCount(4);
      expect(logSpy.getCall(0)).to.be.calledWith('[test-log] fine');
      expect(logSpy.getCall(1)).to.be.calledWith('[test-log] info');
      expect(logSpy.getCall(2)).to.be.calledWith('[test-log] warn');
      expect(logSpy.getCall(3)).to.be.calledWith('[test-log] error');
      expect(timeoutSpy).to.have.not.been.called;
    });

    it('should log correctly for INFO', () => {
      const log = new Log(win, RETURNS_INFO);
      expect(log.level_).to.equal(LogLevel_Enum.INFO);

      log.fine('test-log', 'fine');
      log.info('test-log', 'info');
      log.warn('test-log', 'warn');
      log.error('test-log', 'error');

      expect(logSpy).to.have.callCount(3);
      expect(logSpy.getCall(0)).to.be.calledWith('[test-log] info');
      expect(logSpy.getCall(1)).to.be.calledWith('[test-log] warn');
      expect(logSpy.getCall(2)).to.be.calledWith('[test-log] error');
      expect(timeoutSpy).to.have.not.been.called;
    });

    it('should log correctly for WARN', () => {
      const log = new Log(win, RETURNS_WARN);
      expect(log.level_).to.equal(LogLevel_Enum.WARN);

      log.fine('test-log', 'fine');
      log.info('test-log', 'info');
      log.warn('test-log', 'warn');
      log.error('test-log', 'error');

      expect(logSpy).to.have.callCount(2);
      expect(logSpy.getCall(0)).to.be.calledWith('[test-log] warn');
      expect(logSpy.getCall(1)).to.be.calledWith('[test-log] error');
      expect(timeoutSpy).to.have.not.been.called;
    });

    it('should log correctly for ERROR', () => {
      const log = new Log(win, RETURNS_ERROR);
      expect(log.level_).to.equal(LogLevel_Enum.ERROR);

      log.fine('test-log', 'fine');
      log.info('test-log', 'info');
      log.warn('test-log', 'warn');
      log.error('test-log', 'error');

      expect(logSpy).to.be.calledOnce;
      expect(logSpy).to.be.calledWith('[test-log] error');
      expect(timeoutSpy).to.have.not.been.called;
    });

    it('should report ERROR even when OFF and coallesce messages', () => {
      const log = new Log(win, RETURNS_OFF);
      expect(log.level_).to.equal(LogLevel_Enum.OFF);
      let reportedError;
      setReportError(function (e) {
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
      expect(log.level_).to.equal(LogLevel_Enum.OFF);
      let reportedError;
      setReportError(function (e) {
        reportedError = e;
      });

      log.expectedError('TAG', 'intended', new Error('test'));

      expect(reportedError).to.be.instanceof(Error);
      expect(reportedError.message).to.match(/intended\: test/);
      expect(reportedError.expected).to.be.true;
    });

    it('should report ERROR when OFF from a single message', () => {
      const log = new Log(win, RETURNS_OFF);
      expect(log.level_).to.equal(LogLevel_Enum.OFF);
      let reportedError;
      setReportError(function (e) {
        reportedError = e;
      });

      log.error('TAG', 'intended');

      expect(reportedError).to.be.instanceof(Error);
      expect(reportedError.message).to.match(/intended/);
      expect(isUserErrorMessage(reportedError.message)).to.be.false;
    });

    it('should report ERROR when OFF from a single error object', () => {
      const log = new Log(win, RETURNS_OFF);
      expect(log.level_).to.equal(LogLevel_Enum.OFF);
      let reportedError;
      setReportError(function (e) {
        reportedError = e;
      });

      log.error('TAG', new Error('test'));

      expect(reportedError).to.be.instanceof(Error);
      expect(reportedError.message).to.match(/test/);
      expect(isUserErrorMessage(reportedError.message)).to.be.false;
    });
  });

  describe('UserLog', () => {
    it('should be WARN by default', () => {
      expect(user().defaultLevelWithFunc_()).to.equal(LogLevel_Enum.WARN);
    });

    it('should be enabled in development mode', () => {
      mode.development = true;
      expect(user().defaultLevelWithFunc_()).to.equal(LogLevel_Enum.FINE);
    });

    it('should be enabled with log=1', () => {
      win.location.hash = '#log=1';
      expect(user().defaultLevelWithFunc_(win)).to.equal(LogLevel_Enum.FINE);
    });

    it('should be enabled with log>1', () => {
      win.location.hash = '#log=2';
      expect(user().defaultLevelWithFunc_(win)).to.equal(LogLevel_Enum.FINE);

      win.location.hash = '#log=3';
      expect(user().defaultLevelWithFunc_(win)).to.equal(LogLevel_Enum.FINE);

      win.location.hash = '#log=4';
      expect(user().defaultLevelWithFunc_(win)).to.equal(LogLevel_Enum.FINE);
    });

    it('should be configured with USER suffix', () => {
      expect(user().suffix_).to.equal(USER_ERROR_SENTINEL);
    });
  });

  describe('DevLog', () => {
    it('should be disabled by default', () => {
      expect(dev().defaultLevelWithFunc_()).to.equal(LogLevel_Enum.OFF);
    });

    it('should NOT be enabled in development mode', () => {
      mode.development = true;
      expect(dev().defaultLevelWithFunc_()).to.equal(LogLevel_Enum.OFF);
    });

    it('should NOT be enabled with log=1', () => {
      win.location.hash = '#log=1';
      expect(dev().defaultLevelWithFunc_(win)).to.equal(LogLevel_Enum.OFF);
    });

    it('should be enabled as INFO with log=2', () => {
      win.location.hash = '#log=2';
      expect(dev().defaultLevelWithFunc_(win)).to.equal(LogLevel_Enum.INFO);
    });

    it('should be enabled as FINE with log=3', () => {
      win.location.hash = '#log=3';
      expect(dev().defaultLevelWithFunc_(win)).to.equal(LogLevel_Enum.FINE);
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
      expect(function () {
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

    it('should not fail direct dev', () => {
      devAssert(true, 'True!');
      devAssert(1, '1');
      devAssert('abc', 'abc');
    });

    it('should not fail direct user', () => {
      userAssert(true, 'True!');
      userAssert(1, '1');
      userAssert('abc', 'abc');
    });

    it('should fail direct dev', () => {
      expect(function () {
        devAssert(false, 'xyz');
      }).to.throw(/xyz/);
      try {
        devAssert(false, '123');
      } catch (e) {
        expect(e.message).to.equal('123');
        return;
      }
      // Unreachable
      expect(false).to.be.true;
    });

    it('should fail direct user', () => {
      expect(function () {
        userAssert(false, 'xyz');
      }).to.throw(/xyz/);
      try {
        userAssert(false, '123');
      } catch (e) {
        expect(e.message).to.equal('123' + USER_ERROR_SENTINEL);
        return;
      }
      // Unreachable
      expect(false).to.be.true;
    });

    it('should substitute', () => {
      expect(function () {
        log.assert(false, 'should fail %s', 'XYZ');
      }).to.throw(/should fail XYZ/);
      expect(function () {
        log.assert(false, 'should fail %s %s', 'XYZ', 'YYY');
      }).to.throw(/should fail XYZ YYY/);
      const div = document.createElement('div');
      div.id = 'abc';
      div.textContent = 'foo';
      expect(function () {
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
      expect(error.messageArray).to.deep.equal([
        1,
        'a',
        2,
        'b',
        3,
        USER_ERROR_SENTINEL,
      ]);
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
      expect(error.messageArray[0]).to.equal(div);
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
      expect(() => log.assertString({})).to.throw('String expected: ');
      expect(() => log.assertString(3)).to.throw('String expected: ');
      expect(() => log.assertString(null)).to.throw('String expected: ');
      expect(() => log.assertString(undefined)).to.throw('String expected: ');
      expect(() => log.assertString([])).to.throw('String expected: ');
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
      expect(() => log.assertNumber({})).to.throw('Number expected: ');
      expect(() => log.assertNumber('a')).to.throw('Number expected: ');
      expect(() => log.assertNumber(null)).to.throw('Number expected: ');
      expect(() => log.assertNumber(undefined)).to.throw('Number expected: ');
      expect(() => log.assertNumber([])).to.throw('Number expected: ');
    });
  });

  describe('assertArray', () => {
    let log;

    beforeEach(() => {
      log = new Log(win, RETURNS_FINE);
    });

    it('should return the array value', () => {
      const array = [1, 2, 3];
      expect(log.assertArray(array)).to.equal(array);
    });

    it('should return empty array', () => {
      expect(log.assertArray([])).to.deep.equal([]);
    });

    it('should fail with non-array values', () => {
      expect(() => log.assertArray('a')).to.throw('Array expected: a');
      expect(() => log.assertArray(1)).to.throw('Array expected: 1');
    });
  });

  describe('error', () => {
    let log;
    let reportedError;

    beforeEach(function () {
      log = new Log(win, RETURNS_OFF);
      setReportError(function (e) {
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

  describe('embed error', () => {
    let iframe;
    let element;
    let element1;
    let element2;

    beforeEach(() => {
      iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
    });

    afterEach(() => {
      document.body.removeChild(iframe);
    });

    it('should return logger for user-error', () => {
      const error = user().createError();
      expect(isUserErrorEmbedMessage(error.message)).to.be.false;
      expect(isUserErrorMessage(error.message)).to.be.true;
    });

    it('should return logger for embed-error', () => {
      element = document.createElement('embed');
      iframe.contentWindow.document.body.appendChild(element);
      const error = user(element).createError();
      expect(isUserErrorEmbedMessage(error.message)).to.be.true;
    });

    it('should not create extra identical loggers', () => {
      element = document.createElement('embed');
      element1 = document.createElement('embed_1');
      element2 = document.createElement('embed_2');
      iframe.contentWindow.document.body.appendChild(element1);
      iframe.contentWindow.document.body.appendChild(element2);
      expect(user()).to.equal(user(element));
      expect(user(element1)).to.equal(user(element2));
      expect(user()).to.not.equal(user(element1));
    });
  });

  describe('expandMessageArgs with URL', () => {
    const prefixRe = 'https:\\/\\/log\\.amp\\.dev\\/\\?v=[^&]+&';
    let log;

    beforeEach(() => {
      log = new Log(win, RETURNS_FINE);
    });

    it('returns url without args', () => {
      const id = 'foo';
      const queryRe = `id=${id}`;
      const expectedRe = new RegExp(`${prefixRe}${queryRe}$`);
      const messageArgs = log.expandMessageArgs_([id]);
      expect(messageArgs).to.have.lengthOf(1);
      const message = messageArgs[0];
      expect(expectedRe.test(message), `${expectedRe}.test('${message}')`).to.be
        .true;
    });

    it('returns url with one arg', () => {
      const id = 'foo';
      const arg1 = 'bar';
      const queryRe = `id=${id}&s\\[\\]=${arg1}`;
      const expectedRe = new RegExp(`${prefixRe}${queryRe}$`);
      const messageArgs = log.expandMessageArgs_([id, arg1]);
      expect(messageArgs).to.have.lengthOf(1);
      const message = messageArgs[0];
      expect(expectedRe.test(message), `${expectedRe}.test('${message}')`).to.be
        .true;
    });

    it('returns url with many args', () => {
      const id = 'foo';
      const arg1 = 'bar';
      const arg2 = 'baz';
      const arg3 = 'taquitos';
      const queryRe = `id=${id}&s\\[\\]=${arg1}&s\\[\\]=${arg2}&s\\[\\]=${arg3}`;
      const expectedRe = new RegExp(`${prefixRe}${queryRe}$`);
      const messageArgs = log.expandMessageArgs_([id, arg1, arg2, arg3]);
      expect(messageArgs).to.have.lengthOf(1);
      const message = messageArgs[0];
      expect(expectedRe.test(message), `${expectedRe}.test('${message}')`).to.be
        .true;
    });
  });

  describe('Extracted messages by ids', () => {
    let log;

    // Promise.resolve would be nicer, but it won't resolve sync'ly.
    const syncResolve = (v) => ({then: (cb) => cb(v)});

    function mockExternalMessages(messageTemplates) {
      win.fetch = () =>
        syncResolve({json: () => syncResolve(messageTemplates)});

      log.fetchExternalMessagesOnce_();
    }

    beforeEach(() => {
      log = new Log(win, RETURNS_FINE);
    });

    it('displays URL for assertString without messages', () => {
      mockExternalMessages(null);
      const notString = false;
      expect(() => log.assertString(notString, ['a'])).to.throw(
        /\?v=.+&id=a&s\[\]=false$/
      );
    });

    it('expands message from table for assertString', () => {
      mockExternalMessages({
        'a': 'Foo: %s',
        'foo': 'irrelevant',
      });
      const notString = false;
      expect(() => log.assertString(notString, ['a'])).to.throw(/Foo: false/);
    });

    it('displays URL for assertNumber without messages', () => {
      mockExternalMessages(null);
      const notNumber = false;
      expect(() => log.assertNumber(notNumber, ['x'])).to.throw(
        /\?v=.+&id=x&s\[\]=false$/
      );
    });

    it('expands message from table for assertNumber', () => {
      mockExternalMessages({
        'b': '%s Mundo',
        'baz': 'tacos',
      });
      const notNumber = 'Hola';
      expect(() => log.assertNumber(notNumber, ['b'])).to.throw(/Hola Mundo/);
    });

    it('displays URL for assertArray without messages', () => {
      mockExternalMessages(null);
      const notArray = 'xxx';
      expect(() => log.assertArray(notArray, ['zzz'])).to.throw(
        /\?v=.+&id=zzz&s\[\]=xxx$/
      );
    });

    it('expands message from table for assertArray', () => {
      mockExternalMessages({
        'x': 'sas%s',
        'baz': 'tacos',
      });
      const notArray = 'quatch';
      expect(() => log.assertArray(notArray, ['x'])).to.throw(/sasquatch/);
    });

    it('displays URL for assertBoolean without messages', () => {
      mockExternalMessages(null);
      const notBoolean = 'bar';
      expect(() => log.assertBoolean(notBoolean, ['lol'])).to.throw(
        /\?v=.+&id=lol&s\[\]=bar$/
      );
    });

    it('expands message from table for assertBoolean', () => {
      mockExternalMessages({
        'foo': '%s',
        'baz': 'tacos',
      });
      const notBoolean = 'bar';
      expect(() => log.assertBoolean(notBoolean, ['x'])).to.throw(/bar/);
    });
  });
});
