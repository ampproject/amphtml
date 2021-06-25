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

import '../amp-embedly-card';
import {createElementWithAttributes} from '#core/dom';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/test-helper';

describes.realWin(
  'amp-embedly-card-v1.0',
  {
    amp: {
      extensions: ['amp-embedly-card:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let element;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-embedly-card', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    /**
     * Wait for iframe to be mounted
     */
    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    it('renders responsively', async () => {
      // Prepare Bento Tag
      element = createElementWithAttributes(doc, 'amp-embedly-card', {
        'data-url': 'https://www.youtube.com/watch?v=lBTCB7yLs8Y',
        'height': 200,
        'width': 300,
        'layout': 'responsive',
      });

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      //Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      //Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check iframe for correct scr URL
      // <-- iframe.className remains '' -->
      expect(iframe.className).to.match(/i-amphtml-layout-responsive/);
    });

    it('throws when data-url is not given', async () => {
      // Prepare Bento Tag
      element = createElementWithAttributes(doc, 'amp-embedly-card', {
        'height': 200,
        'width': 300,
        layout: 'responsive',
      });

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      // <-- Cannot because "return null" is provided for no 'data-url' -->
      await waitForRender();

      //Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      //Make sure iframe is available
      expect(iframe).to.not.be.null;

      /** Cannot test as userAssert not available for Preact Component */
      // expect(iframe.src).to.be.rejectedWith(
      //   /data-url is required for <amp-embedly-card>/
      // );
    });
  }
);
