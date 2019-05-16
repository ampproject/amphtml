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
import * as IframeHelper from '../../src/iframe-helper';
import {createIframePromise} from '../../testing/iframe';
import {generateSentinel} from '../../src/3p-frame.js';

describe('iframe-helper', function() {
  const iframeSrc =
    'http://iframe.localhost:' +
    location.port +
    '/test/fixtures/served/iframe-intersection.html';
  const nestedIframeSrc =
    'http://iframe.localhost:' +
    location.port +
    '/test/fixtures/served/iframe-intersection-outer.html';

  let testIframe;
  let sandbox;
  let container;

  function insert(iframe) {
    container.doc.body.appendChild(iframe);
  }

  beforeEach(() => {
    sandbox = sinon.sandbox;
    return createIframePromise().then(c => {
      container = c;
      const i = c.doc.createElement('iframe');
      i.src = iframeSrc;
      testIframe = i;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should assert src in iframe', () => {
    const iframe = container.doc.createElement('iframe');
    iframe.srcdoc = '<html>';
    allowConsoleError(() => {
      expect(() => {
        IframeHelper.listenFor(iframe, 'test', () => {});
      }).to.throw('only iframes with src supported');
    });
  });

  it('should assert iframe is detached', () => {
    const iframe = container.doc.createElement('iframe');
    iframe.src = iframeSrc;
    insert(iframe);
    allowConsoleError(() => {
      expect(() => {
        IframeHelper.listenFor(iframe, 'test', () => {});
      }).to.throw('cannot register events on an attached iframe');
    });
  });

  it('should listen to iframe messages from non-3P frame', () => {
    let unlisten;
    let calls = 0;
    return new Promise(resolve => {
      unlisten = IframeHelper.listenFor(
        testIframe,
        'send-intersections',
        () => {
          calls++;
          resolve();
        }
      );
      insert(testIframe);
    }).then(() => {
      const total = calls;
      unlisten();
      return new Promise(resolve => {
        setTimeout(resolve, 50);
      }).then(() => {
        expect(calls).to.equal(total);
      });
    });
  });

  it('should listen to iframe messages from 3P frame', () => {
    let unlisten;
    let calls = 0;
    return new Promise(resolve => {
      const sentinel = generateSentinel(testIframe.ownerDocument.defaultView);
      testIframe.src = iframeSrc + '#amp-3p-sentinel=' + sentinel;
      testIframe.setAttribute('data-amp-3p-sentinel', sentinel);
      unlisten = IframeHelper.listenFor(
        testIframe,
        'send-intersections',
        () => {
          calls++;
          resolve();
        },
        true /* opt_is3P */
      );
      insert(testIframe);
    }).then(() => {
      const total = calls;
      unlisten();
      return new Promise(resolve => {
        setTimeout(resolve, 50);
      }).then(() => {
        expect(calls).to.equal(total);
      });
    });
  });

  it('should listen to iframe messages from nested 3P frame', () => {
    let unlisten;
    let calls = 0;
    return new Promise(resolve => {
      const sentinel = generateSentinel(testIframe.ownerDocument.defaultView);
      // Note that we're using a different document here which will load the
      // usual iframe-intersection.html within a nested iframe.
      testIframe.src = nestedIframeSrc + '#amp-3p-sentinel=' + sentinel;
      testIframe.setAttribute('data-amp-3p-sentinel', sentinel);
      unlisten = IframeHelper.listenFor(
        testIframe,
        'send-intersections',
        () => {
          calls++;
          resolve();
        },
        true /* opt_is3P */,
        true /* opt_includingNestedWindows */
      );
      insert(testIframe);
    }).then(() => {
      const total = calls;
      unlisten();
      return new Promise(resolve => {
        setTimeout(resolve, 50);
      }).then(() => {
        expect(calls).to.equal(total);
      });
    });
  });

  // TODO(dvoytenko, #12499): Make this work with latest mocha / karma.
  it.skip('should un-listen and resolve promise after first hit', () => {
    let calls = 0;
    return new Promise(resolve => {
      IframeHelper.listenForOncePromise(testIframe, [
        'no-msg',
        'send-intersections',
      ]).then(obj => {
        expect(obj.message).to.equal('send-intersections');
        calls++;
        resolve();
      });
      insert(testIframe);
    }).then(() => {
      const total = calls;
      return new Promise(resolve => {
        setTimeout(resolve, 50);
      }).then(() => {
        expect(calls).to.equal(total);
        expect(total).to.equal(1);
      });
    });
  });

  // TODO(cvializ, #3314): Figure out why this fails. Probably have to do with
  // removing the iframes in _init_tests.
  it.skip('should un-listen on next message when iframe is unattached', () => {
    let calls = 0;
    let otherCalls = 0;
    let other;

    return new Promise(resolve => {
      IframeHelper.listenFor(testIframe, 'send-intersections', () => {
        calls++;
        resolve();
      });
      insert(testIframe);
      other = container.doc.createElement('iframe');
      other.src = iframeSrc;
      IframeHelper.listenFor(other, 'send-intersections', () => {
        otherCalls++;
      });
      insert(other);
    }).then(() => {
      const total = calls;
      const otherTotal = otherCalls;
      testIframe.parentElement.removeChild(testIframe);
      return new Promise(resolve => {
        setTimeout(resolve, 50);
      }).then(() => {
        expect(calls).to.equal(total);
        expect(otherCalls).to.be.above(otherTotal + 4);
      });
    });
  });

  it('should set sentinel on postMessage data', () => {
    insert(testIframe);
    const postMessageSpy = sinon /*OK*/
      .spy(testIframe.contentWindow, 'postMessage');
    IframeHelper.postMessage(
      testIframe,
      'testMessage',
      {},
      'http://google.com'
    );
    expect(postMessageSpy.getCall(0).args[0].sentinel).to.equal('amp');
    expect(postMessageSpy.getCall(0).args[0].type).to.equal('testMessage');
    // Very important to do this outside of the sandbox, or else hell
    // breaks loose.
    postMessageSpy /*OK*/
      .restore();
  });
});
