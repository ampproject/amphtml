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

export class LayoutLayers {
  constructor() {
    /** @const {!Array<!LayoutLayer>} */
    this.layers_ = [];
  }

  /**
   * Calculates the element's intersection with the viewport's rect.
   *
   * @param {!Element} element A regular or AMP Element
   * @param {!Rect} viewportRect
   */
  calcViewportIntersection(element, viewportRect) {
    // Get LayoutLayer `ll`
    // Get ancestry of every LayoutLayer parent
    // Perform box intersection calcs top-down, until we get a final
    //   intersection.
  }

  /**
   * Remeasures the element, and any other elements who's cached rects may have
   * been altered by this element's mutation.
   *
   * This is meant to be called after any element mutation happens (eg.
   * #buildCallback, #layoutCallback, viewport changes size).
   *
   * @param {!Element} element A regular or AMP Element
   */
  remeasure(element) {
    // Get LayoutLayer `ll`.
    // Get `ll`'s parent LayoutLayer `parent`.
    // Recursively remeasure every element under `parent`.
    // This can be optimized to only scan elements _after_ `element` inside
    //   `ll`, and LayoutLayers after `ll`.
  }

  /**
   * Changes the element's rect size.
   *
   * @param {!AmpElement} element An AMP Element
   * @param {!Size} size
   * @param {boolean=} force Whether to skip approval/denial logic
   */
  changeSize(element, size, force = false) {
  }
}

class LayoutLayer {
  constructor(element) {
    this.root_ = element;

    /**
     * A penalty applied to elements in this layer, so that they are classified as "less important" than elements in other layers.
     * This is so element's inside a closed sidebar layer are "less important" than visible content elements.
     * This penalty may change dynamically.
     *
     * @private @type {number}
     */
    // this.priorityPenalty_ = 0;

  }
}
