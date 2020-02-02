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

import '../amp-connatix-story-player';

describes.realWin(
  'amp-connatix-story-player',
  {
    amp: {
      extensions: ['amp-connatix-story-player'],
    },
  },
  env => {
    let win;
    let doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getConnatixStoryPlayer(attributes, customAttributes) {
      const cnx = doc.createElement('amp-connatix-story-player');
      for (const key in attributes) {
        cnx.setAttribute(key, attributes[key]);
      }

      for (const customKey in customAttributes) {
        cnx.setAttribute(customKey, customAttributes[customKey]);
      }

      doc.body.appendChild(cnx);
      return cnx.build().then(() => {
        cnx.layoutCallback();
        return cnx;
      });
    }

    function getConnatixStoryPlayerLandscape(attributes) {
      return getConnatixStoryPlayer(attributes, {
        'width': '16',
        'height': '12',
        'orientation': 'landscape',
        'layout': 'responsive',
      });
    }

    function getConnatixStoryPlayerPortrait(attributes) {
      return getConnatixStoryPlayer(attributes, {
        'width': '4',
        'height': '5',
        'orientation': 'portrait',
        'layout': 'responsive',
      });
    }

    it('renders', async () => {
      const cnx = await getConnatixStoryPlayer({
        'data-player-id': '3014c9e7-d40e-4790-b305-9b8c614537b9',
      });
      const iframe = cnx.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://cds.connatix.com/p/plugins/connatix.playspace.embed.html?playerId=f721b0d8-7a79-42b6-b637-fa4e86138ed9'
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('renders with a storyId', async () => {
      const cnx = await getConnatixStoryPlayer({
        'data-player-id': '3014c9e7-d40e-4790-b305-9b8c614537b9',
        'data-story-id': '08d79e80-c4bb-e51a-4116-616225d51db2',
      });
      const iframe = cnx.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://cds.connatix.com/p/plugins/connatix.playspace.embed.html?playerId=f721b0d8-7a79-42b6-b637-fa4e86138ed9&storyId=08d79e80-c4bb-e51a-4116-616225d51db2'
      );
    });

    it('fails if no playerId is specified', () => {
      return allowConsoleError(() => {
        return getConnatixStoryPlayer({
          'data-story-id': '08d79e80-c4bb-e51a-4116-616225d51db2',
        }).should.eventually.be.rejectedWith(
          /The data-player-id attribute is required for/
        );
      });
    });

    it('removes iframe after unlayoutCallback', async () => {
      const cnx = await getConnatixStoryPlayer({
        'data-player-id': '3014c9e7-d40e-4790-b305-9b8c614537b9',
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
