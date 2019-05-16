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

import {AmpAdUIHandler} from '../amp-ad-ui';
import {AmpAdXOriginIframeHandler} from '../amp-ad-xorigin-iframe-handler';
import {BaseElement} from '../../../../src/base-element';
import {Services} from '../../../../src/services';
import {Signals} from '../../../../src/utils/signals';
import {
  createIframeWithMessageStub,
  expectPostMessage,
} from '../../../../testing/iframe';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {toggleExperiment} from '../../../../src/experiments';

describe('amp-ad-xorigin-iframe-handler', () => {
  let sandbox;
  let adImpl;
  let signals;
  let renderStartedSpy;
  let iframeHandler;
  let iframe;
  let testIndex = 0;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    const ampdocService = Services.ampdocServiceFor(window);
    const ampdoc = ampdocService.getAmpDoc();
    const adElement = document.createElement('container-element');
    adElement.getAmpDoc = () => ampdoc;
    adElement.isBuilt = () => {
      return true;
    };
    signals = new Signals();
    adElement.signals = () => signals;
    renderStartedSpy = sandbox.spy();
    adElement.renderStarted = () => {
      renderStartedSpy();
      signals.signal('render-start');
    };
    adImpl = new BaseElement(adElement);
    adImpl.getFallback = () => {
      return null;
    };
    adImpl.lifecycleReporter = {
      addPingsForVisibility: unusedElement => {},
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
        sandbox.stub(adImpl.uiHandler, 'updateSize').callsFake(() => {
          return Promise.resolve({
            success: true,
            newWidth: 114,
            newHeight: 217,
          });
        });
        noContentSpy = sandbox./*OK*/ spy(iframeHandler, 'freeXOriginIframe');

        initPromise = iframeHandler.init(iframe);
      });

      it('should resolve on iframe.onload', () => {
        expect(iframe.style.visibility).to.equal('hidden');
        return initPromise.then(() => {
          expect(iframe.style.visibility).to.equal('');
          expect(renderStartedSpy).to.not.be.called;
          expect(signals.get('render-start')).to.be.null;
        });
      });

      it('should resolve on message "render-start"', () => {
        expect(iframe.style.visibility).to.equal('hidden');
        iframe.postMessageToParent({
          sentinel: 'amp3ptest' + testIndex,
          type: 'render-start',
        });
        const renderStartPromise = signals.whenSignal('render-start');
        return Promise.all([renderStartPromise, initPromise])
          .then(() => {
            expect(iframe.style.visibility).to.equal('');
            expect(renderStartedSpy).to.be.calledOnce;
          })
          .then(() => {
            const message = {
              sentinel: 'amp3ptest' + testIndex,
              type: 'no-content',
            };
            const promise = expectPostMessage(
              iframe.contentWindow,
              window,
              message
            );
            iframe.postMessageToParent(message);
            return promise.then(() => {
              expect(noContentSpy).to.not.been.called;
            });
          });
      });

      it('should resolve and resize on message "render-start" w/ size', () => {
        expect(iframe.style.visibility).to.equal('hidden');
        iframe.postMessageToParent({
          width: 114,
          height: '217', // should be tolerant to string number
          type: 'render-start',
          sentinel: 'amp3ptest' + testIndex,
        });
        const expectResponsePromise = iframe.expectMessageFromParent(
          'embed-size-changed'
        );
        const renderStartPromise = signals.whenSignal('render-start');
        return Promise.all([renderStartPromise, initPromise])
          .then(() => {
            expect(iframe.style.visibility).to.equal('');
            return expectResponsePromise;
          })
          .then(data => {
            expect(data).to.jsonEqual({
              requestedWidth: 114,
              requestedHeight: 217,
              type: 'embed-size-changed',
              sentinel: 'amp3ptest' + testIndex,
            });
          });
      });

      // TODO(@lannka): unskip flaky test
      it.skip(
        'should resolve on message "no-content" ' +
          'and remove non-master iframe',
        () => {
          expect(iframe.style.visibility).to.equal('hidden');
          iframe.postMessageToParent({
            sentinel: 'amp3ptest' + testIndex,
            type: 'no-content',
          });
          return initPromise.then(() => {
            expect(noContentSpy).to.be.calledWith(false);
            expect(iframeHandler.iframe).to.be.null;
          });
        }
      );

      it('should NOT remove master iframe on message "no-content"', () => {
        iframe.name = 'test_master';
        expect(iframe.style.visibility).to.equal('hidden');
        iframe.postMessageToParent({
          sentinel: 'amp3ptest' + testIndex,
          type: 'no-content',
        });
        return initPromise.then(() => {
          expect(noContentSpy).to.be.calledOnce;
          expect(noContentSpy).to.be.calledWith(true);
        });
      });

      // TODO(#18656, lannka): Fails due to bad error message.
      it.skip('should NOT resolve on message "bootstrap-loaded"', () => {
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
          const timeoutPromise = Services.timerFor(window).timeoutPromise(
            2000,
            initPromise
          );
          clock.tick(2001);
          return expect(timeoutPromise).to.eventually.be.rejectedWith(
            /timeout/
          );
        });
      });

      it('should not update "ini-load" signal implicitly', () => {
        return initPromise.then(() => {
          expect(signals.get('ini-load')).to.be.null;
        });
      });

      it('should update "ini-load" signal on message', () => {
        iframe.postMessageToParent({
          sentinel: 'amp3ptest' + testIndex,
          type: 'ini-load',
        });
        return initPromise.then(() => {
          expect(signals.get('ini-load')).to.be.ok;
        });
      });

      it('should be able to use user-error API', () => {
        const err = new Error();
        err.message = 'error test';
        const userErrorReportSpy = sandbox./*OK*/ spy(
          iframeHandler,
          'userErrorForAnalytics_'
        );
        iframe.postMessageToParent({
          type: 'user-error-in-iframe',
          sentinel: 'amp3ptest' + testIndex,
          message: err.message,
        });
        return initPromise.then(() => {
          expect(userErrorReportSpy).to.be.called;
          expect(userErrorReportSpy).to.be.calledWith('error test');
        });
      });
    });

    it(
      'should trigger render-start on message "bootstrap-loaded" if' +
        ' render-start is NOT implemented',
      () => {
        initPromise = iframeHandler.init(iframe);
        iframe.postMessageToParent({
          sentinel: 'amp3ptest' + testIndex,
          type: 'bootstrap-loaded',
        });
        const renderStartPromise = signals.whenSignal('render-start');
        return renderStartPromise.then(() => {
          expect(renderStartedSpy).to.be.calledOnce;
        });
      }
    );

    it('should trigger visibility on timeout', () => {
      const clock = sandbox.useFakeTimers();
      iframe.name = 'test_master';
      initPromise = iframeHandler.init(iframe);
      return new Promise(resolve => {
        iframe.onload = () => {
          clock.tick(10000);
          initPromise.then(() => {
            resolve();
          });
        };
      }).then(() => {
        expect(iframe.style.visibility).to.equal('');
        expect(renderStartedSpy).to.not.be.called;
      });
    });

    it('should be immediately visible if it is A4A', () => {
      const initPromise = iframeHandler.init(iframe, true);
      expect(iframe).to.be.visible;
      initPromise.then(() => {
        expect(iframe.style.visibility).to.equal('');
        expect(iframe.readyState).to.equal('complete');
      });
    });
  });

  describe('Initialized iframe', () => {
    beforeEach(() => {
      iframeHandler.init(iframe);
    });

    it('should be able to use embed-state API', () => {
      sandbox
        ./*OK*/ stub(iframeHandler.viewer_, 'isVisible')
        .callsFake(() => true);
      iframe.postMessageToParent({
        type: 'send-embed-state',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('embed-state').then(data => {
        expect(data).to.jsonEqual({
          inViewport: false,
          pageHidden: false,
          type: 'embed-state',
          sentinel: 'amp3ptest' + testIndex,
        });
      });
    });

    it('should be able to use embed-size API, change size deny', () => {
      sandbox.stub(adImpl.uiHandler, 'updateSize').callsFake(() => {
        return Promise.resolve({
          success: false,
          newWidth: 114,
          newHeight: 217,
        });
      });
      iframe.postMessageToParent({
        width: 114,
        height: 217,
        type: 'embed-size',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('embed-size-denied').then(data => {
        expect(data).to.jsonEqual({
          requestedWidth: 114,
          requestedHeight: 217,
          type: 'embed-size-denied',
          sentinel: 'amp3ptest' + testIndex,
        });
      });
    });

    it('should be able to use embed-size API, change size succeed', () => {
      sandbox.stub(adImpl.uiHandler, 'updateSize').callsFake(() => {
        return Promise.resolve({
          success: true,
          newWidth: 114,
          newHeight: 217,
        });
      });
      iframe.postMessageToParent({
        width: 114,
        height: '217', // should be tolerant to string number
        type: 'embed-size',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('embed-size-changed').then(data => {
        expect(data).to.jsonEqual({
          requestedWidth: 114,
          requestedHeight: 217,
          type: 'embed-size-changed',
          sentinel: 'amp3ptest' + testIndex,
        });
      });
    });

    it('should be able to use embed-size API to resize height only', () => {
      sandbox.stub(adImpl.uiHandler, 'updateSize').callsFake(() => {
        return Promise.resolve({
          success: true,
          newWidth: undefined,
          newHeight: 217,
        });
      });
      iframe.postMessageToParent({
        height: 217,
        type: 'embed-size',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('embed-size-changed').then(data => {
        expect(data).to.jsonEqual({
          requestedWidth: undefined,
          requestedHeight: 217,
          type: 'embed-size-changed',
          sentinel: 'amp3ptest' + testIndex,
        });
      });
    });

    it('should be able to use send-positions API to send position', () => {
      toggleExperiment(window, 'inabox-position-api', true);
      const iframeHandler = new AmpAdXOriginIframeHandler(adImpl);
      const iframe = createIframeWithMessageStub(window);
      iframe.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
      iframe.name = 'test_nomaster';
      iframeHandler.init(iframe);
      sandbox
        ./*OK*/ stub(iframeHandler.viewport_, 'getClientRectAsync')
        .callsFake(() => {
          return Promise.resolve(layoutRectLtwh(1, 1, 1, 1));
        });
      sandbox./*OK*/ stub(iframeHandler.viewport_, 'getRect').callsFake(() => {
        return layoutRectLtwh(1, 1, 1, 1);
      });
      iframe.postMessageToParent({
        type: 'send-positions',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('position').then(data => {
        expect(data).to.jsonEqual({
          targetRect: layoutRectLtwh(1, 1, 1, 1),
          viewportRect: layoutRectLtwh(1, 1, 1, 1),
          type: 'position',
          sentinel: 'amp3ptest' + testIndex,
        });
      });
    });

    it('should be able to use get-consent-state API', () => {
      adImpl.getConsentState = () => Promise.resolve(2);
      iframe.postMessageToParent({
        type: 'get-consent-state',
        sentinel: 'amp3ptest' + testIndex,
        messageId: 3,
      });
      return iframe
        .expectMessageFromParent('get-consent-state-result')
        .then(data => {
          expect(data).to.jsonEqual({
            type: 'get-consent-state-result',
            sentinel: 'amp3ptest' + testIndex,
            messageId: 3,
            content: {
              consentState: 2,
            },
          });
        });
    });
  });
});
