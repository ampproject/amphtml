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
  EmbeddedComponentState,
  InteractiveComponentDef,
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {ActionTrust} from '../../../src/action-constants';
import {AdvancementConfig, TapNavigationDirection} from './page-advancement';
import {
  AdvancementMode,
  StoryAnalyticsEvent,
  getAnalyticsService,
} from './story-analytics';
import {AmpEvents} from '../../../src/amp-events';
import {AmpStoryAccess} from './amp-story-access';
import {AmpStoryBookend} from './bookend/amp-story-bookend';
import {AmpStoryConsent} from './amp-story-consent';
import {AmpStoryCtaLayer} from './amp-story-cta-layer';
import {AmpStoryEmbeddedComponent} from './amp-story-embedded-component';
import {AmpStoryGridLayer} from './amp-story-grid-layer';
import {AmpStoryHint} from './amp-story-hint';
import {AmpStoryInteractiveBinaryPoll} from './amp-story-interactive-binary-poll';
import {AmpStoryInteractivePoll} from './amp-story-interactive-poll';
import {AmpStoryInteractiveQuiz} from './amp-story-interactive-quiz';
import {AmpStoryInteractiveResults} from './amp-story-interactive-results';
import {AmpStoryPage, NavigationDirection, PageState} from './amp-story-page';
import {AmpStoryPageAttachment} from './amp-story-page-attachment';
import {AmpStoryRenderService} from './amp-story-render-service';
import {AmpStoryViewerMessagingHandler} from './amp-story-viewer-messaging-handler';
import {AnalyticsVariable, getVariableService} from './variable-service';
import {CSS} from '../../../build/amp-story-1.0.css';
import {CommonSignals} from '../../../src/common-signals';
import {EventType, dispatch} from './events';
import {Gestures} from '../../../src/gesture';
import {HistoryState, getHistoryState, setHistoryState} from './history';
import {InfoDialog} from './amp-story-info-dialog';
import {Keys} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {LiveStoryManager} from './live-story-manager';
import {MediaPool, MediaType} from './media-pool';
import {PaginationButtons} from './pagination-buttons';
import {Services} from '../../../src/services';
import {ShareMenu} from './amp-story-share-menu';
import {SwipeXYRecognizer} from '../../../src/gesture-recognizers';
import {SystemLayer} from './amp-story-system-layer';
import {UnsupportedBrowserLayer} from './amp-story-unsupported-browser-layer';
import {ViewportWarningLayer} from './amp-story-viewport-warning-layer';
import {
  childElement,
  childElementByTag,
  childElements,
  childNodes,
  closest,
  createElementWithAttributes,
  isRTL,
  scopedQuerySelector,
  scopedQuerySelectorAll,
  whenUpgradedToCustomElement,
} from '../../../src/dom';
import {
  computedStyle,
  resetStyles,
  setImportantStyles,
  toggle,
} from '../../../src/style';
import {createPseudoLocale} from '../../../src/localized-strings';
import {debounce} from '../../../src/utils/rate-limit';
import {dev, devAssert, user} from '../../../src/log';
import {dict, map} from '../../../src/utils/object';
import {endsWith} from '../../../src/string';
import {escapeCssSelectorIdent} from '../../../src/css';
import {findIndex, lastItem} from '../../../src/utils/array';
import {getConsentPolicyState} from '../../../src/consent';
import {getDetail} from '../../../src/event-helper';
import {getLocalizationService} from './amp-story-localization-service';
import {getMediaQueryService} from './amp-story-media-query-service';
import {getMode} from '../../../src/mode';
import {getState} from '../../../src/history';
import {isExperimentOn} from '../../../src/experiments';
import {parseQueryString} from '../../../src/url';
import {
  removeAttributeInMutate,
  setAttributeInMutate,
  shouldShowStoryUrlInfo,
} from './utils';
import {toArray} from '../../../src/types';
import {upgradeBackgroundAudio} from './audio';
import LocalizedStringsAr from './_locales/ar';
import LocalizedStringsDe from './_locales/de';
import LocalizedStringsDefault from './_locales/default';
import LocalizedStringsEn from './_locales/en';
import LocalizedStringsEnGb from './_locales/en-GB';
import LocalizedStringsEs from './_locales/es';
import LocalizedStringsEs419 from './_locales/es-419';
import LocalizedStringsFr from './_locales/fr';
import LocalizedStringsHi from './_locales/hi';
import LocalizedStringsId from './_locales/id';
import LocalizedStringsIt from './_locales/it';
import LocalizedStringsJa from './_locales/ja';
import LocalizedStringsKo from './_locales/ko';
import LocalizedStringsNl from './_locales/nl';
import LocalizedStringsNo from './_locales/no';
import LocalizedStringsPtBr from './_locales/pt-BR';
import LocalizedStringsPtPt from './_locales/pt-PT';
import LocalizedStringsRu from './_locales/ru';
import LocalizedStringsTr from './_locales/tr';
import LocalizedStringsVi from './_locales/vi';
import LocalizedStringsZhCn from './_locales/zh-CN';
import LocalizedStringsZhTw from './_locales/zh-TW';

/** @private @const {number} */
const DESKTOP_WIDTH_THRESHOLD = 1024;

/** @private @const {number} */
const DESKTOP_HEIGHT_THRESHOLD = 550;

/** @private @const {number} */
const MIN_SWIPE_FOR_HINT_OVERLAY_PX = 50;

