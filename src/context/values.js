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

import {deepScan, findParent} from './scan';
import {devAssert, rethrowAsync} from '../log';
import {pushIfNotExist, removeItem} from '../utils/array';
import {throttleTail} from './scheduler';

const EMPTY_ARRAY = [];
const EMPTY_FUNC = () => {};

/**
 * @enum {number}
 */
const Pending = {
  NOT_PENDING: 0,
  PENDING: 1,
  PENDING_REFRESH_PARENT: 2,
};

/**
 * The structure for a property's inputs. It's important that `values` are
 * easily available as an array to pass them to the `recursive` and
 * `compute` callbacks without reallocation.
 *
 * @typedef {{
 *   values: !Array,
 *   setters: !Array,
 * }}
 */
let InputDef;

/**
 * The structure for a property's computed values and subscribers.
 *
 * @typedef {{
 *   prop: !ContextProp,
 *   subscribers: !Array<!Function>,
 *   value: *,
 *   pending: !Pending,
 *   counter: number,
 *   depsValues: !Array,
 *   parentValue: *,
 *   parentContextNode: ?./node.ContextNode,
 *   ping: function(boolean),
 *   pingDep: !Array<function(*)>,
 *   pingParent: ?function(*),
 * }}
 */
let UsedDef;

/**
 * Propagates context property values in the context tree. The key APIs are
 * `set()` and `subscribe()`. See `ContextProp` type for details on how
 * values are declared and propagated.
 */
export class Values {
  /**
   * @param {!./node.ContextNode} contextNode
   */
  constructor(contextNode) {
    /** @private @const {!./node.ContextNode} */
    this.contextNode_ = contextNode;

    /** @private {?Map<string, !InputDef>} */
    this.inputsByKey_ = null;

    /** @private {?Map<string, !UsedDef>} */
    this.usedByKey_ = null;

    // Schedulers.
    /** @private @const {function()} */
    this.checkUpdates_ = throttleTail(
      this.checkUpdates_.bind(this),
      setTimeout
    );
  }

  /**
   * Sets the property's input value. This is analagous to a CSS specified
   * value. Several values for the same property can be set on a node - one
   * per each setter. A repeated call for the same setter overwrites a
   * previously set input. This is similar to how the same CSS property can be
   * set in a stylesheet using different classes. The property computation
   * decides how to treat several values. For instance:
   * - A property can pick the first set input value (e.g. `font-size`).
   * - A property can pick the min/max set input value (e.g. `priority`).
   * - A property can reduce all values using `AND` (e.g. `renderable`).
   *
   * Once the input is set, the recalculation is rescheduled asynchronously.
   * All dependent properties are also recalculated.
   *
   * @param {!ContextProp<T>} prop
   * @param {*} setter
   * @param {T} value
   * @template T
   */
  set(prop, setter, value) {
    devAssert(setter);
    devAssert(value !== undefined);

    const {key} = prop;

    const inputsByKey = this.inputsByKey_ || (this.inputsByKey_ = new Map());
    let inputs = inputsByKey.get(key);
    if (!inputs) {
      inputs = {
        values: [],
        setters: [],
      };
      inputsByKey.set(key, inputs);
    }
    const index = inputs.setters.indexOf(setter);
    const changed = index == -1 || inputs.values[index] !== value;
    if (index == -1) {
      inputs.setters.push(setter);
      inputs.values.push(value);
    } else if (changed) {
      inputs.values[index] = value;
    }

    if (changed) {
      // An input has been added to a node for a first time. This might
      // affect all values in this and child nodes. The simplest algorithm
      // here is to deep scan all descendants and refresh them.
      // Optimization opportunity: in simple but common manipulations the
      // deepscan can be avoided.
      this.ping(prop, false);
      if (isRecursive(prop)) {
        deepScan(this.contextNode_, scan, prop, true, false);
      }
    }
  }

