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
import {LocalizedStringId} from '../../../src/service/localization';
import {ProgressBar} from './progress-bar';
import {Services} from '../../../src/services';
import {createShadowRootWithStyle} from './utils';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {matches} from '../../../src/dom';
import {renderAsElement} from './simple-template';


/** @private @const {string} */
const AD_SHOWING_ATTRIBUTE = 'ad-showing';

/** @private @const {string} */
const AUDIO_MUTED_ATTRIBUTE = 'muted';

/** @private @const {string} */
const HAS_INFO_BUTTON_ATTRIBUTE = 'info';

/** @private @const {string} */
const MUTE_CLASS = 'i-amphtml-story-mute-audio-control';

/** @private @const {string} */
const UNMUTE_CLASS = 'i-amphtml-story-unmute-audio-control';

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

/** @private @const {number} */
const HIDE_AUDIO_MESSAGE_TIMEOUT_MS = 1500;

/** @private @const {!./simple-template.ElementDef} */
const TEMPLATE = {
  tag: 'aside',
  attrs: dict(
      {'class': 'i-amphtml-story-system-layer i-amphtml-story-system-reset'}),
  children: [
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
                'class': 'i-amphtml-message-container',
              }),
              children: [
                {
                  tag: 'div',
                  attrs: dict({
                    'class': 'i-amphtml-story-mute-text' ,
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
                    'class': 'i-amphtml-story-unmute-no-sound-text' ,
                  }),
                  localizedStringId:
                        LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_NO_SOUND_TEXT,
                },
              ],
            },
            {
              tag: 'div',
              attrs: dict({
                'role': 'button',
                'class': UNMUTE_CLASS + ' i-amphtml-story-button',
              }),
            },
            {
              tag: 'div',
              attrs: dict({
                'role': 'button',
                'class': MUTE_CLASS + ' i-amphtml-story-button',
              }),
            },
          ],
        },
        {
          tag: 'div',
          attrs: dict({
            'role': 'button',
            'class': SHARE_CLASS + ' i-amphtml-story-button',
          }),
        },
        {
          tag: 'div',
          attrs: dict({
            'role': 'button',
            'class': SIDEBAR_CLASS + ' i-amphtml-story-button',
          }),
        },
      ],
    },
  ],
};


/**
 * System Layer (i.e. UI Chrome) for <amp-story>.
 * Chrome contains:
 *   - mute/unmute button
 *   - story progress bar
 *   - bookend close butotn
 */
