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

import {AmpAdXOriginIframeHandler} from '../amp-ad-xorigin-iframe-handler';
import {BaseElement} from '../../../../src/base-element';
import {ampdocServiceFor} from '../../../../src/ampdoc';
import {
  createIframeWithMessageStub,
  expectPostMessage,
} from '../../../../testing/iframe';
import {AmpAdUIHandler} from '../amp-ad-ui';
import {timerFor} from '../../../../src/timer';
import * as sinon from 'sinon';

describe('amp-ad-xorigin-iframe-handler', () => {
  let sandbox;
  let adImpl;
  let iframeHandler;
  let iframe;
  let testIndex = 0;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const ampdocService = ampdocServiceFor(window);
    const ampdoc = ampdocService.getAmpDoc();
    const adElement = document.createElement('container-element');
    adElement.getAmpDoc = () => ampdoc;
    adElement.isBuilt = () => {
      return true;
    };
    adImpl = new BaseElement(adElement);
    adImpl.getFallback = () => {
      return null;
    };
    document.body.appendChild(adElement);
    adImpl.uiHandler = new AmpAdUIHandler(adImpl);
    iframeHandler = new AmpAdXOriginIframeHandler(adImpl);
    testIndex++;

    iframe = createIframeWithMessageStub(window);
    iframe.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
    iframe.name = 'test_nomaster';
  });

  afterEach(() => {
    sandbox.restore();
    document.body.removeChild(adImpl.element);
  });

  describe('init() returned promise', () => {
    let initPromise;

    describe('if render-start is implemented', () => {

      let noContentSpy;

      beforeEach(() => {
        adImpl.config = {renderStartImplemented: true};
        sandbox.stub(adImpl, 'attemptChangeSize', (height, width) => {
          expect(height).to.equal(217);
          expect(width).to.equal(114);
          return Promise.resolve();
        });
        noContentSpy =
            sandbox.spy/*OK*/(iframeHandler, 'freeXOriginIframe');

        initPromise = iframeHandler.init(iframe);
      });

      it('should resolve on message "render-start"', () => {
        expect(iframe.style.visibility).to.equal('hidden');
        iframe.postMessageToParent({
          sentinel: 'amp3ptest' + testIndex,
          type: 'render-start',
        });
        return initPromise.then(() => {
          expect(iframe.style.visibility).to.equal('');
        }).then(() => {
          iframe.postMessageToParent({
            sentinel: 'amp3ptest' + testIndex,
            type: 'no-content',
          });
          return expectPostMessage(iframe.contentWindow, window, {
            sentinel: 'amp3ptest' + testIndex,
            type: 'no-content',
          }).then(() => {
            expect(noContentSpy).to.not.been.called;
          });
        });
      });

      it('should resolve and resize on message "render-start" w/ size', () => {
        expect(iframe.style.visibility).to.equal('hidden');
        iframe.postMessageToParent({
          width: 114,
          height: '217',  // should be tolerant to string number
          type: 'render-start',
          sentinel: 'amp3ptest' + testIndex,
        });
        return initPromise.then(() => {
          expect(iframe.style.visibility).to.equal('');
          return iframe.expectMessageFromParent('amp-' + JSON.stringify({
            requestedWidth: 114,
            requestedHeight: 217,
            type: 'embed-size-changed',
            sentinel: 'amp3ptest' + testIndex,
          }));
        });
      });

      it('should resolve on message "no-content" ' +
          'and remove non-master iframe', () => {
        expect(iframe.style.visibility).to.equal('hidden');
        iframe.postMessageToParent({
          sentinel: 'amp3ptest' + testIndex,
          type: 'no-content',
        });
        return initPromise.then(() => {
          expect(noContentSpy).to.be.calledWith(false);
          expect(iframeHandler.iframe).to.be.null;
        });
      });

      it('should NOT remove master iframe on message "no-content"', () => {
        iframe.name = 'test_master';
        expect(iframe.style.visibility).to.equal('hidden');
        iframe.postMessageToParent({
          sentinel: 'amp3ptest' + testIndex,
          type: 'no-content',
        });
        return initPromise.then(() => {
          expect(iframe.style.visibility).to.equal('');
          expect(noContentSpy).to.be.calledOnce;
          expect(noContentSpy).to.be.calledWith(true);
        });
      });

      it('should NOT resolve on message "bootstrap-loaded"', () => {
        expect(iframe.style.visibility).to.equal('hidden');
        iframe.postMessageToParent({
          sentinel: 'amp3ptest' + testIndex,
          type: 'bootstrap-loaded',
        });

        return expectPostMessage(iframe.contentWindow, window, {
          sentinel: 'amp3ptest' + testIndex,
          type: 'bootstrap-loaded',
        }).then(() => {
          const clock = sandbox.useFakeTimers();
          clock.tick(0);
          const timeoutPromise =
              timerFor(window).timeoutPromise(2000, initPromise);
          clock.tick(2001);
          return expect(timeoutPromise).to.eventually
              .be.rejectedWith(/timeout/);
        });
      });
    });

    it('should resolve on message "bootstrap-loaded" if render-start is'
        + 'NOT implemented', done => {

      initPromise = iframeHandler.init(iframe);
      iframe.onload = () => {
        expect(iframe.style.visibility).to.equal('hidden');
        iframe.postMessageToParent({
          sentinel: 'amp3ptest' + testIndex,
          type: 'bootstrap-loaded',
        });
        initPromise.then(() => {
          expect(iframe.style.visibility).to.equal('');
          done();
        });
      };
    });

    it('should resolve on timeout', done => {
      const noContentSpy =
          sandbox.spy/*OK*/(iframeHandler, 'freeXOriginIframe');
      const clock = sandbox.useFakeTimers();

      iframe.name = 'test_master';
      initPromise = iframeHandler.init(iframe);
      clock.tick(9999);
      expect(noContentSpy).to.not.be.called;
      clock.tick(1);
      initPromise.then(() => {
        expect(iframe.style.visibility).to.equal('');
        expect(noContentSpy).to.be.calledOnce;
        expect(noContentSpy).to.be.calledWith(true);
        done();
      });
    });

    it('should resolve directly if it is A4A', () => {
      return iframeHandler.init(iframe, true).then(() => {
        expect(iframe.style.visibility).to.equal('');
      });
    });
  });

  describe('Initialized iframe', () => {

    beforeEach(() => {
      iframeHandler.init(iframe);
    });

    it('should be able to use embed-state API', () => {
      iframe.postMessageToParent({
        type: 'send-embed-state',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        inViewport: false,
        pageHidden: false,
        type: 'embed-state',
        sentinel: 'amp3ptest' + testIndex,
      }));
    });

    it('should be able to use embed-size API, change size deny', () => {
      sandbox.stub(adImpl, 'attemptChangeSize', (height, width) => {
        expect(height).to.equal(217);
        expect(width).to.equal(114);
        return Promise.reject(new Error('for testing'));
      });
      iframe.postMessageToParent({
        width: 114,
        height: 217,
        type: 'embed-size',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        requestedWidth: 114,
        requestedHeight: 217,
        type: 'embed-size-denied',
        sentinel: 'amp3ptest' + testIndex,
      }));
    });

    it('should be able to use embed-size API, change size succeed', () => {
      sandbox.stub(adImpl, 'attemptChangeSize', (height, width) => {
        expect(height).to.equal(217);
        expect(width).to.equal(114);
        return Promise.resolve();
      });
      iframe.postMessageToParent({
        width: 114,
        height: '217',  // should be tolerant to string number
        type: 'embed-size',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        requestedWidth: 114,
        requestedHeight: 217,
        type: 'embed-size-changed',
        sentinel: 'amp3ptest' + testIndex,
      }));
    });

    it('should be able to use embed-size API to resize height only', () => {
      sandbox.stub(adImpl, 'attemptChangeSize', (height, width) => {
        expect(height).to.equal(217);
        expect(width).to.be.undefined;
        return Promise.resolve();
      });
      iframe.postMessageToParent({
        height: 217,
        type: 'embed-size',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        requestedWidth: undefined,
        requestedHeight: 217,
        type: 'embed-size-changed',
        sentinel: 'amp3ptest' + testIndex,
      }));
    });
  });
});
