import { resolvedPromise as _resolvedPromise3 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import { Deferred, tryResolve } from "../core/data-structures/promise";
import { dict, map } from "../core/types/object";
import { getHistoryState } from "../core/window/history";

import { Services } from "./";

import { dev, devAssert } from "../log";
import { getMode } from "../mode";
import {
getService,
registerServiceBuilder,
registerServiceBuilderForDoc } from "../service-helpers";


/** @private @const {string} */
var TAG_ = 'History';

/** @private @const {string} */
var HISTORY_PROP_ = 'AMP.History';

/** @typedef {number} */
var HistoryIdDef;

/**
 * @typedef {{stackIndex: HistoryIdDef, title: string, fragment: string, data: (!JsonObject|undefined)}}
 */
var HistoryStateDef;

/**
 * @typedef {{title: (string|undefined), fragment: (string|undefined), url: (string|undefined), canonicalUrl: (string|undefined), data: (!JsonObject|undefined)}}
 */
var HistoryStateUpdateDef;

/**
 * Wraps the browser's History API for viewer support and necessary polyfills.
 */
export var History = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!HistoryBindingInterface} binding
   */
  function History(ampdoc, binding) {_classCallCheck(this, History);
    /** @private @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!../service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const {!HistoryBindingInterface} */
    this.binding_ = binding;

    /** @private {number} */
    this.stackIndex_ = 0;

    /** @private {!Array<!Function|undefined>} */
    this.stackOnPop_ = [];

    /**
     * @private {!Array<!{
     *   callback: function():!Promise,
     *   resolve: !Function,
     *   reject: !Function,
     *   trace: (!Error|undefined)
     * }>} */
    this.queue_ = [];

    this.binding_.setOnStateUpdated(this.onStateUpdated_.bind(this));
  }

  /** @visibleForTesting */_createClass(History, [{ key: "cleanup", value:
    function cleanup() {
      this.binding_.cleanup();
    }

    /**
     * Pushes new state into history stack with an optional callback to be called
     * when this state is popped as well as an object with updates to be applied
     * to the state.
     * @param {!Function=} opt_onPop
     * @param {!HistoryStateUpdateDef=} opt_stateUpdate
     * @return {!Promise<!HistoryIdDef>}
     */ }, { key: "push", value:
    function push(opt_onPop, opt_stateUpdate) {var _this = this;
      return this.enque_(function () {
        return _this.binding_.push(opt_stateUpdate).then(function (historyState) {
          _this.onStateUpdated_(historyState);
          if (opt_onPop) {
            _this.stackOnPop_[historyState.stackIndex] = opt_onPop;
          }
          return historyState.stackIndex;
        });
      }, 'push');
    }

    /**
     * Pops a previously pushed state from the history stack. If onPop callback
     * has been registered, it will be called with the state that was associated
     * with the new head state within the history stack. All states coming
     * after the supplied state will also be popped, and their
     * callbacks executed in the same fashion.
     * @param {!HistoryIdDef} stateId
     * @return {!Promise}
     */ }, { key: "pop", value:
    function pop(stateId) {var _this2 = this;
      return this.enque_(function () {
        return _this2.binding_.pop(stateId).then(function (historyState) {
          _this2.onStateUpdated_(historyState);
        });
      }, 'pop');
    }

    /**
     * Replaces the current state, optionally specifying updates to the state
     * object to be associated with the replacement.
     * @param {!HistoryStateUpdateDef=} opt_stateUpdate
     * @return {!Promise}
     */ }, { key: "replace", value:
    function replace(opt_stateUpdate) {var _this3 = this;
      return this.enque_(function () {return _this3.binding_.replace(opt_stateUpdate);}, 'replace');
    }

    /**
     * Retrieves the current state, containing the current fragment, title,
     * and amp-bind state.
     * @return {!Promise<!HistoryStateDef>}
     */ }, { key: "get", value:
    function get() {var _this4 = this;
      return this.enque_(function () {return _this4.binding_.get();}, 'get');
    }

    /**
     * Requests navigation one step back. This first attempts to go back within
     * the context of this document.
     *
     * @param {boolean=} navigate
     * @return {!Promise}
     */ }, { key: "goBack", value:
    function goBack(navigate) {var _this5 = this;
      return this.enque_(function () {
        if (_this5.stackIndex_ <= 0 && !navigate) {
          return _resolvedPromise();
        }

        // Pop the current state. The binding will ignore the request if
        // it cannot satisfy it.
        return _this5.binding_.pop(_this5.stackIndex_).then(function (historyState) {
          _this5.onStateUpdated_(historyState);
        });
      }, 'goBack');
    }

    /**
     * Helper method to handle navigation to a local target, e.g. When a user
     * clicks an anchor link to a local hash - <a href="#section1">Go to section
     * 1</a>.
     *
     * @param {string} target
     * @return {!Promise}
     */ }, { key: "replaceStateForTarget", value:
    function replaceStateForTarget(target) {var _this6 = this;
      devAssert(target[0] == '#');
      var previousHash = this.ampdoc_.win.location.hash;
      return this.push(function () {
        _this6.ampdoc_.win.location.replace(previousHash || '#');
      }).then(function () {
        _this6.binding_.replaceStateForTarget(target);
      });
    }

    /**
     * Get the fragment from the url or the viewer.
     * Strip leading '#' in the fragment
     * @return {!Promise<string>}
     */ }, { key: "getFragment", value:
    function getFragment() {
      return this.binding_.getFragment();
    }

    /**
     * Update the page url fragment
     * @param {string} fragment
     * @return {!Promise}
     */ }, { key: "updateFragment", value:
    function updateFragment(fragment) {
      if (fragment[0] == '#') {
        fragment = fragment.substr(1);
      }
      return this.binding_.updateFragment(fragment);
    }

    /**
     * @param {!HistoryStateDef} historyState
     * @private
     */ }, { key: "onStateUpdated_", value:
    function onStateUpdated_(historyState) {
      this.stackIndex_ = historyState.stackIndex;
      this.doPop_(historyState);
    }

    /**
     * @param {!HistoryStateDef} historyState
     * @private
     */ }, { key: "doPop_", value:
    function doPop_(historyState) {var _this7 = this;
      if (this.stackIndex_ >= this.stackOnPop_.length - 1) {
        return;
      }

      var toPop = [];
      for (var i = this.stackOnPop_.length - 1; i > this.stackIndex_; i--) {
        if (this.stackOnPop_[i]) {
          toPop.push(this.stackOnPop_[i]);
          this.stackOnPop_[i] = undefined;
        }
      }
      this.stackOnPop_.splice(this.stackIndex_ + 1);

      if (toPop.length > 0) {var _loop = function _loop(
        _i) {
          // With the same delay timeouts must observe the order, although
          // there's no hard requirement in this case to follow the pop order.
          _this7.timer_.delay(function () {return toPop[_i](historyState);}, 1);};for (var _i = 0; _i < toPop.length; _i++) {_loop(_i);
        }
      }
    }

    /**
     * @param {function():!Promise<RESULT>} callback
     * @param {string} name
     * @return {!Promise<RESULT>}
     * @template RESULT
     * @private
     */ }, { key: "enque_", value:
    function enque_(callback, name) {
      var deferred = new Deferred();
      var promise = deferred.promise,reject = deferred.reject,resolve = deferred.resolve;

      // TODO(dvoytenko, #8785): cleanup after tracing.
      var trace = new Error('history trace for ' + name + ': ');
      this.queue_.push({ callback: callback, resolve: resolve, reject: reject, trace: trace });
      if (this.queue_.length == 1) {
        this.deque_();
      }
      return promise;
    }

    /**
     * @private
     */ }, { key: "deque_", value:
    function deque_() {var _this8 = this;
      if (this.queue_.length == 0) {
        return;
      }

      var task = this.queue_[0];
      var promise;
      try {
        promise = task.callback();
      } catch (e) {
        promise = Promise.reject(e);
      }

      promise.
      then(
      function (result) {
        task.resolve(result);
      },
      function (reason) {
        dev().error(TAG_, 'failed to execute a task:', reason);
        // TODO(dvoytenko, #8785): cleanup after tracing.
        if (task.trace) {
          task.trace.message += reason;
          dev().error(TAG_, task.trace);
        }
        task.reject(reason);
      }).

      then(function () {
        _this8.queue_.splice(0, 1);
        _this8.deque_();
      });
    } }]);return History;}();


