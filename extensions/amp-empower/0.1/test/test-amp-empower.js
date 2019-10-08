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

import '../amp-empower';

describes.realWin(
  'amp-empower',
  {
    amp: {
      extensions: ['amp-empower'],
    },
  },
  env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getEmpower(video, opt_responsive) {
      const empower = doc.createElement('amp-empower');
      empower.setAttribute('data-video', video);
      empower.setAttribute('width', '111');
      empower.setAttribute('height', '222');
      if (opt_responsive) {
        empower.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(empower);
      return empower
        .build()
        .then(() => {
          return empower.layoutCallback();
        })
        .then(() => empower);
    }

    it('renders', () => {
      return getEmpower('c2abd452-453d-47e6-ab96-3796f98857d0').then(
        empower => {
          const iframe = empower.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.src).to.equal(
            'https://embed.empower.net/?video=c2abd452-453d-47e6-ab96-3796f98857d0#amp=1'
          );
        }
      );
    });

    it('renders responsively', () => {
      return getEmpower('c2abd452-453d-47e6-ab96-3796f98857d0', true).then(
        empower => {
          const iframe = empower.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.className).to.match(/i-amphtml-fill-content/);
        }
      );
    });

    it('requires data-video', () => {
      return allowConsoleError(() => {
        return getEmpower('').should.eventually.be.rejectedWith(
          /The data-video attribute is required for/
        );
      });
    });
  }
);
