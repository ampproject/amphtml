/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {Messaging} from '../messaging/messaging';
import {TouchHandler} from '../touch-handler';

function fakeTouchEvent(type) {
  return {
    type,
    'pageX': 10,
    'pageY': 20,
    'thisshouldnotgetcopied': 'bla',
    touches: [
      {
        'clientX': 20,
        'clientY': 30,
        'screenX': 10,
        'screenY': 20,
        'dontcopythis': 234,
      },
    ],
    changedTouches: [
      {'clientX': 20, 'clientY': 30, 'screenX': 10, 'screenY': 20},
    ],
    cancelable: true,
    preventDefault() {},
  };
}

describes.fakeWin('TouchHandler', {}, (env) => {
  describe('TouchHandler Unit Tests', function () {
    class WindowPortEmulator {
      constructor(win, origin) {
        /** @const {!Window} */
        this.win = win;
        /** @private {string} */
        this.origin_ = origin;
      }

      addEventListener() {}

      postMessage(data, origin) {
        messages.push({
          data,
          origin,
        });
      }
      start() {}
    }

    let win;
    let touchHandler;
    let messaging;
    let listeners;
    let messages;
    let unlistenCount;

    beforeEach(() => {
      listeners = [];
      unlistenCount = 0;
      messages = [];
      win = env.win;
      win.document.addEventListener = function (eventType, handler, options) {
        listeners.push({
          type: eventType,
          handler,
          options,
        });
      };
      win.document.removeEventListener = function (
        eventType,
        handler,
        options
      ) {
        expect(listeners[unlistenCount].type).to.equal(eventType);
        expect(listeners[unlistenCount].handler).to.equal(handler);
        expect(listeners[unlistenCount].options).to.equal(options);
        unlistenCount++;
      };
      const port = new WindowPortEmulator(
        this.messageHandlers_,
        'origin doesnt matter'
      );
      messaging = new Messaging(win, port);
      touchHandler = new TouchHandler(win, messaging);
    });

    afterEach(() => {
      touchHandler = null;
    });

    it('should only forward supported events', () => {
      touchHandler.handleEvent_(fakeTouchEvent('notasupportedevent'));
      expect(messages).to.have.length(0);

      touchHandler.handleEvent_(fakeTouchEvent('touchstart'));
      touchHandler.handleEvent_(fakeTouchEvent('touchmove'));
      touchHandler.handleEvent_(fakeTouchEvent('touchend'));
      expect(messages).to.have.length(3);
      expect(messages[0].data.data.type).to.equal('touchstart');
      expect(messages[0].data.data.type).to.equal('touchstart');
    });

    it('should not forward events marked with `shouldViewerCancelPropagation`', () => {
      const event = fakeTouchEvent('touchmove');
      event.stopImmediatePropagation = env.sandbox.spy();

      touchHandler.handleEvent_(event);
      expect(messages).to.have.length(1);
      expect(messages[0].data.data.type).to.equal('touchmove');
      expect(event.stopImmediatePropagation).to.not.be.called;

      event.shouldViewerCancelPropagation = true;
      messages = [];
      touchHandler.handleEvent_(event);

      expect(messages).to.have.length(0);
      expect(event.stopImmediatePropagation).to.be.calledOnce;
    });

    it('should lock scrolling', () => {
      expect(unlistenCount).to.equal(0);
      expect(listeners).to.have.length(3);
      expect(listeners[0].options.passive).to.be.true;
      expect(listeners[0].options.capture).to.be.false;
      const fakeEvent = fakeTouchEvent('touchstart');
      const preventDefaultStub = env.sandbox.stub(fakeEvent, 'preventDefault');
      const copyTouchEventStub = env.sandbox.stub(
        touchHandler,
        'copyTouchEvent_'
      );

      touchHandler.forwardEvent_(fakeEvent);
      expect(copyTouchEventStub).to.have.been.called;
      expect(messages).to.have.length(1);
      expect(preventDefaultStub).to.not.have.been.called;

      touchHandler.scrollLockHandler_('some type', /*lock*/ true, false);
      expect(unlistenCount).to.equal(3);
      expect(listeners).to.have.length(6);
      expect(listeners[4].options.passive).to.be.false;
      expect(listeners[4].options.capture).to.be.false;
      touchHandler.forwardEvent_(fakeEvent);
      expect(messages).to.have.length(2);
      expect(preventDefaultStub).to.have.been.called;

      touchHandler.scrollLockHandler_('some type', /*lock*/ false, false);
      expect(unlistenCount).to.equal(6);
      expect(listeners).to.have.length(9);
      expect(listeners[7].options.passive).to.be.true;
    });

    it('should only cancel touch event when cancelable', () => {
      const fakeEvent = fakeTouchEvent('touchstart');
      fakeEvent.cancelable = false;
      const preventDefaultStub = env.sandbox.stub(fakeEvent, 'preventDefault');
      env.sandbox.stub(touchHandler, 'copyTouchEvent_');

      touchHandler.scrollLockHandler_('some type', /*lock*/ true, false);
      touchHandler.forwardEvent_(fakeEvent);
      expect(messages).to.have.length(1);
      expect(preventDefaultStub).to.not.have.been.called;
    });

    it('should copy events correctly', () => {
      const eventType = 'touchstart';
      const fakeEvent = fakeTouchEvent(eventType);
      const copiedEvent = touchHandler.copyTouchEvent_(fakeEvent);
      expect(copiedEvent).to.deep.equal({
        'pageX': 10,
        'pageY': 20,
        'type': eventType,
        touches: [{'clientX': 20, 'clientY': 30, 'screenX': 10, 'screenY': 20}],
        changedTouches: [
          {'clientX': 20, 'clientY': 30, 'screenX': 10, 'screenY': 20},
        ],
      });
    });
  });
});
