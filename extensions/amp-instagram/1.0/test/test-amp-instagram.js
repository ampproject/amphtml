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
import {waitForChildPromise} from '../../../../src/dom';
import {whenCalled} from '../../../../testing/test-helper.js';

describes.realWin(
  'amp-instagram-v1.0',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-instagram:1.0'],
    },
  },
  (env) => {
    let win, doc;
    let element;

    const waitForRender = async () => {
      await whenCalled(env.sandbox.spy(element, 'attachShadow'));
      const shadow = element.shadowRoot;
      await waitForChildPromise(shadow, (shadow) => {
        return shadow.querySelector('iframe');
      });
    };

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('renders', async () => {
      element = win.document.createElement('amp-instagram');
      element.setAttribute('data-shortcode', 'B8QaZW4AQY_');
      element.setAttribute('amp', true);
      element.setAttribute('height', 500);
      element.setAttribute('width', 500);
      element.setAttribute('layout', 'responsive');
      doc.body.appendChild(element);
      await waitForRender();

      expect(
        element.shadowRoot.querySelector('iframe').getAttribute('src')
      ).to.equal('https://www.instagram.com/p/B8QaZW4AQY_/embed/?cr=1&v=12');
    });

    it('renders with caption', async () => {
      element = win.document.createElement('amp-instagram');
      element.setAttribute('data-shortcode', 'B8QaZW4AQY_');
      element.setAttribute('data-captioned', true);
      element.setAttribute('amp', true);
      element.setAttribute('height', 500);
      element.setAttribute('width', 500);
      element.setAttribute('layout', 'responsive');
      doc.body.appendChild(element);
      await waitForRender();

      expect(
        element.shadowRoot.querySelector('iframe').getAttribute('src')
      ).to.equal(
        'https://www.instagram.com/p/B8QaZW4AQY_/embed/captioned/?cr=1&v=12'
      );
    });

    it("Container's height is changed", async () => {
      const initialHeight = 300;
      element = win.document.createElement('amp-instagram');
      element.setAttribute('data-shortcode', 'B8QaZW4AQY_');
      element.setAttribute('amp', true);
      element.setAttribute('height', initialHeight);
      element.setAttribute('width', 500);
      element.setAttribute('layout', 'responsive');
      element.setAttribute('requestResize', env.sandbox.spy());
      doc.body.appendChild(element);
      await waitForRender();

      expect(
        element.shadowRoot
          .querySelector('iframe')
          .parentElement.parentElement.getAttribute('height')
      ).to.not.equal(initialHeight);
    });
  }
);
