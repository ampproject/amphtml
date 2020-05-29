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

import {dev, devAssert} from '../log';
import {Observable} from '../observable';
import {getMode} from '../mode';
import {findIndex, pushIfNotExist, remove, removeUniqueItem} from '../utils/array';
import {startsWith} from '../string';

// QQQQ: different types of queues:
// - discovery
// - change calc
// - subscribers
// - propagation
// - fast subscribe responses.
// - fast prop scheduling.

// - root, isConnected
// - observers on roots only
// - useState/useStateFactory/useStateConstr/useMemo? with unmount option.
// - reusable objects. e.g. `hasChanged(oldValue, newValue):boolean`.

const NODE_PROP = '__ampNode';
const ASSIGNED_SLOT_PROP = '__ampAssignedSlot';

const PRIVATE_ONLY = {};
const EMPTY_ARRAY = [];

// Relevant node types.
// See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.
const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
// Includes shadow root, template, etc.
const FRAGMENT_NODE = 11;

/**
 * @typedef {{
 *   prop: !ContextPropDef<T>,
 *   value: (T|undefined),
 *   calc: (!ContextCalcDef<T>|undefined),
 * }}
 * @template T
 */
let ProviderDef;

/**
 * @typedef {{
 *   prop: !ContextPropDef<T>,
 *   value: (T|undefined),
 *   pending: boolean,
 *   ping: function(),
 *   calcs: !Array<!ContextCalcDef<T>>,
 *   subscribers: !Array<SubscriberDef>,
 * }}
 * @template T
 */
let UsedDef;

/**
 * @typedef {{
 *   handler: function(T):(?Function|undefined),
 *   fast: boolean,
 *   cleanup: (?Function),
 * }}
 * @template T
 */
let SubscriberDef;

/**
 */
export class ContextNode {

  /**
   * @param {!Node} node
   * @return {!ContextNode}
   */
  static get(node) {
    return (node[NODE_PROP] || (node[NODE_PROP] = new ContextNode(PRIVATE_ONLY, node)));
  }

  /**
   * @param {!Node} node
   * @param {boolean=} excludeSelf
   * @return {?ContextNode}
   */
  static closest(node, excludeSelf = false) {
    let n = node;
    while (n) {
      // Check if a node is a candidate to be returned.
      if (n != node || !excludeSelf) {
        if (n[NODE_PROP]) {
          // Already a discovered node.
          return n[NODE_PROP];
        }
        const {nodeType} = n;
        if (nodeType == DOCUMENT_NODE || nodeType == FRAGMENT_NODE) {
          // A context node is always created for a root. Due to this, a
          // non-root element is always at least attached to a root. This
          // allows for quick discovery and reattachment when new information
          // becomes available.
          return ContextNode.get(n);
        }
        if (nodeType == ELEMENT_NODE && startsWith(n.tagName, 'AMP-')) {
          // An AMP node will always have a context node backing it at some
          // point.
          return ContextNode.get(n);
        }
      }
      // Navigate up the DOM tree. Notice that we do not automatically go over
      // a root node boundary.
      const assignedSlot = n[ASSIGNED_SLOT_PROP] || n.assignedSlot;
      if (assignedSlot) {
        n = assignedSlot;
      } else {
        n = n.parentNode;
      }
    }
    return null;
  }

  //QQQ: should it be exposed?
  // static closestProp(node, prop, excludeSelf = false) {
  //   return ContextNode.closest(node, excludeSelf).get(prop);
  // }

  /**
   * @param {!Node} node
   * @param {!Node} slot
   */
  static assignSlot(node, slot) {
    if (node[ASSIGNED_SLOT_PROP] == slot) {
      return;
    }
    node[ASSIGNED_SLOT_PROP] = devAssert(slot);
    forContained(node, cn => cn.discover());
  }

  /**
   * @param {!Node} node
   * @param {!Node} slot
   */
  static unassignSlot(node, slot) {
    if (node[ASSIGNED_SLOT_PROP] != slot) {
      return;
    }
    delete node[ASSIGNED_SLOT_PROP];
    forContained(node, cn => cn.discover());
  }

