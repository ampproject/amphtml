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

import '../amp-mowplayer';
import {Services} from '../../../../src/services';
import {VideoEvents} from '../../../../src/video-interface';
import {listenOncePromise} from '../../../../src/event-helper';

const EXAMPLE_VIDEOID = 'myfwarfx4tb';
const EXAMPLE_VIDEOID_URL =
  'https://cdn.mowplayer.com/player.html?code=myfwarfx4tb';

describes.realWin(
  'amp-mowplayer',
  {
    amp: {
      extensions: ['amp-mowplayer'],
    },
  },
  function(env) {
    this.timeout(5000);
    let win, doc;
    let timer;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      timer = Services.timerFor(win);
    });

    function getMowPlayer(
      attributes,
      opt_responsive,
      opt_beforeLayoutCallback
    ) {
      const mp = doc.createElement('amp-mowplayer');
      for (const key in attributes) {
        mp.setAttribute(key, attributes[key]);
      }
      mp.setAttribute('width', '250');
      mp.setAttribute('height', '180');
      if (opt_responsive) {
        mp.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(mp);
      return mp
        .build()
        .then(() => {
          if (opt_beforeLayoutCallback) {
            opt_beforeLayoutCallback(mp);
          }
          return mp.layoutCallback();
        })
        .then(() => {
          const mpIframe = mp.querySelector('iframe');
          mp.implementation_.handleMowMessage_({
            origin: 'https://cdn.mowplayer.com',
            source: mpIframe.contentWindow,
            data: JSON.stringify({event: 'onReady'}),
          });
        })
        .then(() => mp);
    }

    describe('with data-mediaid', function() {
      runTestsForDatasource(EXAMPLE_VIDEOID);
    });

    /**
     * This function runs generic tests for components based on
     * data-videoid or data-live-channelid.
     * @param {string} datasource
     */
    function runTestsForDatasource(datasource) {
      it('renders', () => {
        return getMowPlayer({'data-mediaid': EXAMPLE_VIDEOID}, true).then(
          mp => {
            const iframe = mp.querySelector('iframe');
            expect(iframe).to.not.be.null;
            expect(iframe.tagName).to.equal('IFRAME');
            expect(iframe.src).to.equal(EXAMPLE_VIDEOID_URL);
          }
        );
      });

      it('requires data-mediaid', () =>
        allowConsoleError(() =>
          getMowPlayer({}).should.eventually.be.rejectedWith(
            /The data-mediaid attribute is required for/
          )
        ));

      it('should send events from mowplayer to the amp element', () => {
        return getMowPlayer({'data-mediaid': datasource}).then(mp => {
          const iframe = mp.querySelector('iframe');

          return Promise.resolve()
            .then(() => {
              const p = listenOncePromise(mp, VideoEvents.MUTED);
              sendFakeInfoDeliveryMessage(mp, iframe, {muted: true});
              return p;
            })
            .then(() => {
              const p = listenOncePromise(mp, VideoEvents.PLAYING);
              sendFakeInfoDeliveryMessage(mp, iframe, {playerState: 1});
              return p;
            })
            .then(() => {
              const p = listenOncePromise(mp, VideoEvents.PAUSE);
              sendFakeInfoDeliveryMessage(mp, iframe, {playerState: 2});
              return p;
            })
            .then(() => {
              const p = listenOncePromise(mp, VideoEvents.UNMUTED);
              sendFakeInfoDeliveryMessage(mp, iframe, {muted: false});
              return p;
            })
            .then(() => {
              // Should not send the unmute event twice if already sent once.
              const p = listenOncePromise(mp, VideoEvents.UNMUTED).then(() => {
                assert.fail('Should not have dispatch unmute message twice');
              });
              sendFakeInfoDeliveryMessage(mp, iframe, {muted: false});
              const successTimeout = timer.promise(10);
              return Promise.race([p, successTimeout]);
            })
            .then(() => {
              // Make sure pause and end are triggered when video ends.
              const pEnded = listenOncePromise(mp, VideoEvents.ENDED);
              const pPause = listenOncePromise(mp, VideoEvents.PAUSE);
              sendFakeInfoDeliveryMessage(mp, iframe, {playerState: 0});
              return Promise.all([pEnded, pPause]);
            });
        });
      });
    }

    function sendFakeInfoDeliveryMessage(mp, iframe, info) {
      mp.implementation_.handleMowMessage_({
        origin: 'https://cdn.mowplayer.com',
        source: iframe.contentWindow,
        data: JSON.stringify({
          event: 'infoDelivery',
          info,
        }),
      });
    }
  }
);
