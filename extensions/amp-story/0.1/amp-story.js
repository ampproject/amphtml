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

/**
 * @fileoverview Embeds a story
 *
 * Example:
 * <code>
 * <amp-story standalone bookend-config-src="bookend.json">
 *   [...]
 * </amp-story>
 * </code>
 */
import './amp-story-auto-ads';
import './amp-story-grid-layer';
import './amp-story-page';
import {ActionTrust} from '../../../src/action-trust';
import {AmpStoryAnalytics} from './analytics';
import {AmpStoryBackground} from './background';
import {AmpStoryHint} from './amp-story-hint';
import {AmpStoryStoreService, StateProperty} from './amp-story-store-service';
import {AmpStoryVariableService} from './variable-service';
import {Bookend} from './bookend';
import {CSS} from '../../../build/amp-story-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {
  DoubletapRecognizer,
  SwipeXYRecognizer,
} from '../../../src/gesture-recognizers';
import {EventType, dispatch} from './events';
import {Gestures} from '../../../src/gesture';
import {KeyCodes} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {MediaPool, MediaType} from './media-pool';
import {NavigationState} from './navigation-state';
import {ORIGIN_WHITELIST} from './origin-whitelist';
import {PaginationButtons} from './pagination-buttons';
import {Services} from '../../../src/services';
import {ShareWidget} from './share';
import {SystemLayer} from './system-layer';
import {TapNavigationDirection} from './page-advancement';
import {
  childElement,
  closest,
  escapeCssSelectorIdent,
  matches,
  removeElement,
  scopedQuerySelectorAll,
} from '../../../src/dom';
import {
  computedStyle,
  resetStyles,
  setImportantStyles,
  setStyle,
} from '../../../src/style';
import {debounce} from '../../../src/utils/rate-limit';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {findIndex} from '../../../src/utils/array';
import {getMode} from '../../../src/mode';
import {getSourceOrigin, parseUrl} from '../../../src/url';
import {isExperimentOn, toggleExperiment} from '../../../src/experiments';
import {once} from '../../../src/utils/function';
import {registerServiceBuilder} from '../../../src/service';
import {relatedArticlesFromJson} from './related-articles';
import {renderSimpleTemplate} from './simple-template';
import {stringHash32} from '../../../src/string';
import {upgradeBackgroundAudio} from './audio';

/** @private @const {string} */
const PRE_ACTIVE_PAGE_ATTRIBUTE_NAME = 'pre-active';

/** @private @const {string} */
const BOOKEND_CONFIG_ATTRIBUTE_NAME = 'bookend-config-src';

/** @private @const {string} */
const AMP_STORY_STANDALONE_ATTRIBUTE = 'standalone';

/** @private @const {number} */
const DESKTOP_WIDTH_THRESHOLD = 1024;

/** @private @const {number} */
const DESKTOP_HEIGHT_THRESHOLD = 550;

/** @private @const {number} */
const MIN_SWIPE_FOR_HINT_OVERLAY_PX = 50;

/** @private @const {string} */
const ADVANCE_TO_ATTR = 'i-amphtml-advance-to';

/** @private @const {string} */
const RETURN_TO_ATTR = 'i-amphtml-return-to';

/** @private @const {string} */
const AUTO_ADVANCE_TO_ATTR = 'auto-advance-to';

/** @private @const {string} */
const AD_SHOWING_ATTR = 'ad-showing';


/**
 * The duration of time (in milliseconds) to wait for a page to be loaded,
 * before the story becomes visible.
 * @const {number}
 */
const PAGE_LOAD_TIMEOUT_MS = 5000;


/**
 * CSS class for an amp-story that indicates the initial load for the story has
 * completed.
 * @const {string}
 */
const STORY_LOADED_CLASS_NAME = 'i-amphtml-story-loaded';

/** @const {!Object<string, number>} */
const MAX_MEDIA_ELEMENT_COUNTS = {
  [MediaType.AUDIO]: 4,
  [MediaType.VIDEO]: 8,
};


/**
 * @private @const {string}
 */
const AUDIO_MUTED_ATTRIBUTE = 'muted';

/** @type {string} */
const TAG = 'amp-story';

const LANDSCAPE_OVERLAY_CLASS = 'i-amphtml-story-landscape';



const LANDSCAPE_ORIENTATION_WARNING = [
  {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-no-rotation-overlay ' +
          'i-amphtml-story-system-reset'}),
    children: [
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-overlay-container'}),
        children: [
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-rotate-icon'}),
          },
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-story-overlay-text'}),
            text: 'The page is best viewed in portrait mode',
          },
        ],
      },
    ],
  },
];

const DESKTOP_SIZE_WARNING = [
  {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-no-rotation-overlay ' +
          'i-amphtml-story-system-reset'}),
    children: [
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-overlay-container'}),
        children: [
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-desktop-size-icon'}),
          },
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-story-overlay-text'}),
            text: 'Expand your window to view this experience',
          },
        ],
      },
    ],
  },
];

const UNSUPPORTED_BROWSER_WARNING = [
  {
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-unsupported-browser-overlay'}),
    children: [
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-overlay-container'}),
        children: [
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-gear-icon'}),
          },
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-story-overlay-text'}),
            text: 'We\'re sorry, it looks like your browser doesn\'t support ' +
                'this experience',
          },
        ],
      },
    ],
  },
];


/**
 * Container for "pill-style" share widget, rendered on desktop.
 * @private @const {!./simple-template.ElementDef}
 */
const SHARE_WIDGET_PILL_CONTAINER = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-share-pill'}),
};



/**
 * Selector for elements that should be hidden when the bookend is open on
 * desktop view.
 * @private @const {string}
 */
const HIDE_ON_BOOKEND_SELECTOR =
    'amp-story-page, .i-amphtml-story-system-layer';


