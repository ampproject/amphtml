/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-video-iframe';
import {dispatchCustomEvent} from '../../../../src/dom';
import {htmlFor} from '../../../../src/static-template';
import {toggleExperiment} from '../../../../src/experiments';
import {waitFor} from '../../../../testing/test-helper';

describes.realWin(
  'amp-video-iframe-v1.0',
  {
    amp: {
      extensions: ['amp-video-iframe:1.0'],
      canonicalUrl: 'https://canonicalexample.com/',
    },
  },
  (env) => {
    let html;
    let element;

    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      const iframe = shadow.querySelector('iframe');
      dispatchCustomEvent(iframe, 'canplay', null, {bubbles: false});
      await loadPromise;
    };

    beforeEach(() => {
      html = htmlFor(env.win.document);
      toggleExperiment(env.win, 'bento-video-iframe', true, true);
    });

    it('renders iframe', async () => {
      element = html`
        <amp-video-iframe
          layout="responsive"
          width="16"
          height="9"
        ></amp-video-iframe>
      `;

      element.setAttribute(
        'src',
        `http://localhost:${location.port}/test/fixtures/served/blank.html#`
      );

      env.win.document.body.appendChild(element);

      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });
  }
);
