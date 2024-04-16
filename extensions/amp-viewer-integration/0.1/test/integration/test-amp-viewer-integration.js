import {done} from 'fetch-mock';

import {getSourceUrl} from '../../../../../src/url';
import {AmpViewerIntegration} from '../../amp-viewer-integration';
import {
  Messaging,
  WindowPortEmulator,
  parseMessage,
} from '../../messaging/messaging';
import {ViewerForTesting} from '../../viewer-for-testing';

describes.sandboxed('amp-viewer-integration', {}, () => {
  const ampDocSrc = '/test/fixtures/served/ampdoc-with-messaging.html';
  let viewerEl;
  let viewer;
  let ampDocUrl;

  beforeEach(() => {
    const loc = window.location;
    ampDocUrl = `${loc.protocol}//iframe.${loc.hostname}:${loc.port}${ampDocSrc}`;

    viewerEl = document.createElement('div');
    document.body.appendChild(viewerEl);
    viewer = new ViewerForTesting(viewerEl, '1', ampDocUrl, true);
  });

  afterEach(() => {
    document.body.removeChild(viewerEl);
  });

  it('should confirm the handshake', async () => {
    await viewer.waitForHandshakeRequest();
    viewer.confirmHandshake();
    await viewer.waitForDocumentLoaded();
    expect(viewer.hasDocumentLoaded_).to.be.true;
  });
});

describes.realWin(
  'amp-viewer-integration with messaging',
  {
    amp: {
      location: 'https://cdn.ampproject.org/c/s/www.example.com/path',
      params: {
        origin: 'https://example.com',
      },
    },
  },
  (env) => {
    describe('Open Channel', () => {
      class Messaging {
        constructor() {}
        sendRequest() {}
        setup_() {}
        setDefaultHandler() {}
        registerHandler() {}
      }

      let win;
      let messaging;
      let ampViewerIntegration;
      let origin;
      let viewer, viewerEl, ampDocUrl;
      const loc = window.location;
      const ampDocSrc = '/test/fixtures/served/ampdoc-with-messaging.html';

      beforeEach(() => {
        win = env.win;
        ampDocUrl = `${loc.protocol}//iframe.${loc.hostname}:${loc.port}${ampDocSrc}`;
        viewerEl = document.createElement('div');
        viewer = new ViewerForTesting(viewerEl, '1', ampDocUrl, true);
        ampViewerIntegration = new AmpViewerIntegration(win);
        messaging = new Messaging();
        origin = 'http://localhost:9876';
      });

      it('should handle unload correctly', async () => {
        env.sandbox.stub(messaging, 'sendRequest').callsFake(() => {
          return Promise.resolve();
        });

        ampViewerIntegration.openChannelAndStart_(
          viewer,
          env.ampdoc,
          origin,
          messaging
        );

        win.eventListeners.fire({type: 'unload'});

        ampViewerIntegration.handleUnload_(messaging).then(() => {
          done();
        });
      });

      it('should start with the correct message', () => {
        const sendRequestSpy = env.sandbox
          .stub(messaging, 'sendRequest')
          .callsFake(() => {
            return Promise.resolve();
          });

        ampViewerIntegration.openChannelAndStart_(
          viewer,
          env.ampdoc,
          origin,
          messaging
        );

        const ampdocUrl = env.ampdoc.getUrl();
        const srcUrl = getSourceUrl(ampdocUrl);

        expect(sendRequestSpy).to.have.been.calledOnce;
        expect(sendRequestSpy.lastCall.args[0]).to.equal('channelOpen');
        expect(sendRequestSpy.lastCall.args[1].sourceUrl).to.equal(srcUrl);
        expect(sendRequestSpy.lastCall.args[1].url).to.equal(ampdocUrl);
        expect(sendRequestSpy.lastCall.args[2]).to.equal(true);
      });

      it('should not initiate touch handler without capability', () => {
        env.sandbox.stub(messaging, 'sendRequest').callsFake(() => {
          return Promise.resolve();
        });
        const initTouchHandlerStub = env.sandbox.stub(
          ampViewerIntegration,
          'initTouchHandler_'
        );
        ampViewerIntegration.openChannelAndStart_(
          viewer,
          env.ampdoc,
          origin,
          messaging
        );

        expect(initTouchHandlerStub).to.not.be.called;
      });

      it('should initiate touch handler with capability', () => {
        env.sandbox.stub(messaging, 'sendRequest').callsFake(() => {
          return Promise.resolve();
        });
        env.sandbox
          .stub(viewer, 'hasCapability')
          .withArgs('swipe')
          .returns(true);
        const initTouchHandlerStub = env.sandbox.stub(
          ampViewerIntegration,
          'initTouchHandler_'
        );
        ampViewerIntegration.unconfirmedViewerOrigin_ = '';
        ampViewerIntegration
          .openChannelAndStart_(viewer, env.ampdoc, origin, messaging)
          .then(() => {
            expect(initTouchHandlerStub).to.be.called;
          });
      });

      it('should not initiate keyboard handler without capability', () => {
        env.sandbox.stub(messaging, 'sendRequest').callsFake(() => {
          return Promise.resolve();
        });
        const initKeyboardHandlerStub = env.sandbox.stub(
          ampViewerIntegration,
          'initKeyboardHandler_'
        );
        ampViewerIntegration.openChannelAndStart_(
          viewer,
          env.ampdoc,
          origin,
          messaging
        );

        expect(initKeyboardHandlerStub).to.not.be.called;
      });

      it('should initiate keyboard handler with capability', () => {
        env.sandbox.stub(messaging, 'sendRequest').callsFake(() => {
          return Promise.resolve();
        });
        env.sandbox
          .stub(viewer, 'hasCapability')
          .withArgs('keyboard')
          .returns(true);
        const initKeyboardHandlerStub = env.sandbox.stub(
          ampViewerIntegration,
          'initKeyboardHandler_'
        );
        ampViewerIntegration.unconfirmedViewerOrigin_ = '';
        ampViewerIntegration
          .openChannelAndStart_(viewer, env.ampdoc, origin, messaging)
          .then(() => {
            expect(initKeyboardHandlerStub).to.be.called;
          });
      });

      it('should initiate focus handler with capability', () => {
        env.sandbox.stub(messaging, 'sendRequest').callsFake(() => {
          return Promise.resolve();
        });
        env.sandbox
          .stub(viewer, 'hasCapability')
          .withArgs('focus-rect')
          .returns(true);
        const initFocusHandlerStub = env.sandbox.stub(
          ampViewerIntegration,
          'initFocusHandler_'
        );
        ampViewerIntegration.unconfirmedViewerOrigin_ = '';
        ampViewerIntegration
          .openChannelAndStart_(viewer, env.ampdoc, origin, messaging)
          .then(() => {
            expect(initFocusHandlerStub).to.be.called;
          });
      });
    });
  }
);

