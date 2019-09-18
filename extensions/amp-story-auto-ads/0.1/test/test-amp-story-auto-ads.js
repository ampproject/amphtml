/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import * as storyEvents from '../../../amp-story/1.0/events';
import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStory} from '../../../amp-story/1.0/amp-story';
import {AmpStoryAutoAds, Attributes} from '../amp-story-auto-ads';
import {CommonSignals} from '../../../../src/common-signals';
import {
  MockStoryImpl,
  addCtaValues,
  addStoryAutoAdsConfig,
  addStoryPages,
  fireBuildSignals,
  insertAdContent,
} from './story-mock';
import {NavigationDirection} from '../../../amp-story/1.0/amp-story-page';
import {Services} from '../../../../src/services';
import {macroTask} from '../../../../testing/yield';
import {registerServiceBuilder} from '../../../../src/service';

const NOOP = () => {};

// TODO(ccordry): Continue to refactor the rest of this file to use new test helpers.
describes.realWin(
  'amp-story-auto-ads',
  {
    amp: {
      extensions: ['amp-story:1.0', 'amp-story-auto-ads'],
    },
  },
  env => {
    let win;
    let doc;
    let adElement;
    let storyElement;
    let autoAds;
    let story;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      const viewer = Services.viewerForDoc(env.ampdoc);
      sandbox.stub(Services, 'viewerForDoc').returns(viewer);
      registerServiceBuilder(win, 'performance', () => ({
        isPerformanceTrackingOn: () => false,
      }));
      adElement = win.document.createElement('amp-story-auto-ads');
      storyElement = win.document.createElement('amp-story');
      win.document.body.appendChild(storyElement);
      storyElement.appendChild(adElement);
      story = new AmpStory(storyElement);
      autoAds = new AmpStoryAutoAds(adElement);
    });

    describe('service installation', () => {
      let installExtensionForDocStub;
      beforeEach(() => {
        installExtensionForDocStub = sandbox.spy();
        sandbox
          .stub(Services.extensionsFor(win), 'installExtensionForDoc')
          .callsFake(installExtensionForDocStub);
        new MockStoryImpl(storyElement);
      });

      it('should install amp-mustache when type="custom"', async () => {
        const config = {
          type: 'custom',
          'data-url': '/some/fake/path',
        };
        addStoryAutoAdsConfig(adElement, config);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
        expect(installExtensionForDocStub).to.be.calledWithExactly(
          env.ampdoc,
          'amp-mustache'
        );
      });

      it('should not install amp-mustache when type!="custom"', async () => {
        const config = {
          type: 'doubleclick',
          'data-slot': '/300200/foo',
        };
        new MockStoryImpl(storyElement);
        addStoryAutoAdsConfig(adElement, config);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
        expect(installExtensionForDocStub).not.to.be.calledWithExactly(
          env.ampdoc,
          'amp-mustache'
        );
      });
    });

    describe('glass pane', () => {
      beforeEach(async () => {
        new MockStoryImpl(storyElement);
        addStoryAutoAdsConfig(adElement);
        await autoAds.buildCallback();
        autoAds.layoutCallback();
      });

      it('should create glassPane', () => {
        const pane = doc.querySelector('.i-amphtml-glass-pane');
        expect(pane).to.exist;
      });

      it('glass pane should have full viewport grid parent', () => {
        const pane = doc.querySelector('.i-amphtml-glass-pane');
        const parent = pane.parentElement;
        expect(parent.tagName).to.equal('AMP-STORY-GRID-LAYER');
        expect(parent.getAttribute('template')).to.equal('fill');
      });
    });

    describe('visible attribute', () => {
      beforeEach(() => {
        sandbox.stub(autoAds, 'analyticsEvent_').returns(NOOP);
        autoAds.adPagesCreated_ = 1;
        autoAds.adPageIds_ = {'ad-page-1': 1};
      });

      it('sets the visible attribute when showing', () => {
        const setVisibleStub = sandbox.stub(autoAds, 'setVisibleAttribute_');
        sandbox.stub(autoAds, 'startNextAdPage_').returns(NOOP);
        // Switching to ad page.
        autoAds.handleActivePageChange_(
          /* pageIndex */ 1,
          /* pageId */ 'ad-page-1'
        );
        expect(setVisibleStub.calledOnce).to.be.true;
      });

      it('removes the visible attribute when showing', () => {
        const removeVisibleStub = sandbox.stub(
          autoAds,
          'removeVisibleAttribute_'
        );
        autoAds.idOfAdShowing_ = 'ad-page-1';
        autoAds.handleActivePageChange_(
          /* pageIndex */ 2,
          /* pageId */ 'non-ad-page'
        );
        expect(removeVisibleStub.calledOnce).to.be.true;
      });
    });

    describe('ad badge', () => {
      let storeService;

      beforeEach(async () => {
        // Force sync mutateElement.
        sandbox.stub(autoAds, 'mutateElement').callsArg(0);
        addStoryAutoAdsConfig(adElement);
        storeService = getStoreService(win);
        await story.buildCallback();
        // Fire these events so that story ads thinks the parent story is ready.
        story.signals().signal(CommonSignals.BUILT);
        story.signals().signal(CommonSignals.INI_LOAD);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
      });

      it('should propigate the ad-showing attribute', () => {
        expect(autoAds.getAdBadgeRoot()).not.to.have.attribute(
          Attributes.AD_SHOWING
        );
        storeService.dispatch(Action.TOGGLE_AD, true);
        expect(autoAds.getAdBadgeRoot()).to.have.attribute(
          Attributes.AD_SHOWING
        );
      });

      it('should propigate the desktop-panels attribute', () => {
        expect(autoAds.getAdBadgeRoot()).not.to.have.attribute(
          Attributes.DESKTOP_PANELS
        );
        storeService.dispatch(Action.TOGGLE_UI, UIType.DESKTOP_PANELS);
        expect(autoAds.getAdBadgeRoot()).to.have.attribute(
          Attributes.DESKTOP_PANELS
        );
      });

      it('should propigate the dir=rtl attribute', () => {
        expect(autoAds.getAdBadgeRoot()).not.to.have.attribute(Attributes.DIR);
        storeService.dispatch(Action.TOGGLE_RTL, true);
        expect(autoAds.getAdBadgeRoot()).to.have.attribute(
          Attributes.DIR,
          'rtl'
        );
      });
    });

    describe('CTA button', () => {
      beforeEach(async () => {
        addStoryAutoAdsConfig(adElement);
        const storyImpl = new MockStoryImpl(storyElement);
        storyElement.getImpl = () => Promise.resolve(storyImpl);
        await addStoryPages(doc, storyImpl);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
        fireBuildSignals(doc);
        return Promise.resolve();
      });

      it('reads value from amp-ad-exit over meta tags', async () => {
        const iframeContent = `
          <amp-ad-exit id="exit-api">
            <script type="application/json">
            {
              "targets": {
                "url_0": {
                  "finalUrl": "https://amp.dev/"
                }
              }
            }
            </script>
          </amp-ad-exit>
        `;
        addCtaValues(autoAds, 'SHOP', 'https://example.com'); // This url should be ignored.
        await insertAdContent(autoAds, iframeContent);
        autoAds.forcePlaceAdAfterPage('story-page-0' /* pageBeforeAdId */);
        const cta = doc.querySelector('.i-amphtml-story-ad-link');
        expect(cta.href).to.equal('https://amp.dev/');
      });
    });

    describe('ad choices', () => {
      beforeEach(async () => {
        addStoryAutoAdsConfig(adElement);
        const storyImpl = new MockStoryImpl(storyElement);
        storyElement.getImpl = () => Promise.resolve(storyImpl);
        await addStoryPages(doc, storyImpl);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
        fireBuildSignals(doc);
        return Promise.resolve();
      });

      it('does not render the ad choices icon if no meta tags present', async () => {
        addCtaValues(autoAds, 'SHOP', 'https://example.com');
        await insertAdContent(autoAds, ''); // No ad content.
        autoAds.forcePlaceAdAfterPage('story-page-0' /* pageBeforeAdId */);
        const adChoices = doc.querySelector('.i-amphtml-story-ad-attribution');
        expect(adChoices).not.to.exist;
      });

      it('does not render if only one tag present', async () => {
        const url = 'https://amp.dev';
        const iframeContent = `
          <meta name="amp4ads-vars-attribution-url" content="${url}">
        `;
        addCtaValues(autoAds, 'SHOP', 'https://example.com');
        await insertAdContent(autoAds, iframeContent);
        autoAds.forcePlaceAdAfterPage('story-page-0' /* pageBeforeAdId */);
        const adChoices = doc.querySelector('.i-amphtml-story-ad-attribution');
        expect(adChoices).not.to.exist;
      });

      it('renders the ad choices icon if meta tags present', async () => {
        const windowOpenStub = sandbox.stub(win, 'open');
        const icon =
          'https://tpc.googlesyndication.com/pagead/images/adchoices/icon.png';
        const url = 'https://amp.dev';
        const iframeContent = `
          <meta name="amp4ads-vars-attribution-icon" content="${icon}">
          <meta name="amp4ads-vars-attribution-url" content="${url}">
        `;
        addCtaValues(autoAds, 'SHOP', 'https://example.com');
        await insertAdContent(autoAds, iframeContent);
        autoAds.forcePlaceAdAfterPage('story-page-0' /* pageBeforeAdId */);
        const adChoices = doc.querySelector('.i-amphtml-story-ad-attribution');
        expect(adChoices).to.exist;
        expect(adChoices.getAttribute('src')).to.equal(icon);
        adChoices.click();
        expect(windowOpenStub).to.be.calledWith(url);
      });
    });

    describe('analytics triggers', () => {
      it('should fire "story-ad-insert" upon insertion', () => {
        autoAds.uniquePagesCount_ = 10;
        autoAds.adPagesCreated_ = 1;
        sandbox.stub(autoAds, 'startNextAdPage_');
        sandbox.stub(autoAds, 'tryToPlaceAdAfterPage_').returns(/* placed */ 1);
        const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
        autoAds.handleActivePageChange_(3, 'fakePage');
        expect(analyticsStub).to.be.called;
        expect(analyticsStub).to.have.been.calledWithMatch('story-ad-insert', {
          'insertTime': sinon.match.number,
        });
      });

      it('should fire "story-ad-discard" upon discarded ad', () => {
        autoAds.uniquePagesCount_ = 10;
        autoAds.adPagesCreated_ = 1;
        sandbox.stub(autoAds, 'startNextAdPage_');
        sandbox
          .stub(autoAds, 'tryToPlaceAdAfterPage_')
          .returns(/* discard */ 2);
        const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
        autoAds.handleActivePageChange_(3, 'fakePage');
        expect(analyticsStub).to.be.called;
        expect(analyticsStub).to.have.been.calledWithMatch('story-ad-discard', {
          'discardTime': sinon.match.number,
        });
      });

      it('should fire "story-ad-load" upon ad load', async () => {
        const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
        new MockStoryImpl(storyElement);
        addStoryAutoAdsConfig(adElement);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
        const ampAd = doc.querySelector('amp-ad');
        ampAd.signals().signal(CommonSignals.INI_LOAD);
        await macroTask();
        expect(analyticsStub).to.be.called;
        expect(analyticsStub).to.have.been.calledWithMatch('story-ad-load', {
          'loadTime': sinon.match.number,
        });
      });

      it('should fire "story-ad-request" upon ad request', () => {
        autoAds.ampStory_ = {
          element: storyElement,
          addPage: NOOP,
        };
        const page = win.document.createElement('amp-story-page');
        sandbox.stub(autoAds, 'createAdPage_').returns(page);
        page.getImpl = () => Promise.resolve();

        const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
        autoAds.schedulePage_();

        expect(analyticsStub).to.be.called;
        expect(analyticsStub).to.have.been.calledWithMatch('story-ad-request', {
          'requestTime': sinon.match.number,
        });
      });

      it('should fire "story-ad-view" upon ad visible', () => {
        autoAds.ampStory_ = {
          element: storyElement,
          addPage: NOOP,
        };
        autoAds.setVisibleAttribute_ = NOOP;
        autoAds.adPagesCreated_ = 1;
        const page = win.document.createElement('amp-story-page');
        sandbox.stub(autoAds, 'createAdPage_').returns(page);
        page.getImpl = () => Promise.resolve();

        const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
        autoAds.adPageIds_ = {'ad-page-1': 1};
        autoAds.handleActivePageChange_(1, 'ad-page-1');

        expect(analyticsStub).to.be.called;
        expect(analyticsStub).to.have.been.calledWithMatch('story-ad-view', {
          'viewTime': sinon.match.number,
        });
      });

      it('should fire "story-ad-exit" upon ad exit', () => {
        autoAds.ampStory_ = {
          element: storyElement,
          addPage: NOOP,
        };
        autoAds.adPagesCreated_ = 1;
        const page = win.document.createElement('amp-story-page');
        sandbox.stub(autoAds, 'createAdPage_').returns(page);
        page.getImpl = () => Promise.resolve();

        const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
        autoAds.idOfAdShowing_ = 'ad-page-1';
        autoAds.handleActivePageChange_(1, 'page-3');

        expect(analyticsStub).to.be.called;
        expect(analyticsStub).to.have.been.calledWithMatch('story-ad-exit', {
          'exitTime': sinon.match.number,
        });
      });
    });

    describe('development mode', () => {
      it('should immediately insert and navigate to ad page', async () => {
        const storeService = await Services.storyStoreServiceForOrNull(win);
        const storeStub = sandbox.stub(storeService, 'get');
        storeStub
          .withArgs(StateProperty.CURRENT_PAGE_ID)
          .returns('story-page-0');
        storeStub.callThrough();

        const storyImpl = new MockStoryImpl(storyElement);
        storyElement.getImpl = () => Promise.resolve(storyImpl);
        await addStoryPages(doc, storyImpl);

        adElement.id = 'i-amphtml-demo-1';
        adElement.setAttribute('development', '');
        const config = {
          'a4a-conversion': true,
          src: '/examples/amp-story/ads/app-install.html',
          type: 'fake',
        };
        addStoryAutoAdsConfig(adElement, config);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
        addCtaValues(autoAds, 'SHOP', 'https://example.com');

        const adPageElement = doc.querySelector('#i-amphtml-ad-page-1');
        const insertSpy = sandbox.spy(storyImpl, 'insertPage');
        const dispatchStub = sandbox.spy(storyEvents, 'dispatch');

        const ampAd = doc.querySelector('amp-ad');
        ampAd.signals().signal(CommonSignals.INI_LOAD);
        await macroTask();

        expect(insertSpy).calledWith('story-page-0', 'i-amphtml-ad-page-1');
        const payload = {
          'targetPageId': 'i-amphtml-ad-page-1',
          'direction': NavigationDirection.NEXT,
        };
        const eventInit = {bubbles: true};
        expect(dispatchStub).calledWith(
          win,
          adPageElement,
          storyEvents.EventType.SWITCH_PAGE,
          sinon.match(payload),
          sinon.match(eventInit)
        );
      });
    });
  }
);
