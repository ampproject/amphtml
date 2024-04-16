import {CommonSignals_Enum} from '#core/constants/common-signals';

import * as experiments from '#experiments';
import {forceExperimentBranch, getExperimentBranch} from '#experiments';

import {Services} from '#service';

import {macroTask} from '#testing/helpers';

import {
  MockStoryImpl,
  addStoryAutoAdsConfig,
  addStoryPages,
} from './story-mock';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {AmpStory} from '../../../amp-story/1.0/amp-story';
import {NavigationDirection} from '../../../amp-story/1.0/amp-story-page';
import {
  Action,
  StateProperty,
  UIType_Enum,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import * as storyEvents from '../../../amp-story/1.0/events';
import {
  AmpStoryAutoAds,
  Attributes,
  RELEVANT_PLAYER_EXPS,
} from '../amp-story-auto-ads';
import {StoryAdPage} from '../story-ad-page';
forceExperimentBranch;

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
    let viewer;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      viewer = Services.viewerForDoc(env.ampdoc);
      env.sandbox.stub(Services, 'viewerForDoc').returns(viewer);
      registerServiceBuilder(win, 'performance', function () {
        return {
          isPerformanceTrackingOn: () => false,
        };
      });
      adElement = win.document.createElement('amp-story-auto-ads');
      storyElement = win.document.createElement('amp-story');
      const pageElement = win.document.createElement('amp-story-page');
      win.document.body.appendChild(storyElement);
      storyElement.appendChild(pageElement);
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

    describe('shared experiments', () => {
      beforeEach(async () => {
        RELEVANT_PLAYER_EXPS[123] = 'fake-exp';
        env.sandbox.stub(viewer, 'isEmbedded').returns(true);
        new MockStoryImpl(storyElement);
        addStoryAutoAdsConfig(adElement);
      });

      it('handles null response', async () => {
        const forceExpStub = env.sandbox.stub(
          experiments,
          'forceExperimentBranch'
        );
        env.sandbox
          .stub(viewer, 'sendMessageAwaitResponse')
          .returns(Promise.resolve(null));
        await autoAds.buildCallback();
        expect(forceExpStub).not.to.be.called;
      });

      it('handles empty array', async () => {
        const forceExpStub = env.sandbox.stub(
          experiments,
          'forceExperimentBranch'
        );
        env.sandbox
          .stub(viewer, 'sendMessageAwaitResponse')
          .returns(Promise.resolve({experimentIds: []}));
        await autoAds.buildCallback();
        expect(forceExpStub).not.to.be.called;
      });

      it('correctly ssets relevant ids', async () => {
        env.sandbox
          .stub(viewer, 'sendMessageAwaitResponse')
          .returns(Promise.resolve({experimentIds: [123]}));
        await autoAds.buildCallback();
        expect(getExperimentBranch(win, 'fake-exp')).to.equal('123');
      });

      it('does not set random ids', async () => {
        const forceExpStub = env.sandbox.stub(
          experiments,
          'forceExperimentBranch'
        );
        env.sandbox
          .stub(viewer, 'sendMessageAwaitResponse')
          .returns(Promise.resolve({experimentIds: [456]}));
        await autoAds.buildCallback();
        expect(forceExpStub).not.to.be.called;
      });
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

      it('should call onPageChange and onNewAdView as required', async () => {
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
            'i-amphtml-ad-page-1',
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

        const onPageChange = env.sandbox.spy(
          autoAds.placementAlgorithm_,
          'onPageChange'
        );
        const onNewAdView = env.sandbox.spy(
          autoAds.placementAlgorithm_,
          'onNewAdView'
        );

        storeService.dispatch(Action.CHANGE_PAGE, {
          id: '7',
          index: 6,
        });
        expect(onPageChange).to.be.calledWith('7');
        expect(onNewAdView).not.to.be.called;

        onPageChange.resetHistory();
        onNewAdView.resetHistory();

        storeService.dispatch(Action.CHANGE_PAGE, {
          id: 'i-amphtml-ad-page-1',
          index: 7,
        });
        expect(onPageChange).not.to.be.called;
        expect(onNewAdView).to.be.calledWith(7);
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
        await autoAds.layoutCallback();
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
        // Force sync mutateElement.
        env.sandbox.stub(autoAds, 'mutateElement').callsArg(0);
        addStoryAutoAdsConfig(adElement);
        await story.buildCallback();
        // Fire these events so that story ads thinks the parent story is ready.
        story.signals().signal(CommonSignals_Enum.BUILT);
        story.signals().signal(CommonSignals_Enum.INI_LOAD);
        await autoAds.buildCallback();
        await autoAds.layoutCallback();
      });

      it('should create ad badge', () => {
        const adBadge = doc.querySelector('.i-amphtml-story-ad-badge');
        expect(adBadge).to.exist;
      });

      it('should propagate the ad-showing attribute to badge', () => {
        const adBadgeContainer = doc.querySelector(
          '.i-amphtml-ad-overlay-container'
        );
        expect(adBadgeContainer).not.to.have.attribute(Attributes.AD_SHOWING);
        storeService.dispatch(Action.TOGGLE_AD, true);
        expect(adBadgeContainer).to.have.attribute(Attributes.AD_SHOWING);
      });

      it('should propagate the desktop-one-panel attribute to ad badge', () => {
        const adBadgeContainer = doc.querySelector(
          '.i-amphtml-ad-overlay-container'
        );
        storeService.dispatch(Action.TOGGLE_UI, UIType_Enum.MOBILE);
        expect(adBadgeContainer).not.to.have.attribute(
          Attributes.DESKTOP_ONE_PANEL
        );
        storeService.dispatch(Action.TOGGLE_UI, UIType_Enum.DESKTOP_ONE_PANEL);
        expect(adBadgeContainer).to.have.attribute(
          Attributes.DESKTOP_ONE_PANEL
        );
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
        ampAd.signals().signal(CommonSignals_Enum.INI_LOAD);
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
