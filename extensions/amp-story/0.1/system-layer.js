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
import {EventType, dispatch} from './events';
import {dev} from '../../../src/log';
import {Services} from '../../../src/services';
import {ProgressBar} from './progress-bar';
import {getMode} from '../../../src/mode';
import {DevelopmentModeLog, DevelopmentModeLogButtonSet} from './development-ui'; // eslint-disable-line max-len


/*eslint-disable max-len */
/** @private @const {string} */
const TEMPLATE =
    '<div class="i-amphtml-story-ui-left">' +
    '</div>' +
    '<div class="i-amphtml-story-ui-right">' +
      '<div role="button" class="i-amphtml-story-unmute-audio-control i-amphtml-story-button">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="#FFFFFF">' +
          '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>' +
          '<path d="M0 0h24v24H0z" fill="none"/>' +
        '</svg>' +
      '</div>' +
      '<div role="button" class="i-amphtml-story-mute-audio-control i-amphtml-story-button">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="#FFFFFF">' +
          '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>' +
          '<path d="M0 0h24v24H0z" fill="none"/>' +
        '</svg>' +
      '</div>' +
      '<div role="button" class="i-amphtml-story-exit-fullscreen i-amphtml-story-button" hidden>' +
        '<svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M0 0h24v24H0z" fill="none"/>' +
          '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>' +
        '</svg>' +
      '</div>' +
      '<div div role="button" class="i-amphtml-story-bookend-close i-amphtml-story-button" hidden>' +
        '<svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>' +
          '<path d="M0 0h24v24H0z" fill="none"/>' +
        '</svg>' +
      '</div role="button">' +
    '</div>';
/*eslint-enable max-len */


/**
 * @param {!../../../src/service/vsync-impl.Vsync} vsync
 * @param {!Element} el
 * @param {boolean} isHidden
 */
function toggleHiddenAttribute(vsync, el, isHidden) {
  vsync.mutate(() => {
    if (isHidden) {
      el.setAttribute('hidden', 'hidden');
    } else {
      el.removeAttribute('hidden');
    }
  });
}


/**
 * System Layer (i.e. UI Chrome) for <amp-story>.
 * Chrome contains:
 *   - mute/unmute button
 *   - fullscreen button
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

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?Element} */
    this.exitFullScreenBtn_ = null;

    /** @private {?Element} */
    this.closeBookendBtn_ = null;

    /** @private {?Element} */
    this.muteAudioBtn_ = null;

    /** @private {?Element} */
    this.unmuteAudioBtn_ = null;

    /** @private {?Element} */
    this.leftButtonTray_ = null;

    /** @private @const {!ProgressBar} */
    this.progressBar_ = ProgressBar.create(win);

    /** @private {!DevelopmentModeLog} */
    this.developerLog_ = DevelopmentModeLog.create(win);

    /** @private {!DevelopmentModeLogButtonSet} */
    this.developerButtons_ = DevelopmentModeLogButtonSet.create(win);
  }

  /**
   * @param {number} pageCount The number of pages in the story.
   * @return {!Element}
   */
  build(pageCount) {
    if (this.isBuilt_) {
      return this.getRoot();
    }

    this.isBuilt_ = true;

    this.root_ = this.win_.document.createElement('aside');
    this.root_.classList.add('i-amphtml-story-system-layer');

    // It's only OK to use innerHTML here since TEMPLATE is constant. Otherwise,
    // we'd be setting ourselves up for XSS.
    this.root_./*OK*/innerHTML = TEMPLATE;

    this.root_.insertBefore(
        this.progressBar_.build(pageCount), this.root_.firstChild);

    this.leftButtonTray_ =
        this.root_.querySelector('.i-amphtml-story-ui-left');

    this.buildForDevelopmentMode_();

    this.exitFullScreenBtn_ =
        this.root_.querySelector('.i-amphtml-story-exit-fullscreen');

    this.closeBookendBtn_ =
        this.root_.querySelector('.i-amphtml-story-bookend-close');

    this.muteAudioBtn_ =
        this.root_.querySelector('.i-amphtml-story-mute-audio-control');

    this.unmuteAudioBtn_ =
        this.root_.querySelector('.i-amphtml-story-unmute-audio-control');

    this.addEventHandlers_();

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
  addEventHandlers_() {
    // TODO(alanorozco): Listen to tap event properly (i.e. fastclick)
    this.exitFullScreenBtn_.addEventListener(
        'click', e => this.onExitFullScreenClick_(e));

    this.closeBookendBtn_.addEventListener(
        'click', e => this.onCloseBookendClick_(e));

    this.muteAudioBtn_.addEventListener(
        'click', e => this.onMuteAudioClick_(e));

    this.unmuteAudioBtn_.addEventListener(
        'click', e => this.onUnmuteAudioClick_(e));
  }


  /**
   * @return {!Element}
   */
  getRoot() {
    return dev().assertElement(this.root_);
  }

  /**
   * @param {boolean} inFullScreen
   */
  setInFullScreen(inFullScreen) {
    this.toggleExitFullScreenBtn_(inFullScreen);
  }

  /**
   * @param {boolean} isEnabled
   * @private
   */
  toggleExitFullScreenBtn_(isEnabled) {
    toggleHiddenAttribute(
        Services.vsyncFor(this.win_),
        dev().assertElement(this.exitFullScreenBtn_),
        /* opt_isHidden */ !isEnabled);
  }

  /**
   * @param {boolean} isEnabled
   */
  toggleCloseBookendButton(isEnabled) {
    toggleHiddenAttribute(
        Services.vsyncFor(this.win_),
        dev().assertElement(this.closeBookendBtn_),
        /* opt_isHidden */ !isEnabled);
  }

  /**
   * @param {!Event} e
   * @private
   */
  onExitFullScreenClick_(e) {
    this.dispatch_(EventType.EXIT_FULLSCREEN, e);
  }

  /**
   * @param {!Event} e
   * @private
   */
  onCloseBookendClick_(e) {
    this.dispatch_(EventType.CLOSE_BOOKEND, e);
  }

  /**
   * @param {!Event} e
   * @private
   */
  onMuteAudioClick_(e) {
    this.dispatch_(EventType.MUTE, e);
  }

  /**
   * @param {!Event} e
   * @private
   */
  onUnmuteAudioClick_(e) {
    this.dispatch_(EventType.UNMUTE, e);
  }

  /**
   * @param {string} eventType
   * @param {!Event=} opt_event
   * @private
   */
  dispatch_(eventType, opt_event) {
    if (opt_event) {
      dev().assert(opt_event).stopPropagation();
    }

    dispatch(this.getRoot(), eventType, /* opt_bubbles */ true);
  }

  /**
   * @param {number} pageIndex The index of the new active page.
   * @public
   */
  setActivePageIndex(pageIndex) {
    this.progressBar_.setActivePageIndex(pageIndex);
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

    Services.vsyncFor(this.win_).mutate(() => {
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
