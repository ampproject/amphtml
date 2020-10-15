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

import {LoadingIndicatorImpl} from '../../src/service/loading-indicator';
import {Services} from '../../src/services';
import {pushIfNotExist, removeItem} from '../../src/utils/array';

describes.realWin('LoadingIndicatorImpl', {amp: true}, (env) => {
  let ampdoc;
  let service;
  let loaderService;
  let io;
  let failRoot;
  let el;

  beforeEach(() => {
    ampdoc = env.ampdoc;

    failRoot = false;
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
      if (options.root && failRoot) {
        throw new Error('root is not allowed');
      }
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

  it('should use root when supported', () => {
    failRoot = false;
    service = new LoadingIndicatorImpl(ampdoc);
    expect(io.options.root).to.equal(ampdoc.win.document);

    service.track(el);
    expect(io.observed).to.include(el);
  });

  it('should fail over when root is not supported', () => {
    failRoot = true;
    service = new LoadingIndicatorImpl(ampdoc);
    expect(io.options.root).to.be.undefined;

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
});