  /**
   * @param {!Node} node
   * @param {...!ContextPropDef} props
   */
  static ping(node, ...props) {
    if (props.length > 0) {
      forContained(node, cn => cn.ping(...props));
    }
  }

  /**
   * @param {*} privateOnly
   * @param {!Node} node
   */
  constructor(privateOnly, node) {
    devAssert(privateOnly === PRIVATE_ONLY);

    /** @private @const {!Node} */
    this.node_ = node;

    /** @private {boolean} */
    this.discoverable_ = !this.isRoot;

    /** @private {?ContextNode} */
    this.parent_ = null;

    /** @private {?Array<!ContextNode>} */
    this.children_ = null;

    /** @private {?Map<string, !ProviderDef>} */
    this.providersByKey_ = null;

    /** @private {?Map<string, !UsedDef>} */
    this.usedByKey_ = null;

    /** @private {?Array<function(contextNode: !ContextNode, key: string) */
    this.observers_ = null;

    // Schedulers.
    /** @private @const {function()} */
    this.scheduleDiscover_ = oneAtATime(this.discover_.bind(this));
    /** @private @const {function()} */
    this.scheduleCheckUpdates_ = oneAtATime(this.checkUpdates_.bind(this));

    if (node.nodeType == ELEMENT_NODE && startsWith(node.tagName, 'AMP-')) {
      // QQQ: automatically assign some properties? Or do this as part of a
      // discovery mechanism. Overall, any layout!=container and non-display
      // element should start as non-renderable.
    }

    this.discover();

    if (getMode().localDev || getMode().test) {
      this.debugId = () => debugId(this);
      this.debug = () => debugContextNodeForTesting(this);
      this.debugValues = () => debugValues(this);
      this.debugPending = () => debugPending(this);
      this.debugSet = (key, value) => debugSetForTesting(this, key, value);
    }
  }

  /**
   * @return {boolean}
   */
  get isRoot() {
    if (this.parent_) {
      return false;
    }
    const {nodeType} = this.node_;
    return (nodeType == DOCUMENT_NODE || nodeType == FRAGMENT_NODE);
  }

  /**
   * @return {!Node}
   */
  get node() {
    return this.node_;
  }

  /**
   * @return {!Element}
   */
  get element() {
    return dev().assertElement(this.node_);
  }

  /**
   * @return {!ContextNode}
   */
  get parent() {
    return this.parent_;
  }

  /**
   * Internal observer.
   * @param {function(contextNode: !ContextNode, key: string)}
   * @package
   */
  addObserver(observer) {
    if (!this.observers_) {
      this.observers_ = [];
    }
    this.observers_.push(observer);
  }

  /**
   * Internal observer.
   * @param {function(contextNode: !ContextNode, key: string)}
   * @package
   */
  removeObserver(observer) {
    if (this.observers_) {
      removeUniqueItem(this.observers_, observer);
      if (this.observers_.length == 0) {
        this.observers_ = null;
      }
    }
  }

  /**
   */
  discover() {
    if (this.discoverable_) {
      this.scheduleDiscover_(macrotask);
    }
  }

  /**
   * Sets the strict direct parent. The node will no longer try to discover.
   * @param {!ContextNode|!Node|null|undefined} parent
   */
  reparent(parent) {
    if (parent.nodeType) {
      parent = ContextNode.get(parent);
    }
    this.reparent_(parent, /* stopDiscovery */ parent != null);
  }

  /**
   * @param {...!ContextPropDef} props
   */
  ping(...props) {
    console.log('ContextNode: ping', this.debugId(), props.map(({key}) => key));
    // if (props[0]?.key == 'Renderable') {
    //   debugger;//!!!!!
    // }
    const usedByKey = this.usedByKey_;
    if (props.length == 0 || !usedByKey?.size) {
      return;
    }
    let count = 0;
    props.forEach(prop => {
      const used = usedByKey.get(prop.key);
      if (used && !used.pending) {
        count++;
        used.pending = true;
      }
    });
    if (count > 0) {
      this.scheduleCheckUpdates_(macrotask);
    }
  }

