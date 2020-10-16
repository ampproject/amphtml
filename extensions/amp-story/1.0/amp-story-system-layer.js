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
import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {CSS} from '../../../build/amp-story-system-layer-1.0.css';
import {
  DevelopmentModeLog,
  DevelopmentModeLogButtonSet,
} from './development-ui';
import {LocalizedStringId} from '../../../src/localized-strings';
import {ProgressBar} from './progress-bar';
import {Services} from '../../../src/services';
import {createShadowRootWithStyle, shouldShowStoryUrlInfo} from './utils';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {matches, scopedQuerySelector} from '../../../src/dom';
import {renderAsElement} from './simple-template';
import {setImportantStyles} from '../../../src/style';
import {toArray} from '../../../src/types';

/** @private @const {string} */
const AD_SHOWING_ATTRIBUTE = 'ad-showing';

/** @private @const {string} */
const AUDIO_MUTED_ATTRIBUTE = 'muted';

/** @private @const {string} */
const PAUSED_ATTRIBUTE = 'paused';

/** @private @const {string} */
const HAS_INFO_BUTTON_ATTRIBUTE = 'info';

/** @private @const {string} */
const MUTE_CLASS = 'i-amphtml-story-mute-audio-control';

/** @private @const {string} */
const CLOSE_CLASS = 'i-amphtml-story-close-control';

/** @private @const {string} */
const SKIP_NEXT_CLASS = 'i-amphtml-story-skip-next';

/** @private @const {string} */
const UNMUTE_CLASS = 'i-amphtml-story-unmute-audio-control';

/** @private @const {string} */
const PAUSE_CLASS = 'i-amphtml-story-pause-control';

/** @private @const {string} */
const PLAY_CLASS = 'i-amphtml-story-play-control';

/** @private @const {string} */
const MESSAGE_DISPLAY_CLASS = 'i-amphtml-story-messagedisplay';

/** @private @const {string} */
const CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE = 'i-amphtml-current-page-has-audio';

/** @private @const {string} */
const HAS_SIDEBAR_ATTRIBUTE = 'i-amphtml-story-has-sidebar';

/** @private @const {string} */
const SHARE_CLASS = 'i-amphtml-story-share-control';

/** @private @const {string} */
const INFO_CLASS = 'i-amphtml-story-info-control';

/** @private @const {string} */
const SIDEBAR_CLASS = 'i-amphtml-story-sidebar-control';

/** @private @const {string} */
const HAS_NEW_PAGE_ATTRIBUTE = 'i-amphtml-story-has-new-page';

/** @private @const {number} */
const HIDE_MESSAGE_TIMEOUT_MS = 1500;

