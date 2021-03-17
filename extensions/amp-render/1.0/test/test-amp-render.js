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

import '../amp-render';
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
    let win, doc, element, ampState, template;

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
      return JSON.parse(wrapper.textContent);
    }

    beforeEach(async function () {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'amp-render', true, true);
    });

    it('renders', async () => {
      element = doc.createElement('amp-render');
      doc.body.appendChild(element);
      await waitFor(() => element.isConnected, 'element connected');
      expect(element.parentNode).to.equal(doc.body);
    });

    it.skip('render amp-state json into mustache template', async () => {
      ampState = doc.createElement('amp-state');
      ampState.setAttribute('id', 'someData');
      ampState.innerHTML = `
      <script type="application/json">
      {
          "name": "Google",
          "url": "https://google.com"
      }
      </script>`;
      doc.body.appendChild(ampState);

      template = document.createElement('template');
      template.setAttribute('type', 'amp-mustache');
      template.content.textContent = JSON.stringify({
        name: '{{name}}',
        url: '{{url}}',
      });

      element = doc.createElement('amp-render');
      element.setAttribute('src', 'amp-state:someData');
      element.appendChild(template);
      doc.body.appendChild(element);
      console.error(element.innerHTML);
      const divEl = await waitRendered();
      expect(divEl.textContent).to.contain('Google');
    });
  }
);
