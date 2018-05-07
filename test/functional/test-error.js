/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import * as analytics from '../../src/analytics';
import * as sinon from 'sinon';
import {Services} from '../../src/services';
import {
  cancellation,
  detectJsEngineFromStack,
  detectNonAmpJs,
  getErrorReportData,
  installErrorReporting,
  isCancellation,
  maybeReportErrorToViewer,
  reportError,
  reportErrorToAnalytics,
} from '../../src/error';
import {
  getMode,
  getRtvVersionForTesting,
} from '../../src/mode';
import {
  resetExperimentTogglesForTesting,
  toggleExperiment,
} from '../../src/experiments';
import {user} from '../../src/log';

describes.fakeWin('installErrorReporting', {}, env => {
  let sandbox;
  let win;
  let rejectedPromiseError;
  let rejectedPromiseEvent;
  let rejectedPromiseEventCancelledSpy;

  beforeEach(() => {
    win = env.win;
    installErrorReporting(win);
    sandbox = env.sandbox;
    rejectedPromiseEventCancelledSpy = sandbox.spy();
    rejectedPromiseError = new Error('error');
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
    win.eventListeners.fire(rejectedPromiseEvent);
    expect(rejectedPromiseError.reported).to.be.true;
    expect(rejectedPromiseEventCancelledSpy).to.not.be.called;
  });

  it('should allow null errors', () => {
    rejectedPromiseEvent.reason = null;
    win.eventListeners.fire(rejectedPromiseEvent);
    expect(rejectedPromiseEventCancelledSpy).to.not.be.called;
  });

  it('should allow string errors', () => {
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
});

describe('maybeReportErrorToViewer', () => {
  let win;
  let viewer;
  let sandbox;
  let ampdocServiceForStub;
  let sendMessageStub;

  const data = getErrorReportData(undefined, undefined, undefined, undefined,
      new Error('XYZ', false));

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    const optedInDoc = window.document.implementation.createHTMLDocument('');
    optedInDoc.documentElement.setAttribute('report-errors-to-viewer', '');

    ampdocServiceForStub = sandbox.stub(Services, 'ampdocServiceFor');
    ampdocServiceForStub.returns({
      isSingleDoc: () => true,
      getAmpDoc: () => ({getRootNode: () => optedInDoc}),
    });

    viewer = {
      hasCapability: () => true,
      isTrustedViewer: () => Promise.resolve(true),
      sendMessage: () => true,
    };
    sendMessageStub = sandbox.stub(viewer, 'sendMessage');

    sandbox.stub(Services, 'viewerForDoc').returns(viewer);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not report if AMP doc is not single', () => {
    ampdocServiceForStub.returns({isSingleDoc: () => false});
    return maybeReportErrorToViewer(win, data)
        .then(() => expect(sendMessageStub).to.not.have.been.called);
  });

  it('should not report if AMP doc is not opted in', () => {
    const nonOptedInDoc =
          window.document.implementation.createHTMLDocument('');
    ampdocServiceForStub.returns({
      isSingleDoc: () => true,
      getAmpDoc: () => ({getRootNode: () => nonOptedInDoc}),
    });
    return maybeReportErrorToViewer(win, data)
        .then(() => expect(sendMessageStub).to.not.have.been.called);
  });

  it('should not report if viewer is not capable', () => {
    sandbox.stub(viewer, 'hasCapability').withArgs('errorReporting')
        .returns(false);
    return maybeReportErrorToViewer(win, data)
        .then(() => expect(sendMessageStub).to.not.have.been.called);
  });

  it('should not report if viewer is not trusted', () => {
    sandbox.stub(viewer, 'isTrustedViewer').returns(Promise.resolve(false));
    return maybeReportErrorToViewer(win, data)
        .then(() => expect(sendMessageStub).to.not.have.been.called);
  });

  it('should send viewer message named `error`', () => {
    return maybeReportErrorToViewer(win, data)
        .then(() => expect(sendMessageStub).to.have.been
            .calledWith('error', data));
  });
});

