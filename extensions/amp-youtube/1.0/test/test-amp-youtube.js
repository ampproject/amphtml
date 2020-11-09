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

import '../amp-youtube';
import {
  createElementWithAttributes,
  waitForChildPromise,
} from '../../../../src/dom';
import {whenCalled} from '../../../../testing/test-helper.js';

describes.realWin(
  'amp-youtube-v1.0',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-youtube:1.0'],
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
      element = createElementWithAttributes(win.document, 'amp-youtube', {
        'data-videoid': 'IAvf-rkzNck',
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
        'https://www.youtube.com/embed/IAvf-rkzNck?enablejsapi=1&amp=1&playsinline=1'
      );
    });
  }
);