  /**
   * Unsets the input value for the specified property and setter.
   * See `set()` for more info.
   * @param {!ContextProp} prop
   * @param {*} setter
   */
  remove(prop, setter) {
    devAssert(setter);

    const {key} = prop;
    const inputsByKey = this.inputsByKey_;
    const inputs = inputsByKey && inputsByKey.get(key);
    if (inputs) {
      const index = inputs.setters.indexOf(setter);
      if (index != -1) {
        inputs.setters.splice(index, 1);
        inputs.values.splice(index, 1);
        if (inputs.setters.length == 0) {
          inputsByKey.delete(key);
        }
        deepScan(this.contextNode_, scan, prop);
      }
    }
  }

  /**
   * Whether this node has inputs for the specified property.
   *
   * @param {!ContextProp} prop
   * @return {boolean}
   */
  has(prop) {
    const inputsByKey = this.inputsByKey_;
    return !!inputsByKey && inputsByKey.has(prop.key);
  }

  /**
   * Adds a subscriber for the specified property. If the property has not
   * yet been tracked, the tracking is started. If the used value is
   * already available, the handler is called immediately. The handler is
   * only called if a valid used value is available and only if this value
   * has changed since the last handler call.
   *
   * @param {!ContextProp<T>} prop
   * @param {function(T)} handler
   * @template T
   */
  subscribe(prop, handler) {
    const used = this.startUsed_(prop);

    if (!pushIfNotExist(used.subscribers, handler)) {
      // Already a subscriber.
      return;
    }

    // The handler is notified right away if the value is available.
    const existingValue = used.value;
    if (isDefined(existingValue) && this.isConnected_()) {
      handler(existingValue);
    }
  }

  /**
   * Unsubscribes a previously added handler. If there are no other subscribers
   * the property tracking is stopped and the used value is removed.
   *
   * @param {!ContextProp} prop
   * @param {function(?)} handler
   */
  unsubscribe(prop, handler) {
    const {key} = prop;
    const usedByKey = this.usedByKey_;
    const used = usedByKey && usedByKey.get(key);
    if (!used || !removeItem(used.subscribers, handler)) {
      // Not a subscriber.
      return;
    }

    // If no other subscribers, stop tracking the used value.
    this.stopUsed_(used);
  }

  /**
   * Schedules a recalculation of the specified property, but only if this
   * property is tracked by this node.
   *
   * @param {!ContextProp} prop
   * @param {boolean} refreshParent Whether the parent node needs to be looked
   * up again.
   * @protected
   */
  ping(prop, refreshParent) {
    const {key} = prop;
    const usedByKey = this.usedByKey_;
    const used = usedByKey && usedByKey.get(key);
    if (used) {
      used.ping(refreshParent);
    }
  }

  /**
   * The callback called by the `ContextNode` to notify values of the context
   * tree changes. This callback schedules recalculations if necessary.
   *
   * @package
   */
  parentUpdated() {
    if (this.isConnected_()) {
      // Optimization opportunity: in simpler cases, we may only need to refresh
      // a few specific props or even only specific nodes. E.g. when a single
      // intermediary parent is inserted between a parent and a child, the amount
      // of refreshes only depends on the inputs already set on this parent.
      deepScan(this.contextNode_, scanAll, /* arg */ undefined, EMPTY_ARRAY);
    }
  }

  /**
   * The callback called by the `ContextNode` to notify values of the context
   * root changes. It's possible that a context node is connected, disconnected,
   * or moved to another root. This callback schedules recalculations if
   * necessary.
   *
   * @package
   */
  rootUpdated() {
    const usedByKey = this.usedByKey_;
    if (!usedByKey) {
      return;
    }
    if (this.isConnected_()) {
      // Ping all properties for recalculation when the tree is connected.
      usedByKey.forEach((used) => {
        const {prop} = used;
        this.ping(prop, true);
      });
    } else {
      // On disconnect, only do minimal possible work: disconnect recursive
      // subscribers to ensure that they are not leaked.
      usedByKey.forEach((used) => {
        const {prop} = used;
        if (isRecursive(prop)) {
          this.updateParentContextNode_(used, null);
        }
      });
    }
  }

