import {ContextNode} from './node';

/**
 * @template T, DEP
 * @typedef {import('./types.d').IContextProp<T, DEP>} IContextProp
 */

export {contextProp} from './prop';
export {subscribe, unsubscribe} from './subscriber';

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
export function assignSlot(node, slot) {
  ContextNode.assignSlot(node, slot);
}

/**
 * Unassigns the direct slot previously done by the `assignSlot` call.
 * Automatically starts the discovery phase for the affected nodes.
 *
 * @param {Node} node The target node.
 * @param {Node} slot The slot from which the target node is assigned.
 */
export function unassignSlot(node, slot) {
  ContextNode.unassignSlot(node, slot);
}

/**
 * Sets (or unsets) the direct parent. If the parent is set, the node will no
 * longer try to discover itself.
 *
 * @param {Node|ShadowRoot} node
 * @param {?Node} parent
 */
export function setParent(node, parent) {
  ContextNode.get(node).setParent(parent);
}

/**
 * @param {Node} node
 */
export function discover(node) {
  ContextNode.get(node).discover();
}

/**
 * Designates (or undesignates) the node as a root node. If the node is
 * designated as a root, it will no longer discover itself.
 *
 * @param {Node} node
 * @param {boolean} isRoot
 */
export function setIsRoot(node, isRoot) {
  ContextNode.get(node).setIsRoot(isRoot);
}

/**
 * Reruns discovery on the children of the specified node, if any.
 *
 * @param {Node} node
 */
export function rediscoverChildren(node) {
  ContextNode.rediscoverChildren(node);
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
 * @param {Node} node The target node.
 * @param {IContextProp<T, ?>} prop
 * @param {function(*):void} setter
 * @param {T} value
 * @template T
 */
export function setProp(node, prop, setter, value) {
  ContextNode.get(node).values.set(prop, setter, value);
}

/**
 * Unsets the input value for the specified property and setter.
 * See `setProp()` for more info.
 *
 * @param {Node} node The target node.
 * @param {IContextProp<T, ?>} prop
 * @param {function(*):void} setter
 * @template T
 */
export function removeProp(node, prop, setter) {
  ContextNode.get(node).values.remove(prop, setter);
}

/**
 * @param {Node} node
 * @param {string} name
 * @param {function(Node):boolean} match
 * @param {number=} weight
 */
export function addGroup(node, name, match, weight = 0) {
  ContextNode.get(node).addGroup(name, match, weight);
}

/**
 * @param {Node} node
 * @param {string} groupName
 * @param {IContextProp<T, ?>} prop
 * @param {function(T):void} setter
 * @param {T} value
 * @template T
 */
export function setGroupProp(node, groupName, prop, setter, value) {
  ContextNode.get(node).group(groupName)?.values.set(prop, setter, value);
}

/**
 * @param {Node} node
 * @param {string} groupName
 * @param {IContextProp<T, ?>} prop
 * @param {function(T):void} setter
 * @template T
 */
export function removeGroupProp(node, groupName, prop, setter) {
  ContextNode.get(node).group(groupName)?.values.remove(prop, setter);
}
