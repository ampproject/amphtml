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

const NODE_PROP = '__ampNode';
const ASSIGNED_SLOT_PROP = '__ampAssignedSlot';
const KEY_PROP = '__ampKey';
const PRIVATE_ONLY = {};

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
    node[ASSIGNED_SLOT_PROP] = slot;
    const closest = ContextNode.closest(node);
    if (closest) {
      // QQQQQ: discoverFrom(node)
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
      const assignedSlot = n[ASSIGNED_SLOT_PROP] || n.assignedSlot;
      if (assignedSlot) {
        n = assignedSlot;
      } else if (n.nodeType == /* SHADOW_ROOT */ 11) {
        n = n.host;
      } else {
        n = n.parentNode;
      }
    }
    return null;
  }

  /**
   * @param {?Node} node
   * @param {!Object} contextType
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

    /** @private {?ContextNode} */
    this.parent_ = null;

    /** @private {boolean} */
    this.changedScheduled_ = false;

    /** @private {?Map} */
    this.selfContexts_ = null;

    /** @private {?Map} */
    this.subtreeContexts_ = null;

    /** @private {?Map} */
    this.subscribers_ = null;

    this.discover();

    if (getMode().localDev || getMode().test) {
      this.debug = () => debugContextNodeForTesting(this);
    }
  }

  /**
   */
  discover() {
    // QQQQ: implement.
    // QQQQ: decide when to call.
    microtask(() => this.discover_());
  }

  /** @private */
  discover_() {
    const parent = ContextNode.closest(this.node_, /* excludeSelf */ true);
    this.reparent_(parent);
  }

  /**
   * @param {!ContextNode} parent
   * @private
   */
  reparent_(parent) {
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

  /** */
  changed() {
    if (!this.changedScheduled_) {
      this.changedScheduled_ = true;
      // QQQ: scheduling mechanism: vsync/chunk/etc.
      macrotask(() => this.changed_());
    }
  }

  /** @private */
  changed_() {
    console.log('ContextNode: changed:', this.node_);
    this.changedScheduled_ = false;
    if (this.subscribers_) {
      // QQQ: optimize by knowing the reason for change. E.g. a particular
      // context, vs the whole hierarchy.
      this.subscribers_.forEach((subscriber, key) => {
        const value = this.get(key);
        if (value !== subscriber.value) {
          subscriber.value = value;
          microtask(() => subscriber.observers.fire(value));
        }
      });
    }
    if (this.children_) {
      // Schedule children updates as well.
      this.children_.forEach(child => child.changed());
    }
  }

  /**
   * Set an outer provider.
   * @param {!Object|string} contextType
   * //QQQ: rename to provide?
   */
  setSelf(contextType, valueOrProvider) {
    if (!this.selfContexts_) {
      this.selfContexts_ = new Map();
    }
    const key = toKey(contextType);
    const oldValue = this.selfContexts_.get(key);
    if (valueOrProvider !== oldValue) {
      this.selfContexts_.set(key, valueOrProvider);
      this.changed();
    }
  }

  /**
   * Set an inner provider.
   * @param {!Object|string} contextType
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
   * @param {!Object|string} contextType
   * @return {*|null}
   */
  get(contextType) {
    // QQQQ: use cache?
    const key = toKey(contextType);
    for (let node = this; node; node = node.parent_) {
      if (node != this && node.subtreeContexts_) {
        const value = node.subtreeContexts_.get(key);
        if (value) {
          return value;
        }
      }
      if (node.selfContexts_) {
        const value = node.selfContexts_.get(key);
        if (value) {
          return value;
        }
      }
    }
    return null;
  }

  /**
   * Set up subscriber.
   * @param {!Object|string} contextType
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
   * @param {!Object|string} contextType
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
}

/**
 * @param {!Object|string} contextType
 * @return {string}
 */
function toKey(contextType) {
  return typeof contextType == 'object' ? contextType[KEY_PROP] : contextType;
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
