import {pushIfNotExist, removeItem} from '#core/types/array';

import {Services} from '#service';
import {LoadingIndicatorImpl} from '#service/loading-indicator';

describes.realWin('LoadingIndicatorImpl', {amp: true}, (env) => {
  let ampdoc;
  let service;
  let loaderService;
  let io;
  let el;

  beforeEach(() => {
    ampdoc = env.ampdoc;

    env.sandbox
      .stub(env.win, 'IntersectionObserver')
      .value(IntersectionObserverStub);

    service = new LoadingIndicatorImpl(ampdoc);

    loaderService = {
      initializeLoader: env.sandbox.spy(),
    };
    env.sandbox
      .stub(Services, 'extensionsFor')
      .returns({installExtensionForDoc: () => sync()});
    env.sandbox
      .stub(Services, 'loaderServiceForDoc')
      .returns(sync(loaderService));

    el = document.createElement('div');
  });

  class IntersectionObserverStub {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observed = [];
      io = this;
    }

    observe(el) {
      pushIfNotExist(this.observed, el);
    }

    unobserve(el) {
      removeItem(this.observed, el);
    }

    record(record) {
      this.callback([record]);
    }
  }

  function sync(value) {
    return {then: (callback) => callback(value)};
  }

  function getLoader() {
    return el.querySelector('.i-amphtml-loading-container');
  }

  it('tracking should observe an element', () => {
    service = new LoadingIndicatorImpl(ampdoc);
    service.track(el);
    expect(io.observed).to.include(el);
  });

  it('should not create the loader on out-of-viewport', async () => {
    service.track(el);
    // No loader yet.
    expect(getLoader()).to.not.exist;

    // Observe out-of-viewport.
    io.record({
      target: el,
      isIntersecting: false,
      boundingClientRect: {width: 100, height: 100},
    });
    expect(getLoader()).to.not.exist;
    expect(loaderService.initializeLoader).to.not.be.called;
  });

  it('should create the loader on the first in-viewport', async () => {
    service.track(el);
    // No loader yet.
    expect(getLoader()).to.not.exist;

    // Observe in-viewport.
    io.record({
      target: el,
      isIntersecting: true,
      boundingClientRect: {width: 100, height: 100},
    });
    expect(getLoader()).to.exist;
    expect(loaderService.initializeLoader).to.be.calledOnce;
  });

  it('should NOT create the loader when size is too small', async () => {
    service.track(el);
    // No loader yet.
    expect(getLoader()).to.not.exist;

    // Observe in-viewport.
    io.record({
      target: el,
      isIntersecting: true,
      boundingClientRect: {width: 1, height: 1},
    });
    expect(getLoader()).to.not.exist;
    expect(loaderService.initializeLoader).to.not.be.called;
  });

  it('should hide the loader on out-of-viewport', async () => {
    service.track(el);
    io.record({
      target: el,
      isIntersecting: true,
      boundingClientRect: {width: 100, height: 100},
    });
    expect(getLoader()).to.exist;
    expect(getLoader()).to.not.have.class('amp-hidden');
    expect(getLoader().firstElementChild).to.have.class('amp-active');

    // Out-of-viewport.
    io.record({
      target: el,
      isIntersecting: false,
      boundingClientRect: {width: 100, height: 100},
    });
    expect(getLoader()).to.have.class('amp-hidden');
    expect(getLoader().firstElementChild).to.not.have.class('amp-active');

    // In-viewport.
    io.record({
      target: el,
      isIntersecting: true,
      boundingClientRect: {width: 100, height: 100},
    });
    expect(getLoader()).to.not.have.class('amp-hidden');
    expect(getLoader().firstElementChild).to.have.class('amp-active');
  });

  it('should cleanup when tracking is stopped', async () => {
    service.track(el);
    io.record({
      target: el,
      isIntersecting: true,
      boundingClientRect: {width: 100, height: 100},
    });
    expect(getLoader()).to.exist;

    // Untrack.
    service.untrack(el);
    expect(getLoader()).to.not.exist;
  });

  it('should configure loader as a service element', async () => {
    // Ensure loader is created.
    io.record({
      target: el,
      isIntersecting: true,
      boundingClientRect: {width: 100, height: 100},
    });

    const loader = getLoader();
    expect(loader.getAttribute('slot')).to.equal('i-amphtml-svc');
    expect(loader).to.have.class('i-amphtml-svc');
  });
});
