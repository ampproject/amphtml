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

import {CommonSignals} from '../../../../src/common-signals';
import {StoryAdPage} from '../story-ad-page';

const NOOP = () => {};

const baseConfig = {
  'amp-story': '',
  'data-slot': '/30497360/a4a/fake_ad_unit',
  'class': 'i-amphtml-story-ad',
  'layout': 'fill',
  'type': 'doubleclick',
};

const localizationMock = {
  getLocalizedString: NOOP,
};

const pageImplMock = {
  delegateVideoAutoplay: NOOP,
};

describes.realWin('amp-story-auto-ads', {amp: true}, env => {
  let doc;
  let storyAutoAdsEl;
  let storyAdPage;

  beforeEach(() => {
    doc = env.win.document;
    storyAutoAdsEl = doc.createElement('amp-story-auto-ads');
    doc.body.appendChild(storyAutoAdsEl);
    storyAutoAdsEl.getAmpDoc = () => env.ampdoc;
    storyAdPage = new StoryAdPage(
      storyAutoAdsEl,
      baseConfig,
      1, // index
      localizationMock
    );
  });

  describe('#build', () => {
    it('creates the correct DOM structure', () => {
      const pageElement = storyAdPage.build();

      expect(pageElement.tagName).to.equal('AMP-STORY-PAGE');
      expect(pageElement).to.have.attribute('ad');
      expect(pageElement).to.have.attribute('distance', 2);
      expect(pageElement).to.have.attribute('id', 'i-amphtml-ad-page-1');

      const contentGridLayer = pageElement.firstChild;
      expect(contentGridLayer.tagName).to.equal('AMP-STORY-GRID-LAYER');

      const ad = contentGridLayer.firstChild;
      expect(ad.tagName).to.equal('AMP-AD');
      expect(ad).to.have.attribute('type', 'doubleclick');
      expect(ad).to.have.attribute('data-slot', '/30497360/a4a/fake_ad_unit');
      expect(ad).to.have.attribute('layout', 'fill');
      expect(ad).to.have.attribute('amp-story');
      expect(ad).to.have.class('i-amphtml-story-ad');

      const glassPaneGridLayer = pageElement.lastChild;
      expect(glassPaneGridLayer.tagName).to.equal('AMP-STORY-GRID-LAYER');

      const glassPane = glassPaneGridLayer.firstChild;
      expect(glassPane).to.have.class('i-amphtml-glass-pane');
    });
  });

  describe('#getAdDoc', () => {
    it('returns the ad document', async () => {
      const pageElement = storyAdPage.build();
      doc.body.appendChild(pageElement);

      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);

      const ampAdElement = doc.querySelector('amp-ad');
      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      await ampAdElement.signals().signal(CommonSignals.INI_LOAD);

      const adDoc = storyAdPage.getAdDoc();
      expect(adDoc).to.exist;
      expect(adDoc).not.to.equal(doc);
      expect(adDoc).to.equal(iframe.contentDocument);
    });
  });

  describe('#hasTimedOut', () => {
    it('should timeout after > 10 seconds', () => {
      const clock = sandbox.useFakeTimers(1555555555555);
      storyAdPage.build();
      expect(storyAdPage.hasTimedOut()).to.be.false;
      clock.tick(10009); // 10 second timeout.
      expect(storyAdPage.hasTimedOut()).to.be.true;
    });
  });

  describe('#isLoaded', () => {
    it('should return whethere ad has loaded', async () => {
      const pageElement = storyAdPage.build();
      doc.body.appendChild(pageElement);
      expect(storyAdPage.isLoaded()).to.be.false;
      const adElement = doc.querySelector('amp-ad');

      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);

      await adElement.signals().signal(CommonSignals.INI_LOAD);
      expect(storyAdPage.isLoaded()).to.be.true;
    });
  });

  describe('#getPageElement', () => {
    it('returns the created amp-story-page', () => {
      const pageElement = storyAdPage.build();
      expect(storyAdPage.getPageElement()).to.equal(pageElement);
    });
  });

  describe('#registerLoadCallback', () => {
    it('registers given functions and executes when loaded', async () => {
      const someFunc = sandbox.spy();
      const pageElement = storyAdPage.build();
      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);
      doc.body.appendChild(pageElement);

      storyAdPage.registerLoadCallback(someFunc);
      expect(someFunc).to.have.not.been.called;

      const adElement = doc.querySelector('amp-ad');
      await adElement.signals().signal(CommonSignals.INI_LOAD);
      expect(someFunc.calledOnce).to.be.true;
    });
  });

  describe('#toggleVisibility', () => {
    it('should add/remove the amp-story-visible attr', async () => {
      const pageElement = storyAdPage.build();
      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);
      doc.body.appendChild(pageElement);

      const ampAdElement = doc.querySelector('amp-ad');
      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      await ampAdElement.signals().signal(CommonSignals.INI_LOAD);

      const iframeBody = iframe.contentDocument.body;
      expect(iframeBody).not.to.have.attribute('amp-story-visible');
      storyAdPage.toggleVisibility();
      expect(iframeBody).to.have.attribute('amp-story-visible');
      storyAdPage.toggleVisibility();
      expect(iframeBody).not.to.have.attribute('amp-story-visible');
    });
  });

  describe('#maybeCreateCta', () => {
    it('works', () => {
      // something
    });
  });
});

