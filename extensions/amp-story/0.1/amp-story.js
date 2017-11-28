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
import './amp-story-grid-layer';
import './amp-story-page';
import {AmpStoryAnalytics} from './analytics';
import {AmpStoryVariableService} from './variable-service';
import {AmpStoryBackground} from './background';
import {Bookend} from './bookend';
import {CSS} from '../../../build/amp-story-0.1.css';
import {EventType} from './events';
import {KeyCodes} from '../../../src/utils/key-codes';
import {NavigationState} from './navigation-state';
import {SystemLayer} from './system-layer';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {relatedArticlesFromJson} from './related-articles';
import {ShareWidget} from './share';
import {
  closest,
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  scopedQuerySelector,
  scopedQuerySelectorAll,
  removeElement,
} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {once} from '../../../src/utils/function';
import {debounce} from '../../../src/utils/rate-limit';
import {isExperimentOn, toggleExperiment} from '../../../src/experiments';
import {registerServiceBuilder} from '../../../src/service';
import {upgradeBackgroundAudio} from './audio';
import {setStyle, setImportantStyles} from '../../../src/style';
import {findIndex} from '../../../src/utils/array';
import {ActionTrust} from '../../../src/action-trust';
import {getMode} from '../../../src/mode';
import {getSourceOrigin, parseUrl} from '../../../src/url';
import {stringHash32} from '../../../src/string';
import {AmpStoryHint} from './amp-story-hint';
import {Gestures} from '../../../src/gesture';
import {SwipeXYRecognizer} from '../../../src/gesture-recognizers';
import {dict} from '../../../src/utils/object';
import {renderSimpleTemplate} from './simple-template';
import {MediaPool, MediaType} from './media-pool';

/** @private @const {string} */
const PRE_ACTIVE_PAGE_ATTRIBUTE_NAME = 'pre-active';

/** @private @const {string} */
const BOOKEND_CONFIG_ATTRIBUTE_NAME = 'bookend-config-src';

/** @private @const {string} */
const AMP_STORY_STANDALONE_ATTRIBUTE = 'standalone';

/** @private @const {number} */
const FULLSCREEN_THRESHOLD = 1024;

/** @private @const {number} */
const DESKTOP_WIDTH_THRESHOLD = 1024;

/** @private @const {number} */
const DESKTOP_HEIGHT_THRESHOLD = 550;

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

/** @type {string} */
const NEXT_BUTTON_CLASS = 'i-amphtml-story-button-move'
    + ' i-amphtml-story-button-next';

/** @type {string} */
const PREV_BUTTON_CLASS = 'i-amphtml-story-button-move'
    + ' i-amphtml-story-button-prev i-amphtml-story-button-move-hidden';

const PAGE_SWITCH_BUTTONS = [
  {
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-button-container next-container'}),
    children: [
      {
        tag: 'button',
        attrs: dict({'class': NEXT_BUTTON_CLASS}),
      },
    ],
  },
  {
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-button-container prev-container'}),
    children: [
      {
        tag: 'button',
        attrs: dict({'class': PREV_BUTTON_CLASS}),
      },
    ],
  },
];

