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
  env => {
    const trackEmbedUrl =
      'https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F243169232';
    const playlistEmbedUrl =
      'https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F173211206';

    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getIns(mediaid, playlist, opt_attrs) {
      const ins = doc.createElement('amp-soundcloud');
      if (playlist) {
        ins.setAttribute('data-playlistid', mediaid);
      } else {
        ins.setAttribute('data-trackid', mediaid);
      }
      ins.setAttribute('height', '237');

      if (opt_attrs) {
        for (const attr in opt_attrs) {
          ins.setAttribute(attr, opt_attrs[attr]);
        }
      }

      doc.body.appendChild(ins);
      return ins
        .build()
        .then(() => ins.layoutCallback())
        .then(() => ins);
    }

    it('renders track', () => {
      return getIns('243169232').then(ins => {
        const iframe = ins.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(trackEmbedUrl);
      });
    });

    it('renders playlist', () => {
      return getIns('173211206', true).then(ins => {
        const iframe = ins.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(playlistEmbedUrl);
      });
    });

    it('renders secret token', () => {
      return getIns('243169232', false, {
        'data-visual': true,
        'data-secret-token': 'c-af',
      }).then(ins => {
        const iframe = ins.firstChild;
        expect(iframe.src).to.include(encodeURIComponent('?secret_token=c-af'));
      });
    });

    it('renders fixed-height', () => {
      return getIns('243169232', false, {layout: 'fixed-height'}).then(ins => {
        expect(ins.className).to.match(/i-amphtml-layout-fixed-height/);
      });
    });

    it('ignores color in visual mode', () => {
      return getIns('243169232', false, {
        'data-visual': true,
        'data-color': '00FF00',
      }).then(ins => {
        const iframe = ins.firstChild;
        expect(iframe.src).to.include('visual=true');
        expect(iframe.src).not.to.include('color=00FF00');
      });
    });

    it('renders without optional params', () => {
      return getIns('243169232').then(ins => {
        const iframe = ins.firstChild;
        expect(iframe.src).not.to.include('&visual=true');
        expect(iframe.src).not.to.include('&color=FF0000');
      });
    });

    it('renders data-trackid', () => {
      expect(getIns('')).to.be.rejectedWith(
        /The data-trackid attribute is required for/
      );
    });
  }
);
