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

import '../amp-nexxtv-player';
import {VideoEvents} from '../../../../src/video-interface';
import {listenOncePromise} from '../../../../src/event-helper';

describes.realWin(
  'amp-nexxtv-player',
  {
    amp: {
      extensions: ['amp-nexxtv-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getNexxtv(attributes, opt_responsive) {
      const nexxtv = doc.createElement('amp-nexxtv-player');

      for (const key in attributes) {
        nexxtv.setAttribute(key, attributes[key]);
      }
      nexxtv.setAttribute('width', '111');
      nexxtv.setAttribute('height', '222');
      if (opt_responsive) {
        nexxtv.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(nexxtv);
      await nexxtv.build();
      await nexxtv.layoutCallback();
      const nexxTimerIframe = nexxtv.querySelector('iframe');
      nexxtv.implementation_.handleNexxMessage_({
        origin: 'https://embed.nexx.cloud',
        source: nexxTimerIframe.contentWindow,
        data: JSON.stringify({cmd: 'onload'}),
      });
      return nexxtv;
    }

    it('renders nexxtv video player', async () => {
      const nexxtv = await getNexxtv({
        'data-mediaid': '71QQG852413DU7J',
        'data-client': '761',
      });
      const playerIframe = nexxtv.querySelector('iframe');
      expect(playerIframe).to.not.be.null;
      expect(playerIframe.src).to.equal(
        'https://embed.nexx.cloud/761/video/' +
          '71QQG852413DU7J?dataMode=static&platform=amp'
      );
    });

    it('renders player responsive', async () => {
      const nexxtv = await getNexxtv({
        'data-mediaid': '71QQG852413DU7J',
        'data-client': '761',
      });
      const playerIframe = nexxtv.querySelector('iframe');
      expect(playerIframe).to.not.be.null;
      expect(playerIframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('removes iframe after unlayoutCallback', async () => {
      const nexxtv = await getNexxtv({
        'data-mediaid': '71QQG852413DU7J',
        'data-client': '761',
      });
      const playerIframe = nexxtv.querySelector('iframe');
      expect(playerIframe).to.not.be.null;

      const obj = nexxtv.implementation_;
      obj.unlayoutCallback();
      expect(nexxtv.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
    });

    it('should forward events from nexxtv-player to the amp element', async () => {
      const nexxtv = await getNexxtv({
        'data-mediaid': '71QQG852413DU7J',
        'data-client': '761',
      });
      const iframe = nexxtv.querySelector('iframe');
      await Promise.resolve();
      const p1 = listenOncePromise(nexxtv, VideoEvents.PLAYING);
      sendFakeMessage(nexxtv, iframe, {event: 'play'});
      await p1;
      const p2 = listenOncePromise(nexxtv, VideoEvents.MUTED);
      sendFakeMessage(nexxtv, iframe, {event: 'mute'});
      await p2;
      const p3 = listenOncePromise(nexxtv, VideoEvents.PAUSE);
      sendFakeMessage(nexxtv, iframe, {event: 'pause'});
      await p3;
      const p4 = listenOncePromise(nexxtv, VideoEvents.UNMUTED);
      sendFakeMessage(nexxtv, iframe, {event: 'unmute'});
      return p4;
    });

    function sendFakeMessage(nexxtv, iframe, command) {
      nexxtv.implementation_.handleNexxMessage_({
        origin: 'https://embed.nexx.cloud',
        source: iframe.contentWindow,
        data: command,
      });
    }
  }
);
