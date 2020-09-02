/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import * as consent from '../../../../src/consent';
import * as utils from '../utils';
import {
  Action,
  AmpStoryStoreService,
  StateProperty,
  UIType,
} from '../amp-story-store-service';
import {ActionTrust} from '../../../../src/action-constants';
import {AdvancementMode} from '../story-analytics';
import {AmpStory} from '../amp-story';
import {AmpStoryBookend} from '../bookend/amp-story-bookend';
import {AmpStoryConsent} from '../amp-story-consent';
import {CommonSignals} from '../../../../src/common-signals';
import {Keys} from '../../../../src/utils/key-codes';
import {LocalizationService} from '../../../../src/service/localization';
import {MediaType} from '../media-pool';
import {PageState} from '../amp-story-page';
import {PaginationButtons} from '../pagination-buttons';
import {Services} from '../../../../src/services';
import {VisibilityState} from '../../../../src/visibility-state';
import {createElementWithAttributes} from '../../../../src/dom';
import {poll} from '../../../../testing/iframe';
import {registerServiceBuilder} from '../../../../src/service';
import {toggleExperiment} from '../../../../src/experiments';

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

    /**
     * @param {number} count
     * @param {Array<string>=} ids
     * @return {!Array<!Element>}
     */
    async function createStoryWithPages(count, ids = [], autoAdvance = false) {
      element = win.document.createElement('amp-story');

      Array(count)
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

    function waitFor(callback, errorMessage) {
      return poll(
        errorMessage,
        () => {
          return callback();
        },
        undefined /** opt_onError */,
        200 /** opt_timeout */
      );
    }

    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;

      replaceStateStub = env.sandbox.stub(win.history, 'replaceState');
      // Required by the bookend code.
      win.document.title = 'Story';
      env.ampdoc.defaultView = env.win;

      const localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationForDoc')
        .returns(localizationService);

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
    });

    afterEach(() => {
      element.remove();
    });

    it('should build with the expected number of pages', async () => {
      const pagesCount = 2;
      await createStoryWithPages(pagesCount, ['cover', 'page-1']);
      await story.layoutCallback();
      expect(story.getPageCount()).to.equal(pagesCount);
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

    it('should preload the bookend if navigating to the last page', async () => {
      await createStoryWithPages(1, ['cover']);

      const buildBookendStub = env.sandbox.stub(
        story,
        'buildAndPreloadBookend_'
      );
      await story.layoutCallback();
      expect(buildBookendStub).to.have.been.calledOnce;
    });

    it('should not preload the bookend if not on the last page', async () => {
      await createStoryWithPages(2, ['cover']);

      const buildBookendStub = env.sandbox.stub(
        story,
        'buildAndPreloadBookend_'
      );
      await story.layoutCallback();
      expect(buildBookendStub).to.not.have.been.called;
    });

    it('should prerender/load the share menu', async () => {
      await createStoryWithPages(2);

      const buildShareMenuStub = env.sandbox.stub(story.shareMenu_, 'build');

      await story.layoutCallback();
      expect(buildShareMenuStub).to.have.been.calledOnce;
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
      env.sandbox.stub(story, 'maybePreloadBookend_').returns();

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

      element.build();

      expect(pages[0].hasAttribute('active')).to.be.true;
      expect(pages[1].hasAttribute('active')).to.be.false;

      // Stubbing because we need to assert synchronously
      env.sandbox
        .stub(element.implementation_, 'mutateElement')
        .callsFake((mutator) => {
          mutator();
          return Promise.resolve();
        });

      const eventObj = createEvent('keydown');
      eventObj.key = Keys.RIGHT_ARROW;
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

    it('builds and attaches pagination buttons ', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);

      await story.layoutCallback();
      const paginationButtonsStub = {attach: env.sandbox.spy()};
      env.sandbox
        .stub(PaginationButtons, 'create')
        .returns(paginationButtonsStub);
      story.buildPaginationButtonsForTesting();
      expect(paginationButtonsStub.attach).to.have.been.calledWith(
        story.element
      );
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
      story.onResize();
      expect(isDesktopStub).to.be.calledOnce;
      expect(story.element.classList.contains('i-amphtml-story-landscape')).to
        .be.true;
      story.element.style.width = '10px';
      story.element.style.height = '11px';
      story.onResize();
      expect(isDesktopStub).to.be.calledTwice;
      expect(story.element.classList.contains('i-amphtml-story-landscape')).to
        .be.false;
    });

    it('should update page id in store', async () => {
      const firstPageId = 'page-one';
      const pageCount = 2;
      await createStoryWithPages(pageCount, [firstPageId, 'page-1']);
      const dispatchSpy = env.sandbox.spy(story.storeService_, 'dispatch');

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

    it('should not block layoutCallback when bookend xhr fails', async () => {
      await createStoryWithPages(1, ['page-1']);
      env.sandbox.stub(AmpStoryBookend.prototype, 'build');

      const bookendXhr = env.sandbox
        .stub(AmpStoryBookend.prototype, 'loadConfigAndMaybeRenderBookend')
        .returns(Promise.reject());

      story.buildCallback();

      return story
        .layoutCallback()
        .then(() => {
          expect(bookendXhr).to.have.been.calledOnce;
        })
        .catch((error) => {
          expect(error).to.be.undefined;
        });
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

    it('should default to the three panels UI desktop experience', async () => {
      await createStoryWithPages(4, ['cover', '1', '2', '3']);

      // Don't do this at home. :(
      story.desktopMedia_ = {matches: true};

      story.buildCallback();

      await story.layoutCallback();
      expect(story.storeService_.get(StateProperty.UI_STATE)).to.equals(
        UIType.DESKTOP_PANELS
      );
    });

    it('should detect landscape opt in', async () => {
      await createStoryWithPages(4, ['cover', '1', '2', '3']);
      story.element.setAttribute('supports-landscape', '');

      // Don't do this at home. :(
      story.desktopMedia_ = {matches: true};

      story.buildCallback();

      await story.layoutCallback();
      expect(story.storeService_.get(StateProperty.UI_STATE)).to.equals(
        UIType.DESKTOP_FULLBLEED
      );
    });

    it('should add a desktop attribute', async () => {
      await createStoryWithPages(2, ['cover', '1']);

      story.desktopMedia_ = {matches: true};

      story.buildCallback();

      await story.layoutCallback();
      expect(story.element).to.have.attribute('desktop');
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

      story.buildCallback();

      await story.layoutCallback();
      expect(story.element).to.have.attribute('orientation');
      expect(story.element.getAttribute('orientation')).to.equal('landscape');
    });

    it('should not set orientation landscape if no supports-landscape', async () => {
      await createStoryWithPages(2, ['cover', 'page-1']);

      story.landscapeOrientationMedia_ = {matches: true};
      story.element.setAttribute('standalone', '');

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
      story.onResize();
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

        env.sandbox.stub(ampdoc, 'isVisible').returns(false);
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
        story.getAmpDoc().overrideVisibilityState(VisibilityState.INACTIVE);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      it('should rewind the story page when viewer becomes inactive', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        const setStateStub = window.sandbox.stub(story.activePage_, 'setState');
        story.getAmpDoc().overrideVisibilityState(VisibilityState.INACTIVE);
        expect(setStateStub.getCall(1)).to.have.been.calledWithExactly(
          PageState.NOT_ACTIVE
        );
      });

      it('should pause the story when viewer becomes hidden', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        story.getAmpDoc().overrideVisibilityState(VisibilityState.HIDDEN);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      it('should pause the story page when viewer becomes hidden', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        const setStateStub = window.sandbox.stub(story.activePage_, 'setState');
        story.getAmpDoc().overrideVisibilityState(VisibilityState.HIDDEN);
        expect(setStateStub).to.have.been.calledOnceWithExactly(
          PageState.PAUSED
        );
      });

      it('should pause the story when viewer becomes paused', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        story.getAmpDoc().overrideVisibilityState(VisibilityState.PAUSED);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      it('should pause the story page when viewer becomes paused', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        const setStateStub = window.sandbox.stub(story.activePage_, 'setState');
        story.getAmpDoc().overrideVisibilityState(VisibilityState.PAUSED);
        expect(setStateStub).to.have.been.calledOnceWithExactly(
          PageState.PAUSED
        );
      });

      it('should play the story when viewer becomes active after paused', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        story.getAmpDoc().overrideVisibilityState(VisibilityState.PAUSED);
        story.getAmpDoc().overrideVisibilityState(VisibilityState.ACTIVE);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.false;
      });

      it('should play the story page when viewer becomes active after paused', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        const setStateStub = window.sandbox.stub(story.activePage_, 'setState');
        story.getAmpDoc().overrideVisibilityState(VisibilityState.PAUSED);
        story.getAmpDoc().overrideVisibilityState(VisibilityState.ACTIVE);
        expect(setStateStub.getCall(1)).to.have.been.calledWithExactly(
          PageState.PLAYING
        );
      });

      it('should play the story page when viewer becomes active after paused + inactive', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        await story.layoutCallback();
        const setStateStub = window.sandbox.stub(story.activePage_, 'setState');
        story.getAmpDoc().overrideVisibilityState(VisibilityState.PAUSED);
        story.getAmpDoc().overrideVisibilityState(VisibilityState.INACTIVE);
        story.getAmpDoc().overrideVisibilityState(VisibilityState.ACTIVE);
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
        story.getAmpDoc().overrideVisibilityState(VisibilityState.PAUSED);
        story.getAmpDoc().overrideVisibilityState(VisibilityState.ACTIVE);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      it('should keep the story paused on resume when previously paused + inactive', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        story.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

        await story.layoutCallback();
        story.getAmpDoc().overrideVisibilityState(VisibilityState.PAUSED);
        story.getAmpDoc().overrideVisibilityState(VisibilityState.INACTIVE);
        story.getAmpDoc().overrideVisibilityState(VisibilityState.ACTIVE);
        expect(story.storeService_.get(StateProperty.PAUSED_STATE)).to.be.true;
      });

      describe('amp-story continue anyway', () => {
        it('should not display layout', async () => {
          await createStoryWithPages(2, ['cover', 'page-4']);
          AmpStory.isBrowserSupported = () => false;
          story = new AmpStory(element);
          const dispatchSpy = env.sandbox.spy(story.storeService_, 'dispatch');
          await story.layoutCallback();
          expect(dispatchSpy).to.have.been.calledWith(
            Action.TOGGLE_SUPPORTED_BROWSER,
            false
          );
        });

        it('should display the story after clicking "continue" button', async () => {
          await createStoryWithPages(2, ['cover', 'page-1']);

          AmpStory.isBrowserSupported = () => false;
          story = new AmpStory(element);
          const dispatchSpy = env.sandbox.spy(
            story.unsupportedBrowserLayer_.storeService_,
            'dispatch'
          );

          story.buildCallback();

          await story.layoutCallback();
          story.unsupportedBrowserLayer_.continueButton_.click();
          expect(dispatchSpy).to.have.been.calledWith(
            Action.TOGGLE_SUPPORTED_BROWSER,
            true
          );
        });
      });

      describe('amp-story custom sidebar', () => {
        it('should show the sidebar control if a sidebar exists', async () => {
          await createStoryWithPages(2, ['cover', 'page-1']);

          const sidebar = win.document.createElement('amp-sidebar');
          story.element.appendChild(sidebar);

          await story.layoutCallback();
          expect(story.storeService_.get(StateProperty.HAS_SIDEBAR_STATE)).to.be
            .true;
        });
      });

      it('should open the sidebar on button click', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        const sidebar = win.document.createElement('amp-sidebar');
        story.element.appendChild(sidebar);

        const executeSpy = env.sandbox.spy();
        env.sandbox.stub(Services, 'actionServiceForDoc').returns({
          setAllowlist: () => {},
          trigger: () => {},
          execute: executeSpy,
        });

        story.buildCallback();
        await story.layoutCallback();
        story.storeService_.dispatch(Action.TOGGLE_SIDEBAR, true);
        expect(executeSpy).to.have.been.calledWith(
          story.sidebar_,
          'open',
          null,
          null,
          null,
          null,
          ActionTrust.HIGH
        );
      });

      it('should unpause the story when the sidebar is closed', async () => {
        await createStoryWithPages(2, ['cover', 'page-1']);

        const sidebar = win.document.createElement('amp-sidebar');
        story.element.appendChild(sidebar);

        env.sandbox.stub(Services, 'actionServiceForDoc').returns({
          setAllowlist: () => {},
          trigger: () => {},
          execute: () => {
            sidebar.setAttribute('open', '');
          },
        });

        story.buildCallback();
        await story.layoutCallback();
        story.storeService_.dispatch(Action.TOGGLE_SIDEBAR, true);
        await Promise.resolve();
        story.sidebar_.removeAttribute('open');
        await Promise.resolve();
        expect(story.storeService_.get(StateProperty.SIDEBAR_STATE)).to.be
          .false;
      });

      describe('desktop attributes', () => {
        it('should add desktop-position attributes', async () => {
          const desktopAttribute = 'i-amphtml-desktop-position';
          await createStoryWithPages(4, ['cover', '1', '2', '3']);
          const pages = story.element.querySelectorAll('amp-story-page');

          story.buildCallback();

          story.storeService_.dispatch(Action.TOGGLE_UI, UIType.DESKTOP_PANELS);

          await story.layoutCallback();
          expect(pages[0].getAttribute(desktopAttribute)).to.equal('0');
          expect(pages[1].getAttribute(desktopAttribute)).to.equal('1');
          expect(pages[2].getAttribute(desktopAttribute)).to.equal('2');
          expect(pages[3].hasAttribute(desktopAttribute)).to.be.false;
        });
      });

      it('should update desktop-position attributes upon navigation', async () => {
        const desktopAttribute = 'i-amphtml-desktop-position';
        await createStoryWithPages(4, ['cover', '1', '2', '3']);
        const pages = story.element.querySelectorAll('amp-story-page');

        story.buildCallback();

        story.storeService_.dispatch(Action.TOGGLE_UI, UIType.DESKTOP_PANELS);

        await story.layoutCallback();
        await story.switchTo_('2');
        expect(pages[0].getAttribute(desktopAttribute)).to.equal('-2');
        expect(pages[1].getAttribute(desktopAttribute)).to.equal('-1');
        expect(pages[2].getAttribute(desktopAttribute)).to.equal('0');
        expect(pages[3].getAttribute(desktopAttribute)).to.equal('1');
      });

      it('should add previous visited attribute', async () => {
        env.sandbox.stub(story, 'maybePreloadBookend_').returns();
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
                .whenSignal(CommonSignals.LOAD_END)
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
            [MediaType.AUDIO]: 2,
            [MediaType.VIDEO]: 2,
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
            [MediaType.AUDIO]: 3,
            [MediaType.VIDEO]: 3,
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
            [MediaType.AUDIO]: 4,
            [MediaType.VIDEO]: 8,
          };
          expect(story.getMaxMediaElementCounts()).to.deep.equal(expected);
        });
      });

      describe('amp-story NO_NEXT_PAGE', () => {
        describe('without #cap=swipe', () => {
          it('should open the bookend when tapping on the last page', async () => {
            await createStoryWithPages(1, ['cover']);

            await story.layoutCallback();
            // Click on right side of the screen to trigger page advancement.
            const clickEvent = new MouseEvent('click', {clientX: 200});
            story.activePage_.element.dispatchEvent(clickEvent);
            await waitFor(() => {
              return !!story.storeService_.get(StateProperty.BOOKEND_STATE);
            }, 'BOOKEND_STATE should be true');
          });
        });

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
              if (sendMessageStub.calledOnce) {
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

            await waitFor(() => {
              if (sendMessageStub.calledOnce) {
                expect(sendMessageStub).to.be.calledWithExactly(
                  'selectDocument',
                  {
                    next: true,
                    advancementMode: AdvancementMode.AUTO_ADVANCE_TIME,
                  }
                );
                return true;
              }
              return false;
            }, 'sendMessageStub should be called');
          });
        });
      });

      describe('amp-story NO_PREVIOUS_PAGE', () => {
        describe('without #cap=swipe', () => {
          it('should open the bookend when tapping on the last page', async () => {
            await createStoryWithPages(1, ['cover']);
            const showPageHintStub = env.sandbox.stub(
              story.ampStoryHint_,
              'showFirstPageHintOverlay'
            );

            await story.layoutCallback();
            // Click on left side of the screen to trigger page advancement.
            const clickEvent = new MouseEvent('click', {clientX: 10});
            story.activePage_.element.dispatchEvent(clickEvent);
            await waitFor(() => {
              return showPageHintStub.calledOnce;
            }, 'showPageHintStub should be called');
          });
        });

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
              if (sendMessageStub.calledOnce) {
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

        it('should NOT navigate when clicking on a shadow DOM element', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          await story.layoutCallback();
          const clickEvent = new MouseEvent('click', {clientX: 200});
          story.shareMenu_.element_.dispatchEvent(clickEvent);

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

      describe('amp-access navigation', () => {
        it('should set the access state to true if next page blocked', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          await story.layoutCallback();
          story
            .getPageById('page-1')
            .element.setAttribute('amp-access-hide', '');
          await story.switchTo_('page-1');
          expect(story.storeService_.get(StateProperty.ACCESS_STATE)).to.be
            .true;
        });

        it('should not navigate if next page is blocked by paywall', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          await story.layoutCallback();
          story
            .getPageById('page-1')
            .element.setAttribute('amp-access-hide', '');
          await story.switchTo_('page-1');
          expect(story.activePage_.element.id).to.equal('cover');
        });

        it('should navigate once the doc is reauthorized', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          let authorizedCallback;
          const fakeAccessService = {
            areFirstAuthorizationsCompleted: () => true,
            onApplyAuthorizations: (fn) => (authorizedCallback = fn),
          };
          env.sandbox
            .stub(Services, 'accessServiceForDocOrNull')
            .resolves(fakeAccessService);

          // Navigates to a paywall protected page, and waits until the document
          // is successfuly reauthorized to navigate.
          await story.layoutCallback();
          story
            .getPageById('page-1')
            .element.setAttribute('amp-access-hide', '');
          await story.switchTo_('page-1');
          story
            .getPageById('page-1')
            .element.removeAttribute('amp-access-hide');
          authorizedCallback();

          expect(story.activePage_.element.id).to.equal('page-1');
        });

        it('should hide the paywall once the doc is reauthorized', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          let authorizedCallback;
          const fakeAccessService = {
            areFirstAuthorizationsCompleted: () => true,
            onApplyAuthorizations: (fn) => (authorizedCallback = fn),
          };
          env.sandbox
            .stub(Services, 'accessServiceForDocOrNull')
            .resolves(fakeAccessService);

          // Navigates to a paywall protected page, and waits until the document
          // is successfuly reauthorized to hide the access UI.
          await story.layoutCallback();
          story
            .getPageById('page-1')
            .element.setAttribute('amp-access-hide', '');
          await story.switchTo_('page-1');
          expect(story.activePage_.element.id).to.equal('cover');
          story
            .getPageById('page-1')
            .element.removeAttribute('amp-access-hide');
          authorizedCallback();

          expect(story.storeService_.get(StateProperty.ACCESS_STATE)).to.be
            .false;
        });

        it('should not navigate on doc reauthorized if page still blocked', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          let authorizedCallback;
          const fakeAccessService = {
            areFirstAuthorizationsCompleted: () => true,
            onApplyAuthorizations: (fn) => (authorizedCallback = fn),
          };
          env.sandbox
            .stub(Services, 'accessServiceForDocOrNull')
            .resolves(fakeAccessService);

          // Navigates to a paywall protected page, and does not navigate to that
          // page if the document has been reauthorized with insuficient rights.
          await story.layoutCallback();
          story
            .getPageById('page-1')
            .element.setAttribute('amp-access-hide', '');
          await story.switchTo_('page-1');
          authorizedCallback();

          expect(story.activePage_.element.id).to.equal('cover');
        });

        it('should show paywall on doc reauthorized if page still blocked', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          let authorizedCallback;
          const fakeAccessService = {
            areFirstAuthorizationsCompleted: () => true,
            onApplyAuthorizations: (fn) => (authorizedCallback = fn),
          };
          env.sandbox
            .stub(Services, 'accessServiceForDocOrNull')
            .resolves(fakeAccessService);

          // Navigates to a paywall protected page, and does not hide the access UI
          // if the document has been reauthorized with insuficient rights.
          await story.layoutCallback();
          story
            .getPageById('page-1')
            .element.setAttribute('amp-access-hide', '');
          await story.switchTo_('page-1');
          authorizedCallback();

          expect(story.storeService_.get(StateProperty.ACCESS_STATE)).to.be
            .true;
        });

        it('should block navigation if doc authorizations are pending', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          const fakeAccessService = {
            areFirstAuthorizationsCompleted: () => false,
            onApplyAuthorizations: () => {},
          };
          env.sandbox
            .stub(Services, 'accessServiceForDocOrNull')
            .resolves(fakeAccessService);

          // Navigates to a maybe protected page (has amp-access="" rule), but the
          // document authorizations are still pending. Asserts that it blocks the
          // navigation.
          await story.layoutCallback();
          story
            .getPageById('page-1')
            .element.setAttribute('amp-access', 'random condition');
          await story.switchTo_('page-1');
          expect(story.activePage_.element.id).to.equal('cover');
        });

        it('should navigate only after the doc is first authorized', async () => {
          await createStoryWithPages(4, [
            'cover',
            'page-1',
            'page-2',
            'page-3',
          ]);

          let authorizedCallback;
          const fakeAccessService = {
            areFirstAuthorizationsCompleted: () => false,
            onApplyAuthorizations: (fn) => (authorizedCallback = fn),
          };
          env.sandbox
            .stub(Services, 'accessServiceForDocOrNull')
            .resolves(fakeAccessService);

          // Navigation to a maybe protected page (has amp-access="" rule) is
          // blocked until the authorizations are completed.
          await story.layoutCallback();
          story
            .getPageById('page-1')
            .element.setAttribute('amp-access', 'random condition');
          await story.switchTo_('page-1');
          authorizedCallback();
          expect(story.activePage_.element.id).to.equal('page-1');
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
            await story.mutateElement(() => {
              const hintEl = story.element.querySelector(
                '.i-amphtml-story-hint-container'
              );
              expect(hintEl).to.not.have.class('i-amphtml-hidden');
            });
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
        beforeEach(() => {
          toggleExperiment(win, 'amp-story-responsive-units', true);
        });

        afterEach(() => {
          toggleExperiment(win, 'amp-story-responsive-units', false);
        });

        it('should rewrite vw styles', async () => {
          await createStoryWithPages(1, ['cover']);
          const styleEl = win.document.createElement('style');
          styleEl.setAttribute('amp-custom', '');
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
          await createStoryWithPages(1, ['cover']);
          const styleEl = win.document.createElement('style');
          styleEl.setAttribute('amp-custom', '');
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
          .whenSignal(CommonSignals.LOAD_END);
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
          .whenSignal(CommonSignals.LOAD_END);
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
  }
);
