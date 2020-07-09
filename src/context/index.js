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

/**
 * Public API published by the context node. The `ContextNode` API is too
 * low-level and the direct use of that API is not allowed.
 */
export class ContextApi {
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
    ContextNode.assignSlot(node, slot);
  }

  /**
   * Unassigns the direct slot previously done by the `assignSlot` call.
   * Automatically starts the discovery phase for the affected nodes.
   *
   * @param {!Node} node The target node.
   * @param {!Node} slot The slot from which the target node is assigned.
   */
  static unassignSlot(node, slot) {
    ContextNode.unassignSlot(node, slot);
  }
}
