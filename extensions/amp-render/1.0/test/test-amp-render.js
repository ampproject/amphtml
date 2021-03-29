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

import '../../../amp-bind/0.1/amp-bind';
import '../../../amp-mustache/0.2/amp-mustache';
import '../amp-render';
import * as BatchedJsonModule from '../../../../src/batched-json';
import {htmlFor} from '../../../../src/static-template';
import {toggleExperiment} from '../../../../src/experiments';
import {waitFor} from '../../../../testing/test-helper';
import {whenUpgradedToCustomElement} from '../../../../src/dom';

describes.realWin(
  'amp-render-v1.0',
  {
    amp: {
      extensions: ['amp-mustache:0.2', 'amp-bind:0.1', 'amp-render:1.0'],
    },
  },
  (env) => {
    let win, doc, html, element;

    async function waitRendered() {
      await whenUpgradedToCustomElement(element);
      await element.buildInternal();
      await waitFor(() => {
        // The rendered container inserts a <div> element.
        const div = element.querySelector('div');
        return div && div.textContent;
      }, 'wrapper div rendered');
      return element.querySelector('div');
    }

    async function getRenderedData() {
      const wrapper = await waitRendered();
      return wrapper.textContent;
    }

    beforeEach(async function () {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'amp-render', true, true);
    });

    it('renders from amp-state', async () => {
      const ampState = html`
        <amp-state id="theFood">
          <script type="application/json">
            {
              "name": "Bill"
            }
          </script>
        </amp-state>
      `;
      doc.body.appendChild(ampState);

      element = html`
        <amp-render
          src="amp-state:theFood"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(ampState);
      await ampState.buildInternal();

      const text = await getRenderedData();
      expect(text).to.equal('Hello Bill');
    });

    it('renders json from src', async () => {
      env.sandbox
        .stub(BatchedJsonModule, 'batchFetchJsonFor')
        .resolves({name: 'Joe'});

      element = html`
        <amp-render
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      const text = await getRenderedData();
      expect(text).to.equal('Hello Joe');
    });

    it('fails gracefully when src is omitted', async () => {
      element = html`
        <amp-render width="auto" height="140" layout="fixed-height">
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      const text = await getRenderedData();
      expect(text).to.equal('Hello ');
    });
  }
);
