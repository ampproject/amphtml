import {toggleAttribute} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import * as Preact from '#core/dom/jsx';
import {closest, matches, scopedQuerySelector} from '#core/dom/query';
import {setImportantStyles} from '#core/dom/style';
import {toArray} from '#core/types/array';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev} from '#utils/log';

import {localizeTemplate} from './amp-story-localization-service';
import {
  Action,
  StateProperty,
  UIType_Enum,
  getStoreService,
} from './amp-story-store-service';
import {AmpStoryViewerMessagingHandler} from './amp-story-viewer-messaging-handler';
import {ProgressBar} from './progress-bar';
import {
  createShadowRootWithStyle,
  getStoryAttributeSrc,
  shouldShowStoryUrlInfo,
  toggleA11yReadable,
  triggerClickFromLightDom,
} from './utils';

import {CSS} from '../../../build/amp-story-system-layer-1.0.css';
import {AMP_STORY_PLAYER_EVENT} from '../../../src/amp-story-player/event';

/** @private @const {string} */
const AD_SHOWING_ATTRIBUTE = 'ad-showing';

/** @private @const {string} */
const AUDIO_MUTED_ATTRIBUTE = 'muted';

/** @private @const {string} */
const PAUSED_ATTRIBUTE = 'paused';

/** @private @const {string} */
const HAS_INFO_BUTTON_ATTRIBUTE = 'info';

/** @private @const {string} */
const CAPTIONS_CLASS = 'i-amphtml-story-captions-control';

/** @private @const {string} */
const NOCAPTIONS_CLASS = 'i-amphtml-story-nocaptions-control';

/** @private @const {string} */
const PAGE_HAS_CAPTIONS = 'i-amphtml-current-page-has-captions';

/** @private @const {string} */
const MUTE_CLASS = 'i-amphtml-story-mute-audio-control';

/** @private @const {string} */
const CLOSE_CLASS = 'i-amphtml-story-close-control';

/** @private @const {string} */
const SKIP_TO_NEXT_CLASS = 'i-amphtml-story-skip-to-next';

/** @private @const {string} */
const VIEWER_CUSTOM_CONTROL_CLASS = 'i-amphtml-story-viewer-custom-control';

/** @private @const {string} */
const UNMUTE_CLASS = 'i-amphtml-story-unmute-audio-control';

/** @private @const {string} */
const PAUSE_CLASS = 'i-amphtml-story-pause-control';

/** @private @const {string} */
const PLAY_CLASS = 'i-amphtml-story-play-control';

/** @private @const {string} */
const CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE = 'i-amphtml-current-page-has-audio';

/** @private @const {string} */
const SHARE_CLASS = 'i-amphtml-story-share-control';

/** @private @const {string} */
const INFO_CLASS = 'i-amphtml-story-info-control';

/** @private @const {string} */
const HAS_NEW_PAGE_ATTRIBUTE = 'i-amphtml-story-has-new-page';

/** @private @const {string} */
const ATTRIBUTION_CLASS = 'i-amphtml-story-attribution';

/** @private @const {number} */
const HIDE_MESSAGE_TIMEOUT_MS = 1500;

/**
 * @param {!Element} element
 * @param {?Element=} children
 * @param {boolean} isVisible
 * @return {!Element}
 */
