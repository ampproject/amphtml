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

import {
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  getService,
} from '../service';
import {getMode} from '../mode';
import {dev} from '../log';
import {timerFor} from '../services';
import {viewerForDoc} from '../services';


/** @private @const */
const TAG_ = 'History';


/** @private @const */
const HISTORY_PROP_ = 'AMP.History';


/**
 * @return {*}
 * @private
 */
function historyState_(stackIndex) {
  const state = {};
  state[HISTORY_PROP_] = stackIndex;
  return state;
}


/** @typedef {number} */
let HistoryIdDef;


export class History {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!HistoryBindingInterface} binding
   */
  constructor(ampdoc, binding) {
    /** @private @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!../service/timer-impl.Timer} */
    this.timer_ = timerFor(ampdoc.win);

    /** @private @const {!HistoryBindingInterface} */
    this.binding_ = binding;

    /** @private {number} */
    this.stackIndex_ = 0;

    /** @private {!Array<!Function|undefined>} */
    this.stackOnPop_ = [];

    /** @private {!Array<!{callback:function():!Promise, resolve:!Function,reject:!Function}>} */
    this.queue_ = [];

    this.binding_.setOnStackIndexUpdated(this.onStackIndexUpdated_.bind(this));
  }

  /** @private */
  cleanup_() {
    this.binding_.cleanup_();
  }

  /**
   * Pushes new state into history stack with an optional callback to be called
   * when this state is popped.
   * @param {!Function=} opt_onPop
   * @return {!Promise<!HistoryIdDef>}
   */
  push(opt_onPop) {
    return this.enque_(() => {
      return this.binding_.push().then(stackIndex => {
        this.onStackIndexUpdated_(stackIndex);
        if (opt_onPop) {
          this.stackOnPop_[stackIndex] = opt_onPop;
        }
        return stackIndex;
      });
    });
  }

  /**
   * Pops a previously pushed state from the history stack. If onPop callback
   * has been registered, it will be called. All states coming after this
   * state will also be popped and their callbacks executed.
   * @param {!HistoryIdDef} stateId
   * @return {!Promise}
   */
  pop(stateId) {
    return this.enque_(() => {
      return this.binding_.pop(stateId).then(stackIndex => {
        this.onStackIndexUpdated_(stackIndex);
      });
    });
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
      return this.binding_.pop(this.stackIndex_).then(stackIndex => {
        this.onStackIndexUpdated_(stackIndex);
      });
    });
  }

  /**
   * Helper method to handle navigation to a local target, e.g. When a user clicks an
   * anchor link to a local hash - <a href="#section1">Go to section 1</a>.
   *
   * @param {string} target
   * @return {!Promise}
   */
  replaceStateForTarget(target) {
    dev().assert(target[0] == '#', 'target should start with a #');
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
   * @param {number} stackIndex
   * @private
   */
  onStackIndexUpdated_(stackIndex) {
    this.stackIndex_ = stackIndex;
    this.doPop_();
  }

  /** @private */
  doPop_() {
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
        this.timer_.delay(toPop[i], 1);
      }
    }
  }

  /**
   * @param {function():!Promise<RESULT>} callback
   * @return {!Promise<RESULT>}
   * @template RESULT
   * @private
   */
  enque_(callback) {
    let resolve;
    let reject;
    const promise = new Promise((aResolve, aReject) => {
      resolve = aResolve;
      reject = aReject;
    });

    this.queue_.push({callback, resolve, reject});
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

  /** @private */
  cleanup_() {}

  /**
   * Configures a callback to be called when stack index has been updated.
   * @param {function(number)} unusedCallback
   * @protected
   */
  setOnStackIndexUpdated(unusedCallback) {}

  /**
   * Pushes new state into the history stack. Returns promise that yields new
   * stack index.
   * @return {!Promise<number>}
   */
  push() {}

  /**
   * Pops a previously pushed state from the history stack. All states coming
   * after this state will also be popped. Returns promise that yields new
   * state index.
   * @param {number} unusedStackIndex
   * @return {!Promise<number>}
   */
  pop(unusedStackIndex) {}

  /**
   * Replaces the state for local target navigation.
   * @param unusedTarget
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
    this.timer_ = timerFor(win);

    const history = this.win.history;

    /** @private {number} */
    this.startIndex_ = history.length - 1;
    if (history.state && history.state[HISTORY_PROP_] !== undefined) {
      this.startIndex_ = Math.min(history.state[HISTORY_PROP_],
          this.startIndex_);
    }

    /** @private {number} */
    this.stackIndex_ = this.startIndex_;

    /**
     * @private {{promise: !Promise, resolve: !Function,
     *   reject: !Function}|undefined}
     */
    this.waitingState_;

    /** @private {?function(number)} */
    this.onStackIndexUpdated_ = null;

    // A number of browsers do not support history.state. In this cases,
    // History will track its own version. See unsupportedState_.
    /** @private {boolean} @const */
    this.supportsState_ = 'state' in history;

    /** @private {*} */
    this.unsupportedState_ = historyState_(this.stackIndex_);

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
      this.replaceState_(historyState_(this.stackIndex_));
    } catch (e) {
      dev().error(TAG_, 'Initial replaceState failed: ' + e.message);
    }

    history.pushState = this.historyPushState_.bind(this);
    history.replaceState = this.historyReplaceState_.bind(this);


    /**
     * Used to ignore `popstate` handler for cases where we know we caused the
     * popstate event through the use of location.replace.
     * @private {?string}
     **/
    this.lastNavigatedHash_ = null;

    this.popstateHandler_ = e => {
      if (this.lastNavigatedHash_ == this.win.location.hash) {
        return;
      }
      this.lastNavigatedHash_ = this.win.location.hash;
      dev().fine(TAG_, 'popstate event: ' + this.win.history.length + ', ' +
          JSON.stringify(e.state));
      this.onHistoryEvent_();
    };
    this.win.addEventListener('popstate', this.popstateHandler_);
  }

  /** @override */
  cleanup_() {
    if (this.origPushState_) {
      this.win.history.pushState = this.origPushState_;
    }
    if (this.origReplaceState_) {
      this.win.history.replaceState = this.origReplaceState_;
    }
    this.win.removeEventListener('popstate', this.popstateHandler_);
  }

  /** @override */
  setOnStackIndexUpdated(callback) {
    this.onStackIndexUpdated_ = callback;
  }

  /** @override */
  push() {
    return this.whenReady_(() => {
      this.historyPushState_();
      return Promise.resolve(this.stackIndex_);
    });
  }

  /** @override */
  pop(stackIndex) {
    // On pop, stack is not allowed to go prior to the starting point.
    stackIndex = Math.max(stackIndex, this.startIndex_);
    return this.whenReady_(() => {
      // Popping history forget the last navigated hash since we can't really
      // know what hash the browser is going to go to.
      this.lastNavigatedHash_ = null;
      return this.back_(this.stackIndex_ - stackIndex + 1);
    });
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
      this.updateStackIndex_(newStackIndex);
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
      this.updateStackIndex_(newStackIndex);
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
      return this.win.history.state;
    }
    return this.unsupportedState_;
  }

  /** @private */
  assertReady_() {
    dev().assert(!this.waitingState_,
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
    let resolve;
    let reject;
    const promise = this.timer_.timeoutPromise(500,
        new Promise((aResolve, aReject) => {
          resolve = aResolve;
          reject = aReject;
        }));
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
    this.unsupportedState_ = historyState_(this.stackIndex_ - steps);
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
    this.updateStackIndex_(stackIndex);
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
    dev().assert(target[0] == '#', 'target should start with a #');
    this.whenReady_(() => {
      // location.replace will fire a popstate event, this is not a history
      // event. This tells the popstate handler to not handle it by setting
      // the lastNavigatedHash_ to the future hash we know we're going toward.
      // As explained above in the function comment, typically we'd just do
      // replaceState here but in order to trigger :target re-eval we have to
      // use location.replace.
      this.lastNavigatedHash_ = target;
      // TODO(mkhatib, #6095): Chrome iOS will add extra states for location.replace.
      this.win.location.replace(target);
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
    this.updateStackIndex_(stackIndex);
  }

  /**
   * @param {number} stackIndex
   * @private
   */
  updateStackIndex_(stackIndex) {
    this.assertReady_();
    stackIndex = Math.min(stackIndex, this.win.history.length - 1);
    if (this.stackIndex_ != stackIndex) {
      dev().fine(TAG_, 'stack index changed: ' + this.stackIndex_ + ' -> ' +
          stackIndex);
      this.stackIndex_ = stackIndex;
      if (this.onStackIndexUpdated_) {
        this.onStackIndexUpdated_(stackIndex);
      }
    }
  }

  /** @override */
  getFragment() {
    let hash = this.win.location.hash;
    /* Strip leading '#' */
    hash = hash.substr(1);
    return Promise.resolve(hash);
  }

  /** @override */
  updateFragment(fragment) {
    if (this.win.history.replaceState) {
      this.win.history.replaceState({}, '', '#' + fragment);
    }
    return Promise.resolve();
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

    /** @private {?function(number)} */
    this.onStackIndexUpdated_ = null;

    /** @private {!UnlistenDef} */
    this.unlistenOnHistoryPopped_ = this.viewer_.onMessage('historyPopped',
        this.onHistoryPopped_.bind(this));
  }

  /** @override */
  replaceStateForTarget(target) {
    dev().assert(target[0] == '#', 'target should start with a #');
    this.win.location.replace(target);
  }

  /** @override */
  cleanup_() {
    this.unlistenOnHistoryPopped_();
  }

  /** @override */
  setOnStackIndexUpdated(callback) {
    this.onStackIndexUpdated_ = callback;
  }

  /** @override */
  push() {
    // Current implementation doesn't wait for response from viewer.
    this.updateStackIndex_(this.stackIndex_ + 1);
    return this.viewer_.sendMessageAwaitResponse(
        'pushHistory', {stackIndex: this.stackIndex_}).then(() => {
          return this.stackIndex_;
        });
  }

  /** @override */
  pop(stackIndex) {
    if (stackIndex > this.stackIndex_) {
      return Promise.resolve(this.stackIndex_);
    }
    return this.viewer_.sendMessageAwaitResponse(
        'popHistory', {stackIndex: this.stackIndex_}).then(() => {
          this.updateStackIndex_(stackIndex - 1);
          return this.stackIndex_;
        });
  }

  /**
   * @param {!JSONType} data
   * @private
   */
  onHistoryPopped_(data) {
    this.updateStackIndex_(data['newStackIndex']);
  }

  /**
   * @param {number} stackIndex
   * @private
   */
  updateStackIndex_(stackIndex) {
    if (this.stackIndex_ != stackIndex) {
      dev().fine(TAG_, 'stack index changed: ' + this.stackIndex_ + ' -> ' +
          stackIndex);
      this.stackIndex_ = stackIndex;
      if (this.onStackIndexUpdated_) {
        this.onStackIndexUpdated_(stackIndex);
      }
    }
  }

  /** @override */
  getFragment() {
    if (!this.viewer_.hasCapability('fragment')) {
      return Promise.resolve('');
    }
    return this.viewer_.sendMessageAwaitResponse('getFragment', undefined,
        /* cancelUnsent */true).then(
        hash => {
          if (!hash) {
            return '';
          }
          /* Strip leading '#'*/
          if (hash[0] == '#') {
            hash = hash.substr(1);
          }
          return hash;
        });
  }

  /** @override */
  updateFragment(fragment) {
    if (!this.viewer_.hasCapability('fragment')) {
      return Promise.resolve();
    }
    return /** @type {!Promise} */ (this.viewer_.sendMessageAwaitResponse(
        'replaceHistory', {fragment}, /* cancelUnsent */true));
  }
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!History}
 * @private
 */
function createHistory(ampdoc) {
  const viewer = viewerForDoc(ampdoc);
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
  registerServiceBuilderForDoc(
      ampdoc,
      'history',
      /* opt_constructor */ undefined,
      ampdoc => createHistory(ampdoc));
}
