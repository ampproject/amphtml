/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-megaphone';

describes.realWin(
  'amp-megaphone',
  {
    amp: {
      extensions: ['amp-megaphone'],
    },
  },
  (env) => {
    const episodeEmbedUrl = 'https://player.megaphone.fm/OSC7749686951/';
    const playlistEmbedUrl = 'https://playlist.megaphone.fm/?p=DEM6640968282';

    let win;
    let doc;
    let container;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      container = doc.createElement('div');
      doc.body.appendChild(container);
    });

    afterEach(() => {
      doc.body.removeChild(container);
    });

    async function getMegaphone(mediaid, isPlaylist, opt_attrs) {
      const mpplayer = doc.createElement('amp-megaphone');
      if (isPlaylist) {
        mpplayer.setAttribute('data-playlist', mediaid);
      } else {
        mpplayer.setAttribute('data-episode', mediaid);
      }
      mpplayer.setAttribute('height', '150');

      for (const attr in opt_attrs) {
        mpplayer.setAttribute(attr, opt_attrs[attr]);
      }

      container.appendChild(mpplayer);
      await mpplayer.build();
      await mpplayer.layoutCallback();
      return mpplayer;
    }

    it('renders episode', async () => {
      const mpplayer = await getMegaphone('OSC7749686951');
      const iframe = mpplayer.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(episodeEmbedUrl);
    });

    it('renders playlist', async () => {
      const mpplayer = await getMegaphone('DEM6640968282', true);
      const iframe = mpplayer.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(playlistEmbedUrl);
    });

    it('renders fixed-height', async () => {
      const mpplayer = await getMegaphone('OSC7749686951', false, {
        layout: 'fixed-height',
      });
      expect(mpplayer).to.have.class('i-amphtml-layout-fixed-height');
    });

    it('renders with optional parameters for an episode', async () => {
      const mpplayer = await getMegaphone('OSC7749686951', false, {
        'data-light': true,
        'data-start': '5.4',
        'data-tile': 'true',
        'data-sharing': 'true',
        'data-episodes': '4',
      });
      const iframe = mpplayer.firstChild;
      const {searchParams} = new URL(iframe.src);
      expect(searchParams.get('light')).to.equal('true');
      expect(searchParams.get('start')).to.equal('5.4');
      expect(searchParams.get('tile')).to.equal('true');
      expect(searchParams.get('sharing')).to.equal('true');
      expect(searchParams.get('episodes')).to.not.exist;
    });

    it('renders with optional parameters for a playlist', async () => {
      const mpplayer = await getMegaphone('DEM6640968282', true, {
        'data-light': true,
        'data-start': '5.4',
        'data-tile': 'true',
        'data-sharing': 'true',
        'data-episodes': '4',
      });
      const iframe = mpplayer.firstChild;
      const {searchParams} = new URL(iframe.src);
      expect(searchParams.get('light')).to.equal('true');
      expect(searchParams.get('episodes')).to.equal('4');
      expect(searchParams.get('sharing')).to.equal('true');
      expect(searchParams.get('tile')).to.to.not.exist;
      expect(searchParams.get('start')).to.not.exist;
    });
  }
);
