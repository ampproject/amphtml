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
 * <amp-story standalone>
 *   [...]
 * </amp-story>
 * </code>
 */
import './amp-story-cta-layer';
import './amp-story-grid-layer';
import './amp-story-page';
import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {ActionTrust} from '../../../src/action-constants';
import {AmpStoryAccess} from './amp-story-access';
import {AmpStoryAnalytics} from './analytics';
import {AmpStoryBackground} from './background';
import {AmpStoryBookend} from './bookend/amp-story-bookend';
import {AmpStoryConsent} from './amp-story-consent';
import {AmpStoryCtaLayer} from './amp-story-cta-layer';
import {AmpStoryGridLayer} from './amp-story-grid-layer';
import {AmpStoryHint} from './amp-story-hint';
import {AmpStoryPage, PageState} from './amp-story-page';
import {AmpStoryVariableService} from './variable-service';
import {CSS} from '../../../build/amp-story-1.0.css';
import {CommonSignals} from '../../../src/common-signals';
import {EventType, dispatch} from './events';
import {Gestures} from '../../../src/gesture';
import {InfoDialog} from './amp-story-info-dialog';
import {KeyCodes} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {
  LocalizationService,
  createPseudoLocale,
} from './localization';
import {MediaPool, MediaType} from './media-pool';
import {NavigationState} from './navigation-state';
import {PaginationButtons} from './pagination-buttons';
import {Services} from '../../../src/services';
import {ShareMenu} from './amp-story-share-menu';
import {SwipeXYRecognizer} from '../../../src/gesture-recognizers';
import {SystemLayer} from './amp-story-system-layer';
import {TapNavigationDirection} from './page-advancement';
import {UnsupportedBrowserLayer} from './amp-story-unsupported-browser-layer';
import {ViewportWarningLayer} from './amp-story-viewport-warning-layer';
import {
  childElement,
  childElementByTag,
  childElements,
  closest,
  createElementWithAttributes,
  isRTL,
  scopedQuerySelectorAll,
} from '../../../src/dom';
import {
  computedStyle,
  px,
  resetStyles,
  setImportantStyles,
  toggle,
} from '../../../src/style';
import {debounce} from '../../../src/utils/rate-limit';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {findIndex} from '../../../src/utils/array';
import {getConsentPolicyState} from '../../../src/consent';
import {getDetail} from '../../../src/event-helper';
import {getMode} from '../../../src/mode';
import {getState} from '../../../src/history';
import {isExperimentOn} from '../../../src/experiments';
import {registerServiceBuilder} from '../../../src/service';
import {removeAttributeInMutate, setAttributeInMutate} from './utils';
import {upgradeBackgroundAudio} from './audio';
import LocalizedStringsAr from './_locales/ar';
import LocalizedStringsDe from './_locales/de';
import LocalizedStringsDefault from './_locales/default';
import LocalizedStringsEn from './_locales/en';
import LocalizedStringsEnGb from './_locales/en-GB';
import LocalizedStringsEs from './_locales/es';
import LocalizedStringsEs419 from './_locales/es-419';
import LocalizedStringsFr from './_locales/fr';
import LocalizedStringsFrCa from './_locales/fr-CA';
import LocalizedStringsHi from './_locales/hi';
import LocalizedStringsId from './_locales/id';
import LocalizedStringsIt from './_locales/it';
import LocalizedStringsJa from './_locales/ja';
import LocalizedStringsKo from './_locales/ko';
import LocalizedStringsNl from './_locales/nl';
import LocalizedStringsNo from './_locales/no';
import LocalizedStringsPt from './_locales/pt';
import LocalizedStringsPtBr from './_locales/pt-BR';
import LocalizedStringsRu from './_locales/ru';
import LocalizedStringsTr from './_locales/tr';
import LocalizedStringsVi from './_locales/vi';
import LocalizedStringsZh from './_locales/zh';
import LocalizedStringsZhTw from './_locales/zh-TW';

/** @private @const {number} */
const DESKTOP_WIDTH_THRESHOLD = 1024;

/** @private @const {number} */
const DESKTOP_HEIGHT_THRESHOLD = 550;

/** @private @const {number} */
const MIN_SWIPE_FOR_HINT_OVERLAY_PX = 50;

/** @enum {string} */
const Attributes = {
  STANDALONE: 'standalone',
  ADVANCE_TO: 'i-amphtml-advance-to',
  RETURN_TO: 'i-amphtml-return-to',
  AUTO_ADVANCE_TO: 'auto-advance-to',
  AD_SHOWING: 'ad-showing',
  // Attributes that desktop css looks for to decide where pages will be placed
  PREVIOUS: 'i-amphtml-previous-page', // shown in left pane
  NEXT: 'i-amphtml-next-page', // shown in right pane
  VISITED: 'i-amphtml-visited', // stacked offscreen to left
};

/**
 * The duration of time (in milliseconds) to wait for a page to be loaded,
 * before the story becomes visible.
 * @const {number}
 */
const PAGE_LOAD_TIMEOUT_MS = 5000;

/**
 * Single page ads may be injected later. If the original story contains 0 media
 * elements the mediaPool will not be able to handle the injected audio/video
 * Therefore we preallocate a minimum here.
 * @const {number}
 */
const MINIMUM_AD_MEDIA_ELEMENTS = 2;

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

