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
import {DevelopmentModeLog, DevelopmentModeLogButtonSet} from './development-ui';
import {ProgressBar} from './progress-bar';
import {Services} from '../../../src/services';
import {createShadowRoot} from '../../../src/shadow-embed';
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

/** @private @const {!./simple-template.ElementDef} */
const TEMPLATE = {
  tag: 'aside',
  attrs: dict(
      {'class': 'i-amphtml-story-system-layer i-amphtml-story-system-reset'}),
  children: [
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-ui-left'}),
      children: [
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
      attrs: dict({'class': 'i-amphtml-story-ui-right'}),
      children: [
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
    this.leftButtonTray_ = null;

    /** @private @const {!ProgressBar} */
    this.progressBar_ = ProgressBar.create(win);

    /** @private {!DevelopmentModeLog} */
    this.developerLog_ = DevelopmentModeLog.create(win);

    /** @private {!DevelopmentModeLogButtonSet} */
    this.developerButtons_ = DevelopmentModeLogButtonSet.create(win);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win_);

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
    const shadowRoot = createShadowRoot(this.root_);

    this.systemLayerEl_ = renderAsElement(this.win_.document, TEMPLATE);

    const style = this.win_.document.createElement('style');
    style./*OK*/textContent = CSS;

    shadowRoot.appendChild(style);
    shadowRoot.appendChild(this.systemLayerEl_);

    this.systemLayerEl_.insertBefore(
        this.progressBar_.build(pageIds), this.systemLayerEl_.lastChild);

    this.leftButtonTray_ =
        this.systemLayerEl_.querySelector('.i-amphtml-story-ui-left');

    this.buildForDevelopmentMode_();

    this.initializeListeners_();

    // Initializes the component state.
    // TODO(gmajoulet): come up with a way to do this from the subscribe method.
    this.onDesktopStateUpdate_(
        !!this.storeService_.get(StateProperty.DESKTOP_STATE));
    this.onHasAudioStateUpdate_(
        !!this.storeService_.get(StateProperty.HAS_AUDIO_STATE));
    this.onMutedStateUpdate_(
        !!this.storeService_.get(StateProperty.MUTED_STATE));

    // TODO(newmuis): Observe this value.
    if (!this.storeService_.get(StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS)) {
      this.systemLayerEl_.classList.add('i-amphtml-story-ui-no-buttons');
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

    this.leftButtonTray_.appendChild(this.developerButtons_.build(
        this.developerLog_.toggle.bind(this.developerLog_)));
    this.root_.appendChild(this.developerLog_.build());
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
      }
    });

    this.storeService_.subscribe(StateProperty.DESKTOP_STATE, isDesktop => {
      this.onDesktopStateUpdate_(isDesktop);
    });

    this.storeService_.subscribe(StateProperty.HAS_AUDIO_STATE, hasAudio => {
      this.onHasAudioStateUpdate_(hasAudio);
    });

    this.storeService_.subscribe(StateProperty.MUTED_STATE, isMuted => {
      this.onMutedStateUpdate_(isMuted);
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
   * Reacts to desktop state updates and triggers the desktop UI.
   * @param {boolean} isDesktop
   * @private
   */
  onDesktopStateUpdate_(isDesktop) {
    this.vsync_.mutate(() => {
      isDesktop ?
        this.getShadowRoot().setAttribute('desktop', '') :
        this.getShadowRoot().removeAttribute('desktop');
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
      isMuted ?
        this.getShadowRoot().setAttribute(AUDIO_MUTED_ATTRIBUTE, '') :
        this.getShadowRoot().removeAttribute(AUDIO_MUTED_ATTRIBUTE);
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
   * Toggles the visibility of the developer log.
   * @private
   */
  toggleDeveloperLog_() {
    if (!getMode().development) {
      return;
    }

    this.developerLog_.toggle();
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
