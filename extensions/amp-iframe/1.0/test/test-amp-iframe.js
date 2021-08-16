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

import '../amp-iframe';
import {htmlFor} from '#core/dom/static-template';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/test-helper';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {elementStringOrPassThru} from '#core/error/message-helpers';

describes.realWin(
  'amp-iframe-v1.0',
  {
    amp: {
      extensions: ['amp-iframe:1.0'],
    },
  },
  (env) => {
    let win, doc, html, element;

    async function waitRendered() {
      await whenUpgradedToCustomElement(element);
      await element.buildInternal();
      await waitFor(() => element.isConnected, 'element connected');
    }

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-iframe', true, true);
    });

    it('should render', async () => {
      element = html`
        <amp-iframe src="https://www.wikipedia.org"></amp-iframe>
      `;
      doc.body.appendChild(element);

      await waitRendered();

      expect(element.parentNode).to.equal(doc.body);
      expect(element.getAttribute('src')).to.equal('https://www.wikipedia.org');
    });
  }
);
