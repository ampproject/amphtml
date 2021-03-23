/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {ContextNode} from './node';
import {arrayOrSingleItemToArray} from '../types';
import {throttleTail, tryCallback} from './scheduler';

const EMPTY_ARRAY = [];
const EMPTY_FUNC = () => {};

/**
 * Subscribes to the specified dependencies. The key API points:
 * - The subscriber is only called when all its dependencies are satisfied.
 * - If all its dependencies are satisfied at the time the subscriber is added,
 *   it's called right away.
 * - The subscriber is called whenever any of its dependencies change.
 * - A subscriber can optionally return a cleanup function.
 *
 * @param {!Node} node
 * @param {!ContextProp|!Array<!ContextProp>} deps
 * @param {function(...?)} callback
 */
export function subscribe(node, deps, callback) {
  deps = arrayOrSingleItemToArray(deps);
  const id = callback;
  const contextNode = ContextNode.get(node);
  contextNode.subscribe(id, Subscriber, callback, deps);
}

/**
 * Removes the subscriber prevoiously registered with `subscribe` API.
 *
 * @param {!Node} node
 * @param {function(...?)} callback
 */
export function unsubscribe(node, callback) {
  const id = callback;
  const contextNode = ContextNode.get(node);
  contextNode.unsubscribe(id);
}

/**
 * The subscriber holder. It encapsulates the subscriber's dependencies,
 * internal state, and cleanup functions.
 *
 * @package
 */
export class Subscriber {
  /**
   * @param {!./node.ContextNode} contextNode
   * @param {function(...?)} func
   * @param {!Array<!ContextProp>} deps
   */
  constructor(contextNode, func, deps) {
    /** @package @const {!./node.ContextNode} */
    this.contextNode = contextNode;

    /** @private @const {!Function} */
    this.func_ = func;

    /** @private @const {!Array<!ContextProp>} */
    this.deps_ = deps;

    /**
     * @private @const {!Array}
     *
     * Start with a pre-allocated array filled with `undefined`. The filling
     * is important to ensure the correct `Array.every` execution.
     */
    this.depValues_ = deps.length > 0 ? deps.map(EMPTY_FUNC) : EMPTY_ARRAY;

    /** @private @const {!Array<function(*)>} */
    this.depSubscribers_ =
      deps.length > 0
        ? deps.map((unusedDep, index) => (value) => {
            this.depValues_[index] = value;
            this.update_();
          })
        : EMPTY_ARRAY;

    /** @private {boolean} */
    this.running_ = false;

    /** @private {?function()} */
    this.runCleanup_ = null;

    // Schedulers.
    /** @private @const {function()} */
    this.update_ = throttleTail(this.update_.bind(this), setTimeout);

    // Subscribe to all dependencies.
    if (deps.length > 0) {
      const {values} = this.contextNode;
      deps.forEach((dep, index) =>
        values.subscribe(dep, this.depSubscribers_[index])
      );
    }

    // Run the first time.
    if (this.isConnected_()) {
      this.update_();
    }
  }

  /**
   * Called when the subscriber is completely discarded, for instance via
   * `ubsubscribe` API.
   */
  dispose() {
    // Unsubscribe from all dependencies.
    if (this.deps_.length > 0) {
      const {values} = this.contextNode;
      this.deps_.forEach((dep, index) =>
        values.unsubscribe(dep, this.depSubscribers_[index])
      );
    }

    this.cleanup_();
  }

  /**
   * Called when the node's root has changed. It can be a different root or
   * the node can be disconnected entirely.
   */
  rootUpdated() {
    const isConnected = this.isConnected_();
    this.cleanup_();
    if (isConnected) {
      this.update_();
    }
  }

  /**
   * @return {boolean}
   * @private
   */
  isConnected_() {
    return !!this.contextNode.root;
  }

  /** @private */
  update_() {
    if (!this.isConnected_()) {
      // The node was disconnected at some point.
      return;
    }
    const running = this.depValues_.every(isDefined);
    if (running) {
      this.running_ = true;
      this.run_();
    } else if (this.running_) {
      this.running_ = false;
      this.cleanup_();
    }
  }

  /** @private */
  run_() {
    // Cleanup the previous run.
    if (this.runCleanup_) {
      tryCallback(this.runCleanup_);
      this.runCleanup_ = null;
    }

    // Run the subscriber.
    const func = this.func_;
    this.runCleanup_ = callHandler(func, this.depValues_);
  }

  /** @private */
  cleanup_() {
    // The last run's cleanup.
    if (this.runCleanup_) {
      tryCallback(this.runCleanup_);
      this.runCleanup_ = null;
    }
  }
}

/**
 * Whether the value is defined.
 *
 * This function only exists to avoid function allocation when calling
 * `Array.every()` and `Array.some()`.
 *
 * @param {*} v
 * @return {boolean}
 */
function isDefined(v) {
  return v !== undefined;
}

/**
 * Creates a subscriber.
 *
 * @param {function(...?)} callback
 * @param {!Array<?>} deps
 * @return {?function()}
 */
function callHandler(callback, deps) {
  switch (deps.length) {
    case 0:
      return callback();
    case 1:
      return callback(deps[0]);
    case 2:
      return callback(deps[0], deps[1]);
    case 3:
      return callback(deps[0], deps[1], deps[2]);
    default:
      return callback.apply(null, deps);
  }
}