export class AmpStory extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!NavigationState} */
    this.navigationState_ = new NavigationState();

    /**
     * Whether entering into fullscreen automatically on navigation is enabled.
     * @private {boolean}
     */
    this.isAutoFullScreenEnabled_ =
        isExperimentOn(this.win, 'amp-story-auto-fullscreen');

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

    /** @private {?Element} */
    this.nextButton_ = null;

    /** @private {?Element} */
    this.prevButton_ = null;

    /** @private {?Element} */
    this.topBar_ = null;

    /** @private {?ShareWidget} */
    this.shareWidget_ = null;

    /** @private {?function()} */
    this.boundOnResize_ = null;

    /** @private @const {!Array<string>} */
    this.originWhitelist_ = [
      '3451824873', '834917366', '4273375831', '750731789', '3322156041',
      '878041739', '2199838184', '708478954', '142793127', '2414533450',
      '212690086',
    ];

    /** @private {!AmpStoryHint} */
    this.ampStoryHint_ = new AmpStoryHint(this.win);

    /** @private {!MediaPool} */
    this.mediaPool_ = new MediaPool(this.win, MAX_MEDIA_ELEMENT_COUNTS,
        element => this.getElementDistanceFromActivePage_(element));
  }


  /** @override */
  buildCallback() {
    this.assertAmpStoryExperiment_();

    if (this.element.hasAttribute(AMP_STORY_STANDALONE_ATTRIBUTE)) {
      this.getAmpDoc().win.document.documentElement.classList
          .add('i-amphtml-story-standalone');

      // Lock body to prevent overflow.
      this.lockBody_();
    }

    this.initializeListeners_();
    this.initializeListenersForDev_();

    this.navigationState_.observe(stateChangeEvent =>
        (new AmpStoryAnalytics(this.element)).onStateChange(stateChangeEvent));

    this.navigationState_.observe(stateChangeEvent =>
        this.variableService_.onStateChange(stateChangeEvent));

    // Mute `amp-story` in beginning.
    this.mute_();

    upgradeBackgroundAudio(this.element);

    registerServiceBuilder(this.win, 'story-variable',
        () => this.variableService_);
  }


  /**
   * Builds the system layer DOM.  This is dependent on the pages_ array having
   * been initialized, so it cannot happen at build time.
   * @private
   */
  buildSystemLayer_() {
    this.element.appendChild(this.systemLayer_.build(this.getPageCount()));
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
    this.element.addEventListener(EventType.EXIT_FULLSCREEN, () => {
      this.exitFullScreen_(/* opt_explicitUserAction */ true);
    });

    this.element.addEventListener(EventType.ENTER_FULLSCREEN, () => {
      this.enterFullScreen_();
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
      const targetPageId = e.detail.targetPageId;

      if (targetPageId === 'i-amphtml-story-bookend') {
        this.showBookend_();
      } else {
        this.switchTo_(targetPageId);
      }

      this.ampStoryHint_.hideAllNavigationHint();
    });

    this.element.addEventListener(EventType.PAGE_PROGRESS, e => {
      const pageId = e.detail.pageId;
      const progress = e.detail.progress;

      if (pageId !== this.activePage_.element.id) {
        // Ignore progress update events from inactive pages.
        return;
      }

      const pageIndex = this.getPageIndexById_(pageId);
      this.systemLayer_.updateProgress(pageIndex, progress);
    });

    this.element.addEventListener(EventType.REPLAY, () => {
      this.replay_();
    });

    this.element.addEventListener(EventType.SHOW_NO_PREVIOUS_PAGE_HELP, () => {
      this.ampStoryHint_.showFirstPageHintOverlay();
    });

    const gestures = Gestures.get(this.element,
        /* shouldNotPreventDefault */ true);

    gestures.onGesture(SwipeXYRecognizer, () => {
      if (this.bookend_.isActive()) {
        return;
      }
      this.ampStoryHint_.showNavigationOverlay();
    });

    this.win.document.addEventListener('keydown', e => {
      this.onKeyDown_(e);
    }, true);

    this.win.document.addEventListener('fullscreenchange',
        () => { this.onFullscreenChanged_(); });

    this.win.document.addEventListener('webkitfullscreenchange',
        () => { this.onFullscreenChanged_(); });

    this.win.document.addEventListener('mozfullscreenchange',
        () => { this.onFullscreenChanged_(); });

    this.boundOnResize_ = debounce(this.win, () => this.onResize(), 300);
    this.getViewport().onResize(this.boundOnResize_);
    this.onResize();
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

    lockOrientation('portrait');
  }

  /** @private */
  buildButtons_() {
    this.element.insertBefore(
        renderSimpleTemplate(this.win.document, PAGE_SWITCH_BUTTONS),
        this.element.firstChild);

    this.nextButton_ =
        this.element.querySelector('.i-amphtml-story-button-next');

    this.prevButton_ =
        this.element.querySelector('.i-amphtml-story-button-prev');

    this.nextButton_.addEventListener('click', () => {
      this.next_();
    });

    this.prevButton_.addEventListener('click', () => {
      this.previous_();
    });
  }

  /** @private */
  buildTopBar_() {
    const doc = this.element.ownerDocument;
    this.topBar_ = doc.createElement('div');
    this.topBar_.classList.add('i-amphtml-story-top');

    const share = doc.createElement('div');
    share.classList.add('i-amphtml-story-share');

    this.shareWidget_ = new ShareWidget(this.win);
    share.appendChild(this.shareWidget_.build(this.getAmpDoc()));

    this.loadBookendConfig_().then(bookendConfig => {
      if (bookendConfig !== null) {
        this.shareWidget_.setProviders(bookendConfig.shareProviders);
      }
    });

    this.topBar_.appendChild(share);
    this.element.insertBefore(this.topBar_, this.element.firstChild);
  }

  /** @override */
  layoutCallback() {
    const firstPageEl = user().assertElement(
        scopedQuerySelector(this.element, 'amp-story-page'),
        'Story must have at least one page.');

    return this.initializePages_()
        .then(() => this.buildSystemLayer_())
        .then(() => this.buildHintLayer_())
        .then(() => {
          this.pages_.forEach(page => {
            page.setActive(false);
          });
        })
        .then(() => this.switchTo_(firstPageEl.id))
        .then(() => this.preloadPagesByDistance_());
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
        scopedQuerySelectorAll(this.element, 'amp-story-page'),
        (pageEl, index) => {
          return pageEl.getImpl().then(pageImpl => {
            this.pages_[index] = pageImpl;
            pageImpl.setMediaPool(this.mediaPool_);
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
    activePage.next();
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
   * Switches to a particular page.
   * @param {string} targetPageId
   * @return {!Promise}
   */
  // TODO(newmuis): Update history state
  switchTo_(targetPageId) {
    if (this.bookend_.isActive()) {
      // Disallow switching pages while the bookend is active.
      return Promise.resolve();
    }

    const targetPage = this.getPageById_(targetPageId);
    const pageIndex = this.getPageIndex(targetPage);

    if (this.prevButton_) {
      this.prevButton_.classList.toggle(
          'i-amphtml-story-button-move-hidden', pageIndex === 0);
    }

    this.updateBackground_(targetPage.element);

    if (this.shouldEnterFullScreenOnSwitch_()) {
      this.enterFullScreen_();
    }

    // TODO(alanorozco): decouple this using NavigationState
    this.systemLayer_.setActivePageIndex(pageIndex);

    // TODO(alanorozco): check if autoplay
    this.navigationState_.updateActivePage(pageIndex, targetPage.element.id);

    const oldPage = this.activePage_;

    // TODO(cvializ): Move this to the page class?
    const activePriorSibling = targetPage.element.previousElementSibling;
    const previousActivePriorSibling = scopedQuerySelector(
        this.element, `[${PRE_ACTIVE_PAGE_ATTRIBUTE_NAME}]`);

    return this.mutateElement(() => {
      this.activePage_ = targetPage;
      this.triggerActiveEventForPage_();
      this.systemLayer_.resetDeveloperLogs();
      this.systemLayer_.setDeveloperLogContextString(
          this.activePage_.element.id);
    })
        .then(() => targetPage.beforeVisible())
        .then(() => {
          if (oldPage) {
            oldPage.setActive(false);
          }
          targetPage.setActive(true);

          if (activePriorSibling &&
              activePriorSibling.matches('amp-story-page')) {
            activePriorSibling.setAttribute(PRE_ACTIVE_PAGE_ATTRIBUTE_NAME, '');
          }
          if (previousActivePriorSibling) {
            previousActivePriorSibling.removeAttribute(
                PRE_ACTIVE_PAGE_ATTRIBUTE_NAME);
          }
        })
        .then(() => this.preloadPagesByDistance_())
        .then(() => this.reapplyMuting_())
        .then(() => this.forceRepaintForSafari_());
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
    if (platform.isSafari() || platform.isIos()) {
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
  }


  /**
   * @return {boolean}
   * @private
   */
  shouldEnterFullScreenOnSwitch_() {
    if (this.isDesktop_()) {
      return false;
    }

    const {width, height} = this.getViewport().getSize();

    const inFullScreenThreshold =
        width <= FULLSCREEN_THRESHOLD && height <= FULLSCREEN_THRESHOLD;

    return inFullScreenThreshold && this.isAutoFullScreenEnabled_;
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
   * @param {boolean} isEnabled
   */
  setAutoFullScreen(isEnabled) {
    this.isAutoFullScreenEnabled_ = isEnabled;
  }


  /** @private */
  enterFullScreen_() {
    fullscreenEnter(this.element);
  }


  /**
   * @param {boolean=} opt_explicitUserAction
   * @private
   */
  exitFullScreen_(opt_explicitUserAction) {
    if (opt_explicitUserAction) {
      this.setAutoFullScreen(false);
    }

    fullscreenExit(this.element);
  }


  /**
   * Invoked when the document has actually transitioned into or out of
   * fullscreen mode.
   * @private
   */
  onFullscreenChanged_() {
    const isFullscreen = isFullscreenElement(this.element);
    this.systemLayer_.setInFullScreen(isFullscreen);
  }



  /**
   * Handle resize events and set the story's desktop state.
   */
  onResize() {
    if (this.isDesktop_()) {
      this.element.setAttribute('desktop','');
      if (!this.nextButton_) {
        this.buildButtons_();
      }
      if (!this.topBar_) {
        this.buildTopBar_();
      }
      if (!this.background_) {
        this.background_ = new AmpStoryBackground(this.element);
        this.background_.attach();
      }
      if (this.activePage_) {
        this.updateBackground_(this.activePage_.element);
      }
    } else {
      this.element.removeAttribute('desktop');
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
   * Get the URL of the given page's background resource.
   * @param {!Element} pageElement
   * @return {?string} The URL of the background resource
   */
  getBackgroundUrl_(pageElement) {
    let fillElement = scopedQuerySelector(pageElement, '[template="fill"]');

    if (!fillElement) {
      return null;
    }

    fillElement = dev().assertElement(fillElement);

    const fillPosterElement = scopedQuerySelector(fillElement, '[poster]');
    const srcElement = scopedQuerySelector(fillElement, '[src]');

    const fillPoster = fillPosterElement ?
        fillPosterElement.getAttribute('poster') : '';
    const src = srcElement ? srcElement.getAttribute('src') : '';

    return fillPoster || src;
  }

  /**
   * Update the background to the specified page's background.
   * @param {!Element} pageElement
   */
  updateBackground_(pageElement) {
    if (!this.background_) {
      return;
    }

    const backgroundUrl = this.getBackgroundUrl_(pageElement);
    if (backgroundUrl) {
      this.background_.setBackground(backgroundUrl);
    } else {
      this.background_.removeBackground();
    }
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

      this.exitFullScreen_();

      this.vsync_.mutate(() => {
        this.element.classList.add('i-amphtml-story-bookend-active');
        this.bookend_.show();
      });
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

    this.vsync_.mutate(() => {
      this.element.classList.remove('i-amphtml-story-bookend-active');
      this.bookend_.hide();
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
    const page = this.getPageById_(pageId);
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
    if (this.isDesktop_()) {
      return;
    }
    const pagesByDistance = this.getPagesByDistance_();

    this.mutateElement(() => {
      pagesByDistance.forEach((pageIds, distance) => {
        pageIds.forEach(pageId => {
          const page = this.getPageById_(pageId);
          page.setDistance(distance);
        });
      });
    });
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
      this.scheduleResume(this.bookend_.getRoot());
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
        .expandAsync(user().assertString(rawUrl))
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
   * @private
   */
  getPageById_(id) {
    const pageIndex = this.getPageIndexById_(id);
    return dev().assert(this.pages_[pageIndex],
        `Page at index ${pageIndex} exists, but is missing from the array.`);
  }


  /**
   * @return {number}
   */
  getPageCount() {
    return this.pages_.length;
  }

  /**
   * @param {!./amp-story-page.AmpStoryPage} desiredPage
   * @return {number} The index of the page.
   */
  getPageIndex(desiredPage) {
    return findIndex(this.pages_, page => page === desiredPage);
  }


  /**
   * @param {!Element} element The element whose containing AmpStoryPage should
   *     be retrieved
   * @return {!./amp-story-page.AmpStoryPage} The AmpStoryPage containing the
   *     specified element.
   */
  getPageContainingElement_(element) {
    const pageIndex = findIndex(this.pages_, page => {
      const pageEl = closest(element, el => {
        return el === page.element;
      });

      return !!pageEl;
    });

    return dev().assert(this.pages_[pageIndex],
        'Element not contained on any amp-story-page');
  }


  /**
   * @param {!Element} element The element whose distance should be retrieved.
   * @return {number} The number of pages the specified element is from the
   *     currently active page.
   */
  getElementDistanceFromActivePage_(element) {
    const page = this.getPageContainingElement_(element);
    return page.getDistance();
  }


  /**
   * Mutes the audio for the story.
   * @private
   */
  mute_() {
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
    this.mediaPool_.blessAll().then(() => {
      this.activePage_.unmuteAllMedia();
    });
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
    this.hideBookend_();
    this.switchTo_(dev().assertElement(this.pages_[0].element).id);
  }
}

AMP.registerElement('amp-story', AmpStory, CSS);
