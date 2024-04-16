import {expect} from 'chai';

import {CommonSignals_Enum} from '#core/constants/common-signals';
import {Keys_Enum} from '#core/constants/key-codes';
import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {Signals} from '#core/data-structures/signals';
import {createElementWithAttributes} from '#core/dom';
import {computedStyle, setImportantStyles} from '#core/dom/style';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';
import {LocalizationService} from '#service/localization';
import {Performance} from '#service/performance-impl';

import {macroTask} from '#testing/helpers';
import {waitFor} from '#testing/helpers/service';
import {poll} from '#testing/iframe';

import {DEFAULT_SUBSCRIPTIONS_PAGE_INDEX} from 'extensions/amp-story-subscriptions/0.1/amp-story-subscriptions';

import * as consent from '../../../../src/consent';
import {registerServiceBuilder} from '../../../../src/service-helpers';
import LocalizedStringsEn from '../_locales/en.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import {AmpStory, SUBSCRIPTIONS_DELAY_DURATION} from '../amp-story';
import {AmpStoryConsent} from '../amp-story-consent';
import {NavigationDirection, PageState} from '../amp-story-page';
import {
  Action,
  AmpStoryStoreService,
  StateProperty,
  SubscriptionsState,
  UIType_Enum,
} from '../amp-story-store-service';
import {EventType, dispatch} from '../events';
import {MediaType_Enum} from '../media-pool';
import {AdvancementMode} from '../story-analytics';
import * as utils from '../utils';

// Represents the correct value of KeyboardEvent.which for the Right Arrow
const KEYBOARD_EVENT_WHICH_RIGHT_ARROW = 39;

