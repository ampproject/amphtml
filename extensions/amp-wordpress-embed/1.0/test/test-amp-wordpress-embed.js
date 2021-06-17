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

import '../amp-wordpress-embed';
import {createElementWithAttributes} from '#core/dom';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/test-helper';

describes.realWin(
  'amp-wordpress-embed-v1.0',
  {
    amp: {
      extensions: ['amp-wordpress-embed:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let element;

    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-wordpress-embed', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(
        win.document,
        'amp-wordpress-embed',
        {
          'data-url': 'https://wordpress.org/news/2021/06/gutenberg-highlights',
          'amp': true,
          'height': 200,
          'width': 500,
          'layout': 'responsive',
        }
      );
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'https://wordpress.org/news/2021/06/gutenberg-highlights?embed=true'
      );
    });

    it("container's height is changed", async () => {
      const initialHeight = 300;
      element = createElementWithAttributes(
        win.document,
        'amp-wordpress-embed',
        {
          'data-url': 'https://wordpress.org/news/2021/06/gutenberg-highlights',
          'amp': true,
          'height': initialHeight,
          'width': 500,
          'layout': 'responsive',
        }
      );
      doc.body.appendChild(element);
      await waitForRender();

      const impl = await element.getImpl(false);
      const forceChangeHeightStub = env.sandbox.stub(impl, 'forceChangeHeight');

      const mockEvent = new CustomEvent('message');
      mockEvent.origin = 'https://wordpress.org';
      mockEvent.data = {
        message: 'height',
        value: 1000,
      };
      mockEvent.source =
        element.shadowRoot.querySelector('iframe').contentWindow;
      win.dispatchEvent(mockEvent);

      expect(forceChangeHeightStub).to.be.calledOnce.calledWith(1000);
    });

    it('should show a warning message when data-url is missing', async () => {
      const originalWarn = console.warn;
      const consoleOutput = [];
      const mockedWarn = (output) => consoleOutput.push(output);
      console.warn = mockedWarn;

      element = createElementWithAttributes(
        win.document,
        'amp-wordpress-embed',
        {}
      );
      doc.body.appendChild(element);

      await element.buildInternal();
      await element.layoutCallback();

      expect(consoleOutput.length).to.equal(1);
      expect(consoleOutput[0]).to.equal(
        'data-url is required for <amp-wordpress-embed>'
      );

      console.warn = originalWarn;
    });
  }
);
