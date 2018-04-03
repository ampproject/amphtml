/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {BaseSlides} from '../base-slides';

describes.fakeWin('BaseSlides', {amp: true}, env => {
  let win, doc;
  let buildSlidesSpy;
  let onViewportCallbackSpy;
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
    buildSlidesSpy = sandbox.spy();
    onViewportCallbackSpy = sandbox.spy();
    hasPrevSpy = sandbox.spy();
    hasNextSpy = sandbox.spy();
    goCallbackSpy = sandbox.spy();
    setupAutoplaySpy = sandbox.spy(BaseSlides.prototype, 'setupAutoplay_');
    buildButtonsSpy = sandbox.spy(BaseSlides.prototype, 'buildButtons');
    setupGesturesSpy = sandbox.spy(BaseSlides.prototype, 'setupGestures');
    setControlsStateSpy =
        sandbox.spy(BaseSlides.prototype, 'setControlsState');
    hintControlsSpy = sandbox.spy(BaseSlides.prototype, 'hintControls');
    autoplaySpy = sandbox.spy(BaseSlides.prototype, 'autoplay_');
    clearAutoplaySpy = sandbox.spy(BaseSlides.prototype, 'clearAutoplay');
    onViewportCallbackSpy =
        sandbox.spy(BaseSlides.prototype, 'onViewportCallback');
  });


  function setElement(options) {
    const element = doc.createElement('div');
    if (options.loop) {
      element.setAttribute('loop', '');
    }
    if (options.autoplay) {
      element.setAttribute('autoplay', '');
    }
    if (options.delay) {
      element.setAttribute('delay', options.delay);
    }

    return element;
  }


  class TestCarousel extends BaseSlides {

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
    const carouselLoopOnly = new TestCarousel(setElement({
      loop: true,
    }));

    carouselLoopOnly.buildCallback();

    expect(carouselLoopOnly.shouldLoop).to.be.true;
    expect(carouselLoopOnly.shouldAutoplay_).to.be.false;
    expect(setupAutoplaySpy).to.not.have.been.called;
    expect(buildButtonsSpy).to.be.calledOnce;
    expect(setupGesturesSpy).to.be.calledOnce;
    expect(setControlsStateSpy).to.be.calledOnce;

    const carouselAutoplayOnly = new TestCarousel(setElement({
      autoplay: true,
    }));

    carouselAutoplayOnly.buildCallback();

    expect(carouselAutoplayOnly.shouldLoop).to.be.true;
    expect(carouselAutoplayOnly.shouldAutoplay_).to.be.true;
    expect(setupAutoplaySpy).to.have.been.called;
    expect(buildButtonsSpy).to.have.callCount(2);
    expect(setupGesturesSpy).to.have.callCount(2);
    expect(setControlsStateSpy).to.have.callCount(2);

    const carouselAutoplayWithLoop = new TestCarousel(setElement({
      loop: true,
      autoplay: true,
    }));

    carouselAutoplayWithLoop.buildCallback();

    expect(carouselAutoplayWithLoop.shouldLoop).to.be.true;
    expect(carouselAutoplayWithLoop.shouldAutoplay_).to.be.true;
    expect(setupAutoplaySpy).to.have.callCount(2);
    expect(buildButtonsSpy).to.have.callCount(3);
    expect(setupGesturesSpy).to.have.callCount(3);
    expect(setControlsStateSpy).to.have.callCount(3);
  });

  it('should handle viewportCallback when in viewport', () => {
    const carousel = new TestCarousel(setElement({
      loop: true,
      autoplay: true,
    }));

    carousel.viewportCallback(true);
    expect(onViewportCallbackSpy).to.have.been.calledWith(true);
    expect(hintControlsSpy).to.have.been.called;
    expect(autoplaySpy).to.have.been.called;
    expect(clearAutoplaySpy).to.not.have.been.called;
  });

  it('should handle viewportCallback when not in viewport', () => {
    const carousel = new TestCarousel(setElement({
      loop: true,
      autoplay: true,
    }));

    carousel.viewportCallback(false);
    expect(onViewportCallbackSpy).to.have.been.calledWith(false);
    expect(hintControlsSpy).to.not.have.been.called;
    expect(autoplaySpy).to.not.have.been.called;
    expect(clearAutoplaySpy).to.have.been.called;
  });

  it('should setup autoplay with no delay set', () => {
    const carousel = new TestCarousel(setElement({
      autoplay: true,
    }));
    carousel.autoplayDelay_ = 5000;
    expect(carousel.element.hasAttribute('loop')).to.be.false;
    carousel.setupAutoplay_();
    expect(carousel.autoplayDelay_).to.equal(5000);
    expect(carousel.element.hasAttribute('loop')).to.be.true;
    expect(carousel.hasLoop_).to.be.true;
    expect(carousel.shouldLoop).to.be.true;
  });

  it('should setup autoplay with delay set', () => {
    const carousel = new TestCarousel(setElement({
      autoplay: true,
      delay: 3000,
    }));
    carousel.autoplayDelay_ = 5000;
    expect(carousel.element.hasAttribute('loop')).to.be.false;
    carousel.setupAutoplay_();
    expect(carousel.autoplayDelay_).to.equal(3000);
    expect(carousel.element.hasAttribute('loop')).to.be.true;
    expect(carousel.hasLoop_).to.be.true;
    expect(carousel.shouldLoop).to.be.true;
  });

  it('should setup autoplay with delay set lower', () => {
    const carousel = new TestCarousel(setElement({
      autoplay: true,
      delay: 300,
    }));
    carousel.autoplayDelay_ = 5000;
    expect(carousel.element.hasAttribute('loop')).to.be.false;
    carousel.setupAutoplay_();
    expect(carousel.autoplayDelay_).to.equal(1000);
    expect(carousel.element.hasAttribute('loop')).to.be.true;
    expect(carousel.hasLoop_).to.be.true;
    expect(carousel.shouldLoop).to.be.true;
  });

  it('should start timer on autoplay', () => {
    const carousel = new TestCarousel(setElement({
      autoplay: true,
      delay: 300,
    }));
    carousel.buildCallback();
    carousel.autoplay_();

    expect(clearAutoplaySpy).to.have.been.called;
    expect(carousel.autoplayTimeoutId_).to.not.be.null;
  });

  it('should not start timer on when there is no autoplay', () => {
    const carousel = new TestCarousel(setElement({
      delay: 300,
    }));
    carousel.buildCallback();
    carousel.autoplay_();

    expect(clearAutoplaySpy).to.have.not.been.called;
    expect(carousel.autoplayTimeoutId_).to.be.null;
  });

  it('should clear timeout', () => {
    const carousel = new TestCarousel(setElement({
      autoplay: true,
      delay: 300,
    }));
    carousel.buildCallback();
    carousel.autoplay_();

    expect(clearAutoplaySpy).to.have.been.called;
    expect(carousel.autoplayTimeoutId_).to.not.be.null;

    carousel.clearAutoplay();
    expect(carousel.autoplayTimeoutId_).to.be.null;
  });

  it('toggle autoPlay status using speficied value & autoplay=true', () => {
    const carousel = new TestCarousel(setElement({
      autoplay: true,
      delay: 300,
    }));
    carousel.buildCallback();
    carousel.autoplay_();

    expect(carousel.shouldAutoplay_).to.be.true;

    const args = {'toggleOn': false};
    carousel.executeAction(
        {method: 'toggleAutoplay', args, satisfiesTrust: () => true});
    expect(carousel.shouldAutoplay_).to.be.false;

    args['toggleOn'] = true;
    carousel.executeAction(
        {method: 'toggleAutoplay', args, satisfiesTrust: () => true});
    expect(carousel.shouldAutoplay_).to.be.true;
  });

  it('toggle autoPlay status using speficied value & autoplay=false', () => {
    const carousel = new TestCarousel(setElement({
      delay: 300,
    }));
    carousel.buildCallback();

    expect(carousel.shouldAutoplay_).to.be.false;

    const args = {'toggleOn': true};
    carousel.executeAction(
        {method: 'toggleAutoplay', args, satisfiesTrust: () => true});
    expect(carousel.shouldAutoplay_).to.be.true;

    args['toggleOn'] = false;
    carousel.executeAction(
        {method: 'toggleAutoplay', args, satisfiesTrust: () => true});
    expect(carousel.shouldAutoplay_).to.be.false;
  });

  it('toggle autoPlay status without speficied value & autoplay=true', () => {
    const carousel = new TestCarousel(setElement({
      autoplay: true,
      delay: 300,
    }));
    carousel.buildCallback();
    carousel.autoplay_();

    expect(carousel.shouldAutoplay_).to.be.true;

    carousel.executeAction(
        {method: 'toggleAutoplay', satisfiesTrust: () => true});
    expect(carousel.shouldAutoplay_).to.be.false;

    carousel.executeAction(
        {method: 'toggleAutoplay', satisfiesTrust: () => true});
    expect(carousel.shouldAutoplay_).to.be.true;
  });

});
