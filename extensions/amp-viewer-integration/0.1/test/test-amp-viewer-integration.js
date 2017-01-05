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
      console.log('sending handshake response');
      viewer.confirmHandshake();
      return viewer.waitForDocumentLoaded();
    });
  });

  describe('Unit Tests for messaging.js', () => {
    const viewerOrigin = 'http://localhost:9876';
    const ampDoc = 'http://localhost:8000/examples/everything.amp.max.html';
    const requestProcessor = function() {
      return Promise.resolve();
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
      messaging = new Messaging(
        source, window, viewerOrigin, requestProcessor, ampDoc);
    });

    it('handleMessage_ should call postMessage correctly', () => {
      const sntnl = '__AMPHTML__REQUEST';
      const event = {
        source: window,
        origin: viewerOrigin,
        data: {
          sentinel: sntnl,
          rsvp: true,
        },
      };

      messaging.handleMessage_(event);

      return postMessagePromise.then(function() {
        expect(postMessageSpy).to.have.been.calledOnce;
        expect(postMessageSpy).to.have.been.calledWith({
          payload: undefined,
          requestId: undefined,
          rsvp: false,
          sentinel: '__AMPHTML__RESPONSE',
          type: null,
        });
      });
    });

    it('handleMessage_ should resolve', () => {
      const sntnl = '__AMPHTML__RESPONSE';
      const event = {
        source: window,
        origin: viewerOrigin,
        data: {
          requestId: '1',
          sentinel: sntnl,
          rsvp: true,
          type: 'messageType',
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
      const sntnl = '__AMPHTML__RESPONSE';
      const event = {
        source: window,
        origin: viewerOrigin,
        data: {
          requestId: '1',
          sentinel: sntnl,
          rsvp: true,
          type: 'ERROR',
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

      expect(rejectSpy).to.have.been.calledOnce;
    });

    it('sendRequest should call postMessage correctly', () => {
      const message = 'message';
      const awaitResponse = false;
      const payload = {};
      messaging.sendRequest(message, payload, awaitResponse);

      return postMessagePromise.then(function() {
        expect(postMessageSpy).to.have.been.calledOnce;
        expect(postMessageSpy).to.have.been.calledWith({
          payload: {},
          requestId: '1',
          rsvp: awaitResponse,
          sentinel: '__AMPHTML__REQUEST',
          type: message,
        });
      });
    });

    it('sendResponse_ should call postMessage correctly', () => {
      const payload = {};
      const requestId = '1';
      messaging.sendResponse_(requestId, payload);

      return postMessagePromise.then(function() {
        expect(postMessageSpy).to.have.been.calledOnce;
        expect(postMessageSpy).to.have.been.calledWith({
          payload: {},
          requestId: '1',
          rsvp: false,
          sentinel: '__AMPHTML__RESPONSE',
          type: null,
        });
      });
    });

    it('sendResponseError_ should call postMessage correctly', () => {
      const message = 'ERROR';
      const reason = {};
      const requestId = '1';
      messaging.sendResponseError_(requestId, reason);

      return postMessagePromise.then(function() {
        expect(postMessageSpy).to.have.been.calledOnce;
        expect(postMessageSpy).to.have.been.calledWith({
          payload: reason,
          requestId: '1',
          rsvp: false,
          sentinel: '__AMPHTML__RESPONSE',
          type: message,
        });
      });
    });

    it('sendMessage_ should call postMessage on this.target_', () => {
      const sntnl = 'sntnl';
      const awaitResponse = false;
      const payload = null;
      const requestId = '1';
      const eventType = 'message';
      messaging.sendMessage_(
        sntnl, requestId, eventType, payload, awaitResponse);

      return postMessagePromise.then(function() {
        expect(postMessageSpy).to.have.been.calledOnce;
        expect(postMessageSpy).to.have.been.calledWith({
          payload: null,
          requestId: '1',
          rsvp: awaitResponse,
          sentinel: sntnl,
          type: eventType,
        });
      });
    });
  });
});
