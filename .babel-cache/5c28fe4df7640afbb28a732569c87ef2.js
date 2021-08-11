import { resolvedPromise as _resolvedPromise3 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { getService, registerServiceBuilder, registerServiceBuilderForDoc } from "../service-helpers";

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
  function History(ampdoc, binding) {
    _classCallCheck(this, History);

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

  /** @visibleForTesting */
  _createClass(History, [{
    key: "cleanup",
    value: function cleanup() {
      this.binding_.cleanup();
    }
    /**
     * Pushes new state into history stack with an optional callback to be called
     * when this state is popped as well as an object with updates to be applied
     * to the state.
     * @param {!Function=} opt_onPop
     * @param {!HistoryStateUpdateDef=} opt_stateUpdate
     * @return {!Promise<!HistoryIdDef>}
     */

  }, {
    key: "push",
    value: function push(opt_onPop, opt_stateUpdate) {
      var _this = this;

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
     */

  }, {
    key: "pop",
    value: function pop(stateId) {
      var _this2 = this;

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
     */

  }, {
    key: "replace",
    value: function replace(opt_stateUpdate) {
      var _this3 = this;

      return this.enque_(function () {
        return _this3.binding_.replace(opt_stateUpdate);
      }, 'replace');
    }
    /**
     * Retrieves the current state, containing the current fragment, title,
     * and amp-bind state.
     * @return {!Promise<!HistoryStateDef>}
     */

  }, {
    key: "get",
    value: function get() {
      var _this4 = this;

      return this.enque_(function () {
        return _this4.binding_.get();
      }, 'get');
    }
    /**
     * Requests navigation one step back. This first attempts to go back within
     * the context of this document.
     *
     * @param {boolean=} navigate
     * @return {!Promise}
     */

  }, {
    key: "goBack",
    value: function goBack(navigate) {
      var _this5 = this;

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
     */

  }, {
    key: "replaceStateForTarget",
    value: function replaceStateForTarget(target) {
      var _this6 = this;

      devAssert(target[0] == '#', 'target should start with a #');
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
     */

  }, {
    key: "getFragment",
    value: function getFragment() {
      return this.binding_.getFragment();
    }
    /**
     * Update the page url fragment
     * @param {string} fragment
     * @return {!Promise}
     */

  }, {
    key: "updateFragment",
    value: function updateFragment(fragment) {
      if (fragment[0] == '#') {
        fragment = fragment.substr(1);
      }

      return this.binding_.updateFragment(fragment);
    }
    /**
     * @param {!HistoryStateDef} historyState
     * @private
     */

  }, {
    key: "onStateUpdated_",
    value: function onStateUpdated_(historyState) {
      this.stackIndex_ = historyState.stackIndex;
      this.doPop_(historyState);
    }
    /**
     * @param {!HistoryStateDef} historyState
     * @private
     */

  }, {
    key: "doPop_",
    value: function doPop_(historyState) {
      var _this7 = this;

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

      if (toPop.length > 0) {
        var _loop = function _loop(_i) {
          // With the same delay timeouts must observe the order, although
          // there's no hard requirement in this case to follow the pop order.
          _this7.timer_.delay(function () {
            return toPop[_i](historyState);
          }, 1);
        };

        for (var _i = 0; _i < toPop.length; _i++) {
          _loop(_i);
        }
      }
    }
    /**
     * @param {function():!Promise<RESULT>} callback
     * @param {string} name
     * @return {!Promise<RESULT>}
     * @template RESULT
     * @private
     */

  }, {
    key: "enque_",
    value: function enque_(callback, name) {
      var deferred = new Deferred();
      var promise = deferred.promise,
          reject = deferred.reject,
          resolve = deferred.resolve;
      // TODO(dvoytenko, #8785): cleanup after tracing.
      var trace = new Error('history trace for ' + name + ': ');
      this.queue_.push({
        callback: callback,
        resolve: resolve,
        reject: reject,
        trace: trace
      });

      if (this.queue_.length == 1) {
        this.deque_();
      }

      return promise;
    }
    /**
     * @private
     */

  }, {
    key: "deque_",
    value: function deque_() {
      var _this8 = this;

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

      promise.then(function (result) {
        task.resolve(result);
      }, function (reason) {
        dev().error(TAG_, 'failed to execute a task:', reason);

        // TODO(dvoytenko, #8785): cleanup after tracing.
        if (task.trace) {
          task.trace.message += reason;
          dev().error(TAG_, task.trace);
        }

        task.reject(reason);
      }).then(function () {
        _this8.queue_.splice(0, 1);

        _this8.deque_();
      });
    }
  }]);

  return History;
}();

/**
 * HistoryBindingInterface is an interface that defines an underlying technology
 * behind the {@link History}.
 * @interface
 */
var HistoryBindingInterface = /*#__PURE__*/function () {
  function HistoryBindingInterface() {
    _classCallCheck(this, HistoryBindingInterface);
  }

  _createClass(HistoryBindingInterface, [{
    key: "cleanup",
    value:
    /** @protected */
    function cleanup() {}
    /**
     * Configures a callback to be called when the state has been updated.
     * @param {function(!HistoryStateDef)} unusedCallback
     * @protected
     */

  }, {
    key: "setOnStateUpdated",
    value: function setOnStateUpdated(unusedCallback) {}
    /**
     * Pushes a new state onto the history stack, optionally specifying the state
     * object associated with the current state.
     * Returns a promise that yields the new state.
     * @param {!HistoryStateUpdateDef=} opt_stateUpdate
     * @return {!Promise<!HistoryStateDef>}
     */

  }, {
    key: "push",
    value: function push(opt_stateUpdate) {}
    /**
     * Pops a previously pushed state from the history stack. All history
     * states coming after this state will also be popped.
     * Returns a promise that yields the new state.
     * @param {number} unusedStackIndex
     * @return {!Promise<!HistoryStateDef>}
     */

  }, {
    key: "pop",
    value: function pop(unusedStackIndex) {}
    /**
     * Replaces the current state, optionally specifying updates to the state
     * object to be associated with the replacement.
     * Returns a promise that yields the new state.
     * @param {!HistoryStateUpdateDef=} opt_stateUpdate
     * @return {!Promise<!HistoryStateDef>}
     */

  }, {
    key: "replace",
    value: function replace(opt_stateUpdate) {}
    /**
     * Retrieves the current state, containing the current fragment, title,
     * and amp-bind state.
     * @return {!Promise<!HistoryStateDef>}
     */

  }, {
    key: "get",
    value: function get() {}
    /**
     * Replaces the state for local target navigation.
     * @param {string} unusedTarget
     */

  }, {
    key: "replaceStateForTarget",
    value: function replaceStateForTarget(unusedTarget) {}
    /**
     * Get the fragment from the url or the viewer.
     * Strip leading '#' in the fragment
     * @return {!Promise<string>}
     */

  }, {
    key: "getFragment",
    value: function getFragment() {}
    /**
     * Update the page url fragment
     * @param {string} unusedFragment
     * @return {!Promise}
     */

  }, {
    key: "updateFragment",
    value: function updateFragment(unusedFragment) {}
  }]);

  return HistoryBindingInterface;
}();

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
  function HistoryBindingNatural_(win) {
    var _this9 = this;

    _classCallCheck(this, HistoryBindingNatural_);

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
      this.origPushState_ = history.originalPushState || history.pushState.bind(history);

      /** @private @const {function(*, string=, string=)|undefined} */
      this.origReplaceState_ = history.originalReplaceState || history.replaceState.bind(history);

      pushState = function pushState(state, opt_title, opt_url) {
        _this9.unsupportedState_ = state;

        _this9.origPushState_(state, opt_title, // A bug in edge causes paths to become undefined if URL is
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
      this.replaceState_(this.historyState_(this.stackIndex_,
      /* replace */
      true));
    } catch (e) {
      dev().error(TAG_, 'Initial replaceState failed: ' + e.message);
    }

    history.pushState = this.historyPushState_.bind(this);
    history.replaceState = this.historyReplaceState_.bind(this);

    this.popstateHandler_ = function (e) {
      var event =
      /** @type {!PopStateEvent} */
      e;
      var state =
      /** @type {!JsonObject} */
      event.state;
      dev().fine(TAG_, 'popstate event: ' + _this9.win.history.length + ', ' + JSON.stringify(state));

      _this9.onHistoryEvent_();
    };

    this.win.addEventListener('popstate', this.popstateHandler_);
  }

  /** @override */
  _createClass(HistoryBindingNatural_, [{
    key: "cleanup",
    value: function cleanup() {
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
     */

  }, {
    key: "historyState_",
    value: function historyState_(stackIndex, opt_replace) {
      var state = map(opt_replace ? this.getState_() : undefined);
      state[HISTORY_PROP_] = stackIndex;
      return state;
    }
    /** @override */

  }, {
    key: "setOnStateUpdated",
    value: function setOnStateUpdated(callback) {
      this.onStateUpdated_ = callback;
    }
    /** @override */

  }, {
    key: "push",
    value: function push(opt_stateUpdate) {
      var _this10 = this;

      return this.whenReady_(function () {
        var newState = _this10.mergeStateUpdate_(_this10.getState_(), opt_stateUpdate || {});

        _this10.historyPushState_(newState,
        /* title */
        undefined, newState.fragment ? '#' + newState.fragment : undefined);

        return tryResolve(function () {
          return _this10.mergeStateUpdate_(newState, {
            stackIndex: _this10.stackIndex_
          });
        });
      });
    }
    /** @override */

  }, {
    key: "pop",
    value: function pop(stackIndex) {
      var _this11 = this;

      // On pop, stack is not allowed to go prior to the starting point.
      stackIndex = Math.max(stackIndex, this.startIndex_);
      return this.whenReady_(function () {
        return _this11.back_(_this11.stackIndex_ - stackIndex + 1);
      }).then(function (newStackIndex) {
        return _this11.mergeStateUpdate_(_this11.getState_(), {
          stackIndex: newStackIndex
        });
      });
    }
    /** @override */

  }, {
    key: "replace",
    value: function replace(opt_stateUpdate) {
      var _this12 = this;

      if (opt_stateUpdate === void 0) {
        opt_stateUpdate = {};
      }

      return this.whenReady_(function () {
        var newState = _this12.mergeStateUpdate_(_this12.getState_(), opt_stateUpdate || {});

        var url = (newState.url || '').replace(/#.*/, '');
        var fragment = newState.fragment ? '#' + newState.fragment : '';

        _this12.historyReplaceState_(newState, newState.title, url || fragment ? url + fragment : undefined);

        return tryResolve(function () {
          return _this12.mergeStateUpdate_(newState, {
            stackIndex: _this12.stackIndex_
          });
        });
      });
    }
    /** @override */

  }, {
    key: "get",
    value: function get() {
      var _this13 = this;

      return tryResolve(function () {
        return _this13.mergeStateUpdate_(_this13.getState_(), {
          stackIndex: _this13.stackIndex_
        });
      });
    }
    /**
     * @param {number} stackIndex
     * @return {!Promise}
     */

  }, {
    key: "backTo",
    value: function backTo(stackIndex) {
      var _this14 = this;

      // On pop, stack is not allowed to go prior to the starting point.
      stackIndex = Math.max(stackIndex, this.startIndex_);
      return this.whenReady_(function () {
        return _this14.back_(_this14.stackIndex_ - stackIndex);
      });
    }
    /** @private */

  }, {
    key: "onHistoryEvent_",
    value: function onHistoryEvent_() {
      var state = this.getState_();
      dev().fine(TAG_, 'history event: ' + this.win.history.length + ', ' + JSON.stringify(state));
      var stackIndex = state ? state[HISTORY_PROP_] : undefined;
      var newStackIndex = this.stackIndex_;
      var waitingState = this.waitingState_;
      this.waitingState_ = undefined;

      if (newStackIndex > this.win.history.length - 2) {
        // Make sure stack has enough space. Whether we are going forward or
        // backward, the stack should have at least one extra cell.
        newStackIndex = this.win.history.length - 2;
        this.updateHistoryState_(this.mergeStateUpdate_(state, {
          stackIndex: newStackIndex
        }));
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
        this.updateHistoryState_(this.mergeStateUpdate_(state, {
          stackIndex: newStackIndex
        }));
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
    /** @private */

  }, {
    key: "getState_",
    value: function getState_() {
      if (this.supportsState_) {
        return getHistoryState(this.win.history);
      }

      return this.unsupportedState_;
    }
    /** @private */

  }, {
    key: "assertReady_",
    value: function assertReady_() {
      devAssert(!this.waitingState_, 'The history must not be in the waiting state');
    }
    /**
     * @param {function():!Promise<RESULT>} callback
     * @return {!Promise<RESULT>}
     * @template RESULT
     * @private
     */

  }, {
    key: "whenReady_",
    value: function whenReady_(callback) {
      if (!this.waitingState_) {
        return callback();
      }

      return this.waitingState_.promise.then(callback, callback);
    }
    /**
     * @return {!Promise}
     * @private
     */

  }, {
    key: "wait_",
    value: function wait_() {
      this.assertReady_();
      var deferred = new Deferred();
      var reject = deferred.reject,
          resolve = deferred.resolve;
      var promise = this.timer_.timeoutPromise(500, deferred.promise);
      this.waitingState_ = {
        promise: promise,
        resolve: resolve,
        reject: reject
      };
      return promise;
    }
    /**
     * @param {number} steps
     * @return {!Promise}
     */

  }, {
    key: "back_",
    value: function back_(steps) {
      var _this15 = this;

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
     */

  }, {
    key: "historyPushState_",
    value: function historyPushState_(state, title, url) {
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
      /** @type {!HistoryStateDef} */
      state, {
        stackIndex: stackIndex
      });
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
     */

  }, {
    key: "replaceStateForTarget",
    value: function replaceStateForTarget(target) {
      var _this16 = this;

      devAssert(target[0] == '#', 'target should start with a #');
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
     */

  }, {
    key: "historyReplaceState_",
    value: function historyReplaceState_(state, title, url) {
      this.assertReady_();

      if (!state) {
        state = {};
      }

      var stackIndex = Math.min(this.stackIndex_, this.win.history.length - 1);
      state[HISTORY_PROP_] = stackIndex;
      this.replaceState_(state, title, url);
      var newState = this.mergeStateUpdate_(
      /** @type {!HistoryStateDef} */
      state, {
        stackIndex: stackIndex
      });
      this.updateHistoryState_(newState);
    }
    /**
     * @param {!HistoryStateDef} historyState
     * @private
     */

  }, {
    key: "updateHistoryState_",
    value: function updateHistoryState_(historyState) {
      this.assertReady_();
      historyState.stackIndex = Math.min(historyState.stackIndex, this.win.history.length - 1);

      if (this.stackIndex_ != historyState.stackIndex) {
        dev().fine(TAG_, 'stack index changed: ' + this.stackIndex_ + ' -> ' + historyState.stackIndex);
        this.stackIndex_ = historyState.stackIndex;

        if (this.onStateUpdated_) {
          this.onStateUpdated_(historyState);
        }
      }
    }
    /** @override */

  }, {
    key: "getFragment",
    value: function getFragment() {
      var hash = this.win.location.hash;

      /* Strip leading '#' */
      hash = hash.substr(1);
      return Promise.resolve(hash);
    }
    /** @override */

  }, {
    key: "updateFragment",
    value: function updateFragment(fragment) {
      return this.replace({
        fragment: fragment
      });
    }
    /**
     * @param {?HistoryStateDef} state
     * @param {!HistoryStateUpdateDef} update
     * @return {!HistoryStateDef}
     */

  }, {
    key: "mergeStateUpdate_",
    value: function mergeStateUpdate_(state, update) {
      var mergedData =
      /** @type {!JsonObject} */
      _extends({}, state && state.data || {}, update.data || {});

      return (
        /** @type {!HistoryStateDef} */
        _extends({}, state || {}, update, {
          data: mergedData
        })
      );
    }
  }]);

  return HistoryBindingNatural_;
}();

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
  function HistoryBindingVirtual_(win, viewer) {
    var _this17 = this;

    _classCallCheck(this, HistoryBindingVirtual_);

    /** @const {!Window} */
    this.win = win;

    /** @private @const {!./viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;

    /** @private {number} */
    this.stackIndex_ = 0;

    /** @private {?function(!HistoryStateDef)} */
    this.onStateUpdated_ = null;

    /** @private {!UnlistenDef} */
    this.unlistenOnHistoryPopped_ = this.viewer_.onMessage('historyPopped', function (data) {
      return _this17.onHistoryPopped_(data);
    });
  }

  /** @override */
  _createClass(HistoryBindingVirtual_, [{
    key: "replaceStateForTarget",
    value: function replaceStateForTarget(target) {
      devAssert(target[0] == '#', 'target should start with a #');
      this.win.location.replace(target);
    }
    /** @override */

  }, {
    key: "cleanup",
    value: function cleanup() {
      this.unlistenOnHistoryPopped_();
    }
    /** @override */

  }, {
    key: "setOnStateUpdated",
    value: function setOnStateUpdated(callback) {
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
     */

  }, {
    key: "toHistoryState_",
    value: function toHistoryState_(maybeHistoryState, fallbackState, debugId) {
      if (this.isHistoryState_(maybeHistoryState)) {
        return (
          /** @type {!HistoryStateDef} */
          maybeHistoryState
        );
      } else {
        dev().warn(TAG_, 'Ignored unexpected "%s" data:', debugId, maybeHistoryState);
      }

      return fallbackState;
    }
    /**
     * @param {*} maybeHistoryState
     * @return {boolean}
     */

  }, {
    key: "isHistoryState_",
    value: function isHistoryState_(maybeHistoryState) {
      return !!maybeHistoryState && maybeHistoryState['stackIndex'] !== undefined;
    }
    /**
     * `pushHistory`
     *
     *   Request:  {'stackIndex': string}
     *   Response: undefined | {'stackIndex': string}
     *
     * @override
     */

  }, {
    key: "push",
    value: function push(opt_stateUpdate) {
      var _this18 = this;

      var message =
      /** @type {!JsonObject} */
      _extends({
        'stackIndex': this.stackIndex_ + 1
      }, opt_stateUpdate || {});

      var push = 'pushHistory';
      return this.viewer_.sendMessageAwaitResponse(push, message).then(function (response) {
        var fallbackState =
        /** @type {!HistoryStateDef} */
        message;

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
     */

  }, {
    key: "pop",
    value: function pop(stackIndex) {
      var _this19 = this;

      if (stackIndex > this.stackIndex_) {
        return this.get();
      }

      var message = dict({
        'stackIndex': this.stackIndex_
      });
      var pop = 'popHistory';
      return this.viewer_.sendMessageAwaitResponse(pop, message).then(function (response) {
        var fallbackState =
        /** @type {!HistoryStateDef} */
        dict({
          'stackIndex': _this19.stackIndex_ - 1
        });

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
     */

  }, {
    key: "replace",
    value: function replace(opt_stateUpdate) {
      var _this20 = this;

      if (opt_stateUpdate && opt_stateUpdate.url) {
        if (!this.viewer_.hasCapability('fullReplaceHistory')) {
          // Full URL replacement requested, but not supported by the viewer.
          // Don't update, and return the current state.
          var curState =
          /** @type {!HistoryStateDef} */
          dict({
            'stackIndex': this.stackIndex_
          });
          return Promise.resolve(curState);
        }

        // replace fragment, only explicit fragment param will be sent.
        var url = opt_stateUpdate.url.replace(/#.*/, '');
        opt_stateUpdate.url = url;
      }

      var message =
      /** @type {!JsonObject} */
      _extends({
        'stackIndex': this.stackIndex_
      }, opt_stateUpdate || {});

      var replace = 'replaceHistory';
      return this.viewer_.sendMessageAwaitResponse(replace, message,
      /* cancelUnsent */
      true).then(function (response) {
        var fallbackState =
        /** @type {!HistoryStateDef} */
        message;

        var newState = _this20.toHistoryState_(response, fallbackState, replace);

        _this20.updateHistoryState_(newState);

        return newState;
      });
    }
    /**
     * Note: Only returns the current `stackIndex`.
     * @override
     */

  }, {
    key: "get",
    value: function get() {
      // Not sure why this type coercion is necessary, but CC complains otherwise.
      return Promise.resolve(
      /** @type {!HistoryStateDef} */
      {
        data: undefined,
        fragment: '',
        stackIndex: this.stackIndex_,
        title: ''
      });
    }
    /**
     * `historyPopped` (from viewer)
     *
     *   Request:  {'newStackIndex': number} | {'stackIndex': number}
     *   Response: undefined
     *
     * @param {!JsonObject} data
     * @private
     */

  }, {
    key: "onHistoryPopped_",
    value: function onHistoryPopped_(data) {
      if (data['newStackIndex'] !== undefined) {
        data['stackIndex'] = data['newStackIndex'];
      }

      if (this.isHistoryState_(data)) {
        this.updateHistoryState_(
        /** @type {!HistoryStateDef} */
        data);
      } else {
        dev().warn(TAG_, 'Ignored unexpected "historyPopped" data:', data);
      }
    }
    /**
     * @param {!HistoryStateDef} state
     * @private
     */

  }, {
    key: "updateHistoryState_",
    value: function updateHistoryState_(state) {
      var stackIndex = state.stackIndex;

      if (this.stackIndex_ != stackIndex) {
        dev().fine(TAG_, "stackIndex: " + this.stackIndex_ + " -> " + stackIndex);
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
     */

  }, {
    key: "getFragment",
    value: function getFragment() {
      if (!this.viewer_.hasCapability('fragment')) {
        return Promise.resolve('');
      }

      return this.viewer_.sendMessageAwaitResponse('getFragment', undefined,
      /* cancelUnsent */
      true).then(function (data) {
        if (!data) {
          return '';
        }

        var hash = dev().assertString(data);

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
     */

  }, {
    key: "updateFragment",
    value: function updateFragment(fragment) {
      if (!this.viewer_.hasCapability('fragment')) {
        return _resolvedPromise3();
      }

      return (
        /** @type {!Promise} */
        this.viewer_.sendMessageAwaitResponse('replaceHistory', dict({
          'fragment': fragment
        }),
        /* cancelUnsent */
        true)
      );
    }
  }]);

  return HistoryBindingVirtual_;
}();

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!History}
 * @private
 */
function createHistory(ampdoc) {
  var viewer = Services.viewerForDoc(ampdoc);
  var binding;

  if (viewer.isOvertakeHistory() || getMode(ampdoc.win).test || ampdoc.win.__AMP_TEST_IFRAME) {
    binding = new HistoryBindingVirtual_(ampdoc.win, viewer);
  } else {
    // Only one global "natural" binding is allowed since it works with the
    // global history stack.
    registerServiceBuilder(ampdoc.win, 'global-history-binding', HistoryBindingNatural_);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhpc3RvcnktaW1wbC5qcyJdLCJuYW1lcyI6WyJEZWZlcnJlZCIsInRyeVJlc29sdmUiLCJkaWN0IiwibWFwIiwiZ2V0SGlzdG9yeVN0YXRlIiwiU2VydmljZXMiLCJkZXYiLCJkZXZBc3NlcnQiLCJnZXRNb2RlIiwiZ2V0U2VydmljZSIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXIiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jIiwiVEFHXyIsIkhJU1RPUllfUFJPUF8iLCJIaXN0b3J5SWREZWYiLCJIaXN0b3J5U3RhdGVEZWYiLCJIaXN0b3J5U3RhdGVVcGRhdGVEZWYiLCJIaXN0b3J5IiwiYW1wZG9jIiwiYmluZGluZyIsImFtcGRvY18iLCJ0aW1lcl8iLCJ0aW1lckZvciIsIndpbiIsImJpbmRpbmdfIiwic3RhY2tJbmRleF8iLCJzdGFja09uUG9wXyIsInF1ZXVlXyIsInNldE9uU3RhdGVVcGRhdGVkIiwib25TdGF0ZVVwZGF0ZWRfIiwiYmluZCIsImNsZWFudXAiLCJvcHRfb25Qb3AiLCJvcHRfc3RhdGVVcGRhdGUiLCJlbnF1ZV8iLCJwdXNoIiwidGhlbiIsImhpc3RvcnlTdGF0ZSIsInN0YWNrSW5kZXgiLCJzdGF0ZUlkIiwicG9wIiwicmVwbGFjZSIsImdldCIsIm5hdmlnYXRlIiwidGFyZ2V0IiwicHJldmlvdXNIYXNoIiwibG9jYXRpb24iLCJoYXNoIiwicmVwbGFjZVN0YXRlRm9yVGFyZ2V0IiwiZ2V0RnJhZ21lbnQiLCJmcmFnbWVudCIsInN1YnN0ciIsInVwZGF0ZUZyYWdtZW50IiwiZG9Qb3BfIiwibGVuZ3RoIiwidG9Qb3AiLCJpIiwidW5kZWZpbmVkIiwic3BsaWNlIiwiZGVsYXkiLCJjYWxsYmFjayIsIm5hbWUiLCJkZWZlcnJlZCIsInByb21pc2UiLCJyZWplY3QiLCJyZXNvbHZlIiwidHJhY2UiLCJFcnJvciIsImRlcXVlXyIsInRhc2siLCJlIiwiUHJvbWlzZSIsInJlc3VsdCIsInJlYXNvbiIsImVycm9yIiwibWVzc2FnZSIsIkhpc3RvcnlCaW5kaW5nSW50ZXJmYWNlIiwidW51c2VkQ2FsbGJhY2siLCJ1bnVzZWRTdGFja0luZGV4IiwidW51c2VkVGFyZ2V0IiwidW51c2VkRnJhZ21lbnQiLCJIaXN0b3J5QmluZGluZ05hdHVyYWxfIiwiaGlzdG9yeSIsInN0YXJ0SW5kZXhfIiwic3RhdGUiLCJNYXRoIiwibWluIiwid2FpdGluZ1N0YXRlXyIsInN1cHBvcnRzU3RhdGVfIiwidW5zdXBwb3J0ZWRTdGF0ZV8iLCJoaXN0b3J5U3RhdGVfIiwicHVzaFN0YXRlIiwicmVwbGFjZVN0YXRlIiwib3JpZ1B1c2hTdGF0ZV8iLCJvcmlnaW5hbFB1c2hTdGF0ZSIsIm9yaWdSZXBsYWNlU3RhdGVfIiwib3JpZ2luYWxSZXBsYWNlU3RhdGUiLCJvcHRfdGl0bGUiLCJvcHRfdXJsIiwicHVzaFN0YXRlXyIsInJlcGxhY2VTdGF0ZV8iLCJoaXN0b3J5UHVzaFN0YXRlXyIsImhpc3RvcnlSZXBsYWNlU3RhdGVfIiwicG9wc3RhdGVIYW5kbGVyXyIsImV2ZW50IiwiZmluZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJvbkhpc3RvcnlFdmVudF8iLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9wdF9yZXBsYWNlIiwiZ2V0U3RhdGVfIiwid2hlblJlYWR5XyIsIm5ld1N0YXRlIiwibWVyZ2VTdGF0ZVVwZGF0ZV8iLCJtYXgiLCJiYWNrXyIsIm5ld1N0YWNrSW5kZXgiLCJ1cmwiLCJ0aXRsZSIsIndhaXRpbmdTdGF0ZSIsInVwZGF0ZUhpc3RvcnlTdGF0ZV8iLCJhc3NlcnRSZWFkeV8iLCJ0aW1lb3V0UHJvbWlzZSIsInN0ZXBzIiwid2FpdF8iLCJnbyIsInVwZGF0ZSIsIm1lcmdlZERhdGEiLCJkYXRhIiwiSGlzdG9yeUJpbmRpbmdWaXJ0dWFsXyIsInZpZXdlciIsInZpZXdlcl8iLCJ1bmxpc3Rlbk9uSGlzdG9yeVBvcHBlZF8iLCJvbk1lc3NhZ2UiLCJvbkhpc3RvcnlQb3BwZWRfIiwibWF5YmVIaXN0b3J5U3RhdGUiLCJmYWxsYmFja1N0YXRlIiwiZGVidWdJZCIsImlzSGlzdG9yeVN0YXRlXyIsIndhcm4iLCJzZW5kTWVzc2FnZUF3YWl0UmVzcG9uc2UiLCJyZXNwb25zZSIsInRvSGlzdG9yeVN0YXRlXyIsImhhc0NhcGFiaWxpdHkiLCJjdXJTdGF0ZSIsImFzc2VydFN0cmluZyIsImNyZWF0ZUhpc3RvcnkiLCJ2aWV3ZXJGb3JEb2MiLCJpc092ZXJ0YWtlSGlzdG9yeSIsInRlc3QiLCJfX0FNUF9URVNUX0lGUkFNRSIsImluc3RhbGxIaXN0b3J5U2VydmljZUZvckRvYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUixFQUFrQkMsVUFBbEI7QUFDQSxTQUFRQyxJQUFSLEVBQWNDLEdBQWQ7QUFDQSxTQUFRQyxlQUFSO0FBRUEsU0FBUUMsUUFBUjtBQUVBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUNFQyxVQURGLEVBRUVDLHNCQUZGLEVBR0VDLDRCQUhGOztBQU1BO0FBQ0EsSUFBTUMsSUFBSSxHQUFHLFNBQWI7O0FBRUE7QUFDQSxJQUFNQyxhQUFhLEdBQUcsYUFBdEI7O0FBRUE7QUFDQSxJQUFJQyxZQUFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUlDLGVBQUo7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSUMscUJBQUo7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsT0FBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0UsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQTZCO0FBQUE7O0FBQzNCO0FBQ0EsU0FBS0MsT0FBTCxHQUFlRixNQUFmOztBQUVBO0FBQ0EsU0FBS0csTUFBTCxHQUFjaEIsUUFBUSxDQUFDaUIsUUFBVCxDQUFrQkosTUFBTSxDQUFDSyxHQUF6QixDQUFkOztBQUVBO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkwsT0FBaEI7O0FBRUE7QUFDQSxTQUFLTSxXQUFMLEdBQW1CLENBQW5COztBQUVBO0FBQ0EsU0FBS0MsV0FBTCxHQUFtQixFQUFuQjs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJLFNBQUtDLE1BQUwsR0FBYyxFQUFkO0FBRUEsU0FBS0gsUUFBTCxDQUFjSSxpQkFBZCxDQUFnQyxLQUFLQyxlQUFMLENBQXFCQyxJQUFyQixDQUEwQixJQUExQixDQUFoQztBQUNEOztBQUVEO0FBakNGO0FBQUE7QUFBQSxXQWtDRSxtQkFBVTtBQUNSLFdBQUtOLFFBQUwsQ0FBY08sT0FBZDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE3Q0E7QUFBQTtBQUFBLFdBOENFLGNBQUtDLFNBQUwsRUFBZ0JDLGVBQWhCLEVBQWlDO0FBQUE7O0FBQy9CLGFBQU8sS0FBS0MsTUFBTCxDQUFZLFlBQU07QUFDdkIsZUFBTyxLQUFJLENBQUNWLFFBQUwsQ0FBY1csSUFBZCxDQUFtQkYsZUFBbkIsRUFBb0NHLElBQXBDLENBQXlDLFVBQUNDLFlBQUQsRUFBa0I7QUFDaEUsVUFBQSxLQUFJLENBQUNSLGVBQUwsQ0FBcUJRLFlBQXJCOztBQUNBLGNBQUlMLFNBQUosRUFBZTtBQUNiLFlBQUEsS0FBSSxDQUFDTixXQUFMLENBQWlCVyxZQUFZLENBQUNDLFVBQTlCLElBQTRDTixTQUE1QztBQUNEOztBQUNELGlCQUFPSyxZQUFZLENBQUNDLFVBQXBCO0FBQ0QsU0FOTSxDQUFQO0FBT0QsT0FSTSxFQVFKLE1BUkksQ0FBUDtBQVNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWxFQTtBQUFBO0FBQUEsV0FtRUUsYUFBSUMsT0FBSixFQUFhO0FBQUE7O0FBQ1gsYUFBTyxLQUFLTCxNQUFMLENBQVksWUFBTTtBQUN2QixlQUFPLE1BQUksQ0FBQ1YsUUFBTCxDQUFjZ0IsR0FBZCxDQUFrQkQsT0FBbEIsRUFBMkJILElBQTNCLENBQWdDLFVBQUNDLFlBQUQsRUFBa0I7QUFDdkQsVUFBQSxNQUFJLENBQUNSLGVBQUwsQ0FBcUJRLFlBQXJCO0FBQ0QsU0FGTSxDQUFQO0FBR0QsT0FKTSxFQUlKLEtBSkksQ0FBUDtBQUtEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWhGQTtBQUFBO0FBQUEsV0FpRkUsaUJBQVFKLGVBQVIsRUFBeUI7QUFBQTs7QUFDdkIsYUFBTyxLQUFLQyxNQUFMLENBQVk7QUFBQSxlQUFNLE1BQUksQ0FBQ1YsUUFBTCxDQUFjaUIsT0FBZCxDQUFzQlIsZUFBdEIsQ0FBTjtBQUFBLE9BQVosRUFBMEQsU0FBMUQsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUF6RkE7QUFBQTtBQUFBLFdBMEZFLGVBQU07QUFBQTs7QUFDSixhQUFPLEtBQUtDLE1BQUwsQ0FBWTtBQUFBLGVBQU0sTUFBSSxDQUFDVixRQUFMLENBQWNrQixHQUFkLEVBQU47QUFBQSxPQUFaLEVBQXVDLEtBQXZDLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXBHQTtBQUFBO0FBQUEsV0FxR0UsZ0JBQU9DLFFBQVAsRUFBaUI7QUFBQTs7QUFDZixhQUFPLEtBQUtULE1BQUwsQ0FBWSxZQUFNO0FBQ3ZCLFlBQUksTUFBSSxDQUFDVCxXQUFMLElBQW9CLENBQXBCLElBQXlCLENBQUNrQixRQUE5QixFQUF3QztBQUN0QyxpQkFBTyxrQkFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQSxlQUFPLE1BQUksQ0FBQ25CLFFBQUwsQ0FBY2dCLEdBQWQsQ0FBa0IsTUFBSSxDQUFDZixXQUF2QixFQUFvQ1csSUFBcEMsQ0FBeUMsVUFBQ0MsWUFBRCxFQUFrQjtBQUNoRSxVQUFBLE1BQUksQ0FBQ1IsZUFBTCxDQUFxQlEsWUFBckI7QUFDRCxTQUZNLENBQVA7QUFHRCxPQVZNLEVBVUosUUFWSSxDQUFQO0FBV0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTFIQTtBQUFBO0FBQUEsV0EySEUsK0JBQXNCTyxNQUF0QixFQUE4QjtBQUFBOztBQUM1QnJDLE1BQUFBLFNBQVMsQ0FBQ3FDLE1BQU0sQ0FBQyxDQUFELENBQU4sSUFBYSxHQUFkLEVBQW1CLDhCQUFuQixDQUFUO0FBQ0EsVUFBTUMsWUFBWSxHQUFHLEtBQUt6QixPQUFMLENBQWFHLEdBQWIsQ0FBaUJ1QixRQUFqQixDQUEwQkMsSUFBL0M7QUFDQSxhQUFPLEtBQUtaLElBQUwsQ0FBVSxZQUFNO0FBQ3JCLFFBQUEsTUFBSSxDQUFDZixPQUFMLENBQWFHLEdBQWIsQ0FBaUJ1QixRQUFqQixDQUEwQkwsT0FBMUIsQ0FBa0NJLFlBQVksSUFBSSxHQUFsRDtBQUNELE9BRk0sRUFFSlQsSUFGSSxDQUVDLFlBQU07QUFDWixRQUFBLE1BQUksQ0FBQ1osUUFBTCxDQUFjd0IscUJBQWQsQ0FBb0NKLE1BQXBDO0FBQ0QsT0FKTSxDQUFQO0FBS0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXpJQTtBQUFBO0FBQUEsV0EwSUUsdUJBQWM7QUFDWixhQUFPLEtBQUtwQixRQUFMLENBQWN5QixXQUFkLEVBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBbEpBO0FBQUE7QUFBQSxXQW1KRSx3QkFBZUMsUUFBZixFQUF5QjtBQUN2QixVQUFJQSxRQUFRLENBQUMsQ0FBRCxDQUFSLElBQWUsR0FBbkIsRUFBd0I7QUFDdEJBLFFBQUFBLFFBQVEsR0FBR0EsUUFBUSxDQUFDQyxNQUFULENBQWdCLENBQWhCLENBQVg7QUFDRDs7QUFDRCxhQUFPLEtBQUszQixRQUFMLENBQWM0QixjQUFkLENBQTZCRixRQUE3QixDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE3SkE7QUFBQTtBQUFBLFdBOEpFLHlCQUFnQmIsWUFBaEIsRUFBOEI7QUFDNUIsV0FBS1osV0FBTCxHQUFtQlksWUFBWSxDQUFDQyxVQUFoQztBQUNBLFdBQUtlLE1BQUwsQ0FBWWhCLFlBQVo7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXRLQTtBQUFBO0FBQUEsV0F1S0UsZ0JBQU9BLFlBQVAsRUFBcUI7QUFBQTs7QUFDbkIsVUFBSSxLQUFLWixXQUFMLElBQW9CLEtBQUtDLFdBQUwsQ0FBaUI0QixNQUFqQixHQUEwQixDQUFsRCxFQUFxRDtBQUNuRDtBQUNEOztBQUVELFVBQU1DLEtBQUssR0FBRyxFQUFkOztBQUNBLFdBQUssSUFBSUMsQ0FBQyxHQUFHLEtBQUs5QixXQUFMLENBQWlCNEIsTUFBakIsR0FBMEIsQ0FBdkMsRUFBMENFLENBQUMsR0FBRyxLQUFLL0IsV0FBbkQsRUFBZ0UrQixDQUFDLEVBQWpFLEVBQXFFO0FBQ25FLFlBQUksS0FBSzlCLFdBQUwsQ0FBaUI4QixDQUFqQixDQUFKLEVBQXlCO0FBQ3ZCRCxVQUFBQSxLQUFLLENBQUNwQixJQUFOLENBQVcsS0FBS1QsV0FBTCxDQUFpQjhCLENBQWpCLENBQVg7QUFDQSxlQUFLOUIsV0FBTCxDQUFpQjhCLENBQWpCLElBQXNCQyxTQUF0QjtBQUNEO0FBQ0Y7O0FBQ0QsV0FBSy9CLFdBQUwsQ0FBaUJnQyxNQUFqQixDQUF3QixLQUFLakMsV0FBTCxHQUFtQixDQUEzQzs7QUFFQSxVQUFJOEIsS0FBSyxDQUFDRCxNQUFOLEdBQWUsQ0FBbkIsRUFBc0I7QUFBQSxtQ0FDWEUsRUFEVztBQUVsQjtBQUNBO0FBQ0EsVUFBQSxNQUFJLENBQUNuQyxNQUFMLENBQVlzQyxLQUFaLENBQWtCO0FBQUEsbUJBQU1KLEtBQUssQ0FBQ0MsRUFBRCxDQUFMLENBQVNuQixZQUFULENBQU47QUFBQSxXQUFsQixFQUFnRCxDQUFoRDtBQUprQjs7QUFDcEIsYUFBSyxJQUFJbUIsRUFBQyxHQUFHLENBQWIsRUFBZ0JBLEVBQUMsR0FBR0QsS0FBSyxDQUFDRCxNQUExQixFQUFrQ0UsRUFBQyxFQUFuQyxFQUF1QztBQUFBLGdCQUE5QkEsRUFBOEI7QUFJdEM7QUFDRjtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBcE1BO0FBQUE7QUFBQSxXQXFNRSxnQkFBT0ksUUFBUCxFQUFpQkMsSUFBakIsRUFBdUI7QUFDckIsVUFBTUMsUUFBUSxHQUFHLElBQUk5RCxRQUFKLEVBQWpCO0FBQ0EsVUFBTytELE9BQVAsR0FBbUNELFFBQW5DLENBQU9DLE9BQVA7QUFBQSxVQUFnQkMsTUFBaEIsR0FBbUNGLFFBQW5DLENBQWdCRSxNQUFoQjtBQUFBLFVBQXdCQyxPQUF4QixHQUFtQ0gsUUFBbkMsQ0FBd0JHLE9BQXhCO0FBRUE7QUFDQSxVQUFNQyxLQUFLLEdBQUcsSUFBSUMsS0FBSixDQUFVLHVCQUF1Qk4sSUFBdkIsR0FBOEIsSUFBeEMsQ0FBZDtBQUNBLFdBQUtsQyxNQUFMLENBQVlRLElBQVosQ0FBaUI7QUFBQ3lCLFFBQUFBLFFBQVEsRUFBUkEsUUFBRDtBQUFXSyxRQUFBQSxPQUFPLEVBQVBBLE9BQVg7QUFBb0JELFFBQUFBLE1BQU0sRUFBTkEsTUFBcEI7QUFBNEJFLFFBQUFBLEtBQUssRUFBTEE7QUFBNUIsT0FBakI7O0FBQ0EsVUFBSSxLQUFLdkMsTUFBTCxDQUFZMkIsTUFBWixJQUFzQixDQUExQixFQUE2QjtBQUMzQixhQUFLYyxNQUFMO0FBQ0Q7O0FBQ0QsYUFBT0wsT0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQXBOQTtBQUFBO0FBQUEsV0FxTkUsa0JBQVM7QUFBQTs7QUFDUCxVQUFJLEtBQUtwQyxNQUFMLENBQVkyQixNQUFaLElBQXNCLENBQTFCLEVBQTZCO0FBQzNCO0FBQ0Q7O0FBRUQsVUFBTWUsSUFBSSxHQUFHLEtBQUsxQyxNQUFMLENBQVksQ0FBWixDQUFiO0FBQ0EsVUFBSW9DLE9BQUo7O0FBQ0EsVUFBSTtBQUNGQSxRQUFBQSxPQUFPLEdBQUdNLElBQUksQ0FBQ1QsUUFBTCxFQUFWO0FBQ0QsT0FGRCxDQUVFLE9BQU9VLENBQVAsRUFBVTtBQUNWUCxRQUFBQSxPQUFPLEdBQUdRLE9BQU8sQ0FBQ1AsTUFBUixDQUFlTSxDQUFmLENBQVY7QUFDRDs7QUFFRFAsTUFBQUEsT0FBTyxDQUNKM0IsSUFESCxDQUVJLFVBQUNvQyxNQUFELEVBQVk7QUFDVkgsUUFBQUEsSUFBSSxDQUFDSixPQUFMLENBQWFPLE1BQWI7QUFDRCxPQUpMLEVBS0ksVUFBQ0MsTUFBRCxFQUFZO0FBQ1ZuRSxRQUFBQSxHQUFHLEdBQUdvRSxLQUFOLENBQVk5RCxJQUFaLEVBQWtCLDJCQUFsQixFQUErQzZELE1BQS9DOztBQUNBO0FBQ0EsWUFBSUosSUFBSSxDQUFDSCxLQUFULEVBQWdCO0FBQ2RHLFVBQUFBLElBQUksQ0FBQ0gsS0FBTCxDQUFXUyxPQUFYLElBQXNCRixNQUF0QjtBQUNBbkUsVUFBQUEsR0FBRyxHQUFHb0UsS0FBTixDQUFZOUQsSUFBWixFQUFrQnlELElBQUksQ0FBQ0gsS0FBdkI7QUFDRDs7QUFDREcsUUFBQUEsSUFBSSxDQUFDTCxNQUFMLENBQVlTLE1BQVo7QUFDRCxPQWJMLEVBZUdyQyxJQWZILENBZVEsWUFBTTtBQUNWLFFBQUEsTUFBSSxDQUFDVCxNQUFMLENBQVkrQixNQUFaLENBQW1CLENBQW5CLEVBQXNCLENBQXRCOztBQUNBLFFBQUEsTUFBSSxDQUFDVSxNQUFMO0FBQ0QsT0FsQkg7QUFtQkQ7QUFyUEg7O0FBQUE7QUFBQTs7QUF3UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNNUSx1Qjs7Ozs7Ozs7QUFDSjtBQUNBLHVCQUFVLENBQUU7QUFFWjtBQUNGO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0UsMkJBQWtCQyxjQUFsQixFQUFrQyxDQUFFO0FBRXBDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0UsY0FBSzVDLGVBQUwsRUFBc0IsQ0FBRTtBQUV4QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztXQUNFLGFBQUk2QyxnQkFBSixFQUFzQixDQUFFO0FBRXhCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0UsaUJBQVE3QyxlQUFSLEVBQXlCLENBQUU7QUFFM0I7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7OztXQUNFLGVBQU0sQ0FBRTtBQUVSO0FBQ0Y7QUFDQTtBQUNBOzs7O1dBQ0UsK0JBQXNCOEMsWUFBdEIsRUFBb0MsQ0FBRTtBQUV0QztBQUNGO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0UsdUJBQWMsQ0FBRTtBQUVoQjtBQUNGO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0Usd0JBQWVDLGNBQWYsRUFBK0IsQ0FBRTs7Ozs7O0FBR25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxzQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLGtDQUFZMUQsR0FBWixFQUFpQjtBQUFBOztBQUFBOztBQUNmO0FBQ0EsU0FBS0EsR0FBTCxHQUFXQSxHQUFYOztBQUVBO0FBQ0EsU0FBS0YsTUFBTCxHQUFjaEIsUUFBUSxDQUFDaUIsUUFBVCxDQUFrQkMsR0FBbEIsQ0FBZDtBQUVBLFFBQU8yRCxPQUFQLEdBQWtCLEtBQUszRCxHQUF2QixDQUFPMkQsT0FBUDs7QUFFQTtBQUNBLFNBQUtDLFdBQUwsR0FBbUJELE9BQU8sQ0FBQzVCLE1BQVIsR0FBaUIsQ0FBcEM7QUFDQSxRQUFNOEIsS0FBSyxHQUFHaEYsZUFBZSxDQUFDOEUsT0FBRCxDQUE3Qjs7QUFDQSxRQUFJRSxLQUFLLElBQUlBLEtBQUssQ0FBQ3ZFLGFBQUQsQ0FBTCxLQUF5QjRDLFNBQXRDLEVBQWlEO0FBQy9DLFdBQUswQixXQUFMLEdBQW1CRSxJQUFJLENBQUNDLEdBQUwsQ0FBU0YsS0FBSyxDQUFDdkUsYUFBRCxDQUFkLEVBQStCLEtBQUtzRSxXQUFwQyxDQUFuQjtBQUNEOztBQUVEO0FBQ0EsU0FBSzFELFdBQUwsR0FBbUIsS0FBSzBELFdBQXhCOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0ksU0FBS0ksYUFBTDs7QUFFQTtBQUNBLFNBQUsxRCxlQUFMLEdBQXVCLElBQXZCO0FBRUE7QUFDQTs7QUFDQTtBQUNBLFNBQUsyRCxjQUFMLEdBQXNCLFdBQVdOLE9BQWpDOztBQUVBO0FBQ0EsU0FBS08saUJBQUwsR0FBeUIsS0FBS0MsYUFBTCxDQUFtQixLQUFLakUsV0FBeEIsQ0FBekI7QUFFQTtBQUNBLFFBQUlrRSxTQUFKLEVBQWVDLFlBQWY7O0FBQ0EsUUFBSVYsT0FBTyxDQUFDUyxTQUFSLElBQXFCVCxPQUFPLENBQUNVLFlBQWpDLEVBQStDO0FBQzdDO0FBQ0EsV0FBS0MsY0FBTCxHQUNFWCxPQUFPLENBQUNZLGlCQUFSLElBQTZCWixPQUFPLENBQUNTLFNBQVIsQ0FBa0I3RCxJQUFsQixDQUF1Qm9ELE9BQXZCLENBRC9COztBQUVBO0FBQ0EsV0FBS2EsaUJBQUwsR0FDRWIsT0FBTyxDQUFDYyxvQkFBUixJQUFnQ2QsT0FBTyxDQUFDVSxZQUFSLENBQXFCOUQsSUFBckIsQ0FBMEJvRCxPQUExQixDQURsQzs7QUFFQVMsTUFBQUEsU0FBUyxHQUFHLG1CQUFDUCxLQUFELEVBQVFhLFNBQVIsRUFBbUJDLE9BQW5CLEVBQStCO0FBQ3pDLFFBQUEsTUFBSSxDQUFDVCxpQkFBTCxHQUF5QkwsS0FBekI7O0FBQ0EsUUFBQSxNQUFJLENBQUNTLGNBQUwsQ0FDRVQsS0FERixFQUVFYSxTQUZGLEVBR0U7QUFDQTtBQUNBQyxRQUFBQSxPQUFPLElBQUksSUFMYjtBQU9ELE9BVEQ7O0FBVUFOLE1BQUFBLFlBQVksR0FBRyxzQkFBQ1IsS0FBRCxFQUFRYSxTQUFSLEVBQW1CQyxPQUFuQixFQUErQjtBQUM1QyxRQUFBLE1BQUksQ0FBQ1QsaUJBQUwsR0FBeUJMLEtBQXpCOztBQUNBO0FBQ0E7QUFDQSxZQUFJYyxPQUFPLEtBQUt6QyxTQUFoQixFQUEyQjtBQUN6QixVQUFBLE1BQUksQ0FBQ3NDLGlCQUFMLENBQXVCWCxLQUF2QixFQUE4QmEsU0FBOUIsRUFBeUNDLE9BQXpDO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsVUFBQSxNQUFJLENBQUNILGlCQUFMLENBQXVCWCxLQUF2QixFQUE4QmEsU0FBOUI7QUFDRDtBQUNGLE9BVEQ7O0FBVUEsVUFBSSxDQUFDZixPQUFPLENBQUNZLGlCQUFiLEVBQWdDO0FBQzlCWixRQUFBQSxPQUFPLENBQUNZLGlCQUFSLEdBQTRCLEtBQUtELGNBQWpDO0FBQ0Q7O0FBQ0QsVUFBSSxDQUFDWCxPQUFPLENBQUNjLG9CQUFiLEVBQW1DO0FBQ2pDZCxRQUFBQSxPQUFPLENBQUNjLG9CQUFSLEdBQStCLEtBQUtELGlCQUFwQztBQUNEO0FBQ0YsS0FqQ0QsTUFpQ087QUFDTEosTUFBQUEsU0FBUyxHQUFHLG1CQUFDUCxLQUFELEVBQVFhLFNBQVIsRUFBbUJDLE9BQW5CLEVBQStCO0FBQ3pDLFFBQUEsTUFBSSxDQUFDVCxpQkFBTCxHQUF5QkwsS0FBekI7QUFDRCxPQUZEOztBQUdBUSxNQUFBQSxZQUFZLEdBQUcsc0JBQUNSLEtBQUQsRUFBUWEsU0FBUixFQUFtQkMsT0FBbkIsRUFBK0I7QUFDNUMsUUFBQSxNQUFJLENBQUNULGlCQUFMLEdBQXlCTCxLQUF6QjtBQUNELE9BRkQ7QUFHRDs7QUFFRDtBQUNBLFNBQUtlLFVBQUwsR0FBa0JSLFNBQWxCOztBQUVBO0FBQ0EsU0FBS1MsYUFBTCxHQUFxQlIsWUFBckI7O0FBRUEsUUFBSTtBQUNGLFdBQUtRLGFBQUwsQ0FDRSxLQUFLVixhQUFMLENBQW1CLEtBQUtqRSxXQUF4QjtBQUFxQztBQUFjLFVBQW5ELENBREY7QUFHRCxLQUpELENBSUUsT0FBTzZDLENBQVAsRUFBVTtBQUNWaEUsTUFBQUEsR0FBRyxHQUFHb0UsS0FBTixDQUFZOUQsSUFBWixFQUFrQixrQ0FBa0MwRCxDQUFDLENBQUNLLE9BQXREO0FBQ0Q7O0FBRURPLElBQUFBLE9BQU8sQ0FBQ1MsU0FBUixHQUFvQixLQUFLVSxpQkFBTCxDQUF1QnZFLElBQXZCLENBQTRCLElBQTVCLENBQXBCO0FBQ0FvRCxJQUFBQSxPQUFPLENBQUNVLFlBQVIsR0FBdUIsS0FBS1Usb0JBQUwsQ0FBMEJ4RSxJQUExQixDQUErQixJQUEvQixDQUF2Qjs7QUFFQSxTQUFLeUUsZ0JBQUwsR0FBd0IsVUFBQ2pDLENBQUQsRUFBTztBQUM3QixVQUFNa0MsS0FBSztBQUFHO0FBQStCbEMsTUFBQUEsQ0FBN0M7QUFDQSxVQUFNYyxLQUFLO0FBQUc7QUFBNEJvQixNQUFBQSxLQUFLLENBQUNwQixLQUFoRDtBQUNBOUUsTUFBQUEsR0FBRyxHQUFHbUcsSUFBTixDQUNFN0YsSUFERixFQUVFLHFCQUNFLE1BQUksQ0FBQ1csR0FBTCxDQUFTMkQsT0FBVCxDQUFpQjVCLE1BRG5CLEdBRUUsSUFGRixHQUdFb0QsSUFBSSxDQUFDQyxTQUFMLENBQWV2QixLQUFmLENBTEo7O0FBT0EsTUFBQSxNQUFJLENBQUN3QixlQUFMO0FBQ0QsS0FYRDs7QUFZQSxTQUFLckYsR0FBTCxDQUFTc0YsZ0JBQVQsQ0FBMEIsVUFBMUIsRUFBc0MsS0FBS04sZ0JBQTNDO0FBQ0Q7O0FBRUQ7QUFwSEY7QUFBQTtBQUFBLFdBcUhFLG1CQUFVO0FBQ1IsVUFBSSxLQUFLVixjQUFULEVBQXlCO0FBQ3ZCLGFBQUt0RSxHQUFMLENBQVMyRCxPQUFULENBQWlCUyxTQUFqQixHQUE2QixLQUFLRSxjQUFsQztBQUNEOztBQUNELFVBQUksS0FBS0UsaUJBQVQsRUFBNEI7QUFDMUIsYUFBS3hFLEdBQUwsQ0FBUzJELE9BQVQsQ0FBaUJVLFlBQWpCLEdBQWdDLEtBQUtHLGlCQUFyQztBQUNEOztBQUNELFdBQUt4RSxHQUFMLENBQVN1RixtQkFBVCxDQUE2QixVQUE3QixFQUF5QyxLQUFLUCxnQkFBOUM7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFwSUE7QUFBQTtBQUFBLFdBcUlFLHVCQUFjakUsVUFBZCxFQUEwQnlFLFdBQTFCLEVBQXVDO0FBQ3JDLFVBQU0zQixLQUFLLEdBQUdqRixHQUFHLENBQUM0RyxXQUFXLEdBQUcsS0FBS0MsU0FBTCxFQUFILEdBQXNCdkQsU0FBbEMsQ0FBakI7QUFDQTJCLE1BQUFBLEtBQUssQ0FBQ3ZFLGFBQUQsQ0FBTCxHQUF1QnlCLFVBQXZCO0FBQ0EsYUFBTzhDLEtBQVA7QUFDRDtBQUVEOztBQTNJRjtBQUFBO0FBQUEsV0E0SUUsMkJBQWtCeEIsUUFBbEIsRUFBNEI7QUFDMUIsV0FBSy9CLGVBQUwsR0FBdUIrQixRQUF2QjtBQUNEO0FBRUQ7O0FBaEpGO0FBQUE7QUFBQSxXQWlKRSxjQUFLM0IsZUFBTCxFQUFzQjtBQUFBOztBQUNwQixhQUFPLEtBQUtnRixVQUFMLENBQWdCLFlBQU07QUFDM0IsWUFBTUMsUUFBUSxHQUFHLE9BQUksQ0FBQ0MsaUJBQUwsQ0FDZixPQUFJLENBQUNILFNBQUwsRUFEZSxFQUVmL0UsZUFBZSxJQUFJLEVBRkosQ0FBakI7O0FBSUEsUUFBQSxPQUFJLENBQUNvRSxpQkFBTCxDQUNFYSxRQURGO0FBRUU7QUFBWXpELFFBQUFBLFNBRmQsRUFHRXlELFFBQVEsQ0FBQ2hFLFFBQVQsR0FBb0IsTUFBTWdFLFFBQVEsQ0FBQ2hFLFFBQW5DLEdBQThDTyxTQUhoRDs7QUFLQSxlQUFPeEQsVUFBVSxDQUFDO0FBQUEsaUJBQ2hCLE9BQUksQ0FBQ2tILGlCQUFMLENBQXVCRCxRQUF2QixFQUFpQztBQUFDNUUsWUFBQUEsVUFBVSxFQUFFLE9BQUksQ0FBQ2I7QUFBbEIsV0FBakMsQ0FEZ0I7QUFBQSxTQUFELENBQWpCO0FBR0QsT0FiTSxDQUFQO0FBY0Q7QUFFRDs7QUFsS0Y7QUFBQTtBQUFBLFdBbUtFLGFBQUlhLFVBQUosRUFBZ0I7QUFBQTs7QUFDZDtBQUNBQSxNQUFBQSxVQUFVLEdBQUcrQyxJQUFJLENBQUMrQixHQUFMLENBQVM5RSxVQUFULEVBQXFCLEtBQUs2QyxXQUExQixDQUFiO0FBQ0EsYUFBTyxLQUFLOEIsVUFBTCxDQUFnQixZQUFNO0FBQzNCLGVBQU8sT0FBSSxDQUFDSSxLQUFMLENBQVcsT0FBSSxDQUFDNUYsV0FBTCxHQUFtQmEsVUFBbkIsR0FBZ0MsQ0FBM0MsQ0FBUDtBQUNELE9BRk0sRUFFSkYsSUFGSSxDQUVDLFVBQUNrRixhQUFELEVBQW1CO0FBQ3pCLGVBQU8sT0FBSSxDQUFDSCxpQkFBTCxDQUF1QixPQUFJLENBQUNILFNBQUwsRUFBdkIsRUFBeUM7QUFDOUMxRSxVQUFBQSxVQUFVLEVBQUVnRjtBQURrQyxTQUF6QyxDQUFQO0FBR0QsT0FOTSxDQUFQO0FBT0Q7QUFFRDs7QUEvS0Y7QUFBQTtBQUFBLFdBZ0xFLGlCQUFRckYsZUFBUixFQUE4QjtBQUFBOztBQUFBLFVBQXRCQSxlQUFzQjtBQUF0QkEsUUFBQUEsZUFBc0IsR0FBSixFQUFJO0FBQUE7O0FBQzVCLGFBQU8sS0FBS2dGLFVBQUwsQ0FBZ0IsWUFBTTtBQUMzQixZQUFNQyxRQUFRLEdBQUcsT0FBSSxDQUFDQyxpQkFBTCxDQUNmLE9BQUksQ0FBQ0gsU0FBTCxFQURlLEVBRWYvRSxlQUFlLElBQUksRUFGSixDQUFqQjs7QUFJQSxZQUFNc0YsR0FBRyxHQUFHLENBQUNMLFFBQVEsQ0FBQ0ssR0FBVCxJQUFnQixFQUFqQixFQUFxQjlFLE9BQXJCLENBQTZCLEtBQTdCLEVBQW9DLEVBQXBDLENBQVo7QUFDQSxZQUFNUyxRQUFRLEdBQUdnRSxRQUFRLENBQUNoRSxRQUFULEdBQW9CLE1BQU1nRSxRQUFRLENBQUNoRSxRQUFuQyxHQUE4QyxFQUEvRDs7QUFDQSxRQUFBLE9BQUksQ0FBQ29ELG9CQUFMLENBQ0VZLFFBREYsRUFFRUEsUUFBUSxDQUFDTSxLQUZYLEVBR0VELEdBQUcsSUFBSXJFLFFBQVAsR0FBa0JxRSxHQUFHLEdBQUdyRSxRQUF4QixHQUFtQ08sU0FIckM7O0FBS0EsZUFBT3hELFVBQVUsQ0FBQztBQUFBLGlCQUNoQixPQUFJLENBQUNrSCxpQkFBTCxDQUF1QkQsUUFBdkIsRUFBaUM7QUFBQzVFLFlBQUFBLFVBQVUsRUFBRSxPQUFJLENBQUNiO0FBQWxCLFdBQWpDLENBRGdCO0FBQUEsU0FBRCxDQUFqQjtBQUdELE9BZk0sQ0FBUDtBQWdCRDtBQUVEOztBQW5NRjtBQUFBO0FBQUEsV0FvTUUsZUFBTTtBQUFBOztBQUNKLGFBQU94QixVQUFVLENBQUM7QUFBQSxlQUNoQixPQUFJLENBQUNrSCxpQkFBTCxDQUF1QixPQUFJLENBQUNILFNBQUwsRUFBdkIsRUFBeUM7QUFDdkMxRSxVQUFBQSxVQUFVLEVBQUUsT0FBSSxDQUFDYjtBQURzQixTQUF6QyxDQURnQjtBQUFBLE9BQUQsQ0FBakI7QUFLRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQS9NQTtBQUFBO0FBQUEsV0FnTkUsZ0JBQU9hLFVBQVAsRUFBbUI7QUFBQTs7QUFDakI7QUFDQUEsTUFBQUEsVUFBVSxHQUFHK0MsSUFBSSxDQUFDK0IsR0FBTCxDQUFTOUUsVUFBVCxFQUFxQixLQUFLNkMsV0FBMUIsQ0FBYjtBQUNBLGFBQU8sS0FBSzhCLFVBQUwsQ0FBZ0IsWUFBTTtBQUMzQixlQUFPLE9BQUksQ0FBQ0ksS0FBTCxDQUFXLE9BQUksQ0FBQzVGLFdBQUwsR0FBbUJhLFVBQTlCLENBQVA7QUFDRCxPQUZNLENBQVA7QUFHRDtBQUVEOztBQXhORjtBQUFBO0FBQUEsV0F5TkUsMkJBQWtCO0FBQ2hCLFVBQUk4QyxLQUFLLEdBQUcsS0FBSzRCLFNBQUwsRUFBWjtBQUNBMUcsTUFBQUEsR0FBRyxHQUFHbUcsSUFBTixDQUNFN0YsSUFERixFQUVFLG9CQUFvQixLQUFLVyxHQUFMLENBQVMyRCxPQUFULENBQWlCNUIsTUFBckMsR0FBOEMsSUFBOUMsR0FBcURvRCxJQUFJLENBQUNDLFNBQUwsQ0FBZXZCLEtBQWYsQ0FGdkQ7QUFJQSxVQUFNOUMsVUFBVSxHQUFHOEMsS0FBSyxHQUFHQSxLQUFLLENBQUN2RSxhQUFELENBQVIsR0FBMEI0QyxTQUFsRDtBQUNBLFVBQUk2RCxhQUFhLEdBQUcsS0FBSzdGLFdBQXpCO0FBQ0EsVUFBTWdHLFlBQVksR0FBRyxLQUFLbEMsYUFBMUI7QUFDQSxXQUFLQSxhQUFMLEdBQXFCOUIsU0FBckI7O0FBRUEsVUFBSTZELGFBQWEsR0FBRyxLQUFLL0YsR0FBTCxDQUFTMkQsT0FBVCxDQUFpQjVCLE1BQWpCLEdBQTBCLENBQTlDLEVBQWlEO0FBQy9DO0FBQ0E7QUFDQWdFLFFBQUFBLGFBQWEsR0FBRyxLQUFLL0YsR0FBTCxDQUFTMkQsT0FBVCxDQUFpQjVCLE1BQWpCLEdBQTBCLENBQTFDO0FBQ0EsYUFBS29FLG1CQUFMLENBQ0UsS0FBS1AsaUJBQUwsQ0FBdUIvQixLQUF2QixFQUE4QjtBQUFDOUMsVUFBQUEsVUFBVSxFQUFFZ0Y7QUFBYixTQUE5QixDQURGO0FBR0Q7O0FBRUQsVUFBSWhGLFVBQVUsSUFBSW1CLFNBQWxCLEVBQTZCO0FBQzNCO0FBQ0E2RCxRQUFBQSxhQUFhLEdBQUdBLGFBQWEsR0FBRyxDQUFoQztBQUNELE9BSEQsTUFHTyxJQUFJaEYsVUFBVSxHQUFHLEtBQUtmLEdBQUwsQ0FBUzJELE9BQVQsQ0FBaUI1QixNQUFsQyxFQUEwQztBQUMvQztBQUNBZ0UsUUFBQUEsYUFBYSxHQUFHaEYsVUFBaEI7QUFDRCxPQUhNLE1BR0E7QUFDTDtBQUNBZ0YsUUFBQUEsYUFBYSxHQUFHLEtBQUsvRixHQUFMLENBQVMyRCxPQUFULENBQWlCNUIsTUFBakIsR0FBMEIsQ0FBMUM7QUFDRDs7QUFFRDtBQUNBLFVBQUksQ0FBQzhCLEtBQUwsRUFBWTtBQUNWQSxRQUFBQSxLQUFLLEdBQUcsRUFBUjtBQUNEOztBQUNEQSxNQUFBQSxLQUFLLENBQUN2RSxhQUFELENBQUwsR0FBdUJ5RyxhQUF2QjtBQUNBLFdBQUtsQixhQUFMLENBQW1CaEIsS0FBbkIsRUFBMEIzQixTQUExQixFQUFxQ0EsU0FBckM7O0FBRUE7QUFDQSxVQUFJNkQsYUFBYSxJQUFJLEtBQUs3RixXQUExQixFQUF1QztBQUNyQyxhQUFLaUcsbUJBQUwsQ0FDRSxLQUFLUCxpQkFBTCxDQUF1Qi9CLEtBQXZCLEVBQThCO0FBQUM5QyxVQUFBQSxVQUFVLEVBQUVnRjtBQUFiLFNBQTlCLENBREY7QUFHRDs7QUFFRDtBQUNBO0FBQ0EsVUFBSUEsYUFBYSxHQUFHLEtBQUtuQyxXQUF6QixFQUFzQztBQUNwQyxhQUFLQSxXQUFMLEdBQW1CbUMsYUFBbkI7QUFDRDs7QUFFRCxVQUFJRyxZQUFKLEVBQWtCO0FBQ2hCQSxRQUFBQSxZQUFZLENBQUN4RCxPQUFiO0FBQ0Q7QUFDRjtBQUVEOztBQWpSRjtBQUFBO0FBQUEsV0FrUkUscUJBQVk7QUFDVixVQUFJLEtBQUt1QixjQUFULEVBQXlCO0FBQ3ZCLGVBQU9wRixlQUFlLENBQUMsS0FBS21CLEdBQUwsQ0FBUzJELE9BQVYsQ0FBdEI7QUFDRDs7QUFDRCxhQUFPLEtBQUtPLGlCQUFaO0FBQ0Q7QUFFRDs7QUF6UkY7QUFBQTtBQUFBLFdBMFJFLHdCQUFlO0FBQ2JsRixNQUFBQSxTQUFTLENBQ1AsQ0FBQyxLQUFLZ0YsYUFEQyxFQUVQLDhDQUZPLENBQVQ7QUFJRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF0U0E7QUFBQTtBQUFBLFdBdVNFLG9CQUFXM0IsUUFBWCxFQUFxQjtBQUNuQixVQUFJLENBQUMsS0FBSzJCLGFBQVYsRUFBeUI7QUFDdkIsZUFBTzNCLFFBQVEsRUFBZjtBQUNEOztBQUNELGFBQU8sS0FBSzJCLGFBQUwsQ0FBbUJ4QixPQUFuQixDQUEyQjNCLElBQTNCLENBQWdDd0IsUUFBaEMsRUFBMENBLFFBQTFDLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQWpUQTtBQUFBO0FBQUEsV0FrVEUsaUJBQVE7QUFDTixXQUFLK0QsWUFBTDtBQUNBLFVBQU03RCxRQUFRLEdBQUcsSUFBSTlELFFBQUosRUFBakI7QUFDQSxVQUFPZ0UsTUFBUCxHQUEwQkYsUUFBMUIsQ0FBT0UsTUFBUDtBQUFBLFVBQWVDLE9BQWYsR0FBMEJILFFBQTFCLENBQWVHLE9BQWY7QUFDQSxVQUFNRixPQUFPLEdBQUcsS0FBSzFDLE1BQUwsQ0FBWXVHLGNBQVosQ0FBMkIsR0FBM0IsRUFBZ0M5RCxRQUFRLENBQUNDLE9BQXpDLENBQWhCO0FBQ0EsV0FBS3dCLGFBQUwsR0FBcUI7QUFBQ3hCLFFBQUFBLE9BQU8sRUFBUEEsT0FBRDtBQUFVRSxRQUFBQSxPQUFPLEVBQVBBLE9BQVY7QUFBbUJELFFBQUFBLE1BQU0sRUFBTkE7QUFBbkIsT0FBckI7QUFDQSxhQUFPRCxPQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE5VEE7QUFBQTtBQUFBLFdBK1RFLGVBQU04RCxLQUFOLEVBQWE7QUFBQTs7QUFDWCxXQUFLRixZQUFMOztBQUNBLFVBQUlFLEtBQUssSUFBSSxDQUFiLEVBQWdCO0FBQ2QsZUFBT3RELE9BQU8sQ0FBQ04sT0FBUixDQUFnQixLQUFLeEMsV0FBckIsQ0FBUDtBQUNEOztBQUNELFdBQUtnRSxpQkFBTCxHQUF5QixLQUFLQyxhQUFMLENBQW1CLEtBQUtqRSxXQUFMLEdBQW1Cb0csS0FBdEMsQ0FBekI7QUFDQSxVQUFNOUQsT0FBTyxHQUFHLEtBQUsrRCxLQUFMLEVBQWhCO0FBQ0EsV0FBS3ZHLEdBQUwsQ0FBUzJELE9BQVQsQ0FBaUI2QyxFQUFqQixDQUFvQixDQUFDRixLQUFyQjtBQUNBLGFBQU85RCxPQUFPLENBQUMzQixJQUFSLENBQWEsWUFBTTtBQUN4QixlQUFPbUMsT0FBTyxDQUFDTixPQUFSLENBQWdCLE9BQUksQ0FBQ3hDLFdBQXJCLENBQVA7QUFDRCxPQUZNLENBQVA7QUFHRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFqVkE7QUFBQTtBQUFBLFdBa1ZFLDJCQUFrQjJELEtBQWxCLEVBQXlCb0MsS0FBekIsRUFBZ0NELEdBQWhDLEVBQXFDO0FBQ25DLFdBQUtJLFlBQUw7O0FBQ0EsVUFBSSxDQUFDdkMsS0FBTCxFQUFZO0FBQ1ZBLFFBQUFBLEtBQUssR0FBRyxFQUFSO0FBQ0Q7O0FBQ0QsVUFBSTlDLFVBQVUsR0FBRyxLQUFLYixXQUFMLEdBQW1CLENBQXBDO0FBQ0EyRCxNQUFBQSxLQUFLLENBQUN2RSxhQUFELENBQUwsR0FBdUJ5QixVQUF2QjtBQUNBLFdBQUs2RCxVQUFMLENBQWdCZixLQUFoQixFQUF1Qm9DLEtBQXZCLEVBQThCRCxHQUE5Qjs7QUFDQSxVQUFJakYsVUFBVSxJQUFJLEtBQUtmLEdBQUwsQ0FBUzJELE9BQVQsQ0FBaUI1QixNQUFqQixHQUEwQixDQUE1QyxFQUErQztBQUM3Q2hCLFFBQUFBLFVBQVUsR0FBRyxLQUFLZixHQUFMLENBQVMyRCxPQUFULENBQWlCNUIsTUFBakIsR0FBMEIsQ0FBdkM7QUFDQThCLFFBQUFBLEtBQUssQ0FBQ3ZFLGFBQUQsQ0FBTCxHQUF1QnlCLFVBQXZCO0FBQ0EsYUFBSzhELGFBQUwsQ0FBbUJoQixLQUFuQjtBQUNEOztBQUNELFVBQU04QixRQUFRLEdBQUcsS0FBS0MsaUJBQUw7QUFDZjtBQUFpQy9CLE1BQUFBLEtBRGxCLEVBRWY7QUFBQzlDLFFBQUFBLFVBQVUsRUFBVkE7QUFBRCxPQUZlLENBQWpCO0FBSUEsV0FBS29GLG1CQUFMLENBQXlCUixRQUF6QjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFoWEE7QUFBQTtBQUFBLFdBaVhFLCtCQUFzQnRFLE1BQXRCLEVBQThCO0FBQUE7O0FBQzVCckMsTUFBQUEsU0FBUyxDQUFDcUMsTUFBTSxDQUFDLENBQUQsQ0FBTixJQUFhLEdBQWQsRUFBbUIsOEJBQW5CLENBQVQ7QUFDQSxXQUFLcUUsVUFBTCxDQUFnQixZQUFNO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFBLE9BQUksQ0FBQzFGLEdBQUwsQ0FBU3VGLG1CQUFULENBQTZCLFVBQTdCLEVBQXlDLE9BQUksQ0FBQ1AsZ0JBQTlDOztBQUNBLFlBQUk7QUFDRjtBQUNBO0FBQ0EsVUFBQSxPQUFJLENBQUNoRixHQUFMLENBQVN1QixRQUFULENBQWtCTCxPQUFsQixDQUEwQkcsTUFBMUI7QUFDRCxTQUpELFNBSVU7QUFDUixVQUFBLE9BQUksQ0FBQ3JCLEdBQUwsQ0FBU3NGLGdCQUFULENBQTBCLFVBQTFCLEVBQXNDLE9BQUksQ0FBQ04sZ0JBQTNDO0FBQ0Q7O0FBQ0QsUUFBQSxPQUFJLENBQUNELG9CQUFMOztBQUNBLGVBQU8sbUJBQVA7QUFDRCxPQWhCRDtBQWlCRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUEzWUE7QUFBQTtBQUFBLFdBNFlFLDhCQUFxQmxCLEtBQXJCLEVBQTRCb0MsS0FBNUIsRUFBbUNELEdBQW5DLEVBQXdDO0FBQ3RDLFdBQUtJLFlBQUw7O0FBQ0EsVUFBSSxDQUFDdkMsS0FBTCxFQUFZO0FBQ1ZBLFFBQUFBLEtBQUssR0FBRyxFQUFSO0FBQ0Q7O0FBQ0QsVUFBTTlDLFVBQVUsR0FBRytDLElBQUksQ0FBQ0MsR0FBTCxDQUFTLEtBQUs3RCxXQUFkLEVBQTJCLEtBQUtGLEdBQUwsQ0FBUzJELE9BQVQsQ0FBaUI1QixNQUFqQixHQUEwQixDQUFyRCxDQUFuQjtBQUNBOEIsTUFBQUEsS0FBSyxDQUFDdkUsYUFBRCxDQUFMLEdBQXVCeUIsVUFBdkI7QUFDQSxXQUFLOEQsYUFBTCxDQUFtQmhCLEtBQW5CLEVBQTBCb0MsS0FBMUIsRUFBaUNELEdBQWpDO0FBQ0EsVUFBTUwsUUFBUSxHQUFHLEtBQUtDLGlCQUFMO0FBQ2Y7QUFBaUMvQixNQUFBQSxLQURsQixFQUVmO0FBQUM5QyxRQUFBQSxVQUFVLEVBQVZBO0FBQUQsT0FGZSxDQUFqQjtBQUlBLFdBQUtvRixtQkFBTCxDQUF5QlIsUUFBekI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTlaQTtBQUFBO0FBQUEsV0ErWkUsNkJBQW9CN0UsWUFBcEIsRUFBa0M7QUFDaEMsV0FBS3NGLFlBQUw7QUFDQXRGLE1BQUFBLFlBQVksQ0FBQ0MsVUFBYixHQUEwQitDLElBQUksQ0FBQ0MsR0FBTCxDQUN4QmpELFlBQVksQ0FBQ0MsVUFEVyxFQUV4QixLQUFLZixHQUFMLENBQVMyRCxPQUFULENBQWlCNUIsTUFBakIsR0FBMEIsQ0FGRixDQUExQjs7QUFJQSxVQUFJLEtBQUs3QixXQUFMLElBQW9CWSxZQUFZLENBQUNDLFVBQXJDLEVBQWlEO0FBQy9DaEMsUUFBQUEsR0FBRyxHQUFHbUcsSUFBTixDQUNFN0YsSUFERixFQUVFLDBCQUNFLEtBQUthLFdBRFAsR0FFRSxNQUZGLEdBR0VZLFlBQVksQ0FBQ0MsVUFMakI7QUFPQSxhQUFLYixXQUFMLEdBQW1CWSxZQUFZLENBQUNDLFVBQWhDOztBQUNBLFlBQUksS0FBS1QsZUFBVCxFQUEwQjtBQUN4QixlQUFLQSxlQUFMLENBQXFCUSxZQUFyQjtBQUNEO0FBQ0Y7QUFDRjtBQUVEOztBQXBiRjtBQUFBO0FBQUEsV0FxYkUsdUJBQWM7QUFDWixVQUFLVSxJQUFMLEdBQWEsS0FBS3hCLEdBQUwsQ0FBU3VCLFFBQXRCLENBQUtDLElBQUw7O0FBQ0E7QUFDQUEsTUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNJLE1BQUwsQ0FBWSxDQUFaLENBQVA7QUFDQSxhQUFPb0IsT0FBTyxDQUFDTixPQUFSLENBQWdCbEIsSUFBaEIsQ0FBUDtBQUNEO0FBRUQ7O0FBNWJGO0FBQUE7QUFBQSxXQTZiRSx3QkFBZUcsUUFBZixFQUF5QjtBQUN2QixhQUFPLEtBQUtULE9BQUwsQ0FBYTtBQUFDUyxRQUFBQSxRQUFRLEVBQVJBO0FBQUQsT0FBYixDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXJjQTtBQUFBO0FBQUEsV0FzY0UsMkJBQWtCa0MsS0FBbEIsRUFBeUI0QyxNQUF6QixFQUFpQztBQUMvQixVQUFNQyxVQUFVO0FBQUc7QUFBSCxtQkFDVDdDLEtBQUssSUFBSUEsS0FBSyxDQUFDOEMsSUFBaEIsSUFBeUIsRUFEZixFQUVWRixNQUFNLENBQUNFLElBQVAsSUFBZSxFQUZMLENBQWhCOztBQUlBO0FBQU87QUFBUCxxQkFDTTlDLEtBQUssSUFBSSxFQURmLEVBRUs0QyxNQUZMO0FBR0VFLFVBQUFBLElBQUksRUFBRUQ7QUFIUjtBQUFBO0FBS0Q7QUFoZEg7O0FBQUE7QUFBQTs7QUFtZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUUsc0JBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNFLGtDQUFZNUcsR0FBWixFQUFpQjZHLE1BQWpCLEVBQXlCO0FBQUE7O0FBQUE7O0FBQ3ZCO0FBQ0EsU0FBSzdHLEdBQUwsR0FBV0EsR0FBWDs7QUFFQTtBQUNBLFNBQUs4RyxPQUFMLEdBQWVELE1BQWY7O0FBRUE7QUFDQSxTQUFLM0csV0FBTCxHQUFtQixDQUFuQjs7QUFFQTtBQUNBLFNBQUtJLGVBQUwsR0FBdUIsSUFBdkI7O0FBRUE7QUFDQSxTQUFLeUcsd0JBQUwsR0FBZ0MsS0FBS0QsT0FBTCxDQUFhRSxTQUFiLENBQzlCLGVBRDhCLEVBRTlCLFVBQUNMLElBQUQ7QUFBQSxhQUFVLE9BQUksQ0FBQ00sZ0JBQUwsQ0FBc0JOLElBQXRCLENBQVY7QUFBQSxLQUY4QixDQUFoQztBQUlEOztBQUVEO0FBekJGO0FBQUE7QUFBQSxXQTBCRSwrQkFBc0J0RixNQUF0QixFQUE4QjtBQUM1QnJDLE1BQUFBLFNBQVMsQ0FBQ3FDLE1BQU0sQ0FBQyxDQUFELENBQU4sSUFBYSxHQUFkLEVBQW1CLDhCQUFuQixDQUFUO0FBQ0EsV0FBS3JCLEdBQUwsQ0FBU3VCLFFBQVQsQ0FBa0JMLE9BQWxCLENBQTBCRyxNQUExQjtBQUNEO0FBRUQ7O0FBL0JGO0FBQUE7QUFBQSxXQWdDRSxtQkFBVTtBQUNSLFdBQUswRix3QkFBTDtBQUNEO0FBRUQ7O0FBcENGO0FBQUE7QUFBQSxXQXFDRSwyQkFBa0IxRSxRQUFsQixFQUE0QjtBQUMxQixXQUFLL0IsZUFBTCxHQUF1QitCLFFBQXZCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFsREE7QUFBQTtBQUFBLFdBbURFLHlCQUFnQjZFLGlCQUFoQixFQUFtQ0MsYUFBbkMsRUFBa0RDLE9BQWxELEVBQTJEO0FBQ3pELFVBQUksS0FBS0MsZUFBTCxDQUFxQkgsaUJBQXJCLENBQUosRUFBNkM7QUFDM0M7QUFBTztBQUFpQ0EsVUFBQUE7QUFBeEM7QUFDRCxPQUZELE1BRU87QUFDTG5JLFFBQUFBLEdBQUcsR0FBR3VJLElBQU4sQ0FDRWpJLElBREYsRUFFRSwrQkFGRixFQUdFK0gsT0FIRixFQUlFRixpQkFKRjtBQU1EOztBQUNELGFBQU9DLGFBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXBFQTtBQUFBO0FBQUEsV0FxRUUseUJBQWdCRCxpQkFBaEIsRUFBbUM7QUFDakMsYUFBTyxDQUFDLENBQUNBLGlCQUFGLElBQXVCQSxpQkFBaUIsQ0FBQyxZQUFELENBQWpCLEtBQW9DaEYsU0FBbEU7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaEZBO0FBQUE7QUFBQSxXQWlGRSxjQUFLeEIsZUFBTCxFQUFzQjtBQUFBOztBQUNwQixVQUFNMEMsT0FBTztBQUFHO0FBQUg7QUFDWCxzQkFBYyxLQUFLbEQsV0FBTCxHQUFtQjtBQUR0QixTQUVQUSxlQUFlLElBQUksRUFGWixDQUFiOztBQUlBLFVBQU1FLElBQUksR0FBRyxhQUFiO0FBQ0EsYUFBTyxLQUFLa0csT0FBTCxDQUNKUyx3QkFESSxDQUNxQjNHLElBRHJCLEVBQzJCd0MsT0FEM0IsRUFFSnZDLElBRkksQ0FFQyxVQUFDMkcsUUFBRCxFQUFjO0FBQ2xCLFlBQU1MLGFBQWE7QUFBRztBQUFpQy9ELFFBQUFBLE9BQXZEOztBQUNBLFlBQU11QyxRQUFRLEdBQUcsT0FBSSxDQUFDOEIsZUFBTCxDQUFxQkQsUUFBckIsRUFBK0JMLGFBQS9CLEVBQThDdkcsSUFBOUMsQ0FBakI7O0FBQ0EsUUFBQSxPQUFJLENBQUN1RixtQkFBTCxDQUF5QlIsUUFBekI7O0FBQ0EsZUFBT0EsUUFBUDtBQUNELE9BUEksQ0FBUDtBQVFEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF4R0E7QUFBQTtBQUFBLFdBeUdFLGFBQUk1RSxVQUFKLEVBQWdCO0FBQUE7O0FBQ2QsVUFBSUEsVUFBVSxHQUFHLEtBQUtiLFdBQXRCLEVBQW1DO0FBQ2pDLGVBQU8sS0FBS2lCLEdBQUwsRUFBUDtBQUNEOztBQUNELFVBQU1pQyxPQUFPLEdBQUd6RSxJQUFJLENBQUM7QUFBQyxzQkFBYyxLQUFLdUI7QUFBcEIsT0FBRCxDQUFwQjtBQUNBLFVBQU1lLEdBQUcsR0FBRyxZQUFaO0FBQ0EsYUFBTyxLQUFLNkYsT0FBTCxDQUNKUyx3QkFESSxDQUNxQnRHLEdBRHJCLEVBQzBCbUMsT0FEMUIsRUFFSnZDLElBRkksQ0FFQyxVQUFDMkcsUUFBRCxFQUFjO0FBQ2xCLFlBQU1MLGFBQWE7QUFBRztBQUNwQnhJLFFBQUFBLElBQUksQ0FBQztBQUNILHdCQUFjLE9BQUksQ0FBQ3VCLFdBQUwsR0FBbUI7QUFEOUIsU0FBRCxDQUROOztBQUtBLFlBQU15RixRQUFRLEdBQUcsT0FBSSxDQUFDOEIsZUFBTCxDQUFxQkQsUUFBckIsRUFBK0JMLGFBQS9CLEVBQThDbEcsR0FBOUMsQ0FBakI7O0FBQ0EsUUFBQSxPQUFJLENBQUNrRixtQkFBTCxDQUF5QlIsUUFBekI7O0FBQ0EsZUFBT0EsUUFBUDtBQUNELE9BWEksQ0FBUDtBQVlEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFwSUE7QUFBQTtBQUFBLFdBcUlFLGlCQUFRakYsZUFBUixFQUF5QjtBQUFBOztBQUN2QixVQUFJQSxlQUFlLElBQUlBLGVBQWUsQ0FBQ3NGLEdBQXZDLEVBQTRDO0FBQzFDLFlBQUksQ0FBQyxLQUFLYyxPQUFMLENBQWFZLGFBQWIsQ0FBMkIsb0JBQTNCLENBQUwsRUFBdUQ7QUFDckQ7QUFDQTtBQUNBLGNBQU1DLFFBQVE7QUFBRztBQUNmaEosVUFBQUEsSUFBSSxDQUFDO0FBQ0gsMEJBQWMsS0FBS3VCO0FBRGhCLFdBQUQsQ0FETjtBQUtBLGlCQUFPOEMsT0FBTyxDQUFDTixPQUFSLENBQWdCaUYsUUFBaEIsQ0FBUDtBQUNEOztBQUVEO0FBQ0EsWUFBTTNCLEdBQUcsR0FBR3RGLGVBQWUsQ0FBQ3NGLEdBQWhCLENBQW9COUUsT0FBcEIsQ0FBNEIsS0FBNUIsRUFBbUMsRUFBbkMsQ0FBWjtBQUNBUixRQUFBQSxlQUFlLENBQUNzRixHQUFoQixHQUFzQkEsR0FBdEI7QUFDRDs7QUFFRCxVQUFNNUMsT0FBTztBQUFHO0FBQUg7QUFDWCxzQkFBYyxLQUFLbEQ7QUFEUixTQUVQUSxlQUFlLElBQUksRUFGWixDQUFiOztBQUlBLFVBQU1RLE9BQU8sR0FBRyxnQkFBaEI7QUFDQSxhQUFPLEtBQUs0RixPQUFMLENBQ0pTLHdCQURJLENBQ3FCckcsT0FEckIsRUFDOEJrQyxPQUQ5QjtBQUN1QztBQUFtQixVQUQxRCxFQUVKdkMsSUFGSSxDQUVDLFVBQUMyRyxRQUFELEVBQWM7QUFDbEIsWUFBTUwsYUFBYTtBQUFHO0FBQWlDL0QsUUFBQUEsT0FBdkQ7O0FBQ0EsWUFBTXVDLFFBQVEsR0FBRyxPQUFJLENBQUM4QixlQUFMLENBQXFCRCxRQUFyQixFQUErQkwsYUFBL0IsRUFBOENqRyxPQUE5QyxDQUFqQjs7QUFDQSxRQUFBLE9BQUksQ0FBQ2lGLG1CQUFMLENBQXlCUixRQUF6Qjs7QUFDQSxlQUFPQSxRQUFQO0FBQ0QsT0FQSSxDQUFQO0FBUUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF6S0E7QUFBQTtBQUFBLFdBMEtFLGVBQU07QUFDSjtBQUNBLGFBQU8zQyxPQUFPLENBQUNOLE9BQVI7QUFDTDtBQUFpQztBQUMvQmlFLFFBQUFBLElBQUksRUFBRXpFLFNBRHlCO0FBRS9CUCxRQUFBQSxRQUFRLEVBQUUsRUFGcUI7QUFHL0JaLFFBQUFBLFVBQVUsRUFBRSxLQUFLYixXQUhjO0FBSS9CK0YsUUFBQUEsS0FBSyxFQUFFO0FBSndCLE9BRDVCLENBQVA7QUFRRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE5TEE7QUFBQTtBQUFBLFdBK0xFLDBCQUFpQlUsSUFBakIsRUFBdUI7QUFDckIsVUFBSUEsSUFBSSxDQUFDLGVBQUQsQ0FBSixLQUEwQnpFLFNBQTlCLEVBQXlDO0FBQ3ZDeUUsUUFBQUEsSUFBSSxDQUFDLFlBQUQsQ0FBSixHQUFxQkEsSUFBSSxDQUFDLGVBQUQsQ0FBekI7QUFDRDs7QUFDRCxVQUFJLEtBQUtVLGVBQUwsQ0FBcUJWLElBQXJCLENBQUosRUFBZ0M7QUFDOUIsYUFBS1IsbUJBQUw7QUFBeUI7QUFBaUNRLFFBQUFBLElBQTFEO0FBQ0QsT0FGRCxNQUVPO0FBQ0w1SCxRQUFBQSxHQUFHLEdBQUd1SSxJQUFOLENBQVdqSSxJQUFYLEVBQWlCLDBDQUFqQixFQUE2RHNILElBQTdEO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTdNQTtBQUFBO0FBQUEsV0E4TUUsNkJBQW9COUMsS0FBcEIsRUFBMkI7QUFDekIsVUFBTzlDLFVBQVAsR0FBcUI4QyxLQUFyQixDQUFPOUMsVUFBUDs7QUFDQSxVQUFJLEtBQUtiLFdBQUwsSUFBb0JhLFVBQXhCLEVBQW9DO0FBQ2xDaEMsUUFBQUEsR0FBRyxHQUFHbUcsSUFBTixDQUFXN0YsSUFBWCxtQkFBZ0MsS0FBS2EsV0FBckMsWUFBdURhLFVBQXZEO0FBQ0EsYUFBS2IsV0FBTCxHQUFtQmEsVUFBbkI7O0FBQ0EsWUFBSSxLQUFLVCxlQUFULEVBQTBCO0FBQ3hCLGVBQUtBLGVBQUwsQ0FBcUJ1RCxLQUFyQjtBQUNEO0FBQ0Y7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaE9BO0FBQUE7QUFBQSxXQWlPRSx1QkFBYztBQUNaLFVBQUksQ0FBQyxLQUFLaUQsT0FBTCxDQUFhWSxhQUFiLENBQTJCLFVBQTNCLENBQUwsRUFBNkM7QUFDM0MsZUFBTzFFLE9BQU8sQ0FBQ04sT0FBUixDQUFnQixFQUFoQixDQUFQO0FBQ0Q7O0FBQ0QsYUFBTyxLQUFLb0UsT0FBTCxDQUNKUyx3QkFESSxDQUVILGFBRkcsRUFHSHJGLFNBSEc7QUFJSDtBQUFtQixVQUpoQixFQU1KckIsSUFOSSxDQU1DLFVBQUM4RixJQUFELEVBQVU7QUFDZCxZQUFJLENBQUNBLElBQUwsRUFBVztBQUNULGlCQUFPLEVBQVA7QUFDRDs7QUFDRCxZQUFJbkYsSUFBSSxHQUFHekMsR0FBRyxHQUFHNkksWUFBTixDQUFtQmpCLElBQW5CLENBQVg7O0FBQ0E7QUFDQSxZQUFJbkYsSUFBSSxDQUFDLENBQUQsQ0FBSixJQUFXLEdBQWYsRUFBb0I7QUFDbEJBLFVBQUFBLElBQUksR0FBR0EsSUFBSSxDQUFDSSxNQUFMLENBQVksQ0FBWixDQUFQO0FBQ0Q7O0FBQ0QsZUFBT0osSUFBUDtBQUNELE9BaEJJLENBQVA7QUFpQkQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQS9QQTtBQUFBO0FBQUEsV0FnUUUsd0JBQWVHLFFBQWYsRUFBeUI7QUFDdkIsVUFBSSxDQUFDLEtBQUttRixPQUFMLENBQWFZLGFBQWIsQ0FBMkIsVUFBM0IsQ0FBTCxFQUE2QztBQUMzQyxlQUFPLG1CQUFQO0FBQ0Q7O0FBQ0Q7QUFBTztBQUNMLGFBQUtaLE9BQUwsQ0FBYVMsd0JBQWIsQ0FDRSxnQkFERixFQUVFNUksSUFBSSxDQUFDO0FBQUMsc0JBQVlnRDtBQUFiLFNBQUQsQ0FGTjtBQUdFO0FBQW1CLFlBSHJCO0FBREY7QUFPRDtBQTNRSDs7QUFBQTtBQUFBOztBQThRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU2tHLGFBQVQsQ0FBdUJsSSxNQUF2QixFQUErQjtBQUM3QixNQUFNa0gsTUFBTSxHQUFHL0gsUUFBUSxDQUFDZ0osWUFBVCxDQUFzQm5JLE1BQXRCLENBQWY7QUFDQSxNQUFJQyxPQUFKOztBQUNBLE1BQ0VpSCxNQUFNLENBQUNrQixpQkFBUCxNQUNBOUksT0FBTyxDQUFDVSxNQUFNLENBQUNLLEdBQVIsQ0FBUCxDQUFvQmdJLElBRHBCLElBRUFySSxNQUFNLENBQUNLLEdBQVAsQ0FBV2lJLGlCQUhiLEVBSUU7QUFDQXJJLElBQUFBLE9BQU8sR0FBRyxJQUFJZ0gsc0JBQUosQ0FBMkJqSCxNQUFNLENBQUNLLEdBQWxDLEVBQXVDNkcsTUFBdkMsQ0FBVjtBQUNELEdBTkQsTUFNTztBQUNMO0FBQ0E7QUFDQTFILElBQUFBLHNCQUFzQixDQUNwQlEsTUFBTSxDQUFDSyxHQURhLEVBRXBCLHdCQUZvQixFQUdwQjBELHNCQUhvQixDQUF0QjtBQUtBOUQsSUFBQUEsT0FBTyxHQUFHVixVQUFVLENBQUNTLE1BQU0sQ0FBQ0ssR0FBUixFQUFhLHdCQUFiLENBQXBCO0FBQ0Q7O0FBQ0QsU0FBTyxJQUFJTixPQUFKLENBQVlDLE1BQVosRUFBb0JDLE9BQXBCLENBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNzSSwyQkFBVCxDQUFxQ3ZJLE1BQXJDLEVBQTZDO0FBQ2xEUCxFQUFBQSw0QkFBNEIsQ0FBQ08sTUFBRCxFQUFTLFNBQVQsRUFBb0JrSSxhQUFwQixDQUE1QjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7RGVmZXJyZWQsIHRyeVJlc29sdmV9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7ZGljdCwgbWFwfSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtnZXRIaXN0b3J5U3RhdGV9IGZyb20gJyNjb3JlL3dpbmRvdy9oaXN0b3J5JztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0fSBmcm9tICcuLi9sb2cnO1xuaW1wb3J0IHtnZXRNb2RlfSBmcm9tICcuLi9tb2RlJztcbmltcG9ydCB7XG4gIGdldFNlcnZpY2UsXG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXIsXG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MsXG59IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBR18gPSAnSGlzdG9yeSc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IEhJU1RPUllfUFJPUF8gPSAnQU1QLkhpc3RvcnknO1xuXG4vKiogQHR5cGVkZWYge251bWJlcn0gKi9cbmxldCBIaXN0b3J5SWREZWY7XG5cbi8qKlxuICogQHR5cGVkZWYge3tzdGFja0luZGV4OiBIaXN0b3J5SWREZWYsIHRpdGxlOiBzdHJpbmcsIGZyYWdtZW50OiBzdHJpbmcsIGRhdGE6ICghSnNvbk9iamVjdHx1bmRlZmluZWQpfX1cbiAqL1xubGV0IEhpc3RvcnlTdGF0ZURlZjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e3RpdGxlOiAoc3RyaW5nfHVuZGVmaW5lZCksIGZyYWdtZW50OiAoc3RyaW5nfHVuZGVmaW5lZCksIHVybDogKHN0cmluZ3x1bmRlZmluZWQpLCBjYW5vbmljYWxVcmw6IChzdHJpbmd8dW5kZWZpbmVkKSwgZGF0YTogKCFKc29uT2JqZWN0fHVuZGVmaW5lZCl9fVxuICovXG5sZXQgSGlzdG9yeVN0YXRlVXBkYXRlRGVmO1xuXG4vKipcbiAqIFdyYXBzIHRoZSBicm93c2VyJ3MgSGlzdG9yeSBBUEkgZm9yIHZpZXdlciBzdXBwb3J0IGFuZCBuZWNlc3NhcnkgcG9seWZpbGxzLlxuICovXG5leHBvcnQgY2xhc3MgSGlzdG9yeSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqIEBwYXJhbSB7IUhpc3RvcnlCaW5kaW5nSW50ZXJmYWNlfSBiaW5kaW5nXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MsIGJpbmRpbmcpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2NfID0gYW1wZG9jO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4uL3NlcnZpY2UvdGltZXItaW1wbC5UaW1lcn0gKi9cbiAgICB0aGlzLnRpbWVyXyA9IFNlcnZpY2VzLnRpbWVyRm9yKGFtcGRvYy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUhpc3RvcnlCaW5kaW5nSW50ZXJmYWNlfSAqL1xuICAgIHRoaXMuYmluZGluZ18gPSBiaW5kaW5nO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5zdGFja0luZGV4XyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUgeyFBcnJheTwhRnVuY3Rpb258dW5kZWZpbmVkPn0gKi9cbiAgICB0aGlzLnN0YWNrT25Qb3BfID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSB7IUFycmF5PCF7XG4gICAgICogICBjYWxsYmFjazogZnVuY3Rpb24oKTohUHJvbWlzZSxcbiAgICAgKiAgIHJlc29sdmU6ICFGdW5jdGlvbixcbiAgICAgKiAgIHJlamVjdDogIUZ1bmN0aW9uLFxuICAgICAqICAgdHJhY2U6ICghRXJyb3J8dW5kZWZpbmVkKVxuICAgICAqIH0+fSAqL1xuICAgIHRoaXMucXVldWVfID0gW107XG5cbiAgICB0aGlzLmJpbmRpbmdfLnNldE9uU3RhdGVVcGRhdGVkKHRoaXMub25TdGF0ZVVwZGF0ZWRfLmJpbmQodGhpcykpO1xuICB9XG5cbiAgLyoqIEB2aXNpYmxlRm9yVGVzdGluZyAqL1xuICBjbGVhbnVwKCkge1xuICAgIHRoaXMuYmluZGluZ18uY2xlYW51cCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyBuZXcgc3RhdGUgaW50byBoaXN0b3J5IHN0YWNrIHdpdGggYW4gb3B0aW9uYWwgY2FsbGJhY2sgdG8gYmUgY2FsbGVkXG4gICAqIHdoZW4gdGhpcyBzdGF0ZSBpcyBwb3BwZWQgYXMgd2VsbCBhcyBhbiBvYmplY3Qgd2l0aCB1cGRhdGVzIHRvIGJlIGFwcGxpZWRcbiAgICogdG8gdGhlIHN0YXRlLlxuICAgKiBAcGFyYW0geyFGdW5jdGlvbj19IG9wdF9vblBvcFxuICAgKiBAcGFyYW0geyFIaXN0b3J5U3RhdGVVcGRhdGVEZWY9fSBvcHRfc3RhdGVVcGRhdGVcbiAgICogQHJldHVybiB7IVByb21pc2U8IUhpc3RvcnlJZERlZj59XG4gICAqL1xuICBwdXNoKG9wdF9vblBvcCwgb3B0X3N0YXRlVXBkYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5xdWVfKCgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmJpbmRpbmdfLnB1c2gob3B0X3N0YXRlVXBkYXRlKS50aGVuKChoaXN0b3J5U3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5vblN0YXRlVXBkYXRlZF8oaGlzdG9yeVN0YXRlKTtcbiAgICAgICAgaWYgKG9wdF9vblBvcCkge1xuICAgICAgICAgIHRoaXMuc3RhY2tPblBvcF9baGlzdG9yeVN0YXRlLnN0YWNrSW5kZXhdID0gb3B0X29uUG9wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaXN0b3J5U3RhdGUuc3RhY2tJbmRleDtcbiAgICAgIH0pO1xuICAgIH0sICdwdXNoJyk7XG4gIH1cblxuICAvKipcbiAgICogUG9wcyBhIHByZXZpb3VzbHkgcHVzaGVkIHN0YXRlIGZyb20gdGhlIGhpc3Rvcnkgc3RhY2suIElmIG9uUG9wIGNhbGxiYWNrXG4gICAqIGhhcyBiZWVuIHJlZ2lzdGVyZWQsIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIHN0YXRlIHRoYXQgd2FzIGFzc29jaWF0ZWRcbiAgICogd2l0aCB0aGUgbmV3IGhlYWQgc3RhdGUgd2l0aGluIHRoZSBoaXN0b3J5IHN0YWNrLiBBbGwgc3RhdGVzIGNvbWluZ1xuICAgKiBhZnRlciB0aGUgc3VwcGxpZWQgc3RhdGUgd2lsbCBhbHNvIGJlIHBvcHBlZCwgYW5kIHRoZWlyXG4gICAqIGNhbGxiYWNrcyBleGVjdXRlZCBpbiB0aGUgc2FtZSBmYXNoaW9uLlxuICAgKiBAcGFyYW0geyFIaXN0b3J5SWREZWZ9IHN0YXRlSWRcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBwb3Aoc3RhdGVJZCkge1xuICAgIHJldHVybiB0aGlzLmVucXVlXygoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5iaW5kaW5nXy5wb3Aoc3RhdGVJZCkudGhlbigoaGlzdG9yeVN0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMub25TdGF0ZVVwZGF0ZWRfKGhpc3RvcnlTdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9LCAncG9wJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIGN1cnJlbnQgc3RhdGUsIG9wdGlvbmFsbHkgc3BlY2lmeWluZyB1cGRhdGVzIHRvIHRoZSBzdGF0ZVxuICAgKiBvYmplY3QgdG8gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSByZXBsYWNlbWVudC5cbiAgICogQHBhcmFtIHshSGlzdG9yeVN0YXRlVXBkYXRlRGVmPX0gb3B0X3N0YXRlVXBkYXRlXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgcmVwbGFjZShvcHRfc3RhdGVVcGRhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5lbnF1ZV8oKCkgPT4gdGhpcy5iaW5kaW5nXy5yZXBsYWNlKG9wdF9zdGF0ZVVwZGF0ZSksICdyZXBsYWNlJyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHN0YXRlLCBjb250YWluaW5nIHRoZSBjdXJyZW50IGZyYWdtZW50LCB0aXRsZSxcbiAgICogYW5kIGFtcC1iaW5kIHN0YXRlLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhSGlzdG9yeVN0YXRlRGVmPn1cbiAgICovXG4gIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbnF1ZV8oKCkgPT4gdGhpcy5iaW5kaW5nXy5nZXQoKSwgJ2dldCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3RzIG5hdmlnYXRpb24gb25lIHN0ZXAgYmFjay4gVGhpcyBmaXJzdCBhdHRlbXB0cyB0byBnbyBiYWNrIHdpdGhpblxuICAgKiB0aGUgY29udGV4dCBvZiB0aGlzIGRvY3VtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBuYXZpZ2F0ZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGdvQmFjayhuYXZpZ2F0ZSkge1xuICAgIHJldHVybiB0aGlzLmVucXVlXygoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdGFja0luZGV4XyA8PSAwICYmICFuYXZpZ2F0ZSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBvcCB0aGUgY3VycmVudCBzdGF0ZS4gVGhlIGJpbmRpbmcgd2lsbCBpZ25vcmUgdGhlIHJlcXVlc3QgaWZcbiAgICAgIC8vIGl0IGNhbm5vdCBzYXRpc2Z5IGl0LlxuICAgICAgcmV0dXJuIHRoaXMuYmluZGluZ18ucG9wKHRoaXMuc3RhY2tJbmRleF8pLnRoZW4oKGhpc3RvcnlTdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLm9uU3RhdGVVcGRhdGVkXyhoaXN0b3J5U3RhdGUpO1xuICAgICAgfSk7XG4gICAgfSwgJ2dvQmFjaycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gaGFuZGxlIG5hdmlnYXRpb24gdG8gYSBsb2NhbCB0YXJnZXQsIGUuZy4gV2hlbiBhIHVzZXJcbiAgICogY2xpY2tzIGFuIGFuY2hvciBsaW5rIHRvIGEgbG9jYWwgaGFzaCAtIDxhIGhyZWY9XCIjc2VjdGlvbjFcIj5HbyB0byBzZWN0aW9uXG4gICAqIDE8L2E+LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0XG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgcmVwbGFjZVN0YXRlRm9yVGFyZ2V0KHRhcmdldCkge1xuICAgIGRldkFzc2VydCh0YXJnZXRbMF0gPT0gJyMnLCAndGFyZ2V0IHNob3VsZCBzdGFydCB3aXRoIGEgIycpO1xuICAgIGNvbnN0IHByZXZpb3VzSGFzaCA9IHRoaXMuYW1wZG9jXy53aW4ubG9jYXRpb24uaGFzaDtcbiAgICByZXR1cm4gdGhpcy5wdXNoKCgpID0+IHtcbiAgICAgIHRoaXMuYW1wZG9jXy53aW4ubG9jYXRpb24ucmVwbGFjZShwcmV2aW91c0hhc2ggfHwgJyMnKTtcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuYmluZGluZ18ucmVwbGFjZVN0YXRlRm9yVGFyZ2V0KHRhcmdldCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBmcmFnbWVudCBmcm9tIHRoZSB1cmwgb3IgdGhlIHZpZXdlci5cbiAgICogU3RyaXAgbGVhZGluZyAnIycgaW4gdGhlIGZyYWdtZW50XG4gICAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz59XG4gICAqL1xuICBnZXRGcmFnbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kaW5nXy5nZXRGcmFnbWVudCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgcGFnZSB1cmwgZnJhZ21lbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZyYWdtZW50XG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgdXBkYXRlRnJhZ21lbnQoZnJhZ21lbnQpIHtcbiAgICBpZiAoZnJhZ21lbnRbMF0gPT0gJyMnKSB7XG4gICAgICBmcmFnbWVudCA9IGZyYWdtZW50LnN1YnN0cigxKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmluZGluZ18udXBkYXRlRnJhZ21lbnQoZnJhZ21lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUhpc3RvcnlTdGF0ZURlZn0gaGlzdG9yeVN0YXRlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblN0YXRlVXBkYXRlZF8oaGlzdG9yeVN0YXRlKSB7XG4gICAgdGhpcy5zdGFja0luZGV4XyA9IGhpc3RvcnlTdGF0ZS5zdGFja0luZGV4O1xuICAgIHRoaXMuZG9Qb3BfKGhpc3RvcnlTdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshSGlzdG9yeVN0YXRlRGVmfSBoaXN0b3J5U3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRvUG9wXyhoaXN0b3J5U3RhdGUpIHtcbiAgICBpZiAodGhpcy5zdGFja0luZGV4XyA+PSB0aGlzLnN0YWNrT25Qb3BfLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0b1BvcCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSB0aGlzLnN0YWNrT25Qb3BfLmxlbmd0aCAtIDE7IGkgPiB0aGlzLnN0YWNrSW5kZXhfOyBpLS0pIHtcbiAgICAgIGlmICh0aGlzLnN0YWNrT25Qb3BfW2ldKSB7XG4gICAgICAgIHRvUG9wLnB1c2godGhpcy5zdGFja09uUG9wX1tpXSk7XG4gICAgICAgIHRoaXMuc3RhY2tPblBvcF9baV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc3RhY2tPblBvcF8uc3BsaWNlKHRoaXMuc3RhY2tJbmRleF8gKyAxKTtcblxuICAgIGlmICh0b1BvcC5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRvUG9wLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIFdpdGggdGhlIHNhbWUgZGVsYXkgdGltZW91dHMgbXVzdCBvYnNlcnZlIHRoZSBvcmRlciwgYWx0aG91Z2hcbiAgICAgICAgLy8gdGhlcmUncyBubyBoYXJkIHJlcXVpcmVtZW50IGluIHRoaXMgY2FzZSB0byBmb2xsb3cgdGhlIHBvcCBvcmRlci5cbiAgICAgICAgdGhpcy50aW1lcl8uZGVsYXkoKCkgPT4gdG9Qb3BbaV0oaGlzdG9yeVN0YXRlKSwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTohUHJvbWlzZTxSRVNVTFQ+fSBjYWxsYmFja1xuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxSRVNVTFQ+fVxuICAgKiBAdGVtcGxhdGUgUkVTVUxUXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbnF1ZV8oY2FsbGJhY2ssIG5hbWUpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIGNvbnN0IHtwcm9taXNlLCByZWplY3QsIHJlc29sdmV9ID0gZGVmZXJyZWQ7XG5cbiAgICAvLyBUT0RPKGR2b3l0ZW5rbywgIzg3ODUpOiBjbGVhbnVwIGFmdGVyIHRyYWNpbmcuXG4gICAgY29uc3QgdHJhY2UgPSBuZXcgRXJyb3IoJ2hpc3RvcnkgdHJhY2UgZm9yICcgKyBuYW1lICsgJzogJyk7XG4gICAgdGhpcy5xdWV1ZV8ucHVzaCh7Y2FsbGJhY2ssIHJlc29sdmUsIHJlamVjdCwgdHJhY2V9KTtcbiAgICBpZiAodGhpcy5xdWV1ZV8ubGVuZ3RoID09IDEpIHtcbiAgICAgIHRoaXMuZGVxdWVfKCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZXF1ZV8oKSB7XG4gICAgaWYgKHRoaXMucXVldWVfLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHRoaXMucXVldWVfWzBdO1xuICAgIGxldCBwcm9taXNlO1xuICAgIHRyeSB7XG4gICAgICBwcm9taXNlID0gdGFzay5jYWxsYmFjaygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG5cbiAgICBwcm9taXNlXG4gICAgICAudGhlbihcbiAgICAgICAgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHRhc2sucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LFxuICAgICAgICAocmVhc29uKSA9PiB7XG4gICAgICAgICAgZGV2KCkuZXJyb3IoVEFHXywgJ2ZhaWxlZCB0byBleGVjdXRlIGEgdGFzazonLCByZWFzb24pO1xuICAgICAgICAgIC8vIFRPRE8oZHZveXRlbmtvLCAjODc4NSk6IGNsZWFudXAgYWZ0ZXIgdHJhY2luZy5cbiAgICAgICAgICBpZiAodGFzay50cmFjZSkge1xuICAgICAgICAgICAgdGFzay50cmFjZS5tZXNzYWdlICs9IHJlYXNvbjtcbiAgICAgICAgICAgIGRldigpLmVycm9yKFRBR18sIHRhc2sudHJhY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0YXNrLnJlamVjdChyZWFzb24pO1xuICAgICAgICB9XG4gICAgICApXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMucXVldWVfLnNwbGljZSgwLCAxKTtcbiAgICAgICAgdGhpcy5kZXF1ZV8oKTtcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogSGlzdG9yeUJpbmRpbmdJbnRlcmZhY2UgaXMgYW4gaW50ZXJmYWNlIHRoYXQgZGVmaW5lcyBhbiB1bmRlcmx5aW5nIHRlY2hub2xvZ3lcbiAqIGJlaGluZCB0aGUge0BsaW5rIEhpc3Rvcnl9LlxuICogQGludGVyZmFjZVxuICovXG5jbGFzcyBIaXN0b3J5QmluZGluZ0ludGVyZmFjZSB7XG4gIC8qKiBAcHJvdGVjdGVkICovXG4gIGNsZWFudXAoKSB7fVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIGEgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHN0YXRlIGhhcyBiZWVuIHVwZGF0ZWQuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUhpc3RvcnlTdGF0ZURlZil9IHVudXNlZENhbGxiYWNrXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIHNldE9uU3RhdGVVcGRhdGVkKHVudXNlZENhbGxiYWNrKSB7fVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgYSBuZXcgc3RhdGUgb250byB0aGUgaGlzdG9yeSBzdGFjaywgb3B0aW9uYWxseSBzcGVjaWZ5aW5nIHRoZSBzdGF0ZVxuICAgKiBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50IHN0YXRlLlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHlpZWxkcyB0aGUgbmV3IHN0YXRlLlxuICAgKiBAcGFyYW0geyFIaXN0b3J5U3RhdGVVcGRhdGVEZWY9fSBvcHRfc3RhdGVVcGRhdGVcbiAgICogQHJldHVybiB7IVByb21pc2U8IUhpc3RvcnlTdGF0ZURlZj59XG4gICAqL1xuICBwdXNoKG9wdF9zdGF0ZVVwZGF0ZSkge31cblxuICAvKipcbiAgICogUG9wcyBhIHByZXZpb3VzbHkgcHVzaGVkIHN0YXRlIGZyb20gdGhlIGhpc3Rvcnkgc3RhY2suIEFsbCBoaXN0b3J5XG4gICAqIHN0YXRlcyBjb21pbmcgYWZ0ZXIgdGhpcyBzdGF0ZSB3aWxsIGFsc28gYmUgcG9wcGVkLlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHlpZWxkcyB0aGUgbmV3IHN0YXRlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdW51c2VkU3RhY2tJbmRleFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhSGlzdG9yeVN0YXRlRGVmPn1cbiAgICovXG4gIHBvcCh1bnVzZWRTdGFja0luZGV4KSB7fVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyB0aGUgY3VycmVudCBzdGF0ZSwgb3B0aW9uYWxseSBzcGVjaWZ5aW5nIHVwZGF0ZXMgdG8gdGhlIHN0YXRlXG4gICAqIG9iamVjdCB0byBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIHJlcGxhY2VtZW50LlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHlpZWxkcyB0aGUgbmV3IHN0YXRlLlxuICAgKiBAcGFyYW0geyFIaXN0b3J5U3RhdGVVcGRhdGVEZWY9fSBvcHRfc3RhdGVVcGRhdGVcbiAgICogQHJldHVybiB7IVByb21pc2U8IUhpc3RvcnlTdGF0ZURlZj59XG4gICAqL1xuICByZXBsYWNlKG9wdF9zdGF0ZVVwZGF0ZSkge31cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHN0YXRlLCBjb250YWluaW5nIHRoZSBjdXJyZW50IGZyYWdtZW50LCB0aXRsZSxcbiAgICogYW5kIGFtcC1iaW5kIHN0YXRlLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhSGlzdG9yeVN0YXRlRGVmPn1cbiAgICovXG4gIGdldCgpIHt9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSBzdGF0ZSBmb3IgbG9jYWwgdGFyZ2V0IG5hdmlnYXRpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bnVzZWRUYXJnZXRcbiAgICovXG4gIHJlcGxhY2VTdGF0ZUZvclRhcmdldCh1bnVzZWRUYXJnZXQpIHt9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZnJhZ21lbnQgZnJvbSB0aGUgdXJsIG9yIHRoZSB2aWV3ZXIuXG4gICAqIFN0cmlwIGxlYWRpbmcgJyMnIGluIHRoZSBmcmFnbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgZ2V0RnJhZ21lbnQoKSB7fVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHBhZ2UgdXJsIGZyYWdtZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bnVzZWRGcmFnbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHVwZGF0ZUZyYWdtZW50KHVudXNlZEZyYWdtZW50KSB7fVxufVxuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIEhpc3RvcnlCaW5kaW5nSW50ZXJmYWNlIGJhc2VkIG9uIHRoZSBuYXRpdmUgd2luZG93LiBJdCB1c2VzXG4gKiB3aW5kb3cuaGlzdG9yeSBwcm9wZXJ0aWVzIGFuZCBldmVudHMuXG4gKlxuICogVmlzaWJsZSBmb3IgdGVzdGluZy5cbiAqXG4gKiBAaW1wbGVtZW50cyB7SGlzdG9yeUJpbmRpbmdJbnRlcmZhY2V9XG4gKi9cbmV4cG9ydCBjbGFzcyBIaXN0b3J5QmluZGluZ05hdHVyYWxfIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4pIHtcbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4uL3NlcnZpY2UvdGltZXItaW1wbC5UaW1lcn0gKi9cbiAgICB0aGlzLnRpbWVyXyA9IFNlcnZpY2VzLnRpbWVyRm9yKHdpbik7XG5cbiAgICBjb25zdCB7aGlzdG9yeX0gPSB0aGlzLndpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc3RhcnRJbmRleF8gPSBoaXN0b3J5Lmxlbmd0aCAtIDE7XG4gICAgY29uc3Qgc3RhdGUgPSBnZXRIaXN0b3J5U3RhdGUoaGlzdG9yeSk7XG4gICAgaWYgKHN0YXRlICYmIHN0YXRlW0hJU1RPUllfUFJPUF9dICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc3RhcnRJbmRleF8gPSBNYXRoLm1pbihzdGF0ZVtISVNUT1JZX1BST1BfXSwgdGhpcy5zdGFydEluZGV4Xyk7XG4gICAgfVxuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5zdGFja0luZGV4XyA9IHRoaXMuc3RhcnRJbmRleF87XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSB7e3Byb21pc2U6ICFQcm9taXNlLCByZXNvbHZlOiAhRnVuY3Rpb24sXG4gICAgICogICByZWplY3Q6ICFGdW5jdGlvbn18dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHRoaXMud2FpdGluZ1N0YXRlXztcblxuICAgIC8qKiBAcHJpdmF0ZSB7P2Z1bmN0aW9uKCFIaXN0b3J5U3RhdGVEZWYpfSAqL1xuICAgIHRoaXMub25TdGF0ZVVwZGF0ZWRfID0gbnVsbDtcblxuICAgIC8vIEEgbnVtYmVyIG9mIGJyb3dzZXJzIGRvIG5vdCBzdXBwb3J0IGhpc3Rvcnkuc3RhdGUuIEluIHRoaXMgY2FzZXMsXG4gICAgLy8gSGlzdG9yeSB3aWxsIHRyYWNrIGl0cyBvd24gdmVyc2lvbi4gU2VlIHVuc3VwcG9ydGVkU3RhdGVfLlxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gQGNvbnN0ICovXG4gICAgdGhpcy5zdXBwb3J0c1N0YXRlXyA9ICdzdGF0ZScgaW4gaGlzdG9yeTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Kn0gKi9cbiAgICB0aGlzLnVuc3VwcG9ydGVkU3RhdGVfID0gdGhpcy5oaXN0b3J5U3RhdGVfKHRoaXMuc3RhY2tJbmRleF8pO1xuXG4gICAgLy8gVGhlcmUgYXJlIHN0aWxsIGJyb3dzZXJzIHdobyBkbyBub3Qgc3VwcG9ydCBwdXNoL3JlcGxhY2VTdGF0ZS5cbiAgICBsZXQgcHVzaFN0YXRlLCByZXBsYWNlU3RhdGU7XG4gICAgaWYgKGhpc3RvcnkucHVzaFN0YXRlICYmIGhpc3RvcnkucmVwbGFjZVN0YXRlKSB7XG4gICAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtmdW5jdGlvbigqLCBzdHJpbmc9LCBzdHJpbmc9KXx1bmRlZmluZWR9ICovXG4gICAgICB0aGlzLm9yaWdQdXNoU3RhdGVfID1cbiAgICAgICAgaGlzdG9yeS5vcmlnaW5hbFB1c2hTdGF0ZSB8fCBoaXN0b3J5LnB1c2hTdGF0ZS5iaW5kKGhpc3RvcnkpO1xuICAgICAgLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oKiwgc3RyaW5nPSwgc3RyaW5nPSl8dW5kZWZpbmVkfSAqL1xuICAgICAgdGhpcy5vcmlnUmVwbGFjZVN0YXRlXyA9XG4gICAgICAgIGhpc3Rvcnkub3JpZ2luYWxSZXBsYWNlU3RhdGUgfHwgaGlzdG9yeS5yZXBsYWNlU3RhdGUuYmluZChoaXN0b3J5KTtcbiAgICAgIHB1c2hTdGF0ZSA9IChzdGF0ZSwgb3B0X3RpdGxlLCBvcHRfdXJsKSA9PiB7XG4gICAgICAgIHRoaXMudW5zdXBwb3J0ZWRTdGF0ZV8gPSBzdGF0ZTtcbiAgICAgICAgdGhpcy5vcmlnUHVzaFN0YXRlXyhcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICBvcHRfdGl0bGUsXG4gICAgICAgICAgLy8gQSBidWcgaW4gZWRnZSBjYXVzZXMgcGF0aHMgdG8gYmVjb21lIHVuZGVmaW5lZCBpZiBVUkwgaXNcbiAgICAgICAgICAvLyB1bmRlZmluZWQsIGZpbGVkIGhlcmU6IGh0dHBzOi8vZ29vLmdsL0tsSW1adVxuICAgICAgICAgIG9wdF91cmwgfHwgbnVsbFxuICAgICAgICApO1xuICAgICAgfTtcbiAgICAgIHJlcGxhY2VTdGF0ZSA9IChzdGF0ZSwgb3B0X3RpdGxlLCBvcHRfdXJsKSA9PiB7XG4gICAgICAgIHRoaXMudW5zdXBwb3J0ZWRTdGF0ZV8gPSBzdGF0ZTtcbiAgICAgICAgLy8gTk9URTogY2hlY2sgZm9yIGB1bmRlZmluZWRgIHNpbmNlIElFMTEgYW5kIEVkZ2VcbiAgICAgICAgLy8gdW5leHBlY3RlZGx5IGNvZXJjZXMgaXQgaW50byBhIGBzdHJpbmdgLlxuICAgICAgICBpZiAob3B0X3VybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5vcmlnUmVwbGFjZVN0YXRlXyhzdGF0ZSwgb3B0X3RpdGxlLCBvcHRfdXJsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm9yaWdSZXBsYWNlU3RhdGVfKHN0YXRlLCBvcHRfdGl0bGUpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKCFoaXN0b3J5Lm9yaWdpbmFsUHVzaFN0YXRlKSB7XG4gICAgICAgIGhpc3Rvcnkub3JpZ2luYWxQdXNoU3RhdGUgPSB0aGlzLm9yaWdQdXNoU3RhdGVfO1xuICAgICAgfVxuICAgICAgaWYgKCFoaXN0b3J5Lm9yaWdpbmFsUmVwbGFjZVN0YXRlKSB7XG4gICAgICAgIGhpc3Rvcnkub3JpZ2luYWxSZXBsYWNlU3RhdGUgPSB0aGlzLm9yaWdSZXBsYWNlU3RhdGVfO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwdXNoU3RhdGUgPSAoc3RhdGUsIG9wdF90aXRsZSwgb3B0X3VybCkgPT4ge1xuICAgICAgICB0aGlzLnVuc3VwcG9ydGVkU3RhdGVfID0gc3RhdGU7XG4gICAgICB9O1xuICAgICAgcmVwbGFjZVN0YXRlID0gKHN0YXRlLCBvcHRfdGl0bGUsIG9wdF91cmwpID0+IHtcbiAgICAgICAgdGhpcy51bnN1cHBvcnRlZFN0YXRlXyA9IHN0YXRlO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRnVuY3Rpb259ICovXG4gICAgdGhpcy5wdXNoU3RhdGVfID0gcHVzaFN0YXRlO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUZ1bmN0aW9ufSAqL1xuICAgIHRoaXMucmVwbGFjZVN0YXRlXyA9IHJlcGxhY2VTdGF0ZTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLnJlcGxhY2VTdGF0ZV8oXG4gICAgICAgIHRoaXMuaGlzdG9yeVN0YXRlXyh0aGlzLnN0YWNrSW5kZXhfLCAvKiByZXBsYWNlICovIHRydWUpXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGRldigpLmVycm9yKFRBR18sICdJbml0aWFsIHJlcGxhY2VTdGF0ZSBmYWlsZWQ6ICcgKyBlLm1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGhpc3RvcnkucHVzaFN0YXRlID0gdGhpcy5oaXN0b3J5UHVzaFN0YXRlXy5iaW5kKHRoaXMpO1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlID0gdGhpcy5oaXN0b3J5UmVwbGFjZVN0YXRlXy5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5wb3BzdGF0ZUhhbmRsZXJfID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IGV2ZW50ID0gLyoqIEB0eXBlIHshUG9wU3RhdGVFdmVudH0gKi8gKGUpO1xuICAgICAgY29uc3Qgc3RhdGUgPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoZXZlbnQuc3RhdGUpO1xuICAgICAgZGV2KCkuZmluZShcbiAgICAgICAgVEFHXyxcbiAgICAgICAgJ3BvcHN0YXRlIGV2ZW50OiAnICtcbiAgICAgICAgICB0aGlzLndpbi5oaXN0b3J5Lmxlbmd0aCArXG4gICAgICAgICAgJywgJyArXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkoc3RhdGUpXG4gICAgICApO1xuICAgICAgdGhpcy5vbkhpc3RvcnlFdmVudF8oKTtcbiAgICB9O1xuICAgIHRoaXMud2luLmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5wb3BzdGF0ZUhhbmRsZXJfKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY2xlYW51cCgpIHtcbiAgICBpZiAodGhpcy5vcmlnUHVzaFN0YXRlXykge1xuICAgICAgdGhpcy53aW4uaGlzdG9yeS5wdXNoU3RhdGUgPSB0aGlzLm9yaWdQdXNoU3RhdGVfO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcmlnUmVwbGFjZVN0YXRlXykge1xuICAgICAgdGhpcy53aW4uaGlzdG9yeS5yZXBsYWNlU3RhdGUgPSB0aGlzLm9yaWdSZXBsYWNlU3RhdGVfO1xuICAgIH1cbiAgICB0aGlzLndpbi5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHRoaXMucG9wc3RhdGVIYW5kbGVyXyk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHN0YWNrSW5kZXhcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X3JlcGxhY2VcbiAgICogQHJldHVybiB7Kn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhpc3RvcnlTdGF0ZV8oc3RhY2tJbmRleCwgb3B0X3JlcGxhY2UpIHtcbiAgICBjb25zdCBzdGF0ZSA9IG1hcChvcHRfcmVwbGFjZSA/IHRoaXMuZ2V0U3RhdGVfKCkgOiB1bmRlZmluZWQpO1xuICAgIHN0YXRlW0hJU1RPUllfUFJPUF9dID0gc3RhY2tJbmRleDtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNldE9uU3RhdGVVcGRhdGVkKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5vblN0YXRlVXBkYXRlZF8gPSBjYWxsYmFjaztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcHVzaChvcHRfc3RhdGVVcGRhdGUpIHtcbiAgICByZXR1cm4gdGhpcy53aGVuUmVhZHlfKCgpID0+IHtcbiAgICAgIGNvbnN0IG5ld1N0YXRlID0gdGhpcy5tZXJnZVN0YXRlVXBkYXRlXyhcbiAgICAgICAgdGhpcy5nZXRTdGF0ZV8oKSxcbiAgICAgICAgb3B0X3N0YXRlVXBkYXRlIHx8IHt9XG4gICAgICApO1xuICAgICAgdGhpcy5oaXN0b3J5UHVzaFN0YXRlXyhcbiAgICAgICAgbmV3U3RhdGUsXG4gICAgICAgIC8qIHRpdGxlICovIHVuZGVmaW5lZCxcbiAgICAgICAgbmV3U3RhdGUuZnJhZ21lbnQgPyAnIycgKyBuZXdTdGF0ZS5mcmFnbWVudCA6IHVuZGVmaW5lZFxuICAgICAgKTtcbiAgICAgIHJldHVybiB0cnlSZXNvbHZlKCgpID0+XG4gICAgICAgIHRoaXMubWVyZ2VTdGF0ZVVwZGF0ZV8obmV3U3RhdGUsIHtzdGFja0luZGV4OiB0aGlzLnN0YWNrSW5kZXhffSlcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHBvcChzdGFja0luZGV4KSB7XG4gICAgLy8gT24gcG9wLCBzdGFjayBpcyBub3QgYWxsb3dlZCB0byBnbyBwcmlvciB0byB0aGUgc3RhcnRpbmcgcG9pbnQuXG4gICAgc3RhY2tJbmRleCA9IE1hdGgubWF4KHN0YWNrSW5kZXgsIHRoaXMuc3RhcnRJbmRleF8pO1xuICAgIHJldHVybiB0aGlzLndoZW5SZWFkeV8oKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuYmFja18odGhpcy5zdGFja0luZGV4XyAtIHN0YWNrSW5kZXggKyAxKTtcbiAgICB9KS50aGVuKChuZXdTdGFja0luZGV4KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5tZXJnZVN0YXRlVXBkYXRlXyh0aGlzLmdldFN0YXRlXygpLCB7XG4gICAgICAgIHN0YWNrSW5kZXg6IG5ld1N0YWNrSW5kZXgsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVwbGFjZShvcHRfc3RhdGVVcGRhdGUgPSB7fSkge1xuICAgIHJldHVybiB0aGlzLndoZW5SZWFkeV8oKCkgPT4ge1xuICAgICAgY29uc3QgbmV3U3RhdGUgPSB0aGlzLm1lcmdlU3RhdGVVcGRhdGVfKFxuICAgICAgICB0aGlzLmdldFN0YXRlXygpLFxuICAgICAgICBvcHRfc3RhdGVVcGRhdGUgfHwge31cbiAgICAgICk7XG4gICAgICBjb25zdCB1cmwgPSAobmV3U3RhdGUudXJsIHx8ICcnKS5yZXBsYWNlKC8jLiovLCAnJyk7XG4gICAgICBjb25zdCBmcmFnbWVudCA9IG5ld1N0YXRlLmZyYWdtZW50ID8gJyMnICsgbmV3U3RhdGUuZnJhZ21lbnQgOiAnJztcbiAgICAgIHRoaXMuaGlzdG9yeVJlcGxhY2VTdGF0ZV8oXG4gICAgICAgIG5ld1N0YXRlLFxuICAgICAgICBuZXdTdGF0ZS50aXRsZSxcbiAgICAgICAgdXJsIHx8IGZyYWdtZW50ID8gdXJsICsgZnJhZ21lbnQgOiB1bmRlZmluZWRcbiAgICAgICk7XG4gICAgICByZXR1cm4gdHJ5UmVzb2x2ZSgoKSA9PlxuICAgICAgICB0aGlzLm1lcmdlU3RhdGVVcGRhdGVfKG5ld1N0YXRlLCB7c3RhY2tJbmRleDogdGhpcy5zdGFja0luZGV4X30pXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXQoKSB7XG4gICAgcmV0dXJuIHRyeVJlc29sdmUoKCkgPT5cbiAgICAgIHRoaXMubWVyZ2VTdGF0ZVVwZGF0ZV8odGhpcy5nZXRTdGF0ZV8oKSwge1xuICAgICAgICBzdGFja0luZGV4OiB0aGlzLnN0YWNrSW5kZXhfLFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFja0luZGV4XG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgYmFja1RvKHN0YWNrSW5kZXgpIHtcbiAgICAvLyBPbiBwb3AsIHN0YWNrIGlzIG5vdCBhbGxvd2VkIHRvIGdvIHByaW9yIHRvIHRoZSBzdGFydGluZyBwb2ludC5cbiAgICBzdGFja0luZGV4ID0gTWF0aC5tYXgoc3RhY2tJbmRleCwgdGhpcy5zdGFydEluZGV4Xyk7XG4gICAgcmV0dXJuIHRoaXMud2hlblJlYWR5XygoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5iYWNrXyh0aGlzLnN0YWNrSW5kZXhfIC0gc3RhY2tJbmRleCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgb25IaXN0b3J5RXZlbnRfKCkge1xuICAgIGxldCBzdGF0ZSA9IHRoaXMuZ2V0U3RhdGVfKCk7XG4gICAgZGV2KCkuZmluZShcbiAgICAgIFRBR18sXG4gICAgICAnaGlzdG9yeSBldmVudDogJyArIHRoaXMud2luLmhpc3RvcnkubGVuZ3RoICsgJywgJyArIEpTT04uc3RyaW5naWZ5KHN0YXRlKVxuICAgICk7XG4gICAgY29uc3Qgc3RhY2tJbmRleCA9IHN0YXRlID8gc3RhdGVbSElTVE9SWV9QUk9QX10gOiB1bmRlZmluZWQ7XG4gICAgbGV0IG5ld1N0YWNrSW5kZXggPSB0aGlzLnN0YWNrSW5kZXhfO1xuICAgIGNvbnN0IHdhaXRpbmdTdGF0ZSA9IHRoaXMud2FpdGluZ1N0YXRlXztcbiAgICB0aGlzLndhaXRpbmdTdGF0ZV8gPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAobmV3U3RhY2tJbmRleCA+IHRoaXMud2luLmhpc3RvcnkubGVuZ3RoIC0gMikge1xuICAgICAgLy8gTWFrZSBzdXJlIHN0YWNrIGhhcyBlbm91Z2ggc3BhY2UuIFdoZXRoZXIgd2UgYXJlIGdvaW5nIGZvcndhcmQgb3JcbiAgICAgIC8vIGJhY2t3YXJkLCB0aGUgc3RhY2sgc2hvdWxkIGhhdmUgYXQgbGVhc3Qgb25lIGV4dHJhIGNlbGwuXG4gICAgICBuZXdTdGFja0luZGV4ID0gdGhpcy53aW4uaGlzdG9yeS5sZW5ndGggLSAyO1xuICAgICAgdGhpcy51cGRhdGVIaXN0b3J5U3RhdGVfKFxuICAgICAgICB0aGlzLm1lcmdlU3RhdGVVcGRhdGVfKHN0YXRlLCB7c3RhY2tJbmRleDogbmV3U3RhY2tJbmRleH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChzdGFja0luZGV4ID09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQSBuZXcgbmF2aWdhdGlvbiBmb3J3YXJkIGJ5IHRoZSB1c2VyLlxuICAgICAgbmV3U3RhY2tJbmRleCA9IG5ld1N0YWNrSW5kZXggKyAxO1xuICAgIH0gZWxzZSBpZiAoc3RhY2tJbmRleCA8IHRoaXMud2luLmhpc3RvcnkubGVuZ3RoKSB7XG4gICAgICAvLyBBIHNpbXBsZSB0cmlwIGJhY2suXG4gICAgICBuZXdTdGFja0luZGV4ID0gc3RhY2tJbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gR2VuZXJhbGx5IG5vdCBwb3NzaWJsZSwgYnV0IGZvciBwb3N0ZXJpdHkuXG4gICAgICBuZXdTdGFja0luZGV4ID0gdGhpcy53aW4uaGlzdG9yeS5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIC8vIElmIHN0YXRlIGluZGV4IGhhcyBiZWVuIHVwZGF0ZWQgYXMgdGhlIHJlc3VsdCByZXBsYWNlIHRoZSBzdGF0ZS5cbiAgICBpZiAoIXN0YXRlKSB7XG4gICAgICBzdGF0ZSA9IHt9O1xuICAgIH1cbiAgICBzdGF0ZVtISVNUT1JZX1BST1BfXSA9IG5ld1N0YWNrSW5kZXg7XG4gICAgdGhpcy5yZXBsYWNlU3RhdGVfKHN0YXRlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHN0YWNrLCBwb3Agc3F1ZWV6ZWQgc3RhdGVzLlxuICAgIGlmIChuZXdTdGFja0luZGV4ICE9IHRoaXMuc3RhY2tJbmRleF8pIHtcbiAgICAgIHRoaXMudXBkYXRlSGlzdG9yeVN0YXRlXyhcbiAgICAgICAgdGhpcy5tZXJnZVN0YXRlVXBkYXRlXyhzdGF0ZSwge3N0YWNrSW5kZXg6IG5ld1N0YWNrSW5kZXh9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBVc2VyIG5hdmlnYXRpb24gaXMgYWxsb3dlZCB0byBtb3ZlIHBhc3QgdGhlIHN0YXJ0aW5nIHBvaW50IG9mXG4gICAgLy8gdGhlIGhpc3Rvcnkgc3RhY2suXG4gICAgaWYgKG5ld1N0YWNrSW5kZXggPCB0aGlzLnN0YXJ0SW5kZXhfKSB7XG4gICAgICB0aGlzLnN0YXJ0SW5kZXhfID0gbmV3U3RhY2tJbmRleDtcbiAgICB9XG5cbiAgICBpZiAod2FpdGluZ1N0YXRlKSB7XG4gICAgICB3YWl0aW5nU3RhdGUucmVzb2x2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBnZXRTdGF0ZV8oKSB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNTdGF0ZV8pIHtcbiAgICAgIHJldHVybiBnZXRIaXN0b3J5U3RhdGUodGhpcy53aW4uaGlzdG9yeSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnVuc3VwcG9ydGVkU3RhdGVfO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGFzc2VydFJlYWR5XygpIHtcbiAgICBkZXZBc3NlcnQoXG4gICAgICAhdGhpcy53YWl0aW5nU3RhdGVfLFxuICAgICAgJ1RoZSBoaXN0b3J5IG11c3Qgbm90IGJlIGluIHRoZSB3YWl0aW5nIHN0YXRlJ1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiFQcm9taXNlPFJFU1VMVD59IGNhbGxiYWNrXG4gICAqIEByZXR1cm4geyFQcm9taXNlPFJFU1VMVD59XG4gICAqIEB0ZW1wbGF0ZSBSRVNVTFRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHdoZW5SZWFkeV8oY2FsbGJhY2spIHtcbiAgICBpZiAoIXRoaXMud2FpdGluZ1N0YXRlXykge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLndhaXRpbmdTdGF0ZV8ucHJvbWlzZS50aGVuKGNhbGxiYWNrLCBjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB3YWl0XygpIHtcbiAgICB0aGlzLmFzc2VydFJlYWR5XygpO1xuICAgIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG4gICAgY29uc3Qge3JlamVjdCwgcmVzb2x2ZX0gPSBkZWZlcnJlZDtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy50aW1lcl8udGltZW91dFByb21pc2UoNTAwLCBkZWZlcnJlZC5wcm9taXNlKTtcbiAgICB0aGlzLndhaXRpbmdTdGF0ZV8gPSB7cHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0fTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcHNcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBiYWNrXyhzdGVwcykge1xuICAgIHRoaXMuYXNzZXJ0UmVhZHlfKCk7XG4gICAgaWYgKHN0ZXBzIDw9IDApIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5zdGFja0luZGV4Xyk7XG4gICAgfVxuICAgIHRoaXMudW5zdXBwb3J0ZWRTdGF0ZV8gPSB0aGlzLmhpc3RvcnlTdGF0ZV8odGhpcy5zdGFja0luZGV4XyAtIHN0ZXBzKTtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy53YWl0XygpO1xuICAgIHRoaXMud2luLmhpc3RvcnkuZ28oLXN0ZXBzKTtcbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5zdGFja0luZGV4Xyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqPX0gc3RhdGVcbiAgICogQHBhcmFtIHsoc3RyaW5nfHVuZGVmaW5lZCk9fSB0aXRsZVxuICAgKiBAcGFyYW0geyhzdHJpbmd8dW5kZWZpbmVkKT19IHVybFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGlzdG9yeVB1c2hTdGF0ZV8oc3RhdGUsIHRpdGxlLCB1cmwpIHtcbiAgICB0aGlzLmFzc2VydFJlYWR5XygpO1xuICAgIGlmICghc3RhdGUpIHtcbiAgICAgIHN0YXRlID0ge307XG4gICAgfVxuICAgIGxldCBzdGFja0luZGV4ID0gdGhpcy5zdGFja0luZGV4XyArIDE7XG4gICAgc3RhdGVbSElTVE9SWV9QUk9QX10gPSBzdGFja0luZGV4O1xuICAgIHRoaXMucHVzaFN0YXRlXyhzdGF0ZSwgdGl0bGUsIHVybCk7XG4gICAgaWYgKHN0YWNrSW5kZXggIT0gdGhpcy53aW4uaGlzdG9yeS5sZW5ndGggLSAxKSB7XG4gICAgICBzdGFja0luZGV4ID0gdGhpcy53aW4uaGlzdG9yeS5sZW5ndGggLSAxO1xuICAgICAgc3RhdGVbSElTVE9SWV9QUk9QX10gPSBzdGFja0luZGV4O1xuICAgICAgdGhpcy5yZXBsYWNlU3RhdGVfKHN0YXRlKTtcbiAgICB9XG4gICAgY29uc3QgbmV3U3RhdGUgPSB0aGlzLm1lcmdlU3RhdGVVcGRhdGVfKFxuICAgICAgLyoqIEB0eXBlIHshSGlzdG9yeVN0YXRlRGVmfSAqLyAoc3RhdGUpLFxuICAgICAge3N0YWNrSW5kZXh9XG4gICAgKTtcbiAgICB0aGlzLnVwZGF0ZUhpc3RvcnlTdGF0ZV8obmV3U3RhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoaXMgaXMgYSBoYXNoIHVwZGF0ZSB0aGUgY2hvaWNlIG9mIGBsb2NhdGlvbi5yZXBsYWNlYCB2c1xuICAgKiBgaGlzdG9yeS5yZXBsYWNlU3RhdGVgIGlzIGltcG9ydGFudC4gRHVlIHRvIGJ1Z3MsIG5vdCBldmVyeSBicm93c2VyXG4gICAqIHRyaWdnZXJzIGA6dGFyZ2V0YCBwc2V1ZG8tY2xhc3Mgd2hlbiBgcmVwbGFjZVN0YXRlYCBpcyBjYWxsZWQuXG4gICAqIFNlZSBodHRwOi8vd3d3LnphY2hsZWF0LmNvbS93ZWIvbW92aW5nLXRhcmdldC8gZm9yIG1vcmUgZGV0YWlscy5cbiAgICogbG9jYXRpb24ucmVwbGFjZSB3aWxsIHRyaWdnZXIgYSBgcG9wc3RhdGVgIGV2ZW50LCB3ZSB0ZW1wb3JhcmlseVxuICAgKiBkaXNhYmxlIGhhbmRsaW5nIGl0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0XG4gICAqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgcmVwbGFjZVN0YXRlRm9yVGFyZ2V0KHRhcmdldCkge1xuICAgIGRldkFzc2VydCh0YXJnZXRbMF0gPT0gJyMnLCAndGFyZ2V0IHNob3VsZCBzdGFydCB3aXRoIGEgIycpO1xuICAgIHRoaXMud2hlblJlYWR5XygoKSA9PiB7XG4gICAgICAvLyBsb2NhdGlvbi5yZXBsYWNlIHdpbGwgZmlyZSBhIHBvcHN0YXRlIGV2ZW50IHdoaWNoIGlzIG5vdCBhIGhpc3RvcnlcbiAgICAgIC8vIGV2ZW50LCBzbyB0ZW1wb3JhcmlseSByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyIGFuZCByZS1hZGQgaXQgYWZ0ZXIuXG4gICAgICAvLyBBcyBleHBsYWluZWQgYWJvdmUgaW4gdGhlIGZ1bmN0aW9uIGNvbW1lbnQsIHR5cGljYWxseSB3ZSdkIGp1c3QgZG9cbiAgICAgIC8vIHJlcGxhY2VTdGF0ZSBoZXJlIGJ1dCBpbiBvcmRlciB0byB0cmlnZ2VyIDp0YXJnZXQgcmUtZXZhbCB3ZSBoYXZlIHRvXG4gICAgICAvLyB1c2UgbG9jYXRpb24ucmVwbGFjZS5cbiAgICAgIHRoaXMud2luLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5wb3BzdGF0ZUhhbmRsZXJfKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRPRE8obWtoYXRpYiwgIzYwOTUpOiBDaHJvbWUgaU9TIHdpbGwgYWRkIGV4dHJhIHN0YXRlcyBmb3JcbiAgICAgICAgLy8gbG9jYXRpb24ucmVwbGFjZS5cbiAgICAgICAgdGhpcy53aW4ubG9jYXRpb24ucmVwbGFjZSh0YXJnZXQpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy53aW4uYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCB0aGlzLnBvcHN0YXRlSGFuZGxlcl8pO1xuICAgICAgfVxuICAgICAgdGhpcy5oaXN0b3J5UmVwbGFjZVN0YXRlXygpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kj19IHN0YXRlXG4gICAqIEBwYXJhbSB7KHN0cmluZ3x1bmRlZmluZWQpPX0gdGl0bGVcbiAgICogQHBhcmFtIHsoc3RyaW5nfHVuZGVmaW5lZCk9fSB1cmxcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhpc3RvcnlSZXBsYWNlU3RhdGVfKHN0YXRlLCB0aXRsZSwgdXJsKSB7XG4gICAgdGhpcy5hc3NlcnRSZWFkeV8oKTtcbiAgICBpZiAoIXN0YXRlKSB7XG4gICAgICBzdGF0ZSA9IHt9O1xuICAgIH1cbiAgICBjb25zdCBzdGFja0luZGV4ID0gTWF0aC5taW4odGhpcy5zdGFja0luZGV4XywgdGhpcy53aW4uaGlzdG9yeS5sZW5ndGggLSAxKTtcbiAgICBzdGF0ZVtISVNUT1JZX1BST1BfXSA9IHN0YWNrSW5kZXg7XG4gICAgdGhpcy5yZXBsYWNlU3RhdGVfKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgICBjb25zdCBuZXdTdGF0ZSA9IHRoaXMubWVyZ2VTdGF0ZVVwZGF0ZV8oXG4gICAgICAvKiogQHR5cGUgeyFIaXN0b3J5U3RhdGVEZWZ9ICovIChzdGF0ZSksXG4gICAgICB7c3RhY2tJbmRleH1cbiAgICApO1xuICAgIHRoaXMudXBkYXRlSGlzdG9yeVN0YXRlXyhuZXdTdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshSGlzdG9yeVN0YXRlRGVmfSBoaXN0b3J5U3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZUhpc3RvcnlTdGF0ZV8oaGlzdG9yeVN0YXRlKSB7XG4gICAgdGhpcy5hc3NlcnRSZWFkeV8oKTtcbiAgICBoaXN0b3J5U3RhdGUuc3RhY2tJbmRleCA9IE1hdGgubWluKFxuICAgICAgaGlzdG9yeVN0YXRlLnN0YWNrSW5kZXgsXG4gICAgICB0aGlzLndpbi5oaXN0b3J5Lmxlbmd0aCAtIDFcbiAgICApO1xuICAgIGlmICh0aGlzLnN0YWNrSW5kZXhfICE9IGhpc3RvcnlTdGF0ZS5zdGFja0luZGV4KSB7XG4gICAgICBkZXYoKS5maW5lKFxuICAgICAgICBUQUdfLFxuICAgICAgICAnc3RhY2sgaW5kZXggY2hhbmdlZDogJyArXG4gICAgICAgICAgdGhpcy5zdGFja0luZGV4XyArXG4gICAgICAgICAgJyAtPiAnICtcbiAgICAgICAgICBoaXN0b3J5U3RhdGUuc3RhY2tJbmRleFxuICAgICAgKTtcbiAgICAgIHRoaXMuc3RhY2tJbmRleF8gPSBoaXN0b3J5U3RhdGUuc3RhY2tJbmRleDtcbiAgICAgIGlmICh0aGlzLm9uU3RhdGVVcGRhdGVkXykge1xuICAgICAgICB0aGlzLm9uU3RhdGVVcGRhdGVkXyhoaXN0b3J5U3RhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0RnJhZ21lbnQoKSB7XG4gICAgbGV0IHtoYXNofSA9IHRoaXMud2luLmxvY2F0aW9uO1xuICAgIC8qIFN0cmlwIGxlYWRpbmcgJyMnICovXG4gICAgaGFzaCA9IGhhc2guc3Vic3RyKDEpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaGFzaCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHVwZGF0ZUZyYWdtZW50KGZyYWdtZW50KSB7XG4gICAgcmV0dXJuIHRoaXMucmVwbGFjZSh7ZnJhZ21lbnR9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gez9IaXN0b3J5U3RhdGVEZWZ9IHN0YXRlXG4gICAqIEBwYXJhbSB7IUhpc3RvcnlTdGF0ZVVwZGF0ZURlZn0gdXBkYXRlXG4gICAqIEByZXR1cm4geyFIaXN0b3J5U3RhdGVEZWZ9XG4gICAqL1xuICBtZXJnZVN0YXRlVXBkYXRlXyhzdGF0ZSwgdXBkYXRlKSB7XG4gICAgY29uc3QgbWVyZ2VkRGF0YSA9IC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovICh7XG4gICAgICAuLi4oKHN0YXRlICYmIHN0YXRlLmRhdGEpIHx8IHt9KSxcbiAgICAgIC4uLih1cGRhdGUuZGF0YSB8fCB7fSksXG4gICAgfSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IUhpc3RvcnlTdGF0ZURlZn0gKi8gKHtcbiAgICAgIC4uLihzdGF0ZSB8fCB7fSksXG4gICAgICAuLi51cGRhdGUsXG4gICAgICBkYXRhOiBtZXJnZWREYXRhLFxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgSGlzdG9yeUJpbmRpbmdJbnRlcmZhY2UgdGhhdCBhc3N1bWVzIGEgdmlydHVhbCBoaXN0b3J5IHRoYXRcbiAqIHJlbGllcyBvbiB2aWV3ZXIncyBcInB1c2hIaXN0b3J5XCIsIFwicG9wSGlzdG9yeVwiIGFuZCBcImhpc3RvcnlQb3BwZWRcIlxuICogcHJvdG9jb2wuXG4gKlxuICogVmlzaWJsZSBmb3IgdGVzdGluZy5cbiAqXG4gKiBAaW1wbGVtZW50cyB7SGlzdG9yeUJpbmRpbmdJbnRlcmZhY2V9XG4gKi9cbmV4cG9ydCBjbGFzcyBIaXN0b3J5QmluZGluZ1ZpcnR1YWxfIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IS4vdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9IHZpZXdlclxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCB2aWV3ZXIpIHtcbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9ICovXG4gICAgdGhpcy52aWV3ZXJfID0gdmlld2VyO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5zdGFja0luZGV4XyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUgez9mdW5jdGlvbighSGlzdG9yeVN0YXRlRGVmKX0gKi9cbiAgICB0aGlzLm9uU3RhdGVVcGRhdGVkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgeyFVbmxpc3RlbkRlZn0gKi9cbiAgICB0aGlzLnVubGlzdGVuT25IaXN0b3J5UG9wcGVkXyA9IHRoaXMudmlld2VyXy5vbk1lc3NhZ2UoXG4gICAgICAnaGlzdG9yeVBvcHBlZCcsXG4gICAgICAoZGF0YSkgPT4gdGhpcy5vbkhpc3RvcnlQb3BwZWRfKGRhdGEpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVwbGFjZVN0YXRlRm9yVGFyZ2V0KHRhcmdldCkge1xuICAgIGRldkFzc2VydCh0YXJnZXRbMF0gPT0gJyMnLCAndGFyZ2V0IHNob3VsZCBzdGFydCB3aXRoIGEgIycpO1xuICAgIHRoaXMud2luLmxvY2F0aW9uLnJlcGxhY2UodGFyZ2V0KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY2xlYW51cCgpIHtcbiAgICB0aGlzLnVubGlzdGVuT25IaXN0b3J5UG9wcGVkXygpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZXRPblN0YXRlVXBkYXRlZChjYWxsYmFjaykge1xuICAgIHRoaXMub25TdGF0ZVVwZGF0ZWRfID0gY2FsbGJhY2s7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgaGlzdG9yeSBzdGF0ZSBmcm9tIGEgcmVzcG9uc2UuIFRoaXMgY2hlY2tzIGlmIGBtYXliZUhpc3RvcnlTdGF0ZWBcbiAgICogaXMgYSBoaXN0b3J5IHN0YXRlLCBhbmQgcmV0dXJucyBpdCBpZiBzbywgZmFsbGluZyBiYWNrIHRvIGBmYWxsYmFja1N0YXRlYFxuICAgKiBvdGhlcndpc2UuXG4gICAqIEBwYXJhbSB7Kn0gbWF5YmVIaXN0b3J5U3RhdGVcbiAgICogQHBhcmFtIHshSGlzdG9yeVN0YXRlRGVmfSBmYWxsYmFja1N0YXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkZWJ1Z0lkXG4gICAqIEByZXR1cm4geyFIaXN0b3J5U3RhdGVEZWZ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0b0hpc3RvcnlTdGF0ZV8obWF5YmVIaXN0b3J5U3RhdGUsIGZhbGxiYWNrU3RhdGUsIGRlYnVnSWQpIHtcbiAgICBpZiAodGhpcy5pc0hpc3RvcnlTdGF0ZV8obWF5YmVIaXN0b3J5U3RhdGUpKSB7XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshSGlzdG9yeVN0YXRlRGVmfSAqLyAobWF5YmVIaXN0b3J5U3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZXYoKS53YXJuKFxuICAgICAgICBUQUdfLFxuICAgICAgICAnSWdub3JlZCB1bmV4cGVjdGVkIFwiJXNcIiBkYXRhOicsXG4gICAgICAgIGRlYnVnSWQsXG4gICAgICAgIG1heWJlSGlzdG9yeVN0YXRlXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gZmFsbGJhY2tTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IG1heWJlSGlzdG9yeVN0YXRlXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0hpc3RvcnlTdGF0ZV8obWF5YmVIaXN0b3J5U3RhdGUpIHtcbiAgICByZXR1cm4gISFtYXliZUhpc3RvcnlTdGF0ZSAmJiBtYXliZUhpc3RvcnlTdGF0ZVsnc3RhY2tJbmRleCddICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogYHB1c2hIaXN0b3J5YFxuICAgKlxuICAgKiAgIFJlcXVlc3Q6ICB7J3N0YWNrSW5kZXgnOiBzdHJpbmd9XG4gICAqICAgUmVzcG9uc2U6IHVuZGVmaW5lZCB8IHsnc3RhY2tJbmRleCc6IHN0cmluZ31cbiAgICpcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBwdXNoKG9wdF9zdGF0ZVVwZGF0ZSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoe1xuICAgICAgJ3N0YWNrSW5kZXgnOiB0aGlzLnN0YWNrSW5kZXhfICsgMSxcbiAgICAgIC4uLihvcHRfc3RhdGVVcGRhdGUgfHwge30pLFxuICAgIH0pO1xuICAgIGNvbnN0IHB1c2ggPSAncHVzaEhpc3RvcnknO1xuICAgIHJldHVybiB0aGlzLnZpZXdlcl9cbiAgICAgIC5zZW5kTWVzc2FnZUF3YWl0UmVzcG9uc2UocHVzaCwgbWVzc2FnZSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBmYWxsYmFja1N0YXRlID0gLyoqIEB0eXBlIHshSGlzdG9yeVN0YXRlRGVmfSAqLyAobWVzc2FnZSk7XG4gICAgICAgIGNvbnN0IG5ld1N0YXRlID0gdGhpcy50b0hpc3RvcnlTdGF0ZV8ocmVzcG9uc2UsIGZhbGxiYWNrU3RhdGUsIHB1c2gpO1xuICAgICAgICB0aGlzLnVwZGF0ZUhpc3RvcnlTdGF0ZV8obmV3U3RhdGUpO1xuICAgICAgICByZXR1cm4gbmV3U3RhdGU7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBgcG9wSGlzdG9yeWBcbiAgICpcbiAgICogICBSZXF1ZXN0OiAgeydzdGFja0luZGV4Jzogc3RyaW5nfVxuICAgKiAgIFJlc3BvbnNlOiB1bmRlZmluZWQgfCB7J3N0YWNrSW5kZXgnOiBzdHJpbmd9XG4gICAqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgcG9wKHN0YWNrSW5kZXgpIHtcbiAgICBpZiAoc3RhY2tJbmRleCA+IHRoaXMuc3RhY2tJbmRleF8pIHtcbiAgICAgIHJldHVybiB0aGlzLmdldCgpO1xuICAgIH1cbiAgICBjb25zdCBtZXNzYWdlID0gZGljdCh7J3N0YWNrSW5kZXgnOiB0aGlzLnN0YWNrSW5kZXhffSk7XG4gICAgY29uc3QgcG9wID0gJ3BvcEhpc3RvcnknO1xuICAgIHJldHVybiB0aGlzLnZpZXdlcl9cbiAgICAgIC5zZW5kTWVzc2FnZUF3YWl0UmVzcG9uc2UocG9wLCBtZXNzYWdlKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrU3RhdGUgPSAvKiogQHR5cGUgeyFIaXN0b3J5U3RhdGVEZWZ9ICovIChcbiAgICAgICAgICBkaWN0KHtcbiAgICAgICAgICAgICdzdGFja0luZGV4JzogdGhpcy5zdGFja0luZGV4XyAtIDEsXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSB0aGlzLnRvSGlzdG9yeVN0YXRlXyhyZXNwb25zZSwgZmFsbGJhY2tTdGF0ZSwgcG9wKTtcbiAgICAgICAgdGhpcy51cGRhdGVIaXN0b3J5U3RhdGVfKG5ld1N0YXRlKTtcbiAgICAgICAgcmV0dXJuIG5ld1N0YXRlO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogYHJlcGxhY2VIaXN0b3J5YFxuICAgKlxuICAgKiAgIFJlcXVlc3Q6ICAgeydmcmFnbWVudCc6IHN0cmluZ31cbiAgICogICBSZXNwb25zZTogIHVuZGVmaW5lZCB8IHsnc3RhY2tJbmRleCc6IHN0cmluZ31cbiAgICpcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICByZXBsYWNlKG9wdF9zdGF0ZVVwZGF0ZSkge1xuICAgIGlmIChvcHRfc3RhdGVVcGRhdGUgJiYgb3B0X3N0YXRlVXBkYXRlLnVybCkge1xuICAgICAgaWYgKCF0aGlzLnZpZXdlcl8uaGFzQ2FwYWJpbGl0eSgnZnVsbFJlcGxhY2VIaXN0b3J5JykpIHtcbiAgICAgICAgLy8gRnVsbCBVUkwgcmVwbGFjZW1lbnQgcmVxdWVzdGVkLCBidXQgbm90IHN1cHBvcnRlZCBieSB0aGUgdmlld2VyLlxuICAgICAgICAvLyBEb24ndCB1cGRhdGUsIGFuZCByZXR1cm4gdGhlIGN1cnJlbnQgc3RhdGUuXG4gICAgICAgIGNvbnN0IGN1clN0YXRlID0gLyoqIEB0eXBlIHshSGlzdG9yeVN0YXRlRGVmfSAqLyAoXG4gICAgICAgICAgZGljdCh7XG4gICAgICAgICAgICAnc3RhY2tJbmRleCc6IHRoaXMuc3RhY2tJbmRleF8sXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjdXJTdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlcGxhY2UgZnJhZ21lbnQsIG9ubHkgZXhwbGljaXQgZnJhZ21lbnQgcGFyYW0gd2lsbCBiZSBzZW50LlxuICAgICAgY29uc3QgdXJsID0gb3B0X3N0YXRlVXBkYXRlLnVybC5yZXBsYWNlKC8jLiovLCAnJyk7XG4gICAgICBvcHRfc3RhdGVVcGRhdGUudXJsID0gdXJsO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2UgPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoe1xuICAgICAgJ3N0YWNrSW5kZXgnOiB0aGlzLnN0YWNrSW5kZXhfLFxuICAgICAgLi4uKG9wdF9zdGF0ZVVwZGF0ZSB8fCB7fSksXG4gICAgfSk7XG4gICAgY29uc3QgcmVwbGFjZSA9ICdyZXBsYWNlSGlzdG9yeSc7XG4gICAgcmV0dXJuIHRoaXMudmlld2VyX1xuICAgICAgLnNlbmRNZXNzYWdlQXdhaXRSZXNwb25zZShyZXBsYWNlLCBtZXNzYWdlLCAvKiBjYW5jZWxVbnNlbnQgKi8gdHJ1ZSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBmYWxsYmFja1N0YXRlID0gLyoqIEB0eXBlIHshSGlzdG9yeVN0YXRlRGVmfSAqLyAobWVzc2FnZSk7XG4gICAgICAgIGNvbnN0IG5ld1N0YXRlID0gdGhpcy50b0hpc3RvcnlTdGF0ZV8ocmVzcG9uc2UsIGZhbGxiYWNrU3RhdGUsIHJlcGxhY2UpO1xuICAgICAgICB0aGlzLnVwZGF0ZUhpc3RvcnlTdGF0ZV8obmV3U3RhdGUpO1xuICAgICAgICByZXR1cm4gbmV3U3RhdGU7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlOiBPbmx5IHJldHVybnMgdGhlIGN1cnJlbnQgYHN0YWNrSW5kZXhgLlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGdldCgpIHtcbiAgICAvLyBOb3Qgc3VyZSB3aHkgdGhpcyB0eXBlIGNvZXJjaW9uIGlzIG5lY2Vzc2FyeSwgYnV0IENDIGNvbXBsYWlucyBvdGhlcndpc2UuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcbiAgICAgIC8qKiBAdHlwZSB7IUhpc3RvcnlTdGF0ZURlZn0gKi8gKHtcbiAgICAgICAgZGF0YTogdW5kZWZpbmVkLFxuICAgICAgICBmcmFnbWVudDogJycsXG4gICAgICAgIHN0YWNrSW5kZXg6IHRoaXMuc3RhY2tJbmRleF8sXG4gICAgICAgIHRpdGxlOiAnJyxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBgaGlzdG9yeVBvcHBlZGAgKGZyb20gdmlld2VyKVxuICAgKlxuICAgKiAgIFJlcXVlc3Q6ICB7J25ld1N0YWNrSW5kZXgnOiBudW1iZXJ9IHwgeydzdGFja0luZGV4JzogbnVtYmVyfVxuICAgKiAgIFJlc3BvbnNlOiB1bmRlZmluZWRcbiAgICpcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gZGF0YVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25IaXN0b3J5UG9wcGVkXyhkYXRhKSB7XG4gICAgaWYgKGRhdGFbJ25ld1N0YWNrSW5kZXgnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkYXRhWydzdGFja0luZGV4J10gPSBkYXRhWyduZXdTdGFja0luZGV4J107XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSGlzdG9yeVN0YXRlXyhkYXRhKSkge1xuICAgICAgdGhpcy51cGRhdGVIaXN0b3J5U3RhdGVfKC8qKiBAdHlwZSB7IUhpc3RvcnlTdGF0ZURlZn0gKi8gKGRhdGEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGV2KCkud2FybihUQUdfLCAnSWdub3JlZCB1bmV4cGVjdGVkIFwiaGlzdG9yeVBvcHBlZFwiIGRhdGE6JywgZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUhpc3RvcnlTdGF0ZURlZn0gc3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZUhpc3RvcnlTdGF0ZV8oc3RhdGUpIHtcbiAgICBjb25zdCB7c3RhY2tJbmRleH0gPSBzdGF0ZTtcbiAgICBpZiAodGhpcy5zdGFja0luZGV4XyAhPSBzdGFja0luZGV4KSB7XG4gICAgICBkZXYoKS5maW5lKFRBR18sIGBzdGFja0luZGV4OiAke3RoaXMuc3RhY2tJbmRleF99IC0+ICR7c3RhY2tJbmRleH1gKTtcbiAgICAgIHRoaXMuc3RhY2tJbmRleF8gPSBzdGFja0luZGV4O1xuICAgICAgaWYgKHRoaXMub25TdGF0ZVVwZGF0ZWRfKSB7XG4gICAgICAgIHRoaXMub25TdGF0ZVVwZGF0ZWRfKHN0YXRlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogYGdldEZyYWdtZW50YFxuICAgKlxuICAgKiAgIFJlcXVlc3Q6ICB1bmRlZmluZWRcbiAgICogICBSZXNwb25zZTogc3RyaW5nXG4gICAqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZ2V0RnJhZ21lbnQoKSB7XG4gICAgaWYgKCF0aGlzLnZpZXdlcl8uaGFzQ2FwYWJpbGl0eSgnZnJhZ21lbnQnKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgnJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZpZXdlcl9cbiAgICAgIC5zZW5kTWVzc2FnZUF3YWl0UmVzcG9uc2UoXG4gICAgICAgICdnZXRGcmFnbWVudCcsXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgLyogY2FuY2VsVW5zZW50ICovIHRydWVcbiAgICAgIClcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgICAgICBsZXQgaGFzaCA9IGRldigpLmFzc2VydFN0cmluZyhkYXRhKTtcbiAgICAgICAgLyogU3RyaXAgbGVhZGluZyAnIycqL1xuICAgICAgICBpZiAoaGFzaFswXSA9PSAnIycpIHtcbiAgICAgICAgICBoYXNoID0gaGFzaC5zdWJzdHIoMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc2g7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBgcmVwbGFjZUhpc3RvcnlgXG4gICAqXG4gICAqICAgUmVxdWVzdDogICB7J2ZyYWdtZW50Jzogc3RyaW5nfVxuICAgKiAgIFJlc3BvbnNlOiAgdW5kZWZpbmVkIHwgeydzdGFja0luZGV4Jzogc3RyaW5nfVxuICAgKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHVwZGF0ZUZyYWdtZW50KGZyYWdtZW50KSB7XG4gICAgaWYgKCF0aGlzLnZpZXdlcl8uaGFzQ2FwYWJpbGl0eSgnZnJhZ21lbnQnKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZX0gKi8gKFxuICAgICAgdGhpcy52aWV3ZXJfLnNlbmRNZXNzYWdlQXdhaXRSZXNwb25zZShcbiAgICAgICAgJ3JlcGxhY2VIaXN0b3J5JyxcbiAgICAgICAgZGljdCh7J2ZyYWdtZW50JzogZnJhZ21lbnR9KSxcbiAgICAgICAgLyogY2FuY2VsVW5zZW50ICovIHRydWVcbiAgICAgIClcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHJldHVybiB7IUhpc3Rvcnl9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBjcmVhdGVIaXN0b3J5KGFtcGRvYykge1xuICBjb25zdCB2aWV3ZXIgPSBTZXJ2aWNlcy52aWV3ZXJGb3JEb2MoYW1wZG9jKTtcbiAgbGV0IGJpbmRpbmc7XG4gIGlmIChcbiAgICB2aWV3ZXIuaXNPdmVydGFrZUhpc3RvcnkoKSB8fFxuICAgIGdldE1vZGUoYW1wZG9jLndpbikudGVzdCB8fFxuICAgIGFtcGRvYy53aW4uX19BTVBfVEVTVF9JRlJBTUVcbiAgKSB7XG4gICAgYmluZGluZyA9IG5ldyBIaXN0b3J5QmluZGluZ1ZpcnR1YWxfKGFtcGRvYy53aW4sIHZpZXdlcik7XG4gIH0gZWxzZSB7XG4gICAgLy8gT25seSBvbmUgZ2xvYmFsIFwibmF0dXJhbFwiIGJpbmRpbmcgaXMgYWxsb3dlZCBzaW5jZSBpdCB3b3JrcyB3aXRoIHRoZVxuICAgIC8vIGdsb2JhbCBoaXN0b3J5IHN0YWNrLlxuICAgIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXIoXG4gICAgICBhbXBkb2Mud2luLFxuICAgICAgJ2dsb2JhbC1oaXN0b3J5LWJpbmRpbmcnLFxuICAgICAgSGlzdG9yeUJpbmRpbmdOYXR1cmFsX1xuICAgICk7XG4gICAgYmluZGluZyA9IGdldFNlcnZpY2UoYW1wZG9jLndpbiwgJ2dsb2JhbC1oaXN0b3J5LWJpbmRpbmcnKTtcbiAgfVxuICByZXR1cm4gbmV3IEhpc3RvcnkoYW1wZG9jLCBiaW5kaW5nKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsSGlzdG9yeVNlcnZpY2VGb3JEb2MoYW1wZG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MoYW1wZG9jLCAnaGlzdG9yeScsIGNyZWF0ZUhpc3RvcnkpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/history-impl.js