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
const PRIVATE_ONLY = {};

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
    this.consumers_ = null;

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
    Promise.resolve().then(() => this.discover_());
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
      setTimeout(() => this.changed_());
    }
  }

  /** @private */
  changed_() {
    console.log('ContextNode: changed:', this.node_);
    this.changedScheduled_ = false;
    if (this.consumers_) {
      // QQQ: optimize by knowing the reason for change. E.g. a particular
      // context, vs the whole hierarchy.
      this.consumers_.forEach((observers, contextType) => {
        const value = this.get(contextType);
        // QQQQ: fire in microtask
        // QQQQ: check that the value has actually changed.
        observers.fire(value, contextType);
      });
    }
    if (this.children_) {
      // Schedule children updates as well.
      this.children_.forEach(child => child.changed());
    }
  }

  /**
   * Set an outer provider.
   * //QQQ: rename to provide?
   */
  setSelf(contextType, valueOrProvider) {
    //QQQ: key(contextType)
    if (!this.selfContexts_) {
      this.selfContexts_ = new Map();
    }
    const oldValue = this.selfContexts_.get(contextType);
    if (valueOrProvider !== oldValue) {
      this.selfContexts_.set(contextType, valueOrProvider);
      this.changed();
    }
  }

  /**
   * Set an inner provider.
   */
  setSubtree(contextType, valueOrProvider) {
    if (!this.subtreeContexts_) {
      this.subtreeContexts_ = new Map();
    }
    const oldValue = this.subtreeContexts_.get(contextType);
    if (valueOrProvider !== oldValue) {
      this.subtreeContexts_.set(contextType, valueOrProvider);
      if (this.children_) {
        this.children_.forEach(child => child.changed());
      }
    }
  }

  /**
   * @param {!Object} contextType
   * @return {*|null}
   */
  get(contextType) {
    for (let node = this; node; node = node.parent_) {
      if (node != this && node.subtreeContexts_) {
        const value = node.subtreeContexts_.get(contextType);
        if (value) {
          return value;
        }
      }
      if (node.selfContexts_) {
        const value = node.selfContexts_.get(contextType);
        if (value) {
          return value;
        }
      }
    }
    return null;
  }

  /**
   * Set up consumer.
   * @param {*} contextType
   * @param {function(value: *, contextType: *)} callback
   * @return {!UnsubscribeDef}
   */
  consume(contextType, callback) {
    // QQQQ: change to have a single callback per node, not per contextType?
    // - The negative is that we'll also have to add `get(contextType)` then.
    // - Positive is asynchronous/re-entreable semantics and subscriber counts.
    // - The negative: how's memory consumption for this? Array<Listener> vs Map<*, Listener>?
    if (!this.consumers_) {
      this.consumers_ = new Map();
    }
    let observers = this.consumers_.get(contextType);
    if (!observers) {
      observers = new Observable();
      this.consumers_.set(contextType, observers);
    }
    // QQQQ: call immediately (via microtask?) on the existing value.
    return observers.add(callback);
  }
}

/**
 * @param {!ContextNode} contextNode
 * @return {!JsonObject}
 */
function debugContextNodeForTesting(contextNode) {
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

  return {
    node: nodeDebug(contextNode),
    childrenCount: contextNode.children_ && contextNode.children_.length || 0,
    path: path(contextNode.parent_).map(nodeDebug).join(' < '),
    selfContexts: contextNode.selfContexts_,
    subtreeContexts: contextNode.subtreeContexts_,
    consumers: (() => {
      if (!contextNode.consumers_) {
        return null;
      }
      const map = [];
      contextNode.consumers_.forEach((value, key) => {
        map.push([key, contextNode.get(key)]);
      });
      return map;
    })(),
  };
  /*
    this.selfContexts_ = null;

    this.subtreeContexts_ = null;

    this.consumers_ = null;
  */
}
