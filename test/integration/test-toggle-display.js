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

import {BrowserController} from '../../testing/test-helper';
import {setInitialDisplay, toggle} from '../../src/style';

describes.integration(
  'toggle display helper',
  {
    ifIe: true,
    body:
      '<amp-img src="/examples/img/hero@1x.jpg" width="289" height="216"></amp-img>',
  },
  (env) => {
    let browser, doc;
    let img;

    beforeEach(async () => {
      const {win} = env;
      doc = win.document;
      browser = new BrowserController(win);

      await browser.waitForElementLayout('amp-img');
      img = doc.querySelector('amp-img');
    });

    function expectToggleDisplay(el) {
      toggle(el, false);
      expect(el).to.have.display('none');
      toggle(el, true);
      expect(el).to.not.have.display('none');
    }

    describe
      .configure()
      .enableIe()
      .run('', () => {
        it('toggles regular display', () => {
          expectToggleDisplay(img);
        });

        it('toggles initial display style', () => {
          setInitialDisplay(img, 'inline-block');
          expectToggleDisplay(img);
        });

        it('toggles stylesheet display style', () => {
          const style = doc.createElement('style');
          style.innerText = 'amp-img { display: inline-block !important; }';
          doc.head.appendChild(style);

          expectToggleDisplay(img);
        });
      });
  }
);