  /**
   * @package TBD to open publically, but performance is a concern.
   */
  pingAll() {
    const usedByKey = this.usedByKey_;
    if (!usedByKey?.size) {
      return;
    }
    let count = 0;
    usedByKey.forEach((used) => {
      if (!used.pending) {
        count++;
        used.pending = true;
      }
    });
    if (count > 0) {
      this.scheduleCheckUpdates_(macrotask);
    }
  }

  /**
   * Sets a prop's "input" value.
   * @param {!ContextPropDef<T>} prop
   * @param {T} value
   * @template T
   */
  set(prop, value) {
    devAssert(value !== undefined);
    this.setOrProvide_(prop, value, undefined);
  }

  /**
   * Sets a prop's calculatable provider.
   * @param {!ContextPropDef<T>} prop
   * @param {!ContextCalcDef<T>} calc
   * @template T
   */
  provide(prop, calc) {
    devAssert(calc);
    this.setOrProvide_(prop, undefined, calc);
  }

  /**
   * Set up a subscriber.
   * @param {!ContextPropDef<T>} prop
   * @param {function(T):(?Function:undefined)} handler
   * @return {!UnsubscribeDef}
   * @template T
   */
  subscribe(prop, handler) {
    this.subscribe_(prop, handler, /* fast */ false);
    return this.unsubscribe_.bind(this, prop, handler);
  }

  /**
   * Set up subscriber.
   * @param {!ContextPropDef} prop
   * @param {function(value: *, prop: *)} handler
   */
  unsubscribe(prop, handler) {
    this.unsubscribe_(prop, handler);
  }

  /**
   * Finds the best-matching parent for this node.
   *
   * Normally runs asynchronously in a scheduler.
   *
   * @private
   */
  discover_() {
    if (this.discoverable_) {
      const parent = ContextNode.closest(this.node_, /* excludeSelf */ true);
      this.reparent_(parent, /* stopDiscovery */ false);
    }
  }

  /**
   * @param {!ContextNode} parent
   * @param {boolean} stopDiscovery
   * @private
   */
  reparent_(parent, stopDiscovery) {
    this.discoverable_ = !this.isRoot && !stopDiscovery;
    const oldParent = this.parent_;
    if (oldParent === parent) {
      // Same parent.
      return;
    }

    const usedByKey = this.usedByKey_;

    // Remove from the old parent.
    if (oldParent && oldParent.children_) {
      removeUniqueItem(oldParent.children_, this);
      if (usedByKey) {
        usedByKey.forEach((used) => {
          const {prop, ping, calcs} = used;
          calcs.forEach(({recursive}) => {
            if (recursive) {
              oldParent.unsubscribe(prop, ping);
            }
          });
        });
      }
    }

    // Add to the new parent.
    this.parent_ = parent;
    if (parent) {
      const children = parent.children_ ?? (parent.children_ = []);
      children.push(this);

      if (usedByKey) {
        usedByKey.forEach((used) => {
          const {prop, ping, calcs} = used;
          calcs.forEach(({recursive}) => {
            if (recursive) {
              parent.subscribe(prop, ping);
            }
          });
        });
      }

      // QQQ: optimize, but reparenting could look like a new observer appeared.
      deepScan(this, (contextNode) => {
        const providersByKey = contextNode.providersByKey_;
        if (providersByKey) {
          providersByKey.forEach((_, key) => {
            contextNode.notifyObservers_(key);
          });
        }
        return true;
      }, true);
    }
  }

  /**
   * @param {!ContextPropDef<T>} prop
   * @param {T|undefined} value
   * @param {!ContextCalcDef<T>|undefined} calc
   * @template T
   * @private
   */
  setOrProvide_(prop, value, calc) {
    devAssert(value !== undefined || calc !== undefined);
    devAssert(value === undefined || calc === undefined);

    const {key} = prop;
    const providersByKey = this.providersByKey_ ?? (this.providersByKey_ = new Map());
    let providers = providersByKey.get(key);
    if (!providers) {
      providers = [];
      providersByKey.set(key, providers);
    }

    const index = findIndex(providers, (provider) => provider.calc === calc);
    if (index == -1) {
      const provider = {
        prop,
        value,
        calc,
      };
      providers.push(provider);
      if (calc !== undefined) {
        const used = this.usedByKey_?.get(key);
        if (used) {
          this.addUsedCalc_(used, calc);
        }
      } else {
        // New input: notify observers.
        this.notifyObservers_(key);
      }
      this.ping(prop);
    } else {
      const provider = providers[index];
      if (value !== provider.value) {
        provider.value = value;
        this.ping(prop);
      }
    }
  }

