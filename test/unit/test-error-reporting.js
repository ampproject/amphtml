import {resetExperimentTogglesForTesting, toggleExperiment} from '#experiments';

import {Services} from '#service';

import * as analytics from '#utils/analytics';
import {user, userAssert} from '#utils/log';

import {
  blockedByConsentError,
  cancellation,
  detectNonAmpJs,
  errorReportingDataForViewer,
  getErrorReportData,
  installErrorReporting,
  isCancellation,
  reportError,
  reportErrorToAnalytics,
  reportErrorToServerOrViewer,
} from '../../src/error-reporting';
import {getRtvVersionForTesting} from '../../src/mode';

describes.fakeWin('installErrorReporting', {}, (env) => {
  let win;
  let rejectedPromiseError;
  let rejectedPromiseEvent;
  let rejectedPromiseEventCancelledSpy;

  beforeEach(() => {
    win = env.win;
    installErrorReporting(win);
    rejectedPromiseEventCancelledSpy = env.sandbox.spy();
    rejectedPromiseError = new Error('error reason');
    rejectedPromiseEvent = {
      type: 'unhandledrejection',
      reason: rejectedPromiseError,
      preventDefault: rejectedPromiseEventCancelledSpy,
    };
  });

  it('should install window.onerror handler', () => {
    expect(win.onerror).to.not.be.null;
  });

  it('should install unhandledrejection handler', () => {
    expect(win.eventListeners.count('unhandledrejection')).to.equal(1);
  });

  it('should report the normal promise rejection', () => {
    expectAsyncConsoleError(/error reason/);
    win.eventListeners.fire(rejectedPromiseEvent);
    expect(rejectedPromiseError.reported).to.be.true;
    expect(rejectedPromiseEventCancelledSpy).to.not.be.called;
  });

  it('should allow null errors', () => {
    expectAsyncConsoleError(/rejected promise/);
    rejectedPromiseEvent.reason = null;
    win.eventListeners.fire(rejectedPromiseEvent);
    expect(rejectedPromiseEventCancelledSpy).to.not.be.called;
  });

  it('should allow string errors', () => {
    expectAsyncConsoleError(/string error/);
    rejectedPromiseEvent.reason = 'string error';
    win.eventListeners.fire(rejectedPromiseEvent);
    expect(rejectedPromiseEventCancelledSpy).to.not.be.called;
  });

  it('should ignore cancellation', () => {
    rejectedPromiseEvent.reason = rejectedPromiseError = cancellation();
    win.eventListeners.fire(rejectedPromiseEvent);
    expect(rejectedPromiseError.reported).to.be.not.be.ok;
    expect(rejectedPromiseEventCancelledSpy).to.be.calledOnce;
  });

  it('should ignore blockByConsent', () => {
    rejectedPromiseEvent.reason = rejectedPromiseError =
      blockedByConsentError();
    win.eventListeners.fire(rejectedPromiseEvent);
    expect(rejectedPromiseError.reported).to.be.not.be.ok;
    expect(rejectedPromiseEventCancelledSpy).to.be.calledOnce;
  });
});