/**
 * @implements {./media-pool.MediaPoolRoot}
 */
export class AmpStory extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!NavigationState} */
    this.navigationState_ =
        new NavigationState(element, () => this.hasBookend_());

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();

    /** @private @const {!Bookend} */
    this.bookend_ = new Bookend(this.win);

    /** @private @const {!SystemLayer} */
    this.systemLayer_ = new SystemLayer(this.win);

    /** @private @const {!Array<string>} */
    this.pageHistoryStack_ = [];

    /** @private @const {!Array<!./amp-story-page.AmpStoryPage>} */
    this.pages_ = [];

    /** @private @const {!Array<!./amp-story-page.AmpStoryPage>} */
    this.adPages_ = [];

    /** @const @private {!AmpStoryVariableService} */
    this.variableService_ = new AmpStoryVariableService();

    /** @private @const {!function():!Promise<?./bookend.BookendConfigDef>} */
    this.loadBookendConfig_ = once(() => this.loadBookendConfigImpl_());

    /** @private {?./amp-story-page.AmpStoryPage} */
    this.activePage_ = null;

    /** @private @const */
    this.desktopMedia_ = this.win.matchMedia(
        `(min-width: ${DESKTOP_WIDTH_THRESHOLD}px) and ` +
        `(min-height: ${DESKTOP_HEIGHT_THRESHOLD}px)`);

    /** @private @const */
    this.canRotateToDesktopMedia_ = this.win.matchMedia(
        `(min-width: ${DESKTOP_HEIGHT_THRESHOLD}px) and ` +
        `(min-height: ${DESKTOP_WIDTH_THRESHOLD}px)`);

    /** @private {?AmpStoryBackground} */
    this.background_ = null;

    /** @private {?HTMLMediaElement} */
    this.backgroundAudioEl_ = null;

    /** @private {?./pagination-buttons.PaginationButtons} */
    this.paginationButtons_ = null;

    /** @private {?Element} */
    this.topBar_ = null;

    /** @private {?ShareWidget} */
    this.shareWidget_ = null;

    /** @private @const {!Array<string>} */
    this.originWhitelist_ = ORIGIN_WHITELIST;

    /** @private {!AmpStoryHint} */
    this.ampStoryHint_ = new AmpStoryHint(this.win);

    /** @private {!MediaPool} */
    this.mediaPool_ = MediaPool.for(this);

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win);

    /** @private @const {!AmpStoryStoreService} */
    this.storeService_ = new AmpStoryStoreService(this.win);
  }


  /** @override */
  buildCallback() {
    this.assertAmpStoryExperiment_();

    if (this.element.hasAttribute(AMP_STORY_STANDALONE_ATTRIBUTE)) {
      this.initializeStandaloneStory_();
    }

    if (this.isDesktop_()) {
      this.element.setAttribute('desktop','');
    }
    this.element.querySelector('amp-story-page').setAttribute('active', '');

    this.initializeListeners_();
    this.initializeListenersForDev_();

    this.navigationState_.observe(stateChangeEvent =>
      (new AmpStoryAnalytics(this.element)).onStateChange(stateChangeEvent));

    this.navigationState_.observe(stateChangeEvent =>
      this.variableService_.onStateChange(stateChangeEvent));

    // Mute `amp-story` in beginning.
    this.mute_();

    registerServiceBuilder(this.win, 'story-variable',
        () => this.variableService_.get());

    registerServiceBuilder(this.win, 'story-store', () => this.storeService_);
  }


  /** @private */
  initializeStandaloneStory_() {
    const html = this.win.document.documentElement;
    this.mutateElement(() => {
      html.classList.add('i-amphtml-story-standalone');
      // Lock body to prevent overflow.
      this.lockBody_();
      // Standalone CSS affects sizing of the entire page.
      this.onResize();
    }, html);
  }


  /**
   * Builds the system layer DOM.  This is dependent on the pages_ array having
   * been initialized, so it cannot happen at build time.
   * @private
   */
  buildSystemLayer_() {
    const pageIds = this.pages_.map(page => page.element.id);
    this.element.appendChild(this.systemLayer_.build(pageIds));
    this.updateAudioIcon_();
  }

  /**
   * Builds the hint layer DOM.
   * @private
   */
  buildHintLayer_() {
    this.element.appendChild(this.ampStoryHint_.buildHintContainer());
  }


  /** @private */
  initializeListeners_() {
    this.element.addEventListener(EventType.NEXT_PAGE, () => {
      this.next_();
    });

    this.element.addEventListener(EventType.PREVIOUS_PAGE, () => {
      this.previous_();
    });

    this.element.addEventListener(EventType.SHOW_BOOKEND, () => {
      this.hasBookend_().then(hasBookend => {
        if (hasBookend) {
          this.showBookend_();
        }
      });
    });

    this.element.addEventListener(EventType.CLOSE_BOOKEND, () => {
      this.hideBookend_();
    });

    this.element.addEventListener(EventType.MUTE, () => {
      this.mute_();
    });

    this.element.addEventListener(EventType.UNMUTE, () => {
      this.unmute_();
    });

    this.element.addEventListener(EventType.AUDIO_PLAYING, () => {
      this.audioPlaying_();
    });

    this.element.addEventListener(EventType.AUDIO_STOPPED, () => {
      this.audioStopped_();
    });

    this.element.addEventListener(EventType.SWITCH_PAGE, e => {
      if (this.bookend_.isActive()) {
        // Disallow switching pages while the bookend is active.
        return;
      }

      this.switchTo_(e.detail.targetPageId);
      this.ampStoryHint_.hideAllNavigationHint();
    });

    this.element.addEventListener(EventType.PAGE_PROGRESS, e => {
      const pageId = e.detail.pageId;
      const progress = e.detail.progress;

      if (pageId !== this.activePage_.element.id) {
        // Ignore progress update events from inactive pages.
        return;
      }

      if (!this.activePage_.isAd()) {
        this.systemLayer_.updateProgress(pageId, progress);
      }
    });

    this.element.addEventListener(EventType.REPLAY, () => {
      this.replay_();
    });

    this.element.addEventListener(EventType.SHOW_NO_PREVIOUS_PAGE_HELP, () => {
      if (this.storeService_.get(StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP)) {
        this.ampStoryHint_.showFirstPageHintOverlay();
      }
    });

    this.element.addEventListener(EventType.TAP_NAVIGATION, e => {
      const {direction} = e.detail;
      this.performTapNavigation_(direction);
    });

    this.win.document.addEventListener('keydown', e => {
      this.onKeyDown_(e);
    }, true);

    this.getViewport().onResize(debounce(this.win, () => this.onResize(), 300));
    this.installGestureRecognizers_();
  }

  /** @private */
  installGestureRecognizers_() {
    const {element} = this;
    const gestures = Gestures.get(element, /* shouldNotPreventDefault */ true);

    // Disables zoom on double-tap.
    gestures.onGesture(DoubletapRecognizer, gesture => {
      const {event} = gesture;
      event.preventDefault();
    });

    // Shows "tap to navigate" hint when swiping.
    gestures.onGesture(SwipeXYRecognizer, gesture => {
      const {deltaX} = gesture.data;
      if (this.bookend_.isActive()) {
        return;
      }
      if (!this.isSwipeLargeEnoughForHint_(deltaX)) {
        return;
      }
      if (!this.storeService_
          .get(StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT)) {
        return;
      }

      this.ampStoryHint_.showNavigationOverlay();
    });
  }

  /** @private */
  isSwipeLargeEnoughForHint_(deltaX) {
    return (Math.abs(deltaX) >= MIN_SWIPE_FOR_HINT_OVERLAY_PX);
  }

  /** @private */
  initializeListenersForDev_() {
    if (!getMode().development) {
      return;
    }

    this.element.addEventListener(EventType.DEV_LOG_ENTRIES_AVAILABLE, e => {
      this.systemLayer_.logAll(e.detail);
    });
  }

  /** @private */
  lockBody_() {
    const document = this.win.document;
    setImportantStyles(document.documentElement, {
      'overflow': 'hidden',
    });
    setImportantStyles(document.body, {
      'overflow': 'hidden',
    });

    this.getViewport().resetTouchZoom();
    this.getViewport().disableTouchZoom();
    this.maybeLockScreenOrientation_();
  }


  /** @private */
  maybeLockScreenOrientation_() {
    const screen = this.win.screen;
    if (!screen || !this.canRotateToDesktopMedia_.matches) {
      return;
    }

    const lockOrientation = screen.lockOrientation ||
        screen.mozLockOrientation || screen.msLockOrientation ||
        (unusedOrientation => {});

    try {
      lockOrientation('portrait');
    } catch (e) {
      dev().warn(TAG, 'Failed to lock screen orientation:', e.message);
    }
  }

  /** @private */
  buildPaginationButtons_() {
    this.paginationButtons_ = PaginationButtons.create(this.win.document);

    this.paginationButtons_.attach(this.element);

    this.navigationState_.observe(e =>
      this.paginationButtons_.onNavigationStateChange(e));
  }

  /** @visibleForTesting */
  buildPaginationButtonsForTesting() {
    this.buildPaginationButtons_();
  }

  /** @private */
  buildTopBar_() {
    const doc = this.element.ownerDocument;

    this.topBar_ = doc.createElement('div');
    this.topBar_.classList.add(
        'i-amphtml-story-top', 'i-amphtml-story-system-reset');
    this.topBar_.appendChild(this.buildTopBarShare_());

    this.element.insertBefore(this.topBar_, this.element.firstChild);
  }

  /**
   * @return {!Node}
   * @private
   */
  buildTopBarShare_() {
    const container =
        renderSimpleTemplate(this.win.document, SHARE_WIDGET_PILL_CONTAINER);

    this.shareWidget_ = new ShareWidget(this.win);

    container.appendChild(this.shareWidget_.build(this.getAmpDoc()));

    this.loadBookendConfig_().then(bookendConfig => {
      if (bookendConfig !== null) {
        this.shareWidget_.setProviders(bookendConfig.shareProviders);
      }
    });

    return container;
  }

  /** @override */
  layoutCallback() {
    if (!AmpStory.isBrowserSupported(this.win)) {
      this.buildUnsupportedBrowserOverlay_();
      dev().expectedError(TAG, 'Unsupported browser');
      return Promise.resolve();
    }

    const firstPageEl = user().assertElement(
        this.element.querySelector('amp-story-page'),
        'Story must have at least one page.');

    if (!this.paginationButtons_) {
      this.buildPaginationButtons_();
    }

    const storyLayoutPromise = this.initializePages_()
        .then(() => this.buildSystemLayer_())
        .then(() => this.buildHintLayer_())
        .then(() => this.buildLandscapeOrientationOverlay_())
        .then(() => {
          this.pages_.forEach(page => {
            page.setActive(false);
          });
        })
        .then(() => this.switchTo_(firstPageEl.id))
        .then(() => this.preloadPagesByDistance_());

    // Do not block the layout callback on the completion of these promises, as
    // that prevents descendents from being laid out (and therefore loaded).
    storyLayoutPromise.then(() => this.whenPagesLoaded_(PAGE_LOAD_TIMEOUT_MS))
        .then(() => this.markStoryAsLoaded_());

    return storyLayoutPromise;
  }


  /**
   * @param {number} timeoutMs The maximum amount of time to wait, in
   *     milliseconds.
   * @return {!Promise} A promise that is resolved when the page is loaded or
   *     the timeout has been exceeded, whichever happens first.
   * @private
   */
  whenPagesLoaded_(timeoutMs = 0) {
    const pagesToWaitFor = this.isDesktop_() ?
      [this.pages_[0], this.pages_[1]] :
      [this.pages_[0]];

    const storyLoadPromise = Promise.all(
        pagesToWaitFor.map(page => page.whenLoaded()));

    return this.timer_.timeoutPromise(timeoutMs, storyLoadPromise)
        .catch(() => {});
  }


  /** @private */
  markStoryAsLoaded_() {
    dispatch(this.element, EventType.STORY_LOADED, true);
    this.signals().signal(CommonSignals.INI_LOAD);
    this.mutateElement(() => {
      this.element.classList.add(STORY_LOADED_CLASS_NAME);
    });
  }


  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  prerenderAllowed() {
    return true;
  }


  /** @private */
  isAmpStoryEnabled_() {
    if (isExperimentOn(this.win, TAG) || getMode().test) {
      return true;
    }

    const origin = getSourceOrigin(this.win.location);
    return this.isOriginWhitelisted_(origin);
  }


  /**
   * @param {string} domain The domain part of the origin, to be hashed.
   * @return {string} The hashed origin.
   * @private
   */
  hashOrigin_(domain) {
    return stringHash32(domain.toLowerCase());
  }


  /**
   * @param {string} origin The origin to check.
   * @return {boolean} Whether the specified origin is whitelisted to use the
   *     amp-story extension.
   * @private
   */
  isOriginWhitelisted_(origin) {
    const hostName = parseUrl(origin).hostname;
    const domains = hostName.split('.');

    // Check all permutations of the domain to see if any level of the domain is
    // whitelisted.  Taking the example of the whitelisted domain
    // example.co.uk, if the page is served from www.example.co.uk/page.html:
    //
    //   www.example.co.uk => false
    //   example.co.uk => true
    //   co.uk => false
    //   uk => false
    //
    // This is necessary, since we don't have any guarantees of which level of
    // the domain is whitelisted.  For many domains (e.g. .com), the second
    // level of the domain is likely to be whitelisted, whereas for others
    // (e.g. .co.uk) the third level may be whitelisted.  Additionally, this
    // allows subdomains to be whitelisted individually.
    return domains.some((unusedDomain, index) => {
      const domain = domains.slice(index, domains.length).join('.');
      const domainHash = this.hashOrigin_(domain);
      return this.originWhitelist_.includes(domainHash);
    });
  }


  /** @private */
  assertAmpStoryExperiment_() {
    if (this.isAmpStoryEnabled_()) {
      return;
    }

    const errorIconEl = this.win.document.createElement('div');
    errorIconEl.classList.add('i-amphtml-story-experiment-icon');
    errorIconEl.classList.add('i-amphtml-story-experiment-icon-error');

    const errorMsgEl = this.win.document.createElement('span');
    errorMsgEl.textContent = 'You must enable the amp-story experiment to ' +
        'view this content.';

    const experimentsLinkEl = this.win.document.createElement('button');
    experimentsLinkEl.textContent = 'Enable';
    experimentsLinkEl.addEventListener('click', () => {
      toggleExperiment(this.win, 'amp-story', true);
      errorIconEl.classList.remove('i-amphtml-story-experiment-icon-error');
      errorIconEl.classList.add('i-amphtml-story-experiment-icon-done');
      errorMsgEl.textContent = 'Experiment enabled.  Please reload.';
      removeElement(experimentsLinkEl);
    });

    const errorEl = this.win.document.createElement('div');
    errorEl.classList.add('i-amphtml-story-experiment-error');
    errorEl.appendChild(errorIconEl);
    errorEl.appendChild(errorMsgEl);
    errorEl.appendChild(experimentsLinkEl);
    this.element.appendChild(errorEl);

    user().error(TAG, 'enable amp-story experiment');
  }


  /** @private */
  initializePages_() {
    const pageImplPromises = Array.prototype.map.call(
        this.element.querySelectorAll('amp-story-page'),
        (pageEl, index) => {
          return pageEl.getImpl().then(pageImpl => {
            this.pages_[index] = pageImpl;
          });
        });

    return Promise.all(pageImplPromises);
  }


  /**
   * Advance to the next screen in the story, if there is one.
   * @param {boolean=} opt_isAutomaticAdvance Whether this navigation was caused
   *     by an automatic advancement after a timeout.
   * @private
   */
  next_(opt_isAutomaticAdvance) {
    const activePage = dev().assert(this.activePage_,
        'No active page set when navigating to next page.');

    const lastPage = this.pages_[this.getPageCount() - 1];
    if (activePage.element.hasAttribute(ADVANCE_TO_ATTR) ||
        activePage !== lastPage) {
      activePage.next(opt_isAutomaticAdvance);
    } else {
      dispatch(this.element, EventType.SHOW_BOOKEND);
    }
  }


  /**
   * Go back to the previous screen in the story, if there is one.
   * @private
   */
  previous_() {
    const activePage = dev().assert(this.activePage_,
        'No active page set when navigating to next page.');
    activePage.previous();
  }


  /**
   * @param {!TapNavigationDirection} direction The direction to navigate.
   * @private
   */
  performTapNavigation_(direction) {
    if (this.isDesktop_()) {
      this.next_();
      return;
    }

    if (direction === TapNavigationDirection.NEXT) {
      this.next_();
    } else if (direction === TapNavigationDirection.PREVIOUS) {
      this.previous_();
    }
  }


  /**
   * Switches to a particular page.
   * @param {string} targetPageId
   * @return {!Promise}
   */
  // TODO(newmuis): Update history state
  switchTo_(targetPageId) {
    const targetPage = this.getPageById(targetPageId);
    const pageIndex = this.getPageIndex(targetPage);

    this.updateBackground_(targetPage.element, /* initial */ !this.activePage_);

    if (targetPage.isAd()) {
      this.vsync_.mutate(() => {
        this.element.setAttribute(AD_SHOWING_ATTR, '');
      });
    } else {
      this.vsync_.mutate(() => {
        this.element.removeAttribute(AD_SHOWING_ATTR);
      });
      // TODO(alanorozco): decouple this using NavigationState
      this.systemLayer_.setActivePageId(targetPageId);
    }

    // TODO(alanorozco): check if autoplay
    this.navigationState_.updateActivePage(
        pageIndex,
        this.getPageCount(),
        targetPage.element.id);

    const oldPage = this.activePage_;

    // TODO(cvializ): Move this to the page class?
    const activePriorSibling = targetPage.element.previousElementSibling;
    const previousActivePriorSibling = this.element.querySelector(
        `[${escapeCssSelectorIdent(PRE_ACTIVE_PAGE_ATTRIBUTE_NAME)}]`);

    this.activePage_ = targetPage;

    this.systemLayer_.resetDeveloperLogs();
    this.systemLayer_.setDeveloperLogContextString(
        this.activePage_.element.id);

    return targetPage.beforeVisible().then(() => {
      this.triggerActiveEventForPage_();

      if (oldPage) {
        oldPage.setActive(false);
      }

      targetPage.setActive(true);

      if (activePriorSibling &&
          matches(activePriorSibling, 'amp-story-page')) {
        activePriorSibling.setAttribute(PRE_ACTIVE_PAGE_ATTRIBUTE_NAME, '');
      }
      if (previousActivePriorSibling) {
        previousActivePriorSibling.removeAttribute(
            PRE_ACTIVE_PAGE_ATTRIBUTE_NAME);
      }

      // If first navigation.
      if (!oldPage) {
        this.registerAndPreloadBackgroundAudio_();
      }

      this.preloadPagesByDistance_();
      this.reapplyMuting_();
      this.forceRepaintForSafari_();
      this.maybePreloadBookend_();
    });
  }


  /** @private */
  triggerActiveEventForPage_() {
    // TODO(alanorozco): pass event priority once amphtml-story repo is merged
    // with upstream.
    Services.actionServiceForDoc(this.element)
        .trigger(this.activePage_.element, 'active', /* event */ null,
            ActionTrust.HIGH);
  }


  /**
   * For some reason, Safari has an issue where sometimes when pages become
   * visible, some descendants are not painted.  This is a hack where we detect
   * that the browser is Safari and force it to repaint, to avoid this case.
   * See newmuis/amphtml-story#106 for details.
   * @private
   */
  forceRepaintForSafari_() {
    const platform = Services.platformFor(this.win);
    if (!platform.isSafari() && !platform.isIos()) {
      return;
    }
    if (this.isDesktop_()) {
      // Force repaint is only needed when transitioning from invisible to visible
      return;
    }

    this.mutateElement(() => {
      setStyle(this.element, 'display', 'none');

      // Reading the height is what forces the repaint.  The conditional exists
      // only to workaround the fact that the closure compiler would otherwise
      // think that only reading the height has no effect.  Since the height is
      // always >= 0, this conditional will always be executed.
      const height = this.element./*OK*/offsetHeight;
      if (height >= 0) {
        setStyle(this.element, 'display', '');
      }
    });
  }


  /**
   * Handles all key presses within the story.
   * @param {!Event} e The keydown event.
   * @private
   */
  onKeyDown_(e) {
    if (this.bookend_.isActive()) {
      return;
    }

    switch (e.keyCode) {
      // TODO(newmuis): This will need to be flipped for RTL.
      case KeyCodes.LEFT_ARROW:
        this.previous_();
        break;
      case KeyCodes.RIGHT_ARROW:
        this.next_();
        break;
    }
  }


  /**
   * Handle resize events and set the story's desktop state.
   * @visibleForTesting
   */
  onResize() {
    if (this.isDesktop_()) {
      this.element.setAttribute('desktop','');
      this.element.classList.remove(LANDSCAPE_OVERLAY_CLASS);
      if (!this.topBar_) {
        this.buildTopBar_();
      }
      if (!this.background_) {
        this.background_ = new AmpStoryBackground(this.win, this.element);
        this.background_.attach();
      }
      if (this.activePage_) {
        this.updateBackground_(this.activePage_.element, /* initial */ true);
      }
    } else {
      this.vsync_.run({
        measure: state => {
          const {offsetWidth, offsetHeight} = this.element;
          state.isLandscape = offsetWidth > offsetHeight;
        },
        mutate: state => {
          this.element.classList.toggle(LANDSCAPE_OVERLAY_CLASS,
              state.isLandscape);
          this.element.removeAttribute('desktop');
        },
      }, {});
    }
  }

  /**
   * @return {boolean} True if the screen size matches the desktop media query.
   */
  isDesktop_() {
    return !isExperimentOn(this.win, 'disable-amp-story-desktop') &&
        this.desktopMedia_.matches;
  }

  /**
   * Return right overlay for mobile or desktop
   */
  viewportWarningOverlay_() {
    const platform = Services.platformFor(this.win);

    return (platform.isIos() || platform.isAndroid())
      ? LANDSCAPE_ORIENTATION_WARNING
      : DESKTOP_SIZE_WARNING;
  }

  /**
   * Build overlay for Landscape mode mobile
   */
  buildLandscapeOrientationOverlay_() {
    this.mutateElement(() => {
      this.element.insertBefore(
          renderSimpleTemplate(this.win.document,
              this.viewportWarningOverlay_()),
          this.element.firstChild);
    });
  }

  /**
   * Build overlay for Landscape mode mobile
   */
  buildUnsupportedBrowserOverlay_() {
    this.mutateElement(() => {
      this.element.insertBefore(
          renderSimpleTemplate(this.win.document, UNSUPPORTED_BROWSER_WARNING),
          this.element.firstChild);
    });
  }


  /**
   * Get the URL of the given page's background resource.
   * @param {!Element} pageElement
   * @return {?string} The URL of the background resource
   */
  getBackgroundUrl_(pageElement) {
    let fillElement = pageElement.querySelector(
        '[template="fill"]:not(.i-amphtml-hidden-by-media-query)');

    if (!fillElement) {
      return null;
    }

    fillElement = dev().assertElement(fillElement);

    const fillPosterElement = fillElement.querySelector(
        '[poster]:not(.i-amphtml-hidden-by-media-query)');

    const srcElement = fillElement.querySelector(
        '[src]:not(.i-amphtml-hidden-by-media-query)');

    const fillPoster = fillPosterElement ?
      fillPosterElement.getAttribute('poster') : '';
    const src = srcElement ? srcElement.getAttribute('src') : '';

    return fillPoster || src;
  }


  /**
   * Update the background to the specified page's background.
   * @param {!Element} pageElement
   * @param {boolean=} initial
   */
  updateBackground_(pageElement, initial = false) {
    if (!this.background_) {
      return;
    }

    this.getVsync().run({
      measure: state => {
        state.url = this.getBackgroundUrl_(pageElement);
        state.color = computedStyle(this.win, pageElement)
            .getPropertyValue('background-color');
      },
      mutate: state => {
        this.background_.setBackground(state.color, state.url, initial);
      },
    }, {});
  }


  /**
   * Shows the bookend overlay.
   * @private
   */
  showBookend_() {
    if (this.bookend_.isActive()) {
      return;
    }

    this.buildBookend_().then(() => {
      this.systemLayer_.hideDeveloperLog();

      this.activePage_.pauseCallback();

      this.toggleElementsOnBookend_(/* display */ false);

      this.element.classList.add('i-amphtml-story-bookend-active');

      this.bookend_.show();
    });
  }


  /**
   * Hides the bookend overlay.
   * @private
   */
  hideBookend_() {
    if (!this.bookend_.isActive()) {
      return;
    }

    this.activePage_.resumeCallback();

    this.toggleElementsOnBookend_(/* display */ true);

    this.element.classList.remove('i-amphtml-story-bookend-active');

    this.bookend_.hide();
  }

  /**
   * Toggle content when bookend is opened/closed.
   * @param {boolean} display
   * @private
   */
  toggleElementsOnBookend_(display) {
    if (!this.isDesktop_()) {
      return;
    }

    const elements = scopedQuerySelectorAll(this.element,
        HIDE_ON_BOOKEND_SELECTOR);

    Array.prototype.forEach.call(elements, el => {
      if (display) {
        resetStyles(el, ['opacity', 'transition']);
      } else {
        setImportantStyles(el, {
          opacity: 0,
          transition: 'opacity 0.3s',
        });
      }
    });
  }

  /**
   * @return {!Array<!Array<string>>} A 2D array representing lists of pages by
   *     distance.  The outer array index represents the distance from the
   *     active page; the inner array is a list of page IDs at the specified
   *     distance.
   */
  getPagesByDistance_() {
    const distanceMap = this.getPageDistanceMapHelper_(
        /* distance */ 0, /* map */ {}, this.activePage_.element.id);

    // Transpose the map into a 2D array.
    const pagesByDistance = [];
    Object.keys(distanceMap).forEach(pageId => {
      const distance = distanceMap[pageId];
      if (!pagesByDistance[distance]) {
        pagesByDistance[distance] = [];
      }
      pagesByDistance[distance].push(pageId);
    });

    return pagesByDistance;
  }

  /**
   * Creates a map of a page and all of the pages reachable from that page, by
   * distance.
   *
   * @param {number} distance The distance that the page with the specified
   *     pageId is from the active page.
   * @param {!Object<string, number>} map A mapping from pageId to its distance
   *     from the active page.
   * @param {string} pageId The page to be added to the map.
   * @return {!Object<string, number>} A mapping from page ID to the priority of
   *     that page.
   * @private
   */
  getPageDistanceMapHelper_(distance, map, pageId) {
    if (map[pageId] !== undefined && map[pageId] <= distance) {
      return map;
    }

    map[pageId] = distance;
    const page = this.getPageById(pageId);
    page.getAdjacentPageIds().forEach(adjacentPageId => {
      if (map[adjacentPageId] !== undefined
          && map[adjacentPageId] <= distance) {
        return;
      }

      // TODO(newmuis): Remove the assignment and return, as they're unnecessary.
      map = this.getPageDistanceMapHelper_(distance + 1, map, adjacentPageId);
    });

    return map;
  }


  /** @private */
  preloadPagesByDistance_() {
    const pagesByDistance = this.getPagesByDistance_();

    this.mutateElement(() => {
      pagesByDistance.forEach((pageIds, distance) => {
        pageIds.forEach(pageId => {
          const page = this.getPageById(pageId);
          page.setDistance(distance);
        });
      });
    });
  }


  /**
   * Handles a background-audio attribute set on an <amp-story> tag.
   * @private
   */
  registerAndPreloadBackgroundAudio_() {
    let backgroundAudioEl = upgradeBackgroundAudio(this.element);

    if (!backgroundAudioEl) {
      return;
    }

    // Once the media pool is ready, registers and preloads the background
    // audio, and then gets the swapped element from the DOM to mute/unmute/play
    // it programmatically later.
    this.activePage_.whenLoaded()
        .then(() => {
          backgroundAudioEl =
            /** @type {!HTMLMediaElement} */ (backgroundAudioEl);
          this.mediaPool_.register(backgroundAudioEl);
          return this.mediaPool_.preload(backgroundAudioEl);
        }).then(() => {
          this.backgroundAudioEl_ = /** @type {!HTMLMediaElement} */
              (childElement(this.element, el => {
                return el.tagName.toLowerCase() === 'audio';
              }));
        });
  }


  /**
   * Preloads the bookend config if on the last page.
   * @private
   */
  maybePreloadBookend_() {
    if (!this.activePage_) {
      return;
    }

    const pageIndex = this.getPageIndex(this.activePage_);

    if (pageIndex + 1 >= this.getPageCount()) {
      this.buildBookend_();
    }
  }


  /** @private */
  buildBookend_() {
    if (this.bookend_.isBuilt()) {
      return Promise.resolve();
    }

    this.element.appendChild(this.bookend_.build(this.getAmpDoc()));
    this.setAsOwner(this.bookend_.getRoot());

    return this.loadBookendConfig_().then(bookendConfig => {
      if (bookendConfig !== null) {
        this.bookend_.setConfig(dev().assert(bookendConfig));
      }
      this.scheduleLayout(this.bookend_.getRoot());
    });
  }


  /**
   * @return {!Promise<?./bookend.BookendConfigDef>}
   * @private
   */
  loadBookendConfigImpl_() {
    return this.loadJsonFromAttribute_(BOOKEND_CONFIG_ATTRIBUTE_NAME)
        .then(response => response && {
          shareProviders: response['share-providers'],
          relatedArticles:
              relatedArticlesFromJson(response['related-articles']),
        })
        .catch(e => {
          user().error(TAG, 'Error fetching bookend configuration', e.message);
          return null;
        });
  }


  /**
   * @return {!Promise<boolean>}
   * @private
   */
  hasBookend_() {
    if (!this.storeService_.get(StateProperty.CAN_SHOW_BOOKEND)) {
      return Promise.resolve(false);
    }

    // TODO(newmuis): Change this comment.
    // On mobile there is always a bookend. On desktop, the bookend will only
    // be shown if related articles have been configured.
    if (!this.isDesktop_()) {
      return Promise.resolve(true);
    }
    return this.loadBookendConfig_().then(config =>
      config && config.relatedArticles && config.relatedArticles.length);
  }


  /**
   * @param {string} attributeName
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   * @private
   */
  loadJsonFromAttribute_(attributeName) {
    if (!this.element.hasAttribute(attributeName)) {
      return Promise.resolve(null);
    }

    const rawUrl = this.element.getAttribute(attributeName);
    const opts = {};
    opts.requireAmpResponseSourceOrigin = false;

    return Services.urlReplacementsForDoc(this.getAmpDoc())
        .expandUrlAsync(user().assertString(rawUrl))
        .then(url => Services.xhrFor(this.win).fetchJson(url, opts))
        .then(response => {
          user().assert(response.ok, 'Invalid HTTP response for bookend JSON');
          return response.json();
        });
  }


  /**
   * @param {!Element} el
   * @return {boolean}
   * @private
   */
  isBookend_(el) {
    return this.bookend_.isBuilt() && el === this.bookend_.getRoot();
  }


  /**
   * @param {!Element} el
   * @return {boolean}
   * @private
   */
  isTopBar_(el) {
    return !!this.topBar_ && this.topBar_.contains(el);
  }


  /**
   * @param {string} id The ID of the page whose index should be retrieved.
   * @return {number} The index of the page.
   * @private
   */
  getPageIndexById_(id) {
    const pageIndex = findIndex(this.pages_, page => page.element.id === id);

    if (pageIndex < 0) {
      user().error(TAG,
          `Story refers to page "${id}", but no such page exists.`);
    }

    return pageIndex;
  }


  /**
   * @param {string} id The ID of the page to be retrieved.
   * @return {!./amp-story-page.AmpStoryPage} Retrieves the page with the
   *     specified ID.
   */
  getPageById(id) {
    const pageIndex = this.getPageIndexById_(id);
    return dev().assert(this.pages_[pageIndex],
        `Page at index ${pageIndex} exists, but is missing from the array.`);
  }


  /**
   * @return {number}
   */
  getPageCount() {
    return this.pages_.length - this.adPages_.length;
  }

  /**
   * @param {!./amp-story-page.AmpStoryPage} desiredPage
   * @return {number} The index of the page.
   */
  getPageIndex(desiredPage) {
    return findIndex(this.pages_, page => page === desiredPage);
  }


  /**
   * Retrieves the page containing the element, or null. A background audio
   * set on the <amp-story> tag would not be contained in a page.
   * @param {!Element} element The element whose containing AmpStoryPage should
   *     be retrieved
   * @return {?./amp-story-page.AmpStoryPage} The AmpStoryPage containing the
   *     specified element, if any.
   */
  getPageContainingElement_(element) {
    const pageIndex = findIndex(this.pages_, page => {
      const pageEl = closest(element, el => {
        return el === page.element;
      });

      return !!pageEl;
    });

    return this.pages_[pageIndex] || null;
  }


  /** @override */
  getElementDistance(element) {
    const page = this.getPageContainingElement_(element);

    // An element not contained in a page is likely to be global to the story,
    // like a background audio. Setting the distance to -1 ensures it will not
    // get evicted from the media pool.
    if (!page) {
      return -1;
    }

    return page.getDistance();
  }


  /** @override */
  getMaxMediaElementCounts() {
    let audioMediaElementsCount =
        this.element.querySelectorAll('amp-audio, [background-audio]').length;
    const videoMediaElementsCount =
        this.element.querySelectorAll('amp-video').length;

    // The root element (amp-story) might have a background-audio as well.
    if (this.element.hasAttribute('background-audio')) {
      audioMediaElementsCount++;
    }

    return {
      [MediaType.AUDIO]: Math.min(
          audioMediaElementsCount, MAX_MEDIA_ELEMENT_COUNTS[MediaType.AUDIO]),
      [MediaType.VIDEO]: Math.min(
          videoMediaElementsCount, MAX_MEDIA_ELEMENT_COUNTS[MediaType.VIDEO]),
    };
  }


  /** @override */
  getElement() {
    return this.element;
  }

  /**
   * Mutes the audio for the story.
   * @private
   */
  mute_() {
    if (this.backgroundAudioEl_) {
      this.mediaPool_.mute(this.backgroundAudioEl_);
    }
    this.pages_.forEach(page => {
      page.muteAllMedia();
    });
    this.toggleMutedAttribute_(true);
  }

  /**
   * Unmutes the audio for the story.
   * @private
   */
  unmute_() {
    const unmuteAllMedia = () => {
      if (this.backgroundAudioEl_) {
        this.mediaPool_.unmute(this.backgroundAudioEl_);
        this.mediaPool_.play(this.backgroundAudioEl_);
      }
      this.activePage_.unmuteAllMedia();
    };

    this.mediaPool_.blessAll()
        .then(unmuteAllMedia, unmuteAllMedia);
    this.toggleMutedAttribute_(false);
  }


  /**
   * Reapplies the muting status for the currently-active media in the story.
   */
  reapplyMuting_() {
    const isMuted = this.isMuted_();
    if (!isMuted) {
      this.mute_();
      this.unmute_();
    }
  }


  /**
   * @return {boolean} Whether the story is currently muted.
   * @private
   */
  isMuted_() {
    return this.element.hasAttribute(AUDIO_MUTED_ATTRIBUTE);
  }


  /**
   * Toggles mute or unmute attribute on element.
   * @param {boolean} isMuted
   * @private
   */
  toggleMutedAttribute_(isMuted) {
    if (isMuted) {
      this.element.setAttribute(AUDIO_MUTED_ATTRIBUTE, '');
    } else {
      this.element.removeAttribute(AUDIO_MUTED_ATTRIBUTE);
    }
  }

  /**
   * Shows the audio icon if the story has any media elements or background
   * audio.
   * @private
   */
  updateAudioIcon_() {
    // TODO(#11857): Defer to any playing media element for whether any audio is
    // being played.
    const containsMediaElement = !!this.element.querySelector(
        'amp-audio, amp-video, [background-audio]');
    const hasStoryAudio = this.element.hasAttribute('background-audio');

    if (containsMediaElement || hasStoryAudio) {
      this.audioPlaying_();
    }
  }

  /**
   * Marks the story as having audio playing on the active page.
   * @private
   */
  audioPlaying_() {
    this.element.classList.add('audio-playing');
  }

  /**
   * Marks the story as not having audio playing on the active page.
   * @private
   */
  audioStopped_() {
    this.element.classList.remove('audio-playing');
  }

  /** @private */
  replay_() {
    if (this.bookend_.isActive()) {
      // Dispaching event instead of calling method directly so that all
      // listeners can respond.
      dispatch(this.element, EventType.CLOSE_BOOKEND);
    }
    this.switchTo_(dev().assertElement(this.pages_[0].element).id);
  }

  /** @return {!NavigationState} */
  getNavigationState() {
    return this.navigationState_;
  }


  /**
   * Add page to back of pages_ array
   * @param {!./amp-story-page.AmpStoryPage} page
   */
  addPage(page) {
    this.pages_.push(page);

    if (page.isAd()) {
      this.adPages_.push(page);
    }
  }

  /**
   * Insert a new page in navigation flow by changing the attr pointers
   * on amp-story-page elements
   * @param {string} pageBeforeId
   * @param {string} pageToBeInsertedId
   * @return {boolean} was page inserted
   */
  insertPage(pageBeforeId, pageToBeInsertedId) {
    // TODO(ccordry): make sure this method moves to PageManager when implemented
    const pageToBeInserted = this.getPageById(pageToBeInsertedId);
    const pageToBeInsertedEl = pageToBeInserted.element;

    if (pageToBeInserted.isAd() &&
        !this.storeService_.get(StateProperty.CAN_INSERT_AUTOMATIC_AD)) {
      dev().expectedError(TAG, 'Inserting ads automatically is disallowed.');
      return false;
    }

    const pageBefore = this.getPageById(pageBeforeId);
    const pageBeforeEl = pageBefore.element;

    const nextPage = this.getNextPage(pageBefore);

    if (!nextPage) {
      return false;
    }

    pageBeforeEl.setAttribute(ADVANCE_TO_ATTR, pageToBeInsertedId);
    pageBeforeEl.setAttribute(AUTO_ADVANCE_TO_ATTR, pageToBeInsertedId);
    pageToBeInsertedEl.setAttribute(RETURN_TO_ATTR, pageBeforeId);

    const nextPageEl = nextPage.element;
    const nextPageId = nextPageEl.id;
    pageToBeInsertedEl.setAttribute(ADVANCE_TO_ATTR, nextPageId);
    pageToBeInsertedEl.setAttribute(AUTO_ADVANCE_TO_ATTR, nextPageId);
    nextPageEl.setAttribute(RETURN_TO_ATTR, pageToBeInsertedId);

    return true;
  }


  /**
   * Get next page object
   * @param {!./amp-story-page.AmpStoryPage} page
   * @return {?./amp-story-page.AmpStoryPage}
   */
  getNextPage(page) {
    const nextPageId = page.getNextPageId(true /*opt_isAutomaticAdvance */);
    if (!nextPageId) {
      return null;
    }
    return this.getPageById(nextPageId);
  }


  /**
   * @param {!Window} win
   * @return {boolean} true if the user's browser supports the features needed
   *     for amp-story.
   */
  static isBrowserSupported(win) {
    return win.CSS.supports('display', 'grid');
  }
}


AMP.extension('amp-story', '0.1', AMP => {
  AMP.registerElement('amp-story', AmpStory, CSS);
});
