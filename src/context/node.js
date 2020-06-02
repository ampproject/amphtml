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
import {getMode} from '../mode';
import {oneAtATime} from './scheduler';
import {pushIfNotExist, removeUniqueItem} from '../utils/array';
import {startsWith} from '../string';

// Protection for creating the ContextNode directly. See the constructor.
const PRIVATE_ONLY = {};

// Properties set on the DOM nodes to track the context state.
const NODE_PROP = '__ampNode';
const ASSIGNED_SLOT_PROP = '__ampAssignedSlot';
const AMP_PREFIX = 'AMP-';

// Relevant node types.
// See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.
const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
// Includes shadow root, template, etc.
const FRAGMENT_NODE = 11;

/**
 * The context node is a sparse tree over the DOM tree. Any node that needs
 * to manage and compute state can be attached to the context node tree. The
 * tree (mostly) automatically self-manages: the new nodes and DOM mutations
 * are auto-discovered or prompted.
 */
export class ContextNode {
  /**
   * Returns the existing context node or creates a new one.
   *
   * @param {!Node} node
   * @return {!ContextNode}
   */
  static get(node) {
    let contextNode = /** @type {!ContextNode|undefined} */ (node[NODE_PROP]);
    if (!contextNode) {
      contextNode = new ContextNode(PRIVATE_ONLY, node);
      if (getMode().localDev || getMode().test) {
        // The `Object.defineProperty({enumerable: false})` helps tests, but
        // hurts performance. So this is only done in a dev/test modes.
        Object.defineProperty(node, NODE_PROP, {
          value: contextNode,
          writable: false,
          enumerable: false,
          configurable: false,
        });
      } else {
        node[NODE_PROP] = contextNode;
      }
    }
    return contextNode;
  }

  /**
   * Returns the closest available context node to the one specified. If the
   * `node` has the context node, it's returned unless `excludeSelf` is set as
   * `true`.
   *
   * The DOM traversal goes at most as far as the root node (document,
   * shadow root, document fragment) or as far as the DOM tree allows. The
   * traversal follows the assigned shadow slots.
   *
   * Root nodes (document or shadow root) and AMP elements are auto-created
   * during the traversal.
   *
   * @param {!Node} node The node from which to perform the search.
   * @param {boolean=} excludeSelf Whether the specified node itself should
   * be excluded from the search. Defaults to `false` - do not exclude.
   * @return {?ContextNode}
   */
  static closest(node, excludeSelf = false) {
    let n = node;
    while (n) {
      // Check if a node is a candidate to be returned.
      if (n != node || !excludeSelf) {
        if (n[NODE_PROP]) {
          // Already a discovered node.
          return /** @type {!ContextNode} */ (n[NODE_PROP]);
        }
        const {nodeType} = n;
        if (nodeType == DOCUMENT_NODE || nodeType == FRAGMENT_NODE) {
          // A context node is always created for a root. Due to this, a
          // non-root element is always at least attached to a root. This
          // allows for quick discovery and reattachment when new information
          // becomes available.
          return ContextNode.get(n);
        }
        if (nodeType == ELEMENT_NODE && startsWith(n.tagName, AMP_PREFIX)) {
          // An AMP node will always have a context node backing it at some
          // point.
          return ContextNode.get(n);
        }
      }
      // Navigate up the DOM tree. Notice that we do not automatically go over
      // a root node boundary.
      const assignedSlot =
        /** @type {?Node|undefined} */ (n[ASSIGNED_SLOT_PROP]) ||
        n.assignedSlot;
      if (assignedSlot) {
        n = assignedSlot;
      } else {
        n = n.parentNode;
      }
    }
    return null;
  }

  /**
   * Direct slot assignment. Works the same way as shadow slots, but does not
   * require a shadow root. Automatically starts the discovery phase for the
   * affected nodes.
   *
   * See `Element.assignedSlot` API.
   *
   * @param {!Node} node The target node.
   * @param {!Node} slot The slot to which the target node is assigned.
   */
  static assignSlot(node, slot) {
    if (node[ASSIGNED_SLOT_PROP] == slot) {
      return;
    }
    node[ASSIGNED_SLOT_PROP] = devAssert(slot);
    forEachContained(node, (cn) => cn.discover());
  }

  /**
   * Unassigns the direct slot previously done by the `assignSlot` call.
   * Automatically starts the discovery phase for the affected nodes.
   *
   * @param {!Node} node The target node.
   * @param {!Node} slot The slot from which the target node is assigned.
   */
  static unassignSlot(node, slot) {
    if (node[ASSIGNED_SLOT_PROP] != slot) {
      return;
    }
    delete node[ASSIGNED_SLOT_PROP];
    forEachContained(node, (cn) => cn.discover());
  }

  /**
   * Creates the context node and automatically starts the discovery process.
   *
   * @param {*} privateOnly
   * @param {!Node} node
   */
  constructor(privateOnly, node) {
    devAssert(privateOnly === PRIVATE_ONLY);

    /** @const @private {!Node} */
    this.node_ = node;

    /** @private {?ContextNode} */
    this.parent_ = null;

    /** @private {boolean} */
    this.parentOverriden_ = false;

    /** @private {boolean} */
    this.isRoot_ = node.nodeType == DOCUMENT_NODE;

    /** @private {?ContextNode} */
    this.root_ = this.isRoot_ ? this : null;

    /** @private {?Array<!ContextNode>} */
    this.children_ = null;

    /** @const @private {function()} */
    this.scheduleDiscover_ = oneAtATime(this.discover_.bind(this), setTimeout);

    this.discover();
  }

  /**
   * The DOM node corresponding to the context node.
   *
   * @return {!Node}
   */
  get node() {
    return this.node_;
  }

