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

    // it('should listen for resize events', async () => {
    //   // const ampIframe = createAmpIframe(env, {
    //   //   src: iframeSrc,
    //   //   sandbox: 'allow-scripts allow-same-origin',
    //   //   width: 100,
    //   //   height: 100,
    //   //   resizable: '',
    //   // });
    //   const iframeSrc =
    //     'http://iframe.localhost:' +
    //     location.port +
    //     '/test/fixtures/served/iframe.html';
    //   element = html`<amp-iframe src="https://www.wikipedia.org"></amp-iframe>`;

    //   // await waitForAmpIframeLayoutPromise(doc, ampIframe);
    //   await waitRendered();

    //   const impl = await element.getImpl(false);
    //   return new Promise((resolve, unusedReject) => {
    //     impl.updateSize_ = (height, width) => {
    //       resolve({height, width});
    //     };
    //     const iframe = element.querySelector('iframe');
    //     iframe.contentWindow.postMessage(
    //       {
    //         sentinel: 'amp-test',
    //         type: 'embed-size',
    //         height: 217,
    //         width: 113,
    //       },
    //       '*'
    //     );
    //   }).then((res) => {
    //     expect(res.height).to.equal(217);
    //     expect(res.width).to.equal(113);
    //   });
    // });
  }
);
