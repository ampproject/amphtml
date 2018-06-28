/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {AmpVideoIntegration, adopt} from '../../src/video-iframe-integration';
import {Deferred} from '../../src/utils/promise';

describes.fakeWin('video-iframe-integration', {
  amp: {
    runtimeOn: false,
  },
}, env => {

  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function pushToGlobal(global, callback) {
    global.AmpVideoIframe = global.AmpVideoIframe || [];
    global.AmpVideoIframe.push(callback);
  }

  describe('adopt(win)', () => {

    it('should execute callbacks added before adoption', function* () {
      const {promise, resolve} = new Deferred();
      const global = {};
      pushToGlobal(global, resolve);
      adopt(global);
      yield promise;
    });

    it('should execute callbacks added after adoption', function* () {
      const {promise, resolve} = new Deferred();
      const global = {};
      adopt(global);
      pushToGlobal(global, resolve);
      yield promise;
    });
  });

  describe('AmpVideoIntegration', () => {
    describe('postEvent', () => {
      it('should reject invalid events', () => {
        const integration = new AmpVideoIntegration();
        const invalidEvents = 'tacos al pastor'.split(' ');
        for (let i = 0; i < invalidEvents.length; i++) {
          const event = invalidEvents[i];
          expect(() => integration.postEvent(event)).to.throw(/Invalid event/);
        }
      });

      it('should post invalid events', () => {
        const integration = new AmpVideoIntegration();

        const postToParent = env.sandbox.stub(integration, 'postToParent_');

        const validEvents = [
          'canplay',
          'load',
          'playing',
          'pause',
          'ended',
          'muted',
          'unmuted',
        ];

        for (let i = 0; i < validEvents.length; i++) {
          const event = validEvents[i];
          integration.postEvent(event);
          expect(postToParent.withArgs(sinon.match({event})))
              .to.have.been.calledOnce;
        }
      });
    });
  });
});