// describe('CTA button', () => {
//   beforeEach(async () => {
//     addStoryAutoAdsConfig(adElement);
//     const storyImpl = new MockStoryImpl(storyElement);
//     storyElement.getImpl = () => Promise.resolve(storyImpl);
//     await addStoryPages(doc, storyImpl);
//     await autoAds.buildCallback();
//     await autoAds.layoutCallback();
//     fireBuildSignals(doc);
//     return Promise.resolve();
//   });

//   it('reads value from amp-ad-exit over meta tags', async () => {
//     const iframeContent = `
//       <amp-ad-exit id="exit-api">
//         <script type="application/json">
//         {
//           "targets": {
//             "url_0": {
//               "finalUrl": "https://amp.dev/"
//             }
//           }
//         }
//         </script>
//       </amp-ad-exit>
//     `;
//     addCtaValues(autoAds, 'SHOP', 'https://example.com'); // This url should be ignored.
//     await insertAdContent(autoAds, iframeContent);
//     autoAds.forcePlaceAdAfterPage('story-page-0' /* pageBeforeAdId */);
//     const cta = doc.querySelector('.i-amphtml-story-ad-link');
//     expect(cta.href).to.equal('https://amp.dev/');
//   });
// });

// describe('ad choices', () => {
//   beforeEach(async () => {
//     addStoryAutoAdsConfig(adElement);
//     const storyImpl = new MockStoryImpl(storyElement);
//     storyElement.getImpl = () => Promise.resolve(storyImpl);
//     await addStoryPages(doc, storyImpl);
//     await autoAds.buildCallback();
//     await autoAds.layoutCallback();
//     fireBuildSignals(doc);
//     return Promise.resolve();
//   });

//   it('does not render the ad choices icon if no meta tags present', async () => {
//     addCtaValues(autoAds, 'SHOP', 'https://example.com');
//     await insertAdContent(autoAds, ''); // No ad content.
//     autoAds.forcePlaceAdAfterPage('story-page-0' /* pageBeforeAdId */);
//     const adChoices = doc.querySelector('.i-amphtml-story-ad-attribution');
//     expect(adChoices).not.to.exist;
//   });

//   it('does not render if only one tag present', async () => {
//     const url = 'https://amp.dev';
//     const iframeContent = `
//       <meta name="amp4ads-vars-attribution-url" content="${url}">
//     `;
//     addCtaValues(autoAds, 'SHOP', 'https://example.com');
//     await insertAdContent(autoAds, iframeContent);
//     autoAds.forcePlaceAdAfterPage('story-page-0' /* pageBeforeAdId */);
//     const adChoices = doc.querySelector('.i-amphtml-story-ad-attribution');
//     expect(adChoices).not.to.exist;
//   });

//   it('renders the ad choices icon if meta tags present', async () => {
//     const windowOpenStub = sandbox.stub(win, 'open');
//     const icon =
//       'https://tpc.googlesyndication.com/pagead/images/adchoices/icon.png';
//     const url = 'https://amp.dev';
//     const iframeContent = `
//       <meta name="amp4ads-vars-attribution-icon" content="${icon}">
//       <meta name="amp4ads-vars-attribution-url" content="${url}">
//     `;
//     addCtaValues(autoAds, 'SHOP', 'https://example.com');
//     await insertAdContent(autoAds, iframeContent);
//     autoAds.forcePlaceAdAfterPage('story-page-0' /* pageBeforeAdId */);
//     const adChoices = doc.querySelector('.i-amphtml-story-ad-attribution');
//     expect(adChoices).to.exist;
//     expect(adChoices.getAttribute('src')).to.equal(icon);
//     adChoices.click();
//     expect(windowOpenStub).to.be.calledWith(url);
//   });
// });

// WIP: analytics...
// it('should fire "story-ad-load" upon ad load', async () => {
//   const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
//   new MockStoryImpl(storyElement);
//   addStoryAutoAdsConfig(adElement);
//   await autoAds.buildCallback();
//   await autoAds.layoutCallback();
//   const ampAd = doc.querySelector('amp-ad');
//   ampAd.signals().signal(CommonSignals.INI_LOAD);
//   await macroTask();
//   expect(analyticsStub).to.be.called;
//   expect(analyticsStub).to.have.been.calledWithMatch('story-ad-load', {
//     'loadTime': sinon.match.number,
//   });
// });

// it('should fire "story-ad-request" upon ad request', () => {
//   autoAds.ampStory_ = {
//     element: storyElement,
//     addPage: NOOP,
//   };
//   const page = win.document.createElement('amp-story-page');
//   sandbox.stub(autoAds, 'createAdPage_').returns(page);
//   page.getImpl = () => Promise.resolve();

//   const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
//   autoAds.schedulePage_();

//   expect(analyticsStub).to.be.called;
//   expect(analyticsStub).to.have.been.calledWithMatch('story-ad-request', {
//     'requestTime': sinon.match.number,
//   });
// });

// it('should fire "story-ad-view" upon ad visible', () => {
//   autoAds.ampStory_ = {
//     element: storyElement,
//     addPage: NOOP,
//   };
//   autoAds.setVisibleAttribute_ = NOOP;
//   autoAds.adPagesCreated_ = 1;
//   const page = win.document.createElement('amp-story-page');
//   sandbox.stub(autoAds, 'createAdPage_').returns(page);
//   page.getImpl = () => Promise.resolve();

//   const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
//   autoAds.adPageIds_ = {'ad-page-1': 1};
//   autoAds.handleActivePageChange_(1, 'ad-page-1');

//   expect(analyticsStub).to.be.called;
//   expect(analyticsStub).to.have.been.calledWithMatch('story-ad-view', {
//     'viewTime': sinon.match.number,
//   });
// });
