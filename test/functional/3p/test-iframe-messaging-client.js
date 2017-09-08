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

import {IframeMessagingClient} from '../../../3p/iframe-messaging-client';
import {serializeMessage} from '../../../src/3p-frame-messaging';

describes.realWin('iframe-messaging-client', {}, env => {

  let win;
  let client;
  let postMessageStub;
  let hostWindow;

  beforeEach(() => {
    win = env.win;
    postMessageStub = sandbox.stub();
    hostWindow = {postMessage: postMessageStub};
    client = new IframeMessagingClient(win);
    client.setHostWindow(hostWindow);
    client.setSentinel('sentinel-123');
  });

  describe('makeRequest', () => {
    it('should send the request via postMessage', () => {
      const callbackSpy = sandbox.spy();
      client.makeRequest('request-type', 'response-type', callbackSpy);
      expect(postMessageStub).to.be.calledWith(serializeMessage(
          'request-type', 'sentinel-123', {}, '$internalRuntimeVersion$'));

      postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'}, hostWindow);
      expect(callbackSpy).to.be.calledOnce;
      postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'}, hostWindow);
      expect(callbackSpy).to.be.calledTwice;
    });
  });

  describe('requestOnce', () => {
    it('should unlisten after message received', () => {
      const callbackSpy = sandbox.spy();
      client.requestOnce('request-type', 'response-type', callbackSpy);
      expect(postMessageStub).to.be.calledWith(serializeMessage(
          'request-type', 'sentinel-123', {}, '$internalRuntimeVersion$'));

      postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'}, hostWindow);
      expect(callbackSpy).to.be.calledOnce;
      postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'}, hostWindow);
      expect(callbackSpy).to.be.calledOnce;
    });
  });

  describe('registerCallback', () => {
    it('should invoke callback on receiving a message of' +
        ' expected response type', () => {
      const callbackSpy = sandbox.spy();
      client.registerCallback('response-type', callbackSpy);

      postAmpMessage({
        type: 'response-type',
        sentinel: 'sentinel-123',
        x: 1,
        y: 'abc',
      }, hostWindow);
      expect(callbackSpy).to.be.calledWith({
        type: 'response-type',
        sentinel: 'sentinel-123',
        x: 1,
        y: 'abc',
      });
    });

    it('should invoke multiple callbacks on receiving a message of' +
        ' expected response type', () => {
      const callbackSpy1 = sandbox.spy();
      const callbackSpy2 = sandbox.spy();
      const irrelevantCallbackSpy = sandbox.spy();

      const expectedResponseObject = {
        type: 'response-type',
        sentinel: 'sentinel-123',
        x: 1,
        y: 'abc',
      };

      client.registerCallback('response-type', callbackSpy1);
      client.registerCallback('response-type', callbackSpy2);
      client.registerCallback('irrelevant-response', irrelevantCallbackSpy);

      postAmpMessage({
        type: 'response-type',
        sentinel: 'sentinel-123',
        x: 1,
        y: 'abc',
      }, hostWindow);

      expect(callbackSpy1).to.be.calledWith(expectedResponseObject);
      expect(callbackSpy2).to.be.calledWith(expectedResponseObject);
      expect(irrelevantCallbackSpy).to.not.be.called;
    });

    it('should not invoke callback on receiving a message of' +
        ' irrelevant response type', () => {
      const callbackSpy = sandbox.spy();
      client.registerCallback('response-type', callbackSpy);

      postAmpMessage(
          {type: 'response-type-2', sentinel: 'sentinel-123'}, hostWindow);
      expect(callbackSpy).to.not.be.called;
    });

    it('should not invoke callback on receiving a non-AMP message', () => {
      const callbackSpy = sandbox.spy();
      client.registerCallback('response-type', callbackSpy);

      win.eventListeners.fire({
        type: 'message',
        source: hostWindow,
        origin: 'http://www.example.com',
        data: 'nonamp-' + JSON.stringify({
          type: 'response-type',
          sentinel: 'sentinel-123',
        }),
      });
      expect(callbackSpy).to.not.be.called;
    });

    it('should not invoke callback on receiving a message ' +
        'not from host window', () => {
      const callbackSpy = sandbox.spy();
      client.registerCallback('response-type', callbackSpy);
      const randomWindow = {};

      postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'}, randomWindow);
      expect(callbackSpy).to.not.be.called;
    });

    it('should not invoke callback on receiving a message ' +
        'containing no sentinel', () => {
      const callbackSpy = sandbox.spy();
      client.registerCallback('response-type', callbackSpy);

      postAmpMessage({type: 'response-type'}, hostWindow);
      expect(callbackSpy).to.not.be.called;
    });

    it('should not invoke callback on receiving a message ' +
        'containing wrong sentinel', () => {
      const callbackSpy = sandbox.spy();
      client.registerCallback('response-type', callbackSpy);

      postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123-1'}, hostWindow);
      expect(callbackSpy).to.not.be.called;
    });
  });

  describe('sendMessage', () => {
    it('should send postMessage to host window', () => {
      client.sendMessage('request-type', {x: 1, y: 'abc'});
      expect(postMessageStub).to.be.calledWith(serializeMessage(
          'request-type',
          'sentinel-123',
          {x: 1, y: 'abc'},
          '$internalRuntimeVersion$'));
    });
  });

  function postAmpMessage(data, source) {
    win.eventListeners.fire({
      type: 'message',
      source,
      origin: 'http://www.example.com',
      data: 'amp-' + JSON.stringify(data),
    });
  }
});
