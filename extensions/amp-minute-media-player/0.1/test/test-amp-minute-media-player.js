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

import '../amp-minute-media-player';

const WIDTH = '16';
const HEIGHT = '9';
const RESPONSIVE = 'responsive';
const CURATED = 'curated';
const SEMANTIC = 'semantic';
const DATA_CONTENT_ID = 'fSkmeWKF';
const DATA_MINIMUM_DATE_FACTOR = '10';
const DATA_SCANNED_ELEMENT_TYPE = 'id';
const DATA_SCOPED_KEYWORDS = 'football';

describes.realWin(
  'amp-minute-media-player',
  {
    amp: {
      extensions: ['amp-minute-media-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getMinuteMediaPlayer(attributes) {
      const minuteMediaPlayerElement = doc.createElement(
        'amp-minute-media-player'
      );
      for (const key in attributes) {
        minuteMediaPlayerElement.setAttribute(key, attributes[key]);
      }

      minuteMediaPlayerElement.setAttribute('width', WIDTH);
      minuteMediaPlayerElement.setAttribute('height', HEIGHT);
      minuteMediaPlayerElement.setAttribute('layout', RESPONSIVE);

      doc.body.appendChild(minuteMediaPlayerElement);
      return minuteMediaPlayerElement
        .build()
        .then(() => {
          minuteMediaPlayerElement.layoutCallback();
        })
        .then(() => minuteMediaPlayerElement);
    }

    it('renders with curated content', async () => {
      const minuteMediaPlayerElement = await getMinuteMediaPlayer({
        'data-content-type': CURATED,
        'data-content-id': DATA_CONTENT_ID,
      });
      const iframe = minuteMediaPlayerElement.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        `https://www.oo-syringe.com/prod/AMP/minute-media-player.html?content_type=${CURATED}&content_id=${DATA_CONTENT_ID}`
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('renders with semantic (empty params)', async () => {
      const minuteMediaPlayerElement = await getMinuteMediaPlayer({
        'data-content-type': SEMANTIC,
        /* no params to semantic */
      });
      const iframe = minuteMediaPlayerElement.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        `https://www.oo-syringe.com/prod/AMP/minute-media-player.html?content_type=${SEMANTIC}`
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('renders with semantic (with params)', async () => {
      const minuteMediaPlayerElement = await getMinuteMediaPlayer({
        'data-content-type': SEMANTIC,
        'data-minimum-date-factor': DATA_MINIMUM_DATE_FACTOR,
        'data-scanned-element-type': DATA_SCANNED_ELEMENT_TYPE,
        'data-scoped-keywords': DATA_SCOPED_KEYWORDS,
      });
      const iframe = minuteMediaPlayerElement.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        `https://www.oo-syringe.com/prod/AMP/minute-media-player.html?content_type=${SEMANTIC}&scanned_element_type=${DATA_SCANNED_ELEMENT_TYPE}&minimum_date_factor=${DATA_MINIMUM_DATE_FACTOR}&scoped_keywords=${DATA_SCOPED_KEYWORDS}`
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  }
);
