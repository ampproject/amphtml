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
import {CommonSignals} from '../../../../src/core/constants/common-signals';
import {
  MockStoryImpl,
  addStoryAutoAdsConfig,
  addStoryPages,
} from './story-mock';
import {NavigationDirection} from '../../../amp-story/1.0/amp-story-page';
import {Services} from '../../../../src/services';
import {StoryAdPage} from '../story-ad-page';
import {macroTask} from '../../../../testing/yield';
import {registerServiceBuilder} from '../../../../src/service';
import {toggleExperiment} from '../../../../src/experiments';

const NOOP = () => {};

// TODO(ccordry): Refactor these tests using new associated classes & try to remove stubbing private methods.
describes.realWin(
  'amp-story-auto-ads',
  {
    amp: {
      extensions: ['amp-story:1.0', 'amp-story-auto-ads'],
    },
  },
  (env) => {
    let win;
    let doc;
    let adElement;
    let storyElement;
    let autoAds;
    let story;
    let storeService;
    let storeGetterStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      const viewer = Services.viewerForDoc(env.ampdoc);
      env.sandbox.stub(Services, 'viewerForDoc').returns(viewer);
      registerServiceBuilder(win, 'performance', function () {
        return {
          isPerformanceTrackingOn: () => false,
        };
      });
      adElement = win.document.createElement('amp-story-auto-ads');
      storyElement = win.document.createElement('amp-story');
      win.document.body.appendChild(storyElement);
      storyElement.appendChild(adElement);
      story = new AmpStory(storyElement);
      autoAds = new AmpStoryAutoAds(adElement);
      storeService = getStoreService(win);
      storeGetterStub = env.sandbox.stub(storeService, 'get');
      // Tests by default assume an 8 page parent story. Overide if needed.
      storeGetterStub
        .withArgs(StateProperty.PAGE_IDS)
        .returns(['1', '2', '3', '4', '5', '6', '7', '8']);
      storeGetterStub.callThrough();
    });

    describe('ad creation', () => {
      beforeEach(() => {
        new MockStoryImpl(storyElement);
        addStoryAutoAdsConfig(adElement);
      });

      it('creates an ad when story pages > min interval', async () => {
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
        const ampAd = doc.querySelector('amp-ad');
        expect(ampAd).to.exist;
      });

      it('doesnt create ad when story pages < min interval', async () => {
        storeGetterStub
          .withArgs(StateProperty.PAGE_IDS)
          .returns(['1', '2', '3', '4']);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
        const ampAd = doc.querySelector('amp-ad');
        expect(ampAd).not.to.exist;
      });

      it('does not create multiple ads in stories of 8 pages', async () => {
        await autoAds.buildCallback();
        await autoAds.layoutCallback();

        // Fake click to ad page.
        storeService.dispatch(Action.CHANGE_PAGE, {
          id: 'i-amphtml-ad-page-1',
          index: 7,
        });
        const ampAds = doc.querySelectorAll('amp-ad');
        expect(ampAds.length).to.equal(1);
      });

      it('creates multiple ads if enough pages', async () => {
        storeGetterStub
          .withArgs(StateProperty.PAGE_IDS)
          .returns([
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
          ]);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();

        // Fake click to ad page.
        storeService.dispatch(Action.CHANGE_PAGE, {
          id: 'i-amphtml-ad-page-1',
          index: 7,
        });
        const ampAds = doc.querySelectorAll('amp-ad');
        expect(ampAds.length).to.equal(2);
      });

      it('does not fetch new ad when viewing previous ad', async () => {
        await autoAds.buildCallback();
        await autoAds.layoutCallback();

        // Fake click to ad page.
        storeService.dispatch(Action.CHANGE_PAGE, {
          id: 'i-amphtml-ad-page-1',
          index: 7,
        });
        // Visit ad page again.
        storeService.dispatch(Action.CHANGE_PAGE, {
          id: 'i-amphtml-ad-page-1',
          index: 7,
        });
        const ampAds = doc.querySelectorAll('amp-ad');
        expect(ampAds.length).to.equal(1);
      });
    });

    describe('service installation', () => {
      let installExtensionForDocStub;
      beforeEach(() => {
        installExtensionForDocStub = env.sandbox.spy();
        env.sandbox
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
          'amp-mustache',
          'latest'
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
        new MockStoryImpl(storyElement);
        addStoryAutoAdsConfig(adElement);
      });

      it('sets the visible attribute when showing', async () => {
        const setVisibleStub = env.sandbox.stub(
          autoAds,
          'setVisibleAttribute_'
        );
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
        // Switching to ad page.
        storeService.dispatch(Action.CHANGE_PAGE, {
          id: 'i-amphtml-ad-page-1',
          index: 7,
        });
        expect(setVisibleStub.calledOnce).to.be.true;
      });

      it('removes the visible attribute when exiting', async () => {
        const removeVisibleStub = env.sandbox.stub(
          autoAds,
          'removeVisibleAttribute_'
        );
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
        autoAds.visibleAdPage_ = {getId: () => 'i-amphtml-ad-page-1'};
        autoAds.handleActivePageChange_(
          /* pageIndex */ 2,
          /* pageId */ 'non-ad-page'
        );
        expect(removeVisibleStub.calledOnce).to.be.true;
      });
    });

    describe('system layer', () => {
      beforeEach(async () => {
        // TODO(#33969) remove when launched.
        toggleExperiment(win, 'story-ad-auto-advance', true);
        // Force sync mutateElement.
        env.sandbox.stub(autoAds, 'mutateElement').callsArg(0);
        addStoryAutoAdsConfig(adElement);
        await story.buildCallback();
        // Fire these events so that story ads thinks the parent story is ready.
        story.signals().signal(CommonSignals.BUILT);
        story.signals().signal(CommonSignals.INI_LOAD);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
      });

      it('should create ad badge', () => {
        const adBadge = doc.querySelector('.i-amphtml-story-ad-badge');
        expect(adBadge).to.exist;
      });

      it('should create progress bar', () => {
        const progressBar = doc.querySelector(
          '.i-amphtml-story-ad-progress-bar'
        );
        expect(progressBar).to.exist;
      });

      it('should propagate the ad-showing attribute to badge & progress bar', () => {
        const adBadgeContainer = doc.querySelector(
          '.i-amphtml-ad-overlay-container'
        );
        const progressBackground = doc.querySelector(
          '.i-amphtml-story-ad-progress-background'
        );
        expect(adBadgeContainer).not.to.have.attribute(Attributes.AD_SHOWING);
        expect(progressBackground).not.to.have.attribute(Attributes.AD_SHOWING);
        storeService.dispatch(Action.TOGGLE_AD, true);
        expect(adBadgeContainer).to.have.attribute(Attributes.AD_SHOWING);
        expect(progressBackground).to.have.attribute(Attributes.AD_SHOWING);
      });

      it('should propagate the desktop-panels attribute to badge & progress bar', () => {
        const adBadgeContainer = doc.querySelector(
          '.i-amphtml-ad-overlay-container'
        );
        const progressBackground = doc.querySelector(
          '.i-amphtml-story-ad-progress-background'
        );
        expect(adBadgeContainer).not.to.have.attribute(
          Attributes.DESKTOP_PANELS
        );
        expect(progressBackground).not.to.have.attribute(
          Attributes.DESKTOP_PANELS
        );
        storeService.dispatch(Action.TOGGLE_UI, UIType.DESKTOP_PANELS);
        expect(adBadgeContainer).to.have.attribute(Attributes.DESKTOP_PANELS);
        expect(progressBackground).to.have.attribute(Attributes.DESKTOP_PANELS);
      });

      it('should propagate the dir=rtl attribute', () => {
        const adBadgeContainer = doc.querySelector(
          '.i-amphtml-ad-overlay-container'
        );
        expect(adBadgeContainer).not.to.have.attribute(Attributes.DIR);
        storeService.dispatch(Action.TOGGLE_RTL, true);
        expect(adBadgeContainer).to.have.attribute(Attributes.DIR, 'rtl');
      });
    });

    describe('analytics triggers', () => {
      it('should fire "story-ad-view" upon ad visible', () => {
        autoAds.ampStory_ = {
          element: storyElement,
          addPage: NOOP,
        };
        autoAds.setVisibleAttribute_ = NOOP;
        autoAds.placementAlgorithm_ = {onPageChange: NOOP};
        autoAds.adPageManager_ = {
          getAdPageById: () => ({
            hasBeenViewed: () => true,
          }),
          getIndexById: () => 1,
          hasId: () => true,
          numberOfAdsCreated: () => 1,
        };
        const analyticsStub = env.sandbox.stub(autoAds, 'analyticsEvent_');
        autoAds.handleActivePageChange_(1, 'i-amphtml-ad-page-1');
        expect(analyticsStub).to.be.called;
        expect(analyticsStub).to.have.been.calledWithMatch('story-ad-view', {
          'viewTime': env.sandbox.match.number,
        });
      });

      it('should fire "story-ad-exit" upon ad exit', () => {
        autoAds.ampStory_ = {
          element: storyElement,
          addPage: NOOP,
        };
        autoAds.placementAlgorithm_ = {onPageChange: NOOP};
        autoAds.visibleAdPage_ = {getId: () => 'page-1'};
        autoAds.adPageManager_ = {
          hasId: () => false,
          numberOfAdsCreated: () => 1,
          getIndexById: () => 1,
        };
        const analyticsStub = env.sandbox.stub(autoAds, 'analyticsEvent_');
        autoAds.handleActivePageChange_(1, 'page-3');

        expect(analyticsStub).to.be.called;
        expect(analyticsStub).to.have.been.calledWithMatch('story-ad-exit', {
          'exitTime': env.sandbox.match.number,
        });
      });
    });

    describe('development mode', () => {
      it('should immediately insert and navigate to ad page', async () => {
        storeGetterStub
          .withArgs(StateProperty.CURRENT_PAGE_ID)
          .returns('story-page-0');

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

        env.sandbox
          .stub(StoryAdPage.prototype, 'maybeCreateCta')
          .resolves(/* success */ true);

        await autoAds.buildCallback();
        await autoAds.layoutCallback();

        const adPageElement = doc.querySelector('#i-amphtml-ad-page-1');
        const insertSpy = env.sandbox.spy(storyImpl, 'insertPage');
        const dispatchStub = env.sandbox.spy(storyEvents, 'dispatch');

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
          env.sandbox.match(payload),
          env.sandbox.match(eventInit)
        );
      });
    });
  }
);
