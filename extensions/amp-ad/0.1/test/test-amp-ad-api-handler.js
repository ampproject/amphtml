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

import {AmpAdApiHandler} from '../amp-ad-api-handler';
import {BaseElement} from '../../../../src/base-element';
import {
  createIframeWithMessageStub,
  expectPostMessage,
} from '../../../../testing/iframe';
import {timerFor} from '../../../../src/timer';
import * as sinon from 'sinon';

describe('amp-ad-api-handler', () => {
  let sandbox;
  let adImpl;
  let apiHandler;
  let testIndex = 0;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const adElement = document.createElement('amp-ad');
    adImpl = new BaseElement(adElement);
    apiHandler = new AmpAdApiHandler(adImpl, adImpl.element);
    testIndex++;
  });

  afterEach(() => {
    sandbox.restore();
    apiHandler = null;
  });

  describe('iframe that is initialized by startUp()', () => {
    let iframe;
    let startUpPromise;
    const beforeAttachedToDom = element => {
      element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
      startUpPromise = apiHandler.startUp(element, true);
    };
    beforeEach(() => {
      return createIframeWithMessageStub(window, beforeAttachedToDom)
        .then(newIframe => {
          iframe = newIframe;
        });
    });

    it('should be able to use embed-state API', () => {
      iframe.postMessageToParent({
        sentinel: 'amp3ptest' + testIndex,
        type: 'send-embed-state',
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        inViewport: false,
        pageHidden: false,
        type: 'embed-state',
        sentinel: 'amp3ptest' + testIndex,
      }));
    });

    describe('method startUp return promise', () => {
      it('should resolve on message "bootstrap-loaded" if render-start is'
          + 'NOT implemented by 3P', () => {
        expect(iframe.style.visibility).to.equal('hidden');
        iframe.postMessageToParent({
          sentinel: 'amp3ptest' + testIndex,
          type: 'bootstrap-loaded',
        });
        return startUpPromise.then(() => {
          expect(iframe.style.visibility).to.equal('');
        });
      });

      it('should resolve on message "render-start" if render-start is'
          + 'implemented by 3P"', () => {
        adImpl.adType = 'doubleclick';
        const noContentCallbackSpy = sandbox.spy();
        apiHandler = new AmpAdApiHandler(adImpl, adImpl.element,
            noContentCallbackSpy);
        const beforeAttachedToDom = element => {
          element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
          startUpPromise = apiHandler.startUp(element, true);
        };
        return createIframeWithMessageStub(window, beforeAttachedToDom)
            .then(newIframe => {
              iframe = newIframe;
              expect(iframe.style.visibility).to.equal('hidden');
              iframe.postMessageToParent({
                sentinel: 'amp3ptest' + testIndex,
                type: 'render-start',
              });
              return startUpPromise.then(() => {
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
                  expect(noContentCallbackSpy).to.not.been.called;
                });
              });
            });
      });

      it('should resolve on message "no-content" if render-start is'
          + 'implemented by 3P', () => {
        adImpl.adType = 'doubleclick';
        const noContentCallbackSpy = sandbox.spy();
        apiHandler = new AmpAdApiHandler(adImpl, adImpl.element,
            noContentCallbackSpy);
        const beforeAttachedToDom = element => {
          element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
          startUpPromise = apiHandler.startUp(element, true);
        };
        return createIframeWithMessageStub(window, beforeAttachedToDom)
            .then(newIframe => {
              iframe = newIframe;
              expect(iframe.style.visibility).to.equal('hidden');
              iframe.postMessageToParent({
                sentinel: 'amp3ptest' + testIndex,
                type: 'no-content',
              });
              return startUpPromise.then(() => {
                expect(iframe.style.visibility).to.equal('');
                expect(noContentCallbackSpy).to.be.calledOnce;
              });
            });
      });

      it('should NOT resolve on message "bootstrap-loaded" if render-start is'
          + 'implemented by 3P', () => {
        adImpl.adType = 'doubleclick';
        apiHandler = new AmpAdApiHandler(adImpl, adImpl.element);
        const beforeAttachedToDom = element => {
          element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
          startUpPromise = apiHandler.startUp(element, true);
        };
        return createIframeWithMessageStub(window, beforeAttachedToDom)
            .then(newIframe => {
              iframe = newIframe;
              expect(iframe.style.visibility).to.equal('hidden');
              iframe.postMessageToParent({
                sentinel: 'amp3ptest' + testIndex,
                type: 'bootstrap-loaded',
              });
            }).then(() => {
              return expectPostMessage(iframe.contentWindow, window, {
                sentinel: 'amp3ptest' + testIndex,
                type: 'bootstrap-loaded',
              }).then(() => {
                const clock = sandbox.useFakeTimers();
                clock.tick(0);
                const timeoutPromise =
                    timerFor(window).timeoutPromise(2000, startUpPromise);
                clock.tick(2001);
                return expect(timeoutPromise).to.eventually
                    .be.rejectedWith(/timeout/);
              });
            });
      });
    });


    it('should be able to use embed-size API, change size deny', () => {
      sandbox.stub(adImpl, 'attemptChangeSize', () => {
        return Promise.reject(new Error('for testing'));
      });
      iframe.postMessageToParent({
        sentinel: 'amp3ptest' + testIndex,
        type: 'embed-size',
        height: 217,
        width: 114,
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        requestedWidth: 114,
        requestedHeight: 217,
        type: 'embed-size-denied',
        sentinel: 'amp3ptest' + testIndex,
      })).then(() => {
        expect(iframe.height).to.equal('217');
        expect(iframe.width).to.equal('114');
      });
    });

    it('should be able to use embed-size API, change size succeed', () => {
      sandbox.stub(adImpl, 'attemptChangeSize', () => {
        return Promise.resolve();
      });
      iframe.postMessageToParent({
        sentinel: 'amp3ptest' + testIndex,
        type: 'embed-size',
        height: 217,
        width: 114,
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        requestedWidth: 114,
        requestedHeight: 217,
        type: 'embed-size-changed',
        sentinel: 'amp3ptest' + testIndex,
      })).then(() => {
        expect(iframe.height).to.equal('217');
        expect(iframe.width).to.equal('114');
      });
    });

    it('should be able to use embed-size API to resize height only', () => {
      iframe.height = 11;
      iframe.width = 22;
      sandbox.stub(adImpl, 'attemptChangeSize', () => {
        return Promise.resolve();
      });
      iframe.postMessageToParent({
        sentinel: 'amp3ptest' + testIndex,
        type: 'embed-size',
        height: 217,
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        requestedWidth: undefined,
        requestedHeight: 217,
        type: 'embed-size-changed',
        sentinel: 'amp3ptest' + testIndex,
      })).then(() => {
        expect(iframe.height).to.equal('217');
        expect(iframe.width).to.equal('22');
      });
    });
  });
});
