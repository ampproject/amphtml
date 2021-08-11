import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  LOAD_END: 4 };


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
  'loadEventEnd': WAITFOR_EVENTS.LOAD_END };


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
  var startWaitForEvent =
  NAV_TIMING_WAITFOR_EVENTS[startEvent] || WAITFOR_EVENTS.LOAD;
  var endWaitForEvent = endEvent ?
  NAV_TIMING_WAITFOR_EVENTS[endEvent] || WAITFOR_EVENTS.LOAD :
  startWaitForEvent;

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
    readyPromise = loadPromise(win).then(function () {return timer.promise(1);});
  }

  devAssert(readyPromise);

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

  var metric =
  endEvent === undefined ?
  timingInfo[startEvent] :
  timingInfo[endEvent] - timingInfo[startEvent];

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
  function VariableSource(ampdoc) {_classCallCheck(this, VariableSource);
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
   */_createClass(VariableSource, [{ key: "initialize_", value:
    function initialize_() {
      this.initialize();
      this.initialized_ = true;
    }

    /**
     * Override this method to set all the variables supported by derived class.
     */ }, { key: "initialize", value:
    function initialize() {
      // Needs to be implemented by derived classes.
    }

    /**
     * Method exists to assist stubbing in tests.
     * @param {string} name
     * @return {!ReplacementDef}
     */ }, { key: "get", value:
    function get(name) {
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
     */ }, { key: "set", value:
    function set(varName, syncResolver) {
      devAssert(varName.indexOf('RETURN') == -1);
      this.replacements_[varName] = this.replacements_[varName] || {
        sync: undefined,
        async: undefined };

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
     */ }, { key: "setAsync", value:
    function setAsync(varName, asyncResolver) {
      devAssert(varName.indexOf('RETURN') == -1);
      this.replacements_[varName] = this.replacements_[varName] || {
        sync: undefined,
        async: undefined };

      this.replacements_[varName].async = asyncResolver;
      return this;
    }

    /**
     * Helper method to set both sync and async resolvers.
     * @param {string} varName
     * @param {!SyncResolverDef} syncResolver
     * @param {!AsyncResolverDef} asyncResolver
     * @return {!VariableSource}
     */ }, { key: "setBoth", value:
    function setBoth(varName, syncResolver, asyncResolver) {
      return this.set(varName, syncResolver).setAsync(varName, asyncResolver);
    }

    /**
     * Returns a Regular expression that can be used to detect all the variables
     * in a template.
     * @param {!Object<string, *>=} opt_bindings
     * @param {!Object<string, boolean>=} opt_allowlist Optional allowlist of names
     *   that can be substituted.
     * @return {!RegExp}
     */ }, { key: "getExpr", value:
    function getExpr(opt_bindings, opt_allowlist) {
      if (!this.initialized_) {
        this.initialize_();
      }
      var all = _objectSpread(_objectSpread({}, this.replacements_), opt_bindings);
      return this.buildExpr_(Object.keys(all), opt_allowlist);
    }

    /**
     * @param {!Array<string>} keys
     * @param {!Object<string, boolean>=} opt_allowlist Optional allowlist of names
     *   that can be substituted.
     * @return {!RegExp}
     * @private
     */ }, { key: "buildExpr_", value:
    function buildExpr_(keys, opt_allowlist) {var _this = this;
      // If a allowlist is present, the keys must belong to the allowlist.
      // We filter the keys one last time to ensure no unallowlisted key is
      // allowed.
      if (this.getUrlMacroAllowlist_()) {
        keys = keys.filter(function (key) {return _this.getUrlMacroAllowlist_().includes(key);});
      }
      // If a allowlist is passed into the call to GlobalVariableSource.expand_
      // then we only resolve values contained in the allowlist.
      if (opt_allowlist) {
        keys = keys.filter(function (key) {return opt_allowlist[key];});
      }
      if (keys.length === 0) {
        var regexThatMatchesNothing = /_^/g; // lgtm [js/regex/unmatchable-caret]
        return regexThatMatchesNothing;
      }
      // The keys must be sorted to ensure that the longest keys are considered
      // first. This avoids a problem where a RANDOM conflicts with RANDOM_ONE.
      keys.sort(function (s1, s2) {return s2.length - s1.length;});
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
     */ }, { key: "getUrlMacroAllowlist_", value:
    function getUrlMacroAllowlist_() {
      if (this.variableAllowlist_) {
        return this.variableAllowlist_;
      }

      // Disallow all URL macros for AMP4Email format documents.
      if (this.ampdoc.isSingleDoc()) {
        var doc = /** @type {!Document} */(this.ampdoc.getRootNode());
        if (isAmp4Email(doc)) {
          /**
           * The allowlist of variables allowed for variable substitution.
           * @private {?Array<string>}
           */
          this.variableAllowlist_ = [''];
          return this.variableAllowlist_;
        }
      }
    } }]);return VariableSource;}();
// /Users/mszylkowski/src/amphtml/src/service/variable-source.js