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
import {MediaPool, MediaType} from '../media-pool';
import {Services} from '../../../../src/services';
import {findIndex} from '../../../../src/utils/array';

const NOOP = () => {};

describes.realWin('media-pool', {}, env => {
  let win;
  let mediaPool;
  let distanceFnStub;
  const COUNTS = {
    [MediaType.AUDIO]: 2,
    [MediaType.VIDEO]: 2,
  };

  beforeEach(() => {
    win = env.win;
    sandbox.stub(Services, 'vsyncFor')
        .callsFake(() => ({mutate: task => task()}));
    sandbox.stub(Services, 'timerFor')
        .callsFake(() => ({delay: NOOP}));

    mediaPool = new MediaPool(win, COUNTS, element => {
      return distanceFnStub(element);
    });
  });

  /**
   * @param {string} tagName
   * @return {!HTMLMediaElement}
   */
  function createMediaElement(tagName) {
    const el = env.win.document.createElement(tagName);
    el.src = `http://example.com/${tagName}.xyz`;
    env.win.document.body.appendChild(el);
    return el;
  }

  /**
   * @param {string} tagName
   * @param {number} count
   * @return {!Array<!HTMLMediaElement>}
   */
  function createMediaElements(tagName, count) {
    const results = [];

    for (let i = 0; i < count; i++) {
      results.push(createMediaElement(tagName));
    }

    return results;
  }

  /**
   * @param {!Array<!HTMLMediaElement>} elements
   * @return {function(!Element): number} The distance
   */
  function arrayOrderDistanceFn(elements) {
    return element => {
      const index = elements.indexOf(element);
      if (index < 0) {
        return 9999;
      }

      return index;
    };
  }

  /**
   * @param {!Object|!Array} poolOrPools
   * @return {!Array<!HTMLMediaElement>}
   */
  function getElements(poolOrPools) {
    const results = [];

    const pools = Array.isArray(poolOrPools) ? poolOrPools : [poolOrPools];
    pools.forEach(pool => {
      Object.keys(pool).forEach(key => {
        pool[key].forEach(el => {
          results.push(el);
        });
      });
    });

    return results;
  }

  /**
   * @param {!Array<!HTMLMediaElement>} array
   * @param {!HTMLMediaElement} element
   * @return {boolean>}
   */
  function isElementInPool(array, element) {
    const index = findIndex(array, el => {
      return el['replaced-media'] === element.getAttribute('id');
    });

    return index >= 0;
  }

  it('should not be null', () => {
    expect(mediaPool).to.not.be.null;
  });

  it('should start with no allocated elements', () => {
    expect(getElements(mediaPool.allocated).length).to.equal(0);
  });

  it('should allocate element on play', () => {
    mediaPool = new MediaPool(win, {'video': 2}, unusedEl => 0);

    const videoEl = createMediaElement('video');
    mediaPool.register(videoEl);

    expect(mediaPool.allocated['video'].length).to.equal(0);
    expect(mediaPool.unallocated['video'].length).to.equal(2);

    mediaPool.play(videoEl);

    expect(mediaPool.allocated['video'].length).to.equal(1);
    expect(mediaPool.unallocated['video'].length).to.equal(1);
  });

  it.skip('should evict the element with the highest distance first', () => {
    const elements = createMediaElements('video', 3);
    mediaPool = new MediaPool(win, {'video': 2},
        arrayOrderDistanceFn(elements));

    elements.forEach(element => mediaPool.register(element));
    elements.forEach(element => mediaPool.play(element));

    expect(mediaPool.allocated['video'].length).to.equal(2);
    expect(isElementInPool(mediaPool.allocated['video'], elements[0]))
        .to.be.true;
    expect(isElementInPool(mediaPool.allocated['video'], elements[1]))
        .to.be.true;
    expect(isElementInPool(mediaPool.allocated['video'], elements[2]))
        .to.be.false;
  });

  it('should be able to play alot of videos', () => {
    const alot = 100;
    const elements = createMediaElements('video', alot);
    mediaPool = new MediaPool(win, {'video': 2},
        arrayOrderDistanceFn(elements));

    elements.forEach(element => mediaPool.register(element));
    elements.forEach(element => mediaPool.play(element));
  });
});