describes.realWin(
  'amp-story',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0'],
    },
  },
  (env) => {
    let ampdoc;
    let element;
    let hasSwipeCapability = false;
    let isEmbedded = false;
    let story;
    let replaceStateStub;
    let win;
    let localizationService;
    let fetchJson = {};
    let fetchStub;

    /**
     * @param {number} count
     * @param {Array<string>=} ids
     * @return {!Array<!Element>}
     */
    async function createStoryWithPages(count, ids = [], autoAdvance = false) {
      element = win.document.createElement('amp-story');

      const pageArray = Array(count)
        .fill(undefined)
        .map((unused, i) => {
          const page = win.document.createElement('amp-story-page');
          if (autoAdvance) {
            page.setAttribute('auto-advance-after', '2s');
          }
          page.id = ids && ids[i] ? ids[i] : `-page-${i}`;
          element.appendChild(page);
          return page;
        });

      win.document.body.appendChild(element);
      story = await element.getImpl();

      return pageArray;
    }

    function createStoryAdPage(id) {
      const page = win.document.createElement('amp-story-page');
      page.id = id;
      page.setAttribute('ad', '');
      element.appendChild(page);
      return page.getImpl();
    }

    /**
     * @param {string} eventType
     * @return {!Event}
     */
    function createEvent(eventType) {
      const eventObj = document.createEventObject
        ? document.createEventObject()
        : document.createEvent('Events');
      if (eventObj.initEvent) {
        eventObj.initEvent(eventType, true, true);
      }
      return eventObj;
    }

    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;

      replaceStateStub = env.sandbox.stub(win.history, 'replaceState');

      localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationForDoc')
        .returns(localizationService);
      localizationService.registerLocalizedStringBundles({
        'en': LocalizedStringsEn,
      });

      const viewer = Services.viewerForDoc(env.ampdoc);
      env.sandbox
        .stub(viewer, 'hasCapability')
        .withArgs('swipe')
        .returns(hasSwipeCapability);
      env.sandbox.stub(viewer, 'isEmbedded').withArgs().returns(isEmbedded);
      env.sandbox.stub(Services, 'viewerForDoc').returns(viewer);

      registerServiceBuilder(win, 'performance', function () {
        return {
          isPerformanceTrackingOn: () => false,
        };
      });

      const storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      AmpStory.isBrowserSupported = () => true;

      // Fakes the size of amp-story so it's not built/laid out until we call build/layoutCallbacks
      // allowing us to mock function calls before the lifecycle callbacks.
      setImportantStyles(win.document.documentElement, {'height': 'auto'});

      fetchStub = env.sandbox
        .stub(Services.xhrFor(env.win), 'fetchJson')
        .resolves({
          json: () => Promise.resolve(fetchJson),
        });
    });

    afterEach(() => {
      element.remove();
    });

    it('should activate the first page when built', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);
      await story.layoutCallback();
      // Getting all the AmpStoryPage objets.
      const pageElements = story.element.getElementsByTagName('amp-story-page');
      let pages = Array.from(pageElements).map((el) => el.getImpl());

      pages = await Promise.all(pages);

      // Only the first page should be active.
      for (let i = 0; i < pages.length; i++) {
        i === 0
          ? expect(pages[i].isActive()).to.be.true
          : expect(pages[i].isActive()).to.be.false;
      }
    });

    it('should remove text child nodes when built', async () => {
      await createStoryWithPages(1, ['cover']);
      const textToRemove = 'this should be removed';
      const textNode = win.document.createTextNode(textToRemove);
      story.element.appendChild(textNode);
      story.buildCallback();
      await story.layoutCallback();
      expect(story.element.innerText).to.not.have.string(textToRemove);
    });

    it('should return a valid page index', async () => {
      await createStoryWithPages(4, ['cover', 'page-1', 'page-2', 'page-3']);
      await story.layoutCallback();
      // Getting all the AmpStoryPage objets.
      const pageElements = story.element.getElementsByTagName('amp-story-page');
      let pages = Array.from(pageElements).map((el) => el.getImpl());

      pages = await Promise.all(pages);

      // Only the first page should be active.
      for (let i = 0; i < pages.length; i++) {
        expect(story.getPageIndex(pages[i])).to.equal(i);
      }
    });

    it('should pause/resume pages when switching pages', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);
      await story.layoutCallback();
      // Getting all the AmpStoryPage objects.
      const pageElements = story.element.getElementsByTagName('amp-story-page');
      let pages = Array.from(pageElements).map((el) => el.getImpl());

      pages = await Promise.all(pages);
      const oldPage = pages[0];
      const newPage = pages[1];

      const setStateOldPageStub = env.sandbox.stub(oldPage, 'setState');
      const setStateNewPageStub = env.sandbox.stub(newPage, 'setState');
      await story.switchTo_('page-1');
      expect(setStateOldPageStub).to.have.been.calledOnceWithExactly(
        PageState.NOT_ACTIVE
      );
      expect(setStateNewPageStub).to.have.been.calledOnceWithExactly(
        PageState.PLAYING
      );
    });

    // TODO(#11639): Re-enable this test.
    it.skip('should go to next page on right arrow keydown', async () => {
      await createStoryWithPages();
      const pages = story.element.querySelectorAll('amp-story-page');

      element.buildInternal();

      expect(pages[0].hasAttribute('active')).to.be.true;
      expect(pages[1].hasAttribute('active')).to.be.false;

      // Stubbing because we need to assert synchronously
      const impl = await element.getImpl(false);
      env.sandbox.stub(impl, 'mutateElement').callsFake((mutator) => {
        mutator();
        return Promise.resolve();
      });

      const eventObj = createEvent('keydown');
      eventObj.key = Keys_Enum.RIGHT_ARROW;
      eventObj.which = KEYBOARD_EVENT_WHICH_RIGHT_ARROW;
      const docEl = win.document.documentElement;
      docEl.dispatchEvent
        ? docEl.dispatchEvent(eventObj)
        : docEl.fireEvent('onkeydown', eventObj);

      expect(pages[0].hasAttribute('active')).to.be.false;
      expect(pages[1].hasAttribute('active')).to.be.true;
    });

    it('lock body when amp-story is initialized', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);
      await story.layoutCallback();
      story.lockBody_();
      expect(win.document.body.style.getPropertyValue('overflow')).to.be.equal(
        'hidden'
      );
      expect(
        win.document.documentElement.style.getPropertyValue('overflow')
      ).to.be.equal('hidden');
    });

    it('checks if pagination buttons exist ', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);
      await story.layoutCallback();
      expect(
        story.element.querySelectorAll('.i-amphtml-story-button-container')
          .length
      ).to.equal(2);
    });

    it.skip('toggles `i-amphtml-story-landscape` based on height and width', () => {
      story.element.style.width = '11px';
      story.element.style.height = '10px';
      const isDesktopStub = env.sandbox
        .stub(story, 'isDesktop_')
        .returns(false);
      story.vsync_ = {
        run: (task, state) => {
          if (task.measure) {
            task.measure(state);
          }
          if (task.mutate) {
            task.mutate(state);
          }
        },
      };
      story.onResizeDebounced();
      expect(isDesktopStub).to.be.calledOnce;
      expect(story.element.classList.contains('i-amphtml-story-landscape')).to
        .be.true;
      story.element.style.width = '10px';
      story.element.style.height = '11px';
      story.onResizeDebounced();
      expect(isDesktopStub).to.be.calledTwice;
      expect(story.element.classList.contains('i-amphtml-story-landscape')).to
        .be.false;
    });

    it('should update page id in store', async () => {
      const firstPageId = 'page-one';
      const pageCount = 2;
      await createStoryWithPages(pageCount, [firstPageId, 'page-1']);
      const dispatchSpy = env.sandbox.spy(story.storeService_, 'dispatch');

      env.sandbox.stub(win, 'requestAnimationFrame').callsFake((cb) => cb());
      await story.layoutCallback();
      expect(dispatchSpy).to.have.been.calledWith(Action.CHANGE_PAGE, {
        id: firstPageId,
        index: 0,
      });
    });

    it('should update page id in browser history', async () => {
      const firstPageId = 'page-zero';
      const pageCount = 2;
      await createStoryWithPages(pageCount, [firstPageId, 'page-1']);

      await story.layoutCallback();
      expect(replaceStateStub).to.have.been.calledWith(
        {ampStoryNavigationPath: [firstPageId]},
        ''
      );
    });

    it('should NOT update page id in browser history if ad', async () => {
      const firstPageId = 'i-amphtml-ad-page-1';
      const pageCount = 2;
      await createStoryWithPages(pageCount, [firstPageId, 'page-1']);
      const pages = story.element.querySelectorAll('amp-story-page');
      const firstPage = pages[0];
      firstPage.setAttribute('ad', '');

      await story.layoutCallback();
      expect(replaceStateStub).to.not.have.been.called;
    });

    it('should not set first page to active when rendering paused story', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);

      story.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

      await story.layoutCallback();
      expect(story.getPageById('cover').state_).to.equal(PageState.NOT_ACTIVE);
    });

    it('should default to the one panel UI desktop experience', async () => {
      await createStoryWithPages(4, ['cover', '1', '2', '3']);

      // Don't do this at home. :(
      story.desktopOnePanelMedia_ = {matches: true};

      story.buildCallback();

      await story.layoutCallback();
      expect(story.storeService_.get(StateProperty.UI_STATE)).to.equals(
        UIType_Enum.DESKTOP_ONE_PANEL
      );
    });

    it('should detect landscape opt in', async () => {
      await createStoryWithPages(4, ['cover', '1', '2', '3']);
      story.element.setAttribute('supports-landscape', '');

      // Don't do this at home. :(
      story.desktopOnePanelMedia_ = {matches: true};

      story.buildCallback();

      await story.layoutCallback();
      expect(story.storeService_.get(StateProperty.UI_STATE)).to.equals(
        UIType_Enum.DESKTOP_FULLBLEED
      );
    });

    it('should have a meta tag that sets the theme color', async () => {
      await createStoryWithPages(2);
      story.buildCallback();
      await story.layoutCallback();
      const metaTag = win.document.querySelector('meta[name=theme-color]');
      expect(metaTag).to.not.be.null;
    });

    it('should set the orientation portrait attribute on render', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);

      story.landscapeOrientationMedia_ = {matches: false};
      story.element.setAttribute('standalone', '');
      story.element.setAttribute('supports-landscape', '');

      env.sandbox.stub(story, 'mutateElement').callsFake((fn) => fn());
      story.buildCallback();

      await story.layoutCallback();
      expect(story.element).to.have.attribute('orientation');
      expect(story.element.getAttribute('orientation')).to.equal('portrait');
    });

    it('should set the orientation landscape attribute on render', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);

      story.landscapeOrientationMedia_ = {matches: true};
      story.element.setAttribute('standalone', '');
      story.element.setAttribute('supports-landscape', '');

      env.sandbox.stub(story, 'mutateElement').callsFake((fn) => fn());
      story.buildCallback();

      await story.layoutCallback();
      expect(story.element).to.have.attribute('orientation');
      expect(story.element.getAttribute('orientation')).to.equal('landscape');
    });

    it('should not set orientation landscape if no supports-landscape', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);

      story.landscapeOrientationMedia_ = {matches: true};
      story.element.setAttribute('standalone', '');

      env.sandbox.stub(story, 'mutateElement').callsFake((fn) => fn());
      story.buildCallback();

      await story.layoutCallback();
      expect(story.element).to.have.attribute('orientation');
      expect(story.element.getAttribute('orientation')).to.equal('portrait');
    });

    it('should update the orientation landscape attribute', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);

      story.landscapeOrientationMedia_ = {matches: true};
      story.element.setAttribute('standalone', '');
      story.element.setAttribute('supports-landscape', '');
      env.sandbox.stub(story, 'mutateElement').callsFake((fn) => fn());

      story.buildCallback();

      await story.layoutCallback();
      story.landscapeOrientationMedia_ = {matches: false};
      story.onResizeDebounced();
      await Promise.resolve();
      expect(story.element).to.have.attribute('orientation');
      expect(story.element.getAttribute('orientation')).to.equal('portrait');
    });

    it('should deduplicate amp-story-page ids', async () => {
      expectAsyncConsoleError(/Duplicate amp-story-page ID/, 3);

      await createStoryWithPages(6, [
        'cover',
        'page-1',
        'cover',
        'page-1',
        'page-1',
        'page-2',
      ]);

      const pages = story.element.querySelectorAll('amp-story-page');
      const pageIds = Array.prototype.map.call(pages, (page) => page.id);
      expect(pageIds).to.deep.equal([
        'cover',
        'page-1',
        'cover__1',
        'page-1__1',
        'page-1__2',
        'page-2',
      ]);
    });

    it('should deduplicate amp-story-page ids and cache them', async () => {
      expectAsyncConsoleError(/Duplicate amp-story-page ID/, 3);

      await createStoryWithPages(6, [
        'cover',
        'page-1',
        'cover',
        'page-1',
        'page-1',
        'page-2',
      ]);

      expect(story.storeService_.get(StateProperty.PAGE_IDS)).to.deep.equal([
        'cover',
        'page-1',
        'cover__1',
        'page-1__1',
        'page-1__2',
        'page-2',
      ]);
    });

    describe('amp-story consent', () => {
      it('should pause the story if there is a consent', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        env.sandbox
          .stub(Services, 'actionServiceForDoc')
          .returns({setAllowlist: () => {}, trigger: () => {}});

        // Prevents amp-story-consent element from running code that is irrelevant
        // to this test.
        env.sandbox.stub(AmpStoryConsent.prototype, 'buildCallback');

        const consentEl = win.document.createElement('amp-consent');
        const storyConsentEl = win.document.createElement('amp-story-consent');
        storyConsentEl.setAttribute('layout', 'nodisplay');
        consentEl.appendChild(storyConsentEl);
        element.appendChild(consentEl);

        // Never resolving consent promise, emulating a user looking at the
        // consent prompt.
        const promise = new Promise(() => {});
        env.sandbox.stub(consent, 'getConsentPolicyState').returns(promise);

        const coverEl = element.querySelector('amp-story-page');

        const cover = await coverEl.getImpl();
        const setStateStub = env.sandbox.stub(cover, 'setState');
        await story.layoutCallback();
        // These assertions ensure we don't spam the page state. We want to
        // avoid a situation where we set the page to active, then paused,
        // which would spam the media pool with expensive operations.
        expect(setStateStub).to.have.been.calledOnce;
        expect(setStateStub.getCall(0)).to.have.been.calledWithExactly(
          PageState.NOT_ACTIVE
        );
      });

      it('should play the story after the consent is resolved', async () => {
        env.sandbox
          .stub(Services, 'actionServiceForDoc')
          .returns({setAllowlist: () => {}, trigger: () => {}});

        // Prevents amp-story-consent element from running code that is irrelevant
        // to this test.
        env.sandbox.stub(AmpStoryConsent.prototype, 'buildCallback');

        const consentEl = win.document.createElement('amp-consent');
        const storyConsentEl = win.document.createElement('amp-story-consent');
        consentEl.appendChild(storyConsentEl);
        element.appendChild(consentEl);

        await createStoryWithPages(2, ['cover', 'page-1']);

        // In a real scenario, promise is resolved when the user accepted or
        // rejected the consent.
        let resolver;
        const promise = new Promise((resolve) => {
          resolver = resolve;
        });

        env.sandbox.stub(consent, 'getConsentPolicyState').returns(promise);

        const coverEl = element.querySelector('amp-story-page');

        const cover = await coverEl.getImpl();
        const setStateStub = env.sandbox.stub(cover, 'setState');
        await story.layoutCallback();
        await resolver(); // Resolving the consent.
        // These assertions ensure we don't spam the page state. We want to
        // avoid a situation where we set the page to active, then paused,
        // then back to active, which would spam the media pool with
        // expensive operations.
        expect(setStateStub).to.have.been.calledTwice;
        expect(setStateStub.getCall(0)).to.have.been.calledWithExactly(
          PageState.NOT_ACTIVE
        );
        expect(setStateStub.getCall(1)).to.have.been.calledWithExactly(
          PageState.PLAYING
        );
      });

      it('should play the story if the consent was already resolved', async () => {
        env.sandbox
          .stub(Services, 'actionServiceForDoc')
          .returns({setAllowlist: () => {}, trigger: () => {}});

        // Prevents amp-story-consent element from running code that is irrelevant
        // to this test.
        env.sandbox.stub(AmpStoryConsent.prototype, 'buildCallback');

        const consentEl = win.document.createElement('amp-consent');
        const storyConsentEl = win.document.createElement('amp-story-consent');
        consentEl.appendChild(storyConsentEl);
        element.appendChild(consentEl);

        await createStoryWithPages(2, ['cover', 'page-1']);

        // Returns an already resolved promised: the user already accepted or
        // rejected the consent in a previous session.
        env.sandbox.stub(consent, 'getConsentPolicyState').resolves();

        const coverEl = element.querySelector('amp-story-page');

        const cover = await coverEl.getImpl();
        const setStateStub = env.sandbox.stub(cover, 'setState');
        await story.layoutCallback();
        // These assertions ensure we don't spam the page state. We want to
        // avoid a situation where we set the page to active, then paused,
        // then back to active, which would spam the media pool with
        // expensive operations.
        expect(setStateStub).to.have.been.calledTwice;
        expect(setStateStub.getCall(0)).to.have.been.calledWithExactly(
          PageState.NOT_ACTIVE
        );
        expect(setStateStub.getCall(1)).to.have.been.calledWithExactly(
          PageState.PLAYING
        );
      });
    });

    describe('amp-story pause/resume callbacks', () => {
      it('should pause the story when tab becomes inactive', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        env.sandbox
          .stub(ampdoc, 'getVisibilityState')
          .returns(VisibilityState_Enum.PRERENDER);
        const onVisibilityChangedStub = env.sandbox.stub(
          ampdoc,
          'onVisibilityChanged'
        );

        story.buildCallback();

        await story.layoutCallback();
        // Execute the callback passed to onVisibilityChanged.
        expect(onVisibilityChangedStub).to.have.been.calledOnce;
        onVisibilityChangedStub.getCall(0).args[0]();

        // Paused state has been changed to true.
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      it('should play the story when tab becomes active', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        env.sandbox.stub(ampdoc, 'isVisible').returns(true);
        const onVisibilityChangedStub = env.sandbox.stub(
          ampdoc,
          'onVisibilityChanged'
        );

        story.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

        story.buildCallback();

        await story.layoutCallback();
        // Execute the callback passed to onVisibilityChanged.
        expect(onVisibilityChangedStub).to.have.been.calledOnce;
        onVisibilityChangedStub.getCall(0).args[0]();

        // Paused state has been changed to false.
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.false;
      });

      it('should pause the story when viewer becomes inactive', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        story
          .getAmpDoc()
          .overrideVisibilityState(VisibilityState_Enum.INACTIVE);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      it('should reset the active page when viewer becomes inactive', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        const setStateStub = env.sandbox.stub(story.activePage_, 'setState');
        story
          .getAmpDoc()
          .overrideVisibilityState(VisibilityState_Enum.INACTIVE);
        expect(setStateStub.getCall(1)).to.have.been.calledWithExactly(
          PageState.NOT_ACTIVE
        );
      });

      it('should reset the active page even when viewer becomes inactive before the active page is set', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        // Should not throw error of "Cannot read properties of null (reading 'setState')",
        // even when the active page is not set yet.
        story
          .getAmpDoc()
          .overrideVisibilityState(VisibilityState_Enum.INACTIVE);

        // Resolves the active page and set the page state to inactive.
        await story.layoutCallback();
      });

      it('should pause the story when viewer becomes hidden', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.HIDDEN);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      it('should pause the story page when viewer becomes hidden', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        const setStateStub = env.sandbox.stub(story.activePage_, 'setState');
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.HIDDEN);
        expect(setStateStub).to.have.been.calledOnceWithExactly(
          PageState.PAUSED
        );
      });

      it('should pause the story when viewer becomes paused', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.PAUSED);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      it('should pause the story page when viewer becomes paused', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        const setStateStub = env.sandbox.stub(story.activePage_, 'setState');
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.PAUSED);
        expect(setStateStub).to.have.been.calledOnceWithExactly(
          PageState.PAUSED
        );
      });

      it('should play the story when viewer becomes active after paused', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.PAUSED);
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.ACTIVE);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.false;
      });

      it('should play the story page when viewer becomes active after paused', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        const setStateStub = env.sandbox.stub(story.activePage_, 'setState');
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.PAUSED);
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.ACTIVE);
        expect(setStateStub.getCall(1)).to.have.been.calledWithExactly(
          PageState.PLAYING
        );
      });

      it('should play the story page when viewer becomes active after paused + inactive', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        const setStateStub = env.sandbox.stub(story.activePage_, 'setState');
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.PAUSED);
        story
          .getAmpDoc()
          .overrideVisibilityState(VisibilityState_Enum.INACTIVE);
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.ACTIVE);
        expect(setStateStub.getCall(0)).to.have.been.calledWithExactly(
          PageState.PAUSED
        );
        expect(setStateStub.getCall(1)).to.have.been.calledWithExactly(
          PageState.NOT_ACTIVE
        );
        expect(setStateStub.getCall(2)).to.have.been.calledWithExactly(
          PageState.PLAYING
        );
      });

      it('should keep the story paused on resume when previously paused', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        story.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

        await story.layoutCallback();
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.PAUSED);
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.ACTIVE);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      it('should keep the story paused on resume when previously paused + inactive', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        story.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

        await story.layoutCallback();
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.PAUSED);
        story
          .getAmpDoc()
          .overrideVisibilityState(VisibilityState_Enum.INACTIVE);
        story.getAmpDoc().overrideVisibilityState(VisibilityState_Enum.ACTIVE);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      describe('amp-story continue anyway', () => {
        it('should not display layout', async () => {
          await createStoryWithPages(2, ['cover', 'page-4']);
          AmpStory.isBrowserSupported = () => false;
          story = new AmpStory(element);
          expect(
            element.querySelector(
              '.i-amphtml-story-unsupported-browser-overlay'
            )
          ).to.be.null;
          const dispatchTogglePaused = env.sandbox
            .spy(story.storeService_, 'dispatch')
            .withArgs(Action.TOGGLE_PAUSED, true);
          await story.layoutCallback();
          await poll(
            'TOGGLE_PAUSED true',
            () => dispatchTogglePaused.callCount > 0
          );
          expect(
            element.querySelector(
              '.i-amphtml-story-unsupported-browser-overlay'
            )
          ).to.not.be.null;
        });

        it('should display the story after clicking "continue" button', async () => {
          await createStoryWithPages(2, ['cover', 'page-1']);

          AmpStory.isBrowserSupported = () => false;
          story = new AmpStory(element);

          story.buildCallback();

          await story.layoutCallback();

          const dispatchTogglePausedRestore = env.sandbox
            .spy(story.storeService_, 'dispatch')
            .withArgs(Action.TOGGLE_PAUSED, story.pausedStateToRestore_);

          const continueAnywayButton = element.querySelector(
            '.i-amphtml-story-unsupported-browser-overlay button'
          );
          continueAnywayButton.click();

          await poll(
            '.i-amphtml-story-unsupported-browser-overlay is removed',
            () =>
              element.querySelector(
                '.i-amphtml-story-unsupported-browser-overlay'
              ) == null
          );
          expect(dispatchTogglePausedRestore).to.have.been.calledOnce;
        });
      });

      it('should add previous visited attribute', async () => {
        env.sandbox
          .stub(utils, 'setAttributeInMutate')
          .callsFake((el, attr) => el.element.setAttribute(attr, ''));

        await createStoryWithPages(2, ['page-0', 'page-1']);
        const pages = story.element.querySelectorAll('amp-story-page');
        const page0 = pages[0];
        await story.layoutCallback();
        await story.switchTo_('page-1');
        expect(page0.hasAttribute('i-amphtml-visited')).to.be.true;
      });

      describe('amp-story audio', () => {
        it('should register and preload the background audio', async () => {
          const src = 'https://example.com/foo.mp3';
          story.element.setAttribute('background-audio', src);
          const registerStub = env.sandbox.stub(story.mediaPool_, 'register');
          const preloadStub = env.sandbox
            .stub(story.mediaPool_, 'preload')
            .resolves();

          await createStoryWithPages(2, ['cover', 'page-1']);
          story
            .layoutCallback()
            .then(() =>
              story.activePage_.element
                .signals()
                .whenSignal(CommonSignals_Enum.LOAD_END)
            )
            .then(() => {
              expect(story.backgroundAudioEl_).to.exist;
              expect(story.backgroundAudioEl_.src).to.equal(src);
              expect(registerStub).to.have.been.calledOnce;
              expect(preloadStub).to.have.been.calledOnce;
            });
        });

        it('should bless the media on unmute', async () => {
          await createStoryWithPages(2, ['cover', 'page-1']);

          const blessAllStub = env.sandbox
            .stub(story.mediaPool_, 'blessAll')
            .resolves();

          await story.layoutCallback();
          story.storeService_.dispatch(Action.TOGGLE_MUTED, false);
          expect(blessAllStub).to.have.been.calledOnce;
        });

        it('should pause the background audio on ad state if not muted', async () => {
          await createStoryWithPages(2, ['cover', 'page-1']);

          const backgroundAudioEl = win.document.createElement('audio');
          backgroundAudioEl.setAttribute('id', 'foo');
          story.backgroundAudioEl_ = backgroundAudioEl;

          await story.layoutCallback();
          const pauseStub = env.sandbox.stub(story.mediaPool_, 'pause');

          story.storeService_.dispatch(Action.TOGGLE_MUTED, false);
          story.storeService_.dispatch(Action.TOGGLE_AD, true);

          expect(pauseStub).to.have.been.calledOnce;
          expect(pauseStub).to.have.been.calledWith(backgroundAudioEl);
        });

        it('should play the background audio when hiding ad if not muted', async () => {
          await createStoryWithPages(2, ['cover', 'page-1']);

          const backgroundAudioEl = win.document.createElement('audio');
          backgroundAudioEl.setAttribute('id', 'foo');
          story.backgroundAudioEl_ = backgroundAudioEl;

          await story.layoutCallback();
          // Displaying an ad and not muted.
          story.storeService_.dispatch(Action.TOGGLE_AD, true);
          story.storeService_.dispatch(Action.TOGGLE_MUTED, false);

          const unmuteStub = env.sandbox.stub(story.mediaPool_, 'unmute');
          const playStub = env.sandbox.stub(story.mediaPool_, 'play');

          story.storeService_.dispatch(Action.TOGGLE_AD, false);

          expect(unmuteStub).to.have.been.calledOnce;
          expect(unmuteStub).to.have.been.calledWith(backgroundAudioEl);
          expect(playStub).to.have.been.calledOnce;
          expect(playStub).to.have.been.calledWith(backgroundAudioEl);
        });

        it('should not play the background audio when hiding ad if muted', async () => {
          const backgroundAudioEl = win.document.createElement('audio');
          backgroundAudioEl.setAttribute('id', 'foo');
          story.backgroundAudioEl_ = backgroundAudioEl;

          await createStoryWithPages(2, ['cover', 'page-1']);

          await story.layoutCallback();
          story.storeService_.dispatch(Action.TOGGLE_AD, true);

          const unmuteStub = env.sandbox.stub(story.mediaPool_, 'unmute');
          const playStub = env.sandbox.stub(story.mediaPool_, 'play');

          story.storeService_.dispatch(Action.TOGGLE_AD, false);

          expect(unmuteStub).not.to.have.been.called;
          expect(playStub).not.to.have.been.called;
        });
      });

      it('should update the STORY_HAS_BACKGROUND_AUDIO property if story has background audio', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);
        story.element.setAttribute('background-audio', 'audio.mp3');
        await story.layoutCallback();

        expect(
          story.storeService_.get(
            StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE
          )
        ).to.be.true;
      });

      it('should remove the muted attribute on unmuted state change', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();

        expect(story.element.hasAttribute('muted')).to.be.true;

        story.storeService_.dispatch(Action.TOGGLE_MUTED, false);
        expect(story.element.hasAttribute('muted')).to.be.false;
      });

      it('should add the muted attribute on unmuted state change', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();

        story.storeService_.dispatch(Action.TOGGLE_MUTED, true);
        expect(story.element.hasAttribute('muted')).to.be.true;
      });

      describe('#getMaxMediaElementCounts', () => {
        it('should create 2 audio & video elements when no elements found', async () => {
          await createStoryWithPages(2, ['cover', 'page-1']);

          await story.layoutCallback();
          const expected = {
            [MediaType_Enum.AUDIO]: 2,
            [MediaType_Enum.VIDEO]: 2,
          };
          expect(story.getMaxMediaElementCounts()).to.deep.equal(expected);
        });

        it('should create 2 extra audio & video elements for ads', async () => {
          await createStoryWithPages(2, ['cover', 'page-1']);

          await story.layoutCallback();
          const ampVideoEl = win.document.createElement('amp-video');
          const ampAudoEl = createElementWithAttributes(
            win.document,
            'amp-audio',
            {'background-audio': ''}
          );
          story.element.appendChild(ampVideoEl);
          story.element.appendChild(ampAudoEl);

          const expected = {
            [MediaType_Enum.AUDIO]: 3,
            [MediaType_Enum.VIDEO]: 3,
          };
          expect(story.getMaxMediaElementCounts()).to.deep.equal(expected);
        });

        it('never have more than the defined maximums', async () => {
          await createStoryWithPages(2, ['cover', 'page-1']);

          await story.layoutCallback();
          for (let i = 0; i < 7; i++) {
            const el = createElementWithAttributes(win.document, 'amp-audio', {
              'background-audio': '',
            });
            story.element.appendChild(el);
          }

          for (let i = 0; i < 8; i++) {
            const el = win.document.createElement('amp-video');
            story.element.appendChild(el);
          }

          const expected = {
            [MediaType_Enum.AUDIO]: 4,
            [MediaType_Enum.VIDEO]: 8,
          };
          expect(story.getMaxMediaElementCounts()).to.deep.equal(expected);
        });
      });

      describe('#getElementDistance', () => {
        it('should return -1 for elements without a page', async () => {
          await createStoryWithPages(3);
          await story.layoutCallback();
          const elToFind = win.document.createElement('video');
          const distance = story.getElementDistance(elToFind);
          expect(distance).to.equal(-1);
        });

        it('should find elements inside organic pages', async () => {
          const pageArray = await createStoryWithPages(3);
          await story.layoutCallback();
          const elToFind = win.document.createElement('video');
          const hostPage = pageArray[1];
          hostPage.setAttribute('distance', '4');
          hostPage.appendChild(elToFind);
          const distance = story.getElementDistance(elToFind);
          expect(distance).to.equal(4);
        });

        it('should find elements inside ad pages / FIE', async () => {
          const pageArray = await createStoryWithPages(3);
          await story.layoutCallback();
          const elToFind = win.document.createElement('video');
          const hostPage = pageArray[1];
          hostPage.setAttribute('distance', '4');
          const iframe = win.document.createElement('iframe');
          hostPage.appendChild(iframe);
          iframe.contentDocument.body.appendChild(elToFind);
          const distance = story.getElementDistance(elToFind);
          expect(distance).to.equal(4);
        });
      });

      describe('amp-story ads', () => {
        it('should return a valid page index', async () => {
          const adId = 'i-amphtml-ad-page-1';
          const pageElements = await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);
          await story.layoutCallback();
          // Getting all the AmpStoryPage objets.
          let pages = Array.from(pageElements).map((el) => el.getImpl());

          pages = await Promise.all(pages);

          // Insert ads
          const adPage = await createStoryAdPage(adId);
          story.addPage(adPage);
          story.insertPage('page-2', adId);

          pages.splice(3, 0, adPage);

          // Only the first page should be active.
          for (let i = 0; i < pages.length; i++) {
            expect(story.getPageIndex(pages[i])).to.equal(i);
          }
        });
      });

      describe('amp-story NO_NEXT_PAGE', () => {
        describe('with #cap=swipe', () => {
          before(() => {
            hasSwipeCapability = true;
            isEmbedded = true;
          });
          after(() => {
            hasSwipeCapability = false;
            isEmbedded = false;
          });

          it('should send a message when tapping on last page in viewer', async () => {
            await createStoryWithPages(1, ['cover']);
            const sendMessageStub = env.sandbox.stub(
              story.viewerMessagingHandler_,
              'send'
            );

            await story.layoutCallback();
            // Click on right side of the screen to trigger page advancement.
            const clickEvent = new MouseEvent('click', {clientX: 200});
            story.activePage_.element.dispatchEvent(clickEvent);
            await waitFor(() => {
              if (sendMessageStub.called) {
                expect(sendMessageStub).to.be.calledWithExactly(
                  'selectDocument',
                  {
                    next: true,
                    advancementMode: AdvancementMode.MANUAL_ADVANCE,
                  }
                );
                return true;
              }
              return false;
            }, 'sendMessageStub should be called');
          });

          it('should send a message when auto-advancing on last page in viewer', async () => {
            await createStoryWithPages(1, ['cover'], true /** autoAdvance */);
            const sendMessageStub = env.sandbox.stub(
              story.viewerMessagingHandler_,
              'send'
            );

            await story.layoutCallback();

            story.activePage_.advancement_.onAdvance();

            expect(sendMessageStub).to.be.calledWithExactly('selectDocument', {
              next: true,
              advancementMode: AdvancementMode.AUTO_ADVANCE_TIME,
            });
          });
        });
      });

      describe('amp-story NO_PREVIOUS_PAGE', () => {
        describe('with #cap=swipe', () => {
          before(() => {
            hasSwipeCapability = true;
            isEmbedded = true;
          });
          after(() => {
            hasSwipeCapability = false;
            isEmbedded = false;
          });

          it('should send a message when tapping on last page in viewer', async () => {
            await createStoryWithPages(1, ['cover']);
            const sendMessageStub = env.sandbox.stub(
              story.viewerMessagingHandler_,
              'send'
            );

            await story.layoutCallback();
            // Click on left side of the screen to trigger page advancement.
            const clickEvent = new MouseEvent('click', {clientX: 10});
            story.activePage_.element.dispatchEvent(clickEvent);
            await waitFor(() => {
              if (sendMessageStub.called) {
                expect(sendMessageStub).to.be.calledWithExactly(
                  'selectDocument',
                  {
                    previous: true,
                    advancementMode: AdvancementMode.MANUAL_ADVANCE,
                  }
                );
                return true;
              }
              return false;
            }, 'sendMessageStub should be called');
          });
        });
      });

      describe('amp-story navigation', () => {
        it('should navigate when performing a navigational click', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          await story.layoutCallback();
          // Click on right side of the screen to trigger page advancement.
          const clickEvent = new MouseEvent('click', {clientX: 200});

          story.activePage_.element.dispatchEvent(clickEvent);

          expect(story.activePage_.element.id).to.equal('page-1');
        });

        it('should navigate when performing a navigational click even if the click happens before the active page is set', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          // Should not throw error of "Cannot read properties of null (reading 'next')",
          // even when the active page is not set yet.
          const firstPageEl = element.querySelector('amp-story-page');
          const clickEvent = new MouseEvent('click', {clientX: 200});
          firstPageEl.dispatchEvent(clickEvent);

          // Resolves the active page and navigates to the next page.
          await story.layoutCallback();
          expect(story.activePage_.element.id).to.equal('page-1');
        });

        it('should NOT navigate when clicking on a tappable element', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          await story.layoutCallback();
          const tappableEl = win.document.createElement('target');
          tappableEl.setAttribute('on', 'tap:cover.hide');
          story.activePage_.element.appendChild(tappableEl);

          const clickEvent = new MouseEvent('click', {clientX: 200});
          tappableEl.dispatchEvent(clickEvent);
          expect(story.activePage_.element.id).to.equal('cover');
        });

        it('should NOT navigate when clicking on a CTA link', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          await story.layoutCallback();
          const ctaLink = win.document.createElement('a');
          ctaLink.setAttribute('role', 'link');
          story.activePage_.element.appendChild(ctaLink);

          const clickEvent = new MouseEvent('click', {clientX: 200});
          ctaLink.dispatchEvent(clickEvent);
          expect(story.activePage_.element.id).to.equal('cover');
        });
      });

      describe('touch events handlers', () => {
        const getTouchOptions = (x, y) => {
          const touch = new Touch({
            target: story.element,
            identifier: Date.now(),
            clientX: x,
            clientY: y,
          });

          return {touches: [touch], bubbles: true};
        };

        const dispatchSwipeEvent = (deltaX, deltaY) => {
          // Triggers mobile UI so hint overlay can attach.
          story.storeService_.dispatch(Action.TOGGLE_UI, UIType_Enum.MOBILE);

          story.element.dispatchEvent(
            new TouchEvent('touchstart', getTouchOptions(-10, -10))
          );
          story.element.dispatchEvent(
            new TouchEvent('touchmove', getTouchOptions(0, 0))
          );
          story.element.dispatchEvent(
            new TouchEvent('touchmove', getTouchOptions(deltaX, deltaY))
          );
          story.element.dispatchEvent(
            new TouchEvent('touchend', getTouchOptions(deltaX, deltaY))
          );
        };

        describe('without #cap=swipe', () => {
          it('should handle h touch events at the story level', async () => {
            await createStoryWithPages(2);
            const touchmoveSpy = env.sandbox.spy();
            story.win.document.addEventListener('touchmove', touchmoveSpy);
            dispatchSwipeEvent(100, 0);
            expect(touchmoveSpy).to.not.have.been.called;
          });

          it('should handle v touch events at the story level', async () => {
            await createStoryWithPages(2);
            const touchmoveSpy = env.sandbox.spy();
            story.win.document.addEventListener('touchmove', touchmoveSpy);
            dispatchSwipeEvent(0, 100);
            expect(touchmoveSpy).to.not.have.been.called;
          });

          it('should trigger the navigation overlay', async () => {
            await createStoryWithPages(2);
            dispatchSwipeEvent(100, 0);
            await waitFor(() =>
              story.element.querySelector('.i-amphtml-story-hint-container')
            );
            const hintEl = story.element.querySelector(
              '.i-amphtml-story-hint-container'
            );
            expect(hintEl).to.not.have.class('i-amphtml-hidden');
          });
        });

        describe('with #cap=swipe', () => {
          before(() => (hasSwipeCapability = true));
          after(() => (hasSwipeCapability = false));

          it('should let h touch events bubble up to be forwarded', async () => {
            await createStoryWithPages(2);
            const touchmoveSpy = env.sandbox.spy();
            story.win.document.addEventListener('touchmove', touchmoveSpy);
            dispatchSwipeEvent(100, 0);
            expect(touchmoveSpy).to.have.been.called;
          });

          it('should let v touch events bubble up to be forwarded', async () => {
            await createStoryWithPages(2);
            const touchmoveSpy = env.sandbox.spy();
            story.win.document.addEventListener('touchmove', touchmoveSpy);
            dispatchSwipeEvent(0, 100);
            expect(touchmoveSpy).to.have.been.called;
          });

          it('should not trigger the navigation education overlay', async () => {
            await createStoryWithPages(2);
            dispatchSwipeEvent(100, 0);
            await story.mutateElement(() => {
              const hintEl = story.element.querySelector(
                '.i-amphtml-story-hint-container'
              );
              expect(hintEl).to.not.exist;
            });
          });
        });
      });

      describe('amp-story rewriteStyles', () => {
        let styleEl;

        beforeEach(async () => {
          await createStoryWithPages(1, ['cover']);
          styleEl = win.document.createElement('style');
          styleEl.setAttribute('amp-custom', '');
          env.sandbox.stub(story.vsync_, 'mutate').callsFake((fn) => fn());
        });

        it('should rewrite vw styles', async () => {
          styleEl.textContent = 'foo {transform: translate3d(100vw, 0, 0);}';
          win.document.head.appendChild(styleEl);

          story.buildCallback();

          await story.layoutCallback();
          expect(styleEl.textContent).to.equal(
            'foo {transform: ' +
              'translate3d(calc(100 * var(--story-page-vw)), 0, 0);}'
          );
        });

        it('should rewrite negative vh styles', async () => {
          styleEl.textContent = 'foo {transform: translate3d(-100vh, 0, 0);}';
          win.document.head.appendChild(styleEl);

          story.buildCallback();

          await story.layoutCallback();
          expect(styleEl.textContent).to.equal(
            'foo {transform: ' +
              'translate3d(calc(-100 * var(--story-page-vh)), 0, 0);}'
          );
        });
      });
    });

    describe('amp-story-subscriptions navigation', () => {
      let subscriptionsEl;
      let storeService;
      const pages = ['cover', 'page-1', 'page-2', 'page-3', 'page-4'];

      const clickRightEvent = new MouseEvent('click', {clientX: 200});
      const clickLeftEvent = new MouseEvent('click', {clientX: 10});

      async function setUpStorySubscriptions() {
        await createStoryWithPages(5, pages);
        subscriptionsEl = win.document.createElement('amp-story-subscriptions');
        story.element.appendChild(subscriptionsEl);

        // buildCallback() is implicitly called by createStoryWithPages()
        await story.layoutCallback();
      }

      function tapNavigationUntil(pageIndex) {
        for (
          let i = 0,
            activePage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
          i < pageIndex;
          i++,
            activePage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            )
        ) {
          activePage.element.dispatchEvent(clickRightEvent);
        }
      }

      beforeEach(async () => {
        toggleExperiment(win, 'amp-story-subscriptions', true);

        storeService = new AmpStoryStoreService(win);
        env.sandbox.stub(Services, 'storyStoreService').returns(storeService);

        // This stub makes requestAnimationFrame a sync call so that each dispatch of click event
        // can be a sync operation, which means it can be used as doing await switchTo call.
        env.sandbox.stub(win, 'requestAnimationFrame').callsFake((cb) => cb());
      });

      describe('UNKNOWN subscription state before paywall page', () => {
        beforeEach(async () => {
          storeService.dispatch(
            Action.SET_SUBSCRIPTIONS_PAGE_INDEX,
            DEFAULT_SUBSCRIPTIONS_PAGE_INDEX
          );
          await setUpStorySubscriptions();
          tapNavigationUntil(DEFAULT_SUBSCRIPTIONS_PAGE_INDEX);
        });

        it('should not navigate to locked content while subscription state is unknown', () => {
          const activePage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          expect(activePage.element.id).to.equal(
            pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX - 1]
          );
        });

        it('should resume to paywall page after the subscription state gets resolved', async () => {
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.BLOCKED
          );
          await macroTask();
          const paywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          expect(paywallPage.element.id).to.equal(
            pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX]
          );
        });

        it('should continue normal navigation after the subscription state gets resolved to granted', async () => {
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.GRANTED
          );
          await macroTask();
          const paywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          paywallPage.element.dispatchEvent(clickRightEvent);
          const postPaywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          expect(postPaywallPage.element.id).to.equal(
            pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX + 1]
          );
        });

        it('if state resolves to BLOCKED and user stays on the paywall page shows UI after predefined delay', async () => {
          const clock = env.sandbox.useFakeTimers();
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.BLOCKED
          );
          await macroTask(win.setTimeout);
          clock.tick(SUBSCRIPTIONS_DELAY_DURATION);
          expect(storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE))
            .to.be.true;
        });

        it('if state resolves to BLOCKED and user taps right on the paywall page', async () => {
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.BLOCKED
          );
          await macroTask();

          const paywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          paywallPage.element.dispatchEvent(clickRightEvent);

          it('should show paywall immediately', () => {
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.true;
          });

          it('should stay on the paywall page', () => {
            const paywallPage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            expect(paywallPage.element.id).to.equal(
              pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX]
            );
          });
        });
      });

      describe('GRANTED subscription state before paywall page', async () => {
        storeService.dispatch(
          Action.SET_SUBSCRIPTIONS_PAGE_INDEX,
          DEFAULT_SUBSCRIPTIONS_PAGE_INDEX
        );
        await setUpStorySubscriptions();
        storeService.dispatch(
          Action.TOGGLE_SUBSCRIPTIONS_STATE,
          SubscriptionsState.GRANTED
        );
        tapNavigationUntil(DEFAULT_SUBSCRIPTIONS_PAGE_INDEX);
        const paywallPage = story.getPageById(
          storeService.get(StateProperty.CURRENT_PAGE_ID)
        );
        paywallPage.element.dispatchEvent(clickRightEvent);
        await macroTask();

        it('should not show paywall', () => {
          expect(storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE))
            .to.be.false;
        });

        it('should be able to navigate the locked page after paywall page', async () => {
          const postPaywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          expect(postPaywallPage.element.id).to.equal(
            pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX + 1]
          );
        });
      });

      describe('unresolved subscriptions page index', () => {
        beforeEach(async () => {});

        it('should block on the first page if subscriptions page index is unresolved', async () => {
          setUpStorySubscriptions();
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.BLOCKED
          );

          // Blocking on unresolved page index during layout callback so the current page id is not set yet.
          expect(storeService.get(StateProperty.CURRENT_PAGE_ID)).to.equal('');

          storeService.dispatch(
            Action.SET_SUBSCRIPTIONS_PAGE_INDEX,
            DEFAULT_SUBSCRIPTIONS_PAGE_INDEX
          );
        });

        describe('subscriptions page index is resolved', () => {
          let clock;

          beforeEach(async () => {
            storeService.dispatch(
              Action.SET_SUBSCRIPTIONS_PAGE_INDEX,
              DEFAULT_SUBSCRIPTIONS_PAGE_INDEX + 1
            );
            await setUpStorySubscriptions();
            storeService.dispatch(
              Action.TOGGLE_SUBSCRIPTIONS_STATE,
              SubscriptionsState.BLOCKED
            );

            tapNavigationUntil(DEFAULT_SUBSCRIPTIONS_PAGE_INDEX);
            clock = env.sandbox.useFakeTimers();
          });

          it('should not show paywall on the default paywall page', () => {
            clock.tick(SUBSCRIPTIONS_DELAY_DURATION);
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.false;
          });

          it('should show paywall on the specified paywall page', () => {
            const defaultPaywallPage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            defaultPaywallPage.element.dispatchEvent(clickRightEvent);

            clock.tick(SUBSCRIPTIONS_DELAY_DURATION);
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.true;
          });
        });
      });

      describe('BLOCKED subscription state before paywall page', () => {
        beforeEach(async () => {
          storeService.dispatch(
            Action.SET_SUBSCRIPTIONS_PAGE_INDEX,
            DEFAULT_SUBSCRIPTIONS_PAGE_INDEX
          );
          await setUpStorySubscriptions();
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.BLOCKED
          );
          tapNavigationUntil(DEFAULT_SUBSCRIPTIONS_PAGE_INDEX);
        });

        it('should resume to paywall page once status becomes granted from blocked if the paywall is triggered on time delay', async () => {
          const clock = env.sandbox.useFakeTimers();
          clock.tick(SUBSCRIPTIONS_DELAY_DURATION); // Paywall is shown after delay.
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.GRANTED
          );

          it('should hide paywall', () => {
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.false;
          });

          it('should resume to the paywall page', () => {
            const activePageAfterGranted = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            expect(activePageAfterGranted.element.id).to.equal(
              pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX]
            );
          });
        });

        it('should resume to the page right after paywall page once status becomes granted from blocked if the paywall is triggered on tap', async () => {
          const paywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          paywallPage.element.dispatchEvent(clickRightEvent);
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.GRANTED
          );

          it('should hide paywall', () => {
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.false;
          });

          it('should resume to the page after the paywall page', () => {
            const activePageAfterGranted = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            expect(activePageAfterGranted.element.id).to.equal(
              pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX + 1]
            );
          });
        });

        it('tapping left before paywall shows should go to the previous page without showing the paywall', async () => {
          const paywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          paywallPage.element.dispatchEvent(clickLeftEvent);

          it('should hide paywall', () => {
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.false;
          });

          it('should be on the page before the paywall page', () => {
            const activePage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            expect(activePage.element.id).to.equal(
              pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX - 1]
            );
          });
        });

        it('tapping left on paywall should hide the paywall and go to the previous page', async () => {
          const paywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          paywallPage.element.dispatchEvent(clickRightEvent); // Show paywall
          paywallPage.element.dispatchEvent(clickLeftEvent); // Tapping left when the paywall is shown

          it('should hide paywall', () => {
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.false;
          });

          it('should be on the page before the paywall page', () => {
            const activePage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            expect(activePage.element.id).to.equal(
              pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX - 1]
            );
          });
        });
      });

      describe('switch event and deep link', () => {
        beforeEach(() => {
          storeService.dispatch(
            Action.SET_SUBSCRIPTIONS_PAGE_INDEX,
            DEFAULT_SUBSCRIPTIONS_PAGE_INDEX
          );
        });

        it('should navigate to paywall page and navigate back to original page after granted with any switch events', async () => {
          await setUpStorySubscriptions();
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.BLOCKED
          );
          tapNavigationUntil(DEFAULT_SUBSCRIPTIONS_PAGE_INDEX - 1);

          dispatch(win, story.element, EventType.SWITCH_PAGE, {
            'targetPageId': 'page-3',
            'direction': NavigationDirection.NEXT,
          });

          it('should show paywall', () => {
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.true;
          });

          it('should redirect to the paywall page', () => {
            const activePage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            expect(activePage.element.id).to.equal(
              pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX]
            );
          });

          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.GRANTED
          );

          it('should hide paywall', () => {
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.false;
          });

          it('should navigate to the page the user previously tried to visit', () => {
            const activePage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            expect(activePage.element.id).to.equal(
              pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX + 1]
            );
          });
        });

        it('should initialize with paywall page and navigate back to original page after granted', async () => {
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.BLOCKED
          );

          win.location.hash = 'page=page-3';
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);
          subscriptionsEl = win.document.createElement(
            'amp-story-subscriptions'
          );
          story.element.appendChild(subscriptionsEl);
          await story.layoutCallback();

          it('should show paywall', () => {
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.true;
          });

          it('should redirect to the paywall page', () => {
            const activePage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            expect(activePage.element.id).to.equal(
              pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX]
            );
          });

          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.GRANTED
          );

          it('should hide paywall', () => {
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.false;
          });

          it('should navigate to the page the user previously tried to visit', () => {
            const activePage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            expect(activePage.element.id).to.equal(
              pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX + 1]
            );
          });
        });

        it('should navigate back to paywall page after granted when tap left on paywall page and tap right again back to paywall page', async () => {
          const clock = env.sandbox.useFakeTimers();
          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.BLOCKED
          );

          win.location.hash = 'page=page-3';
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);
          subscriptionsEl = win.document.createElement(
            'amp-story-subscriptions'
          );
          story.element.appendChild(subscriptionsEl);
          await story.layoutCallback();

          // Tap back to dismiss the paywall and tap right to trigger paywall again.
          let paywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          paywallPage.element.dispatchEvent(clickLeftEvent);
          const prePaywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          prePaywallPage.element.dispatchEvent(clickRightEvent);
          paywallPage = story.getPageById(
            storeService.get(StateProperty.CURRENT_PAGE_ID)
          );
          clock.tick(SUBSCRIPTIONS_DELAY_DURATION);

          storeService.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.GRANTED
          );

          it('should hide paywall', () => {
            expect(
              storeService.get(StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE)
            ).to.be.false;
          });

          it('should navigate to the the paywall page', () => {
            const activePage = story.getPageById(
              storeService.get(StateProperty.CURRENT_PAGE_ID)
            );
            expect(activePage.element.id).to.equal(
              pages[DEFAULT_SUBSCRIPTIONS_PAGE_INDEX]
            );
          });
        });
      });
    });

    describe('amp-story branching', () => {
      it('should advance to specified page with advanced-to attribute', async () => {
        toggleExperiment(win, 'amp-story-branching', true);
        await createStoryWithPages(4, ['cover', 'page-1', 'page-2', 'page-3']);

        await story.layoutCallback();
        expect(story.activePage_.element.id).to.equal('cover');

        story.getPageById('cover').element.setAttribute('advance-to', 'page-3');

        story.activePage_.element.dispatchEvent(
          new MouseEvent('click', {clientX: 200})
        );
        expect(story.activePage_.element.id).to.equal('page-3');
        toggleExperiment(win, 'amp-story-branching', false);
      });

      it('should navigate to the target page when a goToPage action is executed', async () => {
        toggleExperiment(win, 'amp-story-branching', true);
        await createStoryWithPages(4, ['cover', 'page-1', 'page-2', 'page-3']);
        story.buildCallback();

        await story.layoutCallback();
        story.element.setAttribute('id', 'story');
        const actionButton = createElementWithAttributes(
          win.document,
          'button',
          {'id': 'actionButton', 'on': 'tap:story.goToPage(id=page-2)'}
        );
        element.querySelector('#cover').appendChild(actionButton);
        // Click on the actionButton to trigger the goToPage action.
        actionButton.click();
        // Next tick.
        await Promise.resolve();
        expect(story.activePage_.element.id).to.equal('page-2');
        toggleExperiment(win, 'amp-story-branching', false);
      });

      it('should navigate back to the correct previous page after goToPage', async () => {
        toggleExperiment(win, 'amp-story-branching', true);
        await createStoryWithPages(4, ['cover', 'page-1', 'page-2', 'page-3']);
        story.buildCallback();

        await story.layoutCallback();
        story.element.setAttribute('id', 'story');

        const actionButton = createElementWithAttributes(
          win.document,
          'button',
          {'id': 'actionButton', 'on': 'tap:story.goToPage(id=page-2)'}
        );
        element.querySelector('#cover').appendChild(actionButton);
        // Click on the actionButton to trigger the goToPage action.
        actionButton.click();

        // Moves backwards.
        story.activePage_.element.dispatchEvent(
          new MouseEvent('click', {clientX: 0})
        );
        expect(story.activePage_.element.id).to.equal('cover');
        toggleExperiment(win, 'amp-story-branching', false);
      });

      it('should navigate back to the correct previous page after advance-to', async () => {
        toggleExperiment(win, 'amp-story-branching', true);
        await createStoryWithPages(4, ['cover', 'page-1', 'page-2', 'page-3']);

        await story.layoutCallback();
        story.getPageById('cover').element.setAttribute('advance-to', 'page-3');

        expect(story.activePage_.element.id).to.equal('cover');

        story.activePage_.element.dispatchEvent(
          new MouseEvent('click', {clientX: 200})
        );

        // Move backwards.
        story.activePage_.element.dispatchEvent(
          new MouseEvent('click', {clientX: 0})
        );
        expect(story.activePage_.element.id).to.equal('cover');
        toggleExperiment(win, 'amp-story-branching', false);
      });

      it('should begin at the specified page fragment parameter value', async () => {
        win.location.hash = 'page=page-1';
        await createStoryWithPages(4, ['cover', 'page-1', 'page-2', 'page-3']);

        await story.layoutCallback();
        expect(story.activePage_.element.id).to.equal('page-1');
      });

      it('should begin at initial page when fragment parameter value is wrong', async () => {
        win.location.hash = 'page=BADVALUE';
        await createStoryWithPages(4, ['cover', 'page-1', 'page-2', 'page-3']);

        await story.layoutCallback();
        expect(story.activePage_.element.id).to.equal('cover');
      });

      it('should update browser history with the story navigation path', async () => {
        const pageCount = 2;
        await createStoryWithPages(pageCount, ['cover', 'page-1']);

        await story.layoutCallback();
        story.activePage_.element.dispatchEvent(
          new MouseEvent('click', {clientX: 200})
        );
        expect(replaceStateStub).to.have.been.calledWith({
          ampStoryNavigationPath: ['cover', 'page-1'],
        });
      });

      it('should correctly mark goToPage pages are distance 1', async () => {
        toggleExperiment(win, 'amp-story-branching', true);
        await createStoryWithPages(4, ['cover', 'page-1', 'page-2', 'page-3']);
        story.buildCallback();

        await story.layoutCallback();
        story.element.setAttribute('id', 'story');

        const actionButton = createElementWithAttributes(
          win.document,
          'button',
          {'id': 'actionButton', 'on': 'tap:story.goToPage(id=page-2)'}
        );

        story.element.querySelector('#cover').appendChild(actionButton);

        const distanceGraph = story.getPagesByDistance_();
        expect(distanceGraph[1].includes('page-2')).to.be.true;
        toggleExperiment(win, 'amp-story-branching', false);
      });

      it('should correctly mark previous pages in the stack as distance 1', async () => {
        toggleExperiment(win, 'amp-story-branching', true);
        await createStoryWithPages(4, ['cover', 'page-1', 'page-2', 'page-3']);

        await story.layoutCallback();
        story.getPageById('cover').element.setAttribute('advance-to', 'page-3');

        story.activePage_.element.dispatchEvent(
          new MouseEvent('click', {clientX: 200})
        );

        const distanceGraph = story.getPagesByDistance_();
        expect(distanceGraph[1].includes('cover')).to.be.true;
        toggleExperiment(win, 'amp-story-branching', false);
      });
    });

    describe('amp-story play/pause', () => {
      it('should set playable to true if page has autoadvance', async () => {
        await createStoryWithPages(1, ['cover'], true /** autoAdvance */);

        await story.layoutCallback();
        await story.activePage_.element
          .signals()
          .whenSignal(CommonSignals_Enum.LOAD_END);
        expect(
          story.storeService_.get(StateProperty.STORY_HAS_PLAYBACK_UI_STATE)
        ).to.be.true;
        expect(
          story.storeService_.get(
            StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE
          )
        ).to.be.true;
      });

      it('should set playable to false if page does not have playable', async () => {
        await createStoryWithPages(1, ['cover'], false /** autoAdvance */);

        await story.layoutCallback();
        await story.activePage_.element
          .signals()
          .whenSignal(CommonSignals_Enum.LOAD_END);
        expect(
          story.storeService_.get(StateProperty.STORY_HAS_PLAYBACK_UI_STATE)
        ).to.be.false;
        expect(
          story.storeService_.get(
            StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE
          )
        ).to.be.false;
      });
    });

    describe('resource loading for first page', () => {
      let pages;
      let performanceImpl;
      beforeEach(async () => {
        performanceImpl = new Performance(env.win);
        env.sandbox.stub(Services, 'performanceFor').returns(performanceImpl);
        pages = await createStoryWithPages(2, ['page-1', 'page-2'], false);
        env.sandbox.stub(story, 'mutateElement').callsFake((fn) => fn());
        env.sandbox.stub(win, 'requestAnimationFrame').callsFake((cb) => cb());
      });

      it('should position the active page so it preloads', async () => {
        story.buildCallback();
        await story.layoutCallback();

        // Check page 0 is loaded with distance 0.
        expect(pages[0].getAttribute('distance')).to.be.equal('0');
      });

      it('should not position the inactive page so it preloads before the active page is loaded', async () => {
        const signals = new Signals();
        pages[0].signals = () => signals;
        story.buildCallback();
        await story.layoutCallback();

        // Check page 1 is not loaded.
        expect(pages[1].hasAttribute('distance')).to.be.false;
      });

      it('should position the inactive page so it preloads after the active page is loaded', async () => {
        const signals = new Signals();
        pages[0].signals = () => signals;
        story.buildCallback();
        await story.layoutCallback();

        // Check page 1 is not loaded.
        expect(pages[1].hasAttribute('distance')).to.be.false;

        signals.signal(CommonSignals_Enum.LOAD_END);
        await macroTask();

        // Check page 1 is loaded with distance 1.
        expect(pages[1].getAttribute('distance')).to.be.equal('1');
      });
    });

    describe('localization', () => {
      beforeEach(() => {
        win.__AMP_MODE = {
          rtvVersion: '123',
        };
        const performanceImpl = new Performance(env.win);
        env.sandbox.stub(Services, 'performanceFor').returns(performanceImpl);
      });

      it('should use the inlined amp-story strings when available', async () => {
        const inlinedStrings = win.document.createElement('script');
        inlinedStrings.setAttribute('amp-localization', 'amp-story');
        inlinedStrings.setAttribute('i-amphtml-version', '123');
        inlinedStrings.textContent = '{"35": "INLINED-STRING"}';
        win.document.head.appendChild(inlinedStrings);

        await createStoryWithPages(1, ['cover']);

        expect(
          await localizationService.getLocalizedStringAsync('35')
        ).to.be.equal('INLINED-STRING');
      });

      it('should not use the inlined amp-story strings if incorrect RTV', async () => {
        fetchJson = {'35': 'REMOTE-TEXT'};

        const inlinedStrings = win.document.createElement('script');
        inlinedStrings.setAttribute('amp-localization', 'amp-story');
        inlinedStrings.setAttribute('i-amphtml-version', '1234');
        inlinedStrings.textContent = '{"35": "INLINED-STRING"}';
        win.document.head.appendChild(inlinedStrings);

        await createStoryWithPages(1, ['cover']);

        expect(
          await localizationService.getLocalizedStringAsync('35')
        ).to.be.equal('REMOTE-TEXT');
      });

      it('should use the inlined amp-story strings when available if the language is specified', async () => {
        env.win.document.body.parentElement.setAttribute('lang', 'es');

        const inlinedStrings = win.document.createElement('script');
        inlinedStrings.setAttribute('amp-localization', 'amp-story');
        inlinedStrings.setAttribute('i-amphtml-version', '123');
        inlinedStrings.textContent = '{"35": "TEXTO-EN-LINEA"}';
        win.document.head.appendChild(inlinedStrings);

        await createStoryWithPages(1, ['cover']);

        expect(
          await localizationService.getLocalizedStringAsync('35')
        ).to.be.equal('TEXTO-EN-LINEA');
      });

      describe('remote localization strings', () => {
        it('should fetch the localization strings for the default language from the cdn', async () => {
          await createStoryWithPages(1, ['cover']);

          expect(fetchStub).to.be.calledOnceWithExactly(
            'https://cdn.ampproject.org/rtv/123/v0/amp-story.en.json',
            env.sandbox.match.any
          );
        });

        it('should fetch the localization strings for the document language from the cdn', async () => {
          env.win.document.body.parentElement.setAttribute('lang', 'es-419');

          await createStoryWithPages(1, ['cover']);

          expect(fetchStub).to.have.been.calledOnceWithExactly(
            'https://cdn.ampproject.org/rtv/123/v0/amp-story.es-419.json',
            env.sandbox.match.any
          );
        });

        it('should fetch the localization strings for the document language from the local dist if testing locally', async () => {
          env.win.document.body.parentElement.setAttribute('lang', 'es-419');
          env.win.__AMP_MODE.localDev = true;

          await createStoryWithPages(1, ['cover']);

          expect(fetchStub).to.have.been.calledOnceWithExactly(
            '/dist/rtv/123/v0/amp-story.es-419.json',
            env.sandbox.match.any
          );
        });

        it('should use the remote localization strings', async () => {
          env.win.document.body.parentElement.setAttribute('lang', 'es-419');
          fetchJson = {
            '35': 'REMOTE-STRING',
          };

          await createStoryWithPages(1, ['cover']);

          expect(
            await localizationService.getLocalizedStringAsync('35')
          ).to.be.equal('REMOTE-STRING');
        });
      });
    });

    describe('custom desktop aspect ratio', () => {
      beforeEach(async () => {
        await createStoryWithPages(3, ['cover', 'page-1', 'page-2']);
      });

      it('should apply custom desktop aspect ratio is there is one', async () => {
        story.element.setAttribute('desktop-aspect-ratio', '9:16');
        await story.buildCallback();

        expect(
          computedStyle(win, document.querySelector(':root')).getPropertyValue(
            '--i-amphtml-story-desktop-one-panel-ratio'
          )
        ).equal('0.5625');
      });

      it('should apply minimum desktop aspect ratio if the custom one is too small', async () => {
        story.element.setAttribute('desktop-aspect-ratio', '1:10');
        await story.buildCallback();

        expect(
          computedStyle(win, document.querySelector(':root')).getPropertyValue(
            '--i-amphtml-story-desktop-one-panel-ratio'
          )
        ).equal('0.5');
      });

      it('should apply maximum desktop aspect ratio if the custom one is too big', async () => {
        story.element.setAttribute('desktop-aspect-ratio', '1:1');
        await story.buildCallback();

        expect(
          computedStyle(win, document.querySelector(':root')).getPropertyValue(
            '--i-amphtml-story-desktop-one-panel-ratio'
          )
        ).equal('0.75');
      });
    });
  }
);