/**
 * HistoryBindingInterface is an interface that defines an underlying technology
 * behind the {@link History}.
 * @interface
 */var
HistoryBindingInterface = /*#__PURE__*/function () {function HistoryBindingInterface() {_classCallCheck(this, HistoryBindingInterface);}_createClass(HistoryBindingInterface, [{ key: "cleanup", value:
    /** @protected */
    function cleanup() {}

    /**
     * Configures a callback to be called when the state has been updated.
     * @param {function(!HistoryStateDef)} unusedCallback
     * @protected
     */ }, { key: "setOnStateUpdated", value:
    function setOnStateUpdated(unusedCallback) {}

    /**
     * Pushes a new state onto the history stack, optionally specifying the state
     * object associated with the current state.
     * Returns a promise that yields the new state.
     * @param {!HistoryStateUpdateDef=} opt_stateUpdate
     * @return {!Promise<!HistoryStateDef>}
     */ }, { key: "push", value:
    function push(opt_stateUpdate) {}

    /**
     * Pops a previously pushed state from the history stack. All history
     * states coming after this state will also be popped.
     * Returns a promise that yields the new state.
     * @param {number} unusedStackIndex
     * @return {!Promise<!HistoryStateDef>}
     */ }, { key: "pop", value:
    function pop(unusedStackIndex) {}

    /**
     * Replaces the current state, optionally specifying updates to the state
     * object to be associated with the replacement.
     * Returns a promise that yields the new state.
     * @param {!HistoryStateUpdateDef=} opt_stateUpdate
     * @return {!Promise<!HistoryStateDef>}
     */ }, { key: "replace", value:
    function replace(opt_stateUpdate) {}

    /**
     * Retrieves the current state, containing the current fragment, title,
     * and amp-bind state.
     * @return {!Promise<!HistoryStateDef>}
     */ }, { key: "get", value:
    function get() {}

    /**
     * Replaces the state for local target navigation.
     * @param {string} unusedTarget
     */ }, { key: "replaceStateForTarget", value:
    function replaceStateForTarget(unusedTarget) {}

    /**
     * Get the fragment from the url or the viewer.
     * Strip leading '#' in the fragment
     * @return {!Promise<string>}
     */ }, { key: "getFragment", value:
    function getFragment() {}

    /**
     * Update the page url fragment
     * @param {string} unusedFragment
     * @return {!Promise}
     */ }, { key: "updateFragment", value:
    function updateFragment(unusedFragment) {} }]);return HistoryBindingInterface;}();