describes.sandboxed
  .configure()
  .ifChrome()
  .run('Unit Tests for messaging.js', {}, () => {
    describes.sandboxed('amp-viewer-integration', {}, (env) => {
      const viewerOrigin = 'http://localhost:9876';
      const messagingToken = '32q4pAwei09W845V3j24o8OJIO3fE9l3q49p';
      const requestProcessor = function () {
        return Promise.resolve({});
      };
      let messaging;
      let postMessagePromise;
      let postMessageSpy;

      beforeEach(() => {
        let postMessageResolve;
        postMessagePromise = new Promise((resolve) => {
          postMessageResolve = resolve;
        });

        const port = new WindowPortEmulator(window, viewerOrigin);
        port.addEventListener = function () {};
        port.postMessage = function () {};

        postMessageSpy = env.sandbox.stub(port, 'postMessage').callsFake(() => {
          postMessageResolve();
        });

        messaging = new Messaging(
          window,
          port,
          /* opt_isWebview= */ false,
          messagingToken
        );
        messaging.setDefaultHandler(requestProcessor);
      });

      it('handleMessage_ should call postMessage correctly', () => {
        const event = {
          source: window,
          origin: viewerOrigin,
          data: {
            app: '__AMPHTML__',
            name: 'message',
            type: 'q',
            requestid: 1,
            rsvp: true,
          },
        };

        messaging.handleMessage_(event);

        return postMessagePromise.then(function () {
          expect(postMessageSpy).to.have.been.calledOnce;
          expect(postMessageSpy).to.have.been.calledWith({
            app: '__AMPHTML__',
            data: {},
            messagingToken,
            name: 'message',
            requestid: 1,
            type: 's',
          });
        });
      });

      it('handleMessage_ should resolve', () => {
        const data = {
          time: 12345678,
          id: 'abcdefg',
        };

        const event = {
          source: env.win,
          origin: viewerOrigin,
          data: {
            app: '__AMPHTML__',
            data: JSON.stringify(data),
            name: 'messageName',
            requestid: 1,
            rsvp: true,
            type: 's',
          },
        };

        const resolveSpy = env.sandbox.stub();
        const rejectSpy = env.sandbox.stub();
        messaging.waitingForResponse_ = {
          '1': {
            resolve: resolveSpy,
            reject: rejectSpy,
          },
        };

        messaging.handleMessage_(event);

        expect(resolveSpy).to.have.been.calledOnce;
        expect(resolveSpy).to.have.been.calledWith(JSON.stringify(data));
      });

      it('handleMessage_ should resolve with correct data', () => {
        const data = 12345;

        const event = {
          source: env.win,
          origin: viewerOrigin,
          data: {
            app: '__AMPHTML__',
            data,
            name: 'messageName',
            requestid: 1,
            rsvp: true,
            type: 's',
          },
        };

        const resolveSpy = env.sandbox.stub();
        const rejectSpy = env.sandbox.stub();
        messaging.waitingForResponse_ = {
          '1': {
            resolve: resolveSpy,
            reject: rejectSpy,
          },
        };

        messaging.handleMessage_(event);

        expect(resolveSpy).to.have.been.calledWith(data);
      });

      it('handleMessage_ should reject', () => {
        const event = {
          source: env.win,
          origin: viewerOrigin,
          data: {
            app: '__AMPHTML__',
            data: {},
            error: 'reason',
            name: null,
            requestid: 1,
            rsvp: true,
            type: 's',
          },
        };

        const resolveSpy = env.sandbox.stub();
        const rejectSpy = env.sandbox.stub();
        messaging.waitingForResponse_ = {
          '1': {
            resolve: resolveSpy,
            reject: rejectSpy,
          },
        };

        const logErrorSpy = env.sandbox.stub(messaging, 'logError_');

        messaging.handleMessage_(event);

        expect(rejectSpy).to.have.been.calledOnce;
        expect(logErrorSpy).to.have.been.calledOnce;
        expect(logErrorSpy).to.have.been.calledWith(
          'amp-viewer-messaging: handleResponse_ error: ',
          'reason'
        );
      });

      it('sendRequest should call postMessage correctly', () => {
        const message = 'message';
        const awaitResponse = false;
        const payload = {};
        messaging.sendRequest(message, payload, awaitResponse);

        return postMessagePromise.then(function () {
          expect(postMessageSpy).to.have.been.calledOnce;
          expect(postMessageSpy).to.have.been.calledWith({
            app: '__AMPHTML__',
            data: {},
            messagingToken,
            name: message,
            requestid: 1,
            rsvp: awaitResponse,
            type: 'q',
          });
        });
      });

      it('sendResponse_ should call postMessage correctly', () => {
        const mName = 'name';
        const payload = {};
        const requestId = 1;
        messaging.sendResponse_(requestId, mName, payload);

        return postMessagePromise.then(function () {
          expect(postMessageSpy).to.have.been.calledOnce;
          expect(postMessageSpy).to.have.been.calledWith({
            app: '__AMPHTML__',
            data: {},
            messagingToken,
            name: mName,
            requestid: 1,
            type: 's',
          });
        });
      });

      it('sendResponseError_ should call postMessage correctly', () => {
        const mName = 'name';
        const err = new Error('reason');
        const errString = messaging.errorToString_(err);
        const requestId = 1;
        const logErrorSpy = env.sandbox.stub(messaging, 'logError_');
        messaging.sendResponseError_(requestId, mName, err);

        return postMessagePromise.then(function () {
          expect(postMessageSpy).to.have.been.calledOnce;
          expect(postMessageSpy).to.have.been.calledWith({
            app: '__AMPHTML__',
            data: null,
            error: errString,
            messagingToken,
            name: mName,
            requestid: 1,
            type: 's',
          });

          expect(logErrorSpy).to.have.been.calledOnce;
          const state =
            'amp-viewer-messaging: sendResponseError_, message name: name';
          expect(logErrorSpy).to.have.been.calledWith(state, errString);
        });
      });

      it('should parseMessage correctly', () => {
        const obj = {bla: 'la'};
        const json = JSON.stringify(obj);
        const badJson = '{a:b';
        let parsedCorrectly;
        parsedCorrectly = parseMessage(json);
        expect(parsedCorrectly.bla).to.equal('la');
        parsedCorrectly = parseMessage(obj);
        expect(parsedCorrectly.bla).to.equal('la');
        expect(parseMessage('should return null')).to.be.null;
        expect(parseMessage(badJson)).to.be.null;
      });
    });
  });
