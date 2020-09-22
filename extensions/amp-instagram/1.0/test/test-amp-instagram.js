/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-instagram';

describes.realWin(
  'amp-instagram',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-instagram:1.0'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('renders', async () => {
      const element = win.document.createElement('amp-instagram');
      element.setAttribute('data-shortcode', 'B8QaZW4AQY_');
      element.setAttribute('amp', true);
      element.setAttribute('height', 500);
      element.setAttribute('layout', 'responsive');
      element.setAttribute('style', {'width': 500, 'height': 600});
      doc.body.appendChild(element);
      await new Promise((resolve) =>
        element
          .querySelector('iframe')
          .instance()
          .addEventListener('load', resolve)
      );

      expect(element.querySelector('iframe').prop('src')).to.equal(
        'https://www.instagram.com/p/B8QaZW4AQY_/embed/?cr=1&v=12'
      );
    });
  }
);
