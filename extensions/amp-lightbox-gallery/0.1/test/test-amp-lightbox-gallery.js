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

import {installLightboxGallery} from '../amp-lightbox-gallery';

const TAG = 'amp-lightbox-gallery';

describes.realWin(
  'amp-lightbox-gallery',
  {
    amp: {
      amp: true,
      ampdoc: 'single',
      extensions: [TAG],
    },
  },
  env => {
    let win, doc, gallery;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      return installLightboxGallery(env.ampdoc).then(() => {
        gallery = doc.getElementById(TAG);
      });
    });

    describe('basic functionality', function() {
      this.timeout(5000);
      it('should contain a container on build', done => {
        gallery.build().then(() => {
          const container = doc.getElementsByClassName('i-amphtml-lbg');
          expect(container.length).to.equal(1);
          expect(container[0].tagName).to.equal('DIV');
          done();
        });
      });
    });
  }
);
