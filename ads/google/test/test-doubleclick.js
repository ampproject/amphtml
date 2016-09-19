/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
  createFixtureIframeFromHtml,
  pollForLayout,
  poll,
} from '../../../testing/iframe';

const waitTime = 20 * 1000;

const doubleClickTest = function(config) {
  let fixture;
  let ampAd;
  let initialAmpAdStyle;
  let ampAdIframe;
  let canvas;

  it(config.it, function() {
    return createFixtureIframeFromHtml(config.html, 500, config.beforeLoad)
        .then(f => {
          fixture = f;
          return pollForLayout(fixture.win, 1, waitTime).then(() => {
            return poll('iframe in DOM', () =>
                fixture.doc.querySelector('iframe'));
          });
        })
    .then(iframe => {
      ampAdIframe = iframe;
      ampAd = iframe.parentElement;
      initialAmpAdStyle = ampAd.getAttribute('style');
      expect(initialAmpAdStyle).to.not.be.null;

      if (config.multiSize) {
        expect(ampAd.getAttribute('data-multi-size')).to.equal(
            config.multiSize);
      }

      if (config.categoryExclusions) {
        expect(iframe.src).to.contain('categoryExclusions');
        config.categoryExclusions.forEach(category => {
          expect(iframe.src).to.contain(category);
        });
      }
      expect(iframe.src).to.contain('http://localhost:9876/dist.3p/current');

      expect(iframe).to.not.be.null;
      expect(iframe.style.display).to.equal('');

      const url = iframe.getAttribute('src');
      const fragment = url.substr(url.indexOf('#') + 1);
      const data = JSON.parse(fragment);

      expect(data.type).to.equal('doubleclick');
      expect(data.width).to.equal(Number(config.primarySize.width));
      expect(data.height).to.equal(Number(config.primarySize.height));
      if (config.targeting) {
        expect(data.targeting).to.be.jsonEqual(config.targeting);
      }

      return poll('iframe loaded', () => {
        if (iframe.contentWindow && iframe.contentWindow.document) {
          return iframe.contentWindow.document.getElementById('c');
        }
      });
    }).then(cDiv => {
      // #c div has successfully loaded.
      canvas = cDiv;
      return poll('3p JS loaded', () => ampAdIframe.contentWindow.context);
    }).then(context => {
      expect(context).to.not.be.null;
      // In some browsers the referrer is empty. But in Chrome it works, so
      // we always check there.
      if (context.referrer !== '' ||
          (navigator.userAgent.match(/Chrome/))) {
        expect(context.referrer).to.contain('http://localhost:' + location.port);
      }
      expect(context.pageViewId).to.be.greaterThan(0);
      expect(context.initialIntersection).to.be.defined;
      expect(context.initialIntersection.rootBounds).to.be.defined;
      return poll('main ad JS is injected', () => {
        return ampAdIframe.contentWindow.document.querySelector(
          'script[src="https://www.googletagservices.com/tag/js/gpt.js"]');
      }, undefined, waitTime);
    }).then(() => {
      return fixture.messages.filter(message => {
        return message.type == 'render-start';
      }).length;
    }).then(() => {
      expect(ampAdIframe.style.visibility).to.equal('hidden');
      const win = ampAdIframe.contentWindow;
      return poll('GPT loaded', () => {
        return win.googletag && win.googletag.pubads && win.googletag.pubads();
      });
    }).then(pubads => {
      expect(pubads.get('page_url')).to.equal(config.pageUrl);
      const slot = canvas.slot;
      expect(slot).to.not.be.null;
      return poll('Actual ad loaded', () => {
        return canvas.querySelector(
            '[id="' + config.adIframeId + '"]');
      }, null, 5000);
    }).then(adIframe => {
      expect(ampAdIframe.contentWindow.context.hidden).to.be.false;
      return poll('Creative content loaded', () => {
        return adIframe.contentWindow.document.body.childNodes !== 0;
      }, null, 5000);
    }).then(() => {
      expect(ampAdIframe.getAttribute('width')).to.equal(
          config.primarySize.width);
      expect(ampAdIframe.getAttribute('height')).to.equal(
          config.primarySize.height);
      if (config.expectResize) {
        ampAdIframe.contentWindow.scrollTo(0,
            ampAdIframe.contentWindow.document.body.scrollHeight);
      }
      return poll('Creative id transmitted. Ad fully rendered.', () => {
        return ampAd.creativeId;
      }, null, waitTime);
    }).then(creativeId => {
      expect(creativeId).to.match(/^dfp-/);

      // If a secondary dimension is larger than a larger dimension, the
      // returned creative ought to be empty.
      if (config.expectEmpty) {
        expect(creativeId).to.equal('dfp-_empty_');
      }
      if (creativeId == 'dfp-_empty_') {
        // Nothing else to do; bail out of test.
        return null;
      }
      const canvasRect = canvas.getBoundingClientRect();
      expect(canvasRect.width).to.equal(
          Number(config.actualCreativeSize.width));
      expect(canvasRect.height).to.equal(
          Number(config.actualCreativeSize.height));
      if (!config.expectResize) {
        return null;
      }
      return poll('<amp-ad> resized', () => {
        const newAmpAdStyle = ampAd.getAttribute('style');
        if (newAmpAdStyle != initialAmpAdStyle) {
          return newAmpAdStyle;
        }
      }, null, 15000);
    }).then(newAmpAdStyle => {
      if (config.expectResize) {
        expect(newAmpAdStyle).to.not.be.null;
      }
      if (newAmpAdStyle) {
        expect(newAmpAdStyle).to.contain('width: ' +
            config.actualCreativeSize.width);
        expect(newAmpAdStyle).to.contain('height: ' +
            config.actualCreativeSize.height);
      }
    });
  });
};

