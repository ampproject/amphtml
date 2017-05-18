/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const MAX_DEPTH = 10;
const FORBIDDEN_SPLIT = {
  'TABLE': 1,
  'UL': 1,
  'OL': 1,
  'DL': 1,
};


/**
 * Stream-merges the input DOM into the target. The `flush()` method can be
 * called as often as needed, but it's recommended to only call it in vsync
 * mutate.
 */
export class DomStream {

  /**
   * @param {!Node} input
   * @param {!Node} target
   */
  constructor(input, target) {
    /** @const @private {!Node} */
    this.input_ = input;

    /** @private {?Node} */
    this.inputPoint_ = null;

    /** @const @private {!Node} */
    this.target_ = target;

    /** @private {!Node} */
    this.targetPoint_ = target;

    /** @const @private {number} */
    this.maxDepth_ = MAX_DEPTH;

    /** @private {number} */
    this.depth_ = 0;
  }

  /**
   * Merges all confirmed completed nodes from input to target. It's recommended
   * to always call this method in vsync mutate phase.
   */
  flush() {
    this.flush_(/* eof */ false);
  }

  /**
   * Signals that the input DOM is complete. Merges all pending nodes into
   * the target DOM. It's recommended to always call this method in vsync
   * mutate phase.
   */
  done() {
    this.flush_(/* eof */ true);
  }

  /**
   * @param {boolean} eof
   * @private
   */
  flush_(eof) {
    // There are two phases:
    // 1. "advance". This phase waits for a sibling node to the pending node
    //    or a singling node to one of its ancestors. As soon as sibling node
    //    is found, the parse of pending node is complete and it can be merged
    //    into the target DOM.
    // 2. "split". If no sibling nodes are found, this phase finds the nearest
    //    descendant of this node with a sibling. If found, it imports the
    //    partial DOM path and the found descendant node into the target DOM.
    //    There are limitations of how deep the input DOM can be split and some
    //    nodes are not allowed to be split, such as "table" and "ul".
    let splitsLeft = eof ? 0 : 1;
    let lastInputPoint;
    do {
      lastInputPoint = this.inputPoint_;
      this.advance_();
      if (this.inputPoint_ &&
          lastInputPoint == this.inputPoint_ &&
          splitsLeft > 0 &&
          this.depth_ + 1 < this.maxDepth_) {
        splitsLeft--;
        this.split_();
      }
    } while (this.inputPoint_ && lastInputPoint != this.inputPoint_);

    // EOF: merge the last node.
    if (eof && this.inputPoint_) {
      this.targetPoint_.appendChild(this.importNode_(this.inputPoint_, true));
    }
  }

  /** @private */
  advance_() {
    // Wait for the first input node to arrive.
    if (!this.inputPoint_) {
      this.inputPoint_ = this.input_.firstChild;
    }
    if (!this.inputPoint_) {
      return;
    }

    // Find next sibling to unblock the current input point.
    let next = null;
    let depth = 0;
    if (this.inputPoint_.nextSibling) {
      // Simplest situation: the next sibling has already been parsed.
      next = this.inputPoint_.nextSibling;
    } else {
      // Maybe this is a last child? Try parents.
      let localDepth = 0;
      for (let n = this.inputPoint_.parentNode;
              n && n != this.input_;
              n = n.parentNode) {
        localDepth++;
        if (n.nextSibling) {
          next = n.nextSibling;
          depth = localDepth;
          break;
        }
      }
    }
    if (!next) {
      return;
    }

    // Found next sibling on this level or lower: reconstruct the current
    // buffer node.
    this.targetPoint_.appendChild(this.importNode_(this.inputPoint_, true));
    if (depth > 0) {
      for (let i = 0; i < depth; i++) {
        this.targetPoint_ = this.targetPoint_.parentNode;
      }
      this.depth_ -= depth;
    }
    this.inputPoint_ = next;
  }

  /** @private */
  split_() {
    // Find a node that can be split.
    let node = this.inputPoint_;
    let next = null;
    let depth = 0;
    while (!next &&
            node.firstChild &&
            (this.depth_ + depth + 1) < this.maxDepth_ &&
            !FORBIDDEN_SPLIT[node.tagName]) {
      depth++;
      node = node.firstChild;
      if (node.nextSibling) {
        next = node;
      }
    }
    if (!next) {
      return;
    }

    // Split.
    const targetNode = this.importNode_(next, true);
    let targetInterim = targetNode;
    let inputParent = next.parentNode;
    for (let i = 0; i < depth; i++) {
      const targetParent = this.importNode_(inputParent, false);
      targetParent.appendChild(targetInterim);
      targetInterim = targetParent;
      inputParent = inputParent.parentNode;
    }
    this.targetPoint_.appendChild(targetInterim);
    this.targetPoint_ = targetNode.parentNode;
    this.inputPoint_ = next.nextSibling;
    this.depth_ += depth;
  }

  /**
   * @param {!Node} input
   * @param {boolean} deep
   * @return {!Node}
   * @private
   */
  importNode_(input, deep) {
    return this.target_.ownerDocument.importNode(input, deep);
  }
}