  /**
   * Set up a subscriber.
   * @param {!ContextPropDef<T>} prop
   * @param {function(T):(?Function:undefined)} handler
   * @param {boolean} fast
   * @template T
   * @private
   */
  subscribe_(prop, handler, fast) {
    const {key, calc} = prop;

    const used = this.startUsed_(prop);

    if (used.subscribers.includes(handler)) {
      // Already a subscriber.
      return;
    }

    const subscriber = {handler, fast, cleanup: null};
    used.subscribers.push(subscriber);

    // First time a handler is added, it's notify right away if the value
    // is present.
    const existingValue = used.value;
    if (existingValue !== undefined) {
      if (fast) {
        subscriber.cleanup = handler(used.value);
      } else {
        macrotask(() => {
          // Only proceed with the notification if nothing has been updated.
          const used = this.usedByKey_?.get(key);
          if (used &&
              used.subscribers.includes(subscriber) &&
              used.value === existingValue) {
            subscriber.cleanup = handler(used.value);
          }
        });
      }
    } else {
      used.ping();
    }
  }

  /**
   * Set up subscriber.
   * @param {!ContextPropDef} prop
   * @param {function(value: *, prop: *)} handler
   * @private
   */
  unsubscribe_(prop, handler) {
    if (!this.usedByKey_) {
      return;
    }

    const { key, calc } = prop;
    const used = this.usedByKey_.get(key);
    if (!used) {
      return;
    }

    const { subscribers, calcs } = used;
    const removed = remove(subscribers, (s) => s.handler == handler);

    // Run cleanups.
    if (removed.length > 0) {
      macrotask(() => {
        removed.forEach(subscriber => {
          const {cleanup} = subscriber;
          subscriber.cleanup = null;
          if (cleanup) {
            protectedNoInline(cleanup);
          }
        });
      });
    }

    // Stop monitoring if there are no subscribers.
    if (subscribers.length == 0) {
      this.stopUsed_(key, used);
    }
  }

  /**
   * @param {!ContextPropDef<T>} prop
   * @return {!UsedDef}
   * @template T
   * @private
   */
  startUsed_(prop) {
    const {key, calc} = prop;
    const usedByKey = this.usedByKey_ ?? (this.usedByKey_ = new Map());
    let used = usedByKey.get(key);
    if (!used) {
      used = {
        prop,
        subscribers: [],
        value: undefined,
        ping: () => {
          if (!used.pending) {
            used.pending = true;
            this.scheduleCheckUpdates_(microtask);
          }
        },
        pending: false,
        calcs: [],
      };
      usedByKey.set(key, used);

      // Subscribe call alcs.
      this.addUsedCalc_(used, calc);
      const providers = this.providersByKey_?.get(key);
      if (providers?.length > 0) {
        providers.forEach(({calc}) => {
          if (calc) {
            this.addUsedCalc_(used, calc);
          }
        });
      }
    }
    return used;
  }

  /**
   * @param {string} key
   * @param {!UsedDef} used
   * @private
   */
  stopUsed_(key, used) {
    this.usedByKey_.delete(key);

    // Unsubscribe itself.
    const { calcs } = used;
    const toRemove = calcs.slice(0);
    toRemove.forEach(calc => this.removeUsedCalc_(used, calc));
  }

  /**
   * @param {!UsedDef} used
   * @param {!ContextCalcDef} calc
   * @private
   */
  addUsedCalc_(used, calc) {
    const {prop, ping, calcs} = used;
    const {recursive, deps} = calc;
    if (!pushIfNotExist(calcs, calc)) {
      // Already been used.
      return;
    }
    if (recursive && this.parent_) {
      this.parent_.subscribe_(prop, ping, /* fast */ true);
    }
    if (deps?.length > 0) {
      deps.forEach((dep) => this.subscribe_(dep, ping, /* fast */ true));
    }
  }

