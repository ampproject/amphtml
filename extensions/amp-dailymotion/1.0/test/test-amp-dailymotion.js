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

import '../amp-dailymotion';
import {htmlFor} from '#core/dom/static-template';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/test-helper';

describes.realWin(
  'amp-dailymotion-v1.0',
  {
    amp: {
      extensions: ['amp-dailymotion:1.0'],
    },
  },
  (env) => {
    let html;

    const waitForRender = async (element) => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const {shadowRoot} = element;
      await waitFor(() => shadowRoot.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    beforeEach(async () => {
      html = htmlFor(env.win.document);
      toggleExperiment(env.win, 'bento-dailymotion', true, true);
    });

    it('renders', async () => {
      const element = html`
        <amp-dailymotion
          data-videoid="x3rdtfy"
          width="500"
          height="281"
        ></amp-dailymotion>
      `;
      env.win.document.body.appendChild(element);

      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });
  }
);
