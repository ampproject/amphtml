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

import {Deferred, tryResolve} from '../utils/promise';
import {Services} from '../services';
import {dev, devAssert} from '../log';
import {dict, map} from '../utils/object';
import {getMode} from '../mode';
import {
  getService,
  registerServiceBuilder,
  registerServiceBuilderForDoc,
} from '../service';
import {getState} from '../history';

/** @private @const {string} */
const TAG_ = 'History';

/** @private @const {string} */
const HISTORY_PROP_ = 'AMP.History';

/** @typedef {number} */
let HistoryIdDef;

/**
 * @typedef {{stackIndex: HistoryIdDef, title: string, fragment: string, data: (!JsonObject|undefined)}}
 */
let HistoryStateDef;

/**
 * @typedef {{title: (string|undefined), fragment: (string|undefined), url: (string|undefined), canonicalUrl: (string|undefined), data: (!JsonObject|undefined)}}
 */
let HistoryStateUpdateDef;

/**
 * Wraps the browser's History API for viewer support and necessary polyfills.
 */
export class History {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!HistoryBindingInterface} binding
   */
  constructor(ampdoc, binding) {
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
  cleanup() {
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
  push(opt_onPop, opt_stateUpdate) {
    return this.enque_(() => {
      return this.binding_.push(opt_stateUpdate).then(historyState => {
        this.onStateUpdated_(historyState);
        if (opt_onPop) {
          this.stackOnPop_[historyState.stackIndex] = opt_onPop;
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
  pop(stateId) {
    return this.enque_(() => {
      return this.binding_.pop(stateId).then(historyState => {
        this.onStateUpdated_(historyState);
      });
    }, 'pop');
  }

  /**
   * Replaces the current state, optionally specifying updates to the state
   * object to be associated with the replacement.
   * @param {!HistoryStateUpdateDef=} opt_stateUpdate
   * @return {!Promise}
   */
  replace(opt_stateUpdate) {
    return this.enque_(() => this.binding_.replace(opt_stateUpdate),
        'replace');
  }

  /**
   * Retrieves the current state, containing the current fragment, title,
   * and amp-bind state.
   * @return {!Promise<!HistoryStateDef>}
   */
  get() {
    return this.enque_(() => this.binding_.get(), 'get');
  }

  /**
   * Requests navigation one step back. This request is only satisifed
   * when the history has at least one step to go back in the context
   * of this document.
   * @return {!Promise}
   */
  goBack() {
    return this.enque_(() => {
      if (this.stackIndex_ <= 0) {
        // Nothing left to pop.
        return Promise.resolve();
      }
      // Pop the current state. The binding will ignore the request if
      // it cannot satisfy it.
      return this.binding_.pop(this.stackIndex_).then(historyState => {
        this.onStateUpdated_(historyState);
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
  replaceStateForTarget(target) {
    devAssert(target[0] == '#', 'target should start with a #');
    const previousHash = this.ampdoc_.win.location.hash;
    return this.push(() => {
      this.ampdoc_.win.location.replace(previousHash || '#');
    }).then(() => {
      this.binding_.replaceStateForTarget(target);
    });
  }

  /**
   * Get the fragment from the url or the viewer.
   * Strip leading '#' in the fragment
   * @return {!Promise<string>}
   */
  getFragment() {
    return this.binding_.getFragment();
  }

  /**
   * Update the page url fragment
   * @param {string} fragment
   * @return {!Promise}
   */
  updateFragment(fragment) {
    if (fragment[0] == '#') {
      fragment = fragment.substr(1);
    }
    return this.binding_.updateFragment(fragment);
  }

  /**
   * @param {!HistoryStateDef} historyState
   * @private
   */
  onStateUpdated_(historyState) {
    this.stackIndex_ = historyState.stackIndex;
    this.doPop_(historyState);
  }

  /**
   * @param {!HistoryStateDef} historyState
   * @private
   */
  doPop_(historyState) {
    if (this.stackIndex_ >= this.stackOnPop_.length - 1) {
      return;
    }

    const toPop = [];
    for (let i = this.stackOnPop_.length - 1; i > this.stackIndex_; i--) {
      if (this.stackOnPop_[i]) {
        toPop.push(this.stackOnPop_[i]);
        this.stackOnPop_[i] = undefined;
      }
    }
    this.stackOnPop_.splice(this.stackIndex_ + 1);

    if (toPop.length > 0) {
      for (let i = 0; i < toPop.length; i++) {
        // With the same delay timeouts must observe the order, although
        // there's no hard requirement in this case to follow the pop order.
        this.timer_.delay(() => toPop[i](historyState), 1);
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
  enque_(callback, name) {
    const deferred = new Deferred();
    const {promise, resolve, reject} = deferred;

    // TODO(dvoytenko, #8785): cleanup after tracing.
    const trace = new Error('history trace for ' + name + ': ');
    this.queue_.push({callback, resolve, reject, trace});
    if (this.queue_.length == 1) {
      this.deque_();
    }
    return promise;
  }

  /**
   * @private
   */
  deque_() {
    if (this.queue_.length == 0) {
      return;
    }

    const task = this.queue_[0];
    let promise;
    try {
      promise = task.callback();
    } catch (e) {
      promise = Promise.reject(e);
    }

    promise.then(result => {
      task.resolve(result);
    }, reason => {
      dev().error(TAG_, 'failed to execute a task:', reason);
      // TODO(dvoytenko, #8785): cleanup after tracing.
      if (task.trace) {
        task.trace.message += reason;
        dev().error(TAG_, task.trace);
      }
      task.reject(reason);
    }).then(() => {
      this.queue_.splice(0, 1);
      this.deque_();
    });
  }
}


/**
 * HistoryBindingInterface is an interface that defines an underlying technology
 * behind the {@link History}.
 * @interface
 */
class HistoryBindingInterface {

  /** @protected */
  cleanup() {}

  /**
   * Configures a callback to be called when the state has been updated.
   * @param {function(!HistoryStateDef)} unusedCallback
   * @protected
   */
  setOnStateUpdated(unusedCallback) {}

  /**
   * Pushes a new state onto the history stack, optionally specifying the state
   * object associated with the current state.
   * Returns a promise that yields the new state.
   * @param {!HistoryStateUpdateDef=} opt_stateUpdate
   * @return {!Promise<!HistoryStateDef>}
   */
  push(opt_stateUpdate) {}

  /**
   * Pops a previously pushed state from the history stack. All history
   * states coming after this state will also be popped.
   * Returns a promise that yields the new state.
   * @param {number} unusedStackIndex
   * @return {!Promise<!HistoryStateDef>}
   */
  pop(unusedStackIndex) {}

  /**
   * Replaces the current state, optionally specifying updates to the state
   * object to be associated with the replacement.
   * Returns a promise that yields the new state.
   * @param {!HistoryStateUpdateDef=} opt_stateUpdate
   * @return {!Promise<!HistoryStateDef>}
   */
  replace(opt_stateUpdate) {}

  /**
   * Retrieves the current state, containing the current fragment, title,
   * and amp-bind state.
   * @return {!Promise<!HistoryStateDef>}
   */
  get() {}

  /**
   * Replaces the state for local target navigation.
   * @param {string} unusedTarget
   */
  replaceStateForTarget(unusedTarget) {}

  /**
   * Get the fragment from the url or the viewer.
   * Strip leading '#' in the fragment
   * @return {!Promise<string>}
   */
  getFragment() {}

  /**
   * Update the page url fragment
   * @param {string} unusedFragment
   * @return {!Promise}
   */
  updateFragment(unusedFragment) {}
}


/**
 * Implementation of HistoryBindingInterface based on the native window. It uses
 * window.history properties and events.
 *
 * Visible for testing.
 *
 * @implements {HistoryBindingInterface}
 */
export class HistoryBindingNatural_ {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!../service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    const {history} = this.win;

    /** @private {number} */
    this.startIndex_ = history.length - 1;
    const state = getState(history);
    if (state && state[HISTORY_PROP_] !== undefined) {
      this.startIndex_ = Math.min(state[HISTORY_PROP_],
          this.startIndex_);
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
    let pushState, replaceState;
    if (history.pushState && history.replaceState) {
      /** @private @const {function(*, string=, string=)|undefined} */
      this.origPushState_ = history.originalPushState ||
          history.pushState.bind(history);
      /** @private @const {function(*, string=, string=)|undefined} */
      this.origReplaceState_ = history.originalReplaceState ||
          history.replaceState.bind(history);
      pushState = (state, opt_title, opt_url) => {
        this.unsupportedState_ = state;
        this.origPushState_(state, opt_title,
            // A bug in edge causes paths to become undefined if URL is
            // undefined, filed here: https://goo.gl/KlImZu
            opt_url || null);
      };
      replaceState = (state, opt_title, opt_url) => {
        this.unsupportedState_ = state;
        // NOTE: check for `undefined` since IE11 and Edge
        // unexpectedly coerces it into a `string`.
        if (opt_url !== undefined) {
          this.origReplaceState_(state, opt_title, opt_url);
        } else {
          this.origReplaceState_(state, opt_title);
        }
      };
      if (!history.originalPushState) {
        history.originalPushState = this.origPushState_;
      }
      if (!history.originalReplaceState) {
        history.originalReplaceState = this.origReplaceState_;
      }
    } else {
      pushState = (state, opt_title, opt_url) => {
        this.unsupportedState_ = state;
      };
      replaceState = (state, opt_title, opt_url) => {
        this.unsupportedState_ = state;
      };
    }

    /** @private @const {!Function} */
    this.pushState_ = pushState;

    /** @private @const {!Function} */
    this.replaceState_ = replaceState;

    try {
      this.replaceState_(this.historyState_(this.stackIndex_,
          /* replace */ true));
    } catch (e) {
      dev().error(TAG_, 'Initial replaceState failed: ' + e.message);
    }

    history.pushState = this.historyPushState_.bind(this);
    history.replaceState = this.historyReplaceState_.bind(this);

    this.popstateHandler_ = e => {
      const state = /** @type {!JsonObject} */(
        /** @type {!PopStateEvent} */(e).state);
      dev().fine(TAG_, 'popstate event: ' + this.win.history.length + ', ' +
        JSON.stringify(state));
      this.onHistoryEvent_();
    };
    this.win.addEventListener('popstate', this.popstateHandler_);
  }

  /** @override */
  cleanup() {
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
  historyState_(stackIndex, opt_replace) {
    const state = map(opt_replace ? this.getState_() : undefined);
    state[HISTORY_PROP_] = stackIndex;
    return state;
  }

  /** @override */
  setOnStateUpdated(callback) {
    this.onStateUpdated_ = callback;
  }

  /** @override */
  push(opt_stateUpdate) {
    return this.whenReady_(() => {
      const newState = this.mergeStateUpdate_(
          this.getState_(), opt_stateUpdate || {});
      this.historyPushState_(newState, /* title */ undefined,
          newState.fragment ? ('#' + newState.fragment) : undefined);
      return tryResolve(() =>
        this.mergeStateUpdate_(newState, {stackIndex: this.stackIndex_})
      );
    });
  }

  /** @override */
  pop(stackIndex) {
    // On pop, stack is not allowed to go prior to the starting point.
    stackIndex = Math.max(stackIndex, this.startIndex_);
    return this.whenReady_(() => {
      return this.back_(this.stackIndex_ - stackIndex + 1);
    }).then(newStackIndex => {
      return this.mergeStateUpdate_(this.getState_(), {
        stackIndex: newStackIndex,
      });
    });
  }

  /** @override */
  replace(opt_stateUpdate = {}) {
    return this.whenReady_(() => {
      const newState = this.mergeStateUpdate_(
          this.getState_(), opt_stateUpdate || {});
      const url = (newState.url || '').replace(/#.*/, '');
      const fragment = newState.fragment ? '#' + newState.fragment : '';
      this.historyReplaceState_(newState, newState.title,
          (url || fragment) ? url + fragment : undefined);
      return tryResolve(() =>
        this.mergeStateUpdate_(newState, {stackIndex: this.stackIndex_})
      );
    });
  }

  /** @override */
  get() {
    return tryResolve(() => this.mergeStateUpdate_(this.getState_(), {
      stackIndex: this.stackIndex_,
    }));
  }

  /**
   * @param {number} stackIndex
   * @return {!Promise}
   */
  backTo(stackIndex) {
    // On pop, stack is not allowed to go prior to the starting point.
    stackIndex = Math.max(stackIndex, this.startIndex_);
    return this.whenReady_(() => {
      return this.back_(this.stackIndex_ - stackIndex);
    });
  }

  /** @private */
  onHistoryEvent_() {
    let state = this.getState_();
    dev().fine(TAG_, 'history event: ' + this.win.history.length + ', ' +
        JSON.stringify(state));
    const stackIndex = state ? state[HISTORY_PROP_] : undefined;
    let newStackIndex = this.stackIndex_;
    const waitingState = this.waitingState_;
    this.waitingState_ = undefined;

    if (newStackIndex > this.win.history.length - 2) {
      // Make sure stack has enough space. Whether we are going forward or
      // backward, the stack should have at least one extra cell.
      newStackIndex = this.win.history.length - 2;
      this.updateHistoryState_(this.mergeStateUpdate_(state,
          {stackIndex: newStackIndex}));
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
      this.updateHistoryState_(this.mergeStateUpdate_(state,
          {stackIndex: newStackIndex}));
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
  getState_() {
    if (this.supportsState_) {
      return getState(this.win.history);
    }
    return this.unsupportedState_;
  }

  /** @private */
  assertReady_() {
    devAssert(!this.waitingState_,
        'The history must not be in the waiting state');
  }

  /**
   * @param {function():!Promise<RESULT>} callback
   * @return {!Promise<RESULT>}
   * @template RESULT
   * @private
   */
  whenReady_(callback) {
    if (!this.waitingState_) {
      return callback();
    }
    return this.waitingState_.promise.then(callback, callback);
  }

  /**
   * @return {!Promise}
   * @private
   */
  wait_() {
    this.assertReady_();
    const deferred = new Deferred();
    const {resolve, reject} = deferred;
    const promise = this.timer_.timeoutPromise(500, deferred.promise);
    this.waitingState_ = {promise, resolve, reject};
    return promise;
  }

  /**
   * @param {number} steps
   * @return {!Promise}
   */
  back_(steps) {
    this.assertReady_();
    if (steps <= 0) {
      return Promise.resolve(this.stackIndex_);
    }
    this.unsupportedState_ = this.historyState_(this.stackIndex_ - steps);
    const promise = this.wait_();
    this.win.history.go(-steps);
    return promise.then(() => {
      return Promise.resolve(this.stackIndex_);
    });
  }

  /**
   * @param {*=} state
   * @param {(string|undefined)=} title
   * @param {(string|undefined)=} url
   * @private
   */
  historyPushState_(state, title, url) {
    this.assertReady_();
    if (!state) {
      state = {};
    }
    let stackIndex = this.stackIndex_ + 1;
    state[HISTORY_PROP_] = stackIndex;
    this.pushState_(state, title, url);
    if (stackIndex != this.win.history.length - 1) {
      stackIndex = this.win.history.length - 1;
      state[HISTORY_PROP_] = stackIndex;
      this.replaceState_(state);
    }
    const newState = this.mergeStateUpdate_(
        /** @type {!HistoryStateDef} */ (state), {stackIndex});
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
  replaceStateForTarget(target) {
    devAssert(target[0] == '#', 'target should start with a #');
    this.whenReady_(() => {
      // location.replace will fire a popstate event which is not a history
      // event, so temporarily remove the event listener and re-add it after.
      // As explained above in the function comment, typically we'd just do
      // replaceState here but in order to trigger :target re-eval we have to
      // use location.replace.
      this.win.removeEventListener('popstate', this.popstateHandler_);
      try {
        // TODO(mkhatib, #6095): Chrome iOS will add extra states for
        // location.replace.
        this.win.location.replace(target);
      } finally {
        this.win.addEventListener('popstate', this.popstateHandler_);
      }
      this.historyReplaceState_();
      return Promise.resolve();
    });
  }

  /**
   * @param {*=} state
   * @param {(string|undefined)=} title
   * @param {(string|undefined)=} url
   * @private
   */
  historyReplaceState_(state, title, url) {
    this.assertReady_();
    if (!state) {
      state = {};
    }
    const stackIndex = Math.min(this.stackIndex_, this.win.history.length - 1);
    state[HISTORY_PROP_] = stackIndex;
    this.replaceState_(state, title, url);
    const newState = this.mergeStateUpdate_(
        /** @type {!HistoryStateDef} */ (state), {stackIndex});
    this.updateHistoryState_(newState);
  }

  /**
   * @param {!HistoryStateDef} historyState
   * @private
   */
  updateHistoryState_(historyState) {
    this.assertReady_();
    historyState.stackIndex = Math.min(historyState.stackIndex,
        this.win.history.length - 1);
    if (this.stackIndex_ != historyState.stackIndex) {
      dev().fine(TAG_, 'stack index changed: ' + this.stackIndex_ + ' -> ' +
          historyState.stackIndex);
      this.stackIndex_ = historyState.stackIndex;
      if (this.onStateUpdated_) {
        this.onStateUpdated_(historyState);
      }
    }
  }

  /** @override */
  getFragment() {
    let {hash} = this.win.location;
    /* Strip leading '#' */
    hash = hash.substr(1);
    return Promise.resolve(hash);
  }

  /** @override */
  updateFragment(fragment) {
    return this.replace({fragment});
  }

  /**
   * @param {?HistoryStateDef} state
   * @param {!HistoryStateUpdateDef} update
   * @return {!HistoryStateDef}
   */
  mergeStateUpdate_(state, update) {
    const mergedData = /** @type {!JsonObject} */ (
      Object.assign({}, (state && state.data) || {}, update.data || {})
    );
    return /** @type {!HistoryStateDef} */ (
      Object.assign({}, state || {}, update, {data: mergedData})
    );
  }
}

/**
 * Implementation of HistoryBindingInterface that assumes a virtual history that
 * relies on viewer's "pushHistory", "popHistory" and "historyPopped"
 * protocol.
 *
 * Visible for testing.
 *
 * @implements {HistoryBindingInterface}
 */
export class HistoryBindingVirtual_ {

  /**
   * @param {!Window} win
   * @param {!./viewer-impl.Viewer} viewer
   */
  constructor(win, viewer) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!./viewer-impl.Viewer} */
    this.viewer_ = viewer;

    /** @private {number} */
    this.stackIndex_ = 0;

    /** @private {?function(!HistoryStateDef)} */
    this.onStateUpdated_ = null;

    /** @private {!UnlistenDef} */
    this.unlistenOnHistoryPopped_ = this.viewer_.onMessage('historyPopped',
        data => this.onHistoryPopped_(data));
  }

  /** @override */
  replaceStateForTarget(target) {
    devAssert(target[0] == '#', 'target should start with a #');
    this.win.location.replace(target);
  }

  /** @override */
  cleanup() {
    this.unlistenOnHistoryPopped_();
  }

  /** @override */
  setOnStateUpdated(callback) {
    this.onStateUpdated_ = callback;
  }

  /**
   * `pushHistory`
   *
   *   Request:  {'stackIndex': string}
   *   Response: undefined | {'stackIndex': string}
   *
   * @override
   */
  push(opt_stateUpdate) {
    const message = /** @type {!JsonObject} */ (
      Object.assign({'stackIndex': this.stackIndex_ + 1}, opt_stateUpdate || {})
    );
    return this.viewer_.sendMessageAwaitResponse('pushHistory', message)
        .then(response => {
          // Return the message if response is undefined.
          const newState = /** @type {!HistoryStateDef} */ (
            response || message
          );
          this.updateHistoryState_(newState);
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
  pop(stackIndex) {
    if (stackIndex > this.stackIndex_) {
      return this.get();
    }
    const message = dict({'stackIndex': this.stackIndex_});
    return this.viewer_.sendMessageAwaitResponse('popHistory', message)
        .then(response => {
          // Return the new stack index if response is undefined.
          const newState = /** @type {!HistoryStateDef} */ (
            response || dict({'stackIndex': this.stackIndex_ - 1})
          );
          this.updateHistoryState_(newState);
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
  replace(opt_stateUpdate) {
    if (opt_stateUpdate && opt_stateUpdate.url) {
      if (!this.viewer_.hasCapability('fullReplaceHistory')) {
        // Full URL replacement requested, but not supported by the viewer.
        // Don't update, and return the current state.
        const curState = /** @type {!HistoryStateDef} */ (dict(
            {'stackIndex': this.stackIndex_}));
        return Promise.resolve(curState);
      }

      // replace fragment, only explicit fragment param will be sent.
      const url = opt_stateUpdate.url.replace(/#.*/, '');
      opt_stateUpdate.url = url;
    }

    const message = /** @type {!JsonObject} */ (
      Object.assign({'stackIndex': this.stackIndex_}, opt_stateUpdate || {})
    );
    return this.viewer_.sendMessageAwaitResponse('replaceHistory', message,
        /* cancelUnsent */ true).then(response => {
      const newState = /** @type {!HistoryStateDef} */ (response || message);
      this.updateHistoryState_(newState);
      return newState;
    });
  }

  /**
   * Note: Only returns the current `stackIndex`.
   * @override
   */
  get() {
    // Not sure why this type coercion is necessary, but CC complains otherwise.
    return Promise.resolve(/** @type {!HistoryStateDef} */ ({
      data: undefined,
      fragment: '',
      stackIndex: this.stackIndex_,
      title: '',
    }));
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
  onHistoryPopped_(data) {
    if (data['newStackIndex'] !== undefined) {
      data['stackIndex'] = data['newStackIndex'];
    }
    this.updateHistoryState_(/** @type {!HistoryStateDef} */ (data));
  }

  /**
   * @param {!HistoryStateDef} state
   * @private
   */
  updateHistoryState_(state) {
    const {stackIndex} = state;
    if (this.stackIndex_ != stackIndex) {
      dev().fine(TAG_, `stackIndex: ${this.stackIndex_} -> ${stackIndex}`);
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
  getFragment() {
    if (!this.viewer_.hasCapability('fragment')) {
      return Promise.resolve('');
    }
    return this.viewer_.sendMessageAwaitResponse('getFragment', undefined,
        /* cancelUnsent */true).then(
        data => {
          if (!data) {
            return '';
          }
          let hash = dev().assertString(data);
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
  updateFragment(fragment) {
    if (!this.viewer_.hasCapability('fragment')) {
      return Promise.resolve();
    }
    return /** @type {!Promise} */ (this.viewer_.sendMessageAwaitResponse(
        'replaceHistory', dict({'fragment': fragment}),
        /* cancelUnsent */ true));
  }
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!History}
 * @private
 */
function createHistory(ampdoc) {
  const viewer = Services.viewerForDoc(ampdoc);
  let binding;
  if (viewer.isOvertakeHistory() || getMode(ampdoc.win).test ||
          ampdoc.win.AMP_TEST_IFRAME) {
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
