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
import * as sinon from 'sinon';

class WindowPortEmulator {
  constructor(win, origin) {
    /** @const {!Window} */
    this.win = win;
    /** @private {string} */
    this.origin_ = origin;
  }

  addEventListener(eventType, handler) {
    console/*OK*/.log(eventType, handler);
  }

  postMessage(data) {
    console/*OK*/.log(data);
  }
  start() {
  }
}

function fakeTouchEvent(type) {
  return {
    type,
    'pageX': 10,
    'pageY': 20,
    'thisshouldnotgetcopied': 'bla',
    touches:
    [{'clientX': 20, 'clientY': 30, 'screenX': 10, 'screenY': 20,
      'dontcopythis': 234}],
    changedTouches:
        [{'clientX': 20, 'clientY': 30, 'screenX': 10, 'screenY': 20}],
    preventDefault() {},
  };
}

describes.fakeWin('TouchHandler', {}, env => {
  describe('TouchHandler Unit Tests', function() {
    let win;
    let sandbox;
    let touchHandler;
    let messaging;

    beforeEach(() => {
      win = env.win;
      sandbox = sinon.sandbox;
      const port =
        new WindowPortEmulator(this.messageHandlers_, 'origin doesnt matter');
      messaging = new Messaging(win, port);
      touchHandler = new TouchHandler(win, messaging);
    });

    afterEach(() => {
      touchHandler = null;
    });

    it('should only forward supported events', () => {
      const forwardEventStub = sandbox.stub(touchHandler, 'forwardEvent_');

      touchHandler.handleEvent_(fakeTouchEvent('notasupportedevent'));
      expect(forwardEventStub).to.not.be.called;

      touchHandler.handleEvent_(fakeTouchEvent('touchstart'));
      touchHandler.handleEvent_(fakeTouchEvent('touchmove'));
      touchHandler.handleEvent_(fakeTouchEvent('touchend'));
      expect(forwardEventStub).to.be.calledThrice;
    });

    it('should behave correctly when forwarding events', () => {
      const fakeEvent = fakeTouchEvent('touchstart');
      const preventDefaultStub = sandbox.stub(fakeEvent, 'preventDefault');
      const copyTouchEventStub = sandbox.stub(touchHandler, 'copyTouchEvent_');
      const sendRequestStub = sandbox.stub(messaging, 'sendRequest');

      touchHandler.forwardEvent_(fakeEvent);
      expect(copyTouchEventStub).to.have.been.called;
      expect(sendRequestStub).to.have.been.called;
      expect(preventDefaultStub).to.not.have.been.called;

      touchHandler.scrollLockHandler_('some type', true, false);
      touchHandler.forwardEvent_(fakeEvent);
      expect(preventDefaultStub).to.have.been.called;


    });

    it('should copy events correctly', () => {
      const eventType = 'touchstart';
      const fakeEvent = fakeTouchEvent(eventType);
      const copiedEvent = touchHandler.copyTouchEvent_(fakeEvent);
      expect(copiedEvent).to.deep.equal({
        'pageX': 10,
        'pageY': 20,
        'type': eventType,
        touches:
            [{'clientX': 20, 'clientY': 30, 'screenX': 10, 'screenY': 20}],
        changedTouches:
            [{'clientX': 20, 'clientY': 30, 'screenX': 10, 'screenY': 20}],
      });
    });
  });
});
