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
import {dev, LogLevel} from '../../../src/log';
import {removeChildren} from '../../../src/dom';
import {Services} from '../../../src/services';
import {ProgressBar} from './progress-bar';
import {getMode} from '../../../src/mode';
import {isArray} from '../../../src/types';
import {LogStatus} from './logging';
import {reportError} from '../../../src/error';


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

    /** @private {?Element} */
    this.errorButton_ = null;

    /** @private {?Element} */
    this.warningButton_ = null;

    /** @private {?Element} */
    this.successButton_ = null;

    /** @private {?Element} */
    this.developerLog_ = null;

    /** @private {?Element} */
    this.developerLogEntryListEl_ = null;

    /** @private {?Element} */
    this.developerLogContextStringEl_ = null;

    /** @private @const {!ProgressBar} */
    this.progressBar_ = ProgressBar.create(win);
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

    if (getMode().development) {
      this.buildForDevelopmentMode_();
    }

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
    this.errorButton_ = this.createButton_(
        ['i-amphtml-story-error-button', 'i-amphtml-story-dev-logs-button'],
        e => this.toggleDeveloperLog_(e));

    this.warningButton_ = this.createButton_(
        ['i-amphtml-story-warning-button', 'i-amphtml-story-dev-logs-button'],
        e => this.toggleDeveloperLog_(e));

    this.successButton_ = this.createButton_(
        ['i-amphtml-story-success-button', 'i-amphtml-story-dev-logs-button'],
        e => this.toggleDeveloperLog_(e));

    this.developerLogContextStringEl_ = document.createElement('span');
    this.developerLogContextStringEl_.classList
        .add('i-amphtml-story-developer-log-context');
    const titleEl = document.createElement('div');
    titleEl.textContent = 'Developer logs for page ';
    titleEl.appendChild(this.developerLogContextStringEl_);

    const closeDeveloperLogEl = this.createButton_(
        'i-amphtml-story-developer-log-close',
        e => this.hideDeveloperLog());

    const headerEl = document.createElement('div');
    headerEl.classList.add('i-amphtml-story-developer-log-header');
    headerEl.appendChild(titleEl);
    headerEl.appendChild(closeDeveloperLogEl);

    this.developerLogEntryListEl_ = document.createElement('ul');
    this.developerLogEntryListEl_.classList
        .add('i-amphtml-story-developer-log-entries');

    this.developerLog_ = document.createElement('div');
    this.developerLog_.classList.add('i-amphtml-story-developer-log');
    this.developerLog_.setAttribute('hidden', '');
    this.developerLog_.appendChild(headerEl);
    this.developerLog_.appendChild(this.developerLogEntryListEl_);

    this.resetDeveloperLogs();
    this.root_.appendChild(this.developerLog_);
    this.leftButtonTray_.appendChild(this.errorButton_);
    this.leftButtonTray_.appendChild(this.warningButton_);
    this.leftButtonTray_.appendChild(this.successButton_);
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
   * @param {string|!Array<string>} classNameOrList
   * @param {function(Event)} handler
   * @return {!Element}
   * @private
   */
  createButton_(classNameOrList, handler) {
    const button = document.createElement('div');
    button.setAttribute('role', 'button');

    if (isArray(classNameOrList)) {
      classNameOrList.forEach(className => button.classList.add(className));
    } else {
      button.classList.add(/** @type {string} */ (classNameOrList));
    }
    button.classList.add('i-amphtml-story-button');
    button.addEventListener('click', handler);
    return button;
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
   * @param {!LogStatus} logStatus 
   */
  setDeveloperLogStatus(logStatus) {
    if (!getMode().development) {
      return;
    }
  }


  /**
   * 
   * @param {!./logging.AmpStoryLogEntryDef} logEntry 
   * @return {?Element}
   * @private
   */
  getButtonForLogEntry_(logEntry) {
    if (logEntry.conforms) {
      return this.successButton_;
    }

    switch (logEntry.level) {
      case LogLevel.ERROR:
        return this.errorButton_;
      case LogLevel.WARN:
        return this.warningButton_;
      default:
        return null;
    }
  }

  /**
   * @param {!./logging.AmpStoryLogEntryDef} logEntry
   * @private
   */
  logInternal_(logEntry) {
    const button = this.getButtonForLogEntry_(logEntry);
    if (button) {
      const oldCount = parseInt(button.getAttribute('data-count') || 0, 10);
      button.setAttribute('data-count', oldCount + 1);
    }

    const getCssLogLevelClass = logLevel => {
      switch (logLevel) {
        case LogLevel.WARN:
          return 'i-amphtml-story-developer-log-entry-warning';
        case LogLevel.ERROR:
          return 'i-amphtml-story-developer-log-entry-error';
        default:
          return null;
      }
    };

    const getCssConformanceClass = conforms => {
      if (conforms) {
        return 'i-amphtml-story-developer-log-entry-success';
      }

      return null;
    }

    const logEntryUi = document.createElement('li');
    logEntryUi.classList.add('i-amphtml-story-developer-log-entry');
    logEntryUi.classList.add(getCssLogLevelClass(logEntry.level));
    logEntryUi.classList.add(getCssConformanceClass(logEntry.conforms));
    logEntryUi.textContent = logEntry.message;
    this.developerLogEntryListEl_.appendChild(logEntryUi);
  }

  /**
   * 
   * @param {!Array<!./logging.AmpStoryLogEntryDef>} logEntry
   */
  logAll(logEntries) {
    if (!getMode().development) {
      return;
    }

    Services.vsyncFor(this.win_).mutate(() => {
      logEntries.forEach(entry => this.logInternal_(entry));
    });
  }

  /**
   * @param {!./logging.AmpStoryLogEntryDef} logEntry
   */
  log(logEntry) {
    if (!getMode().development) {
      return;
    }

    this.logInternal_(logEntry);
  }

  /**
   * 
   */
  resetDeveloperLogs() {
    if (!getMode().development) {
      return;
    }

    this.errorButton_.setAttribute('data-count', 0);
    this.warningButton_.setAttribute('data-count', 0);
    this.successButton_.setAttribute('data-count', 0);
    Services.vsyncFor(this.win_).mutate(() => {
      removeChildren(this.developerLogEntryListEl_);
    }
  }

  /**
   * 
   */
  toggleDeveloperLog_() {
    if (!getMode().development) {
      return;
    }
    const newHiddenState = !this.developerLog_.hasAttribute('hidden');
    toggleHiddenAttribute(
        Services.vsyncFor(this.win_), this.developerLog_, newHiddenState);
  }

  /**
   * 
   * @param {string} opt_rootElementName
   */
  setDeveloperLogContextString(contextString) {
    this.developerLogContextStringEl_.textContent = contextString;
  }

  hideDeveloperLog() {
    toggleHiddenAttribute(
        Services.vsyncFor(this.win_), this.developerLog_, /* isHidden */ true);
  }
}