describes.sandboxed('reportErrorToServerOrViewer', {}, (env) => {
  let win;
  let viewer;
  let ampdocServiceForStub;
  let sendMessageStub;
  let createXhr;

  const data = getErrorReportData(
    undefined,
    undefined,
    undefined,
    undefined,
    new Error('XYZ', false)
  );

  beforeEach(() => {
    const optedInDoc = window.document.implementation.createHTMLDocument('');
    optedInDoc.documentElement.setAttribute('report-errors-to-viewer', '');

    ampdocServiceForStub = env.sandbox.stub(Services, 'ampdocServiceFor');
    const ampdoc = {getRootNode: () => optedInDoc};
    ampdocServiceForStub.returns({
      isSingleDoc: () => true,
      getAmpDoc: () => ampdoc,
      getSingleDoc: () => ampdoc,
    });

    viewer = {
      hasCapability: () => true,
      isTrustedViewer: () => Promise.resolve(true),
      sendMessage: () => true,
    };
    sendMessageStub = env.sandbox.stub(viewer, 'sendMessage');

    env.sandbox.stub(Services, 'viewerForDoc').returns(viewer);

    createXhr = env.sandbox.spy(XMLHttpRequest.prototype, 'open');
  });

  it('should report to server if AMP doc is not single', () => {
    ampdocServiceForStub.returns({isSingleDoc: () => false});
    return reportErrorToServerOrViewer(win, data).then(() => {
      expect(createXhr).to.be.calledOnce;
      expect(sendMessageStub).to.not.have.been.called;
    });
  });

  it('should report to server if AMP doc is not opted in', () => {
    const nonOptedInDoc = window.document.implementation.createHTMLDocument('');
    const ampdoc = {getRootNode: () => nonOptedInDoc};
    ampdocServiceForStub.returns({
      isSingleDoc: () => true,
      getAmpDoc: () => ampdoc,
      getSingleDoc: () => ampdoc,
    });
    return reportErrorToServerOrViewer(win, data).then(() => {
      expect(createXhr).to.be.calledOnce;
      expect(sendMessageStub).to.not.have.been.called;
    });
  });

  it('should report to server if viewer is not capable', () => {
    env.sandbox
      .stub(viewer, 'hasCapability')
      .withArgs('errorReporting')
      .returns(false);
    return reportErrorToServerOrViewer(win, data).then(() => {
      expect(createXhr).to.be.calledOnce;
      expect(sendMessageStub).to.not.have.been.called;
    });
  });

  it('should report to server if viewer is not trusted', () => {
    env.sandbox.stub(viewer, 'isTrustedViewer').returns(Promise.resolve(false));
    return reportErrorToServerOrViewer(win, data).then(() => {
      expect(createXhr).to.be.calledOnce;
      expect(sendMessageStub).to.not.have.been.called;
    });
  });

  it(
    'should report to viewer with message named `error` with stripped down ' +
      'error data set',
    () => {
      return reportErrorToServerOrViewer(win, data).then(() => {
        expect(createXhr).to.not.have.been.called;
        expect(sendMessageStub).to.have.been.calledWith(
          'error',
          errorReportingDataForViewer(data)
        );
        expect(data['m']).to.not.be.undefined;
        expect(data['a']).to.not.be.undefined;
        expect(data['s']).to.not.be.undefined;
        expect(data['el']).to.not.be.undefined;
        expect(data['ex']).to.not.be.undefined;
        expect(data['v']).to.not.be.undefined;
      });
    }
  );
});

