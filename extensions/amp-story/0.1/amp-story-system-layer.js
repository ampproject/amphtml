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
import {Action, StateProperty} from './amp-story-store-service';
import {CSS} from '../../../build/amp-story-system-layer-0.1.css';
import {
  DevelopmentModeLog,
  DevelopmentModeLogButtonSet,
} from './development-ui';
import {ProgressBar} from './progress-bar';
import {Services} from '../../../src/services';
import {createShadowRootWithStyle} from './utils';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {matches} from '../../../src/dom';
import {renderAsElement} from './simple-template';

/** @private @const {string} */
const AUDIO_MUTED_ATTRIBUTE = 'muted';

/** @private @const {string} */
const MUTE_CLASS = 'i-amphtml-story-mute-audio-control';

/** @private @const {string} */
const UNMUTE_CLASS = 'i-amphtml-story-unmute-audio-control';

/** @private @const {string} */
const SHARE_CLASS = 'i-amphtml-story-share-control';

/** @private @const {string} */
const INFO_CLASS = 'i-amphtml-story-info-control';

/** @private @const {!./simple-template.ElementDef} */
const TEMPLATE = {
  tag: 'aside',
  attrs: dict({
    'class': 'i-amphtml-story-system-layer i-amphtml-story-system-reset',
  }),
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
        {
          tag: 'div',
          attrs: dict({
            'role': 'button',
            'class': SHARE_CLASS + ' i-amphtml-story-button',
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
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

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
    this.storeService_ = Services.storyStoreServiceV01(this.win_);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);
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
      this.progressBar_.build(pageIds),
      this.systemLayerEl_.lastChild
    );

    this.buttonsContainer_ = this.systemLayerEl_.querySelector(
      '.i-amphtml-story-system-layer-buttons'
    );

    this.buildForDevelopmentMode_();

    this.initializeListeners_();

    // TODO(newmuis): Observe this value.
    if (!this.storeService_.get(StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS)) {
      this.systemLayerEl_.classList.add('i-amphtml-story-ui-no-buttons');
    }

    if (Services.platformFor(this.win_).isIos()) {
      this.systemLayerEl_.setAttribute('ios', '');
    }

    if (
      Services.viewerForDoc(this.win_.document.documentElement).isEmbedded()
    ) {
      this.systemLayerEl_.classList.add('i-amphtml-embedded');
    }

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
    this.getShadowRoot().addEventListener('click', event => {
      const target = dev().assertElement(event.target);

      if (matches(target, `.${MUTE_CLASS}, .${MUTE_CLASS} *`)) {
        this.onMuteAudioClick_();
      } else if (matches(target, `.${UNMUTE_CLASS}, .${UNMUTE_CLASS} *`)) {
        this.onUnmuteAudioClick_();
      } else if (matches(target, `.${SHARE_CLASS}, .${SHARE_CLASS} *`)) {
        this.onShareClick_();
      } else if (matches(target, `.${INFO_CLASS}, .${INFO_CLASS} *`)) {
        this.onInfoClick_();
      }
    });

    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, isActive => {
      this.onBookendStateUpdate_(isActive);
    });

    this.storeService_.subscribe(
      StateProperty.CAN_SHOW_SHARING_UIS,
      show => {
        this.onCanShowSharingUisUpdate_(show);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.DESKTOP_STATE,
      isDesktop => {
        this.onDesktopStateUpdate_(isDesktop);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.HAS_AUDIO_STATE,
      hasAudio => {
        this.onHasAudioStateUpdate_(hasAudio);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.MUTED_STATE,
      isMuted => {
        this.onMutedStateUpdate_(isMuted);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      index => {
        this.onPageIndexUpdate_(index);
      },
      true /** callToInitialize */
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
   * Reacts to desktop state updates and triggers the desktop UI.
   * @param {boolean} isDesktop
   * @private
   */
  onDesktopStateUpdate_(isDesktop) {
    this.vsync_.mutate(() => {
      isDesktop
        ? this.getShadowRoot().setAttribute('desktop', '')
        : this.getShadowRoot().removeAttribute('desktop');
    });
  }

  /**
   * Reacts to has audio state updates, displays the audio controls if needed.
   * @param {boolean} hasAudio
   * @private
   */
  onHasAudioStateUpdate_(hasAudio) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle('audio-playing', hasAudio);
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
   * Reacts to the active page index changing.
   * @param {number} index
   */
  onPageIndexUpdate_(index) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle('first-page-active', index === 0);
    });
  }

  /**
   * Handles click events on the mute button.
   * @private
   */
  onMuteAudioClick_() {
    this.storeService_.dispatch(Action.TOGGLE_MUTED, true);
  }

  /**
   * Handles click events on the unmute button.
   * @private
   */
  onUnmuteAudioClick_() {
    this.storeService_.dispatch(Action.TOGGLE_MUTED, false);
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
   * @param {string} pageId The page id of the new active page.
   * @public
   */
  setActivePageId(pageId) {
    // TODO(newmuis) avoid passing progress logic through system-layer
    this.progressBar_.setActiveSegmentId(pageId);
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