  /**
   * @param {!UsedDef} used
   * @param {!ContextCalcDef} calc
   * @private
   */
  removeUsedCalc_(used, calc) {
    const {prop, ping, calcs} = used;
    const {recursive, deps} = calc;
    if (!removeUniqueItem(calcs, calc)) {
      // Hasn't been used.
      return;
    }
    if (recursive && this.parent_) {
      this.parent_.unsubscribe(prop, ping);
    }
    if (deps?.length > 0) {
      deps.forEach((dep) => this.unsubscribe(dep, ping));
    }
  }

  /** @private */
  checkUpdates_() {
    console.log('ContextNode: checkUpdates: ', this.debugId(), this.debugPending());
    const usedByKey = this.usedByKey_;
    if (!usedByKey?.size) {
      return;
    }

    // QQQ: keep repeating until all resolved? this way we can catch cycles.
    usedByKey.forEach((used) => {
      if (used.pending) {
        this.tryUpdate_(used);
      }
    });
    if (this.debugPending().length > 0) {
      console.log('QQQQ: pending after cycle: ', this.debugId(), this.debugPending());
    }
  }

  /**
   * @param {!UsedDef<T>} used
   * @template T
   * @private
   */
  tryUpdate_(used) {
    const {prop} = used;
    const {key, calc} = prop;

    // The value is not pending anymore. If any of the dependencies will remain
    // unresolved, we will simply need to recomputed it.
    used.pending = false;

    const providers = this.providersByKey_?.get(key) || EMPTY_ARRAY;
    const initialInputIndex = findIndex(providers, ({calc}) => calc === undefined);
    const initialInput = initialInputIndex != -1 ? providers[initialInputIndex].value : undefined;
    let newValue = this.resolveCalc_(key, initialInput, calc);
    providers.forEach(({calc}) => {
      if (!calc) {
        return;
      }
      if (isPromise(newValue)) {
        newValue = newValue.then(() => this.resolveCalc_(key, newValue, calc));
      } else {
        newValue = this.resolveCalc_(key, newValue, calc);
      }
    });

    // Check if the value has been updated.
    if (isPromise(newValue)) {
      newValue.then((resolvedValue) => this.maybeUpdated_(used, resolvedValue));
    } else {
      this.maybeUpdated_(used, newValue);
    }
  }

  /**
   * @param {string} key
   * @param {T|undefined} input
   * @param {!ContextCalcDef<T>} calc
   * @return {T|!Promise<T>|undefined}
   * @template T
   * @private
   */
  resolveCalc_(key, input, calc) {
    const {recursive, deps, compute, rootDefault} = calc;

    const usedByKey = this.usedByKey_;
    const depValues =
      deps?.length > 0 ?
      deps.map(dep => usedByKey?.get(dep.key)?.value) :
      null;

    let newValue;
    if (depValues && depValues.some(isUndefined)) {
      // Some dependencies are still undefined.
      newValue = undefined;
    } else {
      if (recursive) {
        let parentValue;
        if (this.isRoot) {
          parentValue = resolveRootDefault(calc);
        } else {
          parentValue = this.parent_?.usedByKey_?.get(key)?.value;
        }
        if (compute) {
          const inputWithDefault = input !== undefined ? input : rootDefault;
          if (parentValue !== undefined && inputWithDefault !== undefined) {
            newValue = compute(this, inputWithDefault, parentValue, ...depValues);
          } else {
            newValue = undefined;
          }
        } else if (input !== undefined) {
          newValue = input;
        } else {
          newValue = parentValue;
        }
      } else {
        newValue = compute ? compute(this, input, ...depValues) : input;
      }
    }
    return newValue;
  }

