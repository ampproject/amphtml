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

import {AmpViewerIntegration} from '../../amp-viewer-integration';
import {
  Messaging,
  WindowPortEmulator,
  parseMessage,
} from '../../messaging/messaging';
import {ViewerForTesting} from '../../viewer-for-testing';
import {getSourceUrl} from '../../../../../src/url';


describes.sandboxed('AmpViewerIntegration', {}, () => {
  const ampDocSrc = '/test/fixtures/served/ampdoc-with-messaging.html';
  // TODO(aghassemi): Investigate failure in beforeEach. #10974.
  describe.skip('Handshake', function() {
    let viewerEl;
    let viewer;
    let ampDocUrl;

    beforeEach(() => {
      const loc = window.location;
      ampDocUrl =
        `${loc.protocol}//iframe.${loc.hostname}:${loc.port}${ampDocSrc}`;

      viewerEl = document.createElement('div');
      document.body.appendChild(viewerEl);
      viewer = new ViewerForTesting(viewerEl, '1', ampDocUrl, true);
      return viewer.waitForHandshakeRequest();
    });

    afterEach(() => {
      document.body.removeChild(viewerEl);
    });

    it('should confirm the handshake', () => {
      console/*OK*/.log('sending handshake response');
      viewer.confirmHandshake();
      return viewer.waitForDocumentLoaded();
    });

    it('should handle unload correctly', () => {
      viewer.confirmHandshake();
      viewer.waitForDocumentLoaded().then(() => {
        const stub = sandbox.stub(viewer, 'handleUnload_');
        window.eventListeners.fire({type: 'unload'});
        expect(stub).to.be.calledOnce;
      });
    });


    describes.realWin('amp-viewer-integration', {
      amp: {
        location: 'https://cdn.ampproject.org/c/s/www.example.com/path',
        params: {
          origin: 'https://example.com',
        },
      },
    }, env => {
      describe.configure().run('Open Channel', () => {
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

        beforeEach(() => {
          win = document.createElement('div');
          win.document = document.createElement('div');
          ampViewerIntegration = new AmpViewerIntegration(win);
          messaging = new Messaging();
          origin = 'http://localhost:9876';
        });

        it('should start with the correct message', () => {
          const sendRequestSpy =
              sandbox.stub(messaging, 'sendRequest').callsFake(() => {
                return Promise.resolve();
              });

          ampViewerIntegration.openChannelAndStart_(
              viewer, env.ampdoc, origin, messaging);

          const ampdocUrl = env.ampdoc.getUrl();
          const srcUrl = getSourceUrl(ampdocUrl);

          expect(sendRequestSpy).to.have.been.calledOnce;
          expect(sendRequestSpy.lastCall.args[0]).to.equal('channelOpen');
          expect(sendRequestSpy.lastCall.args[1].sourceUrl).to.equal(srcUrl);
          expect(sendRequestSpy.lastCall.args[1].url).to.equal(ampdocUrl);
          expect(sendRequestSpy.lastCall.args[2]).to.equal(true);
        });

        it('should not initiate touch handler without capability', () => {
          sandbox.stub(messaging, 'sendRequest').callsFake(() => {
            return Promise.resolve();
          });
          const initTouchHandlerStub =
            sandbox.stub(ampViewerIntegration, 'initTouchHandler_');
          ampViewerIntegration.openChannelAndStart_(
              viewer, env.ampdoc, origin, messaging);

          expect(initTouchHandlerStub).to.not.be.called;
        });

        it('should initiate touch handler with capability', () => {
          sandbox.stub(messaging, 'sendRequest').callsFake(() => {
            return Promise.resolve();
          });
          sandbox.stub(viewer, 'hasCapability').withArgs('swipe').returns(true);
          const initTouchHandlerStub =
            sandbox.stub(ampViewerIntegration, 'initTouchHandler_');
          ampViewerIntegration.unconfirmedViewerOrigin_ = '';
          ampViewerIntegration.openChannelAndStart_(
              viewer, env.ampdoc, origin, messaging).then(() => {
            expect(initTouchHandlerStub).to.be.called;
          });
        });

        it('should not initiate keyboard handler without capability', () => {
          sandbox.stub(messaging, 'sendRequest').callsFake(() => {
            return Promise.resolve();
          });
          const initKeyboardHandlerStub =
            sandbox.stub(ampViewerIntegration, 'initKeyboardHandler_');
          ampViewerIntegration.openChannelAndStart_(
              viewer, env.ampdoc, origin, messaging);

          expect(initKeyboardHandlerStub).to.not.be.called;
        });

        it('should initiate keyboard handler with capability', () => {
          sandbox.stub(messaging, 'sendRequest').callsFake(() => {
            return Promise.resolve();
          });
          sandbox.stub(viewer, 'hasCapability').withArgs('keyboard')
              .returns(true);
          const initKeyboardHandlerStub =
            sandbox.stub(ampViewerIntegration, 'initKeyboardHandler_');
          ampViewerIntegration.unconfirmedViewerOrigin_ = '';
          ampViewerIntegration.openChannelAndStart_(
              viewer, env.ampdoc, origin, messaging).then(() => {
            expect(initKeyboardHandlerStub).to.be.called;
          });
        });

        it('should initiate focus handler with capability', () => {
          sandbox.stub(messaging, 'sendRequest').callsFake(() => {
            return Promise.resolve();
          });
          sandbox.stub(viewer, 'hasCapability').withArgs('focus-rect')
              .returns(true);
          const initFocusHandlerStub =
            sandbox.stub(ampViewerIntegration, 'initFocusHandler_');
          ampViewerIntegration.unconfirmedViewerOrigin_ = '';
          ampViewerIntegration.openChannelAndStart_(
              viewer, env.ampdoc, origin, messaging).then(() => {
            expect(initFocusHandlerStub).to.be.called;
          });
        });
      });
    });
  });

  describe.configure().ifChrome().run('Unit Tests for messaging.js', () => {
    const viewerOrigin = 'http://localhost:9876';
    const messagingToken = '32q4pAwei09W845V3j24o8OJIO3fE9l3q49p';
    const requestProcessor = function() {
      return Promise.resolve({});
    };
    let messaging;
    let postMessagePromise;
    let postMessageSpy;

    beforeEach(() => {
      let postMessageResolve;
      postMessagePromise = new Promise(resolve => {
        postMessageResolve = resolve;
      });

      const port = new WindowPortEmulator(
          window, viewerOrigin);
      port.addEventListener = function() {};
      port.postMessage = function() {};

      postMessageSpy = sandbox.stub(port, 'postMessage').callsFake(() => {
        postMessageResolve();
      });

      messaging = new Messaging(
          window, port, /* opt_isWebview= */ false, messagingToken);
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

      return postMessagePromise.then(function() {
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

    // TODO(chenshay, #12476): Make this test work with sinon 4.0.
    it.skip('handleMessage_ should resolve', () => {
      const data = {
        time: 12345678,
        id: 'abcdefg',
      };

      const event = {
        source: window,
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

      const resolveSpy = sandbox.stub();
      const rejectSpy = sandbox.stub();
      const waitingForResponse = {'1': {
        resolve: resolveSpy,
        reject: rejectSpy,
      }};

      sandbox.stub(messaging, 'waitingForResponse_').callsFake(
          waitingForResponse);
      messaging.handleMessage_(event);

      expect(resolveSpy).to.have.been.calledOnce;
      expect(resolveSpy).to.have.been.calledWith(JSON.stringify(data));
    });

    // TODO(chenshay, #12476): Make this test work with sinon 4.0.
    it.skip('handleMessage_ should resolve with correct data', () => {
      const data = 12345;

      const event = {
        source: window,
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

      const resolveSpy = sandbox.stub();
      const rejectSpy = sandbox.stub();
      const waitingForResponse = {'1': {
        resolve: resolveSpy,
        reject: rejectSpy,
      }};

      sandbox.stub(messaging, 'waitingForResponse_').callsFake(
          waitingForResponse);
      messaging.handleMessage_(event);

      expect(resolveSpy).to.have.been.calledWith(data);
    });

    // TODO(chenshay, #12476): Make this test work with sinon 4.0.
    it.skip('handleMessage_ should reject', () => {
      const event = {
        source: window,
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

      const resolveSpy = sandbox.stub();
      const rejectSpy = sandbox.stub();
      const waitingForResponse = {'1': {
        resolve: resolveSpy,
        reject: rejectSpy,
      }};

      const logErrorSpy = sandbox.stub(messaging, 'logError_');
      sandbox.stub(messaging, 'waitingForResponse_').callsFake(
          waitingForResponse);
      messaging.handleMessage_(event);

      expect(rejectSpy).to.have.been.calledOnce;

      expect(logErrorSpy).to.have.been.calledOnce;

      expect(logErrorSpy).to.have.been.calledWith(
          'amp-viewer-messaging: handleResponse_ error: ',
          'reason');
    });

    it('sendRequest should call postMessage correctly', () => {
      const message = 'message';
      const awaitResponse = false;
      const payload = {};
      messaging.sendRequest(message, payload, awaitResponse);

      return postMessagePromise.then(function() {
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

      return postMessagePromise.then(function() {
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
      const logErrorSpy = sandbox.stub(messaging, 'logError_');
      messaging.sendResponseError_(requestId, mName, err);

      return postMessagePromise.then(function() {
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
        const state = 'amp-viewer-messaging: sendResponseError_, ' +
          'Message name: name';
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
