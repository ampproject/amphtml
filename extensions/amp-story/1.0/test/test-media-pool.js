import {findIndex} from '#core/types/array';

import {Services} from '#service';

import {MediaPool, MediaType_Enum} from '../media-pool';

const NOOP = () => {};

describes.realWin('media-pool', {}, (env) => {
  let win;
  let mediaPool;
  let distanceFnStub;
  const COUNTS = {
    [MediaType_Enum.AUDIO]: 2,
    [MediaType_Enum.VIDEO]: 2,
  };

  beforeEach(() => {
    win = env.win;
    env.sandbox
      .stub(Services, 'vsyncFor')
      .callsFake(() => ({mutate: (task) => task()}));
    env.sandbox.stub(Services, 'timerFor').callsFake(() => ({delay: NOOP}));

    mediaPool = new MediaPool(win, COUNTS, (element) => {
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
    return (element) => {
      const index = elements.indexOf(element);
      if (index < 0) {
        return Infinity;
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
    pools.forEach((pool) => {
      Object.keys(pool).forEach((key) => {
        pool[key].forEach((el) => {
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
    const index = findIndex(array, (el) => {
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
    mediaPool = new MediaPool(win, {'video': 2}, (unusedEl) => 0);

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
    mediaPool = new MediaPool(
      win,
      {'video': 2},
      arrayOrderDistanceFn(elements)
    );

    elements.forEach((element) => mediaPool.register(element));
    elements.forEach((element) => mediaPool.play(element));

    expect(mediaPool.allocated['video'].length).to.equal(2);
    expect(isElementInPool(mediaPool.allocated['video'], elements[0])).to.be
      .true;
    expect(isElementInPool(mediaPool.allocated['video'], elements[1])).to.be
      .true;
    expect(isElementInPool(mediaPool.allocated['video'], elements[2])).to.be
      .false;
  });

  it('should be able to play alot of videos', () => {
    const alot = 100;
    const elements = createMediaElements('video', alot);
    mediaPool = new MediaPool(
      win,
      {'video': 2},
      arrayOrderDistanceFn(elements)
    );

    elements.forEach((element) => mediaPool.register(element));

    // Call play() to ensure it doesn't throw.
    elements.forEach((element) => mediaPool.play(element));
  });
});