  /**
   * @param {!UsedDef<T>} used
   * @param {T|undefined} value
   * @template T
   * @private
   */
  maybeUpdated_(used, value) {
    const {prop, value: oldValue} = used;
    const {key} = prop;
    if (oldValue === value ||
        used !== this.usedByKey_?.get(key)) {
      // Either the value didn't change, or no one needs this value anymore.
      return;
    }

    console.log('ContextNode: updated: ', this.debugId(), key, ':', oldValue, '->', value);
    used.value = value;

    // Notify subscribers.
    const {subscribers} = used;
    // QQQ: optimize
    const execSubscriber = (subscriber) => {
      const {cleanup, handler} = subscriber;
      subscriber.cleanup = null;
      if (cleanup) {
        protectedNoInline(cleanup);
      }
      subscriber.cleanup = protectedNoInline(() => handler(value));
    };
    subscribers.forEach(subscriber => {
      if (subscriber.fast) {
        execSubscriber(subscriber);
      } else {
        macrotask(() => {
          // QQQQ: check the value hasn't changed, etc.
          if (subscribers.indexOf(subscriber) != -1) {
            execSubscriber(subscriber);
          }
        });
      }
    });
  }

  /**
   * @param {string} key
   * @private
   */
  notifyObservers_(key) {
    for (let n = this; n; n = n.parent_) {
      if (n.observers_) {
        n.observers_.forEach(observer => {
          observer(this, key);
        });
      }
    }
  }
}

/**
 * @param {!ContextNode} contextNode
 * @param {!Array<ContextPropDef>} props
 * @param {function(!Array)} values
 * @return {!UnsubscribeDef}
 */
export function subscribeAll(contextNode, props, handler) {
  const values = props.map(() => undefined);
  let cleanup = null;
  const updateAllValues = oneAtATime(() => {
    console.log('QQQQ: update for all', values);
    if (cleanup) {
      protectedNoInline(cleanup);
      cleanup = null;
    }
    const allDefined = values.every(v => v !== undefined);
    if (allDefined) {
      cleanup = handler(...values);
    }
  });
  const updateValue = (index, value) => {
    console.log('QQQQ: update for ', index, '=', value);
    values[index] = value;
    updateAllValues(macrotask);
  };
  const singleHandler = (index, value) => {
    updateValue(index, value);
    return () => updateValue(index, undefined);
  };
  const unsubscribes = props.map((prop, index) =>
    contextNode.subscribe(prop, (value) => singleHandler(index, value)));
  return () => {
    if (cleanup) {
      protectedNoInline(cleanup);
      cleanup = null;
    }
    unsubscribes.forEach(unsubscribe => unsubscribe());
  };
}

/**
 * @param {*} value
 * @return {boolean}
 */
function isPromise(value) {
  return (
    value &&
    typeof value == 'object' &&
    typeof value['then'] == 'function'
  );
}

/**
 * @param {!Map} map
 * @param {!ContextPropDef<T>} prop
 * @param {function():T} factory
 * @return {T}
 * @template T
 */
function getOrCreateInPropMap(map, prop, factory) {//QQQ: used? should?
  const {key} = prop;
  let value = map.get(key);
  if (!value) {
    value = factory(prop);
    map.set(key, value);
  }
  return value;
}

/**
 * @param {!ContextPropDef<T>} prop
 * @return {!UsedDef<T>}
 * @template T
 */
function emptyUsed(prop) {//QQQ: used? should?
  return {
    prop,
    pending: true,
    value: undefined,
    subscribers: [],
  };
}

/**
 * @param {!ContextCalcDef<T>} calc
 * @param {!ContextNode} rootContextNode
 * @return {T|!Promise<T>|undefined}
 * @template T
 */
function resolveRootDefault(calc, rootContextNode) {
  const {rootDefault, rootFactory} = calc;
  if (rootDefault !== undefined) {
    return rootDefault;
  }
  if (rootFactory) {
    return rootFactory(rootContextNode);
  }
  return undefined;
}

/**
 * @param {?Node} node
 * @param {function(!ContextNode)} callback
 * @param {boolean=} excludeSelf
 */
function forContained(node, callback, excludeSelf = false) {
  const closest = ContextNode.closest(node, excludeSelf);
  if (closest.node_ == node) {
    callback(closest);
  } else if (closest.children_) {
    closest.children_.forEach(child => {
      if (node.contains(child.node_)) {
        callback(child);
      }
    });
  }
}