  /**
   * Used for `deepScan` scanner to notify the subtree that the specified
   * property has changed and needs to be recalculated.
   *
   * Scans are relatively common and this method exists (as opposed to be
   * inlined) only to avoid frequent function allocation.
   *
   * @param {!ContextProp} prop
   * @return {boolean}
   * @protected Necessary for cross-binary access.
   */
  scan(prop) {
    this.ping(prop, true);
    if (!isRecursive(prop)) {
      // Stop the deepscan. The prop doesn't propagate.
      return false;
    }
    if (this.has(prop)) {
      // Stop the deepscan. The node will propagate changes downstream.
      return false;
    }
    return true;
  }

  /**
   * Used for `deepScan` scanner to notify the subtree to recalculate all
   * properties.
   *
   * Scans are relatively common and this method exists (as opposed to be
   * inlined) only to avoid frequent function allocation.
   *
   * @param {!Array<string>} scheduled The already scheduled props.
   * @return {!Array<string>} The new scheduled props.
   * @protected
   */
  scanAll(scheduled) {
    let newScheduled = null;
    const usedByKey = this.usedByKey_;
    if (usedByKey) {
      usedByKey.forEach((used) => {
        const {prop} = used;
        // Only ping unhandled props.
        if ((newScheduled || scheduled).indexOf(prop.key) == -1) {
          this.ping(prop, true);

          if (this.contextNode_.children && this.has(prop)) {
            if (!newScheduled) {
              newScheduled = scheduled.slice(0);
            }
            // Stop the deepscan for this value. It will be propagated
            // by the responsible node.
            newScheduled.push(prop.key);
          }
        }
      });
    }
    return newScheduled || scheduled;
  }

  /**
   * @return {boolean}
   * @private
   */
  isConnected_() {
    return !!this.contextNode_.root;
  }

  /**
   * Start the used value tracker if it hasn't started yet.
   *
   * @param {!ContextProp} prop
   * @return {!UsedDef}
   * @private
   */
  startUsed_(prop) {
    const {key, deps} = prop;
    const usedByKey = this.usedByKey_ || (this.usedByKey_ = new Map());
    let used = usedByKey.get(key);
    if (!used) {
      used = {
        prop,
        subscribers: [],
        value: undefined,
        pending: Pending.NOT_PENDING,
        counter: 0,
        depValues: deps.length > 0 ? deps.map(EMPTY_FUNC) : EMPTY_ARRAY,
        parentValue: undefined,
        parentContextNode: null,
        // Schedule the value recalculation, optionally with the parent
        // refresh.
        ping: (refreshParent) => {
          if (this.isConnected_()) {
            const pending = refreshParent
              ? Pending.PENDING_REFRESH_PARENT
              : Pending.PENDING;
            used.pending = Math.max(used.pending, pending);
            this.checkUpdates_();
          }
        },
        // Schedule the value recalculation due to the dependency change.
        pingDep:
          deps.length > 0
            ? deps.map((dep, index) => (value) => {
                used.depValues[index] = value;
                used.ping();
              })
            : EMPTY_ARRAY,
        // Schedule the value recalculation due to the parent value change.
        pingParent: isRecursive(prop)
          ? (parentValue) => {
              used.parentValue = parentValue;
              used.ping();
            }
          : null,
      };
      usedByKey.set(key, used);

      // Subscribe to all deps.
      deps.forEach((dep, index) => this.subscribe(dep, used.pingDep[index]));

      // Schedule the first refresh.
      used.ping(false);
    }
    return used;
  }

  /**
   * Stop calculating the used value if there are no more subscribers left.
   *
   * @param {!UsedDef} used
   * @private
   */
  stopUsed_(used) {
    if (used.subscribers.length > 0) {
      return;
    }

    const {prop, pingDep} = used;
    const {key, deps} = prop;

    this.usedByKey_.delete(key);

    // Unsubscribe itself.
    this.updateParentContextNode_(used, null);
    if (deps.length > 0) {
      deps.forEach((dep, index) => {
        this.unsubscribe(dep, pingDep[index]);
      });
    }
  }