const renderSystemLayerElement = (element, children, isVisible) => {
  const systemLayerElement = (
    <aside class="i-amphtml-story-system-layer i-amphtml-story-system-reset">
      {children}
      <a class={String(ATTRIBUTION_CLASS)} target="_blank">
        <div class="i-amphtml-story-attribution-logo-container">
          <img alt="" class="i-amphtml-story-attribution-logo" />
        </div>
        <div class="i-amphtml-story-attribution-text" />
      </a>
      <div class="i-amphtml-story-has-new-page-notification-container">
        <div class="i-amphtml-story-has-new-page-text-wrapper">
          <span class="i-amphtml-story-has-new-page-circle-icon" />
          <div
            class="i-amphtml-story-has-new-page-text"
            i-amphtml-i18n-text-content={
              LocalizedStringId_Enum.AMP_STORY_HAS_NEW_PAGE_TEXT
            }
          ></div>
        </div>
      </div>
      <div class="i-amphtml-story-system-layer-buttons">
        <div
          role="button"
          class={INFO_CLASS + ' i-amphtml-story-button'}
          i-amphtml-i18n-aria-label={
            LocalizedStringId_Enum.AMP_STORY_INFO_BUTTON_LABEL
          }
        />
        <div class="i-amphtml-story-captions-display">
          <button
            class={CAPTIONS_CLASS + ' i-amphtml-story-button'}
            i-amphtml-i18n-aria-label={
              LocalizedStringId_Enum.AMP_STORY_CAPTIONS_ON_LABEL
            }
          />
          <button
            class={NOCAPTIONS_CLASS + ' i-amphtml-story-button'}
            i-amphtml-i18n-aria-label={
              LocalizedStringId_Enum.AMP_STORY_CAPTIONS_OFF_LABEL
            }
          />
        </div>
        <div class="i-amphtml-story-sound-display">
          <button
            class={UNMUTE_CLASS + ' i-amphtml-story-button'}
            i-amphtml-i18n-aria-label={
              LocalizedStringId_Enum.AMP_STORY_AUDIO_UNMUTE_BUTTON_LABEL
            }
          />
          <button
            class={MUTE_CLASS + ' i-amphtml-story-button'}
            i-amphtml-i18n-aria-label={
              LocalizedStringId_Enum.AMP_STORY_AUDIO_MUTE_BUTTON_LABEL
            }
          />
        </div>
        <div class="i-amphtml-paused-display">
          <button
            class={PAUSE_CLASS + ' i-amphtml-story-button'}
            i-amphtml-i18n-aria-label={
              LocalizedStringId_Enum.AMP_STORY_PAUSE_BUTTON_LABEL
            }
          />
          <button
            class={PLAY_CLASS + ' i-amphtml-story-button'}
            i-amphtml-i18n-aria-label={
              LocalizedStringId_Enum.AMP_STORY_PLAY_BUTTON_LABEL
            }
          />
        </div>
        <button
          class={
            SKIP_TO_NEXT_CLASS +
            ' i-amphtml-story-ui-hide-button i-amphtml-story-button'
          }
          i-amphtml-i18n-aria-label={
            LocalizedStringId_Enum.AMP_STORY_SKIP_TO_NEXT_BUTTON_LABEL
          }
        />
        <button
          class={SHARE_CLASS + ' i-amphtml-story-button'}
          i-amphtml-i18n-aria-label={
            LocalizedStringId_Enum.AMP_STORY_SHARE_BUTTON_LABEL
          }
        />
        <button
          class={
            CLOSE_CLASS +
            ' i-amphtml-story-ui-hide-button i-amphtml-story-button'
          }
          i-amphtml-i18n-aria-label={
            LocalizedStringId_Enum.AMP_STORY_CLOSE_BUTTON_LABEL
          }
        />
      </div>
      <div class="i-amphtml-story-system-layer-buttons-start-position" />
    </aside>
  );

  if (!isVisible) {
    systemLayerElement.classList.add('i-amphtml-story-hidden');
  }

  return systemLayerElement;
};

/**
 * Contains the event name belonging to the viewer control.
 * @const {string}
 */
const VIEWER_CONTROL_EVENT_NAME = '__AMP_VIEWER_CONTROL_EVENT_NAME__';

/** @enum {string} */
const VIEWER_CONTROL_TYPES = {
  CLOSE: 'close',
  SHARE: 'share',
  DEPRECATED_SKIP_NEXT: 'skip-next', // Deprecated in favor of SKIP_TO_NEXT.
  SKIP_TO_NEXT: 'skip-to-next',
};

const VIEWER_CONTROL_DEFAULTS = {
  [VIEWER_CONTROL_TYPES.SHARE]: {
    'selector': `.${SHARE_CLASS}`,
  },
  [VIEWER_CONTROL_TYPES.CLOSE]: {
    'selector': `.${CLOSE_CLASS}`,
  },
  [VIEWER_CONTROL_TYPES.DEPRECATED_SKIP_NEXT]: {
    'selector': `.${SKIP_TO_NEXT_CLASS}`,
  },
  [VIEWER_CONTROL_TYPES.SKIP_TO_NEXT]: {
    'selector': `.${SKIP_TO_NEXT_CLASS}`,
  },
};