/**
 * @param {!ContextNode} start
 * @param {function(!ContextNode, S):S} callback
 * @param {S} iniState
 * @param {boolean=} excludeSelf
 * @template S
 */
function deepScan(start, callback, iniState, excludeSelf = false) {
  let newState;
  if (excludeSelf) {
    newState = iniState;
  } else {
    newState = callback(start, iniState);
  }
  if (newState != null && start.children_) {
    start.children_.forEach(child =>
      deepScan(child, callback, newState, false));
  }
}

function isUndefined(v) {
  return v === undefined;
}

function protectedNoInline(callback) {
  try {
    return callback();
  } catch (e) {
    // QQQ: remove the need or or reuse the standard rethrowAsync.
    setTimeout(() => { throw e; });
  }
}

/**
 * Creates a function that executes the callback based on the scheduler, but
 * only one task at a time.
 * @param {function()} handler
 * @return {function(function(!Function))}
 */
function oneAtATime(handler) {
  let scheduled = false;
  const handleAndUnschedule = () => {
    scheduled = false;
    handler();
  };
  const scheduleIfNotScheduled = (scheduler) => {
    if (!scheduled) {
      scheduled = true;
      scheduler(handleAndUnschedule);
    }
  };
  return scheduleIfNotScheduled;
}

/**
 * @param {function} callback
 */
function macrotask(callback) {
  setTimeout(callback);
}

/**
 * @param {function} callback
 */
function microtask(callback) {
  Promise.resolve().then(callback);
}

/**
 * @param {!ContextNode} contextNode
 * @return {string}
 */
function debugId(contextNode) {
  if (!contextNode) {
    return null;
  }
  const {node} = contextNode;
  if (node.nodeType == DOCUMENT_NODE) {
    return '#document';
  }
  if (node.nodeType == FRAGMENT_NODE) {
    return '#shadow-root';
  }
  return `${node.tagName.toLowerCase()}${node.id ? '#' + node.id : node.name ? node.name : ''}`;
}

/**
 * @param {!ContextNode} contextNode
 * @return {string}
 */
function debugValues(contextNode) {
  if (!contextNode) {
    return null;
  }
  const usedByKey = contextNode.usedByKey_;
  const values = {};
  if (usedByKey) {
    usedByKey.forEach(({prop, value}) => {
      values[prop.key] = value;
    });
  }
  return values;
}

/**
 * @param {!ContextNode} contextNode
 * @return {string}
 */
function debugPending(contextNode) {
  if (!contextNode) {
    return null;
  }
  const usedByKey = contextNode.usedByKey_;
  const values = {};
  if (usedByKey) {
    usedByKey.forEach(({prop, pending, value}) => {
      if (pending) {
        values[prop.key] = value;
      }
    });
  }
  return values;
}

/**
 * @param {!ContextNode} contextNode
 * @return {!JsonObject}
 */
function debugContextNodeForTesting(contextNode) {
  if (!contextNode) {
    return null;
  }

  function mapDebug(map, getValue) {
    if (!map) {
      return null;
    }
    const obj = {};
    map.forEach((value, key) => {
      obj[key] = getValue ? getValue(key, value) : value;
    });
    return obj;
  }

  return {
    node: debugId(contextNode),
    childrenCount: contextNode.children_ && contextNode.children_.length || 0,
    parent: debugContextNodeForTesting(contextNode.parent_),
    providers: mapDebug(contextNode.providersByKey_),
    used: mapDebug(contextNode.usedByKey_, (key, {value, subscribers}) => ({value, subscriberCount: subscribers.length})),
  };
}

function debugSetForTesting(contextNode, key, value) {
  let prop;
  if (!prop && contextNode.usedByKey_) {
    contextNode.usedByKey_.forEach(({prop: p}) => {
      if (p.key == key) {
        prop = p;
      }
    });
  }
  if (!prop) {
    throw new Error('cannot find definition for ' + key);
  }
  contextNode.qqqq = true;
  contextNode.set(prop, value);
}
