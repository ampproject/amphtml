import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { whenDocumentComplete } from "../core/document-ready";
import { isFiniteNumber } from "../core/types";
import { Services } from "./";
import { loadPromise } from "../event-helper";
import { isAmp4Email } from "../format";
import { devAssert } from "../log";

/** @typedef {string|number|boolean|undefined|null} */
export var ResolverReturnDef;

/** @typedef {function(...string):ResolverReturnDef} */
export var SyncResolverDef;

/** @typedef {function(...string):!Promise<ResolverReturnDef>} */
export var AsyncResolverDef;

/** @typedef {{sync: SyncResolverDef, async: AsyncResolverDef}} */
var ReplacementDef;

/**
 * A list of events that the navTiming needs to wait for.
 * Sort event in order
 * @enum {number}
 */
var WAITFOR_EVENTS = {
  VIEWER_FIRST_VISIBLE: 1,
  DOCUMENT_COMPLETE: 2,
  LOAD: 3,
  LOAD_END: 4
};

/**
 * A list of events on which event they should wait
 * @const {!Object<string, WAITFOR_EVENTS>}
 */
var NAV_TIMING_WAITFOR_EVENTS = {
  // ready on viewer first visible
  'navigationStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'redirectStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'redirectEnd': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'fetchStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'domainLookupStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'domainLookupEnd': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'connectStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'secureConnectionStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'connectEnd': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'requestStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'responseStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'responseEnd': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  // ready on document complte
  'domLoading': WAITFOR_EVENTS.DOCUMENT_COMPLETE,
  'domInteractive': WAITFOR_EVENTS.DOCUMENT_COMPLETE,
  'domContentLoaded': WAITFOR_EVENTS.DOCUMENT_COMPLETE,
  'domComplete': WAITFOR_EVENTS.DOCUMENT_COMPLETE,
  // ready on load
  'loadEventStart': WAITFOR_EVENTS.LOAD,
  // ready on load complete
  'loadEventEnd': WAITFOR_EVENTS.LOAD_END
};

/**
 * Returns navigation timing information based on the start and end events.
 * The data for the timing events is retrieved from performance.timing API.
 * If start and end events are both given, the result is the difference between
 * the two. If only start event is given, the result is the timing value at
 * start event.
 * @param {!Window} win
 * @param {string} startEvent
 * @param {string=} endEvent
 * @return {!Promise<ResolverReturnDef>}
 */
export function getTimingDataAsync(win, startEvent, endEvent) {
  // Fallback to load event if we don't know what to wait for
  var startWaitForEvent = NAV_TIMING_WAITFOR_EVENTS[startEvent] || WAITFOR_EVENTS.LOAD;
  var endWaitForEvent = endEvent ? NAV_TIMING_WAITFOR_EVENTS[endEvent] || WAITFOR_EVENTS.LOAD : startWaitForEvent;
  var waitForEvent = Math.max(startWaitForEvent, endWaitForEvent);
  // set wait for onload to be default
  var readyPromise;

  if (waitForEvent === WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE) {
    readyPromise = _resolvedPromise();
  } else if (waitForEvent === WAITFOR_EVENTS.DOCUMENT_COMPLETE) {
    readyPromise = whenDocumentComplete(win.document);
  } else if (waitForEvent === WAITFOR_EVENTS.LOAD) {
    readyPromise = loadPromise(win);
  } else if (waitForEvent === WAITFOR_EVENTS.LOAD_END) {
    // performance.timing.loadEventEnd returns 0 before the load event handler
    // has terminated, that's when the load event is completed.
    // To wait for the event handler to terminate, wait 1ms and defer to the
    // event loop.
    var timer = Services.timerFor(win);
    readyPromise = loadPromise(win).then(function () {
      return timer.promise(1);
    });
  }

  devAssert(readyPromise, 'waitForEvent not supported ' + waitForEvent);
  return readyPromise.then(function () {
    return getTimingDataSync(win, startEvent, endEvent);
  });
}

/**
 * Returns navigation timing information based on the start and end events.
 * The data for the timing events is retrieved from performance.timing API.
 * If start and end events are both given, the result is the difference between
 * the two. If only start event is given, the result is the timing value at
 * start event. Enforces synchronous evaluation.
 * @param {!Window} win
 * @param {string} startEvent
 * @param {string=} endEvent
 * @return {ResolverReturnDef} undefined if API is not available, empty string
 *    if it is not yet available, or value as string
 */
export function getTimingDataSync(win, startEvent, endEvent) {
  var timingInfo = win['performance'] && win['performance']['timing'];

  if (!timingInfo || timingInfo['navigationStart'] == 0) {
    // Navigation timing API is not supported.
    return;
  }

  var metric = endEvent === undefined ? timingInfo[startEvent] : timingInfo[endEvent] - timingInfo[startEvent];

  if (!isFiniteNumber(metric) || metric < 0) {
    // The metric is not supported.
    return;
  } else {
    return metric;
  }
}

/**
 * Returns navigation information from the current browsing context.
 * @param {!Window} win
 * @param {string} attribute
 * @return {ResolverReturnDef}
 */
export function getNavigationData(win, attribute) {
  var navigationInfo = win['performance'] && win['performance']['navigation'];

  if (!navigationInfo || navigationInfo[attribute] === undefined) {
    // PerformanceNavigation interface is not supported or attribute is not
    // implemented.
    return;
  }

  return navigationInfo[attribute];
}

/**
 * A class to provide variable substitution related features. Extend this class
 * and override initialize() to add more supported variables.
 */
