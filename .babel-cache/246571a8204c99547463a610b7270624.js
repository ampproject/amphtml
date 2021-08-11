function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
import { LogLevel, dev } from "../../../src/log";
import { Services } from "../../../src/service";
import { isArray } from "../../../src/core/types";
import { removeChildren } from "../../../src/core/dom";
import { toggle } from "../../../src/core/dom/style";

/**
 * @param {!../../../src/service/vsync-impl.Vsync} vsync
 * @param {!Element} el
 * @param {boolean} isHidden
 */
function toggleHiddenAttribute(vsync, el, isHidden) {
  vsync.mutate(function () {
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
  var button = win.document.createElement('div');
  button.setAttribute('role', 'button');

  if (isArray(classNameOrList)) {
    classNameOrList.forEach(function (className) {return button.classList.add(className);});
  } else {
    button.classList.add( /** @type {string} */(classNameOrList));
  }
  button.classList.add('i-amphtml-story-button');
  button.addEventListener('click', handler);
  return button;
}

/**
 * Development mode logs buttons.
 */
export var DevelopmentModeLogButtonSet = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function DevelopmentModeLogButtonSet(win) {_classCallCheck(this, DevelopmentModeLogButtonSet);
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
   * @return {!DevelopmentModeLogButtonSet}
   */_createClass(DevelopmentModeLogButtonSet, [{ key: "build", value:




    /**
     * Builds the developer log button set element.
     * @param {function()} logButtonActionFn A callback function to be invoked when
     *     the log buttons are clicked.
     * @return {?Element}
     */
    function build(logButtonActionFn) {
      this.errorButton_ = createButton(
      this.win_,
      ['i-amphtml-story-error-button', 'i-amphtml-story-dev-logs-button'],
      function () {return logButtonActionFn();});


      this.warningButton_ = createButton(
      this.win_,
      ['i-amphtml-story-warning-button', 'i-amphtml-story-dev-logs-button'],
      function () {return logButtonActionFn();});


      this.successButton_ = createButton(
      this.win_,
      ['i-amphtml-story-success-button', 'i-amphtml-story-dev-logs-button'],
      function () {return logButtonActionFn();});


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
     */ }, { key: "getButtonForLogEntry_", value:
    function getButtonForLogEntry_(logEntry) {
      if (logEntry.conforms) {
        return this.successButton_;
      }

      switch (logEntry.level) {
        case LogLevel.ERROR:
          return this.errorButton_;
        case LogLevel.WARN:
          return this.warningButton_;
        default:
          return null;}

    }

    /**
     * Logs an individual entry into the developer log.
     * @param {!./logging.AmpStoryLogEntryDef} logEntry The entry to log.
     */ }, { key: "log", value:
    function log(logEntry) {
      var button = this.getButtonForLogEntry_(logEntry);
      if (!button) {
        return;
      }

      var oldCount = parseInt(button.getAttribute('data-count') || 0, 10);
      button.setAttribute('data-count', oldCount + 1);
    }

    /**
     * Clears any error state held by the buttons.
     */ }, { key: "clear", value:
    function clear() {
      this.errorButton_.setAttribute('data-count', 0);
      this.warningButton_.setAttribute('data-count', 0);
      this.successButton_.setAttribute('data-count', 0);
    } }], [{ key: "create", value: function create(win) {return new DevelopmentModeLogButtonSet(win);} }]);return DevelopmentModeLogButtonSet;}();


/**
 * Development mode log for <amp-story>.
 */
export var DevelopmentModeLog = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function DevelopmentModeLog(win) {_classCallCheck(this, DevelopmentModeLog);
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
   * @return {!DevelopmentModeLog}
   */_createClass(DevelopmentModeLog, [{ key: "build", value:




    /**
     * Builds the developer log element.
     * @return {?Element}
     */
    function build() {var _this = this;
      this.contextStringEl_ = this.win_.document.createElement('span');
      this.contextStringEl_.classList.add(
      'i-amphtml-story-developer-log-context');

      var titleEl = this.win_.document.createElement('div');
      titleEl.textContent = 'Developer logs for page ';
      titleEl.appendChild(this.contextStringEl_);

      var closeDeveloperLogEl = createButton(
      this.win_,
      'i-amphtml-story-developer-log-close',
      function () {return _this.hide();});


      var headerEl = this.win_.document.createElement('div');
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
     */ }, { key: "getCssLogLevelClass_", value:
    function getCssLogLevelClass_(logLevel) {
      switch (logLevel) {
        case LogLevel.WARN:
          return 'i-amphtml-story-developer-log-entry-warning';
        case LogLevel.ERROR:
          return 'i-amphtml-story-developer-log-entry-error';
        default:
          return null;}

    }

    /**
     * @param {boolean} conforms Whether the log entry is for an element that
     *     conforms to a best practice.
     * @return {?string} The CSS class to be applied to the log entry, given the
     *     element's conformance to a best practice, or null if no class should be
     *     added.
     * @private
     */ }, { key: "getCssConformanceClass_", value:
    function getCssConformanceClass_(conforms) {
      if (conforms) {
        return 'i-amphtml-story-developer-log-entry-success';
      }

      return null;
    }

    /**
     * @param {!./logging.AmpStoryLogEntryDef} logEntry The entry to be logged.
     */ }, { key: "log", value:
    function log(logEntry) {
      var logLevelClass = this.getCssLogLevelClass_(logEntry.level);
      var conformanceClass = this.getCssConformanceClass_(logEntry.conforms);

      var logEntryUi = this.win_.document.createElement('li');
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
     */ }, { key: "clear", value:
    function clear() {var _this2 = this;
      Services.vsyncFor(this.win_).mutate(function () {
        removeChildren( /** @type {!Element} */(_this2.entriesEl_));
      });
    }

    /**
     * Sets the string providing context for the developer logs window.  This is
     * often the name or ID of the element that all logs are for (e.g. the page).
     * @param {string} contextString
     */ }, { key: "setContextString", value:
    function setContextString(contextString) {
      this.contextStringEl_.textContent = contextString;
    }

    /**
     * Toggles the visibility of the developer log.
     */ }, { key: "toggle", value:
    function toggle() {
      var newHiddenState = !this.root_.hasAttribute('hidden');
      toggleHiddenAttribute(
      Services.vsyncFor(this.win_), /** @type {!Element} */(
      this.root_),
      newHiddenState);

    }

    /**
     * Hides the developer log in the UI.
     */ }, { key: "hide", value:
    function hide() {
      toggleHiddenAttribute(
      Services.vsyncFor(this.win_), /** @type {!Element} */(
      this.root_),
      /* isHidden */true);

    } }], [{ key: "create", value: function create(win) {return new DevelopmentModeLog(win);} }]);return DevelopmentModeLog;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/development-ui.js