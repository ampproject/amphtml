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

/** @enum {number} */
const IframePosition = {
  PREVIOUS: -1,
  CURRENT: 0,
  NEXT: 1,
};

/** @const {number} */
const MAX_IFRAMES = 2;

/**
 * Manages the iframes used to host the stories inside the player. It keeps
 * track of the iframes hosting stories, and what stories have an iframe.
 */
export class IframePool {
  /** @public */
  constructor() {
    /** @private @const {!Array<number>} */
    this.iframePool_ = [];

    /** @private {!Array<number>} */
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
    this.storyIdsWithIframe_.sort();

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
    this.storyIdsWithIframe_.push(nextStoryIdx);
    this.storyIdsWithIframe_.sort();

    return detachedStoryIdx;
  }

  /**
   * Finds adjacent iframes given an story, starting in N and going to N+1.
   * Following a DFS order.
   *
   * It will only allow up to MAX_IFRAMES to be loaded. Those that can be loaded
   * will have the `shouldLoad` property as `true`. The rest should only be
   * positioned.
   *
   * Examples of traversal:
   * idx
   * 1 -> [2] [0] [1] [] []
   * 0 -> [0] [1] [2] [] []
   * 4 -> [] [] [2] [1] [0]
   * 0 -> [0] [1]
   * 1 -> [1] [0]
   * @param {number} storyIdx
   * @param {number} maxIdx
   * @return {!Array<!Object>}
   */
  findAdjacentDFS(storyIdx, maxIdx) {
    const adjacent = [];
    let iframesToLoad = MAX_IFRAMES;

    const neighborsQueue = [storyIdx, storyIdx + 1, storyIdx - 1];
    while (adjacent.length < this.iframePool_.length) {
      const cursorIdx = neighborsQueue.shift();

      if (cursorIdx > maxIdx || cursorIdx < 0) {
        continue;
      }

      adjacent.push({
        storyIdx: cursorIdx,
        shouldLoad: iframesToLoad > 0,
        position:
          cursorIdx === storyIdx
            ? IframePosition.CURRENT
            : cursorIdx > storyIdx
            ? IframePosition.NEXT
            : IframePosition.PREVIOUS,
      });
      --iframesToLoad;

      if (cursorIdx > storyIdx && cursorIdx + 1 <= maxIdx) {
        // Add neighbors to the right of the story to the queue.
        neighborsQueue.push(cursorIdx + 1);
        continue;
      }

      if (cursorIdx < storyIdx && cursorIdx - 1 >= 0) {
        // Add neighbors to the left of the story to the queue.
        neighborsQueue.push(cursorIdx - 1);
        continue;
      }
    }

    return adjacent;
  }
}