/** @private @const {!./simple-template.ElementDef} */
const TEMPLATE = {
  tag: 'aside',
  attrs: dict({
    'class': 'i-amphtml-story-system-layer i-amphtml-story-system-reset',
  }),
  children: [
    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-has-new-page-notification-container',
      }),
      children: [
        {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-has-new-page-text-wrapper',
          }),
          children: [
            {
              tag: 'span',
              attrs: dict({
                'class': 'i-amphtml-story-has-new-page-circle-icon',
              }),
            },
            {
              tag: 'div',
              attrs: dict({
                'class': 'i-amphtml-story-has-new-page-text',
              }),
              localizedStringId: LocalizedStringId.AMP_STORY_HAS_NEW_PAGE_TEXT,
            },
          ],
        },
      ],
    },
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-system-layer-buttons'}),
      children: [
        {
          tag: 'div',
          attrs: dict({
            'role': 'button',
            'class': INFO_CLASS + ' i-amphtml-story-button',
          }),
          localizedLabelId: LocalizedStringId.AMP_STORY_INFO_BUTTON_LABEL,
        },
        {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-sound-display',
          }),
          children: [
            {
              tag: 'div',
              attrs: dict({
                'role': 'alert',
                'class': 'i-amphtml-message-container',
              }),
              children: [
                {
                  tag: 'div',
                  attrs: dict({
                    'class': 'i-amphtml-story-mute-text',
                  }),
                  localizedStringId:
                    LocalizedStringId.AMP_STORY_AUDIO_MUTE_BUTTON_TEXT,
                },
                {
                  tag: 'div',
                  attrs: dict({
                    'class': 'i-amphtml-story-unmute-sound-text',
                  }),
                  localizedStringId:
                    LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_SOUND_TEXT,
                },
                {
                  tag: 'div',
                  attrs: dict({
                    'class': 'i-amphtml-story-unmute-no-sound-text',
                  }),
                  localizedStringId:
                    LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_NO_SOUND_TEXT,
                },
              ],
            },
            {
              tag: 'button',
              attrs: dict({
                'class': UNMUTE_CLASS + ' i-amphtml-story-button',
              }),
              localizedLabelId:
                LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_BUTTON_LABEL,
            },
            {
              tag: 'button',
              attrs: dict({
                'class': MUTE_CLASS + ' i-amphtml-story-button',
              }),
              localizedLabelId:
                LocalizedStringId.AMP_STORY_AUDIO_MUTE_BUTTON_LABEL,
            },
          ],
        },
        {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-paused-display',
          }),
          children: [
            {
              tag: 'button',
              attrs: dict({
                'class': PAUSE_CLASS + ' i-amphtml-story-button',
              }),
              localizedLabelId: LocalizedStringId.AMP_STORY_PAUSE_BUTTON_LABEL,
            },
            {
              tag: 'button',
              attrs: dict({
                'class': PLAY_CLASS + ' i-amphtml-story-button',
              }),
              localizedLabelId: LocalizedStringId.AMP_STORY_PLAY_BUTTON_LABEL,
            },
          ],
        },
        {
          tag: 'button',
          attrs: dict({
            'class':
              SKIP_NEXT_CLASS +
              ' i-amphtml-story-ui-hide-button i-amphtml-story-button',
          }),
          localizedLabelId: LocalizedStringId.AMP_STORY_SKIP_NEXT_BUTTON_LABEL,
        },
        {
          tag: 'a',
          attrs: dict({
            'role': 'button',
            'class': SHARE_CLASS + ' i-amphtml-story-button',
          }),
          localizedLabelId: LocalizedStringId.AMP_STORY_SHARE_BUTTON_LABEL,
        },
        {
          tag: 'button',
          attrs: dict({
            'class': SIDEBAR_CLASS + ' i-amphtml-story-button',
          }),
          localizedLabelId: LocalizedStringId.AMP_STORY_SIDEBAR_BUTTON_LABEL,
        },
        {
          tag: 'button',
          attrs: dict({
            'class':
              CLOSE_CLASS +
              ' i-amphtml-story-ui-hide-button i-amphtml-story-button',
          }),
          localizedLabelId: LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL,
        },
      ],
    },
    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-system-layer-buttons-start-position',
      }),
    },
  ],
};

/** @enum {string} */
const CONTROL_TYPES = {
  CLOSE: 'close-button',
  SHARE: 'share-button',
  SKIP_NEXT: 'skip-next-button',
};

const CONTROL_DEFAULTS = {
  [CONTROL_TYPES.SHARE]: {
    'selector': `.${SHARE_CLASS}`,
  },
  [CONTROL_TYPES.CLOSE]: {
    'selector': `.${CLOSE_CLASS}`,
  },
  [CONTROL_TYPES.SKIP_NEXT]: {
    'selector': `.${SKIP_NEXT_CLASS}`,
  },
};

