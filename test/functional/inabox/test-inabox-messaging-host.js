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

import * as sinon from 'sinon';
import {InaboxMessagingHost} from '../../../ads/inabox/inabox-messaging-host';
import {deserializeMessage} from '../../../src/3p-frame-messaging';
import {layoutRectLtwh} from '../../../src/layout-rect';

describes.realWin('inabox-host:messaging', {}, env => {

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
    let postMessageSpy;

    beforeEach(() => {
      iframe1.contentWindow.postMessage = postMessageSpy = sandbox.stub();
    });

    it('should send position back', () => {
      sandbox.stub(host.positionObserver_, 'getViewportRect').callsFake(() => {
        return layoutRectLtwh(10, 10, 100, 100);
      });
      sandbox.stub(host.positionObserver_, 'observe').callsFake(() => {});
      iframe1.getBoundingClientRect =
          () => {return layoutRectLtwh(5, 5, 20, 20);};
      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'send-positions',
        }),
      });
      const message = postMessageSpy.getCall(0).args[0];
      const targetOrigin = postMessageSpy.getCall(0).args[1];
      expect(deserializeMessage(message)).to.deep.equal({
        type: 'position',
        sentinel: '0-123',
        viewportRect: layoutRectLtwh(10, 10, 100, 100),
        targetRect: layoutRectLtwh(5, 5, 20, 20),
      });
      expect(targetOrigin).to.equal('www.example.com');
    });

    it('should not throw error if postMessage undefined', () => {
      iframe1.contentWindow.postMessage = undefined;
      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'send-positions',
        }),
      });
    });
  });

  describe('send-positions position observer callback', () => {

    let callback;
    let target;
    let postMessageSpy;

    beforeEach(() => {
      host.positionObserver_ = {
        observe(tgt, cb) {
          target = tgt;
          callback = cb;
        },
        getViewportRect() {},
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
      expect(postMessageSpy).to.be.calledTwice;
      const message = postMessageSpy.getCall(1).args[0];
      const targetOrigin = postMessageSpy.getCall(1).args[1];
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

      postMessageSpy.reset();
      callback({x: 1});
      expect(postMessageSpy).to.be.calledOnce;
    });
  });

  describe('full-overlay-frame', () => {

    let iframePostMessageSpy;

    beforeEach(() => {
      iframe1.contentWindow.postMessage = iframePostMessageSpy = sandbox.stub();
    });


    it('should accept request and expand', () => {
      const boxRect = {a: 1, b: 2}; // we don't care

      const expandFrame = sandbox./*OK*/stub(
          host.frameOverlayManager_, 'expandFrame').callsFake(
          (iframe, callback) => {
            callback(boxRect);
          });

      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'full-overlay-frame',
        }),
      });

      const message = deserializeMessage(
          iframePostMessageSpy.getCall(0).args[0]);

      expect(expandFrame).calledWith(iframe1, sinon.match.any);
      expect(message.type).to.equal('full-overlay-frame-response');
      expect(message.success).to.be.true;
      expect(message.boxRect).to.deep.equal(boxRect);
    });

    it('should accept reset request and collapse', () => {
      const boxRect = {c: 1, d: 2}; // we don't care

      const collapseFrame = sandbox./*OK*/stub(
          host.frameOverlayManager_, 'collapseFrame').callsFake(
          (iframe, callback) => {
            callback(boxRect);
          });

      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'cancel-full-overlay-frame',
        }),
      });

      const message = deserializeMessage(
          iframePostMessageSpy.getCall(0).args[0]);

      expect(collapseFrame).calledWith(iframe1, sinon.match.any);
      expect(message.type).to.equal('cancel-full-overlay-frame-response');
      expect(message.success).to.be.true;
      expect(message.boxRect).to.deep.equal(boxRect);
    });

    it('should not error if postMessage undefined', () => {
      iframe1.contentWindow.postMessage = undefined;
      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'full-overlay-frame',
        }),
      });
    });

    it('should not error if postMessage undefined, cancel msg', () => {
      iframe1.contentWindow.postMessage = undefined;
      host.processMessage({
        source: iframe1.contentWindow,
        origin: 'www.example.com',
        data: 'amp-' + JSON.stringify({
          sentinel: '0-123',
          type: 'cancel-full-overlay-frame',
        }),
      });
    });

  });

  function createNestedIframeMocks(depth, numXDomain) {
    numXDomain = numXDomain || 0;
    const topWin = {};
    topWin['top'] = topWin['parent'] = topWin;
    let parent = topWin;
    for (let i = 1; i < depth; i++) {
      const win = {
        top: topWin,
        parent,
        location: {
          href: `www.${i}.com`,
        },
      };
      win.parent['document'] = {
        querySelectorAll: () => {
          const frame = {
            contentWindow: win,
          };
          return [frame];
        },
      };
      if (depth - i <= numXDomain) {
        breakCanInspectWindowForWindow(win);
      } else {
        win['frameElement'] = {
          contentWindow: win,
        };
      }
      parent = win;
    }
    return {source: parent, topWin};
  }

  function breakCanInspectWindowForWindow(win) {
    Object.defineProperty(win['location'], 'href', {
      get: () => {throw new Error('Error!!');},
    });
    Object.defineProperty(win, 'test', {
      get: () => {throw new Error('Error!!');},
    });
  }

  describe('getMeasureableFrame', () => {
    it('should return correct frame when many iframes at same level', () => {
      const source = createNestedIframeMocks(6,3).source;
      const expectedMeasureableWin = source.parent.parent;
      const correctFrame =
            expectedMeasureableWin.parent.document.querySelectorAll()[0];
      expectedMeasureableWin.parent.document.querySelectorAll = () => {
        const f1 = {};
        const f2 = {};
        const f3 = {};
        return [f1, f2, correctFrame, f3];
      };
      expect(host.getMeasureableFrame(source).contentWindow).to.deep.equal(
          expectedMeasureableWin);
    });

    it('should return correct frame multiple level of xdomain', () => {
      const source = createNestedIframeMocks(6,3).source;
      const expectedMeasurableWin = source.parent.parent;
      expect(host.getMeasureableFrame(source).contentWindow).to.deep.equal(
          expectedMeasurableWin);
    });

    it('should return correct frame for single xdomain frame', () => {
      const source = createNestedIframeMocks(10,1).source;
      expect(host.getMeasureableFrame(source).contentWindow).to.deep.equal(
          source);
    });

    it('should return correct frame for no xdomain frames', () => {
      const source = createNestedIframeMocks(5).source;
      expect(host.getMeasureableFrame(source).contentWindow).to.deep.equal(
          source);
    });
  });

  describe('getFrameElement', () => {
    const sentinel = '123456789101112';

    it('should return correct frame when intermediate xdomain frames', () => {
      const iframeObj = createNestedIframeMocks(6,3);
      const sourceMock = iframeObj.source;
      const topWinMock = iframeObj.topWin;
      const frameMock = topWinMock.document.querySelectorAll()[0];
      const expectedWin = sourceMock.parent.parent;
      host = new InaboxMessagingHost(win, [frameMock]);
      expect(host.getFrameElement_(sourceMock, sentinel).contentWindow
      ).to.deep.equal(expectedWin);
    });

    it('should return correct frame when all frames friendly', () => {
      const iframeObj = createNestedIframeMocks(6);
      const sourceMock = iframeObj.source;
      const topWinMock = iframeObj.topWin;
      const frameMock = topWinMock.document.querySelectorAll()[0];
      const expectedWin = sourceMock;
      host = new InaboxMessagingHost(win, [frameMock]);
      expect(host.getFrameElement_(sourceMock, sentinel).contentWindow
      ).to.deep.equal(expectedWin);
    });

    it('should return correct frame when many frames registered', () => {
      const iframeObj = createNestedIframeMocks(6);
      const sourceMock = iframeObj.source;
      const topWinMock = iframeObj.topWin;
      const frameMockWrong1 = {};
      const frameMockWrong2 = {};
      const frameMock = topWinMock.document.querySelectorAll()[0];
      const expectedWin = sourceMock;
      host = new InaboxMessagingHost(
          win, [frameMockWrong1, frameMockWrong2, frameMock]);
      expect(host.getFrameElement_(sourceMock, sentinel).contentWindow
      ).to.deep.equal(expectedWin);
    });

    it('should return cached frame', () => {
      host.getMeasureableFrame = () => {
        throw new Error('Error!!');
      };
      const creativeWinMock = {};
      const creativeIframeMock = {};
      host.iframeMap_[sentinel] = creativeIframeMock;
      expect(host.getFrameElement_(creativeWinMock, sentinel)
      ).to.equal(creativeIframeMock);
    });

    it('should return null if frame is not registered', () => {
      const iframeObj = createNestedIframeMocks(6,3);
      const sourceMock = iframeObj.source;
      expect(host.getFrameElement_(sourceMock, sentinel)).to.be.null;
    });

    it('should return null if frame is more than 10 levels deep', () => {
      const iframeObj = createNestedIframeMocks(12,1);
      const sourceMock = iframeObj.source;
      const topWinMock = iframeObj.topWin;
      const frameMock = topWinMock.document.querySelectorAll()[0];
      host = new InaboxMessagingHost(win, [frameMock]);
      expect(host.getFrameElement_(sourceMock, sentinel)).to.be.null;
    });
  });
});
