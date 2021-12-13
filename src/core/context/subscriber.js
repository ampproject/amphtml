import {tryCallback} from '#core/error';
import {arrayOrSingleItemToArray} from '#core/types/array';

import {ContextNode} from './node';
import {throttleTail} from './scheduler';

/**
 * @template T, DEP
 * @typedef {import('./types.d').IContextProp<T, DEP>} IContextProp
 */
/**
 * @template DEP
 * @typedef {(function(...DEP):void)
 *          |(function(...DEP):(function():void))} SubscribeCallback
 */

/** @type {Array<*>} */
const EMPTY_ARRAY = [];

/** @type {function():void} */
const EMPTY_FUNC = () => {};

/**
 * Subscribes to the specified dependencies. The key API points:
 * - The subscriber is only called when all its dependencies are satisfied.
 * - If all its dependencies are satisfied at the time the subscriber is added,
 *   it's called right away.
 * - The subscriber is called whenever any of its dependencies change.
 * - A subscriber can optionally return a cleanup function.
 *
 * @param {Node} node
 * @param {IContextProp<DEP, ?>|IContextProp<DEP, ?>[]} deps
 * @param {SubscribeCallback<DEP>} callback
 * @template DEP
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
 * @param {Node} node
 * @param {SubscribeCallback<DEP>} callback
 * @template DEP
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
 * @template DEP
 */
export class Subscriber {
  /**
   * @param {ContextNode<SubscribeCallback<DEP>>} contextNode
   * @param {SubscribeCallback<DEP>} func
   * @param {IContextProp<DEP, ?>[]} deps
   */
  constructor(contextNode, func, deps) {
    /**
     * @package
     * @const
     * @type {ContextNode<SubscribeCallback<DEP>>}
     */
    this.contextNode = contextNode;

    /**
     * @private
     * @const
     * @type {function(DEP):void}
     */
    this.func_ = func;

    /**
     * @private
     * @const
     * @type {IContextProp<DEP, ?>[]}
     */
    this.deps_ = deps;

    /**
     * @private
     * @const
     * @type {(DEP|undefined)[]}
     *
     * Start with a pre-allocated array filled with `undefined`. The filling
     * is important to ensure the correct `Array.every` execution.
     */
    this.depValues_ = deps.length > 0 ? deps.map(EMPTY_FUNC) : EMPTY_ARRAY;

    /**
     * @private
     * @const
     * @type {(function(DEP):void)[]}
     */
    this.depSubscribers_ =
      deps.length > 0
        ? deps.map((unusedDep, index) => (value) => {
            this.depValues_[index] = value;
            this.update_();
          })
        : EMPTY_ARRAY;

    /**
     * @private
     * @type {boolean}
     */
    this.running_ = false;

    /**
     * @private
     * @type {null|void|function():void}
     */
    this.runCleanup_ = null;

    // Schedulers.
    /**
     * @private
     * @const
     * @type {function():void}
     */
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
    this.cleanup_();
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
 * @param {SubscribeCallback<DEP>} callback
 * @param {DEP[]} deps
 * @return {ReturnType<SubscribeCallback<DEP>>}
 * @template DEP
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
