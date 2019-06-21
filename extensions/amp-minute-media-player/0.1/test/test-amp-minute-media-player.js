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
//import {Services} from '../../../../src/services';

const WIDTH = '16';
const HEIGHT = '9';
const RESPONSIVE = 'responsive';
const DATA_CONTENT_ID = 'fSkmeWKF';
const DATA_MINIMUM_DATE_FACTOR = '10';
const DATA_SCANNED_ELEMENT_TYPE = 'id';

describes.realWin(
  'amp-minute-media-player',
  {
    amp: {
      extensions: ['amp-minute-media-player'],
    },
  },
  env => {
    let win, doc;
    //let timer;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      //timer = Services.timerFor(win);
    });

    function getMPlayer(attributes, opt_beforeLayoutCallback) {
      const mplayerElement = doc.createElement('amp-minute-media-player');
      for (const key in attributes) {
        mplayerElement.setAttribute(key, attributes[key]);
      }

      mplayerElement.setAttribute('width', WIDTH);
      mplayerElement.setAttribute('height', HEIGHT);
      mplayerElement.setAttribute('layout', RESPONSIVE);

      doc.body.appendChild(mplayerElement);
      /*
    return mplayerElement.build().then(() => {
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(mplayerElement);
      }
      return mplayerElement.layoutCallback();
    }).than(e => {
      // Ignore failed to load errors since sources are fake.
      if (e.toString().indexOf('Failed to load') > -1) {
        return mplayerElement;
      } else {
        throw e;
      }
    });*/
      return mplayerElement
        .build()
        .then(() => {
          mplayerElement.layoutCallback();
        })
        .then(() => mplayerElement);
    }

    it('renders with curated content', () => {
      return getMPlayer({
        'data-content-id': DATA_CONTENT_ID,
      }).then(mplayerElement => {
        const iframe = mplayerElement.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.equal(
          `https://s3-us-west-2.amazonaws.com/syringe/dev/amp/mplayer.html?content_id=${DATA_CONTENT_ID}`
        );
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('renders with semantic (empty params)', () => {
      return getMPlayer({
        /* no params to semantic */
      }).then(mplayerElement => {
        const iframe = mplayerElement.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.equal(
          'https://s3-us-west-2.amazonaws.com/syringe/dev/amp/mplayer.html'
        );
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('renders with semantic (with params)', () => {
      return getMPlayer({
        'data-minimum-date-factor': DATA_MINIMUM_DATE_FACTOR,
        'data-scanned-element-type': DATA_SCANNED_ELEMENT_TYPE,
      }).then(mplayerElement => {
        const iframe = mplayerElement.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.equal(
          //******TO CHANGE******//
          'https://s3-us-west-2.amazonaws.com/syringe/dev/amp/mplayer.html?minimum_date_factor=10&scanned_element_type=id'
        );
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });
  }
);