/**
 * System Layer (i.e. UI Chrome) for <amp-story>.
 * Chrome contains:
 *   - mute/unmute button
 *   - story progress bar
 *   - bookend close button
 *   - share button
 *   - domain info button
 *   - sidebar
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

    /** @private {boolean} */
    this.isBuilt_ = false;

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

    /** @private {!DevelopmentModeLog} */
    this.developerLog_ = DevelopmentModeLog.create(win);

    /** @private {!DevelopmentModeLogButtonSet} */
    this.developerButtons_ = DevelopmentModeLogButtonSet.create(win);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @private {?number|?string} */
    this.timeoutId_ = null;
  }

  /**
   * @return {!Element}
   * @param {string} initialPageId
   */
  build(initialPageId) {
    if (this.isBuilt_) {
      return this.getRoot();
    }

    this.isBuilt_ = true;

    this.root_ = this.win_.document.createElement('div');
    this.root_.classList.add('i-amphtml-system-layer-host');
    this.systemLayerEl_ = renderAsElement(this.win_.document, TEMPLATE);
    // Make the share button link to the current document to make sure
    // embedded STAMPs always have a back-link to themselves, and to make
    // gestures like right-clicks work.
    this.systemLayerEl_.querySelector(
      '.i-amphtml-story-share-control'
    ).href = Services.documentInfoForDoc(this.parentEl_).canonicalUrl;

    createShadowRootWithStyle(this.root_, this.systemLayerEl_, CSS);

    this.systemLayerEl_.insertBefore(
      this.progressBar_.build(initialPageId),
      this.systemLayerEl_.firstChild
    );

    this.buttonsContainer_ = this.systemLayerEl_.querySelector(
      '.i-amphtml-story-system-layer-buttons'
    );

    this.buildForDevelopmentMode_();

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

    const viewer = Services.viewerForDoc(this.win_.document.documentElement);

    if (shouldShowStoryUrlInfo(viewer)) {
      this.systemLayerEl_.classList.add('i-amphtml-embedded');
      this.getShadowRoot().setAttribute(HAS_INFO_BUTTON_ATTRIBUTE, '');
    } else {
      this.getShadowRoot().removeAttribute(HAS_INFO_BUTTON_ATTRIBUTE);
    }

    this.getShadowRoot().setAttribute(MESSAGE_DISPLAY_CLASS, 'noshow');
    this.getShadowRoot().setAttribute(HAS_NEW_PAGE_ATTRIBUTE, 'noshow');
    return this.getRoot();
  }

  /**
   * @private
   */
  buildForDevelopmentMode_() {
    if (!getMode().development) {
      return;
    }

    this.buttonsContainer_.appendChild(
      this.developerButtons_.build(
        this.developerLog_.toggle.bind(this.developerLog_)
      )
    );
    this.getShadowRoot().appendChild(this.developerLog_.build());
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
      } else if (matches(target, `.${SHARE_CLASS}, .${SHARE_CLASS} *`)) {
        this.onShareClick_(event);
      } else if (matches(target, `.${INFO_CLASS}, .${INFO_CLASS} *`)) {
        this.onInfoClick_();
      } else if (matches(target, `.${SIDEBAR_CLASS}, .${SIDEBAR_CLASS} *`)) {
        this.onSidebarClick_();
      }
    });

    this.storeService_.subscribe(StateProperty.AD_STATE, (isAd) => {
      this.onAdStateUpdate_(isAd);
    });

    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, (isActive) => {
      this.onBookendStateUpdate_(isActive);
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
      StateProperty.STORY_HAS_AUDIO_STATE,
      (hasAudio) => {
        this.onStoryHasAudioStateUpdate_(hasAudio);
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

    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

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
      StateProperty.HAS_SIDEBAR_STATE,
      (hasSidebar) => {
        this.onHasSidebarStateUpdate_(hasSidebar);
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
      StateProperty.CUSTOM_CONTROLS,
      (config) => this.onCustomControls_(config),
      true /* callToInitialize */
    );
  }

  /**
   * @return {!Element}
   */
  getRoot() {
    return dev().assertElement(this.root_);
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
   * Reacts to the bookend state updates and updates the UI accordingly.
   * @param {boolean} isActive
   * @private
   */
  onBookendStateUpdate_(isActive) {
    this.getShadowRoot().classList.toggle(
      'i-amphtml-story-bookend-active',
      isActive
    );
  }

  /**
   * Checks if the story has a sidebar in order to display the icon representing
   * the opening of the sidebar.
   * @param {boolean} hasSidebar
   * @private
   */
  onHasSidebarStateUpdate_(hasSidebar) {
    if (hasSidebar) {
      this.getShadowRoot().setAttribute(HAS_SIDEBAR_ATTRIBUTE, '');
    } else {
      this.getShadowRoot().removeAttribute(HAS_SIDEBAR_ATTRIBUTE);
    }
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
   * Reacts to has audio state updates, determining if the story has a global
   * audio track playing, or if any page has audio.
   * @param {boolean} hasAudio
   * @private
   */
  onStoryHasAudioStateUpdate_(hasAudio) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle(
        'i-amphtml-story-has-audio',
        hasAudio
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
    if (!this.isBuilt_) {
      return;
    }
    this.vsync_.mutate(() => {
      this.getShadowRoot().setAttribute(message, 'noshow');
    });
  }

  /**
   * Reacts to UI state updates and triggers the expected UI.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.vsync_.mutate(() => {
      const shadowRoot = this.getShadowRoot();

      shadowRoot.classList.remove('i-amphtml-story-desktop-fullbleed');
      shadowRoot.classList.remove('i-amphtml-story-desktop-panels');
      shadowRoot.removeAttribute('desktop');

      switch (uiState) {
        case UIType.DESKTOP_PANELS:
          shadowRoot.setAttribute('desktop', '');
          shadowRoot.classList.add('i-amphtml-story-desktop-panels');
          break;
        case UIType.DESKTOP_FULLBLEED:
          shadowRoot.setAttribute('desktop', '');
          shadowRoot.classList.add('i-amphtml-story-desktop-fullbleed');
          break;
      }
    });
  }

  /**
   * Reacts to system UI visibility state updates.
   * @param {boolean} isVisible
   * @private
   */
  onSystemUiIsVisibleStateUpdate_(isVisible) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle(
        'i-amphtml-story-hidden',
        !isVisible
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
   * Handles click events on the mute and unmute buttons.
   * @param {boolean} mute Specifies if the audio is being muted or unmuted.
   * @private
   */
  onAudioIconClick_(mute) {
    this.storeService_.dispatch(Action.TOGGLE_MUTED, mute);
    this.vsync_.mutate(() => {
      this.getShadowRoot().setAttribute(MESSAGE_DISPLAY_CLASS, 'show');
      this.hideMessageAfterTimeout_(MESSAGE_DISPLAY_CLASS);
    });
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
    const isOpen = this.storeService_.get(StateProperty.SHARE_MENU_STATE);
    this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, !isOpen);
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
   * Handles click events on the sidebar button and toggles the sidebar.
   * @private
   */
  onSidebarClick_() {
    this.storeService_.dispatch(Action.TOGGLE_SIDEBAR, true);
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
   * @param {!Array<!Object>} controls
   * @private
   */
  onCustomControls_(controls) {
    if (controls.length <= 0) {
      return;
    }

    controls.forEach((control) => {
      if (!control.name) {
        return;
      }

      const defaultConfig = CONTROL_DEFAULTS[control.name];

      if (!defaultConfig) {
        return;
      }

      const element = scopedQuerySelector(
        this.getShadowRoot(),
        defaultConfig.selector
      );

      if (control.visibility === 'hidden') {
        this.vsync_.mutate(() => {
          element.classList.add('i-amphtml-story-ui-hide-button');
        });
      }

      if (!control.visibility || control.visibility === 'visible') {
        this.vsync_.mutate(() => {
          element.classList.remove('i-amphtml-story-ui-hide-button');
        });
      }

      if (control.position === 'start') {
        const startButtonContainer = this.systemLayerEl_.querySelector(
          '.i-amphtml-story-system-layer-buttons-start-position'
        );

        this.vsync_.mutate(() => {
          element.parentElement.removeChild(element);
          startButtonContainer.appendChild(element);
        });
      }

      if (control.icon) {
        setImportantStyles(dev().assertElement(element), {
          'background-image': `url(${control.icon})`,
        });
      }
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

  /**
   * @param {!./logging.AmpStoryLogEntryDef} logEntry
   * @private
   */
  logInternal_(logEntry) {
    this.developerButtons_.log(logEntry);
    this.developerLog_.log(logEntry);
  }

  /**
   * Logs an array of entries to the developer logs.
   * @param {!Array<!./logging.AmpStoryLogEntryDef>} logEntries
   */
  logAll(logEntries) {
    if (!getMode().development) {
      return;
    }

    this.vsync_.mutate(() => {
      logEntries.forEach((logEntry) => this.logInternal_(logEntry));
    });
  }

  /**
   * Logs a single entry to the developer logs.
   * @param {!./logging.AmpStoryLogEntryDef} logEntry
   */
  log(logEntry) {
    if (!getMode().development) {
      return;
    }

    this.logInternal_(logEntry);
  }

  /**
   * Clears any state held by the developer log or buttons.
   */
  resetDeveloperLogs() {
    if (!getMode().development) {
      return;
    }

    this.developerButtons_.clear();
    this.developerLog_.clear();
  }

  /**
   * Sets the string providing context for the developer logs window.  This is
   * often the name or ID of the element that all logs are for (e.g. the page).
   * @param {string} contextString
   */
  setDeveloperLogContextString(contextString) {
    if (!getMode().development) {
      return;
    }

    this.developerLog_.setContextString(contextString);
  }

  /**
   * Hides the developer log in the UI.
   */
  hideDeveloperLog() {
    if (!getMode().development) {
      return;
    }

    this.developerLog_.hide();
  }
}
