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

import {BrowserController, RequestBank} from '../../testing/test-helper';
import {parseQueryString} from '../../src/url';

const config = describe.configure().skipEdge().skipSafari();

config.run('amp-story analytics', () => {
  const extensions = ['amp-story:1.0', 'amp-analytics', 'amp-social-share'];
  describes.integration(
    'amp-story analytics',
    {
      body: `
    <amp-story standalone supports-landscape>
      <amp-story-page id="page-1">
        <amp-story-grid-layer template="horizontal">
          <p>First page</p>
          <a href="google.com" data-vars-link-id="myLink" id="link-1">Link</a>
          <p id="right-1">Click me</p>
        </amp-story-grid-layer>
      </amp-story-page>
      <amp-story-page id="page-2">
        <amp-story-grid-layer template="horizontal">
          <p id="left-2">Left side</p>
          <p>Center</p>
          <p id="right-2">Click me</p>
        </amp-story-grid-layer>
      </amp-story-page>
      <amp-story-bookend layout="nodisplay">
        <script type="application/json">
        {
          "bookendVersion": "v1.0",
          "shareProviders": [
            {
              "provider": "facebook",
              "data-param-app_id": "1682114265451337",
              "data-param-href": "https://fr-fr.facebook.com/LaRochePosayFrance/"
            },
            {
              "provider": "twitter",
              "data-param-url": "https://twitter.com/larocheposayfr?lang=fr"
            }
          ],
          "components": [
            {
              "type": "heading",
              "text": "Learn more about our 0% formulation charter"
            },
            {
              "type": "cta-link",
              "links": [
                {
                  "text": "Click here",
                  "url": "https://www.laroche-posay.fr/produits-soins/anthelios/peaux-sensibles-ou-allergiques-au-soleil-r93.aspx"
                }
              ]
            },
            {
              "type": "landscape",
              "title": "TRAPPIST-1 Planets May Still Be Wet Enough for Life",
              "url": "http://example.com/article.html",
              "category": "astronomy",
              "image": "http://placehold.it/360x760"
            }
          ]
        }
        </script>
      </amp-story-bookend>
    </amp-story>
    <amp-analytics>
      <script type="application/json">
      {
        "requests": {
          "endpoint": "${RequestBank.getUrl()}"
        },
        "triggers": {
          "trackPageview": {
            "on": "story-page-visible",
            "request": "endpoint",
            "extraUrlParams": {
              "pageVisible": "\${storyPageId}"
            }
          },
          "trackBookendEnter": {
            "on": "story-bookend-enter",
            "request": "endpoint",
            "extraUrlParams": {
              "bookendEnter": true
            }
          },
          "trackBookendExit": {
            "on": "story-bookend-exit",
            "request": "endpoint",
            "extraUrlParams": {
              "bookendExit": true
            }
          },
          "trackFocusedState": {
            "on": "story-focus",
            "request": "endpoint",
            "tagName": "a",
            "extraUrlParams": {
              "focusedLink": "\${linkId}"
            }
          }
        },
        "extraUrlParams": {
          "pageVisible": "\${storyPageId}",
          "bookendEnter": false,
          "bookendExit": false,
          "muted": false,
          "unmuted": false,
          "focusedLink": "\${linkId}"
        }
      }
      </script>
    </amp-analytics>`,
      extensions,
    },
    (env) => {
      let browser;
      let clickAndWait;
      let clickAtPosition;
      let doc;

      beforeEach(async () => {
        browser = new BrowserController(env.win);
        clickAndWait = async (selector) => {
          browser.click(selector);
          await browser.wait(1000);
        };
        clickAtPosition = async (selector, clientX = 0, clientY = 0) => {
          doc = env.win.document;
          const element = doc.querySelector(selector);
          const clickEvent = new MouseEvent('click', {clientX, clientY});
          element.dispatchEvent(clickEvent);
        };
        env.iframe.style.height = '732px';
        env.iframe.style.width = '412px';
        await browser.waitForElementLayout('amp-analytics');
        return browser.waitForElementLayout('amp-story');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it('should send analytics event when landing on a page', async () => {
        await browser.waitForElementLayout('#page-1[active]');

        const req = await RequestBank.withdraw();
        const q = parseQueryString(req.url.substr(1));
        expect(q['pageVisible']).to.equal('page-1');
      });

      it('should send analytics event when navigating', async () => {
        await browser.waitForElementLayout('#page-1[active]');
        await clickAndWait('#right-1');

        await browser.waitForElementLayout('#page-2[active]');

        const req = await RequestBank.withdraw();
        const q = parseQueryString(req.url.substr(1));
        expect(q['pageVisible']).to.equal('page-2');
      });

      it('should send analytics event when entering bookend', async () => {
        await browser.waitForElementLayout('#page-1[active]');
        await clickAndWait('#right-1');

        await browser.waitForElementLayout('#page-2[active]');
        await clickAndWait('#right-2');

        await browser.waitForElementLayout('amp-story-bookend');

        const req = await RequestBank.withdraw();
        const q = parseQueryString(req.url.substr(1));
        expect(q['bookendEnter']).to.equal('true');
      });

      it('should send analytics event when exiting bookend', async () => {
        await browser.waitForElementLayout('#page-1[active]');
        await clickAndWait('#right-1');

        await browser.waitForElementLayout('#page-2[active]');
        await clickAndWait('#right-2');

        await browser.waitForElementLayout('amp-story-bookend');
        await clickAndWait('amp-story-bookend');

        const req = await RequestBank.withdraw();
        const q = parseQueryString(req.url.substr(1));
        expect(q['bookendExit']).to.equal('true');
      });

      it('should send same event twice when repeat option is absent in storyspec', async () => {
        await browser.waitForElementLayout('#page-1[active]');
        await clickAndWait('#right-1');

        await browser.waitForElementLayout('#page-2[active]');
        // Go back to page 1.
        clickAtPosition('#left-2', 10);
        await browser.wait(1000);

        await browser.waitForElementLayout('#page-1[active]');

        const req = await RequestBank.withdraw();
        const q = parseQueryString(req.url.substr(1));
        expect(q['pageVisible']).to.equal('page-1');
      });

      it('should send data vars attribute when specified', async () => {
        await browser.waitForElementLayout('#page-1[active]');
        browser.click('#link-1');
        await browser.wait(1000);

        const req = await RequestBank.withdraw();
        const q = parseQueryString(req.url.substr(1));
        expect(q['focusedLink']).to.equal('myLink');
      });
    }
  );

  describes.integration(
    'repeat in storySpec',
    {
      body: `
    <amp-story standalone supports-landscape>
      <amp-story-page id="page-1">
        <amp-story-grid-layer template="horizontal">
          <p>Left side</p>
          <p>Center</p>
          <p id="right-1">Click me</p>
        </amp-story-grid-layer>
      </amp-story-page>
      <amp-story-page id="page-2">
        <amp-story-grid-layer template="horizontal">
          <p id="left-2">Left side</p>
          <p>Center</p>
          <p id="right-2">Click me</p>
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
          "trackPageview": {
            "on": "story-page-visible",
            "request": "endpoint",
            "storySpec": {
              "repeat": false
            },
            "extraUrlParams": {
              "pageVisible": "\${storyPageId}"
            }
          }
        },
        "extraUrlParams": {
          "pageVisible": "\${storyPageId}"
        }
      }
      </script>
    </amp-analytics>`,
      extensions,
    },
    (env) => {
      let browser;
      let clickAtPosition;
      let doc;

      beforeEach(async () => {
        browser = new BrowserController(env.win);
        clickAtPosition = async (selector, clientX = 0, clientY = 0) => {
          doc = env.win.document;
          const element = doc.querySelector(selector);
          const clickEvent = new MouseEvent('click', {clientX, clientY});
          element.dispatchEvent(clickEvent);
        };
        env.iframe.style.height = '732px';
        env.iframe.style.width = '412px';
        await browser.waitForElementLayout('amp-analytics');
        return browser.waitForElementLayout('amp-story');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it('should not send same analytics event twice when repeat option is present', async () => {
        await browser.waitForElementLayout('#page-1[active]');
        browser.click('#page-1');
        await browser.wait(1000);

        await browser.waitForElementLayout('#page-2[active]');
        // Go back to page 1.
        clickAtPosition('#left-2', 10);
        await browser.wait(1000);

        const req = await RequestBank.withdraw();
        const q = parseQueryString(req.url.substr(1));
        expect(q['pageVisible']).to.equal('page-2');
      });
    }
  );
});
