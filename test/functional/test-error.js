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

import {
  cancellation,
  detectNonAmpJs,
  getErrorReportUrl,
  installErrorReporting,
  isCancellation,
  reportError,
  detectJsEngineFromStack,
} from '../../src/error';
import {parseUrl, parseQueryString} from '../../src/url';
import {user} from '../../src/log';
import {
  resetExperimentTogglesForTesting,
  toggleExperiment,
} from '../../src/experiments';
import * as sinon from 'sinon';


describes.fakeWin('installErrorReporting', {}, env => {
  let win;
  let rejectedPromiseError;
  let rejectedPromiseEvent;
  let rejectedPromiseEventCancelledSpy;

  beforeEach(() => {
    win = env.win;
    installErrorReporting(win);
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


describe('reportErrorToServer', () => {
  let sandbox;
  let onError;

  beforeEach(() => {
    onError = window.onerror;
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    window.onerror = onError;
    sandbox.restore();
    window.viewerState = undefined;
    resetExperimentTogglesForTesting(window);
  });

  it('reportError with error object', function SHOULD_BE_IN_STACK() {
    const e = new Error('XYZ');
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e,
          true));
    const query = parseQueryString(url.search);
    expect(url.href.indexOf(
        'https://amp-error-reporting.appspot.com/r?')).to.equal(0);

    expect(query.m).to.equal('XYZ');
    expect(query.el).to.equal('u');
    expect(query.a).to.equal('0');
    expect(query.s).to.contain('SHOULD_BE_IN_STACK');
    expect(query['3p']).to.equal(undefined);
    expect(e.message).to.contain('_reported_');
    if (location.ancestorOrigins) {
      expect(query.or).to.contain('http://localhost');
    }
    expect(query.vs).to.be.undefined;
    expect(query.ae).to.equal('');
    expect(query.r).to.contain('http://localhost');
    expect(query.noAmp).to.equal('1');
    expect(query.args).to.be.undefined;
  });

  it('reportError with error and ignore stack', () => {
    const e = new Error('XYZ');
    e.ignoreStack = true;
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e,
          true));
    const query = parseQueryString(url.search);
    expect(query.s).to.be.undefined;

    expect(url.href.indexOf(
        'https://amp-error-reporting.appspot.com/r?')).to.equal(0);
    expect(query.m).to.equal('XYZ');
    expect(query.el).to.equal('u');
    expect(query.a).to.equal('0');
    expect(query['3p']).to.equal(undefined);
    expect(e.message).to.contain('_reported_');
  });

  it('reportError with error object w/args', () => {
    const e = new Error('XYZ');
    e.args = {x: 1};
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e,
          true));
    const query = parseQueryString(url.search);

    expect(query.args).to.equal(JSON.stringify({x: 1}));
  });

  it('reportError with a string instead of error', () => {
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined,
            'string error',
            true));
    const query = parseQueryString(url.search);
    expect(query.m).to.equal('string error');
  });

  it('reportError with no error', () => {
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined,
            undefined,
            true));
    const query = parseQueryString(url.search);
    expect(query.m).to.equal('Unknown error');
  });

  it('reportError with associatedElement', () => {
    const e = new Error('XYZ');
    const el = document.createElement('foo-bar');
    e.associatedElement = el;
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e,
            false));
    const query = parseQueryString(url.search);

    expect(query.m).to.equal('XYZ');
    expect(query.el).to.equal('FOO-BAR');
    expect(query.a).to.equal('0');
    expect(query.v).to.equal('$internalRuntimeVersion$');
    expect(query.noAmp).to.equal('0');
  });

  it('reportError mark asserts', () => {
    let e = '';
    try {
      user().assert(false, 'XYZ');
    } catch (error) {
      e = error;
    }
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e));
    const query = parseQueryString(url.search);

    expect(query.m).to.equal('XYZ');
    expect(query.a).to.equal('1');
    expect(query.v).to.equal('$internalRuntimeVersion$');
  });

  it('reportError mark asserts without error object', () => {
    let e = '';
    try {
      user().assert(false, 'XYZ');
    } catch (error) {
      e = error;
    }
    const url = parseUrl(
        getErrorReportUrl(e.message, undefined, undefined, undefined));
    const query = parseQueryString(url.search);

    expect(query.m).to.equal('XYZ');
    expect(query.a).to.equal('1');
    expect(query.v).to.equal('$internalRuntimeVersion$');
  });

  it('reportError marks 3p', () => {
    window.context = {
      location: {},
    };
    const e = new Error('XYZ');
    e.fromAssert = true;
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e));
    const query = parseQueryString(url.search);

    expect(query.m).to.equal('XYZ');
    expect(query['3p']).to.equal('1');
  });

  it('reportError marks canary and viewerState', () => {
    window.viewerState = 'some-state';
    window.AMP_CONFIG = {
      canary: true,
    };
    const e = new Error('XYZ');
    e.fromAssert = true;
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e));
    const query = parseQueryString(url.search);

    expect(query.m).to.equal('XYZ');
    expect(query['ca']).to.equal('1');
    expect(query['vs']).to.equal('some-state');
  });

  it('reportError without error object', () => {
    const url = parseUrl(
        getErrorReportUrl('foo bar', 'foo.js', '11', '22', undefined));
    const query = parseQueryString(url.search);
    expect(url.href.indexOf(
        'https://amp-error-reporting.appspot.com/r?')).to.equal(0);

    expect(query.m).to.equal('foo bar');
    expect(query.f).to.equal('foo.js');
    expect(query.l).to.equal('11');
    expect(query.c).to.equal('22');
    expect(query.SHORT).to.be.undefined;
  });

  it('should accumulate errors', () => {
    parseUrl(getErrorReportUrl(undefined, undefined, undefined, undefined,
        new Error('1'),true));
    parseUrl(getErrorReportUrl(undefined, undefined, undefined, undefined,
        new Error('2'),true));
    const url = parseUrl(getErrorReportUrl(undefined, undefined, undefined,
        undefined, new Error('3'),true));
    const query = parseQueryString(url.search);
    expect(url.href.indexOf(
        'https://amp-error-reporting.appspot.com/r?')).to.equal(0);

    expect(query.m).to.equal('3');
    expect(query.ae).to.equal('1,2');
  });

  it('should shorten very long reports', () => {
    let message = 'TEST';
    for (let i = 0; i < 4000; i++) {
      message += '&';
    }
    const url = parseUrl(getErrorReportUrl(undefined, undefined, undefined,
        undefined, new Error(message),true));
    const query = parseQueryString(url.search);
    expect(url.href.indexOf(
        'https://amp-error-reporting.appspot.com/r?')).to.equal(0);

    expect(query.m).to.match(/^TEST/);
    expect(url.href.length <= 2072).to.be.ok;
    expect(query.SHORT).to.equal('1');
  });

  it('should not double report', () => {
    const e = new Error('something _reported_');
    const url =
        getErrorReportUrl(undefined, undefined, undefined, undefined, e);
    expect(url).to.be.undefined;
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
    const url =
        getErrorReportUrl(undefined, undefined, undefined, undefined, e);
    expect(url).to.be.undefined;
  });

  it('should not report load errors', () => {
    sandbox.stub(Math, 'random', () => (1e-3 + 1e-4));
    const e = new Error('Failed to load:');
    const url =
        getErrorReportUrl(undefined, undefined, undefined, undefined, e);
    expect(url).to.be.undefined;
  });

  it('should report throttled load errors at threshold', () => {
    sandbox.stub(Math, 'random', () => 1e-3);
    const e = new Error('Failed to load:');
    const url =
        getErrorReportUrl(undefined, undefined, undefined, undefined, e);
    expect(url).to.be.ok;
    expect(url).to.contain('&ex=1');
  });

  it('should not report Script errors', () => {
    sandbox.stub(Math, 'random', () => (1e-3 + 1e-4));
    const e = new Error('Script error.');
    const url =
        getErrorReportUrl(undefined, undefined, undefined, undefined, e);
    expect(url).to.be.undefined;
  });

  it('should report throttled Script errors at threshold', () => {
    sandbox.stub(Math, 'random', () => 1e-3);
    const e = new Error('Script error.');
    const url =
        getErrorReportUrl(undefined, undefined, undefined, undefined, e);
    expect(url).to.be.ok;
    expect(url).to.contain('&ex=1');
  });


  it('should report throttled load errors under threshold', () => {
    sandbox.stub(Math, 'random', () => (1e-3 - 1e-4));
    const e = new Error('Failed to load:');
    const url =
        getErrorReportUrl(undefined, undefined, undefined, undefined, e);
    expect(url).to.be.ok;
    expect(url).to.contain('&ex=1');
  });

  it('should omit the error stack for user errors', () => {
    const e = user().createError('123');
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e,
          true));
    const query = parseQueryString(url.search);
    expect(query.s).to.be.undefined;
  });

  it('should report experiments', () => {
    resetExperimentTogglesForTesting(window);
    toggleExperiment(window, 'test-exp', true);
    // Toggle on then off, so it's stored
    toggleExperiment(window, 'disabled-exp', true);
    toggleExperiment(window, 'disabled-exp', false);
    const e = user().createError('123');
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e,
          true));
    const query = parseQueryString(url.search);
    expect(query.exps).to.equal('test-exp=1,disabled-exp=0');
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

describe('detectJsEngineFromStack', () => {
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
      // TODO(jridgewell,#9132): the test failed on FF 53.0.
      // expect(detectJsEngineFromStack()).to.equal('Firefox');
    });

    it.configure().ifEdge().run('detects edge as IE', () => {
      expect(detectJsEngineFromStack()).to.equal('IE');
    });
  });
});