  /**
   * Check if any properties awaiting recalculation. This method is always
   * scheduled asynchronously and throttled.
   *
   * @private
   */
  checkUpdates_() {
    if (!this.isConnected_()) {
      // The node got disconnected between scheduling and handling.
      return;
    }

    const usedByKey = this.usedByKey_;
    if (!usedByKey) {
      return;
    }

    usedByKey.forEach((used) => {
      used.counter = 0;
    });

    // Recompute all "pinged" values for this node. It checks if dependencies
    // are satisfied and recomputes values accordingly.
    let updated;
    do {
      updated = 0;
      usedByKey.forEach((used) => {
        if (used.pending != Pending.NOT_PENDING) {
          const {key} = used.prop;
          used.counter++;
          if (used.counter > 5) {
            // A simple protection from infinte loops.
            rethrowAsync(new Error('cyclical prop: ' + key));
            used.pending = Pending.NOT_PENDING;
            return;
          }
          updated++;
          this.tryUpdate_(used);
        }
      });
    } while (updated > 0);
  }

  /**
   * @param {!UsedDef} used
   * @private
   */
  tryUpdate_(used) {
    // The value is not pending anymore. If any of the dependencies will remain
    // unresolved, we will simply need to recomputed it.
    const refreshParent = used.pending == Pending.PENDING_REFRESH_PARENT;

    let newValue;
    try {
      newValue = this.calc_(used, refreshParent);
    } catch (e) {
      // This is the narrowest catch to avoid unrelated values breaking each
      // other. The only exposure to the user-code are `recursive` and
      // `compute` methods in the `ContextProp`.
      rethrowAsync(e);
    }

    // Reset pending flag. It's good to reset it after the calculation to
    // ensure that deps are automatically covered.
    used.pending = Pending.NOT_PENDING;

    // Check if the value has been updated.
    this.maybeUpdated_(used, newValue);
  }

  /**
   * @param {!UsedDef} used
   * @param {*} value
   * @private
   */
  maybeUpdated_(used, value) {
    const {prop, value: oldValue} = used;
    const {key} = prop;
    const usedByKey = this.usedByKey_;
    if (
      oldValue === value ||
      used !== (usedByKey && usedByKey.get(key)) ||
      !this.isConnected_()
    ) {
      // Either the value didn't change, or no one needs this value anymore.
      return;
    }

    const node = this.contextNode_.node;
    console.log('context: prop updated: ',
      node.nodeName.toLowerCase() + (node.id ? '#' + node.id : '') +
      (this.contextNode_.name ? '::' + this.contextNode_.name : ''),
      key, value);
    used.value = value;

    // Notify subscribers.
    const {subscribers} = used;
    subscribers.forEach((handler) => {
      handler(value);
    });
  }

  /**
   * The used value calculation algorithm.
   *
   * @param {!UsedDef} used
   * @param {boolean} refreshParent
   * @return {*|undefined} The used value.
   * @private
   */
  calc_(used, refreshParent) {
    devAssert(this.isConnected_());

    const {prop, depValues} = used;
    const {key, compute, defaultValue} = prop;

    const inputsByKey = this.inputsByKey_;
    const inputs = inputsByKey && inputsByKey.get(key);
    const inputValues = inputs && inputs.values;

    // Calculate parent value.
    const recursive = calcRecursive(prop, inputValues);

    // Refresh parent if requested.
    if (refreshParent || recursive != Boolean(used.parentContextNode)) {
      const newParentContextNode = recursive
        ? findParent(this.contextNode_, hasInput, prop, /* includeSelf */ false)
        : null;
      this.updateParentContextNode_(used, newParentContextNode);
    }

    // If no parent node is found, use the default value.
    const parentValue = isDefined(used.parentValue)
      ? used.parentValue
      : recursive && !used.parentContextNode
      ? defaultValue
      : undefined;

    // Calculate the "used" value.
    let newValue = undefined;
    const ready =
      depValues.every(isDefined) && (!recursive || isDefined(parentValue));
    if (ready) {
      const {node} = this.contextNode_;
      if (inputValues && !compute) {
        newValue = inputValues[0];
      } else if (isRecursive(prop)) {
        if (inputValues || depValues.length > 0) {
          // The node specifies its own input values and they need to be
          // recomputed with parent and dep values.
          newValue = callRecursiveCompute(
            compute,
            node,
            inputValues || EMPTY_ARRAY,
            parentValue,
            depValues
          );
        } else if (isDefined(parentValue)) {
          // The node doesn't specify its own value, but parent is available.
          // Since parent is available, it means that the node is recursive.
          newValue = parentValue;
        }
      } else if (compute) {
        newValue = callCompute(
          compute,
          node,
          inputValues || EMPTY_ARRAY,
          depValues
        );
      }
    }

    return newValue;
  }

