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

import {AmpAdXDomainIframeHandler,}
    from '../amp-ad-cross-domain-iframe-handler';
import {BaseElement} from '../../../../src/base-element';
import {ampdocServiceFor} from '../../../../src/ampdoc';
import {
  createIframeWithMessageStub,
  expectPostMessage,
} from '../../../../testing/iframe';
import {timerFor} from '../../../../src/timer';
import * as sinon from 'sinon';

describe('amp-ad-api-handler', () => {
  let sandbox;
  let adImpl;
  let iframeHandler;
  let testIndex = 0;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const ampdocService = ampdocServiceFor(window);
    const ampdoc = ampdocService.getAmpDoc();
    const adElement = document.createElement('amp-ad');
    adElement.getAmpDoc = () => ampdoc;
    adImpl = new BaseElement(adElement);
    iframeHandler = new AmpAdXDomainIframeHandler(adImpl);
    testIndex++;
  });

  afterEach(() => {
    sandbox.restore();
    iframeHandler = null;
  });

  describe('iframe that is initialized by startUp()', () => {
    let iframe;
    let startUpPromise;
    const beforeAttachedToDom = element => {
      element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
      startUpPromise = iframeHandler.startUp(element, true);
    };
    beforeEach(() => {
      return createIframeWithMessageStub(window, beforeAttachedToDom)
        .then(newIframe => {
          iframe = newIframe;
        });
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

    describe('method startUp return promise', () => {
      it('should resolve directly if iframe do not support API', () => {
        apiHandler = new AmpAdApiHandler(adImpl, adImpl.element,
            null);
        const beforeAttachedToDom = element => {
          startUpPromise = apiHandler.startUp(element, true, undefined, true);
        };
        return createIframeWithMessageStub(window, beforeAttachedToDom)
            .then(newIframe => {
              return startUpPromise.then(() => {
                expect(newIframe.style.visibility).to.equal('');
              });
            });
      });

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
        adImpl.config = {renderStartImplemented: true};
        iframeHandler = new AmpAdXDomainIframeHandler(adImpl);
        const noContentSpy = sandbox.spy(iframeHandler, 'freeXDomainIframe');
        const beforeAttachedToDom = element => {
          element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
          startUpPromise = iframeHandler.startUp(element, true);
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
                  expect(noContentSpy).to.not.been.called;
                });
              });
            });
      });

      it('should resolve and resize on message "render-start" w/ size if '
          + 'render-start is implemented by 3P', () => {
        adImpl.config = {renderStartImplemented: true};
        sandbox.stub(adImpl, 'attemptChangeSize', (height, width) => {
          expect(height).to.equal(217);
          expect(width).to.equal(114);
          return Promise.resolve();
        });
        iframeHandler = new AmpAdXDomainIframeHandler(adImpl);
        const beforeAttachedToDom = element => {
          element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
          startUpPromise = iframeHandler.startUp(element, true);
        };
        return createIframeWithMessageStub(window, beforeAttachedToDom)
            .then(newIframe => {
              iframe = newIframe;
              expect(iframe.style.visibility).to.equal('hidden');
              iframe.postMessageToParent({
                width: 114,
                height: 217,
                type: 'render-start',
                sentinel: 'amp3ptest' + testIndex,
              });
              return startUpPromise.then(() => {
                expect(iframe.style.visibility).to.equal('');
                return iframe.expectMessageFromParent('amp-' + JSON.stringify({
                  requestedWidth: 114,
                  requestedHeight: 217,
                  type: 'embed-size-changed',
                  sentinel: 'amp3ptest' + testIndex,
                }));
              });
            });
      });

      it('should resolve on message "no-content" if render-start is'
          + 'implemented by 3P', () => {
        adImpl.config = {renderStartImplemented: true};
        iframeHandler = new AmpAdXDomainIframeHandler(adImpl);
        const noContentSpy = sandbox.spy(iframeHandler, 'freeXDomainIframe');
        const beforeAttachedToDom = element => {
          element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
          element.name = 'test_master';
          startUpPromise = iframeHandler.startUp(element, true);
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
                expect(noContentSpy).to.be.calledOnce;
                expect(noContentSpy).to.be.calledWith(true);
              });
            });
      });

      it('should remove non master iframe on message "no-content"', () => {
        adImpl.config = {renderStartImplemented: true};
        iframeHandler = new AmpAdXDomainIframeHandler(adImpl);
        const noContentSpy = sandbox.spy(iframeHandler, 'freeXDomainIframe');
        const beforeAttachedToDom = element => {
          element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
          element.name = 'test_nomaster';
          startUpPromise = iframeHandler.startUp(element, true);
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
                expect(noContentSpy).to.be.calledWith(false);
                expect(iframeHandler.iframe).to.be.null;
              });
            });
      });

      it('should NOT resolve on message "bootstrap-loaded" if render-start is'
          + 'implemented by 3P', () => {
        adImpl.config = {renderStartImplemented: true};
        iframeHandler = new AmpAdXDomainIframeHandler(adImpl);
        const beforeAttachedToDom = element => {
          element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
          startUpPromise = iframeHandler.startUp(element, true);
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

      it('should resolve on timeout', () => {
        iframeHandler = new AmpAdXDomainIframeHandler(adImpl);
        const noContentSpy = sandbox.spy(iframeHandler, 'freeXDomainIframe');
        const clock = sandbox.useFakeTimers();
        clock.tick(0);
        const beforeAttachedToDom = element => {
          element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
          element.name = 'test_master';
          startUpPromise = iframeHandler.startUp(element, true);
        };
        return createIframeWithMessageStub(window, beforeAttachedToDom)
            .then(newIframe => {
              iframe = newIframe;
              expect(noContentSpy).to.not.be.called;
              clock.tick(10001);
              return startUpPromise.then(() => {
                expect(iframe.style.visibility).to.equal('');
                expect(noContentSpy).to.be.calledOnce;
                expect(noContentSpy).to.be.calledWith(true);
              });
            });
      });
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
        height: 217,
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
