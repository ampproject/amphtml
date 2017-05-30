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

import {InaboxMessagingHost} from '../../../ads/inabox/inabox-messaging-host';
import {deserializeMessage} from '../../../src/3p-frame-messaging';
import {
  stubCollapseFrameForTesting,
  stubExpandFrameForTesting,
} from '../../../ads/inabox/frame-overlay-helper';
import * as sinon from 'sinon';

describes.realWin('inabox-host:position-observer', {}, env => {

  let win;
  let host;
  let iframe1;
  let iframe2;
  let iframeUntrusted;

  beforeEach(() => {
    win = env.win;
    iframe1 = win.document.createElement('iframe');
    iframe2 = win.document.createElement('iframe');
    iframeUntrusted = win.document.createElement('iframe');
    win.document.body.appendChild(iframe1);
    win.document.body.appendChild(iframe2);
    win.document.body.appendChild(iframeUntrusted);
    iframe1.contentWindow.postMessage = () => {};
    iframe2.contentWindow.postMessage = () => {};
    iframeUntrusted.contentWindow.postMessage = () => {};
    host = new InaboxMessagingHost(win, [iframe1, iframe2]);
  });

  describe('processMessage', () => {

    it('should process valid message', () => {
      expect(host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'send-positions',
        }),
      })).to.be.true;
    });

    it('should ignore non-string message', () => {
      expect(host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: {x: 1},
      })).to.be.false;
    });

    it('should ignore message without sentinel', () => {
      expect(host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          type: 'send-positions',
        }),
      })).to.be.false;
    });

    it('should ignore message does not start with amp-', () => {
      expect(host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'map-' + JSON.stringify({
          sentinel: '0-123',
          type: 'send-positions',
        }),
      })).to.be.false;
    });

    it('should ignore message from untrusted iframe', () => {
      expect(host.processMessage({
        source: iframeUntrusted.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'send-positions',
        }),
      })).to.be.false;
    });
  });

  describe('send-positions', () => {

    let callback;
    let target;
    let postMessageSpy;

    beforeEach(() => {
      host.positionObserver_ = {
        observe(tgt, cb) {
          target = tgt;
          callback = cb;
        },
      };

      iframe1.contentWindow.postMessage = postMessageSpy = sandbox.stub();
    });

    it('should postMessage on position change', () => {
      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'send-positions',
        }),
      });

      expect(target).to.equal(iframe1);
      callback({x: 1});
      const message = postMessageSpy.getCall(0).args[0];
      const targetOrigin = postMessageSpy.getCall(0).args[1];
      expect(deserializeMessage(message)).to.deep.equal({
        type: 'position',
        sentinel: '0-123',
        x: 1,
      });
      expect(targetOrigin).to.equal('www.example.com');
    });

    it('should not double register', () => {
      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'send-positions',
        }),
      });

      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'send-positions',
        }),
      });

      callback({x: 1});
      expect(postMessageSpy).to.be.calledOnce;
    });
  });

  describe('full-overlay-frame', () => {

    beforeEach(() => {
      iframe1.contentWindow.postMessage = iframePostMessageSpy = sandbox.stub();
    });


    it('should accept request and expand', () => {
      const expandFrame = sandbox.spy((win, iframe, onFinish) => {
        onFinish();
      });

      stubExpandFrameForTesting(expandFrame);

      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'full-overlay-frame'
        }),
      });

      const message = deserializeMessage(
          iframePostMessageSpy.getCall(0).args[0]);
      const targetOrigin = iframePostMessageSpy.getCall(0).args[1];

      expect(expandFrame).calledWith(win, iframe1, sinon.match.any);
      expect(message.type).to.equal('full-overlay-frame-response');
      expect(message.content).to.deep.equal({accept: true});
    });

    it('should accept reset request and collapse', () => {
      const collapseFrame = sandbox.spy((win, iframe, onFinish) => {
        onFinish();
      });

      stubCollapseFrameForTesting(collapseFrame);

      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'reset-full-overlay-frame'
        }),
      });

      const message = deserializeMessage(
          iframePostMessageSpy.getCall(0).args[0]);
      const targetOrigin = iframePostMessageSpy.getCall(0).args[1];

      expect(collapseFrame).calledWith(win, iframe1, sinon.match.any);
      expect(message.type).to.equal('reset-full-overlay-frame-response');
      expect(message.content).to.deep.equal({accept: true});
    });

  });
});