/**
 * System Layer (i.e. UI Chrome) for <amp-story>.
 * Chrome contains:
 *   - mute/unmute button
 *   - story progress bar
 *   - share button
 *   - domain info button
 *   - story updated label (for live stories)
 *   - close (for players)
 *   - skip (for players)
 */
export class SystemLayer {
  /**
   * @param {!Window} win
   * @param {!Element} parentEl
   */
  constructor(win, parentEl) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @protected @const {!Element} */
    this.parentEl_ = parentEl;

    /**
     * Root element containing a shadow DOM root.
     * @private {?Element}
     */
    this.root_ = null;

    /**
     * Actual system layer.
     * @private {?Element}
     */
    this.systemLayerEl_ = null;

    /** @private {?Element} */
    this.buttonsContainer_ = null;

    /** @private @const {!ProgressBar} */
    this.progressBar_ = ProgressBar.create(win, this.parentEl_);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @private {?number|?string} */
    this.timeoutId_ = null;

    /** @private {?../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = null;

    /** @private {?AmpStoryViewerMessagingHandler} */
    this.viewerMessagingHandler_ = null;
  }

  /**
   * @param {string} initialPageId
   * @param {boolean=} isVisible
   * @return {!Element}
   */
  build(initialPageId, isVisible = true) {
    if (this.root_) {
      return this.root_;
    }

    this.systemLayerEl_ = renderSystemLayerElement(
      this.parentEl_,
      this.progressBar_.build(initialPageId),
      isVisible
    );
    localizeTemplate(this.systemLayerEl_, this.parentEl_);

    // Make the share button link to the current document to make sure
    // embedded STAMPs always have a back-link to themselves, and to make
    // gestures like right-clicks work.
    this.systemLayerEl_.querySelector('.i-amphtml-story-share-control').href =
      Services.documentInfoForDoc(this.parentEl_).canonicalUrl;

    this.root_ = createShadowRootWithStyle(
      <div class="i-amphtml-system-layer-host"></div>,
      this.systemLayerEl_,
      CSS
    );

    this.buttonsContainer_ = this.systemLayerEl_.querySelector(
      '.i-amphtml-story-system-layer-buttons'
    );

    this.initializeListeners_();

    this.storeService_.subscribe(
      StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS,
      (canShowButtons) => {
        this.systemLayerEl_.classList.toggle(
          'i-amphtml-story-ui-no-buttons',
          !canShowButtons
        );
      },
      true /* callToInitialize */
    );

    if (Services.platformFor(this.win_).isIos()) {
      this.systemLayerEl_.setAttribute('ios', '');
    }

    this.viewer_ = Services.viewerForDoc(this.win_.document.documentElement);
    this.viewerMessagingHandler_ = this.viewer_.isEmbedded()
      ? new AmpStoryViewerMessagingHandler(this.win_, this.viewer_)
      : null;

    if (shouldShowStoryUrlInfo(this.viewer_, this.storeService_)) {
      this.systemLayerEl_.classList.add('i-amphtml-embedded');
      this.getShadowRoot().setAttribute(HAS_INFO_BUTTON_ATTRIBUTE, '');
    } else {
      this.getShadowRoot().removeAttribute(HAS_INFO_BUTTON_ATTRIBUTE);
    }

    this.maybeBuildAttribution_();

    this.getShadowRoot().setAttribute(HAS_NEW_PAGE_ATTRIBUTE, 'noshow');
    return this.root_;
  }

  /** @private */
  maybeBuildAttribution_() {
    if (!this.viewer_ || this.viewer_.getParam('attribution') !== 'auto') {
      return;
    }

    this.systemLayerEl_.querySelector('.i-amphtml-story-attribution-logo').src =
      getStoryAttributeSrc(this.parentEl_, 'entity-logo-src') ||
      getStoryAttributeSrc(this.parentEl_, 'publisher-logo-src');

    const anchorEl = this.systemLayerEl_.querySelector(
      `.${escapeCssSelectorIdent(ATTRIBUTION_CLASS)}`
    );

    anchorEl.href =
      getStoryAttributeSrc(this.parentEl_, 'entity-url') ||
      Services.urlForDoc(this.parentEl_).getSourceOrigin(
        Services.documentInfoForDoc(this.parentEl_).sourceUrl
      );

    this.systemLayerEl_.querySelector(
      '.i-amphtml-story-attribution-text'
    ).textContent =
      this.parentEl_.getAttribute('entity') ||
      this.parentEl_.getAttribute('publisher');

    anchorEl.classList.add('i-amphtml-story-attribution-visible');
  }

  /**
   * @private
   */
  initializeListeners_() {
    // TODO(alanorozco): Listen to tap event properly (i.e. fastclick)
    this.getShadowRoot().addEventListener('click', (event) => {
      const target = dev().assertElement(event.target);

      if (matches(target, `.${MUTE_CLASS}, .${MUTE_CLASS} *`)) {
        this.onAudioIconClick_(true);
      } else if (matches(target, `.${UNMUTE_CLASS}, .${UNMUTE_CLASS} *`)) {
        this.onAudioIconClick_(false);
      } else if (matches(target, `.${PAUSE_CLASS}, .${PAUSE_CLASS} *`)) {
        this.onPausedClick_(true);
      } else if (matches(target, `.${PLAY_CLASS}, .${PLAY_CLASS} *`)) {
        this.onPausedClick_(false);
      } else if (matches(target, `.${CAPTIONS_CLASS}, .${CAPTIONS_CLASS} *`)) {
        this.onCaptionsClick_(false);
      } else if (
        matches(target, `.${NOCAPTIONS_CLASS}, .${NOCAPTIONS_CLASS} *`)
      ) {
        this.onCaptionsClick_(true);
      } else if (matches(target, `.${SHARE_CLASS}, .${SHARE_CLASS} *`)) {
        this.onShareClick_(event);
      } else if (matches(target, `.${INFO_CLASS}, .${INFO_CLASS} *`)) {
        this.onInfoClick_();
      } else if (
        matches(
          target,
          `.${VIEWER_CUSTOM_CONTROL_CLASS}, .${VIEWER_CUSTOM_CONTROL_CLASS} *`
        )
      ) {
        this.onViewerControlClick_(dev().assertElement(event.target));
      } else if (
        matches(target, `.${ATTRIBUTION_CLASS}, .${ATTRIBUTION_CLASS} *`)
      ) {
        const anchorClicked = closest(target, (e) => matches(e, 'a[href]'));
        triggerClickFromLightDom(anchorClicked, this.parentEl_);
      }
    });

    this.storeService_.subscribe(StateProperty.AD_STATE, (isAd) => {
      this.onAdStateUpdate_(isAd);
    });

    this.storeService_.subscribe(
      StateProperty.CAN_SHOW_AUDIO_UI,
      (show) => {
        this.onCanShowAudioUiUpdate_(show);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.CAN_SHOW_SHARING_UIS,
      (show) => {
        this.onCanShowSharingUisUpdate_(show);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.STORY_HAS_PLAYBACK_UI_STATE,
      (hasPlaybackUi) => {
        this.onStoryHasPlaybackUiStateUpdate_(hasPlaybackUi);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.MUTED_STATE,
      (isMuted) => {
        this.onMutedStateUpdate_(isMuted);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(StateProperty.UI_STATE, (uiState) => {
      this.vsync_.mutate(() => this.onUIStateUpdate_(uiState));
    });
    /** Initialize outside of mutate context to avoid CLS. */
    this.onUIStateUpdate_(this.storeService_.get(StateProperty.UI_STATE));

    this.storeService_.subscribe(
      StateProperty.PAUSED_STATE,
      (isPaused) => {
        this.onPausedStateUpdate_(isPaused);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      (index) => {
        this.onPageIndexUpdate_(index);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      (rtlState) => {
        this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.KEYBOARD_ACTIVE_STATE,
      (keyboardState) => {
        this.onKeyboardActiveUpdate_(keyboardState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.PAGE_HAS_CAPTIONS_STATE,
      (pageHasCaptionsState) =>
        this.onPageHasCaptionsState_(pageHasCaptionsState),
      true /* callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.CAPTIONS_STATE,
      (captionsState) => this.onCaptionsStateUpdate_(captionsState),
      true /* callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.PAGE_HAS_AUDIO_STATE,
      (audio) => {
        this.onPageHasAudioStateUpdate_(audio);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE,
      (hasPlaybackUi) => {
        this.onPageHasElementsWithPlaybackStateUpdate_(hasPlaybackUi);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.SYSTEM_UI_IS_VISIBLE_STATE,
      (isVisible) => {
        this.onSystemUiIsVisibleStateUpdate_(isVisible);
      }
    );

    this.storeService_.subscribe(StateProperty.NEW_PAGE_AVAILABLE_ID, () => {
      this.onNewPageAvailable_();
    });

    this.storeService_.subscribe(
      StateProperty.VIEWER_CUSTOM_CONTROLS,
      (config) => this.onViewerCustomControls_(config),
      true /* callToInitialize */
    );
  }

  /**
   * @return {!Element}
   */
  getShadowRoot() {
    return dev().assertElement(this.systemLayerEl_);
  }

  /**
   * Reacts to the ad state updates and updates the UI accordingly.
   * @param {boolean} isAd
   * @private
   */
  onAdStateUpdate_(isAd) {
    // This is not in vsync as we are showing/hiding items in the system layer
    // based upon this attribute, and when wrapped in vsync there is a visual
    // lag after the page change before the icons are updated.
    isAd
      ? this.getShadowRoot().setAttribute(AD_SHOWING_ATTRIBUTE, '')
      : this.getShadowRoot().removeAttribute(AD_SHOWING_ATTRIBUTE);
  }

  /**
   * Reacts to updates to whether audio UI may be shown, and updates the UI
   * accordingly.
   * @param {boolean} canShowAudioUi
   * @private
   */
  onCanShowAudioUiUpdate_(canShowAudioUi) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle(
        'i-amphtml-story-no-audio-ui',
        !canShowAudioUi
      );
    });
  }

  /**
   * Reacts to updates to whether sharing UIs may be shown, and updates the UI
   * accordingly.
   * @param {boolean} canShowSharingUis
   * @private
   */
  onCanShowSharingUisUpdate_(canShowSharingUis) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle(
        'i-amphtml-story-no-sharing',
        !canShowSharingUis
      );
    });
  }

  /**
   * Reacts to story having elements with playback.
   * @param {boolean} hasPlaybackUi
   * @private
   */
  onStoryHasPlaybackUiStateUpdate_(hasPlaybackUi) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle(
        'i-amphtml-story-has-playback-ui',
        hasPlaybackUi
      );
    });
  }

  /**
   * Toggles the captions.
   * @param {boolean} captions
   * @private
   */
  onCaptionsClick_(captions) {
    this.storeService_.dispatch(Action.TOGGLE_CAPTIONS, captions);
  }

  /**
   * Reacts to the presence of audio on a page to determine which audio messages
   * to display.
   * @param {boolean} pageHasAudio
   * @private
   */
  onPageHasAudioStateUpdate_(pageHasAudio) {
    pageHasAudio =
      pageHasAudio ||
      !!this.storeService_.get(StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE);
    this.vsync_.mutate(() => {
      pageHasAudio
        ? this.getShadowRoot().setAttribute(
            CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE,
            ''
          )
        : this.getShadowRoot().removeAttribute(
            CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE
          );
    });
  }

  /**
   * Toggles whether the active page has captions or not.
   * @param {boolean} pageHasCaptions
   */
  onPageHasCaptionsState_(pageHasCaptions) {
    toggleAttribute(this.systemLayerEl_, PAGE_HAS_CAPTIONS, pageHasCaptions);
  }

  /**
   * Toggles whether the captions are active or not.
   * @param {boolean} captionsState
   */
  onCaptionsStateUpdate_(captionsState) {
    toggleAttribute(this.systemLayerEl_, 'captions-on', captionsState);
  }

  /**
   * Reacts to the presence of elements with playback on the page.
   * @param {boolean} pageHasElementsWithPlayback
   * @private
   */
  onPageHasElementsWithPlaybackStateUpdate_(pageHasElementsWithPlayback) {
    this.vsync_.mutate(() => {
      toArray(
        this.getShadowRoot().querySelectorAll(
          '.i-amphtml-paused-display button'
        )
      ).forEach((button) => {
        button.disabled = !pageHasElementsWithPlayback;
      });
    });
  }

  /**
   * Reacts to muted state updates.
   * @param {boolean} isMuted
   * @private
   */
  onMutedStateUpdate_(isMuted) {
    this.vsync_.mutate(() => {
      isMuted
        ? this.getShadowRoot().setAttribute(AUDIO_MUTED_ATTRIBUTE, '')
        : this.getShadowRoot().removeAttribute(AUDIO_MUTED_ATTRIBUTE);
    });
  }

  /**
   * Reacts to paused state updates.
   * @param {boolean} isPaused
   * @private
   */
  onPausedStateUpdate_(isPaused) {
    this.vsync_.mutate(() => {
      isPaused
        ? this.getShadowRoot().setAttribute(PAUSED_ATTRIBUTE, '')
        : this.getShadowRoot().removeAttribute(PAUSED_ATTRIBUTE);
    });
  }

  /**
   * Hides message after elapsed time.
   * @param {string} message
   * @private
   */
  hideMessageAfterTimeout_(message) {
    if (this.timeoutId_) {
      this.timer_.cancel(this.timeoutId_);
    }
    this.timeoutId_ = this.timer_.delay(
      () => this.hideMessageInternal_(message),
      HIDE_MESSAGE_TIMEOUT_MS
    );
  }

  /**
   * Hides message.
   * @param {string} message
   * @private
   */
  hideMessageInternal_(message) {
    if (!this.root_) {
      return;
    }
    this.vsync_.mutate(() => {
      this.getShadowRoot().setAttribute(message, 'noshow');
    });
  }

  /**
   * Reacts to UI state updates and triggers the expected UI.
   * Called inside a mutate context if not initializing.
   * @param {!UIType_Enum} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    const shadowRoot = this.getShadowRoot();

    shadowRoot.classList.remove('i-amphtml-story-desktop-fullbleed');
    shadowRoot.classList.remove('i-amphtml-story-desktop-one-panel');
    shadowRoot.removeAttribute('desktop');

    switch (uiState) {
      case UIType_Enum.DESKTOP_FULLBLEED:
        shadowRoot.setAttribute('desktop', '');
        shadowRoot.classList.add('i-amphtml-story-desktop-fullbleed');
        break;
      case UIType_Enum.DESKTOP_ONE_PANEL:
        shadowRoot.classList.add('i-amphtml-story-desktop-one-panel');
        break;
    }
  }

  /**
   * Reacts to system UI visibility state updates.
   * @param {boolean} isVisible
   * @private
   */
  onSystemUiIsVisibleStateUpdate_(isVisible) {
    this.vsync_.mutate(() => {
      const shadowRoot = this.getShadowRoot();
      shadowRoot.classList.toggle('i-amphtml-story-hidden', !isVisible);

      toArray(shadowRoot.querySelectorAll('button')).forEach((button) =>
        toggleA11yReadable(button, isVisible)
      );
    });
  }

  /**
   * Reacts to the active page index changing.
   * @param {number} index
   */
  onPageIndexUpdate_(index) {
    this.vsync_.mutate(() => {
      const lastIndex =
        this.storeService_.get(StateProperty.PAGE_IDS).length - 1;
      this.getShadowRoot().classList.toggle(
        'i-amphtml-first-page-active',
        index === 0
      );
      this.getShadowRoot().classList.toggle(
        'i-amphtml-last-page-active',
        index === lastIndex
      );
    });
  }

  /**
   * Reacts to RTL state updates and triggers the UI for RTL.
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.vsync_.mutate(() => {
      rtlState
        ? this.getShadowRoot().setAttribute('dir', 'rtl')
        : this.getShadowRoot().removeAttribute('dir');
    });
  }

  /**
   * Reacts to keyboard updates and updates the UI.
   * @param {boolean} keyboardActive
   * @private
   */
  onKeyboardActiveUpdate_(keyboardActive) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle(
        'amp-mode-keyboard-active',
        keyboardActive
      );
    });
  }

  /**
   * Handles click events on the mute and unmute buttons.
   * @param {boolean} mute Specifies if the audio is being muted or unmuted.
   * @private
   */
  onAudioIconClick_(mute) {
    this.storeService_.dispatch(Action.TOGGLE_MUTED, mute);
  }

  /**
   * Handles click events on the paused and play buttons.
   * @param {boolean} paused Specifies if the story is being paused or not.
   * @private
   */
  onPausedClick_(paused) {
    this.storeService_.dispatch(Action.TOGGLE_PAUSED, paused);
  }

  /**
   * Handles click events on the share button and toggles the share menu.
   * @param {!Event} event
   * @private
   */
  onShareClick_(event) {
    event.preventDefault();
    if (event.target[VIEWER_CONTROL_EVENT_NAME]) {
      this.onViewerControlClick_(dev().assertElement(event.target));
      return;
    }

    const isOpen = this.storeService_.get(StateProperty.SHARE_MENU_STATE);
    this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, !isOpen);
  }

  /**
   * Sends message back to the viewer with the corresponding event.
   * @param {!Element} element
   * @private
   */
  onViewerControlClick_(element) {
    const eventName = element[VIEWER_CONTROL_EVENT_NAME];

    this.viewerMessagingHandler_ &&
      this.viewerMessagingHandler_.send('documentStateUpdate', {
        'state': AMP_STORY_PLAYER_EVENT,
        'value': eventName,
      });
  }

  /**
   * Handles click events on the info button and toggles the info dialog.
   * @private
   */
  onInfoClick_() {
    const isOpen = this.storeService_.get(StateProperty.INFO_DIALOG_STATE);
    this.storeService_.dispatch(Action.TOGGLE_INFO_DIALOG, !isOpen);
  }

  /**
   * Shows the "story updated" label when a new page was added to the story.
   * @private
   */
  onNewPageAvailable_() {
    this.vsync_.mutate(() => {
      this.getShadowRoot().setAttribute(HAS_NEW_PAGE_ATTRIBUTE, 'show');
      this.hideMessageAfterTimeout_(HAS_NEW_PAGE_ATTRIBUTE);
    });
  }

  /**
   * Reacts to a custom configuration change coming from the player level.
   * Updates UI to match configuration described by publisher.
   * @param {!Array<!../../../src/amp-story-player/amp-story-player-impl.ViewerControlDef>} controls
   * @private
   */
  onViewerCustomControls_(controls) {
    if (controls.length <= 0) {
      return;
    }

    controls.forEach((control) => {
      if (!control.name) {
        return;
      }

      const defaultConfig = VIEWER_CONTROL_DEFAULTS[control.name];

      let element;
      if (defaultConfig && defaultConfig.selector) {
        element = scopedQuerySelector(
          this.getShadowRoot(),
          defaultConfig.selector
        );
      } else {
        element = <button class="i-amphtml-story-button" />;
        this.vsync_.mutate(() => {
          this.buttonsContainer_.appendChild(element);
        });
      }

      this.vsync_.mutate(() => {
        element.classList.add(VIEWER_CUSTOM_CONTROL_CLASS);
      });

      if (control.visibility === 'hidden') {
        this.vsync_.mutate(() => {
          element.classList.add('i-amphtml-story-ui-hide-button');
        });
      }

      if (!control.visibility || control.visibility === 'visible') {
        this.vsync_.mutate(() => {
          dev()
            .assertElement(element)
            .classList.remove('i-amphtml-story-ui-hide-button');
        });
      }

      if (control.state === 'disabled') {
        this.vsync_.mutate(() => {
          element.disabled = true;
        });
      }

      if (control.position === 'start') {
        const startButtonContainer = this.systemLayerEl_.querySelector(
          '.i-amphtml-story-system-layer-buttons-start-position'
        );

        this.vsync_.mutate(() => {
          this.buttonsContainer_.removeChild(element);
          startButtonContainer.appendChild(element);
        });
      }

      if (control.backgroundImageUrl) {
        setImportantStyles(dev().assertElement(element), {
          'background-image': `url('${control.backgroundImageUrl}')`,
        });
      }

      element[VIEWER_CONTROL_EVENT_NAME] = `amp-story-player-${control.name}`;
    });
  }

  /**
   * @param {string} pageId The id of the page whose progress should be
   *     changed.
   * @param {number} progress A number from 0.0 to 1.0, representing the
   *     progress of the current page.
   * @public
   */
  updateProgress(pageId, progress) {
    // TODO(newmuis) avoid passing progress logic through system-layer
    this.progressBar_.updateProgress(pageId, progress);
  }
}
