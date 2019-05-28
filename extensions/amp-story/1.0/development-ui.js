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
import {LogLevel, dev} from '../../../src/log';
import {Services} from '../../../src/services';
import {isArray} from '../../../src/types';
import {removeChildren} from '../../../src/dom';
import {toggle} from '../../../src/style';

/**
 * @param {!../../../src/service/vsync-impl.Vsync} vsync
 * @param {!Element} el
 * @param {boolean} isHidden
 */
function toggleHiddenAttribute(vsync, el, isHidden) {
  vsync.mutate(() => {
    toggle(el, !isHidden);
  });
}

/**
 * @param {!Window} win
 * @param {string|!Array<string>} classNameOrList
 * @param {function(Event)} handler
 * @return {!Element}
 */
function createButton(win, classNameOrList, handler) {
  const button = win.document.createElement('div');
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
 * Development mode logs buttons.
 */
export class DevelopmentModeLogButtonSet {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?Element} */
    this.errorButton_ = null;

    /** @private {?Element} */
    this.warningButton_ = null;

    /** @private {?Element} */
    this.successButton_ = null;
  }

  /**
   * @param {!Window} win
   */
  static create(win) {
    return new DevelopmentModeLogButtonSet(win);
  }

  /**
   * Builds the developer log button set element.
   * @param {function()} logButtonActionFn A callback function to be invoked when
   *     the log buttons are clicked.
   * @return {?Element}
   */
  build(logButtonActionFn) {
    this.errorButton_ = createButton(
      this.win_,
      ['i-amphtml-story-error-button', 'i-amphtml-story-dev-logs-button'],
      () => logButtonActionFn()
    );

    this.warningButton_ = createButton(
      this.win_,
      ['i-amphtml-story-warning-button', 'i-amphtml-story-dev-logs-button'],
      () => logButtonActionFn()
    );

    this.successButton_ = createButton(
      this.win_,
      ['i-amphtml-story-success-button', 'i-amphtml-story-dev-logs-button'],
      () => logButtonActionFn()
    );

    this.root_ = this.win_.document.createElement('div');
    this.root_.appendChild(this.errorButton_);
    this.root_.appendChild(this.warningButton_);
    this.root_.appendChild(this.successButton_);

    return this.root_;
  }

  /**
   * Gets the button associated to a given log entry.
   * @param {!./logging.AmpStoryLogEntryDef} logEntry The log entry for which
   *     the associated button shouldbe retrieved.
   * @return {?Element} The button associated to the specified log entry, if one
   *     exists.
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
   * Logs an individual entry into the developer log.
   * @param {!./logging.AmpStoryLogEntryDef} logEntry The entry to log.
   */
  log(logEntry) {
    const button = this.getButtonForLogEntry_(logEntry);
    if (!button) {
      return;
    }

    const oldCount = parseInt(button.getAttribute('data-count') || 0, 10);
    button.setAttribute('data-count', oldCount + 1);
  }

  /**
   * Clears any error state held by the buttons.
   */
  clear() {
    this.errorButton_.setAttribute('data-count', 0);
    this.warningButton_.setAttribute('data-count', 0);
    this.successButton_.setAttribute('data-count', 0);
  }
}

/**
 * Development mode log for <amp-story>.
 */
export class DevelopmentModeLog {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?Element} */
    this.entriesEl_ = null;

    /** @private {?Element} */
    this.contextStringEl_ = null;
  }

  /**
   * @param {!Window} win
   */
  static create(win) {
    return new DevelopmentModeLog(win);
  }

  /**
   * Builds the developer log element.
   * @return {?Element}
   */
  build() {
    this.contextStringEl_ = this.win_.document.createElement('span');
    this.contextStringEl_.classList.add(
      'i-amphtml-story-developer-log-context'
    );
    const titleEl = this.win_.document.createElement('div');
    titleEl.textContent = 'Developer logs for page ';
    titleEl.appendChild(this.contextStringEl_);

    const closeDeveloperLogEl = createButton(
      this.win_,
      'i-amphtml-story-developer-log-close',
      () => this.hide()
    );

    const headerEl = this.win_.document.createElement('div');
    headerEl.classList.add('i-amphtml-story-developer-log-header');
    headerEl.appendChild(titleEl);
    headerEl.appendChild(closeDeveloperLogEl);

    this.entriesEl_ = this.win_.document.createElement('ul');
    this.entriesEl_.classList.add('i-amphtml-story-developer-log-entries');

    this.root_ = this.win_.document.createElement('div');
    this.root_.classList.add('i-amphtml-story-developer-log');
    toggle(this.root_, false);
    this.root_.appendChild(headerEl);
    this.root_.appendChild(this.entriesEl_);

    this.clear();
    return this.root_;
  }

  /**
   * @param {!LogLevel} logLevel
   * @return {?string} The CSS class to be applied to the log entry, given the
   *     specified log level, or null if no class should be added.
   * @private
   */
  getCssLogLevelClass_(logLevel) {
    switch (logLevel) {
      case LogLevel.WARN:
        return 'i-amphtml-story-developer-log-entry-warning';
      case LogLevel.ERROR:
        return 'i-amphtml-story-developer-log-entry-error';
      default:
        return null;
    }
  }

  /**
   * @param {boolean} conforms Whether the log entry is for an element that
   *     conforms to a best practice.
   * @return {?string} The CSS class to be applied to the log entry, given the
   *     element's conformance to a best practice, or null if no class should be
   *     added.
   * @private
   */
  getCssConformanceClass_(conforms) {
    if (conforms) {
      return 'i-amphtml-story-developer-log-entry-success';
    }

    return null;
  }

  /**
   * @param {!./logging.AmpStoryLogEntryDef} logEntry The entry to be logged.
   */
  log(logEntry) {
    const logLevelClass = this.getCssLogLevelClass_(logEntry.level);
    const conformanceClass = this.getCssConformanceClass_(logEntry.conforms);

    const logEntryUi = this.win_.document.createElement('li');
    logEntryUi.classList.add('i-amphtml-story-developer-log-entry');

    if (logLevelClass) {
      logEntryUi.classList.add(logLevelClass);
    }

    if (conformanceClass) {
      logEntryUi.classList.add(conformanceClass);
    }

    logEntryUi.textContent = logEntry.message;
    this.entriesEl_.appendChild(logEntryUi);
  }

  /**
   * Clears all entries from the developer logs.
   */
  clear() {
    Services.vsyncFor(this.win_).mutate(() => {
      removeChildren(dev().assertElement(this.entriesEl_));
    });
  }

  /**
   * Sets the string providing context for the developer logs window.  This is
   * often the name or ID of the element that all logs are for (e.g. the page).
   * @param {string} contextString
   */
  setContextString(contextString) {
    this.contextStringEl_.textContent = contextString;
  }

  /**
   * Toggles the visibility of the developer log.
   */
  toggle() {
    const newHiddenState = !this.root_.hasAttribute('hidden');
    toggleHiddenAttribute(
      Services.vsyncFor(this.win_),
      dev().assertElement(this.root_),
      newHiddenState
    );
  }

  /**
   * Hides the developer log in the UI.
   */
  hide() {
    toggleHiddenAttribute(
      Services.vsyncFor(this.win_),
      dev().assertElement(this.root_),
      /* isHidden */ true
    );
  }
}
