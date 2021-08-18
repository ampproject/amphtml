

import {AmpSlideScroll} from '../slidescroll';

describes.fakeWin('AmpSlideScroll', {amp: true}, (env) => {
  let win, doc;
  let buildSlidesSpy;
  let viewportCallbackSpy;
  let hasPrevSpy;
  let hasNextSpy;
  let goCallbackSpy;

  let setupAutoplaySpy;
  let buildButtonsSpy;
  let setupGesturesSpy;
  let setControlsStateSpy;
  let hintControlsSpy;
  let autoplaySpy;
  let clearAutoplaySpy;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    buildSlidesSpy = env.sandbox.spy();
    viewportCallbackSpy = env.sandbox.spy();
    hasPrevSpy = env.sandbox.spy();
    hasNextSpy = env.sandbox.spy();
    goCallbackSpy = env.sandbox.spy();
    setupAutoplaySpy = env.sandbox.spy(
      AmpSlideScroll.prototype,
      'setupAutoplay_'
    );
    buildButtonsSpy = env.sandbox.spy(AmpSlideScroll.prototype, 'buildButtons');
    setupGesturesSpy = env.sandbox.spy(
      AmpSlideScroll.prototype,
      'setupGestures'
    );
    setControlsStateSpy = env.sandbox.spy(
      AmpSlideScroll.prototype,
      'setControlsState'
    );
    hintControlsSpy = env.sandbox.spy(AmpSlideScroll.prototype, 'hintControls');
    autoplaySpy = env.sandbox.spy(AmpSlideScroll.prototype, 'autoplay_');
    clearAutoplaySpy = env.sandbox.spy(
      AmpSlideScroll.prototype,
      'clearAutoplayTimer_'
    );
    viewportCallbackSpy = env.sandbox.spy(
      AmpSlideScroll.prototype,
      'viewportCallbackTemp'
    );
  });

  function setElement(options) {
    const element = doc.createElement('div');
    if (options.loop) {
      element.setAttribute('loop', '');
    }
    if (options.autoplay) {
      if (!options.autoplayLoops) {
        element.setAttribute('autoplay', '');
      } else {
        element.setAttribute('autoplay', options.autoplayLoops);
      }
    }
    if (options.delay) {
      element.setAttribute('delay', options.delay);
    }

    return element;
  }

  class TestCarousel extends AmpSlideScroll {
    /** @override */
    buildSlides() {
      buildSlidesSpy();
    }

    /** @override */
    isLoopingEligible() {
      return true;
    }

    /** @override */
    hasPrev() {
      hasPrevSpy();
    }

    /** @override */
    hasNext() {
      hasNextSpy();
    }

    /** @override */
    goCallback() {
      goCallbackSpy();
    }
  }

  it('should do the right buildCallback processing', () => {
    const carouselLoopOnly = new TestCarousel(
      setElement({
        loop: true,
      })
    );

    carouselLoopOnly.buildCallback();

    expect(carouselLoopOnly.shouldLoop).to.be.true;
    expect(carouselLoopOnly.shouldAutoplay_).to.be.false;
    expect(setupAutoplaySpy).to.not.have.been.called;
    expect(buildButtonsSpy).to.be.calledOnce;
    expect(setupGesturesSpy).to.be.calledOnce;
    expect(setControlsStateSpy).to.be.calledOnce;

    const carouselAutoplayOnly = new TestCarousel(
      setElement({
        autoplay: true,
      })
    );

    carouselAutoplayOnly.buildCallback();

    expect(carouselAutoplayOnly.shouldLoop).to.be.true;
    expect(carouselAutoplayOnly.shouldAutoplay_).to.be.true;
    expect(setupAutoplaySpy).to.have.been.called;
    expect(buildButtonsSpy).to.have.callCount(2);
    expect(setupGesturesSpy).to.have.callCount(2);
    expect(setControlsStateSpy).to.have.callCount(2);

    const carouselAutoplayWithLoop = new TestCarousel(
      setElement({
        loop: true,
        autoplay: true,
      })
    );

    carouselAutoplayWithLoop.buildCallback();

    expect(carouselAutoplayWithLoop.shouldLoop).to.be.true;
    expect(carouselAutoplayWithLoop.shouldAutoplay_).to.be.true;
    expect(setupAutoplaySpy).to.have.callCount(2);
    expect(buildButtonsSpy).to.have.callCount(3);
    expect(setupGesturesSpy).to.have.callCount(3);
    expect(setControlsStateSpy).to.have.callCount(3);
  });

  it('should handle viewportCallback when in viewport', () => {
    const carousel = new TestCarousel(
      setElement({
        loop: true,
        autoplay: true,
      })
    );

    carousel.viewportCallbackTemp(true);
    expect(viewportCallbackSpy).to.have.been.calledWith(true);
    expect(hintControlsSpy).to.have.been.called;
    expect(autoplaySpy).to.have.been.called;
    expect(clearAutoplaySpy).to.not.have.been.called;
  });

  it('should handle viewportCallback when not in viewport', () => {
    const carousel = new TestCarousel(
      setElement({
        loop: true,
        autoplay: true,
      })
    );

    carousel.viewportCallbackTemp(false);
    expect(viewportCallbackSpy).to.have.been.calledWith(false);
    expect(hintControlsSpy).to.not.have.been.called;
    expect(autoplaySpy).to.not.have.been.called;
    expect(clearAutoplaySpy).to.have.been.called;
  });

  it('should setup autoplay with no delay set', () => {
    const carousel = new TestCarousel(
      setElement({
        autoplay: true,
      })
    );
    carousel.autoplayDelay_ = 5000;
    expect(carousel.element.hasAttribute('loop')).to.be.false;
    carousel.setupAutoplay_();
    expect(carousel.autoplayDelay_).to.equal(5000);
    expect(carousel.element.hasAttribute('loop')).to.be.true;
    expect(carousel.hasLoop_).to.be.true;
    expect(carousel.shouldLoop).to.be.true;
  });

  it('should setup autoplay with specified number of loops', () => {
    const carousel = new TestCarousel(
      setElement({
        autoplay: true,
        autoplayLoops: 5,
      })
    );
    expect(carousel.element.hasAttribute('loop')).to.be.false;
    carousel.buildCallback();
    expect(carousel.element.hasAttribute('loop')).to.be.true;
    expect(carousel.autoplayLoops_).to.equal(5);
    expect(carousel.hasLoop_).to.be.true;
    expect(carousel.shouldLoop).to.be.true;
  });

  it('should setup autoplay with delay set', () => {
    const carousel = new TestCarousel(
      setElement({
        autoplay: true,
        delay: 3000,
      })
    );
    carousel.autoplayDelay_ = 5000;
    expect(carousel.element.hasAttribute('loop')).to.be.false;
    carousel.setupAutoplay_();
    expect(carousel.autoplayDelay_).to.equal(3000);
    expect(carousel.element.hasAttribute('loop')).to.be.true;
    expect(carousel.hasLoop_).to.be.true;
    expect(carousel.shouldLoop).to.be.true;
  });

  it('should setup autoplay with delay set lower', () => {
    const carousel = new TestCarousel(
      setElement({
        autoplay: true,
        delay: 300,
      })
    );
    carousel.autoplayDelay_ = 5000;
    expect(carousel.element.hasAttribute('loop')).to.be.false;
    carousel.setupAutoplay_();
    expect(carousel.autoplayDelay_).to.equal(1000);
    expect(carousel.element.hasAttribute('loop')).to.be.true;
    expect(carousel.hasLoop_).to.be.true;
    expect(carousel.shouldLoop).to.be.true;
  });

  it('should start timer on autoplay', () => {
    const carousel = new TestCarousel(
      setElement({
        autoplay: true,
        delay: 300,
      })
    );
    carousel.buildCallback();
    carousel.autoplay_();

    expect(clearAutoplaySpy).to.have.been.called;
    expect(carousel.autoplayTimeoutId_).to.not.be.null;
  });

  it('should not start timer on when there is no autoplay', () => {
    const carousel = new TestCarousel(
      setElement({
        delay: 300,
      })
    );
    carousel.buildCallback();
    carousel.autoplay_();

    expect(clearAutoplaySpy).to.have.not.been.called;
    expect(carousel.autoplayTimeoutId_).to.be.null;
  });

  it('should clear timeout', () => {
    const carousel = new TestCarousel(
      setElement({
        autoplay: true,
        delay: 300,
      })
    );
    carousel.buildCallback();
    carousel.autoplay_();

    expect(clearAutoplaySpy).to.have.been.called;
    expect(carousel.autoplayTimeoutId_).to.not.be.null;

    carousel.clearAutoplayTimer_();
    expect(carousel.autoplayTimeoutId_).to.be.null;
  });

  it('toggle autoPlay status using speficied value & autoplay=true', () => {
    const carousel = new TestCarousel(
      setElement({
        autoplay: true,
        delay: 300,
      })
    );
    carousel.buildCallback();
    carousel.autoplay_();

    expect(carousel.shouldAutoplay_).to.be.true;

    const args = {'toggleOn': false};
    carousel.executeAction({
      method: 'toggleAutoplay',
      args,
      satisfiesTrust: () => true,
    });
    expect(carousel.shouldAutoplay_).to.be.false;

    args['toggleOn'] = true;
    carousel.executeAction({
      method: 'toggleAutoplay',
      args,
      satisfiesTrust: () => true,
    });
    expect(carousel.shouldAutoplay_).to.be.true;
  });

  it('toggle autoPlay status using speficied value & autoplay=false', () => {
    const carousel = new TestCarousel(
      setElement({
        delay: 300,
      })
    );
    carousel.buildCallback();

    expect(carousel.shouldAutoplay_).to.be.false;

    const args = {'toggleOn': true};
    carousel.executeAction({
      method: 'toggleAutoplay',
      args,
      satisfiesTrust: () => true,
    });
    expect(carousel.shouldAutoplay_).to.be.true;

    args['toggleOn'] = false;
    carousel.executeAction({
      method: 'toggleAutoplay',
      args,
      satisfiesTrust: () => true,
    });
    expect(carousel.shouldAutoplay_).to.be.false;
  });

  it('toggle autoPlay status without speficied value & autoplay=true', () => {
    const carousel = new TestCarousel(
      setElement({
        autoplay: true,
        delay: 300,
      })
    );
    carousel.buildCallback();
    carousel.autoplay_();

    expect(carousel.shouldAutoplay_).to.be.true;

    carousel.executeAction({
      method: 'toggleAutoplay',
      satisfiesTrust: () => true,
    });
    expect(carousel.shouldAutoplay_).to.be.false;

    carousel.executeAction({
      method: 'toggleAutoplay',
      satisfiesTrust: () => true,
    });
    expect(carousel.shouldAutoplay_).to.be.true;
  });
});