export class SystemLayer {
  /**
   * @param {!Window} win
   * @param {!Element} parentEl
   */
  constructor(win, parentEl) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Element} */
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
    this.progressBar_ = ProgressBar.create(win);

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
   * @param {!Array<string>} pageIds the ids of each page in the story
   * @return {!Element}
   */
  build(pageIds) {
    if (this.isBuilt_) {
      return this.getRoot();
    }

    this.isBuilt_ = true;

    this.root_ = this.win_.document.createElement('div');
    this.systemLayerEl_ = renderAsElement(this.win_.document, TEMPLATE);

    createShadowRootWithStyle(this.root_, this.systemLayerEl_, CSS);

    this.systemLayerEl_.insertBefore(
        this.progressBar_.build(pageIds), this.systemLayerEl_.firstChild);

    this.buttonsContainer_ =
        this.systemLayerEl_.querySelector(
            '.i-amphtml-story-system-layer-buttons');

    this.buildForDevelopmentMode_();

    this.initializeListeners_();

    this.storeService_.subscribe(StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS,
        canShowButtons => {
          this.systemLayerEl_.classList
              .toggle('i-amphtml-story-ui-no-buttons', !canShowButtons);
        }, true /* callToInitialize */);

    if (Services.platformFor(this.win_).isIos()) {
      this.systemLayerEl_.setAttribute('ios', '');
    }

    if (Services.viewerForDoc(this.win_.document.documentElement)
        .isEmbedded()) {
      this.systemLayerEl_.classList.add('i-amphtml-embedded');
      this.getShadowRoot().setAttribute(HAS_INFO_BUTTON_ATTRIBUTE, '');
    } else {
      this.getShadowRoot().removeAttribute(HAS_INFO_BUTTON_ATTRIBUTE);
    }

    this.getShadowRoot().setAttribute(MESSAGE_DISPLAY_CLASS, 'noshow');
    return this.getRoot();
  }

  /**
   * @private
   */
  buildForDevelopmentMode_() {
    if (!getMode().development) {
      return;
    }

    this.buttonsContainer_.appendChild(this.developerButtons_.build(
        this.developerLog_.toggle.bind(this.developerLog_)));
    this.getShadowRoot().appendChild(this.developerLog_.build());
  }

  /**
   * @private
   */
  initializeListeners_() {
    // TODO(alanorozco): Listen to tap event properly (i.e. fastclick)
    this.getShadowRoot().addEventListener('click', event => {
      const target = dev().assertElement(event.target);

      if (matches(target, `.${MUTE_CLASS}, .${MUTE_CLASS} *`)) {
        this.onAudioIconClick_(true);
      } else if (matches(target, `.${UNMUTE_CLASS}, .${UNMUTE_CLASS} *`)) {
        this.onAudioIconClick_(false);
      } else if (matches(target, `.${SHARE_CLASS}, .${SHARE_CLASS} *`)) {
        this.onShareClick_();
      } else if (matches(target, `.${INFO_CLASS}, .${INFO_CLASS} *`)) {
        this.onInfoClick_();
      } else if (matches(target, `.${SIDEBAR_CLASS}, .${SIDEBAR_CLASS} *`)) {
        this.onSidebarClick_();
      }
    });

    this.storeService_.subscribe(StateProperty.AD_STATE, isAd => {
      this.onAdStateUpdate_(isAd);
    });

    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, isActive => {
      this.onBookendStateUpdate_(isActive);
    });

    this.storeService_.subscribe(StateProperty.CAN_SHOW_SHARING_UIS, show => {
      this.onCanShowSharingUisUpdate_(show);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.STORY_HAS_AUDIO_STATE,
        hasAudio => {
          this.onStoryHasAudioStateUpdate_(hasAudio);
        }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.MUTED_STATE, isMuted => {
      this.onMutedStateUpdate_(isMuted);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.UI_STATE, uiState => {
      this.onUIStateUpdate_(uiState);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.CURRENT_PAGE_INDEX, index => {
      this.onPageIndexUpdate_(index);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.RTL_STATE, rtlState => {
      this.onRtlStateUpdate_(rtlState);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.PAGE_HAS_AUDIO_STATE, audio => {
      this.onPageHasAudioStateUpdate_(audio);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.HAS_SIDEBAR_STATE,
        hasSidebar => {
          this.onHasSidebarStateUpdate_(hasSidebar);
        }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE,
        isVisible => {
          this.onSystemUiIsVisibleStateUpdate_(isVisible);
        });
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
    this.vsync_.mutate(() => {
      isAd ?
        this.getShadowRoot().setAttribute(AD_SHOWING_ATTRIBUTE, '') :
        this.getShadowRoot().removeAttribute(AD_SHOWING_ATTRIBUTE);
    });
  }

  /**
   * Reacts to the bookend state updates and updates the UI accordingly.
   * @param {boolean} isActive
   * @private
   */
  onBookendStateUpdate_(isActive) {
    this.getShadowRoot()
        .classList.toggle('i-amphtml-story-bookend-active', isActive);
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
   * Reacts to updates to whether sharing UIs may be shown, and updates the UI
   * accordingly.
   * @param {boolean} canShowSharingUis
   * @private
   */
  onCanShowSharingUisUpdate_(canShowSharingUis) {
    this.vsync_.mutate(() => {
      this.getShadowRoot()
          .classList.toggle('i-amphtml-story-no-sharing', !canShowSharingUis);
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
      this.getShadowRoot()
          .classList.toggle('i-amphtml-story-has-audio', hasAudio);
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
        pageHasAudio || !!this.storeService_.get(
            StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE);
    this.vsync_.mutate(() => {
      pageHasAudio ?
        this.getShadowRoot()
            .setAttribute(CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE, '') :
        this.getShadowRoot().removeAttribute(CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE);
    });
  }
  /**
   * Reacts to muted state updates.
   * @param {boolean} isMuted
   * @private
   */
  onMutedStateUpdate_(isMuted) {
    this.vsync_.mutate(() => {
      isMuted ?
        this.getShadowRoot().setAttribute(AUDIO_MUTED_ATTRIBUTE, '') :
        this.getShadowRoot().removeAttribute(AUDIO_MUTED_ATTRIBUTE);
    });
  }

  /**
   * Hides audio message after elapsed time.
   * @private
   */
  hideAudioMessageAfterTimeout_() {
    if (this.timeoutId_) {
      this.timer_.cancel(this.timeoutId_);
    }
    this.timeoutId_ =
        this.timer_.delay(
            () => this.hideAudioMessageInternal_(),
            HIDE_AUDIO_MESSAGE_TIMEOUT_MS);
  }

  /**
   * Hides audio message.
   * @private
   */
  hideAudioMessageInternal_() {
    if (!this.isBuilt_) {
      return;
    }
    this.vsync_.mutate(() => {
      this.getShadowRoot().setAttribute(MESSAGE_DISPLAY_CLASS, 'noshow');
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

      switch (uiState) {
        case UIType.DESKTOP_PANELS:
          shadowRoot.classList.add('i-amphtml-story-desktop-panels');
          break;
        case UIType.DESKTOP_FULLBLEED:
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
      this.getShadowRoot()
          .classList.toggle('i-amphtml-story-hidden', !isVisible);
    });
  }

  /**
   * Reacts to the active page index changing.
   * @param {number} index
   */
  onPageIndexUpdate_(index) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle('first-page-active', index === 0);
    });
  }

  /**
   * Reacts to RTL state updates and triggers the UI for RTL.
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.vsync_.mutate(() => {
      rtlState ?
        this.getShadowRoot().setAttribute('dir', 'rtl') :
        this.getShadowRoot().removeAttribute('dir');
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
      this.hideAudioMessageAfterTimeout_();
    });
  }

  /**
   * Handles click events on the share button and toggles the share menu.
   * @private
   */
  onShareClick_() {
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
      logEntries.forEach(logEntry => this.logInternal_(logEntry));
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
