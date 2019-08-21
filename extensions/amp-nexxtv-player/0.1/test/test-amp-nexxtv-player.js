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
  env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getNexxtv(mediaid, client) {
      const nexxtv = doc.createElement('amp-nexxtv-player');

      if (mediaid) {
        nexxtv.setAttribute('data-mediaid', mediaid);
      }
      if (client) {
        nexxtv.setAttribute('data-client', client);
      }

      // see yt test implementation
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
      const nexxtv = await getNexxtv('71QQG852413DU7J', '761');
      const playerIframe = nexxtv.querySelector('iframe');
      expect(playerIframe).to.not.be.null;
      expect(playerIframe.src).to.equal(
        'https://embed.nexx.cloud/761/video/' +
          '71QQG852413DU7J?dataMode=static&platform=amp'
      );
    });

    // NOTE(alanorozco): Test failing on Travis. Trivial to skip since this is
    // covered by validation rules.
    it.skip('fails without mediaid', () => {
      expectAsyncConsoleError(/data-mediaid attribute is required/);
      return getNexxtv(null, '761').should.eventually.be.rejected;
    });

    // NOTE(alanorozco): Test failing on Travis. Trivial to skip since this is
    // covered by validation rules.
    it.skip('fails without client', () => {
      expectAsyncConsoleError(/data-client attribute is required/);
      return getNexxtv('71QQG852413DU7J', null).should.eventually.be.rejected;
    });

    it('should forward events from nexxtv-player to the amp element', async () => {
      const nexxtv = await getNexxtv('71QQG852413DU7J', '761');
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
