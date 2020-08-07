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
import {protectedNoInline, throttleTail} from './scheduler';
import {pushIfNotExist, removeItem} from '../utils/array';
import {withComponent} from './component-hooks';

const EMPTY_ARRAY = [];
const EMPTY_FUNC = () => {};

/**
 * @typedef {function(*, !./node.ContextNode, !Function, !Array<ContextProp>):!Component}
 * @package
 *
 * The factory arguments are:
 * 1. An opaque ID value.
 * 2. The context node where component is attached.
 * 3. The component's function.
 * 4. An array of dependencies.
 */
export let ComponentFactoryDef;

/**
 * The component holder. It encapsulates the component's dependencies, input,
 * internal state, and cleanup functions.
 *
 * @package
 */
export class Component {
  /**
   * @param {*} id An opaque component ID.
   * @param {!./node.ContextNode} contextNode
   * @param {!Function} func
   * @param {!Array<!ContextProp>} deps
   */
  constructor(id, contextNode, func, deps) {
    /** @package @const {*} */
    this.id = id;

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

    /** @private {*|undefined} */
    this.input_ = undefined;

    /** @private {boolean} */
    this.running_ = false;

    /** @private {?Array<{current: ?}>} */
    this.refs_ = null;

    /** @private {number} */
    this.refPointer_ = -1;

    /** @private {?function()} */
    this.runCleanup_ = null;

    /** @private {?Array<function()>} */
    this.cleanups_ = null;

    /** @private {?Map<!./node.ContextNode, !Array<!ContextProp>>} */
    this.childProps_ = null;

    /** @private {?Map<!./node.ContextNode, !Array<*>>} */
    this.childComps_ = null;

    // Schedulers.
    /** @private @const {function()} */
    this.update_ = throttleTail(this.update_.bind(this), setTimeout);

    /** @private @const {function()} */
    this.run_ = this.run_.bind(this);

    /** @private @const {function(!ContextNode)} */
    this.cleanupChild_ = this.cleanupChild_.bind(this);

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
   * Called when the component is completely discarded, for instance via
   * `removeComponent` API.
   */
  dispose() {
    // Unsubscribe from all dependencies.
    if (this.deps_.length > 0) {
      const {values} = this.contextNode;
      this.deps_.forEach((dep, index) =>
        values.unsubscribe(dep, this.depSubscribers_[index])
      );
    }

    this.cleanup_(/* cleanupChildren */ true);
  }

  /**
   * Called when the node's root has changed. It can be a different root or
   * the node can be disconnected entirely.
   */
  rootUpdated() {
    const isConnected = this.isConnected_();
    this.cleanup_(/* cleanupChildren */ !isConnected);
    if (isConnected) {
      this.update_();
    }
  }

  /**
   * Sets the component's input.
   * @param {*} input
   */
  set(input) {
    if (this.input_ !== input) {
      this.input_ = input;
      if (this.isConnected_()) {
        this.update_();
      }
    }
  }

  /**
   * Allocates a new reference in the component's internal state.
   *
   * See `useRef` hook for more info.
   *
   * @param {T} def
   * @return {{current: T}}
   * @template T
   */
  allocRef(def = undefined) {
    const refs = this.refs_ || (this.refs_ = []);
    const pointer = ++this.refPointer_;
    return refs[pointer] || (refs[pointer] = {current: def});
  }

  /**
   * Register a cleanup handler that will be called when the component is
   * cleaned up, either due to the node being disconnected, or the component
   * being removed.
   *
   * @param {function()} cleanup
   */
  pushCleanup(cleanup) {
    const cleanups = this.cleanups_ || (this.cleanups_ = []);
    pushIfNotExist(cleanups, cleanup);
  }

  /**
   * Unregisters a cleanup handler previously registered with `pushCleanup`.
   *
   * @param {function()} cleanup
   */
  popCleanup(cleanup) {
    const cleanups = this.cleanups_;
    if (cleanups) {
      removeItem(cleanups, cleanup);
    }
  }

  /**
   * Sets the child prop on this or another node.
   *
   * @param {!ContextProp<T>} prop
   * @param {T} value
   * @param {!Node=} node
   * @template T
   * @package
   */
  setProp(prop, value, node = undefined) {
    const contextNode = node ? ContextNode.get(node) : this.contextNode;

    // Set the prop.
    contextNode.values.set(prop, /* setter */ this, value);

    // Track the prop on the node.
    const childProps = this.childProps_ || (this.childProps_ = new Map());
    let props = childProps && childProps.get(contextNode);
    if (!props) {
      if (contextNode != this.contextNode) {
        // The first prop or a component set on another (not this) node:
        // register the cleanup handler.
        this.maybeRegisterChildCleanup_(contextNode);
      }
      props = [];
      childProps.set(contextNode, props);
    }
    pushIfNotExist(props, prop);
  }

  /**
   * Removes the child prop previously set by the `setProp`.
   *
   * @param {!ContextProp<T>} prop
   * @param {!Node=} node
   * @template T
   * @package
   */
  removeProp(prop, node = undefined) {
    const contextNode = node ? ContextNode.get(node) : this.contextNode;

    // Remove the prop.
    contextNode.values.remove(prop, /* setter */ this);

    // Untrack the prop.
    const childProps = this.childProps_;
    const props = childProps && childProps.get(contextNode);
    if (props) {
      removeItem(props, prop);
      if (props.length == 0 && contextNode != this.contextNode) {
        childProps.delete(contextNode);
        this.maybeUnregisterChildCleanup_(contextNode);
      }
    }
  }

  /**
   * Sets the child component on this or another node.
   *
   * @param {*} id
   * @param {ComponentFactoryDef} factory
   * @param {!Function} func
   * @param {!Array<!ContextProp>} deps
   * @param {*} input
   * @param {!Node=} node
   * @package
   */
  setComponent(id, factory, func, deps, input, node = undefined) {
    const contextNode = node ? ContextNode.get(node) : this.contextNode;

    // Set the component.
    contextNode.setComponent(id, factory, func, deps, input);

    // Track the child component on the node.
    const childComps = this.childComps_ || (this.childComps_ = new Map());
    let comps = childComps && childComps.get(contextNode);
    if (!comps) {
      if (contextNode != this.contextNode) {
        // The first comp set on another (not this) node: register the cleanup
        // handler.
        this.maybeRegisterChildCleanup_(contextNode);
      }
      comps = [];
      childComps.set(contextNode, comps);
    }
    pushIfNotExist(comps, id);
  }

  /**
   * Removes the child component previously set by the `setComponent`.
   *
   * @param {*} id
   * @param {!Node=} node
   * @package
   */
  removeComponent(id, node = undefined) {
    const contextNode = node ? ContextNode.get(node) : this.contextNode;

    // Remove the component.
    contextNode.removeComponent(id);

    // Untrack the child component.
    const childComps = this.childComps_;
    const comps = childComps && childComps.get(contextNode);
    if (comps) {
      removeItem(comps, id);
      if (comps.length == 0 && contextNode != this.contextNode) {
        childComps.delete(contextNode);
        this.maybeUnregisterChildCleanup_(contextNode);
      }
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
      this.refPointer_ = -1;
      withComponent(this, this.run_);
    } else if (this.running_) {
      this.running_ = false;
      this.cleanup_(/* cleanupChildren */ false);
    }
  }

  /** @private */
  run_() {
    // Cleanup the previous run.
    if (this.runCleanup_) {
      protectedNoInline(this.runCleanup_);
      this.runCleanup_ = null;
    }

    // Run the component.
    const func = this.func_;
    this.runCleanup_ = func(this, this.input_, this.depValues_);
  }

  /**
   * @param {boolean} cleanupChildren
   * @private
   */
  cleanup_(cleanupChildren) {
    // Cleanup children.
    if (cleanupChildren) {
      const childProps = this.childProps_;
      if (childProps) {
        childProps.forEach((props, contextNode) => {
          props.forEach((prop) => {
            contextNode.values.remove(prop, /* setter */ this);
          });
        });
        this.childProps_ = null;
      }

      const childComps = this.childComps_;
      if (childComps) {
        childComps.forEach((comps, contextNode) => {
          comps.forEach((id) => {
            contextNode.removeComponent(id);
          });
        });
      }
    }

    // The last run's cleanup.
    if (this.runCleanup_) {
      protectedNoInline(this.runCleanup_);
      this.runCleanup_ = null;
    }

    // Hook cleanups.
    const cleanups = this.cleanups_;
    if (cleanups) {
      for (let i = 0; i < cleanups.length; i++) {
        protectedNoInline(cleanups[i]);
      }
      this.cleanups_.length = 0;
    }
  }

  /**
   * @param {!./node.ContextNode} child
   * @private
   */
  maybeRegisterChildCleanup_(child) {
    const {childProps_: childProps, childComps_: childComps} = this;
    if (
      (!childProps || !childProps.has(child)) &&
      (!childComps || !childComps.has(child))
    ) {
      child.pushCleanup(this.cleanupChild_);
    }
  }

  /**
   * @param {!./node.ContextNode} child
   * @private
   */
  maybeUnregisterChildCleanup_(child) {
    const {childProps_: childProps, childComps_: childComps} = this;
    if (
      (!childProps || !childProps.has(child)) &&
      (!childComps || !childComps.has(child))
    ) {
      child.popCleanup(this.cleanupChild_);
    }
  }

  /**
   * @param {!./node.ContextNode} child
   * @private
   */
  cleanupChild_(child) {
    const childProps = this.childProps_;
    const props = childProps && childProps.get(child);
    if (props) {
      childProps.delete(child);
      props.forEach((prop) => child.values.remove(prop, /* setter */ this));
    }

    const childComps = this.childComps_;
    const comps = childComps && childComps.get(child);
    if (comps) {
      childComps.delete(child);
      comps.forEach((id) => child.removeComponent(id));
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