describe('reportErrorToServer', () => {
  let sandbox;
  let onError;
  let nextRandomNumber;

  beforeEach(() => {
    onError = window.onerror;
    sandbox = sinon.sandbox.create();
    nextRandomNumber = 0;
    sandbox.stub(Math, 'random').callsFake(() => nextRandomNumber);
  });

  afterEach(() => {
    window.onerror = onError;
    sandbox.restore();
    window.viewerState = undefined;
    resetExperimentTogglesForTesting(window);
  });

  it('reportError with error object', function SHOULD_BE_IN_STACK() {
    const e = new Error('XYZ');
    if (!e.stack || e.stack.indexOf('SHOULD_BE_IN_STACK') == -1) {
      e.stack = 'SHOULD_BE_IN_STACK';
    }
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        e, true);
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
  });

  it('reportError with error and ignore stack', () => {
    const e = new Error('XYZ');
    e.ignoreStack = true;
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        e, true);
    expect(data.m).to.equal('XYZ');
    expect(data.el).to.equal('u');
    expect(data.a).to.equal('0');
    expect(data['3p']).to.equal(undefined);
    expect(e.message).to.contain('_reported_');
  });

  it('reportError with error object w/args', () => {
    const e = new Error('XYZ');
    e.args = {x: 1};
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        e, true);
    expect(data.args).to.equal(JSON.stringify({x: 1}));
  });

  it('reportError with a string instead of error', () => {
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        'string error',
        true);
    expect(data.m).to.equal('string error');
  });

  it('reportError with no error', () => {
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        undefined,
        true);
    expect(data.m).to.equal('Unknown error');
  });

  it('reportError with associatedElement', () => {
    const e = new Error('XYZ');
    const el = document.createElement('foo-bar');
    e.associatedElement = el;
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        e, false);
    expect(data.m).to.equal('XYZ');
    expect(data.el).to.equal('FOO-BAR');
    expect(data.a).to.equal('0');
    expect(data.v).to.equal(
        getRtvVersionForTesting(window, getMode().localDev));
    expect(data.noAmp).to.equal('0');
  });

  it('reportError mark asserts', () => {
    let e = '';
    try {
      user().assert(false, 'XYZ');
    } catch (error) {
      e = error;
    }
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        e);
    expect(data.m).to.equal('XYZ');
    expect(data.a).to.equal('1');
    expect(data.v).to.equal(
        getRtvVersionForTesting(window, getMode().localDev));
  });

  it('reportError mark asserts without error object', () => {
    let e = '';
    try {
      user().assert(false, 'XYZ');
    } catch (error) {
      e = error;
    }
    const data = getErrorReportData(e.message, undefined, undefined, undefined);
    expect(data.m).to.equal('XYZ');
    expect(data.a).to.equal('1');
    expect(data.v).to.equal(
        getRtvVersionForTesting(window, getMode().localDev));
  });

  it('reportError marks 3p', () => {
    window.context = {
      location: {},
    };
    const e = new Error('XYZ');
    e.fromAssert = true;
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        e);
    expect(data.m).to.equal('XYZ');
    expect(data['3p']).to.equal('1');
  });

  it('reportError marks canary and viewerState', () => {
    window.viewerState = 'some-state';
    window.AMP_CONFIG = {
      canary: true,
    };
    const e = new Error('XYZ');
    e.fromAssert = true;
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        e);
    expect(data.m).to.equal('XYZ');
    expect(data['ca']).to.equal('1');
    expect(data['vs']).to.equal('some-state');
  });

  it('reportError marks binary type', () => {
    window.AMP_CONFIG = {
      type: 'canary',
    };
    const e = new Error('XYZ');
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        e);
    expect(data.m).to.equal('XYZ');
    expect(data['bt']).to.equal('canary');

    window.AMP_CONFIG = {
      type: 'control',
    };
    const e1 = new Error('XYZ');
    const data1 = getErrorReportData(undefined, undefined, undefined, undefined,
        e1);
    expect(data1.m).to.equal('XYZ');
    expect(data1['bt']).to.equal('control');

    window.AMP_CONFIG = {};
    const e2 = new Error('ABC');
    const data2 = getErrorReportData(undefined, undefined, undefined, undefined,
        e2);
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
    getErrorReportData(undefined, undefined, undefined, undefined,
        new Error('1'),true);
    getErrorReportData(undefined, undefined, undefined, undefined,
        new Error('2'),true);
    const data = getErrorReportData(undefined, undefined, undefined,
        undefined, new Error('3'),true);
    expect(data.m).to.equal('3');
    expect(data.ae).to.equal('1,2');
  });

  it('should not double report', () => {
    const e = new Error('something _reported_');
    const data =
        getErrorReportData(undefined, undefined, undefined, undefined, e);
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
    const data =
        getErrorReportData(undefined, undefined, undefined, undefined, e);
    expect(data).to.be.undefined;
  });

  it('should throttle user errors', () => {
    nextRandomNumber = 0.2;
    let e = '';
    try {
      user().assert(false, 'XYZ');
    } catch (error) {
      e = error;
    }
    const data =
        getErrorReportData(undefined, undefined, undefined, undefined, e);
    expect(data).to.be.undefined;
  });

  it('should not report load errors', () => {
    nextRandomNumber = 1e-3 + 1e-4;
    const e = new Error('Failed to load:');
    const data =
        getErrorReportData(undefined, undefined, undefined, undefined, e);
    expect(data).to.be.undefined;
  });

  it('should report throttled load errors at threshold', () => {
    nextRandomNumber = 1e-3;
    const e = new Error('Failed to load:');
    const data =
        getErrorReportData(undefined, undefined, undefined, undefined, e);
    expect(data).to.be.ok;
    expect(data.ex).to.equal('1');
  });

  it('should not report Script errors', () => {
    nextRandomNumber = 1e-3 + 1e-4;
    const e = new Error('Script error.');
    const data =
        getErrorReportData(undefined, undefined, undefined, undefined, e);
    expect(data).to.be.undefined;
  });

  it('should report throttled Script errors at threshold', () => {
    nextRandomNumber = 1e-3;
    const e = new Error('Script error.');
    const data =
        getErrorReportData(undefined, undefined, undefined, undefined, e);
    expect(data).to.be.ok;
    expect(data.ex).to.contain('1');
  });


  it('should report throttled load errors under threshold', () => {
    nextRandomNumber = 1e-3 - 1e-4;
    const e = new Error('Failed to load:');
    const data =
        getErrorReportData(undefined, undefined, undefined, undefined, e);
    expect(data).to.be.ok;
    expect(data.ex).to.contain('1');
  });

  it('should omit the error stack for user errors', () => {
    const e = user().createError('123');
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        e, true);
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
    const data = getErrorReportData(undefined, undefined, undefined, undefined,
        e, true);
    expect(data.exps).to.equal('test-exp=1,disabled-exp=0');
  });

  describe('detectNonAmpJs', () => {
    let win;
    let scripts;
    beforeEach(() => {
      scripts = [];
      win = {
        document: {
          querySelectorAll: selector => {
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

    it('should let AMP\'s JS pass', () => {
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


describes.sandboxed('reportError', {}, () => {
  let clock;

  beforeEach(() => {
    clock = sandbox.useFakeTimers();
  });

  it('should accept Error type', () => {
    const error = new Error('error');
    const result = reportError(error);
    expect(result).to.equal(error);
    expect(result.origError).to.be.undefined;
    expect(result.reported).to.be.true;
    clock.tick();
  });

  it('should accept string and report incorrect use', () => {
    window.AMP_MODE = {localDev: true, test: false};
    const result = reportError('error');
    expect(result).to.be.instanceOf(Error);
    expect(result.message).to.contain('error');
    expect(result.origError).to.be.equal('error');
    expect(result.reported).to.be.true;
    expect(() => {
      clock.tick();
    }).to.throw(/_reported_ Error reported incorrectly/);
  });

  it('should accept number and report incorrect use', () => {
    window.AMP_MODE = {localDev: true, test: false};
    const result = reportError(101);
    expect(result).to.be.instanceOf(Error);
    expect(result.message).to.contain('101');
    expect(result.origError).to.be.equal(101);
    expect(result.reported).to.be.true;
    expect(() => {
      clock.tick();
    }).to.throw(/_reported_ Error reported incorrectly/);
  });

  it('should accept null and report incorrect use', () => {
    window.AMP_MODE = {localDev: true, test: false};
    const result = reportError(null);
    expect(result).to.be.instanceOf(Error);
    expect(result.message).to.contain('Unknown error');
    expect(result.origError).to.be.undefined;
    expect(result.reported).to.be.true;
    expect(() => {
      clock.tick();
    }).to.throw(/_reported_ Error reported incorrectly/);
  });
});

describe.configure().run('detectJsEngineFromStack', () => {
  // Note that these are not true of every case. You can emulate iOS Safari
  // on Desktop Chrome and break this. These tests are explicitly for
  // SauceLabs, which runs does not masquerade with UserAgent.
  describe.configure().ifIos().run('on iOS', () => {
    it.configure().ifSafari().run('detects safari as safari', () => {
      expect(detectJsEngineFromStack()).to.equal('Safari');
    });

    it.configure().ifChrome().run('detects chrome as safari', () => {
      expect(detectJsEngineFromStack()).to.equal('Safari');
    });

    it.configure().ifFirefox().run('detects firefox as safari', () => {
      expect(detectJsEngineFromStack()).to.equal('Safari');
    });
  });

  describe.configure().skipIos().run('on other OSs', () => {
    it.configure().ifSafari().run('detects safari as safari', () => {
      expect(detectJsEngineFromStack()).to.equal('Safari');
    });

    it.configure().ifChrome().run('detects chrome as chrome', () => {
      expect(detectJsEngineFromStack()).to.equal('Chrome');
    });

    it.configure().ifFirefox().run('detects firefox as firefox', () => {
      expect(detectJsEngineFromStack()).to.equal('Firefox');
    });

    it.configure().ifEdge().run('detects edge as IE', () => {
      expect(detectJsEngineFromStack()).to.equal('IE');
    });
  });
});


describes.fakeWin('user error reporting', {amp: true}, env => {
  let win;
  let sandbox;
  const error = new Error('ERROR','user error');
  let analyticsEventSpy;

  beforeEach(() => {
    sandbox = env.sandbox;
    win = env.win;
    analyticsEventSpy = sandbox.spy(analytics, 'triggerAnalyticsEvent');
    toggleExperiment(win, 'user-error-reporting', true);
  });

  it('should trigger triggerAnalyticsEvent with correct arguments', () => {
    reportErrorToAnalytics(error, win);
    expect(analyticsEventSpy).to.have.been.called;
    expect(analyticsEventSpy).to.have.been.calledWith(
        sinon.match.any,
        'user-error',
        {errorName: error.name, errorMessage: error.message});
  });
});