  /**
   * Update the node from which the parent value is used.
   *
   * @param {!UsedDef} used
   * @param {?./node.ContextNode} newParentContextNode
   * @private
   */
  updateParentContextNode_(used, newParentContextNode) {
    const {prop, parentContextNode: oldParentContextNode, pingParent} = used;
    if (newParentContextNode != oldParentContextNode) {
      used.parentContextNode = newParentContextNode;
      used.parentValue = undefined;

      if (oldParentContextNode) {
        oldParentContextNode.values.unsubscribe(prop, devAssert(pingParent));
      }

      if (newParentContextNode) {
        newParentContextNode.values.subscribe(prop, devAssert(pingParent));
      }
    }
  }
}

/**
 * See `Values.scan()` method.
 *
 * @param {!./node.ContextNode} contextNode
 * @param {!ContextProp} prop
 * @return {boolean}
 */
function scan(contextNode, prop) {
  return contextNode.values.scan(prop);
}

/**
 * See `Values.scanAll()` method.
 *
 * @param {!./node.ContextNode} contextNode
 * @param {*} unusedArg
 * @param {!Array<string>} state
 * @return {!Array<string>}
 */
function scanAll(contextNode, unusedArg, state) {
  return contextNode.values.scanAll(state);
}

/**
 * See `Values.has()` method.
 *
 * @param {!./node.ContextNode} contextNode
 * @param {!ContextProp} prop
 * @return {boolean}
 */
function hasInput(contextNode, prop) {
  return contextNode.values.has(prop);
}

/**
 * Whether the property is recursive.
 *
 * @param {!ContextProp} prop
 * @return {boolean}
 */
function isRecursive(prop) {
  // Only `false` values make a value non-recursive. `true` and
  // `function` values are considered recursive.
  return !!prop.recursive;
}

/**
 * Whether the parent value is required to calculate the used value.
 *
 * @param {!ContextProp} prop
 * @param {?Array} inputs
 * @return {boolean}
 */
function calcRecursive(prop, inputs) {
  const {recursive, compute} = prop;
  if (typeof recursive == 'function') {
    return inputs ? recursive(inputs) : true;
  }
  if (recursive && inputs && !compute) {
    // The default `compute` function is to pick the input value when available
    // and to fallback to the parent. Thus, when inputs are specified,
    // there's no longer a need for the parent.
    return false;
  }
  return recursive;
}

/**
 * A substitute for `compute(...deps)`, but faster.
 *
 * @param {function(!Node, !Array, ...*):*} compute See `ContextProp.compute()`.
 * @param {!Node} node
 * @param {!Array} inputValues
 * @param {!Array} deps
 * @return {*}
 */
function callCompute(compute, node, inputValues, deps) {
  switch (deps.length) {
    case 0:
      return compute(node, inputValues);
    case 1:
      return compute(node, inputValues, deps[0]);
    case 2:
      return compute(node, inputValues, deps[0], deps[1]);
    case 3:
      return compute(node, inputValues, deps[0], deps[1], deps[2]);
    default:
      return compute.apply(null, [node, inputValues].concat(deps));
  }
}

/**
 * A substitute for `compute(parentValue, ...deps)`, but faster.
 *
 * @param {function(!Node, !Array, ...*):*} compute See `ContextProp.compute()`.
 * @param {!Node} node
 * @param {!Array} inputValues
 * @param {*} parentValue
 * @param {!Array} deps
 * @return {*}
 */
function callRecursiveCompute(compute, node, inputValues, parentValue, deps) {
  switch (deps.length) {
    case 0:
      return compute(node, inputValues, parentValue);
    case 1:
      return compute(node, inputValues, parentValue, deps[0]);
    case 2:
      return compute(node, inputValues, parentValue, deps[0], deps[1]);
    case 3:
      return compute(node, inputValues, parentValue, deps[0], deps[1], deps[2]);
    default:
      return compute.apply(null, [node, inputValues, parentValue].concat(deps));
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
