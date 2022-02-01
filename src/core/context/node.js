import {devAssert} from '#core/assert';
import * as mode from '#core/mode';
import {isElement} from '#core/types';
import {pushIfNotExist, removeItem} from '#core/types/array';

import {throttleTail} from './scheduler';
import {Values} from './values';

/**
 * @template T, DEP
 * @typedef {import('./types.d').IContextProp<T, DEP>} IContextProp
 */

// Properties set on the DOM nodes to track the context state.
const NODE_PROP = '__AMP_NODE';
const ASSIGNED_SLOT_PROP = '__AMP_ASSIGNED_SLOT';
const AMP_PREFIX = 'AMP-';

// Relevant node types.
// See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.
const DOCUMENT_NODE = 9;
// Includes shadow root, template, etc.
const FRAGMENT_NODE = 11;

/**
 * The structure for a group of nodes.
 *
 * @typedef {{
 *   cn: ContextNode<?>,
 *   match: function(Node, Node):boolean,
 *   weight: number,
 * }} GroupDef
 */

/**
 * The context node is a sparse tree over the DOM tree. Any node that needs
 * to manage and compute state can be attached to the context node tree. The
 * tree (mostly) automatically self-manages: the new nodes and DOM mutations
 * are auto-discovered or prompted.
 *
 * @package
 * @template SID subscriber ID type(s)
 */
