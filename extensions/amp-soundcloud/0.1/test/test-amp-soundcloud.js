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

import '../amp-soundcloud';

describes.realWin(
  'amp-soundcloud',
  {
    amp: {
      extensions: ['amp-soundcloud'],
    },
  },
  (env) => {
    const trackEmbedUrl =
      'https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F243169232';
    const playlistEmbedUrl =
      'https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F1595551';

    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getSCPlayer(mediaid, isPlaylist, opt_attrs) {
      const scplayer = doc.createElement('amp-soundcloud');
      if (isPlaylist) {
        scplayer.setAttribute('data-playlistid', mediaid);
      } else {
        scplayer.setAttribute('data-trackid', mediaid);
      }
      scplayer.setAttribute('height', '237');

      if (opt_attrs) {
        for (const attr in opt_attrs) {
          scplayer.setAttribute(attr, opt_attrs[attr]);
        }
      }

      doc.body.appendChild(scplayer);
      return scplayer
        .build()
        .then(() => scplayer.layoutCallback())
        .then(() => scplayer);
    }

    it('renders track', () => {
      return getSCPlayer('243169232').then((scplayer) => {
        const iframe = scplayer.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(trackEmbedUrl);
      });
    });

    it('renders playlist', () => {
      return getSCPlayer('1595551', true).then((scplayer) => {
        const iframe = scplayer.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(playlistEmbedUrl);
      });
    });

    it('renders secret token', () => {
      return getSCPlayer('243169232', false, {
        'data-visual': true,
        'data-secret-token': 'c-af',
      }).then((scplayer) => {
        const iframe = scplayer.firstChild;
        expect(iframe.src).to.include(encodeURIComponent('?secret_token=c-af'));
      });
    });

    it('renders fixed-height', () => {
      return getSCPlayer('243169232', false, {layout: 'fixed-height'}).then(
        (scplayer) => {
          expect(scplayer.className).to.match(/i-amphtml-layout-fixed-height/);
        }
      );
    });

    it('renders responsively', () => {
      return getSCPlayer('243169232', false, {layout: 'responsive'}).then(
        (scplayer) => {
          const iframe = scplayer.firstChild;
          expect(iframe).to.not.be.null;
          expect(iframe.className).to.match(/i-amphtml-fill-content/);
        }
      );
    });

    it('ignores color in visual mode', () => {
      return getSCPlayer('243169232', false, {
        'data-visual': true,
        'data-color': '00FF00',
      }).then((scplayer) => {
        const iframe = scplayer.firstChild;
        expect(iframe.src).to.include('visual=true');
        expect(iframe.src).not.to.include('color=00FF00');
      });
    });

    it('renders without optional params', () => {
      return getSCPlayer('243169232').then((scplayer) => {
        const iframe = scplayer.firstChild;
        expect(iframe.src).not.to.include('&visual=true');
        expect(iframe.src).not.to.include('&color=FF0000');
      });
    });

    it('renders data-trackid', () => {
      expect(getSCPlayer('')).to.be.rejectedWith(
        /The data-trackid attribute is required for/
      );
    });
  }
);
