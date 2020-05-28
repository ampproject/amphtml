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

import '../amp-delight-player';
import {VideoEvents} from '../../../../src/video-interface';
import {listenOncePromise} from '../../../../src/event-helper';

describes.realWin(
  'amp-delight-player',
  {
    amp: {
      extensions: ['amp-delight-player'],
    },
  },
  function (env) {
    this.timeout(4000);
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function fakePostMessage(delightElement, info) {
      delightElement.implementation_.handleDelightMessage_({
        source: delightElement.querySelector('iframe').contentWindow,
        data: {source: 'DelightPlayer', ...info},
      });
    }

    function getDelightPlayer(attributes) {
      const delight = doc.createElement('amp-delight-player');
      for (const key in attributes) {
        delight.setAttribute(key, attributes[key]);
      }
      delight.setAttribute('width', '640');
      delight.setAttribute('height', '360');
      delight.setAttribute('layout', 'responsive');
      doc.body.appendChild(delight);
      return delight
        .build()
        .then(() => delight.layoutCallback())
        .then(() => delight);
    }

    it('renders', () => {
      return getDelightPlayer({
        'data-content-id': '-LLoCCZqWi18O73b6M0w',
      }).then((delight) => {
        const iframe = delight.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://players.delight-vr.com/player/-LLoCCZqWi18O73b6M0w?amp=1'
        );
        expect(iframe.allow).to.equal('vr');
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('fails if no content is specified', () => {
      return allowConsoleError(() => {
        return getDelightPlayer({
          'data-content-id': '',
        }).should.eventually.be.rejectedWith(
          /The data-content-id attribute is required/
        );
      });
    });

    it('should forward events', () => {
      return getDelightPlayer({
        'data-content-id': '-LLoCCZqWi18O73b6M0w',
      }).then((delight) => {
        return Promise.resolve()
          .then(() => {
            const p = listenOncePromise(delight, VideoEvents.LOAD);
            fakePostMessage(delight, {
              type: 'x-dl8-to-parent-ready',
              payload: {},
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(delight, VideoEvents.PLAYING);
            fakePostMessage(delight, {
              type: 'x-dl8-to-parent-playing',
              payload: {},
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(delight, VideoEvents.PAUSE);
            fakePostMessage(delight, {
              type: 'x-dl8-to-parent-paused',
              payload: {},
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(delight, VideoEvents.MUTED);
            fakePostMessage(delight, {
              type: 'x-dl8-to-parent-muted',
              payload: {},
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(delight, VideoEvents.UNMUTED);
            fakePostMessage(delight, {
              type: 'x-dl8-to-parent-unmuted',
              payload: {},
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(delight, VideoEvents.ENDED);
            fakePostMessage(delight, {
              type: 'x-dl8-to-parent-ended',
              payload: {},
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(delight, VideoEvents.AD_START);
            fakePostMessage(delight, {
              type: 'x-dl8-to-parent-amp-ad-start',
              payload: {},
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(delight, VideoEvents.AD_END);
            fakePostMessage(delight, {
              type: 'x-dl8-to-parent-amp-ad-end',
              payload: {},
            });
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(delight, VideoEvents.CUSTOM_TICK);
            fakePostMessage(delight, {
              type: 'x-dl8-to-parent-amp-custom-tick',
              payload: {
                type: 'delight-test-event',
                testVar: 42,
              },
            });
            const {data} = await p;
            expect(data.eventType).to.equal('video-custom-delight-test-event');
            expect(data.vars.testVar).to.equal(42);
            return p;
          });
      });
    });
  }
);