describes.sandboxed('getErrorReportData', {}, (env) => {
  let onError;
  let nextRandomNumber;

  beforeEach(() => {
    onError = window.onerror;
    nextRandomNumber = 0;
    env.sandbox.stub(Math, 'random').callsFake(() => nextRandomNumber);
    self.__AMP_MODE = undefined;
  });

  afterEach(() => {
    window.onerror = onError;
    window.viewerState = undefined;
    resetExperimentTogglesForTesting(window);
  });

  it('reportError with error object', function SHOULD_BE_IN_STACK() {
    const e = new Error('XYZ');
    if (!e.stack || e.stack.indexOf('SHOULD_BE_IN_STACK') == -1) {
      e.stack = 'SHOULD_BE_IN_STACK';
    }
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e,
      true
    );
    expect(data.m).to.equal('XYZ');
    expect(data.el).to.equal('u');
    expect(data.a).to.equal('0');
    expect(data.s).to.contain('SHOULD_BE_IN_STACK');
    expect(data['3p']).to.equal(undefined);
    expect(e.message).to.contain('_reported_');
    if (location.ancestorOrigins) {
      expect(data.or).to.contain('http://localhost');
    }
    expect(data.vs).to.be.undefined;
    expect(data.ae).to.equal('');
    expect(data.r).to.contain('http://localhost');
    expect(data.noAmp).to.equal('1');
    expect(data.args).to.be.undefined;
    expect(data.cdn).to.equal('https://cdn.ampproject.org');
  });

  it('reportError with error and ignore stack', () => {
    const e = new Error('XYZ');
    e.ignoreStack = true;
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e,
      true
    );
    expect(data.m).to.equal('XYZ');
    expect(data.el).to.equal('u');
    expect(data.a).to.equal('0');
    expect(data['3p']).to.equal(undefined);
    expect(e.message).to.contain('_reported_');
  });

  it('reportError with error object w/args', () => {
    const e = new Error('XYZ');
    e.args = {x: 1};
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e,
      true
    );
    expect(data.args).to.equal(JSON.stringify({x: 1}));
  });

  it('reportError with a string instead of error', () => {
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      'string error',
      true
    );
    expect(data.m).to.equal('string error');
  });

  it('reportError with no error', () => {
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(data.m).to.equal('Unknown error');
  });

  it('reportError with associatedElement', () => {
    const e = new Error('XYZ');
    const el = document.createElement('foo-bar');
    e.associatedElement = el;
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e,
      false
    );
    expect(data.m).to.equal('XYZ');
    expect(data.el).to.equal('FOO-BAR');
    expect(data.a).to.equal('0');
    expect(data.v).to.equal(getRtvVersionForTesting(window));
    expect(data.noAmp).to.equal('0');
  });

  it('reportError mark asserts', () => {
    let e = '';
    allowConsoleError(() => {
      try {
        userAssert(false, 'XYZ');
      } catch (error) {
        e = error;
      }
    });
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data.m).to.equal('XYZ');
    expect(data.a).to.equal('1');
    expect(data.v).to.equal(getRtvVersionForTesting(window));
  });

  it('reportError mark asserts without error object', () => {
    let e = '';
    allowConsoleError(() => {
      try {
        userAssert(false, 'XYZ');
      } catch (error) {
        e = error;
      }
    });
    const data = getErrorReportData(e.message, undefined, undefined, undefined);
    expect(data.m).to.equal('XYZ');
    expect(data.a).to.equal('1');
    expect(data.v).to.equal(getRtvVersionForTesting(window));
  });

  it('reportError marks 3p', () => {
    window.context = {
      location: {},
    };
    const e = new Error('XYZ');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data.m).to.equal('XYZ');
    expect(data['3p']).to.equal('1');
  });

  it('reportError marks canary and viewerState', () => {
    window.viewerState = 'some-state';
    window.AMP_CONFIG = {
      canary: true,
    };
    const e = new Error('XYZ');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data.m).to.equal('XYZ');
    expect(data['ca']).to.equal('1');
    expect(data['vs']).to.equal('some-state');
  });

  it('reportError marks binary type', () => {
    window.AMP_CONFIG = {
      type: 'experimental',
    };
    const e = new Error('XYZ');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data.m).to.equal('XYZ');
    expect(data['bt']).to.equal('experimental');

    window.AMP_CONFIG = {
      type: 'control',
    };
    const e1 = new Error('XYZ');
    const data1 = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e1
    );
    expect(data1.m).to.equal('XYZ');
    expect(data1['bt']).to.equal('control');

    window.AMP_CONFIG = {};
    const e2 = new Error('ABC');
    const data2 = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e2
    );
    expect(data2.m).to.equal('ABC');
    expect(data2['bt']).to.equal('unknown');
  });

  it('reportError without error object', () => {
    const data = getErrorReportData('foo bar', 'foo.js', '11', '22', undefined);
    expect(data.m).to.equal('foo bar');
    expect(data.f).to.equal('foo.js');
    expect(data.l).to.equal('11');
    expect(data.c).to.equal('22');
  });

  it('should accumulate errors', () => {
    getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      new Error('1'),
      true
    );
    getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      new Error('2'),
      true
    );
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      new Error('3'),
      true
    );
    expect(data.m).to.equal('3');
    expect(data.ae).to.equal('1,2');
  });

  it('should not double report', () => {
    const e = new Error('something _reported_');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data).to.be.undefined;
  });

  it('should construct cancellation', () => {
    const e = cancellation();
    expect(isCancellation(e)).to.be.true;
    expect(isCancellation(e.message)).to.be.true;

    // Suffix is tollerated.
    e.message += '___';
    expect(isCancellation(e)).to.be.true;
    expect(isCancellation(e.message)).to.be.true;

    // Prefix is not tollerated.
    e.message = '___' + e.message;
    expect(isCancellation(e)).to.be.false;
    expect(isCancellation(e.message)).to.be.false;

    expect(isCancellation('')).to.be.false;
    expect(isCancellation(null)).to.be.false;
    expect(isCancellation(1)).to.be.false;
    expect(isCancellation({})).to.be.false;
  });

  it('reportError with error object', () => {
    const e = cancellation();
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data).to.be.undefined;
  });

  it('should throttle user errors', () => {
    nextRandomNumber = 0.2;
    let e = '';
    allowConsoleError(() => {
      try {
        userAssert(false, 'XYZ');
      } catch (error) {
        e = error;
      }
    });
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data).to.be.undefined;
  });

  it('should not report load errors', () => {
    nextRandomNumber = 1e-3 + 1e-4;
    const e = new Error('Failed to load:');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data).to.be.undefined;
  });

  it('should report throttled load errors at threshold', () => {
    nextRandomNumber = 1e-3;
    const e = new Error('Failed to load:');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data).to.be.ok;
    expect(data.ex).to.equal('1');
  });

  it('should not report Script errors', () => {
    nextRandomNumber = 1e-3 + 1e-4;
    const e = new Error('Script error.');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data).to.be.undefined;
  });

  it('should report throttled Script errors at threshold', () => {
    nextRandomNumber = 1e-3;
    const e = new Error('Script error.');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data).to.be.ok;
    expect(data.ex).to.contain('1');
  });

  it('should report throttled load errors under threshold', () => {
    nextRandomNumber = 1e-3 - 1e-4;
    const e = new Error('Failed to load:');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e
    );
    expect(data).to.be.ok;
    expect(data.ex).to.contain('1');
  });

  it('should omit the error stack for user errors', () => {
    const e = user().createError('123');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e,
      true
    );
    expect(data.s).to.be.undefined;
  });

  // TODO(#14350): unskip flaky test
  it.skip('should report experiments', () => {
    resetExperimentTogglesForTesting(window);
    toggleExperiment(window, 'test-exp', true);
    // Toggle on then off, so it's stored
    toggleExperiment(window, 'disabled-exp', true);
    toggleExperiment(window, 'disabled-exp', false);
    const e = user().createError('123');
    const data = getErrorReportData(
      undefined,
      undefined,
      undefined,
      undefined,
      e,
      true
    );
    expect(data.exps).to.equal('test-exp=1,disabled-exp=0');
  });

  describes.sandboxed('detectNonAmpJs', {}, () => {
    let win;
    let scripts;
    beforeEach(() => {
      scripts = [];
      win = {
        document: {
          querySelectorAll: (selector) => {
            expect(selector).to.equal('script[src]');
            return scripts;
          },
        },
      };
      for (let i = 0; i < 10; i++) {
        const s = document.createElement('script');
        s.src = 'https://cdn.ampproject.org/' + i + '.js';
        scripts.push(s);
      }
    });

    it("should let AMP's JS pass", () => {
      expect(detectNonAmpJs(win)).to.be.false;
    });

    it('should be case insensitive', () => {
      scripts[0].src = 'https://CDN.ampproject.ORG/v0.js';
      expect(detectNonAmpJs(win)).to.be.false;
    });

    it('should detect other JS', () => {
      scripts[0].src = './foo.js';
      expect(detectNonAmpJs(win)).to.be.true;
    });

    it('should detect other JS (2)', () => {
      scripts[0].src = 'http://jquery.com/foo.js';
      expect(detectNonAmpJs(win)).to.be.true;
    });

    it('should gracefully handle no JS', () => {
      scripts = [];
      expect(detectNonAmpJs(win)).to.be.false;
    });

    it('should detect non-AMP JS in karma', () => {
      scripts = [];
      expect(detectNonAmpJs(window)).to.be.true;
    });
  });
});

