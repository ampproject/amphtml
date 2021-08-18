import {AmpStoryPlayerViewportObserver} from '../../src/amp-story-player/amp-story-player-viewport-observer';

describes.realWin('AmpStoryPlayerViewportObserver', {amp: false}, (env) => {
  let win;
  let el;
  let doc;
  let inOb;
  let observing;

  beforeEach(() => {
    observing = new Set();
    inOb = env.sandbox.stub();
    inOb.callsFake(() => ({
      observe: (el) => observing.add(el),
      unobserve: (el) => observing.delete(el),
    }));

    win = {
      document: {},
      IntersectionObserver: inOb,
      addEventListener: () => {},
      removeEventListener: () => {},
      innerHeight: 100,
    };
    win.parent = win;

    doc = {defaultView: win};
    const fakeRect = {top: 0};
    el = {
      ownerDocument: doc,
      getBoundingClientRect: () => fakeRect,
    };
  });

  /**
   * Simulate an IntersectionObserver callback for an element.
   * @param {!Element} el
   * @param {boolean} inViewport
   */
  function toggleViewport(el, inViewport) {
    const ioCallback = inOb.getCall(0).args[0];
    ioCallback([{target: el, isIntersecting: inViewport}]);
  }

  it('initializes observer with implicit root', () => {
    const noop = () => {};
    new AmpStoryPlayerViewportObserver(win, el, noop);

    const inObCallback = env.sandbox.match.any;

    // Initializing InOb with only 1 argument defaults to implicit root.
    expect(inOb).to.have.been.calledOnceWithExactly(inObCallback);
  });

  it('fires callback when element is visible in viewport.', () => {
    const cbSpy = env.sandbox.spy();
    new AmpStoryPlayerViewportObserver(win, el, cbSpy);

    toggleViewport(el, true);

    expect(cbSpy).to.be.calledOnce;
  });

  it('does not fire callback when element is not visible in viewport.', () => {
    const cbSpy = env.sandbox.spy();
    new AmpStoryPlayerViewportObserver(win, el, cbSpy);

    toggleViewport(el, false);

    expect(cbSpy).to.not.be.called;
  });

  it('once callback is fired, the InOb stops observing', () => {
    const cb = env.sandbox.spy();
    new AmpStoryPlayerViewportObserver(win, el, cb);

    toggleViewport(el, true);

    expect(observing.has(el)).to.be.false;
  });

  it('uses fallback if InOb is not supported', () => {
    win.IntersectionObserver = null;
    const scrollSpy = env.sandbox.spy(win, 'addEventListener');

    new AmpStoryPlayerViewportObserver(win, el, () => {});

    expect(scrollSpy).to.be.calledWith('scroll');
  });

  it('fallback removes event listener once callback is fired', () => {
    win.IntersectionObserver = null;
    const removeSpy = env.sandbox.spy(win, 'removeEventListener');

    new AmpStoryPlayerViewportObserver(win, el, () => {});

    expect(removeSpy).to.be.called;
  });
});
