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

/**
 * Performs the `closest()` scan through context nodes to find the one that
 * matches the predicate with an optional argument.
 *
 * @param {!./node.ContextNode} startNode
 * @param {function(!./node.ContextNode, T):boolean} predicate
 * @param {T=} arg
 * @param {boolean=} includeSelf
 * @return {?./node.ContextNode}
 * @template T
 */
export function findParent(
startNode,
predicate,
arg = undefined,
includeSelf = true)
{let _arg = arg,_includeSelf = includeSelf;
  for (let n = _includeSelf ? startNode : startNode.parent; n; n = n.parent) {
    if (predicate(n, _arg)) {
      return n;
    }
  }
  return null;
}

/**
 * Performs the deep scan through context nodes and calls the specified
 * callback with the optional argument. A node can stop the deep scan into its
 * subtree by returning a falsy result. Otherwise, the subtree will be scanned
 * and the result value will be passed to the children callbacks.
 *
 * @param {!./node.ContextNode} startNode
 * @param {function(!./node.ContextNode, T, S):S} callback
 * @param {T=} arg
 * @param {S=} state
 * @param {boolean=} includeSelf
 * @template T
 * @template S
 */
export function deepScan(
startNode,
callback,
arg = undefined,
state = true,
includeSelf = true)
{let _arg2 = arg,_state = state,_includeSelf2 = includeSelf;
  if (_includeSelf2) {
    const newState = callback(startNode, _arg2, _state);
    if (newState) {
      deepScan(startNode, callback, _arg2, newState, false);
    }
  } else if (startNode.children) {
    for (const node of startNode.children) {
      deepScan(node, callback, _arg2, _state, true);
    }
  }
}