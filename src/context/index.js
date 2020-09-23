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

import {ContextNode} from './node';

export {contextProp} from './prop';
export {withMetaData} from './component-meta';
export {
  mountComponent,
  unmountComponent,
  subscribe,
  unsubscribe,
  useMountComponent,
  useUnmountComponent,
  useSubscribe,
  useUnsubscribe,
} from './component-install';
export {
  useRef,
  useMemo,
  useDisposableMemo,
  useSyncEffect,
  useSetProp,
  useRemoveProp,
} from './component-hooks';

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
export function assignSlot(node, slot) {
  ContextNode.assignSlot(node, slot);
}

/**
 * Unassigns the direct slot previously done by the `assignSlot` call.
 * Automatically starts the discovery phase for the affected nodes.
 *
 * @param {!Node} node The target node.
 * @param {!Node} slot The slot from which the target node is assigned.
 */
export function unassignSlot(node, slot) {
  ContextNode.unassignSlot(node, slot);
}

/**
 * Sets (or unsets) the direct parent. If the parent is set, the node will no
 * longer try to discover itself.
 *
 * @param {!Node} node
 * @param {!Node|null} parent
 */
export function setParent(node, parent) {
  ContextNode.get(node).setParent(parent);
}

/**
 * Reruns discovery on the children of the specified node, if any.
 *
 * @param {!Node} node
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
 * @param {!Node} node The target node.
 * @param {!ContextProp<T>} prop
 * @param {*} setter
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
 * @param {!Node} node The target node.
 * @param {!ContextProp} prop
 * @param {*} setter
 */
export function removeProp(node, prop, setter) {
  ContextNode.get(node).values.remove(prop, setter);
}

/**
 * @param {!Node} node
 * @param {string} name
 * @param {function(!Node):boolean} match
 * @param {number=} weight
 */
export function addGroup(node, name, match, weight = 0) {
  ContextNode.get(node).addGroup(name, match, weight);
}

/**
 * @param {!Node} node
 * @param {string} groupName
 * @param {!ContextProp<T>} prop
 * @param {*} setter
 * @param {T} value
 * @template T
 */
export function setGroupProp(node, groupName, prop, setter, value) {
  ContextNode.get(node).group(groupName).values.set(prop, setter, value);
}

/**
 * @param {!Node} node
 * @param {string} groupName
 * @param {!ContextProp} prop
 * @param {*} setter
 */
export function removeGroupProp(node, groupName, prop, setter) {
  ContextNode.get(node).group(groupName).values.remove(prop, setter);
}
