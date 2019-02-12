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
import {PLATFORM_NAME} from '../../extensions/amp-skimlinks/0.1/constants';
import {parseQueryString} from '../../src/url';

// Create fake test urls to replace skimlinks API urls.
// RequestBank allow us to check if an API request has been made
// or not by calling RequestBank.withdraw later.
const pageTrackingUrl = RequestBank.getUrl('pageTrackingUrl') +
  '/track.php?data=${data}';
const linksTrackingUrl = RequestBank.getUrl('linksTrackingUrl') +
  '/link?data=${data}';
const nonAffiliateTrackingUrl = RequestBank.getUrl('nonAffiliateTrackingUrl') +
  '?call=track&data=${data}';
const waypointUrl = `${RequestBank.getUrl('waypointUrl')}/`;

// Simulated click event created by browser.click() does not trigger
// the browser navigation when dispatched on a link.
// Using MouseEvent("click") instead of Event("click") does,
// which is what we need for some tests.
function clickLinkAndNavigate_(doc, selector) {
  const element = doc.querySelector(selector);
  if (element) {
    const clickEvent = new MouseEvent('click', {bubbles: true});
    element.dispatchEvent(clickEvent);
  }
}

describe('amp-skimlinks', function() {
  const setupBasic = {
    extensions: ['amp-skimlinks'],
    body: `
    <amp-skimlinks
        layout="nodisplay"
        publisher-code="123X123"
        tracking="true"
        custom-redirect-domain="${waypointUrl}"
    >
      <script type="application/json">
        {
            "pageTrackingUrl": "${pageTrackingUrl}",
            "linksTrackingUrl": "${linksTrackingUrl}",
            "nonAffiliateTrackingUrl": "${nonAffiliateTrackingUrl}"
        }
      </script>
    </amp-skimlinks>
    <div>
        <a id="merchant-link" href="https://nordstrom.com"> Test Merchant </a>
        <a id="non-merchant-link" href="https://google.com"> Test non-Merchant </a>
    </div>
  `,
  };
  describes.integration('Basic features', setupBasic, env => {
    let browser = null;
    let clickLinkAndNavigate = null;

    beforeEach(() => {
      clickLinkAndNavigate = selector => {
        return clickLinkAndNavigate_(env.win.document, selector);
      };
      browser = new BrowserController(env.win);

      return browser.waitForElementBuild('amp-skimlinks');
    });

    it('Should send the page impression tracking request', () => {
      return RequestBank.withdraw('pageTrackingUrl').then(req => {
        const regex = /^\/track\.php\?data=([^&]*)&?.*$/;
        const match = regex.exec(req.url);

        expect(match).to.have.lengthOf(2);
        const data = JSON.parse(decodeURIComponent(match[1]));
        expect(data.jv).to.equal(PLATFORM_NAME);
        expect(data.pub).to.equal('123X123');
        // nonblocking.io is the default canonical url.
        expect(data.pag).to.equal('http://nonblocking.io/');
        expect(data.uuid).to.have.lengthOf(32);
      });
    });

    it('Should send the links impression tracking request', () => {
      return RequestBank.withdraw('linksTrackingUrl').then(req => {
        const regex = /^\/link\?data=([^&]*)&?.*$/;
        const match = regex.exec(req.url);

        expect(match).to.have.lengthOf(2);
        const data = JSON.parse(decodeURIComponent(match[1]));
        expect(data.jv).to.equal(PLATFORM_NAME);
        expect(data.pub).to.equal('123X123');
        // nonblocking.io is the default canonical url.
        expect(data.pag).to.equal('http://nonblocking.io/');
        expect(data.uuid).to.have.lengthOf(32);

        expect(data.hae).to.equal(1);
        expect(data.dl).to.deep.equal({
          'https://nordstrom.com/': {count: 1, ae: 1},
        });
      });
    });

    // TODO(alanorozco): Unskip on firefox
    const itSkipFirefox = (desc, cb) =>
      it.configure().skipFirefox().run(desc, cb);

    itSkipFirefox('should send NA-tracking on non-merchant link click ', () => {
      // Give 500ms for amp-skimlinks to set up.
      return browser.wait(500).then(() => {
        clickLinkAndNavigate('#non-merchant-link');

        return RequestBank.withdraw('nonAffiliateTrackingUrl').then(req => {
          const regex = /^\/\?call=track&data=([^&]*)&?.*$/;
          const match = regex.exec(req.url);
          expect(match).to.have.lengthOf(2);
          const data = JSON.parse(decodeURIComponent(match[1]));
          expect(data.url).to.equal('https://google.com/');
          expect(data.referrer).to.equal('http://nonblocking.io/');
          expect(data.jv).to.equal(PLATFORM_NAME);
          expect(data.uuid).to.have.lengthOf(32);
          expect(data.pref).to.have.lengthOf.above(1);
        });
      });
    });

    it('Should send merchant links to waypoint on click', () => {
      // Give 500ms for amp-skimlinks to set up.
      return browser.wait(500).then(() => {
        clickLinkAndNavigate('#merchant-link');
        return RequestBank.withdraw('waypointUrl').then(req => {
          // Remove "/?" in the url.
          const queryString = req.url.slice(2);
          const queryParams = parseQueryString(queryString);
          expect(queryParams.id).to.equal('123X123');
          expect(queryParams.jv).to.equal(PLATFORM_NAME);
          expect(queryParams.xuuid).to.have.lengthOf(32);
          expect(queryParams.url).to.equal('https://nordstrom.com/');
          expect(queryParams.sref).to.equal('http://nonblocking.io/');
          expect(queryParams.pref).to.have.lengthOf.above(1);
          expect(queryParams.xs).to.equal('1');
        });
      });
    });
  });


  const setupNoConfig = {
    extensions: ['amp-skimlinks'],
    body: `
      <amp-skimlinks
          layout="nodisplay"
          publisher-code="123X123"
          tracking="true"
      >
      </amp-skimlinks>
      <div>
          <a id="merchant-link" href="https://nordstrom.com"> Test Merchant </a>
          <a id="non-merchant-link" href="https://google.com"> Test non-Merchant </a>
      </div>
  `,
  };
  // The purpose of these tests is to make sure that amp-skimlinks still
  // works when the JSON config necessary to run our tests is not
  // injected (similar to live environment).
  // Since the JSON config is not set we can not use the proxy and
  // therefore can only test a small subset of features.
  describes.integration('Works without test config', setupNoConfig, env => {
    let browser = null;

    beforeEach(() => {
      browser = new BrowserController(env.win);
      return browser.waitForElementBuild('amp-skimlinks');
    });

    it('Should send merchant links to to waypoint on click', () => {
      // Give 500ms for amp-skimlinks to set up.
      return browser.wait(500).then(() => {
        browser.click('#merchant-link');
        const link = env.win.document.querySelector('#merchant-link');
        const regex = /^https\:\/\/go\.skimresources\.com\/\?(.*)$/;
        const match = regex.exec(link.href);
        expect(match).to.be.lengthOf(2);
        const queryParams = parseQueryString(match[1]);
        expect(queryParams.id).to.equal('123X123');
        expect(queryParams.jv).to.equal(PLATFORM_NAME);
        expect(queryParams.xuuid).to.have.lengthOf(32);
        expect(queryParams.url).to.equal('https://nordstrom.com/');
        expect(queryParams.sref).to.equal('http://nonblocking.io/');
        expect(queryParams.pref).to.have.lengthOf.above(1);
        expect(queryParams.xs).to.equal('1');
      });
    });
  });


  const setupUnknownLinks = {
    extensions: ['amp-skimlinks'],
    body: `
        <amp-skimlinks
            layout="nodisplay"
            publisher-code="123X123"
            tracking="true"
        >
          <script type="application/json">
            {
                "beaconUrl": "http://deelay.me/2000/fakeBeacon"
            }
          </script>
        </amp-skimlinks>
        <div>
            <a id="unknown-link" href="https://google.com"> Test unknown link </a>
        </div>
    `,
  };
  describes.integration('Affiliate unknown links', setupUnknownLinks, env => {
    let browser = null;

    beforeEach(() => {
      browser = new BrowserController(env.win);
      return browser.waitForElementBuild('amp-skimlinks');
    });

    it('Should send unknown links to waypoint', () => {
      // Give 500ms for amp-skimlinks to set up.
      return browser.wait(500).then(() => {
        // beacon API url has been overwritten by a deelay.me URL that will keep
        // the request pending during 2s. When the click happens, beacon API has
        // not come back yet with affiliated domain information and the link is
        // still considered as unknown.
        browser.click('#unknown-link');
        const link = env.win.document.querySelector('#unknown-link');
        const regex = /^https\:\/\/go\.skimresources\.com\/\?(.*)$/;
        const match = regex.exec(link.href);
        expect(match).to.be.lengthOf(2);
        const queryParams = parseQueryString(match[1]);
        expect(queryParams.id).to.equal('123X123');
        expect(queryParams.jv).to.equal(PLATFORM_NAME);
        expect(queryParams.xuuid).to.have.lengthOf(32);
        expect(queryParams.url).to.equal('https://google.com/');
        expect(queryParams.sref).to.equal('http://nonblocking.io/');
        expect(queryParams.pref).to.have.lengthOf.above(1);
        expect(queryParams.xs).to.equal('1');
      });
    });
  });
});


