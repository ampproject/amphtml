/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../../src/services';
import {WindowResizeHandler} from '../window-resize-handler';

function fakeResizeEvent(type) {
  return {type};
}

describes.fakeWin('WindowResizeHandler', {
  amp: true,
}, env => {
  describe('WindowResizeHandler Unit Tests', function() {

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

    let getContentHeightStub;
    let win;
    let windowResizeHandler;
    let messaging;
    let messages;

    beforeEach(() => {
      messages = [];
      win = env.win;
      const port =
        new WindowPortEmulator(this.messageHandlers_, 'origin doesnt matter');
      messaging = new Messaging(win, port);
      getContentHeightStub =
          sandbox.stub(Services.viewportForDoc(env.ampdoc), 'getContentHeight');
      getContentHeightStub.returns('100px');
      windowResizeHandler = new WindowResizeHandler(win, messaging);
    });

    afterEach(() => {
      windowResizeHandler = null;
    });

    it('should forward resize event', () => {
      windowResizeHandler.forwardEventToViewer_(fakeResizeEvent('resize'));
      expect(messages).to.have.length(1);
      expect(getContentHeightStub).to.be.calledOnce;
      expect(messages[0].data.name).to.equal('resize');
      expect(messages[0].data.data.documentHeight).to.equal('100px');
    });

    it('should no opt if event is default prevented', () => {
      const event = fakeResizeEvent('resize');
      event.defaultPrevented = true;
      windowResizeHandler.forwardEventToViewer_(event);
      expect(messages).to.have.length(0);
    });

  });
});