export var VariableSource = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function VariableSource(ampdoc) {
    _classCallCheck(this, VariableSource);

    /** @protected @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const {!Object<string, !ReplacementDef>} */
    this.replacements_ = Object.create(null);

    /** @private {boolean} */
    this.initialized_ = false;
    this.getUrlMacroAllowlist_();
  }

  /**
   * Lazily initialize the default replacements.
   * @private
   */
  _createClass(VariableSource, [{
    key: "initialize_",
    value: function initialize_() {
      this.initialize();
      this.initialized_ = true;
    }
    /**
     * Override this method to set all the variables supported by derived class.
     */

  }, {
    key: "initialize",
    value: function initialize() {// Needs to be implemented by derived classes.
    }
    /**
     * Method exists to assist stubbing in tests.
     * @param {string} name
     * @return {!ReplacementDef}
     */

  }, {
    key: "get",
    value: function get(name) {
      if (!this.initialized_) {
        this.initialize_();
      }

      return this.replacements_[name];
    }
    /**
     * Sets a synchronous value resolver for the variable with the specified name.
     * The value resolver may optionally take an extra parameter.
     * Can be called in conjunction with setAsync to allow for additional
     * asynchronous resolver where expand will use async and expandSync the sync
     * version.
     * @param {string} varName
     * @param {!SyncResolverDef} syncResolver
     * @return {!VariableSource}
     */

  }, {
    key: "set",
    value: function set(varName, syncResolver) {
      devAssert(varName.indexOf('RETURN') == -1);
      this.replacements_[varName] = this.replacements_[varName] || {
        sync: undefined,
        async: undefined
      };
      this.replacements_[varName].sync = syncResolver;
      return this;
    }
    /**
     * Sets an async value resolver for the variable with the specified name.
     * The value resolver may optionally take an extra parameter.
     * Can be called in conjuction with setAsync to allow for additional
     * asynchronous resolver where expand will use async and expandSync the sync
     * version.
     * @param {string} varName
     * @param {!AsyncResolverDef} asyncResolver
     * @return {!VariableSource}
     */

  }, {
    key: "setAsync",
    value: function setAsync(varName, asyncResolver) {
      devAssert(varName.indexOf('RETURN') == -1);
      this.replacements_[varName] = this.replacements_[varName] || {
        sync: undefined,
        async: undefined
      };
      this.replacements_[varName].async = asyncResolver;
      return this;
    }
    /**
     * Helper method to set both sync and async resolvers.
     * @param {string} varName
     * @param {!SyncResolverDef} syncResolver
     * @param {!AsyncResolverDef} asyncResolver
     * @return {!VariableSource}
     */

  }, {
    key: "setBoth",
    value: function setBoth(varName, syncResolver, asyncResolver) {
      return this.set(varName, syncResolver).setAsync(varName, asyncResolver);
    }
    /**
     * Returns a Regular expression that can be used to detect all the variables
     * in a template.
     * @param {!Object<string, *>=} opt_bindings
     * @param {!Object<string, boolean>=} opt_allowlist Optional allowlist of names
     *   that can be substituted.
     * @return {!RegExp}
     */

  }, {
    key: "getExpr",
    value: function getExpr(opt_bindings, opt_allowlist) {
      if (!this.initialized_) {
        this.initialize_();
      }

      var all = _extends({}, this.replacements_, opt_bindings);

      return this.buildExpr_(Object.keys(all), opt_allowlist);
    }
    /**
     * @param {!Array<string>} keys
     * @param {!Object<string, boolean>=} opt_allowlist Optional allowlist of names
     *   that can be substituted.
     * @return {!RegExp}
     * @private
     */

  }, {
    key: "buildExpr_",
    value: function buildExpr_(keys, opt_allowlist) {
      var _this = this;

      // If a allowlist is present, the keys must belong to the allowlist.
      // We filter the keys one last time to ensure no unallowlisted key is
      // allowed.
      if (this.getUrlMacroAllowlist_()) {
        keys = keys.filter(function (key) {
          return _this.getUrlMacroAllowlist_().includes(key);
        });
      }

      // If a allowlist is passed into the call to GlobalVariableSource.expand_
      // then we only resolve values contained in the allowlist.
      if (opt_allowlist) {
        keys = keys.filter(function (key) {
          return opt_allowlist[key];
        });
      }

      if (keys.length === 0) {
        var regexThatMatchesNothing = /_^/g;
        // lgtm [js/regex/unmatchable-caret]
        return regexThatMatchesNothing;
      }

      // The keys must be sorted to ensure that the longest keys are considered
      // first. This avoids a problem where a RANDOM conflicts with RANDOM_ONE.
      keys.sort(function (s1, s2) {
        return s2.length - s1.length;
      });
      // Keys that start with a `$` need to be escaped so that they do not
      // interfere with the regex that is constructed.
      var escaped = keys.map(function (key) {
        if (key[0] === '$') {
          return '\\' + key;
        }

        return key;
      });
      var all = escaped.join('|');
      // Match the given replacement patterns, as well as optionally
      // arguments to the replacement behind it in parentheses.
      // Example string that match
      // FOO_BAR
      // FOO_BAR(arg1)
      // FOO_BAR(arg1,arg2)
      // FOO_BAR(arg1, arg2)
      var regexStr = '\\$?(' + all + ')';
      return new RegExp(regexStr, 'g');
    }
    /**
     * For email documents, all URL macros are disallowed by default.
     * @return {Array<string>|undefined} The allowlist of substitutable AMP variables
     * @private
     */

  }, {
    key: "getUrlMacroAllowlist_",
    value: function getUrlMacroAllowlist_() {
      if (this.variableAllowlist_) {
        return this.variableAllowlist_;
      }

      // Disallow all URL macros for AMP4Email format documents.
      if (this.ampdoc.isSingleDoc()) {
        var doc =
        /** @type {!Document} */
        this.ampdoc.getRootNode();

        if (isAmp4Email(doc)) {
          /**
           * The allowlist of variables allowed for variable substitution.
           * @private {?Array<string>}
           */
          this.variableAllowlist_ = [''];
          return this.variableAllowlist_;
        }
      }
    }
  }]);

  return VariableSource;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhcmlhYmxlLXNvdXJjZS5qcyJdLCJuYW1lcyI6WyJ3aGVuRG9jdW1lbnRDb21wbGV0ZSIsImlzRmluaXRlTnVtYmVyIiwiU2VydmljZXMiLCJsb2FkUHJvbWlzZSIsImlzQW1wNEVtYWlsIiwiZGV2QXNzZXJ0IiwiUmVzb2x2ZXJSZXR1cm5EZWYiLCJTeW5jUmVzb2x2ZXJEZWYiLCJBc3luY1Jlc29sdmVyRGVmIiwiUmVwbGFjZW1lbnREZWYiLCJXQUlURk9SX0VWRU5UUyIsIlZJRVdFUl9GSVJTVF9WSVNJQkxFIiwiRE9DVU1FTlRfQ09NUExFVEUiLCJMT0FEIiwiTE9BRF9FTkQiLCJOQVZfVElNSU5HX1dBSVRGT1JfRVZFTlRTIiwiZ2V0VGltaW5nRGF0YUFzeW5jIiwid2luIiwic3RhcnRFdmVudCIsImVuZEV2ZW50Iiwic3RhcnRXYWl0Rm9yRXZlbnQiLCJlbmRXYWl0Rm9yRXZlbnQiLCJ3YWl0Rm9yRXZlbnQiLCJNYXRoIiwibWF4IiwicmVhZHlQcm9taXNlIiwiZG9jdW1lbnQiLCJ0aW1lciIsInRpbWVyRm9yIiwidGhlbiIsInByb21pc2UiLCJnZXRUaW1pbmdEYXRhU3luYyIsInRpbWluZ0luZm8iLCJtZXRyaWMiLCJ1bmRlZmluZWQiLCJnZXROYXZpZ2F0aW9uRGF0YSIsImF0dHJpYnV0ZSIsIm5hdmlnYXRpb25JbmZvIiwiVmFyaWFibGVTb3VyY2UiLCJhbXBkb2MiLCJyZXBsYWNlbWVudHNfIiwiT2JqZWN0IiwiY3JlYXRlIiwiaW5pdGlhbGl6ZWRfIiwiZ2V0VXJsTWFjcm9BbGxvd2xpc3RfIiwiaW5pdGlhbGl6ZSIsIm5hbWUiLCJpbml0aWFsaXplXyIsInZhck5hbWUiLCJzeW5jUmVzb2x2ZXIiLCJpbmRleE9mIiwic3luYyIsImFzeW5jIiwiYXN5bmNSZXNvbHZlciIsInNldCIsInNldEFzeW5jIiwib3B0X2JpbmRpbmdzIiwib3B0X2FsbG93bGlzdCIsImFsbCIsImJ1aWxkRXhwcl8iLCJrZXlzIiwiZmlsdGVyIiwia2V5IiwiaW5jbHVkZXMiLCJsZW5ndGgiLCJyZWdleFRoYXRNYXRjaGVzTm90aGluZyIsInNvcnQiLCJzMSIsInMyIiwiZXNjYXBlZCIsIm1hcCIsImpvaW4iLCJyZWdleFN0ciIsIlJlZ0V4cCIsInZhcmlhYmxlQWxsb3dsaXN0XyIsImlzU2luZ2xlRG9jIiwiZG9jIiwiZ2V0Um9vdE5vZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFRQSxvQkFBUjtBQUNBLFNBQVFDLGNBQVI7QUFFQSxTQUFRQyxRQUFSO0FBRUEsU0FBUUMsV0FBUjtBQUNBLFNBQVFDLFdBQVI7QUFDQSxTQUFRQyxTQUFSOztBQUVBO0FBQ0EsT0FBTyxJQUFJQyxpQkFBSjs7QUFFUDtBQUNBLE9BQU8sSUFBSUMsZUFBSjs7QUFFUDtBQUNBLE9BQU8sSUFBSUMsZ0JBQUo7O0FBRVA7QUFDQSxJQUFJQyxjQUFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxjQUFjLEdBQUc7QUFDckJDLEVBQUFBLG9CQUFvQixFQUFFLENBREQ7QUFFckJDLEVBQUFBLGlCQUFpQixFQUFFLENBRkU7QUFHckJDLEVBQUFBLElBQUksRUFBRSxDQUhlO0FBSXJCQyxFQUFBQSxRQUFRLEVBQUU7QUFKVyxDQUF2Qjs7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLHlCQUF5QixHQUFHO0FBQ2hDO0FBQ0EscUJBQW1CTCxjQUFjLENBQUNDLG9CQUZGO0FBR2hDLG1CQUFpQkQsY0FBYyxDQUFDQyxvQkFIQTtBQUloQyxpQkFBZUQsY0FBYyxDQUFDQyxvQkFKRTtBQUtoQyxnQkFBY0QsY0FBYyxDQUFDQyxvQkFMRztBQU1oQyx1QkFBcUJELGNBQWMsQ0FBQ0Msb0JBTko7QUFPaEMscUJBQW1CRCxjQUFjLENBQUNDLG9CQVBGO0FBUWhDLGtCQUFnQkQsY0FBYyxDQUFDQyxvQkFSQztBQVNoQywyQkFB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Q0FBZixFQUFzQjtBQUNwQjtBQUNSO0FBQ0E7QUFDQTtBQUNRLGVBQUtGLGtCQUFMLEdBQTBCLENBQUMsRUFBRCxDQUExQjtBQUNBLGlCQUFPLEtBQUtBLGtCQUFaO0FBQ0Q7QUFDRjtBQUNGO0FBdExIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCB7d2hlbkRvY3VtZW50Q29tcGxldGV9IGZyb20gJyNjb3JlL2RvY3VtZW50LXJlYWR5JztcbmltcG9ydCB7aXNGaW5pdGVOdW1iZXJ9IGZyb20gJyNjb3JlL3R5cGVzJztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge2xvYWRQcm9taXNlfSBmcm9tICcuLi9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHtpc0FtcDRFbWFpbH0gZnJvbSAnLi4vZm9ybWF0JztcbmltcG9ydCB7ZGV2QXNzZXJ0fSBmcm9tICcuLi9sb2cnO1xuXG4vKiogQHR5cGVkZWYge3N0cmluZ3xudW1iZXJ8Ym9vbGVhbnx1bmRlZmluZWR8bnVsbH0gKi9cbmV4cG9ydCBsZXQgUmVzb2x2ZXJSZXR1cm5EZWY7XG5cbi8qKiBAdHlwZWRlZiB7ZnVuY3Rpb24oLi4uc3RyaW5nKTpSZXNvbHZlclJldHVybkRlZn0gKi9cbmV4cG9ydCBsZXQgU3luY1Jlc29sdmVyRGVmO1xuXG4vKiogQHR5cGVkZWYge2Z1bmN0aW9uKC4uLnN0cmluZyk6IVByb21pc2U8UmVzb2x2ZXJSZXR1cm5EZWY+fSAqL1xuZXhwb3J0IGxldCBBc3luY1Jlc29sdmVyRGVmO1xuXG4vKiogQHR5cGVkZWYge3tzeW5jOiBTeW5jUmVzb2x2ZXJEZWYsIGFzeW5jOiBBc3luY1Jlc29sdmVyRGVmfX0gKi9cbmxldCBSZXBsYWNlbWVudERlZjtcblxuLyoqXG4gKiBBIGxpc3Qgb2YgZXZlbnRzIHRoYXQgdGhlIG5hdlRpbWluZyBuZWVkcyB0byB3YWl0IGZvci5cbiAqIFNvcnQgZXZlbnQgaW4gb3JkZXJcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmNvbnN0IFdBSVRGT1JfRVZFTlRTID0ge1xuICBWSUVXRVJfRklSU1RfVklTSUJMRTogMSxcbiAgRE9DVU1FTlRfQ09NUExFVEU6IDIsXG4gIExPQUQ6IDMsXG4gIExPQURfRU5EOiA0LFxufTtcblxuLyoqXG4gKiBBIGxpc3Qgb2YgZXZlbnRzIG9uIHdoaWNoIGV2ZW50IHRoZXkgc2hvdWxkIHdhaXRcbiAqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsIFdBSVRGT1JfRVZFTlRTPn1cbiAqL1xuY29uc3QgTkFWX1RJTUlOR19XQUlURk9SX0VWRU5UUyA9IHtcbiAgLy8gcmVhZHkgb24gdmlld2VyIGZpcnN0IHZpc2libGVcbiAgJ25hdmlnYXRpb25TdGFydCc6IFdBSVRGT1JfRVZFTlRTLlZJRVdFUl9GSVJTVF9WSVNJQkxFLFxuICAncmVkaXJlY3RTdGFydCc6IFdBSVRGT1JfRVZFTlRTLlZJRVdFUl9GSVJTVF9WSVNJQkxFLFxuICAncmVkaXJlY3RFbmQnOiBXQUlURk9SX0VWRU5UUy5WSUVXRVJfRklSU1RfVklTSUJMRSxcbiAgJ2ZldGNoU3RhcnQnOiBXQUlURk9SX0VWRU5UUy5WSUVXRVJfRklSU1RfVklTSUJMRSxcbiAgJ2RvbWFpbkxvb2t1cFN0YXJ0JzogV0FJVEZPUl9FVkVOVFMuVklFV0VSX0ZJUlNUX1ZJU0lCTEUsXG4gICdkb21haW5Mb29rdXBFbmQnOiBXQUlURk9SX0VWRU5UUy5WSUVXRVJfRklSU1RfVklTSUJMRSxcbiAgJ2Nvbm5lY3RTdGFydCc6IFdBSVRGT1JfRVZFTlRTLlZJRVdFUl9GSVJTVF9WSVNJQkxFLFxuICAnc2VjdXJlQ29ubmVjdGlvblN0YXJ0JzogV0FJVEZPUl9FVkVOVFMuVklFV0VSX0ZJUlNUX1ZJU0lCTEUsXG4gICdjb25uZWN0RW5kJzogV0FJVEZPUl9FVkVOVFMuVklFV0VSX0ZJUlNUX1ZJU0lCTEUsXG4gICdyZXF1ZXN0U3RhcnQnOiBXQUlURk9SX0VWRU5UUy5WSUVXRVJfRklSU1RfVklTSUJMRSxcbiAgJ3Jlc3BvbnNlU3RhcnQnOiBXQUlURk9SX0VWRU5UUy5WSUVXRVJfRklSU1RfVklTSUJMRSxcbiAgJ3Jlc3BvbnNlRW5kJzogV0FJVEZPUl9FVkVOVFMuVklFV0VSX0ZJUlNUX1ZJU0lCTEUsXG4gIC8vIHJlYWR5IG9uIGRvY3VtZW50IGNvbXBsdGVcbiAgJ2RvbUxvYWRpbmcnOiBXQUlURk9SX0VWRU5UUy5ET0NVTUVOVF9DT01QTEVURSxcbiAgJ2RvbUludGVyYWN0aXZlJzogV0FJVEZPUl9FVkVOVFMuRE9DVU1FTlRfQ09NUExFVEUsXG4gICdkb21Db250ZW50TG9hZGVkJzogV0FJVEZPUl9FVkVOVFMuRE9DVU1FTlRfQ09NUExFVEUsXG4gICdkb21Db21wbGV0ZSc6IFdBSVRGT1JfRVZFTlRTLkRPQ1VNRU5UX0NPTVBMRVRFLFxuICAvLyByZWFkeSBvbiBsb2FkXG4gICdsb2FkRXZlbnRTdGFydCc6IFdBSVRGT1JfRVZFTlRTLkxPQUQsXG4gIC8vIHJlYWR5IG9uIGxvYWQgY29tcGxldGVcbiAgJ2xvYWRFdmVudEVuZCc6IFdBSVRGT1JfRVZFTlRTLkxPQURfRU5ELFxufTtcblxuLyoqXG4gKiBSZXR1cm5zIG5hdmlnYXRpb24gdGltaW5nIGluZm9ybWF0aW9uIGJhc2VkIG9uIHRoZSBzdGFydCBhbmQgZW5kIGV2ZW50cy5cbiAqIFRoZSBkYXRhIGZvciB0aGUgdGltaW5nIGV2ZW50cyBpcyByZXRyaWV2ZWQgZnJvbSBwZXJmb3JtYW5jZS50aW1pbmcgQVBJLlxuICogSWYgc3RhcnQgYW5kIGVuZCBldmVudHMgYXJlIGJvdGggZ2l2ZW4sIHRoZSByZXN1bHQgaXMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlblxuICogdGhlIHR3by4gSWYgb25seSBzdGFydCBldmVudCBpcyBnaXZlbiwgdGhlIHJlc3VsdCBpcyB0aGUgdGltaW5nIHZhbHVlIGF0XG4gKiBzdGFydCBldmVudC5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhcnRFdmVudFxuICogQHBhcmFtIHtzdHJpbmc9fSBlbmRFdmVudFxuICogQHJldHVybiB7IVByb21pc2U8UmVzb2x2ZXJSZXR1cm5EZWY+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGltaW5nRGF0YUFzeW5jKHdpbiwgc3RhcnRFdmVudCwgZW5kRXZlbnQpIHtcbiAgLy8gRmFsbGJhY2sgdG8gbG9hZCBldmVudCBpZiB3ZSBkb24ndCBrbm93IHdoYXQgdG8gd2FpdCBmb3JcbiAgY29uc3Qgc3RhcnRXYWl0Rm9yRXZlbnQgPVxuICAgIE5BVl9USU1JTkdfV0FJVEZPUl9FVkVOVFNbc3RhcnRFdmVudF0gfHwgV0FJVEZPUl9FVkVOVFMuTE9BRDtcbiAgY29uc3QgZW5kV2FpdEZvckV2ZW50ID0gZW5kRXZlbnRcbiAgICA/IE5BVl9USU1JTkdfV0FJVEZPUl9FVkVOVFNbZW5kRXZlbnRdIHx8IFdBSVRGT1JfRVZFTlRTLkxPQURcbiAgICA6IHN0YXJ0V2FpdEZvckV2ZW50O1xuXG4gIGNvbnN0IHdhaXRGb3JFdmVudCA9IE1hdGgubWF4KHN0YXJ0V2FpdEZvckV2ZW50LCBlbmRXYWl0Rm9yRXZlbnQpO1xuXG4gIC8vIHNldCB3YWl0IGZvciBvbmxvYWQgdG8gYmUgZGVmYXVsdFxuICBsZXQgcmVhZHlQcm9taXNlO1xuICBpZiAod2FpdEZvckV2ZW50ID09PSBXQUlURk9SX0VWRU5UUy5WSUVXRVJfRklSU1RfVklTSUJMRSkge1xuICAgIHJlYWR5UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICB9IGVsc2UgaWYgKHdhaXRGb3JFdmVudCA9PT0gV0FJVEZPUl9FVkVOVFMuRE9DVU1FTlRfQ09NUExFVEUpIHtcbiAgICByZWFkeVByb21pc2UgPSB3aGVuRG9jdW1lbnRDb21wbGV0ZSh3aW4uZG9jdW1lbnQpO1xuICB9IGVsc2UgaWYgKHdhaXRGb3JFdmVudCA9PT0gV0FJVEZPUl9FVkVOVFMuTE9BRCkge1xuICAgIHJlYWR5UHJvbWlzZSA9IGxvYWRQcm9taXNlKHdpbik7XG4gIH0gZWxzZSBpZiAod2FpdEZvckV2ZW50ID09PSBXQUlURk9SX0VWRU5UUy5MT0FEX0VORCkge1xuICAgIC8vIHBlcmZvcm1hbmNlLnRpbWluZy5sb2FkRXZlbnRFbmQgcmV0dXJucyAwIGJlZm9yZSB0aGUgbG9hZCBldmVudCBoYW5kbGVyXG4gICAgLy8gaGFzIHRlcm1pbmF0ZWQsIHRoYXQncyB3aGVuIHRoZSBsb2FkIGV2ZW50IGlzIGNvbXBsZXRlZC5cbiAgICAvLyBUbyB3YWl0IGZvciB0aGUgZXZlbnQgaGFuZGxlciB0byB0ZXJtaW5hdGUsIHdhaXQgMW1zIGFuZCBkZWZlciB0byB0aGVcbiAgICAvLyBldmVudCBsb29wLlxuICAgIGNvbnN0IHRpbWVyID0gU2VydmljZXMudGltZXJGb3Iod2luKTtcbiAgICByZWFkeVByb21pc2UgPSBsb2FkUHJvbWlzZSh3aW4pLnRoZW4oKCkgPT4gdGltZXIucHJvbWlzZSgxKSk7XG4gIH1cblxuICBkZXZBc3NlcnQocmVhZHlQcm9taXNlLCAnd2FpdEZvckV2ZW50IG5vdCBzdXBwb3J0ZWQgJyArIHdhaXRGb3JFdmVudCk7XG5cbiAgcmV0dXJuIHJlYWR5UHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICByZXR1cm4gZ2V0VGltaW5nRGF0YVN5bmMod2luLCBzdGFydEV2ZW50LCBlbmRFdmVudCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgbmF2aWdhdGlvbiB0aW1pbmcgaW5mb3JtYXRpb24gYmFzZWQgb24gdGhlIHN0YXJ0IGFuZCBlbmQgZXZlbnRzLlxuICogVGhlIGRhdGEgZm9yIHRoZSB0aW1pbmcgZXZlbnRzIGlzIHJldHJpZXZlZCBmcm9tIHBlcmZvcm1hbmNlLnRpbWluZyBBUEkuXG4gKiBJZiBzdGFydCBhbmQgZW5kIGV2ZW50cyBhcmUgYm90aCBnaXZlbiwgdGhlIHJlc3VsdCBpcyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuXG4gKiB0aGUgdHdvLiBJZiBvbmx5IHN0YXJ0IGV2ZW50IGlzIGdpdmVuLCB0aGUgcmVzdWx0IGlzIHRoZSB0aW1pbmcgdmFsdWUgYXRcbiAqIHN0YXJ0IGV2ZW50LiBFbmZvcmNlcyBzeW5jaHJvbm91cyBldmFsdWF0aW9uLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGFydEV2ZW50XG4gKiBAcGFyYW0ge3N0cmluZz19IGVuZEV2ZW50XG4gKiBAcmV0dXJuIHtSZXNvbHZlclJldHVybkRlZn0gdW5kZWZpbmVkIGlmIEFQSSBpcyBub3QgYXZhaWxhYmxlLCBlbXB0eSBzdHJpbmdcbiAqICAgIGlmIGl0IGlzIG5vdCB5ZXQgYXZhaWxhYmxlLCBvciB2YWx1ZSBhcyBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRpbWluZ0RhdGFTeW5jKHdpbiwgc3RhcnRFdmVudCwgZW5kRXZlbnQpIHtcbiAgY29uc3QgdGltaW5nSW5mbyA9IHdpblsncGVyZm9ybWFuY2UnXSAmJiB3aW5bJ3BlcmZvcm1hbmNlJ11bJ3RpbWluZyddO1xuICBpZiAoIXRpbWluZ0luZm8gfHwgdGltaW5nSW5mb1snbmF2aWdhdGlvblN0YXJ0J10gPT0gMCkge1xuICAgIC8vIE5hdmlnYXRpb24gdGltaW5nIEFQSSBpcyBub3Qgc3VwcG9ydGVkLlxuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG1ldHJpYyA9XG4gICAgZW5kRXZlbnQgPT09IHVuZGVmaW5lZFxuICAgICAgPyB0aW1pbmdJbmZvW3N0YXJ0RXZlbnRdXG4gICAgICA6IHRpbWluZ0luZm9bZW5kRXZlbnRdIC0gdGltaW5nSW5mb1tzdGFydEV2ZW50XTtcblxuICBpZiAoIWlzRmluaXRlTnVtYmVyKG1ldHJpYykgfHwgbWV0cmljIDwgMCkge1xuICAgIC8vIFRoZSBtZXRyaWMgaXMgbm90IHN1cHBvcnRlZC5cbiAgICByZXR1cm47XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG1ldHJpYztcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgbmF2aWdhdGlvbiBpbmZvcm1hdGlvbiBmcm9tIHRoZSBjdXJyZW50IGJyb3dzaW5nIGNvbnRleHQuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtzdHJpbmd9IGF0dHJpYnV0ZVxuICogQHJldHVybiB7UmVzb2x2ZXJSZXR1cm5EZWZ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROYXZpZ2F0aW9uRGF0YSh3aW4sIGF0dHJpYnV0ZSkge1xuICBjb25zdCBuYXZpZ2F0aW9uSW5mbyA9IHdpblsncGVyZm9ybWFuY2UnXSAmJiB3aW5bJ3BlcmZvcm1hbmNlJ11bJ25hdmlnYXRpb24nXTtcbiAgaWYgKCFuYXZpZ2F0aW9uSW5mbyB8fCBuYXZpZ2F0aW9uSW5mb1thdHRyaWJ1dGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBQZXJmb3JtYW5jZU5hdmlnYXRpb24gaW50ZXJmYWNlIGlzIG5vdCBzdXBwb3J0ZWQgb3IgYXR0cmlidXRlIGlzIG5vdFxuICAgIC8vIGltcGxlbWVudGVkLlxuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gbmF2aWdhdGlvbkluZm9bYXR0cmlidXRlXTtcbn1cblxuLyoqXG4gKiBBIGNsYXNzIHRvIHByb3ZpZGUgdmFyaWFibGUgc3Vic3RpdHV0aW9uIHJlbGF0ZWQgZmVhdHVyZXMuIEV4dGVuZCB0aGlzIGNsYXNzXG4gKiBhbmQgb3ZlcnJpZGUgaW5pdGlhbGl6ZSgpIHRvIGFkZCBtb3JlIHN1cHBvcnRlZCB2YXJpYWJsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWYXJpYWJsZVNvdXJjZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQHByb3RlY3RlZCBAY29uc3QgeyEuL2FtcGRvYy1pbXBsLkFtcERvY30gKi9cbiAgICB0aGlzLmFtcGRvYyA9IGFtcGRvYztcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCAhUmVwbGFjZW1lbnREZWY+fSAqL1xuICAgIHRoaXMucmVwbGFjZW1lbnRzXyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pbml0aWFsaXplZF8gPSBmYWxzZTtcblxuICAgIHRoaXMuZ2V0VXJsTWFjcm9BbGxvd2xpc3RfKCk7XG4gIH1cblxuICAvKipcbiAgICogTGF6aWx5IGluaXRpYWxpemUgdGhlIGRlZmF1bHQgcmVwbGFjZW1lbnRzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZV8oKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgdGhpcy5pbml0aWFsaXplZF8gPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIHNldCBhbGwgdGhlIHZhcmlhYmxlcyBzdXBwb3J0ZWQgYnkgZGVyaXZlZCBjbGFzcy5cbiAgICovXG4gIGluaXRpYWxpemUoKSB7XG4gICAgLy8gTmVlZHMgdG8gYmUgaW1wbGVtZW50ZWQgYnkgZGVyaXZlZCBjbGFzc2VzLlxuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCBleGlzdHMgdG8gYXNzaXN0IHN0dWJiaW5nIGluIHRlc3RzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHshUmVwbGFjZW1lbnREZWZ9XG4gICAqL1xuICBnZXQobmFtZSkge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZF8pIHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZV8oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5yZXBsYWNlbWVudHNfW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBzeW5jaHJvbm91cyB2YWx1ZSByZXNvbHZlciBmb3IgdGhlIHZhcmlhYmxlIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lLlxuICAgKiBUaGUgdmFsdWUgcmVzb2x2ZXIgbWF5IG9wdGlvbmFsbHkgdGFrZSBhbiBleHRyYSBwYXJhbWV0ZXIuXG4gICAqIENhbiBiZSBjYWxsZWQgaW4gY29uanVuY3Rpb24gd2l0aCBzZXRBc3luYyB0byBhbGxvdyBmb3IgYWRkaXRpb25hbFxuICAgKiBhc3luY2hyb25vdXMgcmVzb2x2ZXIgd2hlcmUgZXhwYW5kIHdpbGwgdXNlIGFzeW5jIGFuZCBleHBhbmRTeW5jIHRoZSBzeW5jXG4gICAqIHZlcnNpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YXJOYW1lXG4gICAqIEBwYXJhbSB7IVN5bmNSZXNvbHZlckRlZn0gc3luY1Jlc29sdmVyXG4gICAqIEByZXR1cm4geyFWYXJpYWJsZVNvdXJjZX1cbiAgICovXG4gIHNldCh2YXJOYW1lLCBzeW5jUmVzb2x2ZXIpIHtcbiAgICBkZXZBc3NlcnQodmFyTmFtZS5pbmRleE9mKCdSRVRVUk4nKSA9PSAtMSk7XG4gICAgdGhpcy5yZXBsYWNlbWVudHNfW3Zhck5hbWVdID0gdGhpcy5yZXBsYWNlbWVudHNfW3Zhck5hbWVdIHx8IHtcbiAgICAgIHN5bmM6IHVuZGVmaW5lZCxcbiAgICAgIGFzeW5jOiB1bmRlZmluZWQsXG4gICAgfTtcbiAgICB0aGlzLnJlcGxhY2VtZW50c19bdmFyTmFtZV0uc3luYyA9IHN5bmNSZXNvbHZlcjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGFzeW5jIHZhbHVlIHJlc29sdmVyIGZvciB0aGUgdmFyaWFibGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUuXG4gICAqIFRoZSB2YWx1ZSByZXNvbHZlciBtYXkgb3B0aW9uYWxseSB0YWtlIGFuIGV4dHJhIHBhcmFtZXRlci5cbiAgICogQ2FuIGJlIGNhbGxlZCBpbiBjb25qdWN0aW9uIHdpdGggc2V0QXN5bmMgdG8gYWxsb3cgZm9yIGFkZGl0aW9uYWxcbiAgICogYXN5bmNocm9ub3VzIHJlc29sdmVyIHdoZXJlIGV4cGFuZCB3aWxsIHVzZSBhc3luYyBhbmQgZXhwYW5kU3luYyB0aGUgc3luY1xuICAgKiB2ZXJzaW9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFyTmFtZVxuICAgKiBAcGFyYW0geyFBc3luY1Jlc29sdmVyRGVmfSBhc3luY1Jlc29sdmVyXG4gICAqIEByZXR1cm4geyFWYXJpYWJsZVNvdXJjZX1cbiAgICovXG4gIHNldEFzeW5jKHZhck5hbWUsIGFzeW5jUmVzb2x2ZXIpIHtcbiAgICBkZXZBc3NlcnQodmFyTmFtZS5pbmRleE9mKCdSRVRVUk4nKSA9PSAtMSk7XG4gICAgdGhpcy5yZXBsYWNlbWVudHNfW3Zhck5hbWVdID0gdGhpcy5yZXBsYWNlbWVudHNfW3Zhck5hbWVdIHx8IHtcbiAgICAgIHN5bmM6IHVuZGVmaW5lZCxcbiAgICAgIGFzeW5jOiB1bmRlZmluZWQsXG4gICAgfTtcbiAgICB0aGlzLnJlcGxhY2VtZW50c19bdmFyTmFtZV0uYXN5bmMgPSBhc3luY1Jlc29sdmVyO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gc2V0IGJvdGggc3luYyBhbmQgYXN5bmMgcmVzb2x2ZXJzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFyTmFtZVxuICAgKiBAcGFyYW0geyFTeW5jUmVzb2x2ZXJEZWZ9IHN5bmNSZXNvbHZlclxuICAgKiBAcGFyYW0geyFBc3luY1Jlc29sdmVyRGVmfSBhc3luY1Jlc29sdmVyXG4gICAqIEByZXR1cm4geyFWYXJpYWJsZVNvdXJjZX1cbiAgICovXG4gIHNldEJvdGgodmFyTmFtZSwgc3luY1Jlc29sdmVyLCBhc3luY1Jlc29sdmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KHZhck5hbWUsIHN5bmNSZXNvbHZlcikuc2V0QXN5bmModmFyTmFtZSwgYXN5bmNSZXNvbHZlcik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGRldGVjdCBhbGwgdGhlIHZhcmlhYmxlc1xuICAgKiBpbiBhIHRlbXBsYXRlLlxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAqPj19IG9wdF9iaW5kaW5nc1xuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBib29sZWFuPj19IG9wdF9hbGxvd2xpc3QgT3B0aW9uYWwgYWxsb3dsaXN0IG9mIG5hbWVzXG4gICAqICAgdGhhdCBjYW4gYmUgc3Vic3RpdHV0ZWQuXG4gICAqIEByZXR1cm4geyFSZWdFeHB9XG4gICAqL1xuICBnZXRFeHByKG9wdF9iaW5kaW5ncywgb3B0X2FsbG93bGlzdCkge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZF8pIHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZV8oKTtcbiAgICB9XG4gICAgY29uc3QgYWxsID0gey4uLnRoaXMucmVwbGFjZW1lbnRzXywgLi4ub3B0X2JpbmRpbmdzfTtcbiAgICByZXR1cm4gdGhpcy5idWlsZEV4cHJfKE9iamVjdC5rZXlzKGFsbCksIG9wdF9hbGxvd2xpc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFycmF5PHN0cmluZz59IGtleXNcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj49fSBvcHRfYWxsb3dsaXN0IE9wdGlvbmFsIGFsbG93bGlzdCBvZiBuYW1lc1xuICAgKiAgIHRoYXQgY2FuIGJlIHN1YnN0aXR1dGVkLlxuICAgKiBAcmV0dXJuIHshUmVnRXhwfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYnVpbGRFeHByXyhrZXlzLCBvcHRfYWxsb3dsaXN0KSB7XG4gICAgLy8gSWYgYSBhbGxvd2xpc3QgaXMgcHJlc2VudCwgdGhlIGtleXMgbXVzdCBiZWxvbmcgdG8gdGhlIGFsbG93bGlzdC5cbiAgICAvLyBXZSBmaWx0ZXIgdGhlIGtleXMgb25lIGxhc3QgdGltZSB0byBlbnN1cmUgbm8gdW5hbGxvd2xpc3RlZCBrZXkgaXNcbiAgICAvLyBhbGxvd2VkLlxuICAgIGlmICh0aGlzLmdldFVybE1hY3JvQWxsb3dsaXN0XygpKSB7XG4gICAgICBrZXlzID0ga2V5cy5maWx0ZXIoKGtleSkgPT4gdGhpcy5nZXRVcmxNYWNyb0FsbG93bGlzdF8oKS5pbmNsdWRlcyhrZXkpKTtcbiAgICB9XG4gICAgLy8gSWYgYSBhbGxvd2xpc3QgaXMgcGFzc2VkIGludG8gdGhlIGNhbGwgdG8gR2xvYmFsVmFyaWFibGVTb3VyY2UuZXhwYW5kX1xuICAgIC8vIHRoZW4gd2Ugb25seSByZXNvbHZlIHZhbHVlcyBjb250YWluZWQgaW4gdGhlIGFsbG93bGlzdC5cbiAgICBpZiAob3B0X2FsbG93bGlzdCkge1xuICAgICAga2V5cyA9IGtleXMuZmlsdGVyKChrZXkpID0+IG9wdF9hbGxvd2xpc3Rba2V5XSk7XG4gICAgfVxuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgcmVnZXhUaGF0TWF0Y2hlc05vdGhpbmcgPSAvX14vZzsgLy8gbGd0bSBbanMvcmVnZXgvdW5tYXRjaGFibGUtY2FyZXRdXG4gICAgICByZXR1cm4gcmVnZXhUaGF0TWF0Y2hlc05vdGhpbmc7XG4gICAgfVxuICAgIC8vIFRoZSBrZXlzIG11c3QgYmUgc29ydGVkIHRvIGVuc3VyZSB0aGF0IHRoZSBsb25nZXN0IGtleXMgYXJlIGNvbnNpZGVyZWRcbiAgICAvLyBmaXJzdC4gVGhpcyBhdm9pZHMgYSBwcm9ibGVtIHdoZXJlIGEgUkFORE9NIGNvbmZsaWN0cyB3aXRoIFJBTkRPTV9PTkUuXG4gICAga2V5cy5zb3J0KChzMSwgczIpID0+IHMyLmxlbmd0aCAtIHMxLmxlbmd0aCk7XG4gICAgLy8gS2V5cyB0aGF0IHN0YXJ0IHdpdGggYSBgJGAgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBkbyBub3RcbiAgICAvLyBpbnRlcmZlcmUgd2l0aCB0aGUgcmVnZXggdGhhdCBpcyBjb25zdHJ1Y3RlZC5cbiAgICBjb25zdCBlc2NhcGVkID0ga2V5cy5tYXAoKGtleSkgPT4ge1xuICAgICAgaWYgKGtleVswXSA9PT0gJyQnKSB7XG4gICAgICAgIHJldHVybiAnXFxcXCcgKyBrZXk7XG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH0pO1xuXG4gICAgY29uc3QgYWxsID0gZXNjYXBlZC5qb2luKCd8Jyk7XG4gICAgLy8gTWF0Y2ggdGhlIGdpdmVuIHJlcGxhY2VtZW50IHBhdHRlcm5zLCBhcyB3ZWxsIGFzIG9wdGlvbmFsbHlcbiAgICAvLyBhcmd1bWVudHMgdG8gdGhlIHJlcGxhY2VtZW50IGJlaGluZCBpdCBpbiBwYXJlbnRoZXNlcy5cbiAgICAvLyBFeGFtcGxlIHN0cmluZyB0aGF0IG1hdGNoXG4gICAgLy8gRk9PX0JBUlxuICAgIC8vIEZPT19CQVIoYXJnMSlcbiAgICAvLyBGT09fQkFSKGFyZzEsYXJnMilcbiAgICAvLyBGT09fQkFSKGFyZzEsIGFyZzIpXG4gICAgY29uc3QgcmVnZXhTdHIgPSAnXFxcXCQ/KCcgKyBhbGwgKyAnKSc7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXhTdHIsICdnJyk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGVtYWlsIGRvY3VtZW50cywgYWxsIFVSTCBtYWNyb3MgYXJlIGRpc2FsbG93ZWQgYnkgZGVmYXVsdC5cbiAgICogQHJldHVybiB7QXJyYXk8c3RyaW5nPnx1bmRlZmluZWR9IFRoZSBhbGxvd2xpc3Qgb2Ygc3Vic3RpdHV0YWJsZSBBTVAgdmFyaWFibGVzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRVcmxNYWNyb0FsbG93bGlzdF8oKSB7XG4gICAgaWYgKHRoaXMudmFyaWFibGVBbGxvd2xpc3RfKSB7XG4gICAgICByZXR1cm4gdGhpcy52YXJpYWJsZUFsbG93bGlzdF87XG4gICAgfVxuXG4gICAgLy8gRGlzYWxsb3cgYWxsIFVSTCBtYWNyb3MgZm9yIEFNUDRFbWFpbCBmb3JtYXQgZG9jdW1lbnRzLlxuICAgIGlmICh0aGlzLmFtcGRvYy5pc1NpbmdsZURvYygpKSB7XG4gICAgICBjb25zdCBkb2MgPSAvKiogQHR5cGUgeyFEb2N1bWVudH0gKi8gKHRoaXMuYW1wZG9jLmdldFJvb3ROb2RlKCkpO1xuICAgICAgaWYgKGlzQW1wNEVtYWlsKGRvYykpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBhbGxvd2xpc3Qgb2YgdmFyaWFibGVzIGFsbG93ZWQgZm9yIHZhcmlhYmxlIHN1YnN0aXR1dGlvbi5cbiAgICAgICAgICogQHByaXZhdGUgez9BcnJheTxzdHJpbmc+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy52YXJpYWJsZUFsbG93bGlzdF8gPSBbJyddO1xuICAgICAgICByZXR1cm4gdGhpcy52YXJpYWJsZUFsbG93bGlzdF87XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/variable-source.js