/**
 * Implementation of HistoryBindingInterface based on the native window. It uses
 * window.history properties and events.
 *
 * Visible for testing.
 *
 * @implements {HistoryBindingInterface}
 */
export var HistoryBindingNatural_ = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function HistoryBindingNatural_(win) {var _this9 = this;_classCallCheck(this, HistoryBindingNatural_);
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!../service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    var history = this.win.history;

    /** @private {number} */
    this.startIndex_ = history.length - 1;
    var state = getHistoryState(history);
    if (state && state[HISTORY_PROP_] !== undefined) {
      this.startIndex_ = Math.min(state[HISTORY_PROP_], this.startIndex_);
    }

    /** @private {number} */
    this.stackIndex_ = this.startIndex_;

    /**
     * @private {{promise: !Promise, resolve: !Function,
     *   reject: !Function}|undefined}
     */
    this.waitingState_;

    /** @private {?function(!HistoryStateDef)} */
    this.onStateUpdated_ = null;

    // A number of browsers do not support history.state. In this cases,
    // History will track its own version. See unsupportedState_.
    /** @private {boolean} @const */
    this.supportsState_ = 'state' in history;

    /** @private {*} */
    this.unsupportedState_ = this.historyState_(this.stackIndex_);

    // There are still browsers who do not support push/replaceState.
    var pushState, replaceState;
    if (history.pushState && history.replaceState) {
      /** @private @const {function(*, string=, string=)|undefined} */
      this.origPushState_ =
      history.originalPushState || history.pushState.bind(history);
      /** @private @const {function(*, string=, string=)|undefined} */
      this.origReplaceState_ =
      history.originalReplaceState || history.replaceState.bind(history);
      pushState = function pushState(state, opt_title, opt_url) {
        _this9.unsupportedState_ = state;
        _this9.origPushState_(
        state,
        opt_title,
        // A bug in edge causes paths to become undefined if URL is
        // undefined, filed here: https://goo.gl/KlImZu
        opt_url || null);

      };
      replaceState = function replaceState(state, opt_title, opt_url) {
        _this9.unsupportedState_ = state;
        // NOTE: check for `undefined` since IE11 and Edge
        // unexpectedly coerces it into a `string`.
        if (opt_url !== undefined) {
          _this9.origReplaceState_(state, opt_title, opt_url);
        } else {
          _this9.origReplaceState_(state, opt_title);
        }
      };
      if (!history.originalPushState) {
        history.originalPushState = this.origPushState_;
      }
      if (!history.originalReplaceState) {
        history.originalReplaceState = this.origReplaceState_;
      }
    } else {
      pushState = function pushState(state, opt_title, opt_url) {
        _this9.unsupportedState_ = state;
      };
      replaceState = function replaceState(state, opt_title, opt_url) {
        _this9.unsupportedState_ = state;
      };
    }

    /** @private @const {!Function} */
    this.pushState_ = pushState;

    /** @private @const {!Function} */
    this.replaceState_ = replaceState;

    try {
      this.replaceState_(
      this.historyState_(this.stackIndex_, /* replace */true));

    } catch (e) {
      dev().error(TAG_, 'Initial replaceState failed: ' + e.message);
    }

    history.pushState = this.historyPushState_.bind(this);
    history.replaceState = this.historyReplaceState_.bind(this);

    this.popstateHandler_ = function (e) {
      var event = /** @type {!PopStateEvent} */(e);
      var state = /** @type {!JsonObject} */(event.state);
      dev().fine(
      TAG_,
      'popstate event: ' +
      _this9.win.history.length +
      ', ' +
      JSON.stringify(state));

      _this9.onHistoryEvent_();
    };
    this.win.addEventListener('popstate', this.popstateHandler_);
  }

  /** @override */_createClass(HistoryBindingNatural_, [{ key: "cleanup", value:
    function cleanup() {
      if (this.origPushState_) {
        this.win.history.pushState = this.origPushState_;
      }
      if (this.origReplaceState_) {
        this.win.history.replaceState = this.origReplaceState_;
      }
      this.win.removeEventListener('popstate', this.popstateHandler_);
    }

    /**
     * @param {number} stackIndex
     * @param {boolean=} opt_replace
     * @return {*}
     * @private
     */ }, { key: "historyState_", value:
    function historyState_(stackIndex, opt_replace) {
      var state = map(opt_replace ? this.getState_() : undefined);
      state[HISTORY_PROP_] = stackIndex;
      return state;
    }

    /** @override */ }, { key: "setOnStateUpdated", value:
    function setOnStateUpdated(callback) {
      this.onStateUpdated_ = callback;
    }

    /** @override */ }, { key: "push", value:
    function push(opt_stateUpdate) {var _this10 = this;
      return this.whenReady_(function () {
        var newState = _this10.mergeStateUpdate_(
        _this10.getState_(),
        opt_stateUpdate || {});

        _this10.historyPushState_(
        newState,
        /* title */undefined,
        newState.fragment ? '#' + newState.fragment : undefined);

        return tryResolve(function () {return (
            _this10.mergeStateUpdate_(newState, { stackIndex: _this10.stackIndex_ }));});

      });
    }

    /** @override */ }, { key: "pop", value:
    function pop(stackIndex) {var _this11 = this;
      // On pop, stack is not allowed to go prior to the starting point.
      stackIndex = Math.max(stackIndex, this.startIndex_);
      return this.whenReady_(function () {
        return _this11.back_(_this11.stackIndex_ - stackIndex + 1);
      }).then(function (newStackIndex) {
        return _this11.mergeStateUpdate_(_this11.getState_(), {
          stackIndex: newStackIndex });

      });
    }

    /** @override */ }, { key: "replace", value:
    function replace() {var _this12 = this;var opt_stateUpdate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return this.whenReady_(function () {
        var newState = _this12.mergeStateUpdate_(
        _this12.getState_(),
        opt_stateUpdate || {});

        var url = (newState.url || '').replace(/#.*/, '');
        var fragment = newState.fragment ? '#' + newState.fragment : '';
        _this12.historyReplaceState_(
        newState,
        newState.title,
        url || fragment ? url + fragment : undefined);

        return tryResolve(function () {return (
            _this12.mergeStateUpdate_(newState, { stackIndex: _this12.stackIndex_ }));});

      });
    }

    /** @override */ }, { key: "get", value:
    function get() {var _this13 = this;
      return tryResolve(function () {return (
          _this13.mergeStateUpdate_(_this13.getState_(), {
            stackIndex: _this13.stackIndex_ }));});


    }

    /**
     * @param {number} stackIndex
     * @return {!Promise}
     */ }, { key: "backTo", value:
    function backTo(stackIndex) {var _this14 = this;
      // On pop, stack is not allowed to go prior to the starting point.
      stackIndex = Math.max(stackIndex, this.startIndex_);
      return this.whenReady_(function () {
        return _this14.back_(_this14.stackIndex_ - stackIndex);
      });
    }

    /** @private */ }, { key: "onHistoryEvent_", value:
    function onHistoryEvent_() {
      var state = this.getState_();
      dev().fine(
      TAG_,
      'history event: ' + this.win.history.length + ', ' + JSON.stringify(state));

      var stackIndex = state ? state[HISTORY_PROP_] : undefined;
      var newStackIndex = this.stackIndex_;
      var waitingState = this.waitingState_;
      this.waitingState_ = undefined;

      if (newStackIndex > this.win.history.length - 2) {
        // Make sure stack has enough space. Whether we are going forward or
        // backward, the stack should have at least one extra cell.
        newStackIndex = this.win.history.length - 2;
        this.updateHistoryState_(
        this.mergeStateUpdate_(state, { stackIndex: newStackIndex }));

      }

      if (stackIndex == undefined) {
        // A new navigation forward by the user.
        newStackIndex = newStackIndex + 1;
      } else if (stackIndex < this.win.history.length) {
        // A simple trip back.
        newStackIndex = stackIndex;
      } else {
        // Generally not possible, but for posterity.
        newStackIndex = this.win.history.length - 1;
      }

      // If state index has been updated as the result replace the state.
      if (!state) {
        state = {};
      }
      state[HISTORY_PROP_] = newStackIndex;
      this.replaceState_(state, undefined, undefined);

      // Update the stack, pop squeezed states.
      if (newStackIndex != this.stackIndex_) {
        this.updateHistoryState_(
        this.mergeStateUpdate_(state, { stackIndex: newStackIndex }));

      }

      // User navigation is allowed to move past the starting point of
      // the history stack.
      if (newStackIndex < this.startIndex_) {
        this.startIndex_ = newStackIndex;
      }

      if (waitingState) {
        waitingState.resolve();
      }
    }

    /** @private */ }, { key: "getState_", value:
    function getState_() {
      if (this.supportsState_) {
        return getHistoryState(this.win.history);
      }
      return this.unsupportedState_;
    }

    /** @private */ }, { key: "assertReady_", value:
    function assertReady_() {
      devAssert(
      !this.waitingState_);


    }

    /**
     * @param {function():!Promise<RESULT>} callback
     * @return {!Promise<RESULT>}
     * @template RESULT
     * @private
     */ }, { key: "whenReady_", value:
    function whenReady_(callback) {
      if (!this.waitingState_) {
        return callback();
      }
      return this.waitingState_.promise.then(callback, callback);
    }

    /**
     * @return {!Promise}
     * @private
     */ }, { key: "wait_", value:
    function wait_() {
      this.assertReady_();
      var deferred = new Deferred();
      var reject = deferred.reject,resolve = deferred.resolve;
      var promise = this.timer_.timeoutPromise(500, deferred.promise);
      this.waitingState_ = { promise: promise, resolve: resolve, reject: reject };
      return promise;
    }

    /**
     * @param {number} steps
     * @return {!Promise}
     */ }, { key: "back_", value:
    function back_(steps) {var _this15 = this;
      this.assertReady_();
      if (steps <= 0) {
        return Promise.resolve(this.stackIndex_);
      }
      this.unsupportedState_ = this.historyState_(this.stackIndex_ - steps);
      var promise = this.wait_();
      this.win.history.go(-steps);
      return promise.then(function () {
        return Promise.resolve(_this15.stackIndex_);
      });
    }

    /**
     * @param {*=} state
     * @param {(string|undefined)=} title
     * @param {(string|undefined)=} url
     * @private
     */ }, { key: "historyPushState_", value:
    function historyPushState_(state, title, url) {
      this.assertReady_();
      if (!state) {
        state = {};
      }
      var stackIndex = this.stackIndex_ + 1;
      state[HISTORY_PROP_] = stackIndex;
      this.pushState_(state, title, url);
      if (stackIndex != this.win.history.length - 1) {
        stackIndex = this.win.history.length - 1;
        state[HISTORY_PROP_] = stackIndex;
        this.replaceState_(state);
      }
      var newState = this.mergeStateUpdate_(
      /** @type {!HistoryStateDef} */(state),
      { stackIndex: stackIndex });

      this.updateHistoryState_(newState);
    }

    /**
     * If this is a hash update the choice of `location.replace` vs
     * `history.replaceState` is important. Due to bugs, not every browser
     * triggers `:target` pseudo-class when `replaceState` is called.
     * See http://www.zachleat.com/web/moving-target/ for more details.
     * location.replace will trigger a `popstate` event, we temporarily
     * disable handling it.
     * @param {string} target
     *
     * @override
     */ }, { key: "replaceStateForTarget", value:
    function replaceStateForTarget(target) {var _this16 = this;
      devAssert(target[0] == '#');
      this.whenReady_(function () {
        // location.replace will fire a popstate event which is not a history
        // event, so temporarily remove the event listener and re-add it after.
        // As explained above in the function comment, typically we'd just do
        // replaceState here but in order to trigger :target re-eval we have to
        // use location.replace.
        _this16.win.removeEventListener('popstate', _this16.popstateHandler_);
        try {
          // TODO(mkhatib, #6095): Chrome iOS will add extra states for
          // location.replace.
          _this16.win.location.replace(target);
        } finally {
          _this16.win.addEventListener('popstate', _this16.popstateHandler_);
        }
        _this16.historyReplaceState_();
        return _resolvedPromise2();
      });
    }

    /**
     * @param {*=} state
     * @param {(string|undefined)=} title
     * @param {(string|undefined)=} url
     * @private
     */ }, { key: "historyReplaceState_", value:
    function historyReplaceState_(state, title, url) {
      this.assertReady_();
      if (!state) {
        state = {};
      }
      var stackIndex = Math.min(this.stackIndex_, this.win.history.length - 1);
      state[HISTORY_PROP_] = stackIndex;
      this.replaceState_(state, title, url);
      var newState = this.mergeStateUpdate_(
      /** @type {!HistoryStateDef} */(state),
      { stackIndex: stackIndex });

      this.updateHistoryState_(newState);
    }

    /**
     * @param {!HistoryStateDef} historyState
     * @private
     */ }, { key: "updateHistoryState_", value:
    function updateHistoryState_(historyState) {
      this.assertReady_();
      historyState.stackIndex = Math.min(
      historyState.stackIndex,
      this.win.history.length - 1);

      if (this.stackIndex_ != historyState.stackIndex) {
        dev().fine(
        TAG_,
        'stack index changed: ' +
        this.stackIndex_ +
        ' -> ' +
        historyState.stackIndex);

        this.stackIndex_ = historyState.stackIndex;
        if (this.onStateUpdated_) {
          this.onStateUpdated_(historyState);
        }
      }
    }

    /** @override */ }, { key: "getFragment", value:
    function getFragment() {
      var hash = this.win.location.hash;
      /* Strip leading '#' */
      hash = hash.substr(1);
      return Promise.resolve(hash);
    }

    /** @override */ }, { key: "updateFragment", value:
    function updateFragment(fragment) {
      return this.replace({ fragment: fragment });
    }

    /**
     * @param {?HistoryStateDef} state
     * @param {!HistoryStateUpdateDef} update
     * @return {!HistoryStateDef}
     */ }, { key: "mergeStateUpdate_", value:
    function mergeStateUpdate_(state, update) {
      var mergedData = /** @type {!JsonObject} */_objectSpread(_objectSpread({}, (
      (state && state.data) || {})), (
      update.data || {}));

      return (/** @type {!HistoryStateDef} */_objectSpread(_objectSpread(_objectSpread({}, (
        state || {})),
        update), {}, {
          data: mergedData }));

    } }]);return HistoryBindingNatural_;}();


