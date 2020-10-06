/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-vi-player';

describes.realWin(
  'amp-vi-player',
  {
    amp: {
      extensions: ['amp-vi-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getViPlayer(attributes) {
      const viPlayer = doc.createElement('amp-vi-player');
      for (const key in attributes) {
        viPlayer.setAttribute(key, attributes[key]);
      }
      viPlayer.setAttribute('layout', 'responsive');
      viPlayer.setAttribute('width', '480');
      viPlayer.setAttribute('height', '270');

      doc.body.appendChild(viPlayer);
      return viPlayer
        .build()
        .then(() => viPlayer.layoutCallback())
        .then(() => viPlayer);
    }

    it('renders', async () => {
      const viPlayer = await getViPlayer({
        'data-publisher-id': 'test_amp_vi_player',
        'data-channel-id': 'test_channel',
      });
      const iframe = viPlayer.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://s.vi-serve.com/tagLoaderAmp.html?publisherId=test_amp_vi_player&channelId=test_channel'
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('fails if publisherId is not specified', () => {
      return allowConsoleError(() => {
        return getViPlayer({
          'data-channel-id': 'test_channel',
        }).should.eventually.be.rejectedWith(
          /The data-publisher-id attribute is required for/
        );
      });
    });

    it('fails if channelId is not specified', () => {
      return allowConsoleError(() => {
        return getViPlayer({
          'data-publisher-id': 'test_amp_vi_player',
        }).should.eventually.be.rejectedWith(
          /The data-channel-id attribute is required for/
        );
      });
    });
  }
);