/** @type {string} */
const TAG = 'amp-story';

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

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @private {!NavigationState} */
    this.navigationState_ =
        new NavigationState(this.win, () => this.hasBookend_());

    /** @private {!AmpStoryAnalytics} */
    this.analytics_ = new AmpStoryAnalytics(this.win, this.element);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();

    /** @private {?AmpStoryBookend} */
    this.bookend_ = null;

    /** @private @const {!ShareMenu} Preloads and prerenders the share menu. */
    this.shareMenu_ = new ShareMenu(this.win, this.element);

    /** @private @const {!SystemLayer} */
    this.systemLayer_ = new SystemLayer(this.win, this.element);

    /** @private @const {!UnsupportedBrowserLayer} */
    this.unsupportedBrowserLayer_ = new UnsupportedBrowserLayer(this.win);

    /** Instantiates the viewport warning layer. */
    new ViewportWarningLayer(this.win, this.element);

    /** @private @const {!Array<!./amp-story-page.AmpStoryPage>} */
    this.pages_ = [];

    /** @private @const {!Array<!./amp-story-page.AmpStoryPage>} */
    this.adPages_ = [];

    /** @const @private {!AmpStoryVariableService} */
    this.variableService_ = new AmpStoryVariableService();
    registerServiceBuilder(
        this.win, 'story-variable', () => this.variableService_.get());

    /** @private {?./amp-story-page.AmpStoryPage} */
    this.activePage_ = null;

    /** @private {?./amp-story-page.AmpStoryPage} */
    this.previousPage_ = null;

    /** @private {?./amp-story-page.AmpStoryPage} */
    this.nextPage_ = null;

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

    /** @private {!AmpStoryHint} */
    this.ampStoryHint_ = new AmpStoryHint(this.win, this.element);

    /** @private {!MediaPool} */
    this.mediaPool_ = MediaPool.for(this);

    /** @private {boolean} */
    this.areAccessAuthorizationsCompleted_ = false;

    /** @private */
    this.navigateToPageAfterAccess_ = null;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win);

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win);

    /** @private @const {!../../../src/service/document-state.DocumentState} */
    this.documentState_ = Services.documentStateFor(this.win);

    /** @private {boolean} */
    this.pausedStateToRestore_ = false;

    /** @private {?Element} */
    this.sidebar_ = null;

    /** @private {?MutationObserver} */
    this.sidebarObserver_ = null;

    /** @private @const {!LocalizationService} */
    this.localizationService_ = new LocalizationService(this.win);
    this.localizationService_
        .registerLocalizedStringBundle('default', LocalizedStringsDefault)
        .registerLocalizedStringBundle('ar', LocalizedStringsAr)
        .registerLocalizedStringBundle('de', LocalizedStringsDe)
        .registerLocalizedStringBundle('en', LocalizedStringsEn)
        .registerLocalizedStringBundle('en-GB', LocalizedStringsEnGb)
        .registerLocalizedStringBundle('es', LocalizedStringsEs)
        .registerLocalizedStringBundle('es-419', LocalizedStringsEs419)
        .registerLocalizedStringBundle('fr', LocalizedStringsFr)
        .registerLocalizedStringBundle('fr-CA', LocalizedStringsFrCa)
        .registerLocalizedStringBundle('hi', LocalizedStringsHi)
        .registerLocalizedStringBundle('id', LocalizedStringsId)
        .registerLocalizedStringBundle('it', LocalizedStringsIt)
        .registerLocalizedStringBundle('ja', LocalizedStringsJa)
        .registerLocalizedStringBundle('ko', LocalizedStringsKo)
        .registerLocalizedStringBundle('nl', LocalizedStringsNl)
        .registerLocalizedStringBundle('no', LocalizedStringsNo)
        .registerLocalizedStringBundle('pt', LocalizedStringsPt)
        .registerLocalizedStringBundle('pt-BR', LocalizedStringsPtBr)
        .registerLocalizedStringBundle('ru', LocalizedStringsRu)
        .registerLocalizedStringBundle('tr', LocalizedStringsTr)
        .registerLocalizedStringBundle('vi', LocalizedStringsVi)
        .registerLocalizedStringBundle('zh', LocalizedStringsZh)
        .registerLocalizedStringBundle('zh-TW', LocalizedStringsZhTw);

    const enXaPseudoLocaleBundle =
        createPseudoLocale(LocalizedStringsEn, s => `[${s} one two]`);
    this.localizationService_
        .registerLocalizedStringBundle('en-xa', enXaPseudoLocaleBundle);

    registerServiceBuilder(this.win, 'localization',
        () => this.localizationService_);
  }


  /** @override */
  buildCallback() {
    if (this.isStandalone_()) {
      this.initializeStandaloneStory_();
    }

    // Check if story is RTL.
    if (isRTL(this.win.document)) {
      this.storeService_.dispatch(Action.TOGGLE_RTL, true);
    }

    const pageEl = this.element.querySelector('amp-story-page');
    pageEl && pageEl.setAttribute('active', '');

    this.initializeStyles_();
    this.initializeListeners_();
    this.initializeListenersForDev_();

    if (this.isDesktop_()) {
      const uiState =
          isExperimentOn(this.win, 'amp-story-scroll') ?
            UIType.SCROLL : UIType.DESKTOP;
      this.storeService_.dispatch(Action.TOGGLE_UI, uiState);
    }

    this.navigationState_.observe(stateChangeEvent => {
      this.variableService_.onNavigationStateChange(stateChangeEvent);
      this.analytics_.onNavigationStateChange(stateChangeEvent);
    });

    // Removes title in order to prevent incorrect titles appearing on link
    // hover. (See 17654)
    this.element.removeAttribute('title');

    // Disallow all actions in a (standalone) story.
    // Components then add their own actions.
    const actions = Services.actionServiceForDoc(this.getAmpDoc());
    actions.clearWhitelist();
  }


  /** @override */
  pauseCallback() {
    // Store the current paused state, to make sure the story does not play on
    // resume if it was previously paused.
    this.pausedStateToRestore_ = !!this.storeService_
        .get(StateProperty.PAUSED_STATE);
    this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
  }


  /** @override */
  resumeCallback() {
    this.storeService_
        .dispatch(Action.TOGGLE_PAUSED, this.pausedStateToRestore_);
  }


  /**
   * Note: runs in the buildCallback vsync mutate context.
   * @private
   */
  initializeStandaloneStory_() {
    const html = this.win.document.documentElement;
    html.classList.add('i-amphtml-story-standalone');
    // Lock body to prevent overflow.
    this.lockBody_();
    // Standalone CSS affects sizing of the entire page.
    this.onResize();
  }


  /** @private */
  initializeStyles_() {
    const styleEl = document.querySelector('style[amp-custom]');
    if (!styleEl) {
      return;
    }

    this.rewriteStyles_(styleEl);
  }


  /**
   * @param {!Element} styleEl
   * @private
   */
  rewriteStyles_(styleEl) {
    if (!isExperimentOn(this.win, 'amp-story-responsive-units')) {
      return;
    }

    // TODO(#15955): Update this to use CssContext from
    // ../../../extensions/amp-animation/0.1/web-animations.js
    this.mutateElement(() => {
      styleEl.textContent = styleEl.textContent
          .replace(/([\d.]+)vh/gmi, 'calc($1 * var(--i-amphtml-story-vh))')
          .replace(/([\d.]+)vw/gmi, 'calc($1 * var(--i-amphtml-story-vw))')
          .replace(/([\d.]+)vmin/gmi, 'calc($1 * var(--i-amphtml-story-vmin))')
          .replace(/([\d.]+)vmax/gmi, 'calc($1 * var(--i-amphtml-story-vmax))');
    });
  }


  /**
   * @private
   */
  updateViewportSizeStyles_() {
    if (!this.activePage_) {
      return;
    }

    this.vsync_.run({
      measure: state => {
        state.vh = this.activePage_.element./*OK*/clientHeight / 100;
        state.vw = this.activePage_.element./*OK*/clientWidth / 100;
        state.vmin = Math.min(state.vh, state.vw);
        state.vmax = Math.max(state.vh, state.vw);
      },
      mutate: state => {
        this.element.setAttribute('style',
            `--i-amphtml-story-vh: ${px(state.vh)};` +
            `--i-amphtml-story-vw: ${px(state.vw)};` +
            `--i-amphtml-story-vmin: ${px(state.vmin)};` +
            `--i-amphtml-story-vmax: ${px(state.vmax)};`);
      },
    }, {});
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

  /** @private */
  initializeListeners_() {
    this.element.addEventListener(EventType.NEXT_PAGE, () => {
      this.next_();
    });

    this.element.addEventListener(EventType.PREVIOUS_PAGE, () => {
      this.previous_();
    });

    this.storeService_.subscribe(StateProperty.MUTED_STATE, isMuted => {
      this.onMutedStateUpdate_(isMuted);
      this.variableService_.onMutedStateChange(isMuted);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.MUTED_STATE, isMuted => {
      // We do not want to trigger an analytics event for the initialization of
      // the muted state.
      this.analytics_.onMutedStateChange(isMuted);
    }, false /** callToInitialize */);

    this.storeService_.subscribe(
        StateProperty.SUPPORTED_BROWSER_STATE, isBrowserSupported => {
          this.onSupportedBrowserStateUpdate_(isBrowserSupported);
        });

    this.element.addEventListener(EventType.SWITCH_PAGE, e => {
      if (this.storeService_.get(StateProperty.BOOKEND_STATE)) {
        // Disallow switching pages while the bookend is active.
        return;
      }

      this.switchTo_(getDetail(e)['targetPageId']);
      this.ampStoryHint_.hideAllNavigationHint();
    });

    this.element.addEventListener(EventType.PAGE_PROGRESS, e => {
      const detail = getDetail(e);
      const pageId = detail['pageId'];
      const progress = detail['progress'];

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
      const direction = getDetail(e)['direction'];
      this.performTapNavigation_(direction);
    });

    this.element.addEventListener(EventType.DISPATCH_ACTION, e => {
      if (!getMode().test) {
        return;
      }

      const action = getDetail(e)['action'];
      const data = getDetail(e)['data'];
      this.storeService_.dispatch(action, data);
    });

    this.storeService_.subscribe(StateProperty.AD_STATE, isAd => {
      this.onAdStateUpdate_(isAd);
    });

    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, isActive => {
      this.onBookendStateUpdate_(isActive);
    });

    this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, pageId => {
      this.onCurrentPageIdUpdate_(pageId);
    });

    this.storeService_.subscribe(StateProperty.PAUSED_STATE, isPaused => {
      this.onPausedStateUpdate_(isPaused);
    });

    this.storeService_.subscribe(StateProperty.SIDEBAR_STATE, sidebarState => {
      this.onSidebarStateUpdate_(sidebarState);
    });

    this.storeService_.subscribe(StateProperty.UI_STATE, uiState => {
      this.onUIStateUpdate_(uiState);
    }, true /** callToInitialize */);

    this.win.document.addEventListener('keydown', e => {
      this.onKeyDown_(e);
    }, true);

    // TODO(#16795): Remove once the runtime triggers pause/resume callbacks
    // on document visibility change (eg: user switches tab).
    this.documentState_.onVisibilityChanged(() => this.onVisibilityChanged_());

    this.getViewport().onResize(debounce(this.win, () => this.onResize(), 300));
    this.installGestureRecognizers_();
  }

  /** @private */
  installGestureRecognizers_() {
    const {element} = this;
    const gestures = Gestures.get(element, /* shouldNotPreventDefault */ true);

    // Shows "tap to navigate" hint when swiping.
    gestures.onGesture(SwipeXYRecognizer, gesture => {
      const {deltaX, deltaY} = gesture.data;
      if (this.storeService_.get(StateProperty.BOOKEND_STATE) ||
          this.storeService_.get(StateProperty.ACCESS_STATE)) {
        return;
      }
      if (!this.isSwipeLargeEnoughForHint_(deltaX, deltaY)) {
        return;
      }
      if (!this.storeService_
          .get(StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT)) {
        return;
      }

      this.ampStoryHint_.showNavigationOverlay();
    });
  }

  /**
   * @param {number} deltaX
   * @param {number} deltaY
   * @return {boolean}
   * @private
   */
  isSwipeLargeEnoughForHint_(deltaX, deltaY) {
    const sideSwipe = Math.abs(deltaX) >= MIN_SWIPE_FOR_HINT_OVERLAY_PX;
    const upSwipe = (-1 * deltaY) >= MIN_SWIPE_FOR_HINT_OVERLAY_PX;
    return sideSwipe || upSwipe;
  }

  /** @private */
  initializeListenersForDev_() {
    if (!getMode().development) {
      return;
    }

    this.element.addEventListener(EventType.DEV_LOG_ENTRIES_AVAILABLE, e => {
      this.systemLayer_.logAll(/** @type {?} */ (getDetail(e)));
    });
  }

  /** @private */
  lockBody_() {
    const {document} = this.win;
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
    const {screen} = this.win;
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
    this.paginationButtons_ = PaginationButtons.create(this.win);

    this.paginationButtons_.attach(this.element);

    this.navigationState_.observe(e =>
      this.paginationButtons_.onNavigationStateChange(e));
  }

  /** @visibleForTesting */
  buildPaginationButtonsForTesting() {
    this.buildPaginationButtons_();
  }

  /** @override */
  layoutCallback() {
    if (!AmpStory.isBrowserSupported(this.win) && !this.platform_.isBot()) {
      this.storeService_.dispatch(Action.TOGGLE_SUPPORTED_BROWSER, false);
      return Promise.resolve();
    }
    return this.layoutStory_();
  }

  /**
   * Renders the layout for the story
   * @return {!Promise} A promise that is resolved when the story layout is
   *       loaded
   * @private
   */
  layoutStory_() {
    const firstPageEl = user().assertElement(
        this.element.querySelector('amp-story-page'),
        'Story must have at least one page.');

    const initialPageId = this.getHistoryStatePageId_() || firstPageEl.id;

    if (!this.paginationButtons_) {
      this.buildPaginationButtons_();
    }

    this.initializeBookend_();
    this.initializeSidebar_();

    const storyLayoutPromise = this.initializePages_()
        .then(() => this.buildSystemLayer_())
        .then(() => {
          this.pages_.forEach((page, index) => {
            page.setState(PageState.NOT_ACTIVE);
            this.upgradeCtaAnchorTagsForTracking_(page, index);
          });
        })
        .then(() => this.switchTo_(initialPageId))
        .then(() => this.updateViewportSizeStyles_())
        .then(() => {
          // Preloads and prerenders the share menu if mobile, where the share
          // button is visible.
          const uiState = this.storeService_.get(StateProperty.UI_STATE);
          if (uiState === UIType.MOBILE) {
            this.shareMenu_.build();
          }

          const infoDialog = Services.viewerForDoc(this.element).isEmbedded() ?
            new InfoDialog(this.win, this.element) : null;
          if (infoDialog) {
            infoDialog.build();
          }
        });

    // Do not block the layout callback on the completion of these promises, as
    // that prevents descendents from being laid out (and therefore loaded).
    storyLayoutPromise.then(() => this.whenPagesLoaded_(PAGE_LOAD_TIMEOUT_MS))
        .then(() => this.markStoryAsLoaded_());

    this.handleConsentExtension_();
    this.initializeStoryAccess_();

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
        pagesToWaitFor.filter(page => !!page).map(page => page.whenLoaded()));

    return this.timer_.timeoutPromise(timeoutMs, storyLoadPromise)
        .catch(() => {});
  }


  /** @private */
  markStoryAsLoaded_() {
    dispatch(this.win, this.element, EventType.STORY_LOADED,
        /* payload */ undefined, {bubbles: true});
    this.signals().signal(CommonSignals.INI_LOAD);
    this.mutateElement(() => {
      this.element.classList.add(STORY_LOADED_CLASS_NAME);
    });
  }


  /**
   * Handles the story consent extension.
   * @private
   */
  handleConsentExtension_() {
    const consentEl = this.element.querySelector('amp-consent');
    if (!consentEl) {
      return;
    }

    this.pauseStoryUntilConsentIsResolved_();
    this.validateConsent_(consentEl);
  }


  /**
   * Pauses the story until the consent is resolved (accepted or rejected).
   * @private
   */
  pauseStoryUntilConsentIsResolved_() {
    const policyId = this.getConsentPolicy() || 'default';
    const consentPromise = getConsentPolicyState(this.getAmpDoc(), policyId);

    if (!consentPromise) {
      return;
    }

    this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

    consentPromise.then(() => {
      this.storeService_.dispatch(Action.TOGGLE_PAUSED, false);
    });
  }


  /**
   * Ensures publishers using amp-consent use amp-story-consent.
   * @param {!Element} consentEl
   * @private
   */
  validateConsent_(consentEl) {
    if (!childElementByTag(consentEl, 'amp-story-consent')) {
      dev().error(TAG, 'amp-consent must have an amp-story-consent child');
    }

    const allowedTags = ['SCRIPT', 'AMP-STORY-CONSENT'];
    const toRemoveChildren = childElements(
        consentEl, el => allowedTags.indexOf(el.tagName) === -1);

    if (toRemoveChildren.length === 0) {
      return;
    }
    dev().error(TAG, `amp-consent only allows tags: ${allowedTags}`);
    toRemoveChildren.forEach(el => consentEl.removeChild(el));
  }

  /**
   * @private
   */
  initializeStoryAccess_() {
    Services.accessServiceForDocOrNull(this.getAmpDoc()).then(accessService => {
      if (!accessService) {
        return;
      }

      this.areAccessAuthorizationsCompleted_ =
          accessService.areFirstAuthorizationsCompleted();
      accessService.onApplyAuthorizations(
          () => this.onAccessApplyAuthorizations_());
    });
  }


  /**
   * On amp-access document reauthorization, maybe hide the access UI, and maybe
   * perform navigation.
   * @private
   */
  onAccessApplyAuthorizations_() {
    this.areAccessAuthorizationsCompleted_ = true;

    const nextPage = this.navigateToPageAfterAccess_;

    // Step out if the next page is still hidden by the access extension.
    if (nextPage && nextPage.element.hasAttribute('amp-access-hide')) {
      return;
    }

    if (nextPage) {
      this.navigateToPageAfterAccess_ = null;
      this.switchTo_(nextPage.element.id);
    }

    this.storeService_.dispatch(Action.TOGGLE_ACCESS, false);
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
    if (activePage.element.hasAttribute(Attributes.ADVANCE_TO) ||
        activePage !== lastPage) {
      activePage.next(opt_isAutomaticAdvance);
    } else {
      this.hasBookend_().then(hasBookend => {
        if (hasBookend) {
          this.showBookend_();
        }
      });
    }
  }


  /**
   * Go back to the previous screen in the story, if there is one.
   * @private
   */
  previous_() {
    const activePage = dev().assert(this.activePage_,
        'No active page set when navigating to previous page.');
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
  switchTo_(targetPageId) {
    const targetPage = this.getPageById(targetPageId);
    const pageIndex = this.getPageIndex(targetPage);

    // Step out if trying to navigate to the currently active page.
    if (this.activePage_ && (this.activePage_.element.id === targetPageId)) {
      return Promise.resolve();
    }

    // If the next page might be paywall protected, and the access
    // authorizations did not resolve yet, wait before navigating.
    // TODO(gmajoulet): implement a loading state.
    if (targetPage.element.hasAttribute('amp-access') &&
        !this.areAccessAuthorizationsCompleted_) {
      this.navigateToPageAfterAccess_ = targetPage;
      return Promise.resolve();
    }

    // If the next page is paywall protected, display the access UI and wait for
    // the document to be reauthorized.
    if (targetPage.element.hasAttribute('amp-access-hide')) {
      this.storeService_.dispatch(Action.TOGGLE_ACCESS, true);
      this.navigateToPageAfterAccess_ = targetPage;
      return Promise.resolve();
    }

    const oldPage = this.activePage_;
    this.activePage_ = targetPage;

    // Each step will run in a requestAnimationFrame, and wait for the next
    // frame before executing the following step.
    const steps = [
      // First step contains the minimum amount of code to display and play the
      // target page as fast as possible.
      () => {
        oldPage && oldPage.element.removeAttribute('active');

        // Starts playing the page, if the story is not paused.
        // Note: navigation is prevented when the story is paused, this test
        // covers the case where the story is rendered paused (eg: consent).
        if (!this.storeService_.get(StateProperty.PAUSED_STATE)) {
          targetPage.setState(PageState.ACTIVE);
        }

        this.forceRepaintForSafari_();
      },
      // Second step does all the operations that impact the UI/UX: media sound,
      // progress bar, ...
      () => {
        if (oldPage) {
          oldPage.setState(PageState.NOT_ACTIVE);

          // Indication that this should be offscreen to left in desktop view.
          setAttributeInMutate(oldPage, Attributes.VISITED);
        }

        this.storeService_.dispatch(Action.CHANGE_PAGE, {
          id: targetPageId,
          index: pageIndex,
        });

        if (targetPage.isAd()) {
          this.storeService_.dispatch(Action.TOGGLE_AD, true);
          setAttributeInMutate(this, Attributes.AD_SHOWING);
        } else {
          this.storeService_.dispatch(Action.TOGGLE_AD, false);
          removeAttributeInMutate(this, Attributes.AD_SHOWING);
        }

        // TODO(alanorozco): check if autoplay
        this.navigationState_.updateActivePage(
            pageIndex,
            this.getPageCount(),
            targetPage.element.id,
            targetPage.getNextPageId() === null /* isFinalPage */
        );

        // If first navigation.
        if (!oldPage) {
          this.registerAndPreloadBackgroundAudio_();
        }

        if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
          oldPage && oldPage.muteAllMedia();
          this.activePage_.unmuteAllMedia();
        }

        this.handlePreviewAttributes_(targetPage);

        this.updateBackground_(targetPage.element, /* initial */ !oldPage);
      },
      // Third and last step contains all the actions that can be delayed after
      // the navigation happened, like preloading the following pages, or
      // sending analytics events.
      () => {
        this.preloadPagesByDistance_();
        this.maybePreloadBookend_();

        this.triggerActiveEventForPage_();

        this.systemLayer_.resetDeveloperLogs();
        this.systemLayer_
            .setDeveloperLogContextString(this.activePage_.element.id);
      },
    ];

    return new Promise(resolve => {
      targetPage.beforeVisible().then(() => {
        // Recursively executes one step per frame.
        const unqueueStepInRAF = () => {
          steps.shift().call(this);
          if (!steps.length) {
            return resolve();
          }
          this.win.requestAnimationFrame(() => unqueueStepInRAF());
        };

        unqueueStepInRAF();
      });
    });
  }


  /**
   * Clear existing preview attributes, Check to see if there is a next or
   * previous page, set new attributes.
   * @param {!./amp-story-page.AmpStoryPage} targetPage
   * @private
   */
  handlePreviewAttributes_(targetPage) {
    if (this.previousPage_) {
      removeAttributeInMutate(this.previousPage_, Attributes.PREVIOUS);
      this.previousPage_ = null;
    }

    if (this.nextPage_) {
      removeAttributeInMutate(this.nextPage_, Attributes.NEXT);
      this.nextPage_ = null;
    }

    const prevPageId = targetPage.getPreviousPageId();
    if (prevPageId) {
      this.previousPage_ = this.getPageById(prevPageId);
      setAttributeInMutate(this.previousPage_, Attributes.PREVIOUS);
    }

    const nextPageId = targetPage.getNextPageId(
        /* opt_isAutomaticAdvance */ false);
    if (nextPageId) {
      this.nextPage_ = this.getPageById(nextPageId);
      setAttributeInMutate(this.nextPage_, Attributes.NEXT);
    }
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
    if (!this.platform_.isSafari() && !this.platform_.isIos()) {
      return;
    }
    if (this.isDesktop_()) {
      // Force repaint is only needed when transitioning from invisible to
      // visible
      return;
    }

    this.mutateElement(() => {
      toggle(this.element, false);

      // Reading the height is what forces the repaint.  The conditional exists
      // only to workaround the fact that the closure compiler would otherwise
      // think that only reading the height has no effect.  Since the height is
      // always >= 0, this conditional will always be executed.
      const height = this.element./*OK*/offsetHeight;
      if (height >= 0) {
        toggle(this.element, true);
      }
    });
  }


  /**
   * Handles all key presses within the story.
   * @param {!Event} e The keydown event.
   * @private
   */
  onKeyDown_(e) {
    if (this.storeService_.get(StateProperty.BOOKEND_STATE)) {
      return;
    }

    const rtlState = this.storeService_.get(StateProperty.RTL_STATE);

    switch (e.keyCode) {
      case KeyCodes.LEFT_ARROW:
        rtlState ? this.next_() : this.previous_();
        break;
      case KeyCodes.RIGHT_ARROW:
        rtlState ? this.previous_() : this.next_();
        break;
    }
  }


  /**
   * @param {string} pageId new current page id
   * @private
   * */
  onCurrentPageIdUpdate_(pageId) {
    this.setHistoryStatePageId_(pageId);
  }


  /**
   * Save page id using history API.
   * @param {string} pageId page id to be saved
   * @private
   */
  setHistoryStatePageId_(pageId) {
    // Never save ad pages to history as they are unique to each visit.
    const page = this.getPageById(pageId);
    if (page.isAd()) {
      return;
    }

    const {history} = this.win;
    if (history.replaceState && this.getHistoryStatePageId_() !== pageId) {
      history.replaceState({
        ampStoryPageId: pageId,
      }, '');
    }
  }


  /**
   * @private
   * @return {?string}
   */
  getHistoryStatePageId_() {
    const state = getState(this.win.history);
    return state ? state.ampStoryPageId : null;
  }


  /**
   * Handle resize events and set the story's desktop state.
   * @visibleForTesting
   */
  onResize() {
    this.updateViewportSizeStyles_();

    let uiState = UIType.MOBILE;

    if (this.isDesktop_()) {
      uiState = isExperimentOn(this.win, 'amp-story-scroll') ?
        UIType.SCROLL : UIType.DESKTOP;
    }

    this.storeService_.dispatch(Action.TOGGLE_UI, uiState);

    if (uiState !== UIType.MOBILE) {
      this.storeService_.dispatch(Action.TOGGLE_LANDSCAPE, false);
      return;
    }

    // On mobile, maybe display the landscape overlay warning.
    this.vsync_.run({
      measure: state => {
        const {offsetWidth, offsetHeight} = this.element;
        state.isLandscape = offsetWidth > offsetHeight;
      },
      mutate: state => {
        this.storeService_.dispatch(Action.TOGGLE_LANDSCAPE, state.isLandscape);
      },
    }, {});
  }

  /**
   * Reacts to the browser tab becoming active/inactive.
   * @private
   */
  onVisibilityChanged_() {
    this.documentState_.isHidden() ?
      this.pauseCallback() :
      this.resumeCallback();
  }

  /**
   * Reacts to the ad state updates, and pauses the background-audio when an ad
   * is displayed.
   * @param {boolean} isAd
   * @private
   */
  onAdStateUpdate_(isAd) {
    if (this.storeService_.get(StateProperty.MUTED_STATE)) {
      return;
    }

    isAd ? this.pauseBackgroundAudio_() : this.playBackgroundAudio_();
  }

  /**
   * Reacts to UI state updates.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.vsync_.mutate(() => {
      this.element.removeAttribute('desktop');
      this.element.removeAttribute('scroll');
    });

    switch (uiState) {
      case UIType.MOBILE:
        // Preloads and prerenders the share menu as the share button gets
        // visible on the mobile UI. No-op if already built.
        this.shareMenu_.build();
        break;
      case UIType.DESKTOP:
        this.vsync_.mutate(() => {
          this.element.setAttribute('desktop', '');
        });
        if (!this.background_) {
          this.background_ = new AmpStoryBackground(this.win, this.element);
          this.background_.attach();
        }
        if (this.activePage_) {
          this.updateBackground_(this.activePage_.element, /* initial */ true);
        }
        break;
      case UIType.SCROLL:
        this.vsync_.mutate(() => {
          this.element.setAttribute('scroll', '');
        });
        break;
    }
  }

  /**
   * @return {boolean} True if the screen size matches the desktop media query.
   */
  isDesktop_() {
    return this.desktopMedia_.matches && !this.platform_.isBot() &&
        !isExperimentOn(this.win, 'disable-amp-story-desktop');
  }

  /**
   * @return {boolean} true if this is a standalone story (i.e. this story is
   *     the only content of the document).
   */
  isStandalone_() {
    return this.element.hasAttribute(Attributes.STANDALONE);
  }

  /**
   * Reacts to paused state updates.
   * @param {boolean} isPaused
   * @private
   */
  onPausedStateUpdate_(isPaused) {
    if (!this.activePage_) {
      return;
    }

    const pageState = isPaused ? PageState.PAUSED : PageState.ACTIVE;
    this.activePage_.setState(pageState);
  }

  /**
   * Reacts to sidebar state updates.
   * @param {boolean} sidebarState
   * @private
   */
  onSidebarStateUpdate_(sidebarState) {
    const actions = Services.actionServiceForDoc(this.getAmpDoc());
    if (this.win.MutationObserver) {
      if (!this.sidebarObserver_) {
        this.sidebarObserver_ = new this.win.MutationObserver(mutationsList => {
          if (mutationsList.some(
              mutation => mutation.attributeName === 'open')) {
            this.storeService_.dispatch(Action.TOGGLE_SIDEBAR,
                this.sidebar_.hasAttribute('open'));
          }
        });
      }
      if (this.sidebar_ && sidebarState) {
        this.sidebarObserver_.observe(this.sidebar_, {attributes: true});
        actions.execute(this.sidebar_, 'open', /* args */ null,
        /* source */ null, /* caller */ null, /* event */ null,
            ActionTrust.HIGH);
      } else {
        this.sidebarObserver_.disconnect();
      }
    } else if (this.sidebar_ && sidebarState) {
      actions.execute(this.sidebar_, 'open', /* args */ null,
          /* source */ null, /* caller */ null, /* event */ null,
          ActionTrust.HIGH);
      this.storeService_.dispatch(Action.TOGGLE_SIDEBAR, false);
    }
  }

  /**
   * If browser is supported, displays the story. Otherwise, shows either the
   * default unsupported browser layer or the publisher fallback (if provided).
   * @param {boolean} isBrowserSupported
   * @private
   */
  onSupportedBrowserStateUpdate_(isBrowserSupported) {
    const fallbackEl = this.getFallback();
    if (isBrowserSupported) {
      // Removes the default unsupported browser layer or throws an error
      // if the publisher has provided their own fallback
      if (fallbackEl) {
        dev().error(TAG, 'No handler to exit unsupported browser state on ' +
        'publisher provided fallback.');
      } else {
        this.layoutStory_().then(() => this.mutateElement(() => {
          this.unsupportedBrowserLayer_.removeLayer();
          this.element.classList.remove('i-amphtml-story-fallback');
        }));

      }
    } else {
      this.mutateElement(() => {
        this.element.classList.add('i-amphtml-story-fallback');
      });
      // Displays the publisher provided fallback or fallbacks to the default
      // unsupported browser layer.
      if (fallbackEl) {
        this.toggleFallback(true);
      } else {
        this.unsupportedBrowserLayer_.build();
        this.mutateElement(() => {
          this.element.appendChild(this.unsupportedBrowserLayer_.get());
        });
      }
    }
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
    this.buildAndPreloadBookend_().then(() => {
      this.storeService_.dispatch(Action.TOGGLE_BOOKEND, true);
    });
  }


  /**
   * Hides the bookend overlay.
   * @private
   */
  hideBookend_() {
    this.storeService_.dispatch(Action.TOGGLE_BOOKEND, false);
  }


  /**
   * @param {boolean} isActive
   * @private
   */
  onBookendStateUpdate_(isActive) {
    this.toggleElementsOnBookend_(/* display */ isActive);
    this.element.classList.toggle('i-amphtml-story-bookend-active', isActive);

    if (isActive) {
      this.systemLayer_.hideDeveloperLog();
      this.activePage_.setState(PageState.PAUSED);
    }

    if (!isActive) {
      this.activePage_.setState(PageState.ACTIVE);
    }
  }


  /**
   * Toggle content when bookend is opened/closed.
   * TODO(gmajoulet): these elements should get hidden by listening to bookend
   *                  state events.
   * @param {boolean} isActive
   * @private
   */
  toggleElementsOnBookend_(isActive) {
    if (!this.isDesktop_()) {
      return;
    }

    const elements = scopedQuerySelectorAll(this.element,
        HIDE_ON_BOOKEND_SELECTOR);

    Array.prototype.forEach.call(elements, el => {
      if (isActive) {
        setImportantStyles(el, {
          opacity: 0,
          transition: 'opacity 0.1s',
        });
      } else {
        resetStyles(el, ['opacity', 'transition']);
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

      // TODO(newmuis): Remove the assignment and return, as they're
      // unnecessary.
      map = this.getPageDistanceMapHelper_(distance + 1, map, adjacentPageId);
    });

    return map;
  }


  /** @private */
  preloadPagesByDistance_() {
    if (this.platform_.isBot()) {
      this.pages_.forEach(page => {
        page.setDistance(0);
      });
      return;
    }

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
   * Initializes bookend.
   * @private
   */
  initializeBookend_() {
    let bookendEl = this.element.querySelector('amp-story-bookend');
    if (!bookendEl) {
      bookendEl = createElementWithAttributes(this.win.document,
          'amp-story-bookend', dict({'layout': 'nodisplay'}));
      this.element.appendChild(bookendEl);
    }

    bookendEl.getImpl().then(
        bookendImpl => {
          this.bookend_ = bookendImpl;
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
      this.buildAndPreloadBookend_();
    }
  }


  /**
   * Builds, fetches and sets the bookend publisher configuration.
   * @return {!Promise<?./bookend/bookend-component.BookendDataDef>}
   * @private
   */
  buildAndPreloadBookend_() {
    this.bookend_.build();
    return this.bookend_.loadConfigAndMaybeRenderBookend();
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

    return this.bookend_
        .loadConfigAndMaybeRenderBookend(false /** renderBookend */).then(
            config => !!(config && config.components &&
              config.components.length > 0));
  }


  /**
   * @param {string} id The ID of the page whose index should be retrieved.
   * @return {number} The index of the page.
   */
  getPageIndexById(id) {
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
    const pageIndex = this.getPageIndexById(id);
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
          audioMediaElementsCount + MINIMUM_AD_MEDIA_ELEMENTS,
          MAX_MEDIA_ELEMENT_COUNTS[MediaType.AUDIO]),
      [MediaType.VIDEO]: Math.min(
          videoMediaElementsCount + MINIMUM_AD_MEDIA_ELEMENTS,
          MAX_MEDIA_ELEMENT_COUNTS[MediaType.VIDEO]),
    };
  }


  /** @override */
  getElement() {
    return this.element;
  }

  /**
   * Reacts to muted state updates.
   * @param  {boolean} isMuted Whether the story just got muted.
   * @private
   */
  onMutedStateUpdate_(isMuted) {
    isMuted ? this.mute_() : this.unmute_();
  }

  /**
   * Mutes the audio for the story.
   * @private
   */
  mute_() {
    this.pauseBackgroundAudio_();
    if (this.activePage_) {
      this.activePage_.muteAllMedia();
    }
  }

  /**
   * Pauses the background audio.
   * @private
   */
  pauseBackgroundAudio_() {
    if (!this.backgroundAudioEl_) {
      return;
    }
    this.mediaPool_.pause(this.backgroundAudioEl_);
  }

  /**
   * Unmutes the audio for the story.
   * @private
   */
  unmute_() {
    const unmuteAllMedia = () => {
      this.playBackgroundAudio_();
      if (this.activePage_) {
        this.activePage_.unmuteAllMedia();
      }
    };

    this.mediaPool_.blessAll()
        .then(unmuteAllMedia, unmuteAllMedia);
  }

  /**
   * Unmutes and plays the background audio.
   * @private
   */
  playBackgroundAudio_() {
    if (!this.backgroundAudioEl_) {
      return;
    }
    this.mediaPool_.unmute(this.backgroundAudioEl_);
    this.mediaPool_.play(this.backgroundAudioEl_);
  }

  /**
   * Shows the audio icon if the story has any media elements containing audio,
   * or background audio at the story or page level.
   * @private
   */
  updateAudioIcon_() {
    const containsMediaElementWithAudio = !!this.element.querySelector(
        'amp-audio, amp-video:not([noaudio]), [background-audio]');
    const hasStoryAudio = this.element.hasAttribute('background-audio');

    this.storeService_.dispatch(Action.TOGGLE_STORY_HAS_AUDIO,
        containsMediaElementWithAudio || hasStoryAudio);
  }

  /**
   * Checks for the presence of a sidebar. If a sidebar does exist, then an icon
   * permitting for the opening/closing of the sidebar is shown.
   * @private
   */
  initializeSidebar_() {
    this.sidebar_ = this.element.querySelector('amp-sidebar');
    if (!this.sidebar_) {
      return;
    }
    this.storeService_.dispatch(Action.TOGGLE_HAS_SIDEBAR,
        !!this.sidebar_);
    const actions = Services.actionServiceForDoc(this.getAmpDoc());
    actions.addToWhitelist('AMP-SIDEBAR', 'open');
    actions.addToWhitelist('AMP-SIDEBAR', 'close');
    actions.addToWhitelist('AMP-SIDEBAR', 'toggle');
  }

  /** @private */
  replay_() {
    if (this.storeService_.get(StateProperty.BOOKEND_STATE)) {
      this.hideBookend_();
    }
    const switchPromise = this.switchTo_(
        dev().assertElement(this.pages_[0].element).id);

    // Reset all pages so that they are offscreen to right instead of left in
    // desktop view.
    switchPromise.then((() => {
      this.pages_.forEach(page =>
        removeAttributeInMutate(page, Attributes.VISITED));
    }));
  }


  /**
   * @param {!AmpStoryPage} page The page whose CTA anchor tags should be
   *     upgraded.
   * @param {number} pageIndex The index of the page.
   * @private
   */
  upgradeCtaAnchorTagsForTracking_(page, pageIndex) {
    this.mutateElement(() => {
      const pageId = page.element.id;
      const ctaAnchorEls =
          scopedQuerySelectorAll(page.element, 'amp-story-cta-layer a');

      Array.prototype.forEach.call(ctaAnchorEls, ctaAnchorEl => {
        ctaAnchorEl.setAttribute('data-vars-story-page-id', pageId);
        ctaAnchorEl.setAttribute('data-vars-story-page-index', pageIndex);
      });
    });
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
    // TODO(ccordry): make sure this method moves to PageManager when
    // implemented
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

    pageBeforeEl.setAttribute(Attributes.ADVANCE_TO, pageToBeInsertedId);
    pageBeforeEl.setAttribute(Attributes.AUTO_ADVANCE_TO, pageToBeInsertedId);
    pageToBeInsertedEl.setAttribute(Attributes.RETURN_TO, pageBeforeId);

    const nextPageEl = nextPage.element;
    const nextPageId = nextPageEl.id;
    pageToBeInsertedEl.setAttribute(Attributes.ADVANCE_TO, nextPageId);
    pageToBeInsertedEl.setAttribute(Attributes.AUTO_ADVANCE_TO, nextPageId);
    nextPageEl.setAttribute(Attributes.RETURN_TO, pageToBeInsertedId);

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
    return Boolean(win.CSS && win.CSS.supports &&
    win.CSS.supports('display', 'grid'));
  }
}

AMP.extension('amp-story', '1.0', AMP => {
  AMP.registerElement('amp-story', AmpStory, CSS);
  AMP.registerElement('amp-story-access', AmpStoryAccess);
  AMP.registerElement('amp-story-bookend', AmpStoryBookend);
  AMP.registerElement('amp-story-consent', AmpStoryConsent);
  AMP.registerElement('amp-story-cta-layer', AmpStoryCtaLayer);
  AMP.registerElement('amp-story-grid-layer', AmpStoryGridLayer);
  AMP.registerElement('amp-story-page', AmpStoryPage);
});
