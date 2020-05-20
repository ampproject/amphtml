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

import {devAssert} from '../log';
import {Observable} from '../observable';
import {getMode} from '../mode';
import {pushIfNotExist, remove, removeUniqueItem} from '../utils/array';
import {startsWith} from '../string';

// QQQQ: different types of queues:
// - discovery
// - change calc
// - subscribers
// - propagation

// QQQQ: disconnect logic with cleanup.

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
 *   handler: function(T):(?Function|undefined),
 *   cleanup: (?Function),
 * }}
 * @template T
 */
let SubscriberDef;

/**
 * @typedef {{
 *   prop: !ContextPropDef<T>,
 *   value: T,
 *   subscribers: !Array<SubscriberDef>,
 * }}
 * @template T
 */
let UsedDef;

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

  /**
   * @param {!Node} node
   * @param {!ContextPropDef<T>} prop
   * @param {boolean=} excludeSelf
   * @return {!Promise<?T>}
   * @template T
   */
  static closestProp(node, prop, excludeSelf = false) {
    return ContextNode.closest(node, excludeSelf).get(prop);
  }

  /**
   * @param {!Node} node
   * @param {!Node} slot
   */
  static assignSlot(node, slot) {
    if (node[ASSIGNED_SLOT_PROP] == slot) {
      return;
    }
    node[ASSIGNED_SLOT_PROP] = devAssert(slot);
    ContextNode.forContained(node, cn => cn.discover());
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
    ContextNode.forContained(node, cn => cn.discover());
  }

  /**
   * @param {?Node} node
   * @param {function(!ContextNode)} callback
   * @param {boolean=} excludeSelf
   */
  static forContained(node, callback, excludeSelf = false) {
    //QQQ: make this a private method?
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
   * @param {!Node} node
   * @param {...!ContextPropDef} props
   */
  static ping(node, ...props) {
    if (props.length > 0) {
      ContextNode.forContained(node, cn => cn.ping(...props));
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

    /** @private {?Map<string, *>} */
    this.inputsByKey_ = null;

    /** @private {?Map<string, !UsedDef>} */
    this.usedByKey_ = null;

    /** @private {?Array<!ContextPropDef>} */
    this.checkProps_ = null;

    /** @private {boolean} */
    this.checkPropsAll_ = false;

    /** @private {?Array<function(contextNode: !ContextNode, key: string, value: *) */
    this.observers_ = null;

    // Schedulers.
    /** @private @const {function()} */
    this.scheduleDiscover_ = oneAtATime(this.discover_.bind(this), macrotask);
    /** @private @const {function()} */
    this.scheduleCheckUpdates_ = oneAtATime(this.checkUpdates_.bind(this), macrotask);

    if (node.nodeType == ELEMENT_NODE && startsWith(node.tagName, 'AMP-')) {
      // QQQ: automatically assign some properties? Or do this as part of a
      // discovery mechanism. Overall, any layout!=container and non-display
      // element should start as non-renderable.
    }

    this.discover();

    if (getMode().localDev || getMode().test) {
      this.debug = () => debugContextNodeForTesting(this);
    }
  }

  /**
   * @return {boolean}
   */
  get isRoot() {
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
   * @return {!ContextNode}
   */
  get parent() {
    return this.parent_;
  }

  /**
   * Internal observer.
   * @param {function(contextNode: !ContextNode, key: string, value: *)}
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
   * @param {function(contextNode: !ContextNode, key: string, value: *)}
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
      this.scheduleDiscover_();
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
    if (props.length == 0) {
      return;
    }
    const checkProps = this.checkProps_ ?? (this.checkProps_ = []);
    props.forEach(prop => {
      if (!checkProps.some(item => item.key == prop.key)) {
        checkProps.push(prop);
      }
    });
    if (checkProps.length > 0) {
      this.scheduleCheckUpdates_();
    }
  }

  /**
   * @package TBD to open publically, but performance is a concern.
   */
  pingAll() {
    this.checkPropsAll_ = true;
    this.scheduleCheckUpdates_();
  }

  /**
   * Sets a prop's "input" value.
   * @param {!ContextPropDef<T>} prop
   * @param {T|undefined} input
   * @template T
   */
  set(prop, input) {
    const {key} = prop;
    const inputsByKey = this.inputsByKey_ ?? (this.inputsByKey_ = new Map());
    const oldInput = inputsByKey.get(key);
    if (input !== oldInput) {
      if (input === undefined) {
        inputsByKey.delete(key);
      } else {
        inputsByKey.set(key, input);
      }
      this.ping(prop);
    }
  }

  /**
   * @param {!ContextPropDef<T>} prop
   * @return {!Promise<T|undefined>}
   * @template T
   */
  get(prop) {
    return Promise.resolve(this.getOrCalc_(prop));
  }

  /**
   * Set up a subscriber.
   * @param {!ContextPropDef} prop
   * @param {function(value: *, prop: *)} handler
   * @return {!UnsubscribeDef}
   */
  subscribe(prop, handler) {
    const {key} = prop;
    const subscriber = {handler, cleanup: null};

    const usedByKey = this.usedByKey_ ?? (this.usedByKey_ = new Map());
    const used = getOrCreateInPropMap(this.usedByKey_, prop, emptyUsed);
    used.subscribers.push(subscriber);

    const existingValue = used.value;
    if (existingValue !== undefined) {
      // First time a handler is added, it's notify right away if the value
      // is present.
      macrotask(() => {
        // Only proceed with the notification if nothing has been updated.
        const used = usedByKey.get(key);
        if (used &&
            used.subscribers.includes(subscriber) &&
            used.value === existingValue) {
          subscriber.cleanup = handler(used.value);
        }
      });
    }

    return this.unsubscribe.bind(this, prop, handler);
  }

  /**
   * Set up subscriber.
   * @param {!ContextPropDef} prop
   * @param {function(value: *, prop: *)} handler
   */
  unsubscribe(prop, handler) {
    if (!this.usedByKey_) {
      return;
    }

    const { key } = prop;
    const used = this.usedByKey_.get(key);
    if (!used) {
      return;
    }

    const { subscribers } = used;
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
      this.usedByKey_.delete(key);
    }
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

    // Remove from the old parent.
    if (oldParent && oldParent.children_) {
      removeUniqueItem(oldParent.children_, this);
    }

    // Add to the new parent.
    this.parent_ = parent;
    if (parent) {
      const children = parent.children_ ?? (parent.children_ = []);
      children.push(this);
    }

    // Schedule updates.
    this.pingAll();
  }

  /** @private */
  checkUpdates_() {
    if (this.checkPropsAll_) {
      // Check all props.
      if (this.checkProps_) {
        this.checkProps_.length = 0;
      }

      // Check updates for own props.
      if (this.usedByKey_) {
        this.usedByKey_.forEach((used) => {
          this.calc_(used.prop);
        });
      }

      this.checkPropsAll_ = false;

      // Check updates for recursive props.
      // QQQ: optimizable.
      deepScan(this, (contextNode, state) => {
        const hasChildren = contextNode.children_?.length > 0;
        let handledPropKeys = /** {@type {!Array<string>}} */ state;
        const usedByKey = contextNode.usedByKey_;
        if (usedByKey) {
          if (hasChildren) {
            handledPropKeys = handledPropKeys.slice(0);
          }
          usedByKey.forEach((used) => {
            const {prop} = used;
            const {key, value: {recursive}} = prop;
            if (recursive) {
              if (hasChildren) {
                pushIfNotExist(handledPropKeys, key);
              }
              if (contextNode != this) {
                contextNode.ping(prop);
              }
            }
          });
        }
        return handledPropKeys;
      }, []);
    } else if (this.checkProps_?.length > 0) {
      // Check a subset of props.
      const usedByKey = this.usedByKey_;
      while (this.checkProps_.length > 0) {
        const prop = this.checkProps_.pop();
        // QQQ: this doesn't work with value override. prop might be non-recursive,
        // but value could be recursive still.
        const {key, value: {recursive}} = prop;
        if (usedByKey?.has(key)) {
          // Recalculate an own prop.
          this.calc_(prop);
        } else if (recursive) {
          // This node does not depend on the value. But children might.
          // Recalculate recursive props.
          // QQQ: optimizable: we just need to store the node dependencies for
          // each value and no need to do depth-search over the tree. I.e. if there
          // are no subscribers, we can just skip this branch entirely.
          deepScan(this, (contextNode, state) => {
            const usedByKey = contextNode.usedByKey_;
            if (usedByKey?.has(key)) {
              contextNode.ping(prop);
              return null; // Exit scan.
            }
            return true;
          }, true, /* excludeSelf */ false);
        }
      }
    }
  }

  /**
   * @param {!ContextPropDef<T>} prop
   * @return {T|!Promise<T>|undefined}
   * @private
   */
  getOrCalc_(prop) {
    const {key} = prop;

    const pending = (
      this.checkPropsAll_ ||
      this.checkProps_ && this.checkProps_.some(item => item.key == prop.key)
    );

    // If the prop is already defined on a node, return its value.
    if (!pending && this.usedByKey_) {
      const existing = this.usedByKey_.get(key);
      if (existing?.value !== undefined) {
        return existing.value;
      }
    }

    if (pending && this.checkProps_?.length) {
      remove(this.checkProps_, item => item.key == prop.key);
    }
    return this.calc_(prop);
  }

  /**
   * @param {!ContextPropDef<T>} prop
   * @return {T|!Promise<T>|undefined}
   * @private
   */
  calc_(prop) {//QQQ: check calls on what prop is usually passed.
    const {key, value: {deps, recursive, compute, rootDefault}} = prop;

    const depValues =
      deps ?
      deps.map(dep => this.getOrCalc_(dep)) :
      EMPTY_ARRAY;

    const input = this.inputsByKey_?.get(key);

    // Calculate the used value.
    let value;

    // We need a parent value for the default value, or if this value
    // is calculated based on the parent.
    if (recursive && (input === undefined || compute)) {
      let parentValue;
      if (this.isRoot) {
        parentValue = resolveRootDefault(prop);
      } else if (this.parent_) {
        // QQQ: optimazable - we don't need to check every node to the parent,
        // only those that define/use the prop.
        parentValue = this.parent_.getOrCalc_(prop);
      }
      if (parentValue !== undefined &&
          input !== undefined &&
          compute) {
        // Calculate the used value as a function of input and parent values.
        if (isPromise(parentValue)) {
          value = parentValue.then(parentValue => compute(input, parentValue, ...depValues));
        } else {
          value = compute(input, parentValue, ...depValues);
        }
      } else {
        // No input, parentValue is the used value.
        value = parentValue;
      }
    } else {
      // A non-recursive prop or a non-recursive value.
      value = compute ? compute(input, ...depValues) : input;
    }

    // Check updates.
    if (isPromise(value)) {
      value.then(value => this.maybeUpdated_(prop, value));
    } else {
      this.maybeUpdated_(prop, value);
    }
    return value;
  }

  /**
   * @param {!ContextPropDef} prop
   * @param {*} value
   * @private
   */
  maybeUpdated_(prop, value) {
    const {key, value: {recursive}} = prop;//QQQ: check calls on what prop is usually used.
    const used = this.usedByKey_?.get(key);
    if (!used) {
      // No one needs this value anymore.
      return;
    }
    const oldValue = used.value;
    if (oldValue === value) {
      // No updates found.
      return;
    }

    used.value = value;

    // Notify subscribers.
    // QQQ: one microtask for all handler or per handler?
    const {subscribers} = used;
    macrotask(() => {
      subscribers.forEach(subscriber => {
        const {cleanup, handler} = subscriber;
        subscriber.cleanup = null;
        if (cleanup) {
          protectedNoInline(cleanup);
        }
        subscriber.cleanup = protectedNoInline(() => handler(value));
      });
    });

    // Notify observers.
    this.notifyUpdated_(key, value);

    // Propagate to children.
    if (recursive && this.children_) {
      // QQQ: optimizable: can propagate only to explicit dependants.
      this.children_.forEach(child => child.ping(prop));
    }
  }

  /**
   * @param {string} key
   * @param {*} value
   * @private
   */
  notifyUpdated_(key, value) {
    for (let n = this; n; n = n.parent_) {
      if (n.observers_) {
        n.observers_.forEach(observer => {
          observer(this, key, value);
        });
      }
    }
  }
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
function getOrCreateInPropMap(map, prop, factory) {
  //QQQ: anyone else needs this method?
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
function emptyUsed(prop) {
  return {
    prop,
    value: undefined,
    subscribers: [],
  };
}

/**
 * @param {!ContextPropDef<T>} prop
 * @param {!ContextNode} rootContextNode
 * @return {T|!Promise<T>|undefined}
 * @template T
 */
function resolveRootDefault(prop, rootContextNode) {
  const {value: {rootDefault, rootFactory}} = prop;
  if (rootDefault !== undefined) {
    return rootDefault;
  }
  if (rootFactory) {
    return rootFactory(rootContextNode);
  }
  return undefined;
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
 * @param {function(function())} scheduler
 * @return {function()}
 */
function oneAtATime(handler, scheduler) {
  let scheduled = false;
  const handleAndUnschedule = () => {
    scheduled = false;
    handler();
  };
  const scheduleIfNotScheduled = () => {
    if (!scheduled) {
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
 * @param {!ContextNode} contextNode
 * @return {!JsonObject}
 */
function debugContextNodeForTesting(contextNode) {
  if (!contextNode) {
    return null;
  }

  function nodeDebug(node) {
    if (!node) {
      return null;
    }
    return `${node.node_.tagName.toLowerCase()}${node.node_.id ? '#' + node.node_.id : ''}`;
  }

  function path(node) {
    if (!node) {
      return [];
    }
    const p = [];
    for (let n = node; n; n = n.parent_) {
      p.push(n);
    }
    return p;
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
    node: nodeDebug(contextNode),
    childrenCount: contextNode.children_ && contextNode.children_.length || 0,
    parent: debugContextNodeForTesting(contextNode.parent_),
    inputs: mapDebug(contextNode.inputsByKey_),
    used: mapDebug(contextNode.usedByKey_, (key, {value, subscribers}) => ({value, subscriberCount: subscribers.length})),
  };
}
