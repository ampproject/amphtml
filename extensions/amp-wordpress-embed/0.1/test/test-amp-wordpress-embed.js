/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-wordpress-embed';

describes.realWin(
  'amp-wordpress-embed',
  {
    amp: {
      extensions: ['amp-wordpress-embed'],
    },
  },
  env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getIns(url) {
      const ins = doc.createElement('amp-wordpress-embed');
      ins.setAttribute('data-url', url);
      ins.setAttribute('height', '241');
      doc.body.appendChild(ins);
      return ins
        .build()
        .then(() => ins.layoutCallback())
        .then(() => ins);
    }

    it('renders responsively', () => {
      return getIns('https://wordpress.example.com/post').then(ins => {
        const iframe = ins.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('Rejects because data-url is missing', () => {
      expect(getIns('')).to.be.rejectedWith(
        /The data-url attribute is required for/
      );
    });
  }
);
