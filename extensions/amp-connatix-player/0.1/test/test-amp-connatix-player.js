/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-connatix-player';

describes.realWin(
  'amp-connatix-player',
  {
    amp: {
      extensions: ['amp-connatix-player'],
    },
  },
  env => {
    let win;
    let doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getConnatixPlayer(attributes) {
      const cnx = doc.createElement('amp-connatix-player');
      for (const key in attributes) {
        cnx.setAttribute(key, attributes[key]);
      }
      cnx.setAttribute('width', '480');
      cnx.setAttribute('height', '270');
      cnx.setAttribute('layout', 'responsive');

      doc.body.appendChild(cnx);
      return cnx.build().then(() => {
        cnx.layoutCallback();
        return cnx;
      });
    }

    it('renders', async () => {
      const cnx = await getConnatixPlayer({
        'data-player-id': 'f721b0d8-7a79-42b6-b637-fa4e86138ed9',
      });
      const iframe = cnx.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://cds.connatix.com/embed/index.html?playerId=f721b0d8-7a79-42b6-b637-fa4e86138ed9'
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('renders with a mediaId', async () => {
      const cnx = await getConnatixPlayer({
        'data-player-id': 'f721b0d8-7a79-42b6-b637-fa4e86138ed9',
        'data-media-id': '527207df-2007-43c4-b87a-f90814bafd2e',
      });
      const iframe = cnx.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://cds.connatix.com/embed/index.html?playerId=f721b0d8-7a79-42b6-b637-fa4e86138ed9&mediaId=527207df-2007-43c4-b87a-f90814bafd2e'
      );
    });

    it('fails if no playerId is specified', () => {
      return allowConsoleError(() => {
        return getConnatixPlayer({
          'data-media-id': '527207df-2007-43c4-b87a-f90814bafd2e',
        }).should.eventually.be.rejectedWith(
          /The data-player-id attribute is required for/
        );
      });
    });

    it('removes iframe after unlayoutCallback', async () => {
      const cnx = await getConnatixPlayer({
        'data-player-id': 'f721b0d8-7a79-42b6-b637-fa4e86138ed9',
      });
      const iframe = cnx.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const obj = cnx.implementation_;
      obj.unlayoutCallback();
      expect(cnx.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
    });
  }
);
