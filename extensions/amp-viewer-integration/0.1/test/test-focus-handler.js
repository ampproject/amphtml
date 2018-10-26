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

import {FocusHandler} from '../focus-handler';
import {Messaging} from '../messaging/messaging';
import {Services} from '../../../../src/services';

const data = {
  bottom: 0,
  height: 10,
  left: 1,
  right: 2,
  top: 0,
  width: 100,
  x: 100,
  y: 100,
};

function fakeFocusEvent(type) {
  return {
    type,
    target: {
      getBoundingClientRect: () => {
        return data;
      },
      nodeType: 1,
    },
  };
}

describes.fakeWin('FocusHandler', {}, env => {
  describe('FocusHandler Unit Tests', function() {

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
    let focusHandler;
    let messaging;
    let messages;

    beforeEach(() => {
      messages = [];
      win = env.win;
      env.sandbox.stub(Services, 'viewportForDoc').returns({
        getClientRectAsync: () => Promise.resolve(data),
      });
      const port =
        new WindowPortEmulator(this.messageHandlers_, 'origin doesnt matter');
      messaging = new Messaging(win, port);
      focusHandler = new FocusHandler(win, messaging);
    });

    afterEach(() => {
      focusHandler = null;
    });

    it('should not forward unsupported supported events', () => {
      focusHandler.handleEvent_(fakeFocusEvent('notasupportedevent')).then(
          () => {
            expect(messages).to.have.length(0);
          });
    });

    it('should forward supported events', () => {
      focusHandler.handleEvent_(fakeFocusEvent('focusin')).then(() => {
        expect(messages).to.have.length(1);
        expect(messages[0].data.name).to.equal('focusin');
        expect(messages[0].data.data.focusTargetRect).to.equal(data);
      });
    });
  });
});