const htmlFirstHalf =
'<!doctype html>' +
'<html ⚡>' +
'  <head>' +
'    <meta charset="utf-8">' +
'    <title>DoubleClick Test</title>' +
'    <link rel="canonical" href="http://nonblocking.io/" >' +
'    <script async src="https://cdn.ampproject.org/v0.js"></script>' +
'    <meta name="amp-3p-iframe-src" ' +
'content="http://localhost:9876/dist.3p/current/frame.max.html">' +
'  </head>' +
'  <body>';

const htmlSecondHalf = '</body></html>';

const createFixtureHtml = function(config, fold) {
  let ampAd = fold ? '<div style="height: 500px; background: #000;"></div>'
      : '';
  ampAd += '<amp-ad type="doubleclick"' +
      'data-slot="/4119129/mobile_ad_banner" ' +
      'width=' + config.width + ' ' +
      'height=' + config.height + ' ';
  if (config.multiSize) {
    ampAd += 'data-multi-size="' + config.multiSize + '" ';
  }
  if (config.multiSizeValidation) {
    ampAd += 'data-multi-size-validation="' + config.multiSizeValidation + '" ';
  }
  if (config.json) {
    ampAd += 'json=\'' + config.json + '\' ';
  }
  ampAd += '></amp-ad>';
  return htmlFirstHalf + ampAd + htmlSecondHalf;
};

describe('doubleclick ad request', function() {
  this.timeout(waitTime);
  let beforeHref;
  afterEach(() => {
    if (beforeHref) {
      window.history.replaceState(null, null, beforeHref);
    }
  });

  doubleClickTest({
    html: createFixtureHtml({
      width: 320,
      height: 50,
      json: '{"targeting":{"amptest":"true"}, "categoryExclusions":' +
        '["health"],"tagForChildDirectedTreatment":0}',
    }, false),
    primarySize: {height: '50', width: '320'},
    actualCreativeSize: {height: '50', width: '320'},
    expectResize: false,
    pageUrl: 'http://nonblocking.io/',
    categoryExclusions: ['health'],
    targeting: {'amptest': 'true'},
    adIframeId: 'google_ads_iframe_/4119129/mobile_ad_banner_0',
    // Need the following to ensure we don't go into Glade code path.
    // TODO(levitzky) Figure out some tests for Glade.
    beforeLoad: function(win) {
      beforeHref = win.parent.location.href;
      win.parent.history.replaceState(null, null, win.parent.location.href
          + '?google_glade=0');
    },
    it: 'should render regular non-multi-size non-glade DoubleClick ad',
  });
});

