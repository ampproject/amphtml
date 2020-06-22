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
 * Manages the iframes used to host the stories inside the player. It keeps
 * track of the iframes hosting stories, and what stories have an iframe.
 */
export class IframePool {
  /** @public */
  constructor() {
    /** @private @const {!Array<number>} */
    this.iframePool_ = [];

    /** @private @const {!Array<number>} */
    this.storyIdsWithIframe_ = [];
  }

  /**
   * @param {number} idx
   * @public
   */
  addIframeIdx(idx) {
    this.iframePool_.push(idx);
  }

  /**
   * @param {number} idx
   * @public
   */
  addStoryIdx(idx) {
    this.storyIdsWithIframe_.push(idx);
  }

  /**
   * Takes the first iframe in the array and allocates it to the next story
   * without an iframe. It also updates the storyIdsWithIframe by removing the
   * reference to the detached story and adds the new one.
   * @param {number} nextStoryIdx
   * @return {number} Index of the detached story.
   * @public
   */
  rotateFirst(nextStoryIdx) {
    const detachedStoryIdx = this.storyIdsWithIframe_.shift();
    this.storyIdsWithIframe_.push(nextStoryIdx);

    this.iframePool_.push(this.iframePool_.shift());

    return detachedStoryIdx;
  }

  /**
   * Takes the last iframe in the array and allocates it to the next incoming
   * story without an iframe. It also updates the storyIdsWithIframe by removing
   * the reference to the detached story and adds the new one.
   * @param {number} nextStoryIdx
   * @return {number} Index of the detached story.
   * @public
   */
  rotateLast(nextStoryIdx) {
    const detachedStoryIdx = this.storyIdsWithIframe_.pop();
    this.storyIdsWithIframe_.unshift(nextStoryIdx);

    this.iframePool_.unshift(this.iframePool_.pop());

    return detachedStoryIdx;
  }

  /**
   * Clears stored story indices.
   * @return {!Array<number>}
   */
  evictStories() {
    const evictedStories = this.storyIdsWithIframe_;
    this.storyIdsWithIframe_ = [];
    return evictedStories;
  }

  /**
   * @return {!Array<number>}
   */
  getAvailableIframeIdx() {
    return this.iframePool_;
  }

  /**
   * Finds adjacent iframe indices given an index.
   * Examples of resulting adjacent arrays (x is provided index):
   * [x] [1] [2] [] []
   * [2] [x] [1] [] []
   * [] [] [2] [1] [x]
   * [1] [x]
   * @param {number} storyIdx
   * @param {number} maxIdx
   * @return {!Array<number>}
   */
  findAdjacent(storyIdx, maxIdx) {
    const queue = [storyIdx];
    const adjacent = [];

    const findAdjacentRecursive = () => {
      const idx = queue.shift();

      if (idx < 0 || idx > maxIdx) {
        return;
      }

      adjacent.push(idx);

      if (!queue.includes(idx + 1) && !adjacent.includes(idx + 1)) {
        queue.push(idx + 1);
      }

      if (!queue.includes(idx - 1) && !adjacent.includes(idx - 1)) {
        queue.push(idx - 1);
      }

      while (adjacent.length < this.iframePool_.length && queue.length > 0) {
        findAdjacentRecursive();
      }
    };

    findAdjacentRecursive();

    return adjacent;
  }
}
