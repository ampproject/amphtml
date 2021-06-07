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

import '../amp-facebook-page';
import {createElementWithAttributes} from '../../../../src/dom';
import {doNotLoadExternalResourcesInTest} from 'testing/iframe';
import {resetServiceForTesting} from '../../../../src/service';
import {serializeMessage} from '../../../../src/3p-frame-messaging';
import {setDefaultBootstrapBaseUrlForTesting} from '../../../../src/3p-frame';
import {toggleExperiment} from 'src/experiments';
import {waitFor} from 'testing/test-helper';

describes.realWin(
  'amp-facebook-page',
  {
    amp: {
      extensions: ['amp-facebook-page:1.0'],
    },
  },
  (env) => {
    let win, doc, element;

    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    beforeEach(async function () {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-facebook-page', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('ensures iframe is not sandboxed in amp-facebook-page', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.hasAttribute('sandbox')).to.be.false;
    });

    it('propagates title to iframe', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'height': 500,
        'width': 500,
        'layout': 'responsive',
        'title': 'my custom facebook page',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.title).to.equal('my custom facebook page');
    });

    it('renders amp-facebook-page with specified locale', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'data-locale': 'fr_FR',
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('name')).to.contain('"locale":"fr_FR"');
    });

    it('renders with correct embed type', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      const context = JSON.parse(iframe.getAttribute('name'));
      expect(context.attributes.embedAs).to.equal('page');
    });

    it("container's height is changed", async () => {
      const iframeSrc =
        'http://ads.localhost:' +
        location.port +
        '/test/fixtures/served/iframe.html';
      resetServiceForTesting(win, 'bootstrapBaseUrl');
      setDefaultBootstrapBaseUrlForTesting(iframeSrc);

      const initialHeight = 300;
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'height': initialHeight,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const impl = await element.getImpl(false);
      const attemptChangeHeightStub = env.sandbox.stub(
        impl,
        'attemptChangeHeight'
      );
      attemptChangeHeightStub.returns(Promise.resolve());

      const iframe = element.shadowRoot.querySelector('iframe');
      const mockEvent = new CustomEvent('message');
      const sentinel = JSON.parse(iframe.getAttribute('name'))['attributes'][
        '_context'
      ]['sentinel'];
      mockEvent.data = serializeMessage('embed-size', sentinel, {
        'height': 1000,
      });
      mockEvent.source = iframe.contentWindow;
      win.dispatchEvent(mockEvent);
      expect(attemptChangeHeightStub).to.be.calledOnce.calledWith(1000);
    });
  }
);
