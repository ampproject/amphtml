import {Signals} from '#core/data-structures/signals';
import {layoutRectLtwh} from '#core/dom/layout/rect';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';

import {createIframeWithMessageStub, expectPostMessage} from '#testing/iframe';

import {BaseElement} from '../../../../src/base-element';
import {AmpAdUIHandler} from '../amp-ad-ui';
import {AmpAdXOriginIframeHandler} from '../amp-ad-xorigin-iframe-handler';

describes.sandboxed('amp-ad-xorigin-iframe-handler', {}, (env) => {
  let ampdoc;
  let adImpl;
  let signals;
  let renderStartedSpy;
  let iframeHandler;
  let iframe;
  let clock;
  let testIndex = 0;

  beforeEach(() => {
    const ampdocService = Services.ampdocServiceFor(window);
    ampdoc = ampdocService.getSingleDoc();
    const adElement = document.createElement('container-element');
    adElement.getAmpDoc = () => ampdoc;
    adElement.togglePlaceholder = () => {};
    adElement.toggleFallback = () => {};
    adElement.isBuilt = () => {
      return true;
    };
    signals = new Signals();
    adElement.signals = () => signals;
    renderStartedSpy = env.sandbox.spy();
    adElement.renderStarted = () => {
      renderStartedSpy();
      signals.signal('render-start');
    };
    adImpl = new BaseElement(adElement);
    adImpl.getFallback = () => {
      return null;
    };
    adImpl.lifecycleReporter = {
      addPingsForVisibility: (unusedElement) => {},
    };
    document.body.appendChild(adElement);
    adImpl.uiHandler = new AmpAdUIHandler(adImpl);
    adImpl.uiHandler.adjustPadding = env.sandbox.spy();
    iframeHandler = new AmpAdXOriginIframeHandler(adImpl);
    testIndex++;

    iframe = createIframeWithMessageStub(window);
    iframe.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
    iframe.name = 'test_nomaster';
  });

  afterEach(() => {
    document.body.removeChild(adImpl.element);
  });

  describe('init() returned promise', () => {
    let initPromise;

    describe('if render-start is implemented', () => {
      let noContentSpy;

      beforeEach(() => {
        adImpl.config = {renderStartImplemented: true};
        env.sandbox.stub(adImpl.uiHandler, 'updateSize').callsFake(() => {
          return Promise.resolve({
            success: true,
            newWidth: 114,
            newHeight: 217,
          });
        });
        noContentSpy = env.sandbox./*OK*/ spy(
          iframeHandler,
          'freeXOriginIframe'
        );

        initPromise = iframeHandler.init(iframe);
      });

      it('should resolve on iframe.onload', () => {
        expect(iframe.style.visibility).to.equal('hidden');
        return initPromise.then(() => {
          expect(iframe.style.visibility).to.equal('');
          // Should signal RENDER_START at toggling visibility even w/o msg
          expect(signals.get('render-start')).to.be.ok;
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
        const expectResponsePromise =
          iframe.expectMessageFromParent('embed-size-changed');
        const renderStartPromise = signals.whenSignal('render-start');
        return Promise.all([renderStartPromise, initPromise])
          .then(() => {
            expect(iframe.style.visibility).to.equal('');
            return expectResponsePromise;
          })
          .then((data) => {
            expect(data).to.jsonEqual({
              requestedWidth: 114,
              requestedHeight: 217,
              type: 'embed-size-changed',
              sentinel: 'amp3ptest' + testIndex,
            });
          });
      });

      it('should resolve on message "no-content" and remove non-master iframe', () => {
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
          const clock = env.sandbox.useFakeTimers();
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
        const userErrorReportSpy = env.sandbox.stub(
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
      const clock = env.sandbox.useFakeTimers();
      iframe.name = 'test_master';
      initPromise = iframeHandler.init(iframe);
      return new Promise((resolve) => {
        iframe.onload = () => {
          clock.tick(10000);
          initPromise.then(() => {
            resolve();
          });
        };
      }).then(() => {
        expect(iframe.style.visibility).to.equal('');
        expect(renderStartedSpy).to.be.calledOnce;
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
      env.sandbox./*OK*/ stub(ampdoc, 'isVisible').returns(true);
      iframe.postMessageToParent({
        type: 'send-embed-state',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('embed-state').then((data) => {
        expect(data).to.jsonEqual({
          inViewport: false,
          pageHidden: false,
          type: 'embed-state',
          sentinel: 'amp3ptest' + testIndex,
        });
      });
    });

    it('should be able to use embed-size API, change size deny', () => {
      env.sandbox.stub(adImpl.uiHandler, 'updateSize').callsFake(() => {
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
      return iframe
        .expectMessageFromParent('embed-size-denied')
        .then((data) => {
          expect(data).to.jsonEqual({
            requestedWidth: 114,
            requestedHeight: 217,
            type: 'embed-size-denied',
            sentinel: 'amp3ptest' + testIndex,
          });
        });
    });

    describe('request valid and invalid ad resize useing embed-size API', async () => {
      beforeEach(async () => {
        clock = env.sandbox.useFakeTimers();
        const updateSizeWrapper = env.sandbox.stub(
          adImpl.uiHandler,
          'updateSize'
        );

        updateSizeWrapper.resolves({
          success: false,
          newWidth: 114,
          newHeight: 217,
        });

        // expect to fail, first call invalid request
        iframe.postMessageToParent({
          width: 114,
          height: 217,
          type: 'embed-size',
          sentinel: 'amp3ptest' + testIndex,
        });

        const data = await iframe.expectMessageFromParent('embed-size-denied');

        expect(data).to.jsonEqual({
          requestedWidth: 114,
          requestedHeight: 217,
          type: 'embed-size-denied',
          sentinel: 'amp3ptest' + testIndex,
        });

        updateSizeWrapper.resolves({
          success: true,
          newWidth: 114,
          newHeight: 217,
        });

        // expect to fail invalid request right before 500ms
        iframe.postMessageToParent({
          width: 120,
          height: 217,
          type: 'embed-size',
          sentinel: 'amp3ptest' + testIndex,
        });

        const data2 = await iframe.expectMessageFromParent('embed-size-denied');

        expect(data2).to.jsonEqual({
          requestedWidth: 120,
          requestedHeight: 217,
          type: 'embed-size-denied',
          sentinel: 'amp3ptest' + testIndex,
        });
      });

      it('should be able to use embed-size API, change size deny repeated attempts, but then denies valid attempt before 500ms delay', async () => {
        // expect to fail, valid request, but called before 500ms
        clock.tick(250);

        iframe.postMessageToParent({
          width: 114,
          height: 217,
          type: 'embed-size',
          sentinel: 'amp3ptest' + testIndex,
        });

        const data3 = await iframe.expectMessageFromParent('embed-size-denied');
        expect(data3).to.jsonEqual({
          requestedWidth: 114,
          requestedHeight: 217,
          type: 'embed-size-denied',
          sentinel: 'amp3ptest' + testIndex,
        });
      });

      it('should be able to use embed-size API, change size deny repeated attempts, but then works after 500ms delay', async () => {
        // expect to succeed: valid request right after 500ms
        clock.tick(500);

        iframe.postMessageToParent({
          width: 114,
          height: 217,
          type: 'embed-size',
          sentinel: 'amp3ptest' + testIndex,
        });

        const data3 =
          await iframe.expectMessageFromParent('embed-size-changed');

        expect(data3).to.jsonEqual({
          requestedWidth: 114,
          requestedHeight: 217,
          type: 'embed-size-changed',
          sentinel: 'amp3ptest' + testIndex,
        });
      });
    });

    it('should be able to use embed-size API, change size succeed', () => {
      env.sandbox.stub(adImpl.uiHandler, 'updateSize').callsFake(() => {
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
      return iframe
        .expectMessageFromParent('embed-size-changed')
        .then((data) => {
          expect(data).to.jsonEqual({
            requestedWidth: 114,
            requestedHeight: 217,
            type: 'embed-size-changed',
            sentinel: 'amp3ptest' + testIndex,
          });
          expect(adImpl.uiHandler.adjustPadding).to.be.called;
        });
    });

    it('should be able to use embed-size API to resize height only', () => {
      env.sandbox.stub(adImpl.uiHandler, 'updateSize').callsFake(() => {
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
      return iframe
        .expectMessageFromParent('embed-size-changed')
        .then((data) => {
          expect(data).to.jsonEqual({
            requestedWidth: undefined,
            requestedHeight: 217,
            type: 'embed-size-changed',
            sentinel: 'amp3ptest' + testIndex,
          });
          expect(adImpl.uiHandler.adjustPadding).to.be.called;
        });
    });

    it('should be able to use send-positions API to send position', () => {
      toggleExperiment(window, 'inabox-position-api', true);
      const iframeHandler = new AmpAdXOriginIframeHandler(adImpl);
      const iframe = createIframeWithMessageStub(window);
      iframe.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
      iframe.name = 'test_nomaster';
      iframeHandler.init(iframe);
      env.sandbox
        ./*OK*/ stub(iframeHandler.viewport_, 'getClientRectAsync')
        .callsFake(() => {
          return Promise.resolve(layoutRectLtwh(1, 1, 1, 1));
        });
      env.sandbox
        ./*OK*/ stub(iframeHandler.viewport_, 'getRect')
        .callsFake(() => {
          return layoutRectLtwh(1, 1, 1, 1);
        });
      iframe.postMessageToParent({
        type: 'send-positions',
        sentinel: 'amp3ptest' + testIndex,
      });
      return iframe.expectMessageFromParent('position').then((data) => {
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
        .then((data) => {
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