/** @enum {string} */
const Attributes = {
  AD_SHOWING: 'ad-showing',
  ADVANCE_TO: 'i-amphtml-advance-to',
  AUTO_ADVANCE_AFTER: 'auto-advance-after',
  AUTO_ADVANCE_TO: 'auto-advance-to',
  DESKTOP_POSITION: 'i-amphtml-desktop-position',
  MUTED: 'muted',
  ORIENTATION: 'orientation',
  PUBLIC_ADVANCE_TO: 'advance-to',
  RETURN_TO: 'i-amphtml-return-to',
  STANDALONE: 'standalone',
  SUPPORTS_LANDSCAPE: 'supports-landscape',
  // Attributes that desktop css looks for to decide where pages will be placed
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

/**
 * CSS class for the opacity layer that separates the amp-sidebar and the rest
 * of the story when the amp-sidebar is entering the screen.
 * @const {string}
 */
const OPACITY_MASK_CLASS_NAME = 'i-amphtml-story-opacity-mask';

/**
 * CSS class for sidebars in stories.
 * @const {string}
 */
const SIDEBAR_CLASS_NAME = 'i-amphtml-story-sidebar';

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
 * The default dark gray for chrome supported theme color.
 * @const {string}
 */
const DEFAULT_THEME_COLOR = '#202125';

/**
 * MutationObserverInit options to listen for changes to the `open` attribute.
 */
const SIDEBAR_OBSERVER_OPTIONS = {
  attributes: true,
  attributeFilter: ['open'],
};

/**
 * @implements {./media-pool.MediaPoolRoot}
 */
export class AmpStory extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    // Check if story is RTL.
    if (isRTL(this.win.document)) {
      this.storeService_.dispatch(Action.TOGGLE_RTL, true);
    }

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win, this.element);

    /** @private @const {!AdvancementConfig} */
    this.advancement_ = AdvancementConfig.forElement(this.win, this.element);
    this.advancement_.start();

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();

    /** @private {?AmpStoryBookend} */
    this.bookend_ = null;

    /** @private @const {!ShareMenu} Preloads and prerenders the share menu. */
    this.shareMenu_ = new ShareMenu(this.win, this.element);

    /** @private @const {!SystemLayer} */
    this.systemLayer_ = new SystemLayer(this.win, this.element);

    /** Instantiate in case there are embedded components. */
    new AmpStoryEmbeddedComponent(this.win, this.element);

    /** @private @const {!UnsupportedBrowserLayer} */
    this.unsupportedBrowserLayer_ = new UnsupportedBrowserLayer(this.win);

    /** Instantiates the viewport warning layer. */
    new ViewportWarningLayer(
      this.win,
      this.element,
      DESKTOP_WIDTH_THRESHOLD,
      DESKTOP_HEIGHT_THRESHOLD
    );

    /** @private {!Array<!./amp-story-page.AmpStoryPage>} */
    this.pages_ = [];

    /** @private @const {!Array<!./amp-story-page.AmpStoryPage>} */
    this.adPages_ = [];

    /** @const @private {!./variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(this.win);

    /** @private {?./amp-story-page.AmpStoryPage} */
    this.activePage_ = null;

    /** @private @const */
    this.desktopMedia_ = this.win.matchMedia(
      `(min-width: ${DESKTOP_WIDTH_THRESHOLD}px) and ` +
        `(min-height: ${DESKTOP_HEIGHT_THRESHOLD}px)`
    );

    /** @private @const */
    this.canRotateToDesktopMedia_ = this.win.matchMedia(
      `(min-width: ${DESKTOP_HEIGHT_THRESHOLD}px) and ` +
        `(min-height: ${DESKTOP_WIDTH_THRESHOLD}px)`
    );

    /** @private @const */
    this.landscapeOrientationMedia_ = this.win.matchMedia(
      '(orientation: landscape)'
    );

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

    /** @private @const {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.element);

    /** @private @const {?AmpStoryViewerMessagingHandler} */
    this.viewerMessagingHandler_ = this.viewer_.isEmbedded()
      ? new AmpStoryViewerMessagingHandler(this.win, this.viewer_)
      : null;

    /**
     * Store the current paused state, to make sure the story does not play on
     * resume if it was previously paused.
     * @private {boolean}
     */
    this.pausedStateToRestore_ = false;

    /** @private {?Element} */
    this.sidebar_ = null;

    /** @private {?MutationObserver} */
    this.sidebarObserver_ = null;

    /** @private {?Element} */
    this.maskElement_ = null;

    /** @private {?LiveStoryManager} */
    this.liveStoryManager_ = null;

    /** @private @const {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = getLocalizationService(this.element);

    this.localizationService_
      .registerLocalizedStringBundle('default', LocalizedStringsDefault)
      .registerLocalizedStringBundle('ar', LocalizedStringsAr)
      .registerLocalizedStringBundle('de', LocalizedStringsDe)
      .registerLocalizedStringBundle('en', LocalizedStringsEn)
      .registerLocalizedStringBundle('en-GB', LocalizedStringsEnGb)
      .registerLocalizedStringBundle('es', LocalizedStringsEs)
      .registerLocalizedStringBundle('es-419', LocalizedStringsEs419)
      .registerLocalizedStringBundle('fr', LocalizedStringsFr)
      .registerLocalizedStringBundle('hi', LocalizedStringsHi)
      .registerLocalizedStringBundle('id', LocalizedStringsId)
      .registerLocalizedStringBundle('it', LocalizedStringsIt)
      .registerLocalizedStringBundle('ja', LocalizedStringsJa)
      .registerLocalizedStringBundle('ko', LocalizedStringsKo)
      .registerLocalizedStringBundle('nl', LocalizedStringsNl)
      .registerLocalizedStringBundle('no', LocalizedStringsNo)
      .registerLocalizedStringBundle('pt-PT', LocalizedStringsPtPt)
      .registerLocalizedStringBundle('pt-BR', LocalizedStringsPtBr)
      .registerLocalizedStringBundle('ru', LocalizedStringsRu)
      .registerLocalizedStringBundle('tr', LocalizedStringsTr)
      .registerLocalizedStringBundle('vi', LocalizedStringsVi)
      .registerLocalizedStringBundle('zh-CN', LocalizedStringsZhCn)
      .registerLocalizedStringBundle('zh-TW', LocalizedStringsZhTw);

    const enXaPseudoLocaleBundle = createPseudoLocale(
      LocalizedStringsEn,
      (s) => `[${s} one two]`
    );
    this.localizationService_.registerLocalizedStringBundle(
      'en-xa',
      enXaPseudoLocaleBundle
    );
  }

  /** @override */
  buildCallback() {
    if (this.isStandalone_()) {
      this.initializeStandaloneStory_();
    }

    // buildCallback already runs in a mutate context. Calling another
    // mutateElement explicitly will force the runtime to remeasure the
    // amp-story element, fixing rendering bugs where the story is inactive
    // (layoutCallback not called) when accessed from any viewer using
    // prerendering, because of a height incorrectly set to 0.
    this.mutateElement(() => {});

    const pageEl = this.element.querySelector('amp-story-page');
    pageEl && pageEl.setAttribute('active', '');

    this.initializeStyles_();
    this.initializeListeners_();
    this.initializeListenersForDev_();
    this.initializePageIds_();
    this.initializeInteractiveComponents_();
    this.initializeStoryPlayer_();

    this.storeService_.dispatch(Action.TOGGLE_UI, this.getUIType_());

    // Disables the bookend entirely if the story is within a group of stories.
    if (this.viewer_.hasCapability('swipe')) {
      this.storeService_.dispatch(Action.TOGGLE_CAN_SHOW_BOOKEND, false);
    }

    // Removes title in order to prevent incorrect titles appearing on link
    // hover. (See 17654)
    if (!this.platform_.isBot()) {
      this.element.removeAttribute('title');
    }

    // Remove text nodes which would be shown outside of the amp-story
    const textNodes = childNodes(
      this.element,
      (node) => node.nodeType === Node.TEXT_NODE
    );
    textNodes.forEach((node) => {
      this.element.removeChild(node);
    });

    if (isExperimentOn(this.win, 'amp-story-branching')) {
      this.registerAction('goToPage', (invocation) => {
        const {args} = invocation;
        if (!args) {
          return;
        }
        this.storeService_.dispatch(
          Action.SET_ADVANCEMENT_MODE,
          AdvancementMode.GO_TO_PAGE
        );
        // If open, closes the sidebar before navigating.
        const promise = this.storeService_.get(StateProperty.SIDEBAR_STATE)
          ? Services.historyForDoc(this.getAmpDoc()).goBack()
          : Promise.resolve();
        promise.then(() =>
          this.switchTo_(args['id'], NavigationDirection.NEXT)
        );
      });
    }
  }

  /**
   * Pauses the whole story on viewer visibilityState updates, or tab visibility
   * updates.
   * @private
   */
  pause_() {
    this.pausedStateToRestore_ = !!this.storeService_.get(
      StateProperty.PAUSED_STATE
    );
    this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
    if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
      this.pauseBackgroundAudio_();
    }
  }

  /**
   * Resumes the whole story on viewer visibilityState updates, or tab
   * visibility updates.
   * @private
   */
  resume_() {
    this.storeService_.dispatch(
      Action.TOGGLE_PAUSED,
      this.pausedStateToRestore_
    );
    if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
      this.playBackgroundAudio_();
    }
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
    const mediaQueryEls = this.element.querySelectorAll('media-query');

    if (mediaQueryEls.length) {
      this.initializeMediaQueries_(mediaQueryEls);
    }

    const styleEl = this.win.document.querySelector('style[amp-custom]');

    if (styleEl) {
      this.rewriteStyles_(styleEl);
    }
  }

  /**
   * Registers the media queries
   * @param {!NodeList<!Element>} mediaQueryEls
   * @private
   */
  initializeMediaQueries_(mediaQueryEls) {
    const service = getMediaQueryService(this.win);

    const onMediaQueryMatch = (matches, className) => {
      this.mutateElement(() => {
        this.element.classList.toggle(className, matches);
      });
    };

    toArray(mediaQueryEls).forEach((el) => {
      const className = el.getAttribute('class-name');
      const media = el.getAttribute('media');

      if (className && media) {
        service.onMediaQueryMatch(media, (matches) =>
          onMediaQueryMatch(matches, className)
        );
      }
    });
  }

  /**
   * Initializes page ids by deduplicating them.
   * @private
   */
  initializePageIds_() {
    const pageEls = this.element.querySelectorAll('amp-story-page');
    const pageIds = toArray(pageEls).map((el) => el.id || 'default-page');
    const idsMap = map();
    for (let i = 0; i < pageIds.length; i++) {
      if (idsMap[pageIds[i]] === undefined) {
        idsMap[pageIds[i]] = 0;
        continue;
      }
      user().error(TAG, `Duplicate amp-story-page ID ${pageIds[i]}`);
      const newId = `${pageIds[i]}__${++idsMap[pageIds[i]]}`;
      pageEls[i].id = newId;
      pageIds[i] = newId;
    }
    this.storeService_.dispatch(Action.SET_PAGE_IDS, pageIds);
  }

  /**
   * Initializes interactives by deduplicating their IDs and calling initializeState().
   * @private
   */
  initializeInteractiveComponents_() {
    const interactiveEls = this.element.querySelectorAll(
      'amp-story-interactive-binary-poll, amp-story-interactive-poll, amp-story-interactive-quiz'
    );
    const interactiveIds = toArray(interactiveEls).map(
      (el) => el.id || 'interactive-id'
    );
    const idsMap = map();
    for (let i = 0; i < interactiveIds.length; i++) {
      if (idsMap[interactiveIds[i]] === undefined) {
        idsMap[interactiveIds[i]] = 0;
        continue;
      }
      user().error(TAG, `Duplicate interactive ID ${interactiveIds[i]}`);
      const newId = `${interactiveIds[i]}__${++idsMap[interactiveIds[i]]}`;
      interactiveEls[i].id = newId;
      interactiveIds[i] = newId;
      whenUpgradedToCustomElement(interactiveEls[i]).then((el) => {
        el.getImpl().then((e) => e.initializeState());
      });
    }
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
        .replace(/(-?[\d.]+)vh/gim, 'calc($1 * var(--story-page-vh))')
        .replace(/(-?[\d.]+)vw/gim, 'calc($1 * var(--story-page-vw))')
        .replace(/(-?[\d.]+)vmin/gim, 'calc($1 * var(--story-page-vmin))')
        .replace(/(-?[\d.]+)vmax/gim, 'calc($1 * var(--story-page-vmax))');
    });
  }

  /**
   * @private
   */
  setThemeColor_() {
    // Don't override the publisher's tag.
    if (this.win.document.querySelector('meta[name=theme-color]')) {
      return;
    }
    // The theme color should be copied from the story's primary accent color
    // if possible, with the fall back being default dark gray.
    const meta = this.win.document.createElement('meta');
    const ampStoryPageEl = this.element.querySelector('amp-story-page');
    meta.name = 'theme-color';
    meta.content =
      computedStyle(this.win, this.element).getPropertyValue(
        '--primary-color'
      ) ||
      computedStyle(
        this.win,
        dev().assertElement(ampStoryPageEl)
      ).getPropertyValue('background-color') ||
      DEFAULT_THEME_COLOR;
    this.win.document.head.appendChild(meta);
  }

  /**
   * Builds the system layer DOM.
   * @param {string} initialPageId
   * @private
   */
  buildSystemLayer_(initialPageId) {
    this.updateAudioIcon_();
    this.updatePausedIcon_();
    this.element.appendChild(this.systemLayer_.build(initialPageId));
  }

  /** @private */
  initializeListeners_() {
    this.element.addEventListener(EventType.NEXT_PAGE, () => {
      this.next_();
    });

    this.element.addEventListener(EventType.PREVIOUS_PAGE, () => {
      this.previous_();
    });

    this.storeService_.subscribe(
      StateProperty.MUTED_STATE,
      (isMuted) => {
        this.onMutedStateUpdate_(isMuted);
        this.variableService_.onVariableUpdate(
          AnalyticsVariable.STORY_IS_MUTED,
          isMuted
        );
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.MUTED_STATE,
      (isMuted) => {
        // We do not want to trigger an analytics event for the initialization of
        // the muted state.
        this.analyticsService_.triggerEvent(
          isMuted
            ? StoryAnalyticsEvent.STORY_MUTED
            : StoryAnalyticsEvent.STORY_UNMUTED
        );
      },
      false /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.SUPPORTED_BROWSER_STATE,
      (isBrowserSupported) => {
        this.onSupportedBrowserStateUpdate_(isBrowserSupported);
      }
    );

    this.storeService_.subscribe(StateProperty.ADVANCEMENT_MODE, (mode) => {
      this.variableService_.onVariableUpdate(
        AnalyticsVariable.STORY_ADVANCEMENT_MODE,
        mode
      );
    });

    this.element.addEventListener(EventType.SWITCH_PAGE, (e) => {
      if (this.storeService_.get(StateProperty.BOOKEND_STATE)) {
        // Disallow switching pages while the bookend is active.
        return;
      }

      this.switchTo_(getDetail(e)['targetPageId'], getDetail(e)['direction']);
      this.ampStoryHint_.hideAllNavigationHint();
    });

    this.element.addEventListener(EventType.PAGE_PROGRESS, (e) => {
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

    this.element.addEventListener(EventType.NO_NEXT_PAGE, () => {
      this.onNoNextPage_();
    });

    this.element.addEventListener(EventType.NO_PREVIOUS_PAGE, () => {
      this.onNoPreviousPage_();
    });

    this.advancement_.addOnTapNavigationListener((direction) => {
      this.performTapNavigation_(direction);
    });

    this.element.addEventListener(EventType.DISPATCH_ACTION, (e) => {
      if (!getMode().test) {
        return;
      }

      const action = getDetail(e)['action'];
      const data = getDetail(e)['data'];
      this.storeService_.dispatch(action, data);
    });

    // Actions allowlist could be initialized empty, or with some actions some
    // other components registered.
    this.storeService_.subscribe(
      StateProperty.ACTIONS_ALLOWLIST,
      (actionsAllowlist) => {
        const actions = Services.actionServiceForDoc(this.element);
        actions.setAllowlist(actionsAllowlist);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(StateProperty.AD_STATE, (isAd) => {
      this.onAdStateUpdate_(isAd);
    });

    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, (isActive) => {
      this.onBookendStateUpdate_(isActive);
    });

    this.storeService_.subscribe(StateProperty.PAUSED_STATE, (isPaused) => {
      this.onPausedStateUpdate_(isPaused);
    });

    this.storeService_.subscribe(
      StateProperty.SIDEBAR_STATE,
      (sidebarState) => {
        this.onSidebarStateUpdate_(sidebarState);
      }
    );

    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    this.win.document.addEventListener(
      'keydown',
      (e) => {
        this.onKeyDown_(e);
      },
      true
    );

    this.win.document.addEventListener('contextmenu', (e) => {
      const uiState = this.storeService_.get(StateProperty.UI_STATE);
      if (uiState === UIType.MOBILE) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    this.getAmpDoc().onVisibilityChanged(() => this.onVisibilityChanged_());

    this.win.addEventListener('hashchange', () => {
      const maybePageId = parseQueryString(this.win.location.hash)['page'];
      if (!maybePageId || !this.isActualPage_(maybePageId)) {
        return;
      }
      this.switchTo_(maybePageId, NavigationDirection.NEXT);
      // Removes the page 'hash' parameter from the URL.
      let href = this.win.location.href.replace(
        new RegExp(`page=${maybePageId}&?`),
        ''
      );
      if (endsWith(href, '#')) {
        href = href.slice(0, -1);
      }
      this.win.history.replaceState(
        (this.win.history && getState(this.win.history)) || {} /** data */,
        this.win.document.title /** title */,
        href /** URL */
      );
    });

    this.getViewport().onResize(debounce(this.win, () => this.onResize(), 300));
    this.installGestureRecognizers_();

    // TODO(gmajoulet): migrate this to amp-story-viewer-messaging-handler once
    // there is a way to navigate to pages that does not involve using private
    // amp-story methods.
    this.viewer_.onMessage('selectPage', (data) => this.onSelectPage_(data));

    if (this.viewerMessagingHandler_) {
      this.viewerMessagingHandler_.startListening();
    }
  }

  /** @private */
  installGestureRecognizers_() {
    // If the story is within a viewer that enabled the swipe capability, this
    // disables the navigation education overlay to enable:
    //   - horizontal swipe events to the next story
    //   - vertical swipe events to close the viewer, or open a page attachment
    if (this.viewer_.hasCapability('swipe')) {
      return;
    }

    const {element} = this;
    const gestures = Gestures.get(element, /* shouldNotPreventDefault */ true);

    // Shows "tap to navigate" hint when swiping.
    gestures.onGesture(SwipeXYRecognizer, (gesture) => {
      const {deltaX, deltaY} = gesture.data;
      const embedComponent = /** @type {InteractiveComponentDef} */ (this.storeService_.get(
        StateProperty.INTERACTIVE_COMPONENT_STATE
      ));
      // TODO(enriqe): Move to a separate file if this keeps growing.
      if (
        this.storeService_.get(StateProperty.BOOKEND_STATE) ||
        embedComponent.state !== EmbeddedComponentState.HIDDEN ||
        this.storeService_.get(StateProperty.ACCESS_STATE) ||
        this.storeService_.get(StateProperty.SIDEBAR_STATE) ||
        !this.storeService_.get(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE) ||
        !this.storeService_.get(StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT)
      ) {
        // Cancels the event for this gesture entirely, ensuring the hint won't
        // show even if the user keeps swiping without releasing the touch.
        if (gesture.event && gesture.event.cancelable !== false) {
          gesture.event.preventDefault();
        }
        return;
      }
      if (
        (gesture.event && gesture.event.defaultPrevented) ||
        !this.isSwipeLargeEnoughForHint_(deltaX, deltaY)
      ) {
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
    const upSwipe = -1 * deltaY >= MIN_SWIPE_FOR_HINT_OVERLAY_PX;
    return sideSwipe || upSwipe;
  }

  /** @private */
  initializeListenersForDev_() {
    if (!getMode().development) {
      return;
    }

    this.element.addEventListener(EventType.DEV_LOG_ENTRIES_AVAILABLE, (e) => {
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

    const lockOrientation =
      screen.lockOrientation ||
      screen.mozLockOrientation ||
      screen.msLockOrientation ||
      ((unusedOrientation) => {});

    try {
      lockOrientation('portrait');
    } catch (e) {
      dev().warn(TAG, 'Failed to lock screen orientation:', e.message);
    }
  }

  /** @private */
  buildPaginationButtons_() {
    if (
      this.paginationButtons_ ||
      !this.storeService_.get(StateProperty.CAN_SHOW_PAGINATION_BUTTONS)
    ) {
      return;
    }

    // TODO(#19768): Avoid passing a private function here.
    this.paginationButtons_ = PaginationButtons.create(this, () =>
      this.hasBookend_()
    );

    this.paginationButtons_.attach(this.element);
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
   * Renders the layout for the story.
   * @return {!Promise} A promise that is resolved when the story layout is
   *       loaded
   * @private
   */
  layoutStory_() {
    const firstPageEl = user().assertElement(
      this.element.querySelector('amp-story-page'),
      'Story must have at least one page.'
    );
    const initialPageId = this.getInitialPageId_(firstPageEl);

    this.buildSystemLayer_(initialPageId);
    this.initializeSidebar_();
    this.setThemeColor_();

    const storyLayoutPromise = Promise.all([
      this.getAmpDoc().whenFirstVisible(), // Pauses execution during prerender.
      this.initializePages_(),
    ])
      .then(() => {
        this.handleConsentExtension_();
        this.initializeStoryAccess_();

        this.pages_.forEach((page, index) => {
          page.setState(PageState.NOT_ACTIVE);
          this.upgradeCtaAnchorTagsForTracking_(page, index);
        });
        this.initializeStoryNavigationPath_();
      })
      .then(() => this.initializeBookend_())
      .then(() => {
        const bookendInHistory = !!getHistoryState(
          this.win,
          HistoryState.BOOKEND_ACTIVE
        );
        if (bookendInHistory) {
          return this.hasBookend_().then((hasBookend) => {
            if (hasBookend) {
              return this.showBookend_();
            }
          });
        }
      })
      .then(() => this.switchTo_(initialPageId, NavigationDirection.NEXT))
      .then(() => {
        const shouldReOpenAttachmentForPageId = getHistoryState(
          this.win,
          HistoryState.ATTACHMENT_PAGE_ID
        );

        if (shouldReOpenAttachmentForPageId === this.activePage_.element.id) {
          this.activePage_.openAttachment(false /** shouldAnimate */);
        }

        // Preloads and prerenders the share menu.
        this.shareMenu_.build();

        const infoDialog = shouldShowStoryUrlInfo(this.viewer_)
          ? new InfoDialog(this.win, this.element)
          : null;
        if (infoDialog) {
          infoDialog.build();
        }
      });

    // Do not block the layout callback on the completion of these promises, as
    // that prevents descendents from being laid out (and therefore loaded).
    storyLayoutPromise
      .then(() => this.whenPagesLoaded_(PAGE_LOAD_TIMEOUT_MS))
      .then(() => {
        this.markStoryAsLoaded_();
        this.initializeLiveStory_();
      });

    this.maybeLoadStoryEducation_();

    // Story is being prerendered: resolve the layoutCallback when the first
    // page is built. Other pages will only build if the document becomes
    // visible.
    if (!this.getAmpDoc().hasBeenVisible()) {
      return whenUpgradedToCustomElement(firstPageEl).then(() => {
        return firstPageEl.whenBuilt();
      });
    }

    // Will resolve when all pages are built.
    return storyLayoutPromise;
  }

  /**
   * Initialize LiveStoryManager if this is a live story.
   * @private
   */
  initializeLiveStory_() {
    if (this.element.hasAttribute('live-story')) {
      this.liveStoryManager_ = new LiveStoryManager(this);
      this.liveStoryManager_.build();

      this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, [
        {tagOrTarget: 'AMP-LIVE-LIST', method: 'update'},
      ]);

      this.element.addEventListener(AmpEvents.DOM_UPDATE, () => {
        this.liveStoryManager_.update();
        this.initializePages_().then(() => {
          this.preloadPagesByDistance_();
          if (
            this.storeService_.get(StateProperty.UI_STATE) ===
            UIType.DESKTOP_PANELS
          ) {
            this.setDesktopPositionAttributes_(this.activePage_);
          }
        });
      });
    }
  }

  /**
   * Retrieves the initial pageId to begin the story with. In order, the
   * initial page for a story should be either a valid page ID in the URL
   * fragment, the page ID in the history, or the first page of the story.
   * @param {!Element} firstPageEl
   * @return {string}
   * @private
   */
  getInitialPageId_(firstPageEl) {
    const maybePageId = parseQueryString(this.win.location.hash)['page'];
    if (maybePageId && this.isActualPage_(maybePageId)) {
      return maybePageId;
    }

    const pages = /**  @type {!Array} */ (getHistoryState(
      this.win,
      HistoryState.NAVIGATION_PATH
    ) || []);
    const historyPage = lastItem(pages);
    if (historyPage && this.isActualPage_(historyPage)) {
      return historyPage;
    }

    return firstPageEl.id;
  }

  /**
   * Checks if the amp-story-page for a given ID exists.
   * Note: the `this.pages_` array might not be defined yet.
   * @param {string} pageId
   * @return {boolean}
   * @private
   */
  isActualPage_(pageId) {
    // TODO(gmajoulet): check from the cached pages array if available, and use
    // the querySelector as a fallback.
    return !!this.element.querySelector(`#${escapeCssSelectorIdent(pageId)}`);
  }

  /**
   * @param {number} timeoutMs The maximum amount of time to wait, in
   *     milliseconds.
   * @return {!Promise} A promise that is resolved when the page is loaded or
   *     the timeout has been exceeded, whichever happens first.
   * @private
   */
  whenPagesLoaded_(timeoutMs = 0) {
    const pagesToWaitFor =
      this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS
        ? [this.pages_[0], this.pages_[1]]
        : [this.pages_[0]];

    const storyLoadPromise = Promise.all(
      pagesToWaitFor
        .filter((page) => !!page)
        .map((page) =>
          page.element.signals().whenSignal(CommonSignals.LOAD_END)
        )
    );

    return this.timer_
      .timeoutPromise(timeoutMs, storyLoadPromise)
      .catch(() => {});
  }

  /** @private */
  markStoryAsLoaded_() {
    dispatch(
      this.win,
      this.element,
      EventType.STORY_LOADED,
      /* payload */ undefined,
      {bubbles: true}
    );
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
    const consentPromise = getConsentPolicyState(this.element, policyId);

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
      user().error(TAG, 'amp-consent must have an amp-story-consent child');
    }

    const allowedTags = ['SCRIPT', 'AMP-STORY-CONSENT'];
    const toRemoveChildren = childElements(
      consentEl,
      (el) => allowedTags.indexOf(el.tagName) === -1
    );

    if (toRemoveChildren.length === 0) {
      return;
    }
    user().error(TAG, 'amp-consent only allows tags: %s', allowedTags);
    toRemoveChildren.forEach((el) => consentEl.removeChild(el));
  }

  /**
   * @private
   */
  initializeStoryAccess_() {
    Services.accessServiceForDocOrNull(this.element).then((accessService) => {
      if (!accessService) {
        return;
      }

      this.areAccessAuthorizationsCompleted_ = accessService.areFirstAuthorizationsCompleted();
      accessService.onApplyAuthorizations(() =>
        this.onAccessApplyAuthorizations_()
      );

      const firstPage = this.pages_[0].element;

      // First amp-story-page can't be paywall protected.
      // Removes the access attributes, and throws an error during development.
      if (
        firstPage.hasAttribute('amp-access') ||
        firstPage.hasAttribute('amp-access-hide')
      ) {
        firstPage.removeAttribute('amp-access');
        firstPage.removeAttribute('amp-access-hide');
        user().error(
          TAG,
          'First amp-story-page cannot have amp-access ' +
            'or amp-access-hide attributes'
        );
      }
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
      this.switchTo_(nextPage.element.id, NavigationDirection.NEXT);
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
      (pageEl) => pageEl.getImpl()
    );

    return Promise.all(pageImplPromises).then((pages) => {
      this.pages_ = pages;
      if (isExperimentOn(this.win, 'amp-story-branching')) {
        this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, [
          {tagOrTarget: 'AMP-STORY', method: 'goToPage'},
        ]);
      }
    });
  }

  /**
   * Advance to the next screen in the story, if there is one.
   * @param {boolean=} opt_isAutomaticAdvance Whether this navigation was caused
   *     by an automatic advancement after a timeout.
   * @private
   */
  next_(opt_isAutomaticAdvance) {
    const activePage = devAssert(
      this.activePage_,
      'No active page set when navigating to next page.'
    );
    activePage.next(opt_isAutomaticAdvance);
  }

  /**
   * Installs amp-viewer-integration script in case story is inside an
   * amp-story-player.
   * @private
   */
  initializeStoryPlayer_() {
    if (this.viewer_.getParam('storyPlayer') !== 'v0') {
      return;
    }
    Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-viewer-integration'
    );
  }

  /**
   * Handles EventType.NO_NEXT_PAGE events.
   * @private
   */
  onNoNextPage_() {
    if (this.viewer_.hasCapability('swipe') && this.viewerMessagingHandler_) {
      const advancementMode = this.storeService_.get(
        StateProperty.ADVANCEMENT_MODE
      );
      this.viewerMessagingHandler_.send(
        'selectDocument',
        dict({'next': true, 'advancementMode': advancementMode})
      );
      return;
    }

    this.hasBookend_().then((hasBookend) => {
      if (hasBookend) {
        this.showBookend_();
      }
    });
  }

  /**
   * Go back to the previous screen in the story, if there is one.
   * @private
   */
  previous_() {
    const activePage = devAssert(
      this.activePage_,
      'No active page set when navigating to previous page.'
    );
    activePage.previous();
  }

  /**
   * Handles EventType.NO_PREVIOUS_PAGE events.
   * @private
   */
  onNoPreviousPage_() {
    if (this.viewer_.hasCapability('swipe') && this.viewerMessagingHandler_) {
      const advancementMode = this.storeService_.get(
        StateProperty.ADVANCEMENT_MODE
      );
      this.viewerMessagingHandler_.send(
        'selectDocument',
        dict({'previous': true, 'advancementMode': advancementMode})
      );
      return;
    }

    if (this.storeService_.get(StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP)) {
      this.ampStoryHint_.showFirstPageHintOverlay();
    }
  }

  /**
   * @param {number} direction The direction to navigate.
   * @private
   */
  performTapNavigation_(direction) {
    this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE
    );

    if (
      this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS
    ) {
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
   * @param {!NavigationDirection} direction
   * @return {!Promise}
   * @private
   */
  switchTo_(targetPageId, direction) {
    const targetPage = this.getPageById(targetPageId);
    const pageIndex = this.getPageIndex(targetPage);

    // Step out if trying to navigate to the currently active page.
    if (this.activePage_ && this.activePage_.element.id === targetPageId) {
      return Promise.resolve();
    }

    // If the next page might be paywall protected, and the access
    // authorizations did not resolve yet, wait before navigating.
    // TODO(gmajoulet): implement a loading state.
    if (
      targetPage.element.hasAttribute('amp-access') &&
      !this.areAccessAuthorizationsCompleted_
    ) {
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
    if (!targetPage.isAd()) {
      this.updateNavigationPath_(targetPageId, direction);
    }

    // Each step will run in a requestAnimationFrame, and wait for the next
    // frame before executing the following step.
    const steps = [
      // First step contains the minimum amount of code to display and play the
      // target page as fast as possible.
      () => {
        oldPage && oldPage.element.removeAttribute('active');

        if (
          this.storeService_.get(StateProperty.UI_STATE) ===
          UIType.DESKTOP_PANELS
        ) {
          this.setDesktopPositionAttributes_(targetPage);
        }

        // Starts playing the page, if the story is not paused.
        // Note: navigation is prevented when the story is paused, this test
        // covers the case where the story is rendered paused (eg: consent).
        if (!this.storeService_.get(StateProperty.PAUSED_STATE)) {
          targetPage.setState(PageState.PLAYING);
        } else {
          // Even if the page won't be playing, setting the active attribute
          // ensures it gets visible.
          targetPage.element.setAttribute('active', '');
        }

        this.forceRepaintForSafari_();
      },
      // Second step does all the operations that impact the UI/UX: media sound,
      // progress bar, ...
      () => {
        if (oldPage) {
          oldPage.setState(PageState.NOT_ACTIVE);

          // Indication to know where to display the page on the desktop
          // ribbon-like animation.
          this.getPageIndex(oldPage) < pageIndex
            ? setAttributeInMutate(oldPage, Attributes.VISITED)
            : removeAttributeInMutate(oldPage, Attributes.VISITED);

          if (oldPage.isAd()) {
            this.storeService_.dispatch(
              Action.SET_ADVANCEMENT_MODE,
              AdvancementMode.ADVANCE_TO_ADS
            );
          }
        }

        let storePageIndex = pageIndex;
        if (targetPage.isAd()) {
          this.storeService_.dispatch(Action.TOGGLE_AD, true);
          setAttributeInMutate(this, Attributes.AD_SHOWING);

          // Keep current page index when an ad is shown. Otherwise it messes
          // up with the progress variable in the VariableService.
          storePageIndex = this.storeService_.get(
            StateProperty.CURRENT_PAGE_INDEX
          );
        } else {
          this.storeService_.dispatch(Action.TOGGLE_AD, false);
          removeAttributeInMutate(this, Attributes.AD_SHOWING);

          // Start progress bar update for pages that are not ads or auto-
          // advance.
          if (!targetPage.isAutoAdvance()) {
            this.systemLayer_.updateProgress(
              targetPageId,
              this.advancement_.getProgress()
            );
          }
        }

        this.storeService_.dispatch(Action.CHANGE_PAGE, {
          id: targetPageId,
          index: storePageIndex,
        });

        // If first navigation.
        if (!oldPage) {
          this.registerAndPreloadBackgroundAudio_();
        }
      },
      // Third and last step contains all the actions that can be delayed after
      // the navigation happened, like preloading the following pages, or
      // sending analytics events.
      () => {
        this.preloadPagesByDistance_();
        this.maybePreloadBookend_();

        this.triggerActiveEventForPage_();

        this.systemLayer_.resetDeveloperLogs();
        this.systemLayer_.setDeveloperLogContextString(
          this.activePage_.element.id
        );
      },
    ];

    return new Promise((resolve) => {
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
   * Updates the story navigation stack and checks for navigation adherence to
   * the path a user takes.
   * @param {string} targetPageId
   * @param {!NavigationDirection} direction
   * @private
   */
  updateNavigationPath_(targetPageId, direction) {
    const navigationPath = /** @type {!Array<string>} */ (this.storeService_.get(
      StateProperty.NAVIGATION_PATH
    ));

    if (direction === NavigationDirection.PREVIOUS) {
      navigationPath.pop();
    }

    // Ensures the pageId is not at the top of the stack already, which can
    // happen on initial page load (e.g. reloading a page).
    if (
      direction === NavigationDirection.NEXT &&
      navigationPath[navigationPath.length - 1] !== targetPageId
    ) {
      navigationPath.push(targetPageId);
    }

    this.storeService_.dispatch(Action.SET_NAVIGATION_PATH, navigationPath);
    setHistoryState(this.win, HistoryState.NAVIGATION_PATH, navigationPath);
  }

  /**
   * Clear existing preview attributes, Check to see if there is a next or
   * previous page, set new attributes.
   * @param {?./amp-story-page.AmpStoryPage} targetPage
   * @private
   */
  setDesktopPositionAttributes_(targetPage) {
    if (!targetPage) {
      return;
    }

    const list = [{page: targetPage, position: 0}];

    const minusOneId = targetPage.getPreviousPageId();
    if (minusOneId) {
      const minusOnePage = this.getPageById(minusOneId);
      list.push({page: minusOnePage, position: -1});

      const minusTwoId = minusOnePage.getPreviousPageId();
      if (minusTwoId) {
        list.push({page: this.getPageById(minusTwoId), position: -2});
      }
    }

    const plusOneId = targetPage.getNextPageId();
    if (plusOneId) {
      const plusOnePage = this.getPageById(plusOneId);
      list.push({page: plusOnePage, position: 1});

      const plusTwoId = plusOnePage.getNextPageId();
      if (plusTwoId) {
        list.push({page: this.getPageById(plusTwoId), position: 2});
      }
    }

    let desktopPositionsToReset;

    this.measureMutateElement(
      /** measurer */
      () => {
        desktopPositionsToReset = scopedQuerySelectorAll(
          this.element,
          `amp-story-page[
                      ${escapeCssSelectorIdent(Attributes.DESKTOP_POSITION)}]`
        );
      },
      /** mutator */
      () => {
        Array.prototype.forEach.call(desktopPositionsToReset, (el) => {
          el.removeAttribute(Attributes.DESKTOP_POSITION);
        });

        list.forEach((entry) => {
          const {page, position} = entry;
          page.element.setAttribute(Attributes.DESKTOP_POSITION, position);
        });
      }
    );
  }

  /** @private */
  triggerActiveEventForPage_() {
    // TODO(alanorozco): pass event priority once amphtml-story repo is merged
    // with upstream.
    Services.actionServiceForDoc(this.element).trigger(
      this.activePage_.element,
      'active',
      /* event */ null,
      ActionTrust.HIGH
    );
  }

  /**
   * For some reason, Safari has an issue where sometimes when pages become
   * visible, some descendants are not painted.  This is a hack, where we detect
   * that the browser is Safari and force it to repaint, to avoid this case.
   * See newmuis/amphtml-story#106 for details.
   * @private
   */
  forceRepaintForSafari_() {
    if (!this.platform_.isSafari() && !this.platform_.isIos()) {
      return;
    }
    if (
      this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS
    ) {
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
      const height = this.element./*OK*/ offsetHeight;
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

    this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE
    );

    const rtlState = this.storeService_.get(StateProperty.RTL_STATE);

    switch (e.key) {
      case Keys.LEFT_ARROW:
        rtlState ? this.next_() : this.previous_();
        break;
      case Keys.RIGHT_ARROW:
        rtlState ? this.previous_() : this.next_();
        break;
    }
  }

  /**
   * Handle resize events and set the story's desktop state.
   * @visibleForTesting
   */
  onResize() {
    const uiState = this.getUIType_();
    this.storeService_.dispatch(Action.TOGGLE_UI, uiState);

    const isLandscape = this.isLandscape_();
    const isLandscapeSupported = this.isLandscapeSupported_();

    this.setOrientationAttribute_(isLandscape, isLandscapeSupported);

    if (uiState !== UIType.MOBILE || isLandscapeSupported) {
      // Hides the UI that prevents users from using the LANDSCAPE orientation.
      this.storeService_.dispatch(Action.TOGGLE_VIEWPORT_WARNING, false);
      return;
    }

    // Only called when the desktop media query is not matched and the landscape
    // mode is not enabled.
    this.maybeTriggerViewportWarning_(isLandscape);
  }

  /**
   * Adds an orientation=landscape|portrait attribute.
   * If the story doesn't explicitly support landscape via the opt-in attribute,
   * it is always in a portrait orientation.
   * @param {boolean} isLandscape Whether the viewport is landscape or portrait
   * @param {boolean} isLandscapeSupported Whether the story supports landscape
   * @private
   */
  setOrientationAttribute_(isLandscape, isLandscapeSupported) {
    // TODO(#20832) base this check on the size of the amp-story-page, once it
    // is stored as a store state.
    this.mutateElement(() => {
      this.element.setAttribute(
        Attributes.ORIENTATION,
        isLandscapeSupported && isLandscape ? 'landscape' : 'portrait'
      );
    });
  }

  /**
   * Maybe triggers the viewport warning overlay.
   * @param {boolean} isLandscape
   * @private
   */
  maybeTriggerViewportWarning_(isLandscape) {
    if (
      isLandscape ===
      this.storeService_.get(StateProperty.VIEWPORT_WARNING_STATE)
    ) {
      return;
    }

    this.mutateElement(() => {
      if (isLandscape) {
        this.pausedStateToRestore_ = !!this.storeService_.get(
          StateProperty.PAUSED_STATE
        );
        this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
        this.storeService_.dispatch(Action.TOGGLE_VIEWPORT_WARNING, true);
      } else {
        this.storeService_.dispatch(
          Action.TOGGLE_PAUSED,
          this.pausedStateToRestore_
        );
        this.storeService_.dispatch(Action.TOGGLE_VIEWPORT_WARNING, false);
      }
    });
  }

  /**
   * Reacts to the browser tab becoming active/inactive.
   * @private
   */
  onVisibilityChanged_() {
    this.getAmpDoc().isVisible() ? this.resume_() : this.pause_();
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
    switch (uiState) {
      case UIType.MOBILE:
        this.vsync_.mutate(() => {
          this.element.removeAttribute('desktop');
          this.element.classList.remove('i-amphtml-story-desktop-panels');
          this.element.classList.remove('i-amphtml-story-desktop-fullbleed');
        });
        break;
      case UIType.DESKTOP_PANELS:
        this.setDesktopPositionAttributes_(this.activePage_);
        this.buildPaginationButtons_();
        this.vsync_.mutate(() => {
          this.element.setAttribute('desktop', '');
          this.element.classList.add('i-amphtml-story-desktop-panels');
          this.element.classList.remove('i-amphtml-story-desktop-fullbleed');
        });
        break;
      case UIType.DESKTOP_FULLBLEED:
        this.buildPaginationButtons_();
        this.vsync_.mutate(() => {
          this.element.setAttribute('desktop', '');
          this.element.classList.add('i-amphtml-story-desktop-fullbleed');
          this.element.classList.remove('i-amphtml-story-desktop-panels');
        });
        break;
      // Because of the DOM mutations, switching from this mode to another is
      // not allowed, and prevented within the store service.
      case UIType.VERTICAL:
        const pageAttachments = scopedQuerySelectorAll(
          this.element,
          'amp-story-page amp-story-page-attachment'
        );

        this.initializeBookend_().then(() => this.showBookend_());

        this.vsync_.mutate(() => {
          this.element.setAttribute('i-amphtml-vertical', '');
          setImportantStyles(this.win.document.body, {height: 'auto'});
          this.element.removeAttribute('desktop');
          this.element.classList.remove('i-amphtml-story-desktop-fullbleed');
          this.element.classList.remove('i-amphtml-story-desktop-panels');
          for (let i = 0; i < pageAttachments.length; i++) {
            this.element.insertBefore(
              pageAttachments[i],
              // Attachments that are just links are rendered in-line with their
              // story page.
              pageAttachments[i].getAttribute('href')
                ? pageAttachments[i].parentElement.nextElementSibling
                : // Other attachments are rendered at the end.
                  null
            );
          }
        });

        this.signals()
          .whenSignal(CommonSignals.LOAD_END)
          .then(() => {
            this.vsync_.mutate(() => {
              this.pages_.forEach((page) =>
                page.element.setAttribute('active', '')
              );
            });
          });
        break;
    }
  }

  /**
   * Retrieves the UI type that should be used to view the story.
   * @return {!UIType}
   * @private
   */
  getUIType_() {
    if (this.platform_.isBot()) {
      return UIType.VERTICAL;
    }

    if (!this.isDesktop_()) {
      return UIType.MOBILE;
    }

    if (this.isLandscapeSupported_()) {
      return UIType.DESKTOP_FULLBLEED;
    }

    // Three panels desktop UI (default).
    return UIType.DESKTOP_PANELS;
  }

  /**
   * @return {boolean} True if the screen size matches the desktop media query.
   * @private
   */
  isDesktop_() {
    return this.desktopMedia_.matches && !this.platform_.isBot();
  }

  /**
   * @return {boolean} True if the screen orientation is landscape.
   * @private
   */
  isLandscape_() {
    return this.landscapeOrientationMedia_.matches;
  }

  /**
   * @return {boolean} true if this is a standalone story (i.e. this story is
   *     the only content of the document).
   * @private
   */
  isStandalone_() {
    return this.element.hasAttribute(Attributes.STANDALONE);
  }

  /**
   * Whether the story should support landscape orientation: landscape mobile,
   * or full bleed desktop UI.
   * @return {boolean}
   * @private
   */
  isLandscapeSupported_() {
    return this.element.hasAttribute(Attributes.SUPPORTS_LANDSCAPE);
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

    const pageState = isPaused ? PageState.PAUSED : PageState.PLAYING;

    this.activePage_.setState(pageState);
  }

  /**
   * Reacts to sidebar state updates.
   * @param {boolean} sidebarState
   * @private
   */
  onSidebarStateUpdate_(sidebarState) {
    this.analyticsService_.triggerEvent(
      sidebarState ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
      this.sidebar_
    );

    const actions = Services.actionServiceForDoc(this.element);
    if (this.win.MutationObserver) {
      if (!this.sidebarObserver_) {
        this.sidebarObserver_ = new this.win.MutationObserver(() => {
          this.storeService_.dispatch(
            Action.TOGGLE_SIDEBAR,
            this.sidebar_.hasAttribute('open')
          );
        });
      }
      if (this.sidebar_ && sidebarState) {
        this.sidebarObserver_.observe(this.sidebar_, SIDEBAR_OBSERVER_OPTIONS);
        this.openOpacityMask_();
        actions.execute(
          this.sidebar_,
          'open',
          /* args */ null,
          /* source */ null,
          /* caller */ null,
          /* event */ null,
          ActionTrust.HIGH
        );
      } else {
        this.closeOpacityMask_();
        this.sidebarObserver_.disconnect();
      }
    } else if (this.sidebar_ && sidebarState) {
      this.openOpacityMask_();
      actions.execute(
        this.sidebar_,
        'open',
        /* args */ null,
        /* source */ null,
        /* caller */ null,
        /* event */ null,
        ActionTrust.HIGH
      );
      this.storeService_.dispatch(Action.TOGGLE_SIDEBAR, false);
    }
  }

  /**
   * @private
   */
  initializeOpacityMask_() {
    if (!this.maskElement_) {
      const maskEl = this.win.document.createElement('div');
      maskEl.classList.add(OPACITY_MASK_CLASS_NAME);
      maskEl.addEventListener('click', () => {
        const actions = Services.actionServiceForDoc(this.element);
        if (this.sidebar_) {
          this.closeOpacityMask_();
          actions.execute(
            this.sidebar_,
            'close',
            /* args */ null,
            /* source */ null,
            /* caller */ null,
            /* event */ null,
            ActionTrust.HIGH
          );
        }
      });
      this.maskElement_ = maskEl;
      this.mutateElement(() => {
        this.element.appendChild(this.maskElement_);
        toggle(dev().assertElement(this.maskElement_), /* display */ false);
      });
    }
  }

  /**
   * @private
   */
  openOpacityMask_() {
    this.mutateElement(() => {
      toggle(dev().assertElement(this.maskElement_), /* display */ true);
    });
  }

  /**
   * @private
   */
  closeOpacityMask_() {
    if (this.maskElement_) {
      this.mutateElement(() => {
        toggle(dev().assertElement(this.maskElement_), /* display */ false);
      });
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
        dev().error(
          TAG,
          'No handler to exit unsupported browser state on ' +
            'publisher provided fallback.'
        );
      } else {
        this.layoutStory_().then(() => {
          this.storeService_.dispatch(
            Action.TOGGLE_PAUSED,
            this.pausedStateToRestore_
          );
          this.mutateElement(() => {
            this.unsupportedBrowserLayer_.removeLayer();
          });
        });
      }
    } else {
      this.pausedStateToRestore_ = !!this.storeService_.get(
        StateProperty.PAUSED_STATE
      );
      this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
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
  }

  /**
   * Toggles content when bookend is opened/closed.
   * @param {boolean} isActive
   * @private
   */
  toggleElementsOnBookend_(isActive) {
    if (
      this.storeService_.get(StateProperty.UI_STATE) !== UIType.DESKTOP_PANELS
    ) {
      return;
    }

    const elements = scopedQuerySelectorAll(
      this.element,
      HIDE_ON_BOOKEND_SELECTOR
    );

    Array.prototype.forEach.call(elements, (el) => {
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
      /* distance */ 0,
      /* map */ {},
      this.activePage_.element.id
    );

    // Transpose the map into a 2D array.
    const pagesByDistance = [];
    Object.keys(distanceMap).forEach((pageId) => {
      let distance = distanceMap[pageId];
      // If on last page, mark first page with distance 1.
      if (
        pageId === this.pages_[0].element.id &&
        this.activePage_ === this.pages_[this.pages_.length - 1] &&
        this.pages_.length > 1 &&
        !this.viewer_.hasCapability('swipe')
      ) {
        distance = 1;
      }
      if (!pagesByDistance[distance]) {
        pagesByDistance[distance] = [];
      }
      // There may be other 1 skip away pages due to branching.
      if (isExperimentOn(this.win, 'amp-story-branching')) {
        const navigationPath = this.storeService_.get(
          StateProperty.NAVIGATION_PATH
        );
        const indexInStack = navigationPath.indexOf(
          this.activePage_.element.id
        );
        const maybePrev = navigationPath[indexInStack - 1];
        if (indexInStack > 0 && pageId === this.activePage_.element.id) {
          if (!pagesByDistance[1]) {
            pagesByDistance[1] = [];
          }
          pagesByDistance[1].push(maybePrev);
        }
        // Do not overwrite, branching distance always takes precedence.
        if (pageId !== maybePrev) {
          pagesByDistance[distance].push(pageId);
        }
      } else {
        pagesByDistance[distance].push(pageId);
      }
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
    page.getAdjacentPageIds().forEach((adjacentPageId) => {
      if (
        map[adjacentPageId] !== undefined &&
        map[adjacentPageId] <= distance
      ) {
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
      this.pages_.forEach((page) => {
        page.setDistance(0);
      });
      return;
    }

    const pagesByDistance = this.getPagesByDistance_();

    this.mutateElement(() => {
      pagesByDistance.forEach((pageIds, distance) => {
        pageIds.forEach((pageId) => {
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
    this.activePage_.element
      .signals()
      .whenSignal(CommonSignals.LOAD_END)
      .then(() => {
        backgroundAudioEl = /** @type {!HTMLMediaElement} */ (backgroundAudioEl);
        this.mediaPool_.register(backgroundAudioEl);
        return this.mediaPool_.preload(backgroundAudioEl);
      })
      .then(() => {
        this.backgroundAudioEl_ = /** @type {!HTMLMediaElement} */ (childElement(
          this.element,
          (el) => {
            return el.tagName.toLowerCase() === 'audio';
          }
        ));
      });
  }

  /**
   * Loads amp-story-education if the viewer capability is provided.
   * @private
   */
  maybeLoadStoryEducation_() {
    if (!this.viewer_.hasCapability('education')) {
      return;
    }

    this.mutateElement(() => {
      this.element.appendChild(
        this.win.document.createElement('amp-story-education')
      );
    });

    Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-story-education'
    );
  }

  /**
   * Initializes bookend.
   * @return {!Promise}
   * @private
   */
  initializeBookend_() {
    let bookendEl = this.element.querySelector('amp-story-bookend');
    if (!bookendEl) {
      bookendEl = createElementWithAttributes(
        this.win.document,
        'amp-story-bookend',
        dict({'layout': 'nodisplay'})
      );
      this.element.appendChild(bookendEl);
    }

    return whenUpgradedToCustomElement(bookendEl).then(() => {
      return bookendEl.getImpl().then((bookendImpl) => {
        this.bookend_ = bookendImpl;
      });
    });
  }

  /**
   * Preloads the bookend config if on the last page.
   * @private
   */
  maybePreloadBookend_() {
    if (
      !this.activePage_ ||
      !this.storeService_.get(StateProperty.CAN_SHOW_BOOKEND)
    ) {
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
    if (this.storeService_.get(StateProperty.UI_STATE) === UIType.MOBILE) {
      return Promise.resolve(true);
    }

    return this.bookend_
      .loadConfigAndMaybeRenderBookend(false /** renderBookend */)
      .then(
        (config) =>
          !!(config && config.components && config.components.length > 0)
      );
  }

  /**
   * @param {string} id The ID of the page whose index should be retrieved.
   * @return {number} The index of the page.
   */
  getPageIndexById(id) {
    const pageIndex = findIndex(this.pages_, (page) => page.element.id === id);
    if (pageIndex < 0) {
      user().error(
        TAG,
        'Story refers to page "%s", but no such page exists.',
        id
      );
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
    return devAssert(
      this.pages_[pageIndex],
      'Page at index %s exists, but is missing from the array.',
      pageIndex
    );
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
    return findIndex(this.pages_, (page) => page === desiredPage);
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
    const pageIndex = findIndex(this.pages_, (page) => {
      const pageEl = closest(element, (el) => {
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
    let audioMediaElementsCount = this.element.querySelectorAll(
      'amp-audio, [background-audio]'
    ).length;
    const videoMediaElementsCount = this.element.querySelectorAll('amp-video')
      .length;

    // The root element (amp-story) might have a background-audio as well.
    if (this.element.hasAttribute('background-audio')) {
      audioMediaElementsCount++;
    }

    return {
      [MediaType.AUDIO]: Math.min(
        audioMediaElementsCount + MINIMUM_AD_MEDIA_ELEMENTS,
        MAX_MEDIA_ELEMENT_COUNTS[MediaType.AUDIO]
      ),
      [MediaType.VIDEO]: Math.min(
        videoMediaElementsCount + MINIMUM_AD_MEDIA_ELEMENTS,
        MAX_MEDIA_ELEMENT_COUNTS[MediaType.VIDEO]
      ),
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
    isMuted
      ? this.element.setAttribute(Attributes.MUTED, '')
      : this.element.removeAttribute(Attributes.MUTED);
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

    this.mediaPool_.blessAll().then(unmuteAllMedia, unmuteAllMedia);
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
      'amp-audio, amp-video:not([noaudio]), [background-audio]'
    );
    const storyHasBackgroundAudio = this.element.hasAttribute(
      'background-audio'
    );

    this.storeService_.dispatch(
      Action.TOGGLE_STORY_HAS_AUDIO,
      containsMediaElementWithAudio || storyHasBackgroundAudio
    );
    this.storeService_.dispatch(
      Action.TOGGLE_STORY_HAS_BACKGROUND_AUDIO,
      storyHasBackgroundAudio
    );
  }

  /**
   * Shows the play/pause icon if there is an element with playback on the story.
   * @private
   */
  updatePausedIcon_() {
    const containsElementsWithPlayback = !!scopedQuerySelector(
      this.element,
      'amp-story-grid-layer amp-audio, amp-story-grid-layer amp-video, amp-story-page[background-audio], amp-story-page[auto-advance-after]'
    );

    const storyHasBackgroundAudio = this.element.hasAttribute(
      'background-audio'
    );

    this.storeService_.dispatch(
      Action.TOGGLE_STORY_HAS_PLAYBACK_UI,
      containsElementsWithPlayback || storyHasBackgroundAudio
    );
  }

  /**
   * Handles the selectPage viewer event.
   * @param {!JsonObject} data
   * @private
   */
  onSelectPage_(data) {
    if (!data) {
      return;
    }

    this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.VIEWER_SELECT_PAGE
    );

    if (data['next']) {
      this.next_();
    } else if (data['previous']) {
      this.previous_();
    }
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

    this.mutateElement(() => {
      this.sidebar_.classList.add(SIDEBAR_CLASS_NAME);
    });

    this.initializeOpacityMask_();
    this.storeService_.dispatch(Action.TOGGLE_HAS_SIDEBAR, !!this.sidebar_);

    const actions = [
      {tagOrTarget: 'AMP-SIDEBAR', method: 'open'},
      {tagOrTarget: 'AMP-SIDEBAR', method: 'close'},
      {tagOrTarget: 'AMP-SIDEBAR', method: 'toggle'},
    ];
    this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, actions);
  }

  /**
   * Checks for the the storyNavigationPath stack in the history.
   * @private
   */
  initializeStoryNavigationPath_() {
    this.storeService_.dispatch(
      Action.SET_NAVIGATION_PATH,
      getHistoryState(this.win, HistoryState.NAVIGATION_PATH) || []
    );
  }

  /** @private */
  replay_() {
    if (this.storeService_.get(StateProperty.BOOKEND_STATE)) {
      this.hideBookend_();
    }
    this.storeService_.dispatch(Action.SET_NAVIGATION_PATH, []);
    const switchPromise = this.switchTo_(
      dev().assertElement(this.pages_[0].element).id,
      NavigationDirection.NEXT
    );
    // Restart page media, advancements, etc (#27742).
    if (this.pages_.length === 1) {
      this.pages_[0].setState(PageState.NOT_ACTIVE);
      this.pages_[0].setState(PageState.PLAYING);
    }

    // Reset all pages so that they are offscreen to right instead of left in
    // desktop view.
    switchPromise.then(() => {
      this.pages_.forEach((page) =>
        removeAttributeInMutate(page, Attributes.VISITED)
      );
    });
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
      const ctaAnchorEls = scopedQuerySelectorAll(
        page.element,
        'amp-story-cta-layer a'
      );

      Array.prototype.forEach.call(ctaAnchorEls, (ctaAnchorEl) => {
        ctaAnchorEl.setAttribute('data-vars-story-page-id', pageId);
        ctaAnchorEl.setAttribute('data-vars-story-page-index', pageIndex);
      });
    });
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

    if (
      pageToBeInserted.isAd() &&
      !this.storeService_.get(StateProperty.CAN_INSERT_AUTOMATIC_AD)
    ) {
      dev().expectedError(TAG, 'Inserting ads automatically is disallowed.');
      return false;
    }

    const pageBefore = this.getPageById(pageBeforeId);
    const pageBeforeEl = pageBefore.element;

    const nextPage = this.getNextPage(pageBefore);

    if (!nextPage) {
      return false;
    }

    const advanceAttr = isExperimentOn(this.win, 'amp-story-branching')
      ? Attributes.PUBLIC_ADVANCE_TO
      : Attributes.ADVANCE_TO;

    pageBeforeEl.setAttribute(advanceAttr, pageToBeInsertedId);
    pageBeforeEl.setAttribute(Attributes.AUTO_ADVANCE_TO, pageToBeInsertedId);
    pageToBeInsertedEl.setAttribute(Attributes.RETURN_TO, pageBeforeId);

    const nextPageEl = nextPage.element;
    const nextPageId = nextPageEl.id;
    // For a live story, nextPage is the same as pageToBeInserted. But not for
    // ads since it's inserted between two pages.
    if (nextPageId !== pageToBeInsertedId) {
      pageToBeInsertedEl.setAttribute(advanceAttr, nextPageId);
      pageToBeInsertedEl.setAttribute(Attributes.AUTO_ADVANCE_TO, nextPageId);
      nextPageEl.setAttribute(Attributes.RETURN_TO, pageToBeInsertedId);
    }

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
    return Boolean(
      win.CSS &&
        win.CSS.supports &&
        win.CSS.supports('display', 'grid') &&
        win.CSS.supports('color', 'var(--test)')
    );
  }
}

AMP.extension('amp-story', '1.0', (AMP) => {
  AMP.registerElement('amp-story', AmpStory, CSS);
  AMP.registerElement('amp-story-access', AmpStoryAccess);
  AMP.registerElement('amp-story-bookend', AmpStoryBookend);
  AMP.registerElement('amp-story-consent', AmpStoryConsent);
  AMP.registerElement('amp-story-cta-layer', AmpStoryCtaLayer);
  AMP.registerElement('amp-story-grid-layer', AmpStoryGridLayer);
  AMP.registerElement('amp-story-page', AmpStoryPage);
  AMP.registerElement('amp-story-page-attachment', AmpStoryPageAttachment);
  AMP.registerElement(
    'amp-story-interactive-binary-poll',
    AmpStoryInteractiveBinaryPoll
  );
  AMP.registerElement('amp-story-interactive-poll', AmpStoryInteractivePoll);
  AMP.registerElement('amp-story-interactive-quiz', AmpStoryInteractiveQuiz);
  AMP.registerElement(
    'amp-story-interactive-results',
    AmpStoryInteractiveResults
  );
  AMP.registerServiceForDoc('amp-story-render', AmpStoryRenderService);
});
