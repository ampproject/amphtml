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

import {Messaging} from '../messaging.js';
import {ViewerForTesting} from './viewer-for-testing.js';


describes.sandboxed('AmpViewerIntegration', {}, () => {
  const ampDocSrc = '/test/fixtures/served/ampdoc-with-messaging.html';
  describe('Handshake', function() {
    let viewerEl;
    let viewer;

    beforeEach(() => {
      const loc = window.location;
      const ampDocUrl =
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
  });

  describe('Unit Tests for messaging.js', () => {
    const viewerOrigin = 'http://localhost:9876';
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
      postMessageSpy = sandbox.stub(window, 'postMessage', () => {
        postMessageResolve();
      });

      const source = {
        postMessage: function() {},
        addEventListener: function() {},
      };
      messaging = new Messaging(source, window, viewerOrigin);
      messaging.setRequestProcessor(requestProcessor);
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
          name: 'message',
          requestid: 1,
          type: 's',
        });
      });
    });

    it('handleMessage_ should resolve', () => {
      const event = {
        source: window,
        origin: viewerOrigin,
        data: {
          app: '__AMPHTML__',
          data: null,
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

      sandbox.stub(messaging, 'waitingForResponse_', waitingForResponse);
      messaging.handleMessage_(event);

      expect(resolveSpy).to.have.been.calledOnce;
    });

    it('handleMessage_ should reject', () => {
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
      sandbox.stub(messaging, 'waitingForResponse_', waitingForResponse);
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
  });
});
