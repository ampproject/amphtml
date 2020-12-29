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

import {
  IframePool,
  IframePosition,
  MAX_IFRAMES,
} from '../../src/amp-story-player/amp-story-player-iframe-pool';

describes.fakeWin('AmpStoryPlayer IframePool', {amp: false}, () => {
  function initializePool(numStories) {
    const pool = new IframePool();
    for (let i = 0; i < numStories; i++) {
      if (i < MAX_IFRAMES) {
        pool.addIframeIdx(i);
      }
      pool.addStoryIdx(i);
    }
    return pool;
  }

  describe('findAdjacent traversal', () => {
    it('should correctly traverse when finding adjacent at the middle of story array', () => {
      const pool = initializePool(5 /* numStories */);

      const loadingQueue = pool.findAdjacent(3 /* storyIdx */, 4 /* maxIdx */);
      const traversalArr = loadingQueue.map((iframeObj) => iframeObj.storyIdx);
      expect(traversalArr).to.eql([3, 4, 2]);
    });

    it('should correctly traverse when finding adjacent at the end of array', () => {
      const pool = initializePool(3 /* numStories */);

      const loadingQueue = pool.findAdjacent(2 /* storyIdx */, 2 /* maxIdx */);
      const traversalArr = loadingQueue.map((iframeObj) => iframeObj.storyIdx);
      expect(traversalArr).to.eql([2, 1, 0]);
    });

    it('should correctly traverse when finding adjacent at the start of array', () => {
      const pool = initializePool(3 /* numStories */);

      const loadingQueue = pool.findAdjacent(0 /* storyIdx */, 2 /* maxIdx */);
      const traversalArr = loadingQueue.map((iframeObj) => iframeObj.storyIdx);
      expect(traversalArr).to.eql([0, 1, 2]);
    });

    it('should correctly traverse when array is shorter than MAX_IFRAMES at start', () => {
      const pool = initializePool(2 /* numStories */);

      const loadingQueue = pool.findAdjacent(0 /* storyIdx */, 1 /* maxIdx */);
      const traversalArr = loadingQueue.map((iframeObj) => iframeObj.storyIdx);
      expect(traversalArr).to.eql([0, 1]);
    });

    it('should correctly traverse when array is shorter than MAX_IFRAMES at end', () => {
      const pool = initializePool(2 /* numStories */);

      const loadingQueue = pool.findAdjacent(1 /* storyIdx */, 1 /* maxIdx */);
      const traversalArr = loadingQueue.map((iframeObj) => iframeObj.storyIdx);
      expect(traversalArr).to.eql([1, 0]);
    });

    it('should only return single storyIdx when there is only one story in the array', () => {
      const pool = initializePool(1 /* numStories */);

      const loadingQueue = pool.findAdjacent(0 /* storyIdx */, 0 /* maxIdx */);
      const traversalArr = loadingQueue.map((iframeObj) => iframeObj.storyIdx);
      expect(traversalArr).to.eql([0]);
    });

    it('throw when maxIdx is less than storyIdx', async () => {
      const pool = initializePool(1 /* numStories */);
      return expect(() =>
        pool.findAdjacent(1 /* storyIdx */, 0 /* maxIdx */)
      ).to.throw('maxIdx must be greater than or equal than storyIdx.');
    });
  });

  describe('findAdjacent iframe management', () => {
    it('should only mark MAX_IFRAMES_TO_LOAD in the resulting array', () => {
      const pool = initializePool(3 /* numStories */);

      const loadingQueue = pool.findAdjacent(2 /* storyIdx */, 2 /* maxIdx */);
      const shouldLoadArr = loadingQueue.map(
        (iframeObj) => iframeObj.shouldLoad
      );

      expect(shouldLoadArr).to.eql([true, true, false]);
    });

    it('should position iframes previous of storyIdx when at the end of the array', () => {
      const pool = initializePool(3 /* numStories */);

      const loadingQueue = pool.findAdjacent(2 /* storyIdx */, 2 /* maxIdx */);
      const positionArr = loadingQueue.map((iframeObj) => iframeObj.position);

      expect(positionArr).to.eql([
        IframePosition.CURRENT,
        IframePosition.PREVIOUS,
        IframePosition.PREVIOUS,
      ]);
    });

    it('should position iframes next of storyIdx when at the start of the array', () => {
      const pool = initializePool(3 /* numStories */);

      const loadingQueue = pool.findAdjacent(0 /* storyIdx */, 2 /* maxIdx */);
      const positionArr = loadingQueue.map((iframeObj) => iframeObj.position);

      expect(positionArr).to.eql([
        IframePosition.CURRENT,
        IframePosition.NEXT,
        IframePosition.NEXT,
      ]);
    });

    it('should position iframes of storyIdx when at the middle of the array', () => {
      const pool = initializePool(3 /* numStories */);

      const loadingQueue = pool.findAdjacent(1 /* storyIdx */, 2 /* maxIdx */);
      const positionArr = loadingQueue.map((iframeObj) => iframeObj.position);

      expect(positionArr).to.eql([
        IframePosition.CURRENT,
        IframePosition.NEXT,
        IframePosition.PREVIOUS,
      ]);
    });
  });
});