/**
 * Implementation of HistoryBindingInterface that assumes a virtual history that
 * relies on viewer's "pushHistory", "popHistory" and "historyPopped"
 * protocol.
 *
 * Visible for testing.
 *
 * @implements {HistoryBindingInterface}
 */
export var HistoryBindingVirtual_ = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!./viewer-interface.ViewerInterface} viewer
   */
  function HistoryBindingVirtual_(win, viewer) {var _this17 = this;_classCallCheck(this, HistoryBindingVirtual_);
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!./viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;

    /** @private {number} */
    this.stackIndex_ = 0;

    /** @private {?function(!HistoryStateDef)} */
    this.onStateUpdated_ = null;

    /** @private {!UnlistenDef} */
    this.unlistenOnHistoryPopped_ = this.viewer_.onMessage(
    'historyPopped',
    function (data) {return _this17.onHistoryPopped_(data);});

  }

  /** @override */_createClass(HistoryBindingVirtual_, [{ key: "replaceStateForTarget", value:
    function replaceStateForTarget(target) {
      devAssert(target[0] == '#');
      this.win.location.replace(target);
    }

    /** @override */ }, { key: "cleanup", value:
    function cleanup() {
      this.unlistenOnHistoryPopped_();
    }

    /** @override */ }, { key: "setOnStateUpdated", value:
    function setOnStateUpdated(callback) {
      this.onStateUpdated_ = callback;
    }

    /**
     * Gets the history state from a response. This checks if `maybeHistoryState`
     * is a history state, and returns it if so, falling back to `fallbackState`
     * otherwise.
     * @param {*} maybeHistoryState
     * @param {!HistoryStateDef} fallbackState
     * @param {string} debugId
     * @return {!HistoryStateDef}
     * @private
     */ }, { key: "toHistoryState_", value:
    function toHistoryState_(maybeHistoryState, fallbackState, debugId) {
      if (this.isHistoryState_(maybeHistoryState)) {
        return (/** @type {!HistoryStateDef} */(maybeHistoryState));
      } else {
        dev().warn(
        TAG_,
        'Ignored unexpected "%s" data:',
        debugId,
        maybeHistoryState);

      }
      return fallbackState;
    }

    /**
     * @param {*} maybeHistoryState
     * @return {boolean}
     */ }, { key: "isHistoryState_", value:
    function isHistoryState_(maybeHistoryState) {
      return !!maybeHistoryState && maybeHistoryState['stackIndex'] !== undefined;
    }

    /**
     * `pushHistory`
     *
     *   Request:  {'stackIndex': string}
     *   Response: undefined | {'stackIndex': string}
     *
     * @override
     */ }, { key: "push", value:
    function push(opt_stateUpdate) {var _this18 = this;
      var message = /** @type {!JsonObject} */_objectSpread({
        'stackIndex': this.stackIndex_ + 1 }, (
      opt_stateUpdate || {}));

      var push = 'pushHistory';
      return this.viewer_.
      sendMessageAwaitResponse(push, message).
      then(function (response) {
        var fallbackState = /** @type {!HistoryStateDef} */(message);
        var newState = _this18.toHistoryState_(response, fallbackState, push);
        _this18.updateHistoryState_(newState);
        return newState;
      });
    }

    /**
     * `popHistory`
     *
     *   Request:  {'stackIndex': string}
     *   Response: undefined | {'stackIndex': string}
     *
     * @override
     */ }, { key: "pop", value:
    function pop(stackIndex) {var _this19 = this;
      if (stackIndex > this.stackIndex_) {
        return this.get();
      }
      var message = dict({ 'stackIndex': this.stackIndex_ });
      var pop = 'popHistory';
      return this.viewer_.
      sendMessageAwaitResponse(pop, message).
      then(function (response) {
        var fallbackState = /** @type {!HistoryStateDef} */(
        dict({
          'stackIndex': _this19.stackIndex_ - 1 }));


        var newState = _this19.toHistoryState_(response, fallbackState, pop);
        _this19.updateHistoryState_(newState);
        return newState;
      });
    }

    /**
     * `replaceHistory`
     *
     *   Request:   {'fragment': string}
     *   Response:  undefined | {'stackIndex': string}
     *
     * @override
     */ }, { key: "replace", value:
    function replace(opt_stateUpdate) {var _this20 = this;
      if (opt_stateUpdate && opt_stateUpdate.url) {
        if (!this.viewer_.hasCapability('fullReplaceHistory')) {
          // Full URL replacement requested, but not supported by the viewer.
          // Don't update, and return the current state.
          var curState = /** @type {!HistoryStateDef} */(
          dict({
            'stackIndex': this.stackIndex_ }));


          return Promise.resolve(curState);
        }

        // replace fragment, only explicit fragment param will be sent.
        var url = opt_stateUpdate.url.replace(/#.*/, '');
        opt_stateUpdate.url = url;
      }

      var message = /** @type {!JsonObject} */_objectSpread({
        'stackIndex': this.stackIndex_ }, (
      opt_stateUpdate || {}));

      var replace = 'replaceHistory';
      return this.viewer_.
      sendMessageAwaitResponse(replace, message, /* cancelUnsent */true).
      then(function (response) {
        var fallbackState = /** @type {!HistoryStateDef} */(message);
        var newState = _this20.toHistoryState_(response, fallbackState, replace);
        _this20.updateHistoryState_(newState);
        return newState;
      });
    }

    /**
     * Note: Only returns the current `stackIndex`.
     * @override
     */ }, { key: "get", value:
    function get() {
      // Not sure why this type coercion is necessary, but CC complains otherwise.
      return Promise.resolve(
      /** @type {!HistoryStateDef} */({
        data: undefined,
        fragment: '',
        stackIndex: this.stackIndex_,
        title: '' }));


    }

    /**
     * `historyPopped` (from viewer)
     *
     *   Request:  {'newStackIndex': number} | {'stackIndex': number}
     *   Response: undefined
     *
     * @param {!JsonObject} data
     * @private
     */ }, { key: "onHistoryPopped_", value:
    function onHistoryPopped_(data) {
      if (data['newStackIndex'] !== undefined) {
        data['stackIndex'] = data['newStackIndex'];
      }
      if (this.isHistoryState_(data)) {
        this.updateHistoryState_( /** @type {!HistoryStateDef} */(data));
      } else {
        dev().warn(TAG_, 'Ignored unexpected "historyPopped" data:', data);
      }
    }

    /**
     * @param {!HistoryStateDef} state
     * @private
     */ }, { key: "updateHistoryState_", value:
    function updateHistoryState_(state) {
      var stackIndex = state.stackIndex;
      if (this.stackIndex_ != stackIndex) {
        dev().fine(TAG_, "stackIndex: ".concat(this.stackIndex_, " -> ").concat(stackIndex));
        this.stackIndex_ = stackIndex;
        if (this.onStateUpdated_) {
          this.onStateUpdated_(state);
        }
      }
    }

    /**
     * `getFragment`
     *
     *   Request:  undefined
     *   Response: string
     *
     * @override
     */ }, { key: "getFragment", value:
    function getFragment() {
      if (!this.viewer_.hasCapability('fragment')) {
        return Promise.resolve('');
      }
      return this.viewer_.
      sendMessageAwaitResponse(
      'getFragment',
      undefined,
      /* cancelUnsent */true).

      then(function (data) {
        if (!data) {
          return '';
        }
        var hash = /** @type {string} */(data);
        /* Strip leading '#'*/
        if (hash[0] == '#') {
          hash = hash.substr(1);
        }
        return hash;
      });
    }

    /**
     * `replaceHistory`
     *
     *   Request:   {'fragment': string}
     *   Response:  undefined | {'stackIndex': string}
     *
     * @override
     */ }, { key: "updateFragment", value:
    function updateFragment(fragment) {
      if (!this.viewer_.hasCapability('fragment')) {
        return _resolvedPromise3();
      }
      return (/** @type {!Promise} */(
        this.viewer_.sendMessageAwaitResponse(
        'replaceHistory',
        dict({ 'fragment': fragment }),
        /* cancelUnsent */true)));


    } }]);return HistoryBindingVirtual_;}();


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!History}
 * @private
 */
function createHistory(ampdoc) {
  var viewer = Services.viewerForDoc(ampdoc);
  var binding;
  if (
  viewer.isOvertakeHistory() || false ||

  ampdoc.win.__AMP_TEST_IFRAME)
  {
    binding = new HistoryBindingVirtual_(ampdoc.win, viewer);
  } else {
    // Only one global "natural" binding is allowed since it works with the
    // global history stack.
    registerServiceBuilder(
    ampdoc.win,
    'global-history-binding',
    HistoryBindingNatural_);

    binding = getService(ampdoc.win, 'global-history-binding');
  }
  return new History(ampdoc, binding);
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installHistoryServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'history', createHistory);
}
// /Users/mszylkowski/src/amphtml/src/service/history-impl.js