  /**
   * The DOM element corresponding to the context node.
   *
   * @return {?Element}
   */
  get element() {
    // It's convenient to access Element type. If it's not an element,
    // let it fail downstream. Otherwise, a lot of debug tools fail on trying
    // to call JSON.stringify.
    return this.node_.nodeType == ELEMENT_NODE
      ? dev().assertElement(this.node_)
      : null;
  }

  /**
   * Whether this node is a root. The Document DOM nodes are automatically
   * considered as roots. But other nodes can become roots as well (e.g. shadow
   * roots) via `setIsRoot()` API.
   *
   * @return {boolean}
   */
  get isRoot() {
    return this.isRoot_;
  }

  /**
   * The root context node. Always available for a DOM node connected to a root
   * node after the discovery phase.
   *
   * @return {?ContextNode}
   */
  get root() {
    return this.root_;
  }

  /**
   * Requests the discovery phase. Asynchronously finds the nearest parent for
   * this node and its root. Roots and parents set directly via `setParent()`
   * API are not discoverable.
   */
  discover() {
    if (this.isDiscoverable_()) {
      this.scheduleDiscover_();
    }
  }

  /**
   * Sets (or unsets) the direct parent. If the parent is set, the node will no
   * longer try to discover itself.
   *
   * @param {!ContextNode|!Node|null} parent
   */
  setParent(parent) {
    const parentContext = !parent
      ? null
      : parent.nodeType
      ? ContextNode.get(/** @type {!Node} */ (parent))
      : /** @type {!ContextNode} */ (parent);
    this.updateTree_(parentContext, /* parentOverriden */ parent != null);
  }

  /**
   * Designates (or undesignates) the node as a root node. If the node is
   * designated as a root, it will no longer discover itself.
   *
   * @param {boolean} isRoot
   */
  setIsRoot(isRoot) {
    this.isRoot_ = isRoot;
    const newRoot = isRoot ? this : this.parent_ ? this.parent_.root_ : null;
    this.updateRoot_(newRoot);
  }

  /**
   * @return {boolean}
   * @private
   */
  isDiscoverable_() {
    return !this.isRoot_ && !this.parentOverriden_;
  }

  /**
   * Discovers the parent and the root. Runs asynchronously via scheduler.
   * @private
   */
  discover_() {
    if (!this.isDiscoverable_()) {
      // The discoverability might have changed while this task was in the
      // queue.
      return;
    }
    const parent = ContextNode.closest(this.node_, /* excludeSelf */ true);
    this.updateTree_(parent, /* parentOverriden */ false);
  }

  /**
   * @param {?ContextNode} parent
   * @param {boolean} parentOverriden
   * @private
   */
  updateTree_(parent, parentOverriden) {
    this.parentOverriden_ = parentOverriden;

    const oldParent = this.parent_;
    if (parent != oldParent) {
      // The parent has changed.
      this.parent_ = parent;

      // Remove from the old parent.
      if (oldParent && oldParent.children_) {
        removeUniqueItem(oldParent.children_, this);
      }

      // Add to the new parent.
      if (parent) {
        const parentChildren = parent.children_ ?? (parent.children_ = []);
        pushIfNotExist(parentChildren, this);

        // Check if this node has been inserted in between the parent and
        // it's other children.
        // Since the new parent (`this`) is already known, this is a very
        // fast operation and doesn't need a separate discover phase.
        // Iterate over the array in reverse because some children will
        // be removed by reparenting siblings to the new parent.
        for (let i = parentChildren.length - 1; i >= 0; i--) {
          const child = parentChildren[i];
          if (
            child != this &&
            child.isDiscoverable_() &&
            this.node_.contains(child.node_)
          ) {
            child.updateTree_(this, /* disableDiscovery */ false);
          }
        }
      }
    }

    // Check the root.
    this.updateRoot_(parent ? parent.root_ : null);
  }

  /**
   * @param {?ContextNode} root
   * @private
   */
  updateRoot_(root) {
    const oldRoot = this.root_;
    if (root != oldRoot) {
      // The root has changed.
      this.root_ = root;
      if (this.children_) {
        this.children_.forEach((child) => child.updateRoot_(root));
      }
    }
  }
}

/**
 * Iterates over all context nodes that are contained within the specified
 * `node`. Only iterates over known context nodes.
 *
 * @param {!Node} node
 * @param {function(!ContextNode)} callback
 * @param {boolean=} excludeSelf
 */
function forEachContained(node, callback, excludeSelf = false) {
  const closest = ContextNode.closest(node, excludeSelf);
  if (!closest) {
    return;
  }
  if (closest.node_ == node) {
    callback(closest);
  } else if (closest.children_) {
    closest.children_.forEach((child) => {
      if (node.contains(child.node_)) {
        callback(child);
      }
    });
  }
}

/**
 * Parent should be mostly meaningless to most API clients, because
 * it's an async concept: a parent context node can can be insantiated at
 * any time and it doesn't mean that this node has to change.
 *
 * @param {!ContextNode} contextNode
 * @return {?ContextNode}
 * @visibleForTesting
 */
export function getParentForTesting(contextNode) {
  return contextNode.parent_;
}

/**
 * See `getParentForTesting` for more info.
 *
 * @param {!ContextNode} contextNode
 * @return {?Array<!ContextNode>}
 * @visibleForTesting
 */
export function getChildrenForTesting(contextNode) {
  return contextNode.children_ || [];
}

/**
 * See `getParentForTesting` for more info.
 *
 * @param {!ContextNode} contextNode
 * @return {boolean}
 * @visibleForTesting
 */
export function getDiscoverableForTesting(contextNode) {
  return contextNode.isDiscoverable_();
}
