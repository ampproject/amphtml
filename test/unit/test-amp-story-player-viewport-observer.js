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

    expect(inOb).to.have.been.calledWith(env.sandbox.match.any, {
      rootMargin: '0%',
    });
  });

  it('initializes observer with explicit root', () => {
    const noop = () => {};
    new AmpStoryPlayerViewportObserver(win, el, noop, 5);

    expect(inOb).to.have.been.calledWith(env.sandbox.match.any, {
      rootMargin: '500%',
    });
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
