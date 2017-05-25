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

import {
    createIframePromise,
    doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-3q-player';
import {listenOncePromise} from '../../../../src/event-helper';
import {adopt} from '../../../../src/runtime';
import {timerFor} from '../../../../src/services';
import {VideoEvents} from '../../../../src/video-interface';
import * as sinon from 'sinon';

adopt(window);

describe('amp-3q-player', function() {
  this.timeout(10000);
  let sandbox;
  const timer = timerFor(window);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function get3QElement(playoutId) {
    return createIframePromise(true).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const player = iframe.doc.createElement('amp-3q-player');

      timer.promise(50).then(() => {
        const iframe = player.querySelector('iframe');
        player.implementation_.sdnBridge_({
          source: iframe.contentWindow,
          data: JSON.stringify({data: 'ready'}),
        });
      });

      if (playoutId) {
        player.setAttribute('data-id', playoutId);
      }

      return iframe.addElement(player);
    });
  }

  it('renders', () => {
    return get3QElement(
        'c8dbe7f4-7f7f-11e6-a407-0cc47a188158').then(player => {
          const iframe = player.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.src).to.equal('https://playout.3qsdn.com/c8dbe7f4-7f7f-11e6-a407-0cc47a188158?autoplay=false&amp=true');
        });
  })
;

  it('requires data-id', () => {
    return get3QElement('').should.eventually.be.rejectedWith(
        /The data-id attribute is required/);
  })
;

  it('should forward events from amp-3q-player to the amp element', () => {
    return get3QElement(
        'c8dbe7f4-7f7f-11e6-a407-0cc47a188158').then(player => {

          const iframe = player.querySelector('iframe');

          return Promise.resolve().then(() => {
            const p = listenOncePromise(player, VideoEvents.MUTED);
            sendFakeMessage(player, iframe, 'muted');
            return p;
          }).then(() => {
            const p = listenOncePromise(player, VideoEvents.PLAY);
            sendFakeMessage(player, iframe, 'playing');
            return p;
          }).then(() => {
            const p = listenOncePromise(player, VideoEvents.PAUSE);
            sendFakeMessage(player, iframe, 'paused');
            return p;
          }).then(() => {
            const p = listenOncePromise(player, VideoEvents.UNMUTED);
            sendFakeMessage(player, iframe, 'unmuted');
            const successTimeout = timer.promise(10);
            return Promise.race([p, successTimeout]);
          });
        });
  })
;

  function sendFakeMessage(player, iframe, command) {
    player.implementation_.sdnBridge_(
        {source: iframe.contentWindow, data: JSON.stringify({data: command})});
  }

});
