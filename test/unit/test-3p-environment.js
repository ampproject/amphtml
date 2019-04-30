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

import * as lolex from 'lolex';
import {Services} from '../../src/services';
import {createIframePromise} from '../../testing/iframe';
import {loadPromise} from '../../src/event-helper';
import {
  manageWin,
  setInViewportForTesting,
} from '../../3p/environment';

describe('3p environment', () => {

  let testWin;
  let iframeCount;
  const timer = Services.timerFor(window);

  beforeEach(() => {
    iframeCount = 0;
    return createIframePromise(true).then(iframe => {
      testWin = iframe.win;
    });
  });

  it('should instrument a window', () => {
    expect(testWin.setTimeout).to.match(/native/);
    manageWin(testWin);
    testWindow(testWin);
  });

  it('should instrument dynamically created child iframes: srcdoc', () => {
    expect(testWin.setTimeout).to.match(/native/);
    manageWin(testWin);
    const iframe = makeChildIframeSrcdoc(testWin);
    testWindow(testWin);
    return waitForMutationObserver(iframe).then(() => {
      testWindow(iframe.contentWindow);
    });
  });

  it('should instrument dynamically created child iframes: doc.write', () => {
    expect(testWin.setTimeout).to.match(/native/);
    manageWin(testWin);
    const iframe = makeChildIframeDocWrite(testWin);
    testWindow(testWin);
    return waitForMutationObserver(iframe).then(() => {
      testWindow(iframe.contentWindow);
    });
  });

  it('should instrument nested child iframes: doc.write', () => {
    expect(testWin.setTimeout).to.match(/native/);
    manageWin(testWin);
    const iframe = makeChildIframeDocWrite(testWin);
    testWindow(testWin);
    return waitForMutationObserver(iframe).then(() => {
      testWindow(iframe.contentWindow);
      const i0 = makeChildIframeDocWrite(iframe.contentWindow);
      const i1 = makeChildIframeDocWrite(iframe.contentWindow);
      return waitForMutationObserver(i1).then(() => {
        testWindow(i0.contentWindow);
        testWindow(i1.contentWindow);
        const i2 = makeChildIframeDocWrite(iframe.contentWindow);
        return waitForMutationObserver(i2).then(() => {
          testWindow(i2.contentWindow);
        });
      });
    });
  });

  it('should instrument nested child iframes: mixed', () => {
    expect(testWin.setTimeout).to.match(/native/);
    manageWin(testWin);
    const iframe = makeChildIframeSrcdoc(testWin);
    testWindow(testWin);
    return waitForMutationObserver(iframe).then(() => {
      testWindow(iframe.contentWindow);
      const i0 = makeChildIframeDocWrite(iframe.contentWindow);
      const i1 = makeChildIframeDocWrite(iframe.contentWindow);
      return waitForMutationObserver(i1).then(() => {
        testWindow(i0.contentWindow);
        testWindow(i1.contentWindow);
        const i2 = makeChildIframeDocWrite(iframe.contentWindow);
        return waitForMutationObserver(i2).then(() => {
          testWindow(i2.contentWindow);
        });
      });
    });
  });

  describe('timers', function() {
    let clock;
    let progress;

    beforeEach(() => {
      progress = '';
      // testWin is created before each test and destroyed when the iframe it
      // comes from gets detached, causing bugs if we call clock.uninstall().
      clock = lolex.install({target: testWin});
    });

    function add(p) {
      return function(a, b) {
        progress += p;
        if (a) {
          progress += a;
        }
        if (b) {
          progress += b;
        }
      };
    }

    it('throttle setTimeout', () => {
      manageWin(testWin);
      testWin.setTimeout(add('a'), 50);
      testWin.setTimeout(add('b'), 60);
      testWin.setTimeout(add('c'), 100);
      clock.tick(99);
      expect(progress).to.equal('ab');
      clock.tick(1);
      expect(progress).to.equal('abc');
      setInViewportForTesting(false);
      testWin.setTimeout(add('d'), 100);
      const t0 = testWin.setTimeout(add('canceled'), 100);
      testWin.clearTimeout(t0);
      clock.tick(100);
      expect(progress).to.equal('abc');
      clock.tick(999);
      expect(progress).to.equal('abc');
      clock.tick(1);
      expect(progress).to.equal('abcd');
      setInViewportForTesting(true);
      testWin.setTimeout(add('e'), 100);
      const t1 = testWin.setTimeout(add('canceled'), 100);
      testWin.clearTimeout(t1);
      clock.tick(100);
      expect(progress).to.equal('abcde');
    });

    it('throttle setInterval', () => {
      manageWin(testWin);
      const ia = testWin.setInterval(add('a'), 1);
      testWin.setInterval(add('b'), 10);
      const ic = testWin.setInterval(add('c'), 20);
      clock.tick(20);
      expect(progress).to.equal('aaaaaaaaabaaaaaaaaaacba');
      setInViewportForTesting(false);
      clock.tick(20);
      expect(progress).to.equal('aaaaaaaaabaaaaaaaaaacbaabc');
      clock.tick(980);
      expect(progress).to.equal('aaaaaaaaabaaaaaaaaaacbaabc');
      setInViewportForTesting(true);
      clock.tick(20);
      expect(progress).to.equal(
          'aaaaaaaaabaaaaaaaaaacbaabcaaaaaaaaaaaaaaaaaaba');
      testWin.clearInterval(ia);
      testWin.clearInterval(ic);
      clock.tick(20);
      expect(progress).to.equal(
          'aaaaaaaaabaaaaaaaaaacbaabcaaaaaaaaaaaaaaaaaababb');
      testWin.ran = false;
      testWin.setInterval('ran=true', 1);
      clock.tick(1);
      expect(window.ran).to.be.equal(undefined);
      expect(testWin.ran).to.be.true;
    });

    it('should support multi arg forms', () => {
      manageWin(testWin);
      testWin.setTimeout(add('a'), 50, '!', '?');
      testWin.setTimeout(add('b'), 60, 'B');
      testWin.setInterval(add('i'), 70, 'X', 'Z');
      clock.tick(140);
      expect(progress).to.equal('a!?bBiXZiXZ');
    });

    it('should cancel uninstrumented timeouts', () => {
      const timeout = testWin.setTimeout(() => {
        throw new Error('should not happen: timeout');
      }, 0);
      const interval = testWin.setInterval(() => {
        throw new Error('should not happen: interval');
      }, 0);
      manageWin(testWin);
      testWin.clearTimeout(timeout);
      testWin.clearInterval(interval);
      clock.tick(100);
    });
  });

  function testWindow(win) {
    expect(win.ampSeen).to.be.true;
    expect(win.setTimeout).to.not.match(/native/);
    expect(win.setInterval).to.not.match(/native/);
    expect(win.alert.toString()).to.not.match(/native/);
    expect(win.prompt.toString()).to.not.match(/native/);
    expect(win.confirm.toString()).to.not.match(/native/);
    expect(win.alert()).to.be.undefined;
    expect(win.prompt()).to.equal('');
    expect(win.confirm()).to.be.false;
    // We only allow 3 calls to these functions.
    expect(() => win.alert()).to.throw(/security error/);
    expect(() => win.prompt()).to.throw(/security error/);
    expect(() => win.confirm()).to.throw(/security error/);
  }

  function waitForMutationObserver(iframe) {
    if (iframe.contentWindow && iframe.contentWindow.document &&
        iframe.contentWindow.document.body.childNodes.length) {
      return timer.promise(10);
    }
    return loadPromise(iframe).then(() => {
      return timer.promise(10);
    });
  }

  function makeChildIframeSrcdoc(win) {
    const doc = win.document;
    const iframe = doc.createElement('iframe');
    iframe.name = 'testChild' + (iframeCount++);
    iframe.setAttribute('srcdoc', 'hello: ' + iframe.name);
    doc.body.appendChild(iframe);
    doc.body.appendChild(doc.createElement('hr'));
    return iframe;
  }

  function makeChildIframeDocWrite(win) {
    const doc = win.document;
    const iframe = doc.createElement('iframe');
    iframe.name = 'testChild' + (iframeCount++);
    iframe.src = 'about:blank';
    doc.body.appendChild(iframe);
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write('write: ' + iframe.name);
    iframe.contentWindow.document.close();
    doc.body.appendChild(doc.createElement('hr'));
    return iframe;
  }
});
