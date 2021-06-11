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

import '../amp-twitter';
import {createElementWithAttributes} from '../../../../src/core/dom';
import {doNotLoadExternalResourcesInTest} from '../../../../testing/iframe';
import {serializeMessage} from '../../../../src/3p-frame-messaging';
import {toggleExperiment} from '../../../../src/experiments';
import {waitFor} from '../../../../testing/test-helper';

describes.realWin(
  'amp-twitter-v1.0',
  {
    amp: {
      extensions: ['amp-twitter:1.0'],
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
      toggleExperiment(win, 'bento-twitter', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(doc, 'amp-twitter', {
        'data-tweetid': '585110598171631616',
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it("container's height is changed", async () => {
      const initialHeight = 300;
      element = createElementWithAttributes(win.document, 'amp-twitter', {
        'data-tweetid': '585110598171631616',
        'height': initialHeight,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const impl = await element.getImpl(false);
      const forceChangeHeightStub = env.sandbox.stub(impl, 'forceChangeHeight');

      const mockEvent = new CustomEvent('message');
      const sentinel = JSON.parse(
        element.shadowRoot.querySelector('iframe').getAttribute('name')
      )['attributes']['sentinel'];
      mockEvent.data = serializeMessage('embed-size', sentinel, {
        'height': 1000,
      });
      mockEvent.source =
        element.shadowRoot.querySelector('iframe').contentWindow;
      win.dispatchEvent(mockEvent);
      expect(forceChangeHeightStub).to.be.calledOnce.calledWith(1000);
    });

    it('should replace iframe after tweetid mutation', async () => {
      const originalTweetId = '585110598171631616';
      const newTweetId = '638793490521001985';
      element = createElementWithAttributes(win.document, 'amp-twitter', {
        'data-tweetid': originalTweetId,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      const originalName = iframe.getAttribute('name');
      expect(originalName).to.contain(originalTweetId);
      expect(originalName).not.to.contain(newTweetId);

      element.setAttribute('data-tweetid', newTweetId);
      await waitFor(
        () =>
          element.shadowRoot.querySelector('iframe').getAttribute('name') !=
          originalName,
        'iframe changed'
      );

      const newName = element.shadowRoot
        .querySelector('iframe')
        .getAttribute('name');
      expect(newName).not.to.contain(originalTweetId);
      expect(newName).to.contain(newTweetId);
    });
  }
);
