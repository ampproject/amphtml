import {MediaPool} from '../media-pool';
import {Services} from '#service';

const NOOP = () => {};

describes.realWin('media-pool', {}, (env) => {
  let win;
  let mediaPool;
  let distanceFnStub;

  beforeEach(() => {
    win = env.win;
    env.sandbox
      .stub(Services, 'vsyncFor')
      .callsFake(() => ({mutate: (task) => task()}));
    env.sandbox.stub(Services, 'timerFor').callsFake(() => ({delay: NOOP}));

    mediaPool = new MediaPool(win, {AUDIO: 2, VIDEO: 2}, (element) => {
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
   * @param {!Object} pool
   * @return {!Array<!HTMLMediaElement>}
   */
  function getElements(pool) {
    return Object.values(pool).flat();
  }

  /**
   * @param {!Array<!HTMLMediaElement>} array
   * @param {!HTMLMediaElement} element
   * @return {boolean}
   */
  function isElementInPool(array, element) {
    return array.some((el) => {
      return el['replaced-media'] === element.getAttribute('id');
    });
  }

  it('should not be null', () => {
    expect(mediaPool).to.not.be.null;
  });

  it('should start with no allocated elements', () => {
    expect(getElements(mediaPool.allocated).length).to.equal(0);
  });

  it('should allocate element on play', () => {
    mediaPool = new MediaPool(win, {'VIDEO': 2}, (unusedEl) => 0);

    const videoEl = createMediaElement('VIDEO');
    mediaPool.register(videoEl);

    expect(mediaPool.allocated['VIDEO'].length).to.equal(0);
    expect(mediaPool.unallocated['VIDEO'].length).to.equal(2);

    mediaPool.play(videoEl);

    expect(mediaPool.allocated['VIDEO'].length).to.equal(1);
    expect(mediaPool.unallocated['VIDEO'].length).to.equal(1);
  });

  it.skip('should evict the element with the highest distance first', () => {
    const elements = createMediaElements('VIDEO', 3);
    mediaPool = new MediaPool(win, {VIDEO: 2}, arrayOrderDistanceFn(elements));

    elements.forEach((element) => mediaPool.register(element));
    elements.forEach((element) => mediaPool.play(element));

    expect(mediaPool.allocated['VIDEO'].length).to.equal(2);
    expect(isElementInPool(mediaPool.allocated['VIDEO'], elements[0])).to.be
      .true;
    expect(isElementInPool(mediaPool.allocated['VIDEO'], elements[1])).to.be
      .true;
    expect(isElementInPool(mediaPool.allocated['VIDEO'], elements[2])).to.be
      .false;
  });

  it('should be able to play alot of videos', () => {
    const alot = 100;
    const elements = createMediaElements('VIDEO', alot);
    mediaPool = new MediaPool(win, {VIDEO: 2}, arrayOrderDistanceFn(elements));

    elements.forEach((element) => mediaPool.register(element));

    // Call play() to ensure it doesn't throw.
    elements.forEach((element) => mediaPool.play(element));
  });
});
