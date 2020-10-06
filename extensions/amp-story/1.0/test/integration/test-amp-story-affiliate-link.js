/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {
  BrowserController,
  RequestBank,
} from '../../../../../testing/test-helper';

const t = describe.configure().skipSafari().skipEdge();

t.run('amp-story-affiliate link', () => {
  describes.integration(
    'analytics on click',
    {
      body: `
      <amp-story standalone>
        <amp-story-page id="page-1">
          <amp-story-grid-layer template="vertical">
            <h1>Third Page</h1>
            <a id="blink-1" href="https://amp.dev" role="link" target="_blank" affiliate-link-icon="shopping-cart">
              amp.devamp.devamp.devamp.devamp.devamp.dev
            </a>
          </amp-story-grid-layer>
        </amp-story-page>
      </amp-story>
      <amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "trackLinkClicks": {
              "on": "click",
              "selector": "[affiliate-link-icon]",
              "request": "endpoint"
            }
          }
        }
        </script>
      </amp-analytics>`,
      extensions: ['amp-story', 'amp-analytics'],
    },
    (env) => {
      let browser;

      beforeEach(function () {
        browser = new BrowserController(env.win);
        return browser.waitForElementLayout('amp-analytics');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it.skip('should not send any analytics event on expand', async () => {
        browser.click('#blink-1');
        browser.click('h1');
        await expect(RequestBank.withdraw()).to.be.rejected;
      });

      it.skip('should not send any analytics event on collapse', async () => {
        browser.click('#blink-1');
        browser.click('h1');
        await expect(RequestBank.withdraw()).to.be.rejected;
      });

      it.skip('should send analytics event on external click', async () => {
        browser.click('#blink-1');
        browser.click('#blink-1');
        const req = await RequestBank.withdraw();
        expect(req.url).to.equal('/');
      });
    }
  );
});
