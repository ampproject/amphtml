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

import './amp-story-grid-layer';
import './amp-story-page';

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {CommonSignals_Enum} from '#core/constants/common-signals';
import {Keys_Enum} from '#core/constants/key-codes';
import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {Deferred} from '#core/data-structures/promise';
import {isRTL, removeElement} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {prefersReducedMotion} from '#core/dom/media-query-props';
import {
  childElement,
  childElementByTag,
  childElements,
  childNodes,
  closest,
  matches,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '#core/dom/query';
import {
  computedStyle,
  getStyle,
  px,
  setImportantStyles,
  toggle,
} from '#core/dom/style';
import {devError} from '#core/error';
import {clamp} from '#core/math';
import {isEsm, isSsrCss} from '#core/mode';
import {findIndex, lastItem, toArray} from '#core/types/array';
import {debounce} from '#core/types/function';
import {map} from '#core/types/object';
import {tryParseJson} from '#core/types/object/json';
import {endsWith} from '#core/types/string';
import {parseQueryString} from '#core/types/string/url';
import {getHistoryState as getWindowHistoryState} from '#core/window/history';

import {getExperimentBranch, isExperimentOn} from '#experiments';
import {StoryAdSegmentExp} from '#experiments/story-ad-progress-segment';

import {Services} from '#service';
import {calculateExtensionFileUrl} from '#service/extension-script';

import {getDetail} from '#utils/event-helper';
import {dev, devAssert, user} from '#utils/log';

import {AmpStoryConsent} from './amp-story-consent';
import {AmpStoryEmbeddedComponent} from './amp-story-embedded-component';
import {AmpStoryGridLayer} from './amp-story-grid-layer';
import {AmpStoryHint} from './amp-story-hint';
import {InfoDialog} from './amp-story-info-dialog';
import {
  getLocalizationService,
  getSupportedLanguageCode,
} from './amp-story-localization-service';
import {AmpStoryPage, NavigationDirection, PageState} from './amp-story-page';
import {AmpStoryShare} from './amp-story-share';
import {
  Action,
  EmbeddedComponentState,
  InteractiveComponentDef,
  StateProperty,
  SubscriptionsState,
  UIType_Enum,
  getStoreService,
} from './amp-story-store-service';
import {SystemLayer} from './amp-story-system-layer';
import {renderUnsupportedBrowserLayer} from './amp-story-unsupported-browser-layer';
import {AmpStoryViewerMessagingHandler} from './amp-story-viewer-messaging-handler';
import {upgradeBackgroundAudio} from './audio';
import {BackgroundBlur} from './background-blur';
import {isPreviewMode} from './embed-mode';
import {EventType, dispatch} from './events';
import {HistoryState, getHistoryState, setHistoryState} from './history';
import {LiveStoryManager} from './live-story-manager';
import {MediaPool, MediaType_Enum} from './media-pool';
import {AdvancementConfig, TapNavigationDirection} from './page-advancement';
import {PaginationButtons} from './pagination-buttons';
import {
  AdvancementMode,
  StoryAnalyticsEvent,
  getAnalyticsService,
} from './story-analytics';
import {
  isTransformed,
  removeAttributeInMutate,
  setAttributeInMutate,
  shouldShowStoryUrlInfo,
} from './utils';
import {AnalyticsVariable, getVariableService} from './variable-service';

import {CSS} from '../../../build/amp-story-1.0.css';
import {getConsentPolicyState} from '../../../src/consent';
import {Gestures} from '../../../src/gesture';
import {SwipeXYRecognizer} from '../../../src/gesture-recognizers';
import {getMode, isModeDevelopment} from '../../../src/mode';

/** @private @const {number} */
const DESKTOP_WIDTH_THRESHOLD = 1024;

/** @private @const {number} */
const DESKTOP_HEIGHT_THRESHOLD = 550;

/**
 * NOTE: If udpated here, update in amp-story-player-impl.js
 * @private @const {string}
 */
const DESKTOP_ONE_PANEL_ASPECT_RATIO_THRESHOLD = '31 / 40';

/** @private @const {number} */
const MIN_SWIPE_FOR_HINT_OVERLAY_PX = 50;

/**
 * Minimum custom aspect ratio for desktop one panel, i.e. 1:2.
 * @private @const {number}
 * */
const MIN_CUSTOM_DESKTOP_ONE_PANEL_ASPECT_RATIO = 0.5;

/**
 * Maximum custom aspect ratio for desktop one panel, i.e. 3:4.
 * @private @const {number}
 * */
const MAX_CUSTOM_DESKTOP_ONE_PANEL_ASPECT_RATIO = 0.75;

/** @enum {string} */
const Attributes = {
  AD_SHOWING: 'ad-showing',
  ADVANCE_TO: 'i-amphtml-advance-to',
  AUTO_ADVANCE_AFTER: 'auto-advance-after',
  AUTO_ADVANCE_TO: 'auto-advance-to',
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
 * The duration of time (in milliseconds) to wait for the Story initial content
 * to be loaded before marking the story as loaded.
 * @const {number}
 */
const INITIAL_CONTENT_LOAD_TIMEOUT_MS = 8000;

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

/** @const {!{[key: string]: number}} */
const MAX_MEDIA_ELEMENT_COUNTS = {
  [MediaType_Enum.AUDIO]: 4,
  [MediaType_Enum.VIDEO]: 8,
};

/**
 * The number of milliseconds to wait before showing the paywall on paywall page.
 * @const {number}
 */
export const SUBSCRIPTIONS_DELAY_DURATION = 500;

/** @type {string} */
const TAG = 'amp-story';

/**
 * The default dark gray for chrome supported theme color.
 * @const {string}
 */
const DEFAULT_THEME_COLOR = '#202125';

/**
 * The default number of story pages that should be shown in preview mode
 * before the preview is considered to be finished.
 * @const {number}
 */
const DEFAULT_MIN_PAGES_TO_PREVIEW = 1;

/**
 * The default percentage of the total number of story pages that should be
 * shown in preview mode before the preview is considered to be finished.
 * @const {number}
 */
const DEFAULT_PCT_PAGES_TO_PREVIEW = 30;

/** The targets that should not navigate when pressing keys.
 * @const {string} */
const IGNORE_KEYDOWN_EVENT_TARGET = 'amp-story-interactive-slider';

/*
 * @implements {./media-pool.MediaPoolRoot}
 */
export class AmpStory extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

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

    /** @private @const {!SystemLayer} */
    this.systemLayer_ = new SystemLayer(this.win, this.element);

    /** Instantiate in case there are embedded components. */
    new AmpStoryEmbeddedComponent(this.win, this.element);

    /** @private {!Array<!./amp-story-page.AmpStoryPage>} */
    this.pages_ = [];

    /** @private @const {!Array<!./amp-story-page.AmpStoryPage>} */
    this.adPages_ = [];

    /** @const @private {!./variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(this.win);

    /** @private {?./amp-story-page.AmpStoryPage} */
    this.activePage_ = null;

    /** @private @const */
    this.desktopOnePanelMedia_ = this.win.matchMedia(
      `(min-aspect-ratio: ${DESKTOP_ONE_PANEL_ASPECT_RATIO_THRESHOLD})`
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

    /** @private {!AmpStoryHint} */
    this.ampStoryHint_ = new AmpStoryHint(this.win, this.element);

    /** @private {!MediaPool} */
    this.mediaPool_ = MediaPool.for(this);

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win);

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win);

    /** @private {?../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = null;

    /** @private {?AmpStoryViewerMessagingHandler} */
    this.viewerMessagingHandler_ = null;

    /**
     * Store the current paused state, to make sure the story does not play on
     * resume if it was previously paused. null when nothing to restore.
     * @private {?boolean}
     */
    this.pausedStateToRestore_ = null;

    /** @private {?LiveStoryManager} */
    this.liveStoryManager_ = null;

    /** @private {?BackgroundBlur} */
    this.backgroundBlur_ = null;

    /** @private {?UIType_Enum} */
    this.uiState_ = null;

    /** @private {boolean} whether the styles were rewritten */
    this.didRewriteStyles_ = false;

    /**
     * @private {?string} the page id to navigate to after receiving a granted state from amp-subscriptions
     */
    this.pageAfterSubscriptionsGranted_ = null;

    /** @private {!Deferred} a promise that is resolved once the subscription state is received */
    this.subscriptionsStateDeferred_ = new Deferred();

    /** @private {?number} the timeout to show subscriptions dialog after delay */
    this.showSubscriptionsUITimeout_ = null;

    /** @private {?number} the index of the page where the paywall would be triggered. */
    this.subscriptionsPageIndex_ = -1;

    /** @private {!Deferred} a promise that is resolved once the subscriptions page index is extracted from amp-story-subscriptions. */
    this.subscriptionsPageIndexDeferred_ = new Deferred();

    /**
     * @private {?number} the index of the last page that should be shown in
     *     preview mode.
     */
    this.indexOfLastPageToPreview_ = null;

    /** @private {!Deferred} a promise that is resolved once the active page is assigned */
    this.activePageDeferred_ = new Deferred();
  }

  /** @override */
  buildCallback() {
    this.viewer_ = Services.viewerForDoc(this.element);

    const needsDvhPolyfill =
      !this.win.CSS?.supports?.('height: 1dvh') &&
      !getStyle(this.win.document.documentElement, '--story-dvh');

    if (needsDvhPolyfill) {
      this.polyfillDvh_(this.getViewport().getSize());
      this.getViewport().onResize((size) => this.polyfillDvh_(size));
    }

    this.viewerMessagingHandler_ = this.viewer_.isEmbedded()
      ? new AmpStoryViewerMessagingHandler(this.win, this.viewer_)
      : null;

    this.indexOfLastPageToPreview_ = this.calculateIndexOfLastPageToPreview_();

    this.installLocalizationStrings_();

    if (this.isStandalone_()) {
      this.initializeStandaloneStory_();
    }

    // buildCallback already runs in a mutate context. Calling another
    // mutateElement explicitly will force the runtime to remeasure the
    // amp-story element, fixing rendering bugs where the story is inactive
    // (layoutCallback not called) when accessed from any viewer using
    // prerendering, because of a height incorrectly set to 0.
    this.mutateElement(() => {});

    const pageId = this.getInitialPageId_();
    if (pageId) {
      const page = this.element.querySelector(
        `amp-story-page#${escapeCssSelectorIdent(pageId)}`
      );
      page.setAttribute('active', '');
    }

    this.initializeListeners_();
    this.initializePageIds_();
    this.initializeStoryPlayer_();

    this.uiState_ = this.getUIType_();
    this.storeService_.dispatch(Action.TOGGLE_UI, this.uiState_);
    if (this.isLandscapeSupported_()) {
      this.win.document.documentElement.setAttribute(
        'data-story-supports-landscape',
        ''
      );
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
        this.switchTo_(args['id'], NavigationDirection.NEXT);
      });
    }
    const performanceService = Services.performanceFor(this.win);
    if (
      isExperimentOn(this.win, 'story-disable-animations-first-page') ||
      isPreviewMode(this.win) ||
      prefersReducedMotion(this.win) ||
      isTransformed(this.getAmpDoc())
    ) {
      performanceService.addEnabledExperiment(
        'story-disable-animations-first-page'
      );
    }
    const docElem = this.getAmpDoc().getRootNode().documentElement;
    // [i-amphtml-version] marks that the style was inlined in the doc
    // server-side.
    const inlinedAmpStoryCssExists = docElem.querySelector(
      'style[amp-extension="amp-story"][i-amphtml-version]'
    );
    // [amp-extension=amp-story] on a stylesheet link marks that the style
    // was linked on the doc server-side.
    const linkAmpStoryCssExists = docElem.querySelector(
      'link[amp-extension="amp-story"][rel=stylesheet]'
    );

    if (inlinedAmpStoryCssExists) {
      performanceService.addEnabledExperiment('story-inline-css');
    } else if (linkAmpStoryCssExists) {
      performanceService.addEnabledExperiment('story-link-css');
    }

    if (isExperimentOn(this.win, 'story-load-inactive-outside-viewport')) {
      performanceService.addEnabledExperiment(
        'story-load-inactive-outside-viewport'
      );
      this.element.classList.add(
        'i-amphtml-experiment-story-load-inactive-outside-viewport'
      );
    }

    this.maybeApplyDesktopAspectRatioAttribute_();

    if (this.maybeLoadStoryDevTools_()) {
      return;
    }
  }

  /**
   * Grab the desktop-aspect-ratio attribute, clamp the value
   * between 1/2 and 3/4 aspect ratios, and apply it to the root element.
   * @private
   */
  maybeApplyDesktopAspectRatioAttribute_() {
    if (
      this.isLandscapeSupported_() ||
      !this.element.hasAttribute('desktop-aspect-ratio')
    ) {
      return;
    }

    const splittedRatio = this.element
      .getAttribute('desktop-aspect-ratio')
      .split(':');
    if (splittedRatio[1] == 0) {
      return;
    }

    const desktopAspectRatio = clamp(
      splittedRatio[0] / splittedRatio[1],
      MIN_CUSTOM_DESKTOP_ONE_PANEL_ASPECT_RATIO,
      MAX_CUSTOM_DESKTOP_ONE_PANEL_ASPECT_RATIO
    );
    setImportantStyles(document.querySelector(':root'), {
      '--i-amphtml-story-desktop-one-panel-ratio': desktopAspectRatio,
    });
    this.storeService_.dispatch(
      Action.SET_DESKTOP_ASPECT_RATIO,
      desktopAspectRatio
    );
  }

  /**
   * Pauses the whole story on viewer visibilityState updates, or tab visibility
   * updates.
   * @private
   */
  pause_() {
    this.setPausedStateToRestore_();
    if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
      this.pauseBackgroundAudio_();
    }
    // If viewer has navigated to the next document, reset the active page.
    if (
      this.getAmpDoc().getVisibilityState() === VisibilityState_Enum.INACTIVE
    ) {
      const resetActivePage = () => {
        this.activePage_.setState(PageState.NOT_ACTIVE);
        this.activePage_.element.setAttribute('active', '');
      };
      this.activePage_
        ? resetActivePage()
        : this.activePageDeferred_.promise.then(() => resetActivePage());
    }
  }

  /**
   * Resumes the whole story on viewer visibilityState updates, or tab
   * visibility updates.
   * @private
   */
  resume_() {
    this.restorePausedState_();
    if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
      this.playBackgroundAudio_();
    }
  }

  /** @private */
  setPausedStateToRestore_() {
    // Preserve if previously set. This method can be called several times when
    // setting the visibilitystate to paused and then inactive.
    if (this.pausedStateToRestore_ === null) {
      this.pausedStateToRestore_ = !!this.storeService_.get(
        StateProperty.PAUSED_STATE
      );
    }
    this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
  }

  /** @private */
  restorePausedState_() {
    this.storeService_.dispatch(
      Action.TOGGLE_PAUSED,
      this.pausedStateToRestore_
    );
    this.pausedStateToRestore_ = null;
  }

  /**
   * Note: runs in the buildCallback vsync mutate context.
   * @private
   */
  initializeStandaloneStory_() {
    // Lock body to prevent overflow.
    this.lockBody_();
    // Standalone CSS affects sizing of the entire page.
    this.onResizeDebounced();
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
   * @private
   */
  rewriteStyles_() {
    // TODO(#15955): Update this to use CssContext from
    // ../../../extensions/amp-animation/0.1/web-animations.js
    if (this.didRewriteStyles_) {
      return;
    }
    this.didRewriteStyles_ = true;
    const styleEl = this.win.document.querySelector('style[amp-custom]');
    if (styleEl) {
      styleEl.textContent = styleEl.textContent.replace(
        /(-?[\d.]+)v(w|h|min|max)/gim,
        'calc($1 * var(--story-page-v$2))'
      );
    }
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
   * @param {boolean} isVisible
   * @private
   */
  buildSystemLayer_(initialPageId, isVisible) {
    this.updateAudioIcon_();
    this.updatePausedIcon_();
    this.element.appendChild(this.systemLayer_.build(initialPageId, isVisible));
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

    this.storeService_.subscribe(StateProperty.ADVANCEMENT_MODE, (mode) => {
      this.variableService_.onVariableUpdate(
        AnalyticsVariable.STORY_ADVANCEMENT_MODE,
        mode
      );
    });

    this.storeService_.subscribe(
      StateProperty.CAN_SHOW_AUDIO_UI,
      (show) => {
        this.element.classList.toggle('i-amphtml-story-no-audio-ui', !show);
      },
      true /** callToInitialize */
    );

    this.element.addEventListener(EventType.SWITCH_PAGE, (e) => {
      // SWITCH_PAGE is fired with each page advancement in preview mode.
      // Before advancing beyond the final page of a preview, we send the
      // viewer a message that the preview has finished. In the SERP, this
      // message can be used to advance to a subsequent story's preview.
      if (this.getAmpDoc().isPreview()) {
        this.sendMessageIfPreviewFinished_();
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

      const storyAdSegmentBranch = getExperimentBranch(
        this.win,
        StoryAdSegmentExp.ID
      );
      if (
        !this.activePage_.isAd() ||
        (storyAdSegmentBranch &&
          storyAdSegmentBranch != StoryAdSegmentExp.CONTROL)
      ) {
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

    this.storeService_.subscribe(StateProperty.PAUSED_STATE, (isPaused) => {
      this.onPausedStateUpdate_(isPaused);
    });

    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.SUBSCRIPTIONS_PAGE_INDEX,
      (subscriptionsPageIndex) => {
        if (subscriptionsPageIndex !== -1) {
          this.subscriptionsPageIndexDeferred_.resolve();
          this.subscriptionsPageIndex_ = subscriptionsPageIndex;
        }
      },
      true
    );

    this.storeService_.subscribe(
      StateProperty.SUBSCRIPTIONS_STATE,
      (subscriptionsState) => {
        if (subscriptionsState === SubscriptionsState.PENDING) {
          return;
        }

        this.subscriptionsStateDeferred_.resolve();
        if (subscriptionsState === SubscriptionsState.GRANTED) {
          this.hideSubscriptionsDialog_();
        }
      }
    );

    this.storeService_.subscribe(
      StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE,
      (dialogState) => {
        if (!dialogState) {
          this.onHideSubscriptionsDialog_();
        }
      }
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
      if (uiState === UIType_Enum.MOBILE) {
        if (!this.allowContextMenuOnMobile_(e.target)) {
          e.preventDefault();
        }
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
        (this.win.history && getWindowHistoryState(this.win.history)) ||
          {} /** data */,
        this.win.document.title /** title */,
        href /** URL */
      );
    });

    // Listen for class mutations on the <body> element.
    const bodyElObserver = new this.win.MutationObserver((mutations) =>
      this.onBodyElMutation_(mutations)
    );
    bodyElObserver.observe(this.win.document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    this.getViewport().onResize(
      debounce(this.win, () => this.onResizeDebounced(), 300)
    );
    this.installGestureRecognizers_();

    // TODO(gmajoulet): migrate this to amp-story-viewer-messaging-handler once
    // there is a way to navigate to pages that does not involve using private
    // amp-story methods.
    this.viewer_.onMessage('selectPage', (data) => this.onSelectPage_(data));
    this.viewer_.onMessage('rewind', () => this.onRewind_());

    if (this.viewerMessagingHandler_) {
      this.viewerMessagingHandler_.startListening();
    }

    new AmpStoryShare(this.win, this.element);
  }

  /**
   * @param {MutationRecord} mutations
   * @private
   */
  onBodyElMutation_(mutations) {
    mutations.forEach((mutation) => {
      const bodyEl = dev().assertElement(mutation.target);

      // Updates presence of the `amp-mode-keyboard-active` class on the store.
      this.storeService_.dispatch(
        Action.TOGGLE_KEYBOARD_ACTIVE_STATE,
        bodyEl.classList.contains('amp-mode-keyboard-active')
      );
    });
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
      const embedComponent = /** @type {InteractiveComponentDef} */ (
        this.storeService_.get(StateProperty.INTERACTIVE_COMPONENT_STATE)
      );
      // TODO(enriqe): Move to a separate file if this keeps growing.
      if (
        embedComponent.state !== EmbeddedComponentState.HIDDEN ||
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

    const orientationWarning = (e) =>
      dev().warn(TAG, 'Failed to lock screen orientation:', e.message);

    // Returns a promise.
    const lockOrientationPromise = screen.orientation?.lock;
    if (lockOrientationPromise) {
      lockOrientationPromise('portrait').catch(orientationWarning);
      return;
    }

    // Returns boolean or undefined.
    const lockOrientation =
      screen.lockOrientation ||
      screen.mozLockOrientation ||
      screen.msLockOrientation ||
      ((unusedOrientation) => {});

    try {
      lockOrientation('portrait');
    } catch (e) {
      orientationWarning(e);
    }
  }

  /** @override */
  layoutCallback() {
    if (!AmpStory.isBrowserSupported(this.win) && !this.platform_.isBot()) {
      return this.displayUnsupportedBrowser_();
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
    const initialPageId = this.getInitialPageId_();

    const shouldShowSystemLayer =
      this.viewer_.getParam('hideProgressBar') !== '1';
    if (!shouldShowSystemLayer) {
      // The default value of `SYSTEM_UI_IS_VISIBLE_STATE` is `true`. We set it
      // to `false` here solely to ensure that a subsequent firing of the
      // `TOGGLE_SYSTEM_UI_IS_VISIBLE` action with a `true` value registers as
      // a change in state instead of being a no-op.
      this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);
    }
    this.buildSystemLayer_(initialPageId, shouldShowSystemLayer);

    this.setThemeColor_();

    const storyLayoutPromise = Promise.all([
      this.initializePages_(),
      // Pauses execution during prerender.
      this.getAmpDoc().whenFirstPreviewedOrVisible(),
    ])
      .then(() => {
        this.handleConsentExtension_();

        this.pages_.forEach((page, index) => {
          page.setState(PageState.NOT_ACTIVE);
          this.upgradeCtaAnchorTagsForTracking_(page, index);
        });
        this.initializeStoryNavigationPath_();

        // Build pagination buttons if they can be displayed.
        if (this.storeService_.get(StateProperty.CAN_SHOW_PAGINATION_BUTTONS)) {
          new PaginationButtons(this);
        }
      })
      .then(() => {
        // Enable paywall if required element found in DOM.
        if (
          isExperimentOn(this.win, 'amp-story-subscriptions') &&
          this.element.querySelector('amp-story-subscriptions') !== null &&
          this.storeService_.get(StateProperty.SUBSCRIPTIONS_STATE) ===
            SubscriptionsState.DISABLED
        ) {
          this.storeService_.dispatch(
            Action.TOGGLE_SUBSCRIPTIONS_STATE,
            SubscriptionsState.PENDING
          );
        }

        // We need to call this.getInitialPageId_() again because the initial
        // page could've changed between the start of layoutStory_ and here.
        return this.switchTo_(
          this.getInitialPageId_(),
          NavigationDirection.NEXT
        );
      })
      .then(() => {
        const shouldReOpenAttachmentForPageId = getHistoryState(
          this.win,
          HistoryState.ATTACHMENT_PAGE_ID
        );

        if (shouldReOpenAttachmentForPageId === this.activePage_.element.id) {
          const attachmentEl = this.activePage_.element.querySelector(
            'amp-story-page-attachment, amp-story-page-outlink'
          );

          if (attachmentEl) {
            whenUpgradedToCustomElement(attachmentEl)
              .then(() => attachmentEl.getImpl())
              .then((attachmentImpl) =>
                attachmentImpl.open(false /** shouldAnimate */)
              );
          }

          const shoppingData = getHistoryState(
            this.win,
            HistoryState.SHOPPING_DATA
          );

          if (shoppingData) {
            this.storeService_.dispatch(Action.ADD_SHOPPING_DATA, {
              'activeProductData': shoppingData,
            });
          }
        }

        if (
          shouldShowStoryUrlInfo(devAssert(this.viewer_), this.storeService_)
        ) {
          const infoDialog = new InfoDialog(this.win, this.element);
          infoDialog.build();
        }
      });

    // Do not block the layout callback on the completion of these promises, as
    // that prevents descendents from being laid out (and therefore loaded).
    this.whenInitialContentLoaded_(INITIAL_CONTENT_LOAD_TIMEOUT_MS).then(() => {
      this.markStoryAsLoaded_();
      this.initializeLiveStory_();
    });

    this.maybeLoadStoryEducation_();

    // Story is being prerendered: resolve the layoutCallback when the active
    // page is built. Other pages will only build if the document becomes
    // visible.
    const initialPageEl = this.element.querySelector(
      `amp-story-page#${escapeCssSelectorIdent(initialPageId)}`
    );
    if (!this.getAmpDoc().hasBeenVisible()) {
      return whenUpgradedToCustomElement(initialPageEl).then(() => {
        return initialPageEl.build();
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

      this.element.addEventListener(AmpEvents_Enum.DOM_UPDATE, () => {
        this.liveStoryManager_.update();
        this.initializePages_().then(() => this.preloadPagesByDistance_());
      });
    }
  }

  /**
   * Retrieves the initial pageId to begin the story with. In order, the
   * initial page for a story should be either a valid page ID in the URL
   * fragment, the page ID in the history, or the first page of the story.
   * @return {?string}
   * @private
   */
  getInitialPageId_() {
    const maybePageId = parseQueryString(this.win.location.hash)['page'];
    if (maybePageId && this.isActualPage_(maybePageId)) {
      return maybePageId;
    }

    const pages = /**  @type {!Array} */ (
      getHistoryState(this.win, HistoryState.NAVIGATION_PATH) || []
    );
    const historyPage = lastItem(pages);
    if (historyPage && this.isActualPage_(historyPage)) {
      return historyPage;
    }

    const firstPageEl = this.element.querySelector('amp-story-page');
    return firstPageEl ? firstPageEl.id : null;
  }

  /**
   * Checks if the amp-story-page for a given ID exists.
   * Note: the `this.pages_` array might not be defined yet.
   * @param {string} pageId
   * @return {boolean}
   * @private
   */
  isActualPage_(pageId) {
    if (this.pages_.length > 0) {
      return this.pages_.some((page) => page.element.id === pageId);
    }
    return !!this.element.querySelector(`#${escapeCssSelectorIdent(pageId)}`);
  }

  /**
   * @param {number} timeoutMs The maximum amount of time to wait, in
   *     milliseconds.
   * @return {!Promise} A promise that is resolved when the initial content is
   *     loaded or the timeout has been exceeded, whichever happens first.
   * @private
   */
  whenInitialContentLoaded_(timeoutMs = 0) {
    const initialPageEl = this.element.querySelector(
      `amp-story-page#${escapeCssSelectorIdent(this.getInitialPageId_())}`
    );
    const storyLoadPromise = whenUpgradedToCustomElement(initialPageEl).then(
      () => {
        return initialPageEl.signals().whenSignal(CommonSignals_Enum.LOAD_END);
      }
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
    this.viewerMessagingHandler_ &&
      this.viewerMessagingHandler_.send('storyContentLoaded', {});
    this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.STORY_CONTENT_LOADED
    );
    this.signals().signal(CommonSignals_Enum.INI_LOAD);
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

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }

  /**
   * @return {!Promise}
   * @private
   */
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
    this.activePage_
      ? this.activePage_.next(opt_isAutomaticAdvance)
      : this.activePageDeferred_.promise.then(() =>
          this.activePage_.next(opt_isAutomaticAdvance)
        );
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
      this.viewerMessagingHandler_.send('selectDocument', {
        'next': true,
        'advancementMode': advancementMode,
      });
      return;
    }
  }

  /**
   * Go back to the previous screen in the story, if there is one.
   * @private
   */
  previous_() {
    this.activePage_
      ? this.activePage_.previous()
      : this.activePageDeferred_.promise.then(() =>
          this.activePage_.previous()
        );
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
      this.viewerMessagingHandler_.send('selectDocument', {
        'previous': true,
        'advancementMode': advancementMode,
      });
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

    // Block until the subscriptions page index gets resolved.
    const subscriptionsState = this.storeService_.get(
      StateProperty.SUBSCRIPTIONS_STATE
    );
    if (
      subscriptionsState !== SubscriptionsState.DISABLED &&
      this.subscriptionsPageIndex_ === -1
    ) {
      return this.blockOnPendingSubscriptionsData_(
        this.subscriptionsPageIndexDeferred_,
        targetPageId,
        direction
      );
    }
    // Block until the subscription state gets resolved.
    if (
      pageIndex >= this.subscriptionsPageIndex_ &&
      subscriptionsState === SubscriptionsState.PENDING
    ) {
      return this.blockOnPendingSubscriptionsData_(
        this.subscriptionsStateDeferred_,
        targetPageId,
        direction
      );
    }
    // Navigation to the locked pages after the paywall page should be redirected to the paywall page.
    // This is necessary for deeplinking case to make sure the paywall dialog shows on the paywall page.
    if (
      pageIndex > this.subscriptionsPageIndex_ &&
      subscriptionsState === SubscriptionsState.BLOCKED
    ) {
      this.pageAfterSubscriptionsGranted_ = targetPageId;
      this.showSubscriptionsDialog_();
      return this.switchTo_(
        this.pages_[this.subscriptionsPageIndex_].element.id,
        direction
      );
    }
    // Maybe show paywall after timeout or hide paywall if switching back to previous pages.
    this.maybeToggleSubscriptionsDialog_(targetPageId, pageIndex);

    const oldPage = this.activePage_;
    this.activePage_ = targetPage;
    this.activePageDeferred_.resolve();
    if (!targetPage.isAd()) {
      this.updateNavigationPath_(targetPageId, direction);
    }

    this.backgroundBlur_?.update(targetPage.element);

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

        this.storeService_.dispatch(Action.TOGGLE_AD, targetPage.isAd());
        if (targetPage.isAd()) {
          setAttributeInMutate(this, Attributes.AD_SHOWING);
        } else {
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
          index: pageIndex,
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
        this.preloadPagesByDistance_(/* prioritizeActivePage */ !oldPage);
        this.triggerActiveEventForPage_();
      },
    ];

    return new Promise((resolve) => {
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
  }

  /**
   * Updates the story navigation stack and checks for navigation adherence to
   * the path a user takes.
   * @param {string} targetPageId
   * @param {!NavigationDirection} direction
   * @private
   */
  updateNavigationPath_(targetPageId, direction) {
    const navigationPath = /** @type {!Array<string>} */ (
      this.storeService_.get(StateProperty.NAVIGATION_PATH)
    );

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

  /** @private */
  triggerActiveEventForPage_() {
    // TODO(alanorozco): pass event priority once amphtml-story repo is merged
    // with upstream.
    Services.actionServiceForDoc(this.element).trigger(
      this.activePage_.element,
      'active',
      /* event */ null,
      ActionTrust_Enum.HIGH
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

  /** @private */
  onHideSubscriptionsDialog_() {
    this.showSubscriptionsUITimeout_ &&
      clearTimeout(this.showSubscriptionsUITimeout_);
    this.showSubscriptionsUITimeout_ = null;
    if (
      this.pageAfterSubscriptionsGranted_ &&
      this.storeService_.get(StateProperty.SUBSCRIPTIONS_STATE) ===
        SubscriptionsState.GRANTED
    ) {
      this.switchTo_(
        this.pageAfterSubscriptionsGranted_,
        NavigationDirection.NEXT
      );
    }
    this.pageAfterSubscriptionsGranted_ = null;
  }

  /**
   * Block while waiting to resolve subscriptions state.
   * @param {Promise} subscriptionsDataDeferred
   * @param {string} targetPageId
   * @param {!NavigationDirection} direction
   * @return {!Promise}
   * @private
   */
  blockOnPendingSubscriptionsData_(
    subscriptionsDataDeferred,
    targetPageId,
    direction
  ) {
    return subscriptionsDataDeferred.promise.then(() =>
      this.switchTo_(targetPageId, direction)
    );
  }

  /**
   * @private
   */
  showSubscriptionsDialog_() {
    this.storeService_.dispatch(
      Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE,
      true
    );
  }

  /**
   * @private
   */
  hideSubscriptionsDialog_() {
    this.storeService_.dispatch(
      Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE,
      false
    );
  }

  /**
   * Show paywall dialog after delay or hide paywall dialog if tapping back to unlocked pages.
   * @param {string} targetPageId
   * @param {number} pageIndex
   * @private
   */
  maybeToggleSubscriptionsDialog_(targetPageId, pageIndex) {
    const subscriptionsDialogUIState = this.storeService_.get(
      StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE
    );
    // Navigation to the paywall page should show dialog after delay if not already shown.
    if (
      pageIndex === this.subscriptionsPageIndex_ &&
      !subscriptionsDialogUIState &&
      this.storeService_.get(StateProperty.SUBSCRIPTIONS_STATE) ===
        SubscriptionsState.BLOCKED
    ) {
      this.showSubscriptionsUITimeout_ = setTimeout(() => {
        this.pageAfterSubscriptionsGranted_ = targetPageId;
        this.showSubscriptionsDialog_();
        this.showSubscriptionsUITimeout_ = null;
      }, SUBSCRIPTIONS_DELAY_DURATION);
    }
    // Hide paywall UI when navigating back to the previous page.
    if (
      pageIndex < this.subscriptionsPageIndex_ &&
      subscriptionsDialogUIState
    ) {
      this.hideSubscriptionsDialog_();
    }
  }

  /**
   * Handles all key presses within the story.
   * @param {!Event} e The keydown event.
   * @private
   */
  onKeyDown_(e) {
    if (matches(e.target, IGNORE_KEYDOWN_EVENT_TARGET)) {
      return;
    }
    this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE
    );

    const rtlState = this.storeService_.get(StateProperty.RTL_STATE);

    switch (e.key) {
      case Keys_Enum.LEFT_ARROW:
        rtlState ? this.next_() : this.previous_();
        break;
      case Keys_Enum.RIGHT_ARROW:
        rtlState ? this.previous_() : this.next_();
        break;
    }
  }

  /**
   * Handle resize events and set the story's desktop state.
   * @visibleForTesting
   */
  onResizeDebounced() {
    this.uiState_ = this.getUIType_();
    this.storeService_.dispatch(Action.TOGGLE_UI, this.uiState_);

    const isLandscape = this.isLandscape_();
    const isLandscapeSupported = this.isLandscapeSupported_();
    this.setOrientationAttribute_(isLandscape, isLandscapeSupported);
  }

  /**
   * Handles resize events and sets CSS variables.
   * @param {!Object} size including new width and height
   * @private
   */
  polyfillDvh_(size) {
    const {height} = size;
    if (height === 0) {
      return;
    }
    setImportantStyles(this.win.document.documentElement, {
      '--story-dvh': px(height / 100),
    });
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
   * Reacts to the browser tab becoming active/inactive.
   * @private
   */
  onVisibilityChanged_() {
    const vState = this.getAmpDoc().getVisibilityState();
    const isPreview = vState === VisibilityState_Enum.PREVIEW;
    const isVisible = vState === VisibilityState_Enum.VISIBLE;

    if (isPreview) {
      this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);
    }
    if (isVisible) {
      this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, true);
    }

    isPreview || isVisible ? this.resume_() : this.pause_();
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
   * @param {!UIType_Enum} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.backgroundBlur_?.detach();
    this.backgroundBlur_ = null;
    switch (uiState) {
      case UIType_Enum.MOBILE:
        this.vsync_.mutate(() => {
          this.win.document.documentElement.setAttribute(
            'i-amphtml-story-mobile',
            ''
          );
          this.element.removeAttribute('desktop');
          this.element.classList.remove('i-amphtml-story-desktop-fullbleed');
          this.element.classList.remove('i-amphtml-story-desktop-one-panel');
        });
        break;
      case UIType_Enum.DESKTOP_ONE_PANEL:
        if (!this.backgroundBlur_) {
          this.backgroundBlur_ = new BackgroundBlur(this.win, this.element);
          this.backgroundBlur_.attach();
          if (this.activePage_) {
            this.backgroundBlur_.update(this.activePage_.element);
          }
        }
        this.vsync_.mutate(() => {
          this.rewriteStyles_();
          this.win.document.documentElement.removeAttribute(
            'i-amphtml-story-mobile'
          );
          this.element.removeAttribute('desktop');
          this.element.classList.add('i-amphtml-story-desktop-one-panel');
          this.element.classList.remove('i-amphtml-story-desktop-fullbleed');
        });
        break;
      case UIType_Enum.DESKTOP_FULLBLEED:
        this.vsync_.mutate(() => {
          this.win.document.documentElement.removeAttribute(
            'i-amphtml-story-mobile'
          );
          this.element.setAttribute('desktop', '');
          this.element.classList.add('i-amphtml-story-desktop-fullbleed');
          this.element.classList.remove('i-amphtml-story-desktop-one-panel');
        });
        break;
      // Because of the DOM mutations, switching from this mode to another is
      // not allowed, and prevented within the store service.
      case UIType_Enum.VERTICAL:
        const pageAttachments = scopedQuerySelectorAll(
          this.element,
          'amp-story-page amp-story-page-attachment'
        );

        this.vsync_.mutate(() => {
          this.rewriteStyles_();
          this.element.setAttribute('i-amphtml-vertical', '');
          this.win.document.documentElement.classList.add(
            'i-amphtml-story-vertical'
          );
          setImportantStyles(this.win.document.body, {height: 'auto'});
          this.win.document.documentElement.removeAttribute(
            'i-amphtml-story-mobile'
          );
          this.element.removeAttribute('desktop');
          this.element.classList.remove('i-amphtml-story-desktop-fullbleed');
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
          .whenSignal(CommonSignals_Enum.LOAD_END)
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
   * @return {!UIType_Enum}
   * @private
   */
  getUIType_() {
    if (
      this.uiState_ === UIType_Enum.MOBILE &&
      this.androidSoftKeyboardIsProbablyOpen_()
    ) {
      // The opening of the Android soft keyboard triggers a viewport resize
      // that can cause the story's dimensions to appear to be those of a
      // desktop. Here, we assume that the soft keyboard is open if the latest
      // UI state is mobile while an input element has focus, and we then
      // ensure that the UI type does not unintentionally alter.
      return UIType_Enum.MOBILE;
    }

    if (this.platform_.isBot()) {
      return UIType_Enum.VERTICAL;
    }

    if (!this.isDesktop_()) {
      return UIType_Enum.MOBILE;
    }

    if (this.isLandscapeSupported_()) {
      return UIType_Enum.DESKTOP_FULLBLEED;
    }

    // Desktop one panel UI (default).
    return UIType_Enum.DESKTOP_ONE_PANEL;
  }

  /**
   * Returns whether the Android soft keyboard is most likely open, as
   * calculated using multiple factors. Note that this calculation will
   * incorrectly return true in cases where the user has manually dismissed the
   * keyboard while retaining focus on a text field.
   * @return {boolean}
   * @private
   */
  androidSoftKeyboardIsProbablyOpen_() {
    const platformIsAndroid = this.platform_.isAndroid();
    const tagNamesThatTriggerKeyboard = ['INPUT', 'TEXTAREA'];
    const textFieldHasFocus = tagNamesThatTriggerKeyboard.includes(
      this.win.document.activeElement?.tagName
    );
    return platformIsAndroid && textFieldHasFocus;
  }

  /**
   * @return {boolean} True if the screen size matches the desktop media query.
   * @private
   */
  isDesktop_() {
    return this.desktopOnePanelMedia_.matches && !this.platform_.isBot();
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
   * Displays the publisher [fallback] element if provided, or renders our own
   * unsupported browser layer.
   * @return {!Promise|undefined}
   * @private
   */
  displayUnsupportedBrowser_() {
    this.setPausedStateToRestore_();
    if (this.getFallback()) {
      this.toggleFallback(true);
      return;
    }
    // Provide "continue anyway" button only when rendering our own layer.
    // Publisher provided fallbacks do not allow users to continue.
    const continueAnyway = () => {
      this.layoutStory_().then(() => {
        this.restorePausedState_();
        this.mutateElement(() => {
          removeElement(layer);
        });
      });
    };
    const layer = renderUnsupportedBrowserLayer(this.element, continueAnyway);
    return this.mutateElement(() => {
      this.element.appendChild(layer);
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
   * @param {!{[key: string]: number}} map A mapping from pageId to its distance
   *     from the active page.
   * @param {string} pageId The page to be added to the map.
   * @return {!{[key: string]: number}} A mapping from page ID to the priority of
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

  /**
   * @param {boolean=} prioritizeActivePage
   * @private
   */
  preloadPagesByDistance_(prioritizeActivePage = false) {
    if (this.platform_.isBot()) {
      this.pages_.forEach((page) => {
        page.setDistance(0);
      });
      return;
    }

    const pagesByDistance = this.getPagesByDistance_();

    const preloadAllPages = () => {
      pagesByDistance.forEach((pageIds, distance) => {
        pageIds.forEach((pageId) => {
          const page = this.getPageById(pageId);
          page.setDistance(distance);
        });
      });
    };

    this.mutateElement(() => {
      if (!prioritizeActivePage) {
        return preloadAllPages();
      }

      const activePageId = devAssert(pagesByDistance[0][0]);
      new Promise((res, rej) => {
        const page = this.getPageById(activePageId);
        page.setDistance(0);
        page.signals().whenSignal(CommonSignals_Enum.LOAD_END).then(res);
        // Don't call preload if user navigates before page loads, since the navigation will call preload properly.
        this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, rej);
      }).then(
        () => preloadAllPages(),
        () => {}
      );
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
      .whenSignal(CommonSignals_Enum.LOAD_END)
      .then(() => {
        backgroundAudioEl = /** @type {!HTMLMediaElement} */ (
          backgroundAudioEl
        );
        this.mediaPool_.register(backgroundAudioEl);
        return this.mediaPool_.preload(backgroundAudioEl);
      })
      .then(() => {
        this.backgroundAudioEl_ = /** @type {!HTMLMediaElement} */ (
          childElement(this.element, (el) => {
            return el.tagName.toLowerCase() === 'audio';
          })
        );
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
      this.element.appendChild(<amp-story-education />);
    });

    Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-story-education'
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
    let startingElement = element;
    // If the element is inside an iframe (most likely an ad), start from the
    // containing iframe element.
    if (element.ownerDocument !== this.win.document) {
      startingElement = element.ownerDocument.defaultView.frameElement;
    }

    const pageIndex = findIndex(this.pages_, (page) => {
      const pageEl = closest(startingElement, (el) => {
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
    const videoMediaElementsCount =
      this.element.querySelectorAll('amp-video').length;

    // The root element (amp-story) might have a background-audio as well.
    if (this.element.hasAttribute('background-audio')) {
      audioMediaElementsCount++;
    }

    return {
      [MediaType_Enum.AUDIO]: Math.min(
        audioMediaElementsCount + MINIMUM_AD_MEDIA_ELEMENTS,
        MAX_MEDIA_ELEMENT_COUNTS[MediaType_Enum.AUDIO]
      ),
      [MediaType_Enum.VIDEO]: Math.min(
        videoMediaElementsCount + MINIMUM_AD_MEDIA_ELEMENTS,
        MAX_MEDIA_ELEMENT_COUNTS[MediaType_Enum.VIDEO]
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
   * Update the store if the story has background audio.
   * @private
   */
  updateAudioIcon_() {
    const storyHasBackgroundAudio =
      this.element.hasAttribute('background-audio');
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

    const storyHasBackgroundAudio =
      this.element.hasAttribute('background-audio');

    this.storeService_.dispatch(
      Action.TOGGLE_STORY_HAS_PLAYBACK_UI,
      containsElementsWithPlayback || storyHasBackgroundAudio
    );
  }

  /**
   * Handles the rewind viewer event.
   * @private
   */
  onRewind_() {
    this.signals()
      .whenSignal(CommonSignals_Enum.LOAD_END)
      .then(() => this.replay_());
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
    } else if (data['delta']) {
      this.switchDelta_(data['delta']);
    } else if (data['id']) {
      this.switchTo_(
        data['id'],
        this.getPageIndexById(data['id']) > this.getPageIndex(this.activePage_)
          ? NavigationDirection.NEXT
          : NavigationDirection.PREVIOUS
      );
    }
  }

  /**
   * Switches to a page in the story given a delta. If new index is out of
   * bounds, it will go to the last or first page (depending on direction).
   * @param {number} delta
   * @private
   */
  switchDelta_(delta) {
    const currentPageIdx = this.storeService_.get(
      StateProperty.CURRENT_PAGE_INDEX
    );

    const newPageIdx =
      delta > 0
        ? Math.min(this.pages_.length - 1, currentPageIdx + delta)
        : Math.max(0, currentPageIdx + delta);
    const targetPage = this.pages_[newPageIdx];

    if (
      !this.isActualPage_(targetPage && targetPage.element.id) ||
      newPageIdx === currentPageIdx
    ) {
      return;
    }

    const direction =
      newPageIdx > currentPageIdx
        ? NavigationDirection.NEXT
        : NavigationDirection.PREVIOUS;

    this.switchTo_(targetPage.element.id, direction);
  }

  /**
   * Checks for the the storyNavigationPath stack in the history.
   * @private
   */
  initializeStoryNavigationPath_() {
    let navigationPath = getHistoryState(
      this.win,
      HistoryState.NAVIGATION_PATH
    );
    if (
      !navigationPath ||
      !navigationPath.every((pageId) => this.isActualPage_(pageId))
    ) {
      navigationPath = [];
    }
    this.storeService_.dispatch(Action.SET_NAVIGATION_PATH, navigationPath);
  }

  /** @private */
  replay_() {
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

      ctaAnchorEls.forEach((ctaAnchorEl) => {
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

    // Adjust the page's position in this.pages_ array to reflect the actual.
    const insertedPageIndex = this.getPageIndexById(pageToBeInsertedId);
    if (insertedPageIndex != -1) {
      this.pages_.splice(insertedPageIndex, 1);
    }
    this.pages_.splice(
      this.getPageIndexById(pageBeforeId) + 1,
      0,
      pageToBeInserted
    );

    this.storeService_.dispatch(
      Action.SET_PAGE_IDS,
      this.pages_.map((el) => el.element.id)
    );
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
    if (isEsm()) {
      // Browsers that run the ESM build are should support the features
      // detected below.
      // If the logic changes so that ESM browsers do not pass support detection,
      // this optimization should be removed.
      return true;
    }
    return Boolean(
      win.CSS &&
        win.CSS.supports &&
        win.CSS.supports('display', 'grid') &&
        win.CSS.supports('color', 'var(--test)')
    );
  }

  /**
   * Loads amp-story-dev-tools if it is enabled.
   * @private
   * @return {boolean}
   */
  maybeLoadStoryDevTools_() {
    if (
      !isModeDevelopment(this.win) ||
      this.element.getAttribute('mode') === 'inspect'
    ) {
      return false;
    }

    this.element.setAttribute('mode', 'inspect');

    const devToolsEl = <amp-story-dev-tools />;
    this.win.document.body.appendChild(devToolsEl);
    this.element.setAttribute('hide', '');

    Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-story-dev-tools'
    );
    return true;
  }

  /**
   * Should enable the context menu (long press) on the element passed.
   * @private
   * @param {!Element} element
   * @return {boolean}
   */
  allowContextMenuOnMobile_(element) {
    // Match page attachments with links.
    return !!closest(
      element,
      (e) => matches(e, 'a.i-amphtml-story-page-open-attachment[href]'),
      this.element
    );
  }

  /**
   * Adds the localization string bundles to the localization service.
   * @private
   */
  installLocalizationStrings_() {
    const localizationService = getLocalizationService(this.element);
    const storyLanguages = localizationService.getLanguageCodesForElement(
      this.element
    );
    if (this.maybeRegisterInlineLocalizationStrings_(storyLanguages[0])) {
      return;
    }
    this.fetchLocalizationStrings_(storyLanguages);
  }

  /**
   * If there are inline localization strings, register as current document language.
   * @param {string} languageCode
   * @return {boolean}
   * @private
   */
  maybeRegisterInlineLocalizationStrings_(languageCode) {
    const inlineStringsEl = this.win.document.querySelector(
      'script[amp-localization="amp-story"]'
    );
    if (
      inlineStringsEl?.getAttribute('i-amphtml-version') !==
      getMode(this.win).rtvVersion
    ) {
      return false;
    }
    const stringsOrNull = tryParseJson(inlineStringsEl.textContent);

    if (!stringsOrNull) {
      return false;
    }
    const localizationService = getLocalizationService(this.element);
    localizationService.registerLocalizedStringBundles({
      [languageCode]: stringsOrNull,
    });
    return true;
  }

  /**
   * Fetches from the CDN or localhost the localization strings.
   * @param {string[]} candidateLanguageCodes
   * @private
   */
  fetchLocalizationStrings_(candidateLanguageCodes) {
    const localizationService = getLocalizationService(this.element);
    const languageCode = getSupportedLanguageCode(candidateLanguageCodes);

    const localizationUrl = calculateExtensionFileUrl(
      this.win,
      this.win.location,
      `amp-story.${languageCode}.json`,
      getMode(this.win).localDev
    );

    Services.xhrFor(this.win)
      .fetchJson(localizationUrl, {prerenderSafe: true})
      .then((res) => res.json())
      .then((json) =>
        localizationService.registerLocalizedStringBundles({
          [languageCode]: json,
        })
      )
      .catch((err) => {
        devError(TAG, err, 'Bundle not found for language ' + languageCode);
      });
  }

  /**
   * @return {number} The index of the last page that should be shown in
   *     preview mode.
   * @private
   */
  calculateIndexOfLastPageToPreview_() {
    const minPreviewPages =
      parseInt(this.viewer_?.getParam('minPreviewPages'), 10) ||
      DEFAULT_MIN_PAGES_TO_PREVIEW;
    const pctPagesToPreview =
      parseInt(this.viewer_?.getParam('pctPagesToPreview'), 10) ||
      DEFAULT_PCT_PAGES_TO_PREVIEW;

    // We calculate the number of preview pages by taking the larger of the two
    // values: min # of preview pages vs the % of pages to show.
    const numPages = this.element.querySelectorAll('amp-story-page').length;
    let numPreviewPages = Math.ceil((pctPagesToPreview / 100) * numPages);
    numPreviewPages = Math.max(minPreviewPages, numPreviewPages);
    numPreviewPages = clamp(numPreviewPages, 1, numPages);

    return numPreviewPages - 1;
  }

  /**
   * Sends the 'storyPreviewFinished' viewer message if the active page is
   * supposed to be the last page shown in the preview.
   * @private
   */
  sendMessageIfPreviewFinished_() {
    const activePageIdx = this.pages_.indexOf(this.activePage_);
    const isPreviewFinished = activePageIdx >= this.indexOfLastPageToPreview_;
    if (isPreviewFinished) {
      this.viewerMessagingHandler_?.send('storyPreviewFinished', {});
    }
  }
}

AMP.extension('amp-story', '1.0', (AMP) => {
  if (isSsrCss()) {
    AMP.registerElement('amp-story', AmpStory);
  } else {
    AMP.registerElement('amp-story', AmpStory, CSS);
  }
  AMP.registerElement('amp-story-consent', AmpStoryConsent);
  AMP.registerElement('amp-story-grid-layer', AmpStoryGridLayer);
  AMP.registerElement('amp-story-page', AmpStoryPage);
});