describe('multi-size doubleclick ad request, above the fold', function() {
  this.timeout(waitTime);
  doubleClickTest({
    html: createFixtureHtml({
      width: 480,
      height: 75,
      multiSize: '320x50',
    }, false),
    multiSize: '320x50',
    primarySize: {height: '75', width: '480'},
    actualCreativeSize: {height: '50', width: '320'},
    expectResize: false,
    pageUrl: 'http://nonblocking.io/',
    adIframeId: 'google_ads_iframe_/4119129/mobile_ad_banner_0',
    it: '(multi-size) should render an ad without resizing',
  });
});

describe('multi-size doubleclick ad request, below the fold', function() {
  this.timeout(waitTime);
  doubleClickTest({
    html: createFixtureHtml({
      width: 480,
      height: 75,
      multiSize: '320x50',
    }, true),
    multiSize: '320x50',
    primarySize: {height: '75', width: '480'},
    actualCreativeSize: {height: '50', width: '320'},
    expectResize: true,
    pageUrl: 'http://nonblocking.io/',
    adIframeId: 'google_ads_iframe_/4119129/mobile_ad_banner_0',
    it: '(multi-size) should render an ad with resizing',
  });
});

describe(
    'multi-size doubleclick ad request, secondary size larger than primary',
    function() {
      this.timeout(waitTime);
      doubleClickTest({
        html: createFixtureHtml({
          width: 480,
          height: 75,
          multiSize: '620x50',
        }, false),
        multiSize: '620x50',
        primarySize: {height: '75', width: '480'},
        actualCreativeSize: {height: '50', width: '320'},
        expectResize: false,
        pageUrl: 'http://nonblocking.io/',
        adIframeId: 'google_ads_iframe_/4119129/mobile_ad_banner_0',
        it: '(multi-size) ad rendering should fail',
        expectEmpty: true,
      });
    });

describe('multi-size doubleclick ad request, ' +
    'secondary size less than 2/3rds of primary',
    function() {
      this.timeout(waitTime);
      doubleClickTest({
        html: createFixtureHtml({
          width: 900,
          height: 100,
          multiSize: '320x50',
        }, false),
        multiSize: '320x50',
        primarySize: {height: '100', width: '900'},
        actualCreativeSize: {height: '50', width: '320'},
        expectResize: false,
        pageUrl: 'http://nonblocking.io/',
        adIframeId: 'google_ads_iframe_/4119129/mobile_ad_banner_0',
        it: '(multi-size) ad rendering should fail',
        expectEmpty: true,
      });
    });

describe('multi-size doubleclick ad request, ' +
    'secondary size less than 2/3rds of primary but validation to be ' +
    'ignored, above fold',
    function() {
      this.timeout(waitTime);
      doubleClickTest({
        html: createFixtureHtml({
          width: 900,
          height: 100,
          multiSize: '320x50',
          multiSizeValidation: 'false',
        }, false),
        multiSize: '320x50',
        primarySize: {height: '100', width: '900'},
        actualCreativeSize: {height: '50', width: '320'},
        expectResize: false,
        pageUrl: 'http://nonblocking.io/',
        adIframeId: 'google_ads_iframe_/4119129/mobile_ad_banner_0',
        it: '(multi-size) ad should render',
      });
    });

describe('multi-size doubleclick ad request, ' +
    'secondary size less than 2/3rds of primary but validation to be ' +
    'ignored, below fold',
    function() {
      this.timeout(waitTime);
      doubleClickTest({
        html: createFixtureHtml({
          width: 480,
          height: 76,
          multiSize: '320x50',
          multiSizeValidation: 'false',
        }, true),
        multiSize: '320x50',
        primarySize: {height: '76', width: '480'},
        actualCreativeSize: {height: '50', width: '320'},
        expectResize: true,
        pageUrl: 'http://nonblocking.io/',
        adIframeId: 'google_ads_iframe_/4119129/mobile_ad_banner_0',
        it: '(multi-size) ad should render',
      });
    });

