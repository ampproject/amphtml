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
import {toKey} from './context-type';

const NODE_PROP = '__ampNode';
const ASSIGNED_SLOT_PROP = '__ampAssignedSlot';
const PRIVATE_ONLY = {};

const DOCUMENT_NODE = 9;
// Includes shadow root, template, etc.
const FRAGMENT_NODE = 11;

/** @type {?Promise} */
let microtaskPromise = null;

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
   * @param {!Node} slot
   */
  static assignSlot(node, slot) {
    if (node[ASSIGNED_SLOT_PROP] == slot) {
      return;
    }
    node[ASSIGNED_SLOT_PROP] = devAssert(slot);
    const closest = ContextNode.closest(node);
    if (closest) {
      // QQQ: rediscoverFrom
      if (closest.node_ == node) {
        closest.discover();
      } else if (closest.children_) {
        closest.children_.forEach(child => {
          if (node.contains(child.node_)) {
            child.discover();
          }
        });
      }
    }
  }

  /**
   * @param {!Node} node
   * @param {!Node} slot
   */
  static unassignSlot(node, slot) {
    if (node[ASSIGNED_SLOT_PROP] != slot) {
      return;
    }
    node[ASSIGNED_SLOT_PROP] = null;
    const closest = ContextNode.closest(node);
    if (closest) {
      // QQQQ: discoverFrom(node)
    }
  }

  /**
   * @param {?Node} node
   * @param {boolean=} excludeSelf
   * @return {?ContextNode}
   */
  static closest(node, excludeSelf) {
    let n = node;
    while (n) {
      if ((n != node || !excludeSelf) && n[NODE_PROP]) {
        return n[NODE_PROP];
      }
      if (n.nodeType == DOCUMENT_NODE || n.nodeType == FRAGMENT_NODE) {
        // QQQQ: controvercial: automatically includes a root.
        return ((n != node || !excludeSelf)) ? ContextNode.get(n) : null;
      }
      const assignedSlot = n[ASSIGNED_SLOT_PROP] || n.assignedSlot;
      if (assignedSlot) {
        n = assignedSlot;
      // QQQQ
      } else if (n.nodeType == FRAGMENT_NODE) {
        n = n.host;
      } else {
        n = n.parentNode;
      }
    }
    return null;
  }

  /**
   * @param {?Node} node
   * @param {!ContextTypeDef} contextType
   */
  static getContext(node, contextType) {
    const contextNode = ContextNode.closest(node);
    return contextNode && contextNode.get(contextType);
  }

  /**
   * @param {*} privateOnly
   * @param {!Node} node
   */
  constructor(privateOnly, node) {
    devAssert(privateOnly === PRIVATE_ONLY);

    /** @private @const {!Node} */
    this.node_ = node;

    /** @private {?Array<!ContextNode>} */
    this.children_ = null;

    /** @private {boolean} */
    this.discoverable_ = true;

    /** @private {?ContextNode} */
    this.parent_ = null;

    /** @private {boolean} */
    this.changedScheduled_ = false;

    /** @private {?Map} */
    this.selfContexts_ = null;

    /** @private {?Map} */
    this.subtreeContexts_ = null;

    /** @private {?Map<string, {value: *, observers: !Observable}>} */
    this.subscribers_ = null;

    /** @private {?Observable<{contextNode: !ContextNode, keys: !Array<string>}>} */
    this.observers_ = null;

    this.discover();

    if (getMode().localDev || getMode().test) {
      this.debug = () => debugContextNodeForTesting(this);
    }
  }

  /**
   * @return {!Node}
   */
  getNode() {
    return this.node_;
  }

  /**
   * @package
   */
  addObserver(observer) {
    // QQQQ: move to module-level and restricted.
    if (!this.observers_) {
      this.observers_ = new Observable();
    }
    this.observers_.add(observer);
  }

  /**
   * @package
   */
  removeObserver(observer) {
    // QQQQ: move to module-level and restricted.
    if (this.observers_) {
      this.observers_.remove(observer);
      if (this.observers_.getHandlerCount() == 0) {
        this.observers_ = null;
      }
    }
  }

  /**
   */
  discover() {
    if (!this.discoverable_) {
      return;
    }
    // QQQQ: decide when to call.
    microtask(() => this.discover_());
  }

  /**
   * Sets the strict direct parent. The node will no longer try to discover.
   * @param {!ContextNode|!Node} parent
   */
  reparent(parent) {
    parent = parent.nodeType ? ContextNode.get(parent) : parent;
    this.reparent_(parent, /* stopDiscovery */ true);
  }

  /** */
  changed() {
    if (!this.changedScheduled_) {
      this.changedScheduled_ = true;
      // QQQ: scheduling mechanism: vsync/chunk/etc.
      macrotask(() => this.checkChanges_());
    }
  }

  /**
   * Set an outer provider.
   * @param {!ContextTypeDef} contextType
   */
  setSelf(contextType, valueOrProvider) {
    //QQQ: rename to provide?
    //QQQQ: allow non-inheritied?
    if (!this.selfContexts_) {
      this.selfContexts_ = new Map();
    }
    const key = toKey(contextType);
    const oldValue = this.selfContexts_.get(key);
    if (valueOrProvider !== oldValue) {
      if (valueOrProvider == null) {
        this.selfContexts_.delete(key);
      } else {
        this.selfContexts_.set(key, valueOrProvider);
      }
      this.changed();
    }
  }

  /**
   * @param {!ContextTypeDef} contextType
   * @return {*}
   */
  getSelf(contextType) {
    if (!this.selfContexts_) {
      return null;
    }
    const key = toKey(contextType);
    return this.selfContexts_.get(key) || null;
  }

  /**
   * @param {!ContextTypeDef} contextType
   * @param {function(new: *, !ContextNode)} factory
   * @return {*}
   */
  initSelf(contextType, factory) {
    let context = this.getSelf(contextType);
    if (!context) {
      context = new factory(this);
      this.setSelf(contextType, context);
    }
    return context;
  }

  /**
   * Set an inner provider.
   * @param {!ContextTypeDef} contextType
   */
  setSubtree(contextType, valueOrProvider) {
    if (!this.subtreeContexts_) {
      this.subtreeContexts_ = new Map();
    }
    const key = toKey(contextType);
    const oldValue = this.subtreeContexts_.get(key);
    if (valueOrProvider !== oldValue) {
      this.subtreeContexts_.set(key, valueOrProvider);
      if (this.children_) {
        this.children_.forEach(child => child.changed());
      }
    }
  }

  /**
   * @param {!ContextTypeDef} contextType
   * @return {*|null}
   */
  get(contextType) {
    // QQQQ: use/bust cache?
    const valueOrProvider = this.getValueOrProvider_(contextType);
    if (typeof valueOrProvider == 'function') {
      // QQQQQ: function as a normal value?
      // QQQQQ: pass prev value
      return valueOrProvider(this.node_);
    }
    return valueOrProvider;
  }

  /**
   * Set up subscriber.
   * @param {!ContextTypeDef} contextType
   * @param {function(value: *, contextType: *)} callback
   * @return {!UnsubscribeDef}
   */
  subscribe(contextType, callback) {
    // QQQQ: change to have a single callback per node, not per contextType?
    // - The negative is that we'll also have to add `get(contextType)` then.
    // - Positive is asynchronous/re-entreable semantics and subscriber counts.
    // - The negative: how's memory consumption for this? Array<Listener> vs Map<*, Listener>?
    if (!this.subscribers_) {
      this.subscribers_ = new Map();
    }
    const key = toKey(contextType);
    let subscriber = this.subscribers_.get(key);
    if (!subscriber) {
      subscriber = {
        value: null,
        observers: new Observable(),
      };
      this.subscribers_.set(key, subscriber);
    }
    if (subscriber.value != null) {
      microtask(() => callback(subscriber.value));
    }
    subscriber.observers.add(callback);
    return this.unsubscribe.bind(this, contextType, callback);
  }

  /**
   * Set up subscriber.
   * @param {!ContextTypeDef} contextType
   * @param {function(value: *, contextType: *)} callback
   * @return {!UnsubscribeDef}
   */
  unsubscribe(contextType, callback) {
    if (!this.subscribers_) {
      return;
    }
    const key = toKey(contextType);
    const subscriber = this.subscribers_.get(key);
    if (!subscriber) {
      return;
    }
    const {observers} = subscriber;
    observers.remove(callback);
    if (observers.getHandlerCount() == 0) {
      this.subscribers_.delete(key);
    }
  }

  /** @private */
  discover_() {
    if (!this.discoverable_) {
      return;
    }
    const parent = ContextNode.closest(this.node_, /* excludeSelf */ true);
    this.reparent_(parent, /* stopDiscovery */ false);
  }

  /**
   * @param {!ContextNode} parent
   * @param {boolean} stopDiscovery
   * @private
   */
  reparent_(parent, stopDiscovery) {
    this.discoverable_ = !stopDiscovery;
    const oldParent = this.parent_;
    if (oldParent == parent) {
      return;
    }
    if (oldParent) {
      oldParent.children_.splice(oldParent.children_.indexOf(this), 1);
    }
    if (!parent.children_) {
      parent.children_ = [];
    }
    parent.children_.push(this);
    this.parent_ = parent;
    this.changed();
  }

  /** @private */
  checkChanges_() {
    // console.log('ContextNode: check changes:', this);
    this.changedScheduled_ = false;
    if (this.subscribers_) {
      // QQQ: optimize by knowing the reason for change. E.g. a particular
      // context, vs the whole hierarchy.
      this.subscribers_.forEach((subscriber, key) => {
        const value = this.get(key);
        if (value !== subscriber.value) {
          console.log('ContextNode: changed:', this, key, '=', value);
          subscriber.value = value;
          microtask(() => subscriber.observers.fire(value));
          // QQQ: collect all changed keys?
          this.notifyChanged_([key]);
        }
      });
    }
    if (this.children_) {
      // Schedule children updates as well.
      this.children_.forEach(child => child.changed());
    }
  }

  /**
   * @param {!Array<string>} keys
   * @private
   */
  notifyChanged_(keys) {
    for (let n = this; n; n = n.parent_) {
      if (n.observers_) {
        n.observers_.fire({contextNode: this, keys});
      }
    }
  }

  /**
   * @param {!ContextTypeDef} contextType
   * @return {*|null}
   * @private
   */
  getValueOrProvider_(contextType) {
    // QQQQ: use cache?
    const key = toKey(contextType);
    let valueOrProvider = null;
    for (let node = this; node; node = node.parent_) {
      if (node != this && node.subtreeContexts_) {
        const value = node.subtreeContexts_.get(key);
        if (value != null) {
          return value;
        }
      }
      if (node.selfContexts_) {
        const value = node.selfContexts_.get(key);
        if (value != null) {
          return value;
        }
      }
    }
    return null;
  }
}

/**
 * @param {function} callback
 */
function microtask(callback) {
  if (!microtaskPromise) {
    microtaskPromise = Promise.resolve();
  }
  microtaskPromise.then(callback);
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
    selfContexts: mapDebug(contextNode.selfContexts_),
    subtreeContexts: mapDebug(contextNode.subtreeContexts_),
    subscribers: mapDebug(contextNode.subscribers_, (key, {value}) => ({cached: value, latest: contextNode.get(key)})),
  };
}
