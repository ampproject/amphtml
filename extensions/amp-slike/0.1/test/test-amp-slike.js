/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-slike';
describes.realWin(
  'amp-slike',
  {
    amp: {
      extensions: ['amp-slike'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getSlike(attributes, opt_responsive) {
      const slikePlayer = doc.createElement('amp-slike');
      for (const key in attributes) {
        slikePlayer.setAttribute(key, attributes[key]);
      }
      slikePlayer.setAttribute('width', '320');
      slikePlayer.setAttribute('height', '180');

      if (opt_responsive) {
        slikePlayer.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(slikePlayer);
      return slikePlayer
        .build()
        .then(() => {
          return slikePlayer.layoutCallback();
        })
        .then(() => slikePlayer);
    }

    it('renders', () => {
      return getSlike({
        'data-apikey': 'etb2b100web5a7yugu9lo',
        'data-videoid': '1xp5a1wkul',
        'data-poster':
          'https://imgslike.akamaized.net/p5/a1/1xp5a1wkul/thumb_640.jpg',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
      });
    });

    it('renders responsively', () => {
      return getSlike(
        {
          'data-apikey': 'etb2b100web5a7yugu9lo',
          'data-videoid': '1xp5a1wkul',
        },
        true
      ).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
      });
    });

    it('requires data-videoid', () => {
      return allowConsoleError(() => {
        return getSlike({'data-apikey': 'etb2b100web5a7yugu9lo'})
          .then((sp) => {
            sp.build();
          })
          .should.eventually.be.rejectedWith(
            /The data-videoid attribute is required for/
          );
      });
    });

    it('requires data-apikey', () => {
      return allowConsoleError(() => {
        return getSlike({'data-videoid': '1xp5a1wkul'})
          .then((sp) => {
            sp.build();
          })
          .should.eventually.be.rejectedWith(
            /The data-apikey attribute is required for/
          );
      });
    });
  }
);
