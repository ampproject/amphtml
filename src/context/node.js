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

import {Values} from './values';
import {devAssert} from '../log';
import {getMode} from '../mode';
import {pushIfNotExist, removeItem} from '../utils/array';
import {startsWith} from '../string';
import {throttleTail} from './scheduler';

// Properties set on the DOM nodes to track the context state.
const NODE_PROP = '__AMP_NODE';
const ASSIGNED_SLOT_PROP = '__AMP_ASSIGNED_SLOT';
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
 *
 * @package
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
      contextNode = new ContextNode(node);
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
   * `node` has the context node, it's returned unless `includeSelf` is set as
   * `false`.
   *
   * The DOM traversal goes at most as far as the root node (document,
   * shadow root, document fragment) or as far as the DOM tree allows. The
   * traversal follows the assigned shadow slots.
   *
   * Root nodes (document or shadow root) and AMP elements are auto-created
   * during the traversal.
   *
   * @param {!Node} node The node from which to perform the search.
   * @param {boolean=} includeSelf Whether the specified node itself should
   * be included in the search. Defaults to `true`.
   * @return {?ContextNode}
   */
  static closest(node, includeSelf = true) {
    let n = node;
    while (n) {
      // Check if a node is a candidate to be returned.
      if (n != node || includeSelf) {
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
    // Only disconnected nodes will return `null` here.
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
    node[ASSIGNED_SLOT_PROP] = slot;
    discoverContained(node);
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
    node[ASSIGNED_SLOT_PROP] = undefined;
    discoverContained(node);
  }

  /**
   * Creates the context node and automatically starts the discovery process.
   *
   * @param {!Node} node
   */
  constructor(node) {
    /** @const {!Node} */
    this.node = node;

    /**
     * Whether this node is a root. The Document DOM nodes are automatically
     * considered as roots. But other nodes can become roots as well
     * (e.g. shadow roots) via `setIsRoot()` API.
     *
     * @package {boolean}
     */
    this.isRoot = node.nodeType == DOCUMENT_NODE;

    /**
     * The root context node. Always available for a DOM node connected to a
     * root node after the discovery phase.
     *
     * @package {?ContextNode}
     */
    this.root = this.isRoot ? this : null;

    /**
     * Parent should be mostly meaningless to most API clients, because
     * it's an async concept: a parent context node can can be instantiated at
     * any time and it doesn't mean that this node has to change. This is
     * why the API is declared as package-private. However, it needs to be
     * unobfuscated to avoid cross-binary issues.
     *
     * @package {?ContextNode}
     */
    this.parent = null;

    /**
     * See `parent` description.
     *
     * @package {?Array<!ContextNode>}
     */
    this.children = null;

    /** @package {!Values} */
    this.values = new Values(this);

    /** @private {?Map<*, !./component.Component>} */
    this.components_ = null;

    /** @private {boolean} */
    this.parentOverridden_ = false;

    /** @private {?Array<function(!ContextNode)>} */
    this.cleanups_ = null;

    /** @const @private {function()} */
    this.scheduleDiscover_ = throttleTail(
      this.discover_.bind(this),
      setTimeout
    );

    // Shadow root: track slot changes.
    if (node.nodeType == FRAGMENT_NODE) {
      node.addEventListener('slotchange', (e) => {
        const slot = /** @type {!HTMLSlotElement} */ (e.target);
        // Rediscover newly assigned nodes.
        const assignedNodes = slot.assignedNodes();
        assignedNodes.forEach(discoverContained);
        // Rediscover unassigned nodes.
        const closest = ContextNode.closest(slot);
        const closestChildren = closest && closest.children;
        if (closestChildren) {
          closestChildren.forEach(discoverContextNode);
        }
      });
    }

    this.discover();
  }

  /**
   * Requests the discovery phase. Asynchronously finds the nearest parent for
   * this node and its root. Roots and parents set directly via `setParent()`
   * API are not discoverable.
   */
  discover() {
    if (this.isDiscoverable()) {
      this.scheduleDiscover_();
    }
  }

  /**
   * @return {boolean}
   * @protected Used cross-binary.
   */
  isDiscoverable() {
    return !this.isRoot && !this.parentOverridden_;
  }

  /**
   * Sets (or unsets) the direct parent. If the parent is set, the node will no
   * longer try to discover itself.
   *
   * @param {!ContextNode|!Node|null} parent
   */
  setParent(parent) {
    const parentContext =
      parent && parent.nodeType
        ? ContextNode.get(/** @type {!Node} */ (parent))
        : /** @type {?ContextNode} */ (parent);
    this.updateTree_(parentContext, /* parentOverridden */ parent != null);
  }

  /**
   * Designates (or undesignates) the node as a root node. If the node is
   * designated as a root, it will no longer discover itself.
   *
   * @param {boolean} isRoot
   */
  setIsRoot(isRoot) {
    this.isRoot = isRoot;
    const newRoot = isRoot ? this : this.parent ? this.parent.root : null;
    this.updateRoot(newRoot);
  }

  /**
   * @param {?ContextNode} root
   * @protected Used cross-binary.
   */
  updateRoot(root) {
    devAssert(!root || root.isRoot);
    const oldRoot = this.root;
    if (root != oldRoot) {
      // Call root cleanups.
      const cleanups = this.cleanups_;
      if (cleanups) {
        cleanups.forEach((cleanup) => cleanup(this));
        this.cleanups_ = null;
      }

      // The root has changed.
      this.root = root;

      // Make sure the tree changes have been reflected for values.
      this.values.rootUpdated();

      // Make sure the tree changes have been reflected for components.
      const components = this.components_;
      if (components) {
        components.forEach((comp) => {
          comp.rootUpdated();
        });
      }

      // Propagate the root to the subtree.
      if (this.children) {
        this.children.forEach((child) => child.updateRoot(root));
      }
    }
  }

  /**
   * Add or update a component with a specified ID. If component doesn't
   * yet exist, it will be created using the specified factory. The use
   * of factory is important to reduce bundling costs for context node.
   *
   * @param {*} id
   * @param {./component.ComponentFactoryDef} factory
   * @param {!Function} func
   * @param {!Array<!ContextProp>} deps
   * @param {*} input
   */
  mountComponent(id, factory, func, deps, input) {
    const components = this.components_ || (this.components_ = new Map());
    let comp = components.get(id);
    if (!comp) {
      comp = factory(id, this, func, deps);
      components.set(id, comp);
    }
    comp.set(input);
  }

  /**
   * Removes the component previously set with `mountComponent`.
   *
   * @param {*} id
   */
  unmountComponent(id) {
    const components = this.components_;
    const comp = components && components.get(id);
    if (comp) {
      comp.dispose();
      components.delete(id);
    }
  }

  /**
   * Registers a root cleanup handler that will be called each time the
   * root has changed or the node has been disconnected.
   *
   * @param {function(!ContextNode)} cleanup
   */
  pushCleanup(cleanup) {
    const cleanups = this.cleanups_ || (this.cleanups_ = []);
    pushIfNotExist(cleanups, cleanup);
  }

  /**
   * Unregisters a cleanup handler previously registered with `pushCleanup`.
   *
   * @param {function(!ContextNode)} cleanup
   */
  popCleanup(cleanup) {
    const cleanups = this.cleanups_;
    if (cleanups) {
      removeItem(cleanups, cleanup);
    }
  }

  /**
   * Discovers the parent and the root. Runs asynchronously via scheduler.
   * @private
   */
  discover_() {
    if (!this.isDiscoverable()) {
      // The discoverability might have changed while this task was in the
      // queue.
      return;
    }
    const parent = ContextNode.closest(this.node, /* includeSelf */ false);
    this.updateTree_(parent, /* parentOverridden */ false);
  }

  /**
   * @param {?ContextNode} parent
   * @param {boolean} parentOverridden
   * @private
   */
  updateTree_(parent, parentOverridden) {
    this.parentOverridden_ = parentOverridden;

    const oldParent = this.parent;
    if (parent != oldParent) {
      // The parent has changed.
      this.parent = parent;

      // Remove from the old parent.
      if (oldParent && oldParent.children) {
        removeItem(oldParent.children, this);
      }

      // Add to the new parent.
      if (parent) {
        const parentChildren = parent.children || (parent.children = []);
        pushIfNotExist(parentChildren, this);

        // Check if this node has been inserted in between the parent and
        // it's other children.
        // Since the new parent (`this`) is already known, this is a very
        // fast operation.
        for (let i = 0; i < parentChildren.length; i++) {
          const child = parentChildren[i];
          if (child != this && child.isDiscoverable()) {
            child.discover();
          }
        }
      }

      this.values.parentUpdated();
    }

    // Check the root.
    this.updateRoot(parent ? parent.root : null);
  }
}

/**
 * Iterates over all context nodes that are contained within the specified
 * `node`. Only iterates over known context nodes.
 *
 * @param {!Node} node
 * @param {function(!ContextNode)} callback
 * @param {boolean=} includeSelf
 */
function forEachContained(node, callback, includeSelf = true) {
  const closest = ContextNode.closest(node, includeSelf);
  if (!closest) {
    return;
  }
  if (closest.node == node) {
    callback(closest);
  } else if (closest.children) {
    closest.children.forEach((child) => {
      if (node.contains(child.node)) {
        callback(child);
      }
    });
  }
}

/**
 * @param {!Node} node
 */
function discoverContained(node) {
  forEachContained(node, discoverContextNode);
}

/**
 * @param {!ContextNode} cn
 */
function discoverContextNode(cn) {
  cn.discover();
}