export class ContextNode {
  /**
   * Returns the existing context node or creates a new one.
   *
   * @param {Node} node
   * @return {ContextNode<?>}
   */
  static get(node) {
    let contextNode = /** @type {ContextNode<?>|undefined} */ (node[NODE_PROP]);
    if (!contextNode) {
      contextNode = new ContextNode(node, null);
      if (mode.isLocalDev() || mode.isTest()) {
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
   * @param {Node} node The node from which to perform the search.
   * @param {boolean=} includeSelf Whether the specified node itself should
   * be included in the search. Defaults to `true`.
   * @return {?ContextNode<?>}
   */
  static closest(node, includeSelf = true) {
    /** @type {?Node} */
    let n = node;
    while (n) {
      // Check if a node is a candidate to be returned.
      if (n != node || includeSelf) {
        if (n[NODE_PROP]) {
          // Already a discovered node.
          return /** @type {ContextNode<?>} */ (n[NODE_PROP]);
        }
        const {nodeType} = n;
        if (
          // A context node is always created for a root. Due to this, a
          // non-root element is always at least attached to a root. This
          // allows for quick discovery and reattachment when new information
          // becomes available.
          nodeType == DOCUMENT_NODE ||
          nodeType == FRAGMENT_NODE ||
          // An AMP node will always have a context node backing it at some
          // point.
          (isElement(n) && n.tagName.startsWith(AMP_PREFIX))
        ) {
          return ContextNode.get(n);
        }
      }
      // Navigate up the DOM tree. Notice that we do not automatically go over
      // a root node boundary.
      /** @type {Node|Element|undefined|null} */
      const assignedSlot =
        /** @type {?Node|undefined} */ (n[ASSIGNED_SLOT_PROP]) ||
        /** @type {Element} */ (n).assignedSlot;
      if (assignedSlot) {
        n = assignedSlot;
      } else {
        n = /** @type {?Node} */ (n.parentNode);
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
   * @param {Node} node The target node.
   * @param {Node} slot The slot to which the target node is assigned.
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
   * @param {Node} node The target node.
   * @param {Node} slot The slot from which the target node is assigned.
   */
  static unassignSlot(node, slot) {
    if (node[ASSIGNED_SLOT_PROP] != slot) {
      return;
    }
    node[ASSIGNED_SLOT_PROP] = undefined;
    discoverContained(node);
  }

  /**
   * Reruns discovery on the children of the specified node, if any.
   *
   * @param {Node} node
   */
  static rediscoverChildren(node) {
    const contextNode = /** @type {ContextNode<?>|undefined} */ (
      node[NODE_PROP]
    );
    contextNode?.children?.forEach(discoverContextNode);
  }

  /**
   * Creates the context node and automatically starts the discovery process.
   *
   * @param {Node} node
   * @param {?string} name
   */
  constructor(node, name) {
    /**
     * @const
     * @type {Node}
     */
    this.node = node;

    /**
     * @const
     * @package
     * @type {?string}
     */
    this.name = name;

    /**
     * Whether this node is a root. The Document DOM nodes are automatically
     * considered as roots. But other nodes can become roots as well
     * (e.g. shadow roots) via `setIsRoot()` API.
     *
     * @package
     * @type {boolean}
     */
    this.isRoot = node.nodeType == DOCUMENT_NODE;

    /**
     * The root context node. Always available for a DOM node connected to a
     * root node after the discovery phase.
     *
     * @package
     * @type {?ContextNode<?>}
     */
    this.root = this.isRoot ? this : null;

    /**
     * Parent should be mostly meaningless to most API clients, because
     * it's an async concept: a parent context node can can be instantiated at
     * any time and it doesn't mean that this node has to change. This is
     * why the API is declared as package-private. However, it needs to be
     * unobfuscated to avoid cross-binary issues.
     *
     * @package
     * @type {?ContextNode<?>}
     */
    this.parent = null;

    /**
     * See `parent` description.
     *
     * @package
     * @type {?ContextNode<?>[]}
     */
    this.children = null;

    /**
     * @package
     * @type {?Map<string, GroupDef>}
     */
    this.groups = null;

    /**
     * @package
     * @type {Values}
     */
    this.values = new Values(this);

    /**
     * @private
     * @type {?Map<SID, import('./subscriber').Subscriber<?>>}
     */
    this.subscribers_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.parentOverridden_ = false;

    /**
     * @const
     * @private
     * @type {function():void}
     */
    this.scheduleDiscover_ = throttleTail(
      this.discover_.bind(this),
      setTimeout
    );

    // Shadow root: track slot changes.
    if (node.nodeType == FRAGMENT_NODE) {
      node.addEventListener('slotchange', (e) => {
        const slot = /** @type {HTMLSlotElement} */ (e.target);
        // Rediscover newly assigned nodes.
        slot.assignedNodes().forEach(discoverContained);
        // Rediscover unassigned nodes.
        ContextNode.closest(slot)?.children?.forEach(discoverContextNode);
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
    } else if (this.name && this.children) {
      // Recursively discover the group's children.
      this.children.forEach(discoverContextNode);
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
   * @param {?(ContextNode<?>|Node)} parent
   */
  setParent(parent) {
    const parentContext = /** @type {*} */ (parent)?.nodeType
      ? ContextNode.get(/** @type {Node} */ (parent))
      : /** @type {?ContextNode<?>} */ (parent);
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
    const newRoot = isRoot ? this : this.parent?.root ?? null;
    this.updateRoot(newRoot);
  }

  /**
   * @param {?ContextNode<?>} root
   * @protected Used cross-binary.
   */
  updateRoot(root) {
    devAssert(!root || root.isRoot);
    const oldRoot = this.root;
    if (root != oldRoot) {
      // The root has changed.
      this.root = root;

      // Make sure the tree changes have been reflected for values.
      this.values.rootUpdated();

      // Make sure the tree changes have been reflected for subscribers.
      this.subscribers_?.forEach((comp) => comp.rootUpdated());

      // Propagate the root to the subtree.
      this.children?.forEach((child) => child.updateRoot(root));
    }
  }

  /**
   * @param {string} name
   * @param {function(Node):boolean} match
   * @param {number} weight
   * @return {ContextNode<?>}
   */
  addGroup(name, match, weight) {
    const groups = this.groups || (this.groups = new Map());
    const {children, node} = this;
    const cn = new ContextNode(node, name);
    groups.set(name, {cn, match, weight});
    cn.setParent(this);
    children?.forEach(discoverContextNode);
    return cn;
  }

  /**
   * @param {string} name
   * @return {?ContextNode<?>}
   */
  group(name) {
    return this.groups?.get(name)?.cn || null;
  }

  /**
   * @param {Node} node
   * @return {?ContextNode<?>}
   * @protected
   */
  findGroup(node) {
    const {groups} = this;
    if (!groups) {
      return null;
    }
    let found = null;
    let maxWeight = Number.NEGATIVE_INFINITY;
    groups.forEach(({cn, match, weight}) => {
      if (match(node, this.node) && weight > maxWeight) {
        found = cn;
        maxWeight = weight;
      }
    });
    return found;
  }

  /**
   * Add or update a subscriber with a specified ID. If subscriber doesn't
   * yet exist, it will be created using the specified factory. The use
   * of factory is important to reduce bundling costs for context node.
   * If `func` returns a function, that function is called on cleanup.
   *
   * @param {SID} id
   * @param {typeof import('./subscriber').Subscriber} Ctor
   * @param {import('./subscriber').SubscribeCallback<DEP>} func
   * @param {IContextProp<DEP, ?>[]} deps
   * @template DEP
   */
  subscribe(id, Ctor, func, deps) {
    const subscribers = this.subscribers_ || (this.subscribers_ = new Map());
    let subscriber = subscribers.get(id);
    if (!subscriber) {
      subscriber = new Ctor(
        /** @type {ContextNode<function(...DEP):void>} */ (
          /** @type {?} */ (this)
        ),
        func,
        deps
      );
      subscribers.set(id, subscriber);
    }
  }

  /**
   * Removes the subscriber previously set with `subscribe`.
   *
   * @param {SID} id
   */
  unsubscribe(id) {
    const subscribers = this.subscribers_;
    const subscriber = subscribers?.get(id);
    if (subscriber) {
      subscriber.dispose();
      devAssert(subscribers);
      subscribers.delete(id);
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
    const closestNode = ContextNode.closest(this.node, /* includeSelf */ false);
    const parent = closestNode?.findGroup(this.node) || closestNode;
    this.updateTree_(parent, /* parentOverridden */ false);
  }

  /**
   * @param {?ContextNode<?>} parent
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
      if (oldParent?.children) {
        devAssert(oldParent.children);
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
        for (const child of parentChildren) {
          if (child != this && child.isDiscoverable()) {
            child.discover();
          }
        }
      }

      this.values.parentUpdated();
    }

    // Check the root.
    this.updateRoot(parent?.root ?? null);
  }
}

/**
 * Iterates over all context nodes that are contained within the specified
 * `node`. Only iterates over known context nodes.
 *
 * @param {Node} node
 * @param {function(ContextNode<?>):void} callback
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
    for (const child of closest.children) {
      if (node.contains(child.node)) {
        callback(child);
      }
    }
  }
}

/**
 * @param {Node} node
 */
function discoverContained(node) {
  forEachContained(node, discoverContextNode);
}

/**
 * @param {ContextNode<?>} cn
 */
function discoverContextNode(cn) {
  cn.discover();
}
