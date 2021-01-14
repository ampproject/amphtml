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
   * @param {number} storyIdx
   * @param {number} maxIdx
   * @return {!Array<!Object>}
   */
  findAdjacent(storyIdx, maxIdx) {
    const iframesToPosition = Math.min(MAX_IFRAMES, maxIdx + 1);

    const adjacent = [];

    if (maxIdx < storyIdx) {
      throw new Error('maxIdx must be greater than or equal than storyIdx.');
    }

    adjacent.push({
      storyIdx,
      shouldLoad: adjacent.length < MAX_IFRAMES_TO_LOAD,
      position: IframePosition.CURRENT,
    });

    let cursorRight = storyIdx + 1;
    let cursorLeft = storyIdx - 1;

    while (adjacent.length < iframesToPosition) {
      if (cursorRight <= maxIdx) {
        adjacent.push({
          storyIdx: cursorRight++,
          shouldLoad: adjacent.length < MAX_IFRAMES_TO_LOAD,
          position: IframePosition.NEXT,
        });
      }

      if (cursorLeft >= 0 && adjacent.length < iframesToPosition) {
        adjacent.push({
          storyIdx: cursorLeft--,
          shouldLoad: adjacent.length < MAX_IFRAMES_TO_LOAD,
          position: IframePosition.PREVIOUS,
        });
      }
    }

    return adjacent;
  }
}
