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
import {
  createElementWithAttributes,
  waitForChildPromise,
} from '../../../../src/dom';
import {waitFor} from '../../../../testing/test-helper';

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
      element = createElementWithAttributes(win.document, 'amp-instagram', {
        'data-shortcode': 'B8QaZW4AQY_',
        'amp': true,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(
        element.shadowRoot.querySelector('iframe').getAttribute('src')
      ).to.equal('https://www.instagram.com/p/B8QaZW4AQY_/embed/?cr=1&v=12');
    });

    it('renders with caption', async () => {
      element = createElementWithAttributes(win.document, 'amp-instagram', {
        'data-shortcode': 'B8QaZW4AQY_',
        'data-captioned': true,
        'amp': true,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
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
      element = createElementWithAttributes(win.document, 'amp-instagram', {
        'data-shortcode': 'B8QaZW4AQY_',
        'amp': true,
        'height': initialHeight,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();
      const {offsetHeight} = element;

      const mockEvent = new CustomEvent('message');
      mockEvent.origin = 'https://www.instagram.com';
      mockEvent.data = JSON.stringify({
        'type': 'MEASURE',
        'details': {
          'height': 1000,
        },
      });
      mockEvent.source = element.shadowRoot.querySelector(
        'iframe'
      ).contentWindow;
      win.dispatchEvent(mockEvent);

      await waitFor(
        () => element.offsetHeight != offsetHeight,
        'Height is not changed'
      );
    });
  }
);
