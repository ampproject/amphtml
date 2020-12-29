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
export const IframePosition = {
  PREVIOUS: -1,
  CURRENT: 0,
  NEXT: 1,
};

/** @const {number} */
export const MAX_IFRAMES = 3;

/** @const {number} */
const MAX_IFRAMES_TO_LOAD = 2;

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
   * Finds adjacent iframes given an story, starting in N, N+1, N-1, N+2, N-2...
   *
   * It will only allow up to MAX_IFRAMES_TO_LOAD to be loaded.
   * Those that can be loaded will have the `shouldLoad` property as `true`.
   * The rest should only be positioned.
   *
   * Examples of traversal:
   *
   * x = storyIdx
   *
   * 1 -> [2] [x] [1] [] []
   * 0 -> [x] [1] [2] [] []
   * 4 -> [] [] [2] [1] [x]
   * 0 -> [x] [1]
   * 1 -> [1] [x]
   *
   * Flow chart:
   *
   *                       +------------------------+
   *     +---------------> | Visit iframe in cursor +<-----------------+
   *     |                 +------------------------+                  |
   *     |                            |                                |
   *     |                            v                                |
   *     |                 +-------------------------+        +--------------------+
   *     |                 |                         |    N   |                    |
   *     |                 | cursor inside of bounds?|        |move cursor to other|
   *     |                 |                         +------->+      extreme       |
   *     |                 +-------------------------+        +--------------------+
   *     |                            |
   *     |                            |  Y
   *     |                            |
   *     |                            v
   *     |              +--------------------------------+
   *     |              |                                |
   *     |              | should this iframe load a src? |
   *     |              |   (iframesToLoad > 0 ?)        +--------+
   *     |              |                                |        |
   *     |              +--------------------------------+        |
   *     |                            |                           |
   *     |                            |  Y                        |
   *     |                            |                           |
   *     |                            v                           |
   *     |               +-------------------------------         |
   *     |               |                             |          |
   *     |               | mark iframe to load its src |        N |
   *     |               |                             |          |
   *     |               +-----------------------------+          |
   *     |                            |                           |
   *     |                            |   Y                       |
   *     |                            v                           |
   *     |                +---------------------------+           |
   *     |                |                           |           |
   *     |                |   mark its positioning    |           |
   *     |                | (previous / current next) | <---------+
   *     |                |                           |
   *     |                +---------------------------+
   *     |                            v
   *     |            +--------------------------------------+     Y      +-------------------------+
   *     |            |   finished finding adjacent iframes? +------------> exit and return adjacent|
   *     |            +--------------------------------------+            |       array             |
   *     |                            |                                   +-------------------------+
   *     |                            |  N
   *     |                            v
   *     |                +---------------------------+
   *     |                |                           |
   *     |                | is cursor to the left of  |
   *     |        Y       | storyIdx or IS storyIdx?  |       N
   *     |          +-----+                           +------+
   *     |          |     +---------------------------+      |
   *     |          |                                        |
   *     |          v                                        v
   *     |  +---------------------------+    +----------------------+
   *     |  |                           |    |                      |
   *     |  |  move cursor to the right |    |  move cursor to the  |
   *     |  |      of storyIdx          |    |  left of storyIdx    |
   *     |  |                           |    |                      |
   *     |  +---------------------------+    +----------------------+
   *     |          |                                        |
   *     |          |                                        |
   *     |          +----------------------------------------+
   *     |                               |
   *     +-------------------------------+
   *
   * @param {number} storyIdx
   * @param {number} maxIdx
   * @return {!Array<!Object>}
   */
  findAdjacent(storyIdx, maxIdx) {
    const iframesToPosition = Math.min(MAX_IFRAMES, maxIdx + 1);
    let iframesToLoad = MAX_IFRAMES_TO_LOAD;

    if (maxIdx < storyIdx) {
      throw new Error('maxIdx must be greater than or equal than storyIdx.');
    }

    let cursor = storyIdx;
    let distance = 0;
    const adjacent = [];
    while (adjacent.length < iframesToPosition) {
      if (cursor > maxIdx) {
        // No more stories to the right, move to the left.
        cursor = storyIdx - distance;
        continue;
      }

      if (cursor < 0) {
        // No more stories to the left, move to the right.
        cursor = storyIdx + distance;
        continue;
      }

      adjacent.push({
        storyIdx: cursor,
        shouldLoad: iframesToLoad > 0,
        position:
          cursor === storyIdx
            ? IframePosition.CURRENT
            : cursor > storyIdx
            ? IframePosition.NEXT
            : IframePosition.PREVIOUS,
      });
      --iframesToLoad;

      if (cursor > storyIdx) {
        // Cursor is currently at the right of storyIdx.
        // Move to the left of storyIdx and increase distance.
        cursor = storyIdx - distance;
        distance++;
        continue;
      }

      if (cursor <= storyIdx) {
        // Cursor is currently at the left of (or is) storyIdx.
        // Move to the right of storyIdx and increase distance.
        cursor = cursor === storyIdx ? cursor + 1 : storyIdx + distance;
        distance++;
        continue;
      }
    }

    return adjacent;
  }
}