describes.sandboxed('reportError', {}, (env) => {
  let clock;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
  });

  it('should accept Error type', () => {
    const error = new Error('error');
    let result;
    allowConsoleError(() => {
      result = reportError(error);
    });
    expect(result).to.equal(error);
    expect(result.origError).to.be.undefined;
    expect(result.reported).to.be.true;
    clock.tick();
  });

  it('should accept string and report incorrect use', () => {
    window.__AMP_MODE = {localDev: true, test: false};
    let result;
    allowConsoleError(() => {
      result = reportError('error');
    });
    expect(result).to.be.instanceOf(Error);
    expect(result.message).to.contain('error');
    expect(result.origError).to.be.equal('error');
    expect(result.reported).to.be.true;
    expect(() => {
      clock.tick();
    }).to.throw(/_reported_ Error reported incorrectly/);
  });

  it('should accept number and report incorrect use', () => {
    window.__AMP_MODE = {localDev: true, test: false};
    let result;
    allowConsoleError(() => {
      result = reportError(101);
    });
    expect(result).to.be.instanceOf(Error);
    expect(result.message).to.contain('101');
    expect(result.origError).to.be.equal(101);
    expect(result.reported).to.be.true;
    expect(() => {
      clock.tick();
    }).to.throw(/_reported_ Error reported incorrectly/);
  });

  it('should accept null and report incorrect use', () => {
    window.__AMP_MODE = {localDev: true, test: false};
    let result;
    allowConsoleError(() => {
      result = reportError(null);
    });
    expect(result).to.be.instanceOf(Error);
    expect(result.message).to.contain('Unknown error');
    expect(result.origError).to.be.undefined;
    expect(result.reported).to.be.true;
    expect(() => {
      clock.tick();
    }).to.throw(/_reported_ Error reported incorrectly/);
  });
});

describes.fakeWin('user error reporting', {amp: true}, (env) => {
  let win;
  const error = new Error('ERROR', 'user error');
  let analyticsEventSpy;

  beforeEach(() => {
    win = env.win;
    analyticsEventSpy = env.sandbox.spy(analytics, 'triggerAnalyticsEvent');
  });

  it('should trigger triggerAnalyticsEvent with correct arguments', () => {
    reportErrorToAnalytics(error, win);
    expect(analyticsEventSpy).to.have.been.called;
    expect(analyticsEventSpy).to.have.been.calledWith(
      env.sandbox.match.any,
      'user-error',
      {errorName: error.name, errorMessage: error.message}
    );
  });
});
