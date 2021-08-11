function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
    classNameOrList.forEach(function (className) {
      return button.classList.add(className);
    });
  } else {
    button.classList.add(
    /** @type {string} */
    classNameOrList);
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
  function DevelopmentModeLogButtonSet(win) {
    _classCallCheck(this, DevelopmentModeLogButtonSet);

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
   */
  _createClass(DevelopmentModeLogButtonSet, [{
    key: "build",
    value:
    /**
     * Builds the developer log button set element.
     * @param {function()} logButtonActionFn A callback function to be invoked when
     *     the log buttons are clicked.
     * @return {?Element}
     */
    function build(logButtonActionFn) {
      this.errorButton_ = createButton(this.win_, ['i-amphtml-story-error-button', 'i-amphtml-story-dev-logs-button'], function () {
        return logButtonActionFn();
      });
      this.warningButton_ = createButton(this.win_, ['i-amphtml-story-warning-button', 'i-amphtml-story-dev-logs-button'], function () {
        return logButtonActionFn();
      });
      this.successButton_ = createButton(this.win_, ['i-amphtml-story-success-button', 'i-amphtml-story-dev-logs-button'], function () {
        return logButtonActionFn();
      });
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

  }, {
    key: "getButtonForLogEntry_",
    value: function getButtonForLogEntry_(logEntry) {
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

  }, {
    key: "log",
    value: function log(logEntry) {
      var button = this.getButtonForLogEntry_(logEntry);

      if (!button) {
        return;
      }

      var oldCount = parseInt(button.getAttribute('data-count') || 0, 10);
      button.setAttribute('data-count', oldCount + 1);
    }
    /**
     * Clears any error state held by the buttons.
     */

  }, {
    key: "clear",
    value: function clear() {
      this.errorButton_.setAttribute('data-count', 0);
      this.warningButton_.setAttribute('data-count', 0);
      this.successButton_.setAttribute('data-count', 0);
    }
  }], [{
    key: "create",
    value: function create(win) {
      return new DevelopmentModeLogButtonSet(win);
    }
  }]);

  return DevelopmentModeLogButtonSet;
}();

/**
 * Development mode log for <amp-story>.
 */
export var DevelopmentModeLog = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function DevelopmentModeLog(win) {
    _classCallCheck(this, DevelopmentModeLog);

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
   */
  _createClass(DevelopmentModeLog, [{
    key: "build",
    value:
    /**
     * Builds the developer log element.
     * @return {?Element}
     */
    function build() {
      var _this = this;

      this.contextStringEl_ = this.win_.document.createElement('span');
      this.contextStringEl_.classList.add('i-amphtml-story-developer-log-context');
      var titleEl = this.win_.document.createElement('div');
      titleEl.textContent = 'Developer logs for page ';
      titleEl.appendChild(this.contextStringEl_);
      var closeDeveloperLogEl = createButton(this.win_, 'i-amphtml-story-developer-log-close', function () {
        return _this.hide();
      });
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
     */

  }, {
    key: "getCssLogLevelClass_",
    value: function getCssLogLevelClass_(logLevel) {
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

  }, {
    key: "getCssConformanceClass_",
    value: function getCssConformanceClass_(conforms) {
      if (conforms) {
        return 'i-amphtml-story-developer-log-entry-success';
      }

      return null;
    }
    /**
     * @param {!./logging.AmpStoryLogEntryDef} logEntry The entry to be logged.
     */

  }, {
    key: "log",
    value: function log(logEntry) {
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
     */

  }, {
    key: "clear",
    value: function clear() {
      var _this2 = this;

      Services.vsyncFor(this.win_).mutate(function () {
        removeChildren(dev().assertElement(_this2.entriesEl_));
      });
    }
    /**
     * Sets the string providing context for the developer logs window.  This is
     * often the name or ID of the element that all logs are for (e.g. the page).
     * @param {string} contextString
     */

  }, {
    key: "setContextString",
    value: function setContextString(contextString) {
      this.contextStringEl_.textContent = contextString;
    }
    /**
     * Toggles the visibility of the developer log.
     */

  }, {
    key: "toggle",
    value: function toggle() {
      var newHiddenState = !this.root_.hasAttribute('hidden');
      toggleHiddenAttribute(Services.vsyncFor(this.win_), dev().assertElement(this.root_), newHiddenState);
    }
    /**
     * Hides the developer log in the UI.
     */

  }, {
    key: "hide",
    value: function hide() {
      toggleHiddenAttribute(Services.vsyncFor(this.win_), dev().assertElement(this.root_),
      /* isHidden */
      true);
    }
  }], [{
    key: "create",
    value: function create(win) {
      return new DevelopmentModeLog(win);
    }
  }]);

  return DevelopmentModeLog;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRldmVsb3BtZW50LXVpLmpzIl0sIm5hbWVzIjpbIkxvZ0xldmVsIiwiZGV2IiwiU2VydmljZXMiLCJpc0FycmF5IiwicmVtb3ZlQ2hpbGRyZW4iLCJ0b2dnbGUiLCJ0b2dnbGVIaWRkZW5BdHRyaWJ1dGUiLCJ2c3luYyIsImVsIiwiaXNIaWRkZW4iLCJtdXRhdGUiLCJjcmVhdGVCdXR0b24iLCJ3aW4iLCJjbGFzc05hbWVPckxpc3QiLCJoYW5kbGVyIiwiYnV0dG9uIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwiZm9yRWFjaCIsImNsYXNzTmFtZSIsImNsYXNzTGlzdCIsImFkZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJEZXZlbG9wbWVudE1vZGVMb2dCdXR0b25TZXQiLCJ3aW5fIiwicm9vdF8iLCJlcnJvckJ1dHRvbl8iLCJ3YXJuaW5nQnV0dG9uXyIsInN1Y2Nlc3NCdXR0b25fIiwibG9nQnV0dG9uQWN0aW9uRm4iLCJhcHBlbmRDaGlsZCIsImxvZ0VudHJ5IiwiY29uZm9ybXMiLCJsZXZlbCIsIkVSUk9SIiwiV0FSTiIsImdldEJ1dHRvbkZvckxvZ0VudHJ5XyIsIm9sZENvdW50IiwicGFyc2VJbnQiLCJnZXRBdHRyaWJ1dGUiLCJEZXZlbG9wbWVudE1vZGVMb2ciLCJlbnRyaWVzRWxfIiwiY29udGV4dFN0cmluZ0VsXyIsInRpdGxlRWwiLCJ0ZXh0Q29udGVudCIsImNsb3NlRGV2ZWxvcGVyTG9nRWwiLCJoaWRlIiwiaGVhZGVyRWwiLCJjbGVhciIsImxvZ0xldmVsIiwibG9nTGV2ZWxDbGFzcyIsImdldENzc0xvZ0xldmVsQ2xhc3NfIiwiY29uZm9ybWFuY2VDbGFzcyIsImdldENzc0NvbmZvcm1hbmNlQ2xhc3NfIiwibG9nRW50cnlVaSIsIm1lc3NhZ2UiLCJ2c3luY0ZvciIsImFzc2VydEVsZW1lbnQiLCJjb250ZXh0U3RyaW5nIiwibmV3SGlkZGVuU3RhdGUiLCJoYXNBdHRyaWJ1dGUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVFBLFFBQVIsRUFBa0JDLEdBQWxCO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsTUFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MscUJBQVQsQ0FBK0JDLEtBQS9CLEVBQXNDQyxFQUF0QyxFQUEwQ0MsUUFBMUMsRUFBb0Q7QUFDbERGLEVBQUFBLEtBQUssQ0FBQ0csTUFBTixDQUFhLFlBQU07QUFDakJMLElBQUFBLE1BQU0sQ0FBQ0csRUFBRCxFQUFLLENBQUNDLFFBQU4sQ0FBTjtBQUNELEdBRkQ7QUFHRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTRSxZQUFULENBQXNCQyxHQUF0QixFQUEyQkMsZUFBM0IsRUFBNENDLE9BQTVDLEVBQXFEO0FBQ25ELE1BQU1DLE1BQU0sR0FBR0gsR0FBRyxDQUFDSSxRQUFKLENBQWFDLGFBQWIsQ0FBMkIsS0FBM0IsQ0FBZjtBQUNBRixFQUFBQSxNQUFNLENBQUNHLFlBQVAsQ0FBb0IsTUFBcEIsRUFBNEIsUUFBNUI7O0FBRUEsTUFBSWYsT0FBTyxDQUFDVSxlQUFELENBQVgsRUFBOEI7QUFDNUJBLElBQUFBLGVBQWUsQ0FBQ00sT0FBaEIsQ0FBd0IsVUFBQ0MsU0FBRDtBQUFBLGFBQWVMLE1BQU0sQ0FBQ00sU0FBUCxDQUFpQkMsR0FBakIsQ0FBcUJGLFNBQXJCLENBQWY7QUFBQSxLQUF4QjtBQUNELEdBRkQsTUFFTztBQUNMTCxJQUFBQSxNQUFNLENBQUNNLFNBQVAsQ0FBaUJDLEdBQWpCO0FBQXFCO0FBQXVCVCxJQUFBQSxlQUE1QztBQUNEOztBQUNERSxFQUFBQSxNQUFNLENBQUNNLFNBQVAsQ0FBaUJDLEdBQWpCLENBQXFCLHdCQUFyQjtBQUNBUCxFQUFBQSxNQUFNLENBQUNRLGdCQUFQLENBQXdCLE9BQXhCLEVBQWlDVCxPQUFqQztBQUNBLFNBQU9DLE1BQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxXQUFhUywyQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLHVDQUFZWixHQUFaLEVBQWlCO0FBQUE7O0FBQ2Y7QUFDQSxTQUFLYSxJQUFMLEdBQVliLEdBQVo7O0FBRUE7QUFDQSxTQUFLYyxLQUFMLEdBQWEsSUFBYjs7QUFFQTtBQUNBLFNBQUtDLFlBQUwsR0FBb0IsSUFBcEI7O0FBRUE7QUFDQSxTQUFLQyxjQUFMLEdBQXNCLElBQXRCOztBQUVBO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQixJQUF0QjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBeEJBO0FBQUE7QUFBQTtBQTZCRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRSxtQkFBTUMsaUJBQU4sRUFBeUI7QUFDdkIsV0FBS0gsWUFBTCxHQUFvQmhCLFlBQVksQ0FDOUIsS0FBS2MsSUFEeUIsRUFFOUIsQ0FBQyw4QkFBRCxFQUFpQyxpQ0FBakMsQ0FGOEIsRUFHOUI7QUFBQSxlQUFNSyxpQkFBaUIsRUFBdkI7QUFBQSxPQUg4QixDQUFoQztBQU1BLFdBQUtGLGNBQUwsR0FBc0JqQixZQUFZLENBQ2hDLEtBQUtjLElBRDJCLEVBRWhDLENBQUMsZ0NBQUQsRUFBbUMsaUNBQW5DLENBRmdDLEVBR2hDO0FBQUEsZUFBTUssaUJBQWlCLEVBQXZCO0FBQUEsT0FIZ0MsQ0FBbEM7QUFNQSxXQUFLRCxjQUFMLEdBQXNCbEIsWUFBWSxDQUNoQyxLQUFLYyxJQUQyQixFQUVoQyxDQUFDLGdDQUFELEVBQW1DLGlDQUFuQyxDQUZnQyxFQUdoQztBQUFBLGVBQU1LLGlCQUFpQixFQUF2QjtBQUFBLE9BSGdDLENBQWxDO0FBTUEsV0FBS0osS0FBTCxHQUFhLEtBQUtELElBQUwsQ0FBVVQsUUFBVixDQUFtQkMsYUFBbkIsQ0FBaUMsS0FBakMsQ0FBYjtBQUNBLFdBQUtTLEtBQUwsQ0FBV0ssV0FBWCxDQUF1QixLQUFLSixZQUE1QjtBQUNBLFdBQUtELEtBQUwsQ0FBV0ssV0FBWCxDQUF1QixLQUFLSCxjQUE1QjtBQUNBLFdBQUtGLEtBQUwsQ0FBV0ssV0FBWCxDQUF1QixLQUFLRixjQUE1QjtBQUVBLGFBQU8sS0FBS0gsS0FBWjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFyRUE7QUFBQTtBQUFBLFdBc0VFLCtCQUFzQk0sUUFBdEIsRUFBZ0M7QUFDOUIsVUFBSUEsUUFBUSxDQUFDQyxRQUFiLEVBQXVCO0FBQ3JCLGVBQU8sS0FBS0osY0FBWjtBQUNEOztBQUVELGNBQVFHLFFBQVEsQ0FBQ0UsS0FBakI7QUFDRSxhQUFLbEMsUUFBUSxDQUFDbUMsS0FBZDtBQUNFLGlCQUFPLEtBQUtSLFlBQVo7O0FBQ0YsYUFBSzNCLFFBQVEsQ0FBQ29DLElBQWQ7QUFDRSxpQkFBTyxLQUFLUixjQUFaOztBQUNGO0FBQ0UsaUJBQU8sSUFBUDtBQU5KO0FBUUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF4RkE7QUFBQTtBQUFBLFdBeUZFLGFBQUlJLFFBQUosRUFBYztBQUNaLFVBQU1qQixNQUFNLEdBQUcsS0FBS3NCLHFCQUFMLENBQTJCTCxRQUEzQixDQUFmOztBQUNBLFVBQUksQ0FBQ2pCLE1BQUwsRUFBYTtBQUNYO0FBQ0Q7O0FBRUQsVUFBTXVCLFFBQVEsR0FBR0MsUUFBUSxDQUFDeEIsTUFBTSxDQUFDeUIsWUFBUCxDQUFvQixZQUFwQixLQUFxQyxDQUF0QyxFQUF5QyxFQUF6QyxDQUF6QjtBQUNBekIsTUFBQUEsTUFBTSxDQUFDRyxZQUFQLENBQW9CLFlBQXBCLEVBQWtDb0IsUUFBUSxHQUFHLENBQTdDO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBckdBO0FBQUE7QUFBQSxXQXNHRSxpQkFBUTtBQUNOLFdBQUtYLFlBQUwsQ0FBa0JULFlBQWxCLENBQStCLFlBQS9CLEVBQTZDLENBQTdDO0FBQ0EsV0FBS1UsY0FBTCxDQUFvQlYsWUFBcEIsQ0FBaUMsWUFBakMsRUFBK0MsQ0FBL0M7QUFDQSxXQUFLVyxjQUFMLENBQW9CWCxZQUFwQixDQUFpQyxZQUFqQyxFQUErQyxDQUEvQztBQUNEO0FBMUdIO0FBQUE7QUFBQSxXQXlCRSxnQkFBY04sR0FBZCxFQUFtQjtBQUNqQixhQUFPLElBQUlZLDJCQUFKLENBQWdDWixHQUFoQyxDQUFQO0FBQ0Q7QUEzQkg7O0FBQUE7QUFBQTs7QUE2R0E7QUFDQTtBQUNBO0FBQ0EsV0FBYTZCLGtCQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0UsOEJBQVk3QixHQUFaLEVBQWlCO0FBQUE7O0FBQ2Y7QUFDQSxTQUFLYSxJQUFMLEdBQVliLEdBQVo7O0FBRUE7QUFDQSxTQUFLYyxLQUFMLEdBQWEsSUFBYjs7QUFFQTtBQUNBLFNBQUtnQixVQUFMLEdBQWtCLElBQWxCOztBQUVBO0FBQ0EsU0FBS0MsZ0JBQUwsR0FBd0IsSUFBeEI7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQXJCQTtBQUFBO0FBQUE7QUEwQkU7QUFDRjtBQUNBO0FBQ0E7QUFDRSxxQkFBUTtBQUFBOztBQUNOLFdBQUtBLGdCQUFMLEdBQXdCLEtBQUtsQixJQUFMLENBQVVULFFBQVYsQ0FBbUJDLGFBQW5CLENBQWlDLE1BQWpDLENBQXhCO0FBQ0EsV0FBSzBCLGdCQUFMLENBQXNCdEIsU0FBdEIsQ0FBZ0NDLEdBQWhDLENBQ0UsdUNBREY7QUFHQSxVQUFNc0IsT0FBTyxHQUFHLEtBQUtuQixJQUFMLENBQVVULFFBQVYsQ0FBbUJDLGFBQW5CLENBQWlDLEtBQWpDLENBQWhCO0FBQ0EyQixNQUFBQSxPQUFPLENBQUNDLFdBQVIsR0FBc0IsMEJBQXRCO0FBQ0FELE1BQUFBLE9BQU8sQ0FBQ2IsV0FBUixDQUFvQixLQUFLWSxnQkFBekI7QUFFQSxVQUFNRyxtQkFBbUIsR0FBR25DLFlBQVksQ0FDdEMsS0FBS2MsSUFEaUMsRUFFdEMscUNBRnNDLEVBR3RDO0FBQUEsZUFBTSxLQUFJLENBQUNzQixJQUFMLEVBQU47QUFBQSxPQUhzQyxDQUF4QztBQU1BLFVBQU1DLFFBQVEsR0FBRyxLQUFLdkIsSUFBTCxDQUFVVCxRQUFWLENBQW1CQyxhQUFuQixDQUFpQyxLQUFqQyxDQUFqQjtBQUNBK0IsTUFBQUEsUUFBUSxDQUFDM0IsU0FBVCxDQUFtQkMsR0FBbkIsQ0FBdUIsc0NBQXZCO0FBQ0EwQixNQUFBQSxRQUFRLENBQUNqQixXQUFULENBQXFCYSxPQUFyQjtBQUNBSSxNQUFBQSxRQUFRLENBQUNqQixXQUFULENBQXFCZSxtQkFBckI7QUFFQSxXQUFLSixVQUFMLEdBQWtCLEtBQUtqQixJQUFMLENBQVVULFFBQVYsQ0FBbUJDLGFBQW5CLENBQWlDLElBQWpDLENBQWxCO0FBQ0EsV0FBS3lCLFVBQUwsQ0FBZ0JyQixTQUFoQixDQUEwQkMsR0FBMUIsQ0FBOEIsdUNBQTlCO0FBRUEsV0FBS0ksS0FBTCxHQUFhLEtBQUtELElBQUwsQ0FBVVQsUUFBVixDQUFtQkMsYUFBbkIsQ0FBaUMsS0FBakMsQ0FBYjtBQUNBLFdBQUtTLEtBQUwsQ0FBV0wsU0FBWCxDQUFxQkMsR0FBckIsQ0FBeUIsK0JBQXpCO0FBQ0FqQixNQUFBQSxNQUFNLENBQUMsS0FBS3FCLEtBQU4sRUFBYSxLQUFiLENBQU47QUFDQSxXQUFLQSxLQUFMLENBQVdLLFdBQVgsQ0FBdUJpQixRQUF2QjtBQUNBLFdBQUt0QixLQUFMLENBQVdLLFdBQVgsQ0FBdUIsS0FBS1csVUFBNUI7QUFFQSxXQUFLTyxLQUFMO0FBQ0EsYUFBTyxLQUFLdkIsS0FBWjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXBFQTtBQUFBO0FBQUEsV0FxRUUsOEJBQXFCd0IsUUFBckIsRUFBK0I7QUFDN0IsY0FBUUEsUUFBUjtBQUNFLGFBQUtsRCxRQUFRLENBQUNvQyxJQUFkO0FBQ0UsaUJBQU8sNkNBQVA7O0FBQ0YsYUFBS3BDLFFBQVEsQ0FBQ21DLEtBQWQ7QUFDRSxpQkFBTywyQ0FBUDs7QUFDRjtBQUNFLGlCQUFPLElBQVA7QUFOSjtBQVFEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF2RkE7QUFBQTtBQUFBLFdBd0ZFLGlDQUF3QkYsUUFBeEIsRUFBa0M7QUFDaEMsVUFBSUEsUUFBSixFQUFjO0FBQ1osZUFBTyw2Q0FBUDtBQUNEOztBQUVELGFBQU8sSUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQWxHQTtBQUFBO0FBQUEsV0FtR0UsYUFBSUQsUUFBSixFQUFjO0FBQ1osVUFBTW1CLGFBQWEsR0FBRyxLQUFLQyxvQkFBTCxDQUEwQnBCLFFBQVEsQ0FBQ0UsS0FBbkMsQ0FBdEI7QUFDQSxVQUFNbUIsZ0JBQWdCLEdBQUcsS0FBS0MsdUJBQUwsQ0FBNkJ0QixRQUFRLENBQUNDLFFBQXRDLENBQXpCO0FBRUEsVUFBTXNCLFVBQVUsR0FBRyxLQUFLOUIsSUFBTCxDQUFVVCxRQUFWLENBQW1CQyxhQUFuQixDQUFpQyxJQUFqQyxDQUFuQjtBQUNBc0MsTUFBQUEsVUFBVSxDQUFDbEMsU0FBWCxDQUFxQkMsR0FBckIsQ0FBeUIscUNBQXpCOztBQUVBLFVBQUk2QixhQUFKLEVBQW1CO0FBQ2pCSSxRQUFBQSxVQUFVLENBQUNsQyxTQUFYLENBQXFCQyxHQUFyQixDQUF5QjZCLGFBQXpCO0FBQ0Q7O0FBRUQsVUFBSUUsZ0JBQUosRUFBc0I7QUFDcEJFLFFBQUFBLFVBQVUsQ0FBQ2xDLFNBQVgsQ0FBcUJDLEdBQXJCLENBQXlCK0IsZ0JBQXpCO0FBQ0Q7O0FBRURFLE1BQUFBLFVBQVUsQ0FBQ1YsV0FBWCxHQUF5QmIsUUFBUSxDQUFDd0IsT0FBbEM7QUFDQSxXQUFLZCxVQUFMLENBQWdCWCxXQUFoQixDQUE0QndCLFVBQTVCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBeEhBO0FBQUE7QUFBQSxXQXlIRSxpQkFBUTtBQUFBOztBQUNOckQsTUFBQUEsUUFBUSxDQUFDdUQsUUFBVCxDQUFrQixLQUFLaEMsSUFBdkIsRUFBNkJmLE1BQTdCLENBQW9DLFlBQU07QUFDeENOLFFBQUFBLGNBQWMsQ0FBQ0gsR0FBRyxHQUFHeUQsYUFBTixDQUFvQixNQUFJLENBQUNoQixVQUF6QixDQUFELENBQWQ7QUFDRCxPQUZEO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQW5JQTtBQUFBO0FBQUEsV0FvSUUsMEJBQWlCaUIsYUFBakIsRUFBZ0M7QUFDOUIsV0FBS2hCLGdCQUFMLENBQXNCRSxXQUF0QixHQUFvQ2MsYUFBcEM7QUFDRDtBQUVEO0FBQ0Y7QUFDQTs7QUExSUE7QUFBQTtBQUFBLFdBMklFLGtCQUFTO0FBQ1AsVUFBTUMsY0FBYyxHQUFHLENBQUMsS0FBS2xDLEtBQUwsQ0FBV21DLFlBQVgsQ0FBd0IsUUFBeEIsQ0FBeEI7QUFDQXZELE1BQUFBLHFCQUFxQixDQUNuQkosUUFBUSxDQUFDdUQsUUFBVCxDQUFrQixLQUFLaEMsSUFBdkIsQ0FEbUIsRUFFbkJ4QixHQUFHLEdBQUd5RCxhQUFOLENBQW9CLEtBQUtoQyxLQUF6QixDQUZtQixFQUduQmtDLGNBSG1CLENBQXJCO0FBS0Q7QUFFRDtBQUNGO0FBQ0E7O0FBdEpBO0FBQUE7QUFBQSxXQXVKRSxnQkFBTztBQUNMdEQsTUFBQUEscUJBQXFCLENBQ25CSixRQUFRLENBQUN1RCxRQUFULENBQWtCLEtBQUtoQyxJQUF2QixDQURtQixFQUVuQnhCLEdBQUcsR0FBR3lELGFBQU4sQ0FBb0IsS0FBS2hDLEtBQXpCLENBRm1CO0FBR25CO0FBQWUsVUFISSxDQUFyQjtBQUtEO0FBN0pIO0FBQUE7QUFBQSxXQXNCRSxnQkFBY2QsR0FBZCxFQUFtQjtBQUNqQixhQUFPLElBQUk2QixrQkFBSixDQUF1QjdCLEdBQXZCLENBQVA7QUFDRDtBQXhCSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5pbXBvcnQge0xvZ0xldmVsLCBkZXZ9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtpc0FycmF5fSBmcm9tICcjY29yZS90eXBlcyc7XG5pbXBvcnQge3JlbW92ZUNoaWxkcmVufSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHt0b2dnbGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5cbi8qKlxuICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdnN5bmMtaW1wbC5Wc3luY30gdnN5bmNcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzSGlkZGVuXG4gKi9cbmZ1bmN0aW9uIHRvZ2dsZUhpZGRlbkF0dHJpYnV0ZSh2c3luYywgZWwsIGlzSGlkZGVuKSB7XG4gIHZzeW5jLm11dGF0ZSgoKSA9PiB7XG4gICAgdG9nZ2xlKGVsLCAhaXNIaWRkZW4pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtzdHJpbmd8IUFycmF5PHN0cmluZz59IGNsYXNzTmFtZU9yTGlzdFxuICogQHBhcmFtIHtmdW5jdGlvbihFdmVudCl9IGhhbmRsZXJcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5mdW5jdGlvbiBjcmVhdGVCdXR0b24od2luLCBjbGFzc05hbWVPckxpc3QsIGhhbmRsZXIpIHtcbiAgY29uc3QgYnV0dG9uID0gd2luLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBidXR0b24uc2V0QXR0cmlidXRlKCdyb2xlJywgJ2J1dHRvbicpO1xuXG4gIGlmIChpc0FycmF5KGNsYXNzTmFtZU9yTGlzdCkpIHtcbiAgICBjbGFzc05hbWVPckxpc3QuZm9yRWFjaCgoY2xhc3NOYW1lKSA9PiBidXR0b24uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpKTtcbiAgfSBlbHNlIHtcbiAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgvKiogQHR5cGUge3N0cmluZ30gKi8gKGNsYXNzTmFtZU9yTGlzdCkpO1xuICB9XG4gIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktYnV0dG9uJyk7XG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIpO1xuICByZXR1cm4gYnV0dG9uO1xufVxuXG4vKipcbiAqIERldmVsb3BtZW50IG1vZGUgbG9ncyBidXR0b25zLlxuICovXG5leHBvcnQgY2xhc3MgRGV2ZWxvcG1lbnRNb2RlTG9nQnV0dG9uU2V0IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4pIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5yb290XyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuZXJyb3JCdXR0b25fID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy53YXJuaW5nQnV0dG9uXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuc3VjY2Vzc0J1dHRvbl8gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEByZXR1cm4geyFEZXZlbG9wbWVudE1vZGVMb2dCdXR0b25TZXR9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlKHdpbikge1xuICAgIHJldHVybiBuZXcgRGV2ZWxvcG1lbnRNb2RlTG9nQnV0dG9uU2V0KHdpbik7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIHRoZSBkZXZlbG9wZXIgbG9nIGJ1dHRvbiBzZXQgZWxlbWVudC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBsb2dCdXR0b25BY3Rpb25GbiBBIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgd2hlblxuICAgKiAgICAgdGhlIGxvZyBidXR0b25zIGFyZSBjbGlja2VkLlxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAgICovXG4gIGJ1aWxkKGxvZ0J1dHRvbkFjdGlvbkZuKSB7XG4gICAgdGhpcy5lcnJvckJ1dHRvbl8gPSBjcmVhdGVCdXR0b24oXG4gICAgICB0aGlzLndpbl8sXG4gICAgICBbJ2ktYW1waHRtbC1zdG9yeS1lcnJvci1idXR0b24nLCAnaS1hbXBodG1sLXN0b3J5LWRldi1sb2dzLWJ1dHRvbiddLFxuICAgICAgKCkgPT4gbG9nQnV0dG9uQWN0aW9uRm4oKVxuICAgICk7XG5cbiAgICB0aGlzLndhcm5pbmdCdXR0b25fID0gY3JlYXRlQnV0dG9uKFxuICAgICAgdGhpcy53aW5fLFxuICAgICAgWydpLWFtcGh0bWwtc3Rvcnktd2FybmluZy1idXR0b24nLCAnaS1hbXBodG1sLXN0b3J5LWRldi1sb2dzLWJ1dHRvbiddLFxuICAgICAgKCkgPT4gbG9nQnV0dG9uQWN0aW9uRm4oKVxuICAgICk7XG5cbiAgICB0aGlzLnN1Y2Nlc3NCdXR0b25fID0gY3JlYXRlQnV0dG9uKFxuICAgICAgdGhpcy53aW5fLFxuICAgICAgWydpLWFtcGh0bWwtc3Rvcnktc3VjY2Vzcy1idXR0b24nLCAnaS1hbXBodG1sLXN0b3J5LWRldi1sb2dzLWJ1dHRvbiddLFxuICAgICAgKCkgPT4gbG9nQnV0dG9uQWN0aW9uRm4oKVxuICAgICk7XG5cbiAgICB0aGlzLnJvb3RfID0gdGhpcy53aW5fLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMucm9vdF8uYXBwZW5kQ2hpbGQodGhpcy5lcnJvckJ1dHRvbl8pO1xuICAgIHRoaXMucm9vdF8uYXBwZW5kQ2hpbGQodGhpcy53YXJuaW5nQnV0dG9uXyk7XG4gICAgdGhpcy5yb290Xy5hcHBlbmRDaGlsZCh0aGlzLnN1Y2Nlc3NCdXR0b25fKTtcblxuICAgIHJldHVybiB0aGlzLnJvb3RfO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGJ1dHRvbiBhc3NvY2lhdGVkIHRvIGEgZ2l2ZW4gbG9nIGVudHJ5LlxuICAgKiBAcGFyYW0geyEuL2xvZ2dpbmcuQW1wU3RvcnlMb2dFbnRyeURlZn0gbG9nRW50cnkgVGhlIGxvZyBlbnRyeSBmb3Igd2hpY2hcbiAgICogICAgIHRoZSBhc3NvY2lhdGVkIGJ1dHRvbiBzaG91bGRiZSByZXRyaWV2ZWQuXG4gICAqIEByZXR1cm4gez9FbGVtZW50fSBUaGUgYnV0dG9uIGFzc29jaWF0ZWQgdG8gdGhlIHNwZWNpZmllZCBsb2cgZW50cnksIGlmIG9uZVxuICAgKiAgICAgZXhpc3RzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0QnV0dG9uRm9yTG9nRW50cnlfKGxvZ0VudHJ5KSB7XG4gICAgaWYgKGxvZ0VudHJ5LmNvbmZvcm1zKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdWNjZXNzQnV0dG9uXztcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGxvZ0VudHJ5LmxldmVsKSB7XG4gICAgICBjYXNlIExvZ0xldmVsLkVSUk9SOlxuICAgICAgICByZXR1cm4gdGhpcy5lcnJvckJ1dHRvbl87XG4gICAgICBjYXNlIExvZ0xldmVsLldBUk46XG4gICAgICAgIHJldHVybiB0aGlzLndhcm5pbmdCdXR0b25fO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgYW4gaW5kaXZpZHVhbCBlbnRyeSBpbnRvIHRoZSBkZXZlbG9wZXIgbG9nLlxuICAgKiBAcGFyYW0geyEuL2xvZ2dpbmcuQW1wU3RvcnlMb2dFbnRyeURlZn0gbG9nRW50cnkgVGhlIGVudHJ5IHRvIGxvZy5cbiAgICovXG4gIGxvZyhsb2dFbnRyeSkge1xuICAgIGNvbnN0IGJ1dHRvbiA9IHRoaXMuZ2V0QnV0dG9uRm9yTG9nRW50cnlfKGxvZ0VudHJ5KTtcbiAgICBpZiAoIWJ1dHRvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG9sZENvdW50ID0gcGFyc2VJbnQoYnV0dG9uLmdldEF0dHJpYnV0ZSgnZGF0YS1jb3VudCcpIHx8IDAsIDEwKTtcbiAgICBidXR0b24uc2V0QXR0cmlidXRlKCdkYXRhLWNvdW50Jywgb2xkQ291bnQgKyAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgYW55IGVycm9yIHN0YXRlIGhlbGQgYnkgdGhlIGJ1dHRvbnMuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLmVycm9yQnV0dG9uXy5zZXRBdHRyaWJ1dGUoJ2RhdGEtY291bnQnLCAwKTtcbiAgICB0aGlzLndhcm5pbmdCdXR0b25fLnNldEF0dHJpYnV0ZSgnZGF0YS1jb3VudCcsIDApO1xuICAgIHRoaXMuc3VjY2Vzc0J1dHRvbl8uc2V0QXR0cmlidXRlKCdkYXRhLWNvdW50JywgMCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXZlbG9wbWVudCBtb2RlIGxvZyBmb3IgPGFtcC1zdG9yeT4uXG4gKi9cbmV4cG9ydCBjbGFzcyBEZXZlbG9wbWVudE1vZGVMb2cge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbikge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLnJvb3RfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5lbnRyaWVzRWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5jb250ZXh0U3RyaW5nRWxfID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcmV0dXJuIHshRGV2ZWxvcG1lbnRNb2RlTG9nfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZSh3aW4pIHtcbiAgICByZXR1cm4gbmV3IERldmVsb3BtZW50TW9kZUxvZyh3aW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyB0aGUgZGV2ZWxvcGVyIGxvZyBlbGVtZW50LlxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAgICovXG4gIGJ1aWxkKCkge1xuICAgIHRoaXMuY29udGV4dFN0cmluZ0VsXyA9IHRoaXMud2luXy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgdGhpcy5jb250ZXh0U3RyaW5nRWxfLmNsYXNzTGlzdC5hZGQoXG4gICAgICAnaS1hbXBodG1sLXN0b3J5LWRldmVsb3Blci1sb2ctY29udGV4dCdcbiAgICApO1xuICAgIGNvbnN0IHRpdGxlRWwgPSB0aGlzLndpbl8uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGl0bGVFbC50ZXh0Q29udGVudCA9ICdEZXZlbG9wZXIgbG9ncyBmb3IgcGFnZSAnO1xuICAgIHRpdGxlRWwuYXBwZW5kQ2hpbGQodGhpcy5jb250ZXh0U3RyaW5nRWxfKTtcblxuICAgIGNvbnN0IGNsb3NlRGV2ZWxvcGVyTG9nRWwgPSBjcmVhdGVCdXR0b24oXG4gICAgICB0aGlzLndpbl8sXG4gICAgICAnaS1hbXBodG1sLXN0b3J5LWRldmVsb3Blci1sb2ctY2xvc2UnLFxuICAgICAgKCkgPT4gdGhpcy5oaWRlKClcbiAgICApO1xuXG4gICAgY29uc3QgaGVhZGVyRWwgPSB0aGlzLndpbl8uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaGVhZGVyRWwuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWRldmVsb3Blci1sb2ctaGVhZGVyJyk7XG4gICAgaGVhZGVyRWwuYXBwZW5kQ2hpbGQodGl0bGVFbCk7XG4gICAgaGVhZGVyRWwuYXBwZW5kQ2hpbGQoY2xvc2VEZXZlbG9wZXJMb2dFbCk7XG5cbiAgICB0aGlzLmVudHJpZXNFbF8gPSB0aGlzLndpbl8uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICB0aGlzLmVudHJpZXNFbF8uY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWRldmVsb3Blci1sb2ctZW50cmllcycpO1xuXG4gICAgdGhpcy5yb290XyA9IHRoaXMud2luXy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLnJvb3RfLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1kZXZlbG9wZXItbG9nJyk7XG4gICAgdG9nZ2xlKHRoaXMucm9vdF8sIGZhbHNlKTtcbiAgICB0aGlzLnJvb3RfLmFwcGVuZENoaWxkKGhlYWRlckVsKTtcbiAgICB0aGlzLnJvb3RfLmFwcGVuZENoaWxkKHRoaXMuZW50cmllc0VsXyk7XG5cbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgcmV0dXJuIHRoaXMucm9vdF87XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshTG9nTGV2ZWx9IGxvZ0xldmVsXG4gICAqIEByZXR1cm4gez9zdHJpbmd9IFRoZSBDU1MgY2xhc3MgdG8gYmUgYXBwbGllZCB0byB0aGUgbG9nIGVudHJ5LCBnaXZlbiB0aGVcbiAgICogICAgIHNwZWNpZmllZCBsb2cgbGV2ZWwsIG9yIG51bGwgaWYgbm8gY2xhc3Mgc2hvdWxkIGJlIGFkZGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0Q3NzTG9nTGV2ZWxDbGFzc18obG9nTGV2ZWwpIHtcbiAgICBzd2l0Y2ggKGxvZ0xldmVsKSB7XG4gICAgICBjYXNlIExvZ0xldmVsLldBUk46XG4gICAgICAgIHJldHVybiAnaS1hbXBodG1sLXN0b3J5LWRldmVsb3Blci1sb2ctZW50cnktd2FybmluZyc7XG4gICAgICBjYXNlIExvZ0xldmVsLkVSUk9SOlxuICAgICAgICByZXR1cm4gJ2ktYW1waHRtbC1zdG9yeS1kZXZlbG9wZXItbG9nLWVudHJ5LWVycm9yJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNvbmZvcm1zIFdoZXRoZXIgdGhlIGxvZyBlbnRyeSBpcyBmb3IgYW4gZWxlbWVudCB0aGF0XG4gICAqICAgICBjb25mb3JtcyB0byBhIGJlc3QgcHJhY3RpY2UuXG4gICAqIEByZXR1cm4gez9zdHJpbmd9IFRoZSBDU1MgY2xhc3MgdG8gYmUgYXBwbGllZCB0byB0aGUgbG9nIGVudHJ5LCBnaXZlbiB0aGVcbiAgICogICAgIGVsZW1lbnQncyBjb25mb3JtYW5jZSB0byBhIGJlc3QgcHJhY3RpY2UsIG9yIG51bGwgaWYgbm8gY2xhc3Mgc2hvdWxkIGJlXG4gICAqICAgICBhZGRlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldENzc0NvbmZvcm1hbmNlQ2xhc3NfKGNvbmZvcm1zKSB7XG4gICAgaWYgKGNvbmZvcm1zKSB7XG4gICAgICByZXR1cm4gJ2ktYW1waHRtbC1zdG9yeS1kZXZlbG9wZXItbG9nLWVudHJ5LXN1Y2Nlc3MnO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vbG9nZ2luZy5BbXBTdG9yeUxvZ0VudHJ5RGVmfSBsb2dFbnRyeSBUaGUgZW50cnkgdG8gYmUgbG9nZ2VkLlxuICAgKi9cbiAgbG9nKGxvZ0VudHJ5KSB7XG4gICAgY29uc3QgbG9nTGV2ZWxDbGFzcyA9IHRoaXMuZ2V0Q3NzTG9nTGV2ZWxDbGFzc18obG9nRW50cnkubGV2ZWwpO1xuICAgIGNvbnN0IGNvbmZvcm1hbmNlQ2xhc3MgPSB0aGlzLmdldENzc0NvbmZvcm1hbmNlQ2xhc3NfKGxvZ0VudHJ5LmNvbmZvcm1zKTtcblxuICAgIGNvbnN0IGxvZ0VudHJ5VWkgPSB0aGlzLndpbl8uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBsb2dFbnRyeVVpLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1kZXZlbG9wZXItbG9nLWVudHJ5Jyk7XG5cbiAgICBpZiAobG9nTGV2ZWxDbGFzcykge1xuICAgICAgbG9nRW50cnlVaS5jbGFzc0xpc3QuYWRkKGxvZ0xldmVsQ2xhc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25mb3JtYW5jZUNsYXNzKSB7XG4gICAgICBsb2dFbnRyeVVpLmNsYXNzTGlzdC5hZGQoY29uZm9ybWFuY2VDbGFzcyk7XG4gICAgfVxuXG4gICAgbG9nRW50cnlVaS50ZXh0Q29udGVudCA9IGxvZ0VudHJ5Lm1lc3NhZ2U7XG4gICAgdGhpcy5lbnRyaWVzRWxfLmFwcGVuZENoaWxkKGxvZ0VudHJ5VWkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyBhbGwgZW50cmllcyBmcm9tIHRoZSBkZXZlbG9wZXIgbG9ncy5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIFNlcnZpY2VzLnZzeW5jRm9yKHRoaXMud2luXykubXV0YXRlKCgpID0+IHtcbiAgICAgIHJlbW92ZUNoaWxkcmVuKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5lbnRyaWVzRWxfKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc3RyaW5nIHByb3ZpZGluZyBjb250ZXh0IGZvciB0aGUgZGV2ZWxvcGVyIGxvZ3Mgd2luZG93LiAgVGhpcyBpc1xuICAgKiBvZnRlbiB0aGUgbmFtZSBvciBJRCBvZiB0aGUgZWxlbWVudCB0aGF0IGFsbCBsb2dzIGFyZSBmb3IgKGUuZy4gdGhlIHBhZ2UpLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dFN0cmluZ1xuICAgKi9cbiAgc2V0Q29udGV4dFN0cmluZyhjb250ZXh0U3RyaW5nKSB7XG4gICAgdGhpcy5jb250ZXh0U3RyaW5nRWxfLnRleHRDb250ZW50ID0gY29udGV4dFN0cmluZztcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBkZXZlbG9wZXIgbG9nLlxuICAgKi9cbiAgdG9nZ2xlKCkge1xuICAgIGNvbnN0IG5ld0hpZGRlblN0YXRlID0gIXRoaXMucm9vdF8uaGFzQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICB0b2dnbGVIaWRkZW5BdHRyaWJ1dGUoXG4gICAgICBTZXJ2aWNlcy52c3luY0Zvcih0aGlzLndpbl8pLFxuICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLnJvb3RfKSxcbiAgICAgIG5ld0hpZGRlblN0YXRlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlcyB0aGUgZGV2ZWxvcGVyIGxvZyBpbiB0aGUgVUkuXG4gICAqL1xuICBoaWRlKCkge1xuICAgIHRvZ2dsZUhpZGRlbkF0dHJpYnV0ZShcbiAgICAgIFNlcnZpY2VzLnZzeW5jRm9yKHRoaXMud2luXyksXG4gICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMucm9vdF8pLFxuICAgICAgLyogaXNIaWRkZW4gKi8gdHJ1ZVxuICAgICk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/development-ui.js