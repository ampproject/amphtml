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

/**
 * Directions: to run this test locally you will need to add ".max" in
 * ampdoc-with-messaging.html line 24 like this:
 * <script src="...amp-viewer-integration-0.1.js"></script> =>
 * <script src="...amp-viewer-integration-0.1.max.js"></script>
 * but don't submit this otherwise the Travis won't build.
 */

import {Messaging} from '../messaging.js';
import {Viewer} from './viewer-messaging-example.js';
import {adopt} from '../../../../src/runtime';
import * as sinon from 'sinon';


adopt(window);

describes.sandboxed('AmpViewerIntegration', {}, () => {
  const ampDocSrc = '/test/fixtures/served/ampdoc-with-messaging.html';

  let viewerEl;
  let viewer;
  describe('Handshake', function() {
    beforeEach(() => {
      const loc = window.location;
      const ampDocUrl =
        `${loc.protocol}//iframe.${loc.hostname}:${loc.port}${ampDocSrc}`;

      viewerEl = document.createElement('div');
      document.body.appendChild(viewerEl);
      viewer = new Viewer(viewerEl, '1', ampDocUrl, true);
      return viewer.waitForHandshakeRequest();
    });

    it('should confirm the handshake', () => {
      console.log('sending handshake response');
      viewer.confirmHandshake();
      return viewer.waitForDocumentLoaded();
    });

    afterEach(() => {
      document.body.removeChild(viewerEl);
    });
  });

  describe('Unit Tests for messaging.js', () => {
    const viewerOrigin = 'http://localhost:9876';
    const ampDoc = 'http://localhost:8000/examples/everything.amp.max.html';
    const requestProcessor = function() {};
    let messaging;

    beforeEach(() => {
      const source = {
        postMessage: function() {},
        addEventListener: function() {},
      };
      messaging = new Messaging(
        source, window, viewerOrigin, requestProcessor, ampDoc);
    });

    afterEach(() => {
      messaging = null;
    });

    it('should initialize correctly', () => {
      expect(messaging.requestProcessor_).to.equal(requestProcessor);
      expect(messaging.target_).to.equal(window);
      expect(messaging.targetOrigin_).to.equal(viewerOrigin);
    });

    it('handleMessage_ should call handleRequest_', () => {
      const src = 'source';
      const orgn = 'origin';
      const sntnl = '__AMPHTML__REQUEST';
      const event = {
        source: src,
        origin: orgn,
        data: {
          sentinel: sntnl,
        },
      };
      sandbox.stub(messaging, 'target_', src);
      sandbox.stub(messaging, 'targetOrigin_', orgn);
      sandbox.stub(messaging, 'handleResponse_', () => {});
      const handleRequest_ =
        sandbox.stub(messaging, 'handleRequest_', () => {});

      messaging.handleMessage_(event);

      sinon.assert.calledWith(handleRequest_);
    });

    it('handleMessage_ should call handleResponse_', () => {
      const src = 'source';
      const orgn = 'origin';
      const sntnl = '__AMPHTML__RESPONSE';
      const event = {
        source: src,
        origin: orgn,
        data: {
          sentinel: sntnl,
        },
      };
      sandbox.stub(messaging, 'target_', src);
      sandbox.stub(messaging, 'targetOrigin_', orgn);
      sandbox.stub(messaging, 'handleRequest_', () => {});
      const handleResponse_ =
        sandbox.stub(messaging, 'handleResponse_', () => {});

      messaging.handleMessage_(event);

      sinon.assert.calledWith(handleResponse_);
    });


    it('sendRequest should call sendMessage_ and have correct input', () => {
      const message = 'message';
      const awaitResponse = false;
      const payload = {};
      const requestId = '1';
      const requestSentinel = '__AMPHTML__REQUEST';

      const sendMessageSpy = sandbox.spy(messaging, 'sendMessage_');

      messaging.sendRequest(message, payload, awaitResponse);

      expect(sendMessageSpy).to.have.been.called;
      expect(sendMessageSpy.getCall(0).args[0]).to.equal(requestSentinel);
      expect(sendMessageSpy.getCall(0).args[1]).to.equal(requestId);
      expect(sendMessageSpy.getCall(0).args[2]).to.equal(message);
      expect(sendMessageSpy.getCall(0).args[3]).to.equal(payload);
      expect(sendMessageSpy.getCall(0).args[4]).to.equal(awaitResponse);
    });


    it('sendResponse_ should call sendMessage_ and have correct input', () => {
      const message = null;
      const awaitResponse = false;
      const payload = {};
      const requestId = '1';
      const requestSentinel = '__AMPHTML__RESPONSE';

      const sendMessageSpy = sandbox.spy(messaging, 'sendMessage_');

      messaging.sendResponse_(requestId, payload);

      expect(sendMessageSpy).to.have.been.called;
      expect(sendMessageSpy.getCall(0).args[0]).to.equal(requestSentinel);
      expect(sendMessageSpy.getCall(0).args[1]).to.equal(requestId);
      expect(sendMessageSpy.getCall(0).args[2]).to.equal(message);
      expect(sendMessageSpy.getCall(0).args[3]).to.equal(payload);
      expect(sendMessageSpy.getCall(0).args[4]).to.equal(awaitResponse);
    });


    it('sendResponseError_ should call sendMessage_ and have correct input',
    () => {
      const message = 'ERROR';
      const awaitResponse = false;
      const reason = {};
      const requestId = '1';
      const requestSentinel = '__AMPHTML__RESPONSE';

      const sendMessageSpy = sandbox.spy(messaging, 'sendMessage_');

      messaging.sendResponseError_(requestId, reason);

      expect(sendMessageSpy).to.have.been.called;
      expect(sendMessageSpy.getCall(0).args[0]).to.equal(requestSentinel);
      expect(sendMessageSpy.getCall(0).args[1]).to.equal(requestId);
      expect(sendMessageSpy.getCall(0).args[2]).to.equal(message);
      expect(sendMessageSpy.getCall(0).args[3]).to.equal(reason);
      expect(sendMessageSpy.getCall(0).args[4]).to.equal(awaitResponse);
    });

    it('sendMessage_ should call postMessage on this.target_', () => {
      const sentinel = 'sntnl';
      const awaitResponse = false;
      const payload = null;
      const requestId = '1';
      const eventType = 'message';

      const postMessageSpy = sandbox.spy(messaging.target_, 'postMessage');

      messaging.sendMessage_(
        sentinel, requestId, eventType, payload, awaitResponse);
      expect(postMessageSpy).to.have.been.called;
    });

  });
});
