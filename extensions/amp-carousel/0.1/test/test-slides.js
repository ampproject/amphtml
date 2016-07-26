/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import * as sinon from 'sinon';
import * as tr from '../../../../src/transition';
import {AmpSlides} from '../slides';
import {Animation} from '../../../../src/animation';

describe('Slides functional', () => {

  let sandbox;
  let clock;
  let element;
  let slide0, slide1, slide2;
  let slides;
  let prepareCallback, switchCallback, resetCallback;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function setupElements() {
    element = document.createElement('div');
    element.setAttribute('type', 'slides');
    element.style.width = '320px';
    element.style.height = '200px';
    document.body.appendChild(element);

    element.appendChild(slide0 = document.createElement('div'));
    element.appendChild(slide1 = document.createElement('div'));
    element.appendChild(slide2 = document.createElement('div'));
    slide0.classList.add('slide0');
    slide1.classList.add('slide1');
    slide2.classList.add('slide2');
    element.getRealChildren = () => [slide0, slide1, slide2];
    return element;
  }

  function setupSlides() {
    slides = new AmpSlides(element);
    slides.buildCallback();
    return slides;
  }

  function setupSpies() {
    slides.prepareSlide_ = prepareCallback = sandbox.spy();
    slides.commitSwitch_ = switchCallback = sandbox.spy();
    slides.resetSlide_ = resetCallback = sandbox.spy();
  }

  function teardownElements() {
    document.body.removeChild(element);
  }

  describe('Slides hint', () => {
    beforeEach(() => {
      setupElements();
      setupSlides();
      slides.inViewport_ = true;
      slides.getVsync = function() {
        return {
          mutate: function(fn) {
            fn();
          },
        };
      };
      slides.deferMutate = function(fn) {
        fn();
      };
    });
    afterEach(() => {
      teardownElements();
    });
    it('should hint when not in mouse mode', () => {
      expect(
          slides.element.classList.contains('-amp-carousel-button-start-hint'))
              .to.be.false;
      slides.hintControls();
      expect(
          slides.element.classList.contains('-amp-carousel-button-start-hint'))
              .to.be.true;
    });

    it('should not hint when in mouse mode', () => {
      slides.showControls_ = true;
      expect(
          slides.element.classList.contains('-amp-carousel-button-start-hint'))
              .to.be.false;
      slides.hintControls();
      expect(
          slides.element.classList.contains('-amp-carousel-button-start-hint'))
              .to.be.false;
    });
  });

  describe('Slides gestures', () => {

    beforeEach(() => {
      setupElements();
      setupSlides();
      setupSpies();
    });

    afterEach(() => {
      teardownElements();
    });

    it('should start swiping with slide0', () => {
      slides.currentIndex_ = 0;
      slides.onSwipeStart_({});
      expect(slides.swipeState_).to.not.equal(null);
      expect(slides.swipeState_.currentIndex).to.equal(0);
      expect(slides.swipeState_.containerWidth).to.equal(320);
      expect(slides.swipeState_.prevTr).to.equal(tr.NOOP);
      expect(slides.swipeState_.nextTr).to.not.equal(tr.NOOP);
      expect(slides.swipeState_.prevIndex).to.equal(2);
      expect(slides.swipeState_.nextIndex).to.equal(1);
      expect(slides.swipeState_.min).to.equal(0);
      expect(slides.swipeState_.max).to.equal(1);
      expect(slides.swipeState_.pos).to.equal(0);
      expect(prepareCallback.callCount).to.equal(1);
      expect(prepareCallback.getCall(0).args[0]).to.equal(slide1);
      expect(prepareCallback.getCall(0).args[1]).to.equal(1);
    });

    it('should allow negative value swipe when looping and on ' +
       'first item', () => {
      slides.isLooping_ = true;
      slides.currentIndex_ = 0;
      slides.onSwipeStart_({});
      expect(slides.swipeState_).to.not.equal(null);
      expect(slides.swipeState_.currentIndex).to.equal(0);
      expect(slides.swipeState_.containerWidth).to.equal(320);
      expect(slides.swipeState_.prevTr).to.not.equal(tr.NOOP);
      expect(slides.swipeState_.nextTr).to.not.equal(tr.NOOP);
      expect(slides.swipeState_.min).to.equal(-1);
      expect(slides.swipeState_.max).to.equal(1);
      expect(slides.swipeState_.pos).to.equal(0);
      expect(prepareCallback.callCount).to.equal(2);
      expect(prepareCallback.getCall(0).args[0]).to.equal(slide2);
      expect(prepareCallback.getCall(0).args[1]).to.equal(-1);
      expect(prepareCallback.getCall(1).args[0]).to.equal(slide1);
      expect(prepareCallback.getCall(1).args[1]).to.equal(1);
    });

    it('should allow positive value swipe when looping and on ' +
       'last item', () => {
      slides.isLooping_ = true;
      slides.currentIndex_ = 2;
      slides.onSwipeStart_({});
      expect(slides.swipeState_).to.not.equal(null);
      expect(slides.swipeState_.currentIndex).to.equal(2);
      expect(slides.swipeState_.containerWidth).to.equal(320);
      expect(slides.swipeState_.prevTr).to.not.equal(tr.NOOP);
      expect(slides.swipeState_.nextTr).to.not.equal(tr.NOOP);
      expect(slides.swipeState_.min).to.equal(-1);
      expect(slides.swipeState_.max).to.equal(1);
      expect(slides.swipeState_.pos).to.equal(0);
      expect(prepareCallback.callCount).to.equal(2);
      expect(prepareCallback.getCall(0).args[0]).to.equal(slide1);
      expect(prepareCallback.getCall(0).args[1]).to.equal(-1);
      expect(prepareCallback.getCall(1).args[0]).to.equal(slide0);
      expect(prepareCallback.getCall(1).args[1]).to.equal(1);
    });

    it('should start swiping with slide1', () => {
      slides.currentIndex_ = 1;
      slides.onSwipeStart_({});
      expect(slides.swipeState_).to.not.equal(null);
      expect(slides.swipeState_.currentIndex).to.equal(1);
      expect(slides.swipeState_.containerWidth).to.equal(320);
      expect(slides.swipeState_.prevTr).to.not.equal(tr.NOOP);
      expect(slides.swipeState_.nextTr).to.not.equal(tr.NOOP);
      expect(slides.swipeState_.min).to.equal(-1);
      expect(slides.swipeState_.max).to.equal(1);
      expect(slides.swipeState_.pos).to.equal(0);
      expect(prepareCallback.callCount).to.equal(2);
      expect(prepareCallback.getCall(0).args[0]).to.equal(slide0);
      expect(prepareCallback.getCall(0).args[1]).to.equal(-1);
      expect(prepareCallback.getCall(1).args[0]).to.equal(slide2);
      expect(prepareCallback.getCall(1).args[1]).to.equal(1);
    });

    it('should update on swipe within range in neg direction', () => {
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 0;
      slides.swipeState_ = {
        currentIndex: 0,
        prevIndex: 2,
        nextIndex: 1,
        containerWidth: 320,
        pos: 0,
        min: 0,
        max: 1,
        prevTr,
        nextTr,
      };
      slides.onSwipe_({deltaX: -32});
      expect(slides.swipeState_.pos).to.equal(0.1);
      expect(nextTr.callCount).to.equal(1);
      expect(prevTr.callCount).to.equal(1);
      expect(nextTr.getCall(0).args[0]).to.equal(0.1);
      expect(prevTr.getCall(0).args[0]).to.equal(0);
    });

    it('should update on swipe within range in pos direction', () => {
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 1;
      slides.swipeState_ = {
        currentIndex: 1,
        prevIndex: 2,
        nextIndex: 1,
        containerWidth: 320,
        pos: 0,
        min: -1,
        max: 1,
        prevTr,
        nextTr,
      };
      slides.onSwipe_({deltaX: 32});
      expect(slides.swipeState_.pos).to.equal(-0.1);
      expect(nextTr.callCount).to.equal(1);
      expect(prevTr.callCount).to.equal(1);
      expect(nextTr.getCall(0).args[0]).to.equal(0);
      expect(prevTr.getCall(0).args[0]).to.equal(0.1);
    });

    it('should stay in-bounds on swipe', () => {
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 0;
      slides.swipeState_ = {
        currentIndex: 0,
        prevIndex: 2,
        nextIndex: 1,
        containerWidth: 320,
        pos: 0,
        min: 0,
        max: 1,
        prevTr,
        nextTr,
      };
      slides.onSwipe_({deltaX: 32});
      expect(slides.swipeState_.pos).to.equal(0);
      expect(nextTr.callCount).to.equal(1);
      expect(prevTr.callCount).to.equal(1);
      expect(nextTr.getCall(0).args[0]).to.equal(0);
      expect(prevTr.getCall(0).args[0]).to.equal(0);
    });

    it('should start swiping with slide2', () => {
      slides.currentIndex_ = 2;
      slides.onSwipeStart_({});
      expect(slides.swipeState_).to.not.equal(null);
      expect(slides.swipeState_.currentIndex).to.equal(2);
      expect(slides.swipeState_.containerWidth).to.equal(320);
      expect(slides.swipeState_.prevTr).to.not.equal(tr.NOOP);
      expect(slides.swipeState_.nextTr).to.equal(tr.NOOP);
      expect(slides.swipeState_.min).to.equal(-1);
      expect(slides.swipeState_.max).to.equal(0);
      expect(slides.swipeState_.pos).to.equal(0);
      expect(prepareCallback.callCount).to.equal(1);
      expect(prepareCallback.getCall(0).args[0]).to.equal(slide1);
      expect(prepareCallback.getCall(0).args[1]).to.equal(-1);
    });

    it.skip('should go next after threshold', () => {
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 0;
      const s = {
        currentIndex: 0,
        prevIndex: 2,
        nextIndex: 1,
        containerWidth: 320,
        pos: 0.55,
        min: 0,
        max: 1,
        prevTr,
        nextTr,
      };
      slides.swipeState_ = s;
      const promise = slides.onSwipeEnd_({velocityX: 0});
      expect(slides.swipeState_).to.equal(null);
      return promise.then(() => {
        expect(nextTr.callCount).to.be.gt(1);
        expect(prevTr.callCount).to.be.gt(1);
        expect(nextTr.lastCall.args[0]).to.equal(1);
        expect(prevTr.lastCall.args[0]).to.equal(0);
        expect(switchCallback.callCount).to.equal(1);
        expect(switchCallback.firstCall.args[0]).to.equal(slide0);
        expect(switchCallback.firstCall.args[1]).to.equal(slide1);
        expect(resetCallback.callCount).to.equal(1);
        expect(resetCallback.firstCall.args[0]).to.equal(2);
      });
    });

    it('should not go past first item with a negative value when not ' +
       ' looping', () => {
      slides.isLooping_ = true;
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 0;
      const s = {
        currentIndex: 0,
        prevIndex: 2,
        nextIndex: 1,
        containerWidth: 320,
        pos: -0.6,
        min: 0,
        max: 0,
        prevTr,
        nextTr,
      };
      slides.swipeState_ = s;
      const promise = slides.onSwipeEnd_({velocityX: 0});
      return promise.then(() => {
        expect(slides.currentIndex_).to.equal(0);
        expect(switchCallback.callCount).to.equal(0);
        expect(resetCallback.callCount).to.equal(3);
        expect(resetCallback.getCall(0).args[0]).to.equal(0);
        expect(resetCallback.getCall(1).args[0]).to.equal(2);
        expect(resetCallback.getCall(2).args[0]).to.equal(1);
      });
    });

    it('should go past first item with a negative value when looping', () => {
      slides.isLooping_ = true;
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 0;
      const s = {
        currentIndex: 0,
        prevIndex: 2,
        nextIndex: 1,
        containerWidth: 320,
        pos: -0.6,
        min: -1,
        max: 1,
        prevTr,
        nextTr,
      };
      slides.swipeState_ = s;
      const promise = slides.onSwipeEnd_({velocityX: 0});
      return promise.then(() => {
        expect(slides.currentIndex_).to.equal(2);
        expect(switchCallback.firstCall.args[0]).to.equal(slide0);
        expect(switchCallback.firstCall.args[1]).to.equal(slide2);
      });
    });

    it('should not go past last item with a positive value when ' +
       'not looping', () => {
      slides.isLooping_ = true;
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 2;
      const s = {
        currentIndex: 2,
        prevIndex: 1,
        nextIndex: 0,
        containerWidth: 320,
        pos: 0.6,
        min: 0,
        max: 0,
        prevTr,
        nextTr,
      };
      slides.swipeState_ = s;
      const promise = slides.onSwipeEnd_({velocityX: 0});
      return promise.then(() => {
        expect(slides.currentIndex_).to.equal(2);
        expect(switchCallback.callCount).to.equal(0);
      });
    });

    it('should go past last item with a positive value when looping', () => {
      slides.isLooping_ = true;
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 2;
      const s = {
        currentIndex: 2,
        prevIndex: 1,
        nextIndex: 0,
        containerWidth: 320,
        pos: 0.6,
        min: -1,
        max: 1,
        prevTr,
        nextTr,
      };
      slides.swipeState_ = s;
      const promise = slides.onSwipeEnd_({velocityX: 0});
      return promise.then(() => {
        expect(slides.currentIndex_).to.equal(0);
        expect(switchCallback.firstCall.args[0]).to.equal(slide2);
        expect(switchCallback.firstCall.args[1]).to.equal(slide0);
        expect(resetCallback.callCount).to.equal(1);
        expect(resetCallback.firstCall.args[0]).to.equal(1);
      });
    });

    it('should go next before threshold but with velocity', () => {
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 0;
      const s = {
        currentIndex: 0,
        prevIndex: 2,
        nextIndex: 1,
        containerWidth: 320,
        pos: 0.45,
        min: 0,
        max: 1,
        prevTr,
        nextTr,
      };
      slides.swipeState_ = s;
      const promise = slides.onSwipeEnd_({velocityX: -0.5});
      expect(slides.swipeState_).to.equal(null);
      return promise.then(() => {
        expect(nextTr.callCount).to.be.gt(1);
        expect(prevTr.callCount).to.be.gt(1);
        expect(nextTr.lastCall.args[0]).to.equal(1);
        expect(prevTr.lastCall.args[0]).to.equal(0);
        expect(switchCallback.callCount).to.equal(1);
        expect(switchCallback.firstCall.args[0]).to.equal(slide0);
        expect(switchCallback.firstCall.args[1]).to.equal(slide1);
        expect(resetCallback.callCount).to.equal(1);
        expect(resetCallback.firstCall.args[0]).to.equal(2);
      });
    });

    it('should bounce back before threshold and no velocity', () => {
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 0;
      const s = {
        currentIndex: 0,
        prevIndex: 2,
        nextIndex: 1,
        containerWidth: 320,
        pos: 0.45,
        min: 0,
        max: 1,
        prevTr,
        nextTr,
      };
      slides.swipeState_ = s;
      const promise = slides.onSwipeEnd_({velocityX: 0});
      expect(slides.swipeState_).to.equal(null);
      return promise.then(() => {
        expect(nextTr.callCount).to.be.gt(1);
        expect(prevTr.callCount).to.be.gt(1);
        expect(nextTr.lastCall.args[0]).to.equal(0);
        expect(prevTr.lastCall.args[0]).to.equal(0);
        expect(switchCallback.callCount).to.equal(0);
        expect(resetCallback.callCount).to.equal(3);
        expect(resetCallback.getCall(0).args[0]).to.equal(0);
        expect(resetCallback.getCall(1).args[0]).to.equal(2);
        expect(resetCallback.getCall(2).args[0]).to.equal(1);
      });
    });

    it('should bounce back before threshold and opposite velocity', () => {
      const prevTr = sandbox.spy();
      const nextTr = sandbox.spy();
      slides.currentIndex_ = 0;
      const s = {
        currentIndex: 0,
        prevIndex: 2,
        nextIndex: 1,
        containerWidth: 320,
        pos: 0.45,
        min: 0,
        max: 1,
        prevTr,
        nextTr,
      };
      slides.swipeState_ = s;
      const promise = slides.onSwipeEnd_({velocityX: 0.5});
      expect(slides.swipeState_).to.equal(null);
      return promise.then(() => {
        expect(nextTr.callCount).to.be.gt(1);
        expect(prevTr.callCount).to.be.gt(1);
        expect(nextTr.lastCall.args[0]).to.equal(0);
        expect(prevTr.lastCall.args[0]).to.equal(0);
        expect(switchCallback.callCount).to.equal(0);
      });
    });
  });

  describe('Slides autoplay', () => {
    let tryAutoplaySpy;
    let setupAutoplaySpy;
    let goSpy;
    let isInViewportStub;
    let tryCancelAutoplayTimeoutSpy;

    function autoplaySetup(delay = '', inViewport = true) {
      clock = sandbox.useFakeTimers();
      setupElements();
      element.setAttribute('autoplay', '');
      if (delay) {
        element.setAttribute('delay', delay);
      }
      element.removeAttribute('loop');
      setupAutoplaySpy = sandbox.spy(AmpSlides.prototype, 'setupAutoplay_');
      tryAutoplaySpy = sandbox.spy(AmpSlides.prototype, 'tryAutoplay_');
      goSpy = sandbox.spy(AmpSlides.prototype, 'go');
      tryCancelAutoplayTimeoutSpy = sandbox
          .spy(AmpSlides.prototype, 'tryCancelAutoplayTimeout_');
      setupSlides();
      setupSpies();
      setupInViewport(inViewport);
    }

    function setupInViewport(inViewport) {
      sandbox.stub(slides, 'updateInViewport');
      isInViewportStub = sandbox.stub(slides, 'isInViewport')
          .returns(inViewport);
    }

    afterEach(() => {
      teardownElements();
    });

    it('should call setupAutoplay_', () => {
      autoplaySetup();
      expect(setupAutoplaySpy.callCount).to.equal(1);
    });

    it('should add `loop` attribute', () => {
      autoplaySetup();
      expect(element.hasAttribute('loop')).to.be.true;
      expect(slides.isLooping_).to.be.true;
    });

    describe('in viewport', () => {

      it('should call tryAutoplay_', () => {
        autoplaySetup();
        expect(tryAutoplaySpy.callCount).to.equal(0);

        slides.viewportCallback(true);
        expect(tryAutoplaySpy.callCount).to.equal(1);
        expect(isInViewportStub.callCount).to.equal(2);
      });

      it('should call `go` after 5000ms(default)', () => {
        autoplaySetup();

        expect(tryAutoplaySpy.callCount).to.equal(0);
        expect(goSpy.callCount).to.equal(0);

        slides.viewportCallback(true);

        expect(tryAutoplaySpy.callCount).to.equal(1);
        expect(goSpy.callCount).to.equal(0);

        clock.tick(5000);

        expect(tryAutoplaySpy.callCount).to.equal(2);
        expect(goSpy.callCount).to.equal(1);

        clock.tick(5000);

        expect(tryAutoplaySpy.callCount).to.equal(3);
        expect(goSpy.callCount).to.equal(2);
      });

      it('should call `go` after 2000ms (set by user)', () => {
        autoplaySetup(2000);

        expect(slides.isAutoplayRequested_).to.be.true;
        expect(tryAutoplaySpy.callCount).to.equal(0);
        expect(goSpy.callCount).to.equal(0);

        slides.viewportCallback(true);

        expect(tryAutoplaySpy.callCount).to.equal(1);
        expect(goSpy.callCount).to.equal(0);

        clock.tick(2000);

        expect(tryAutoplaySpy.callCount).to.equal(2);
        expect(goSpy.callCount).to.equal(1);
        expect(slides.isAutoplayRequested_).to.be.true;
      });

      it('should cancel autoplay on swipe start', () => {
        autoplaySetup(2000);

        expect(slides.isAutoplayRequested_).to.be.true;
        expect(tryAutoplaySpy.callCount).to.equal(0);
        expect(goSpy.callCount).to.equal(0);
        expect(tryCancelAutoplayTimeoutSpy.callCount).to.equal(0);

        slides.viewportCallback(true);

        expect(tryCancelAutoplayTimeoutSpy.callCount).to.equal(1);
        expect(tryAutoplaySpy.callCount).to.equal(1);
        expect(goSpy.callCount).to.equal(0);

        // user interaction
        slides.onSwipeStart_({});

        expect(slides.isAutoplayRequested_).to.be.false;
        expect(tryCancelAutoplayTimeoutSpy.callCount).to.equal(2);

        clock.tick(2000);

        expect(tryAutoplaySpy.callCount).to.equal(1);
        expect(goSpy.callCount).to.equal(0);
      });

      it('should cancel autoplay on user interaction', () => {
        autoplaySetup(2000);

        expect(slides.isAutoplayRequested_).to.be.true;
        expect(tryAutoplaySpy.callCount).to.equal(0);
        expect(goSpy.callCount).to.equal(0);

        slides.viewportCallback(true);

        expect(tryAutoplaySpy.callCount).to.equal(1);
        expect(goSpy.callCount).to.equal(0);

        clock.tick(2000);

        // autoplay call
        expect(tryAutoplaySpy.callCount).to.equal(2);
        expect(goSpy.callCount).to.equal(1);

        clock.tick(2000);

        expect(tryAutoplaySpy.callCount).to.equal(3);
        expect(goSpy.callCount).to.equal(2);

        // user interaction
        slides.interactionNext(1, false);
        expect(slides.isAutoplayRequested_).to.be.false;

        clock.tick(2000);

        expect(tryAutoplaySpy.callCount).to.equal(4);
        expect(goSpy.callCount).to.equal(3);

        clock.tick(2000);

        expect(tryAutoplaySpy.callCount).to.equal(4);
        expect(goSpy.callCount).to.equal(3);
      });
    });

    describe('not in viewport', () => {

      it('should not call `go`', () => {
        autoplaySetup(5000, false);

        expect(tryAutoplaySpy.callCount).to.equal(0);
        expect(goSpy.callCount).to.equal(0);

        slides.viewportCallback(false);

        expect(tryAutoplaySpy.callCount).to.equal(1);
        expect(isInViewportStub.callCount).to.equal(1);
        expect(goSpy.callCount).to.equal(0);

        clock.tick(5000);

        expect(tryAutoplaySpy.callCount).to.equal(1);
        expect(isInViewportStub.callCount).to.equal(1);
        expect(goSpy.callCount).to.equal(0);
      });
    });
  });

  describe('slides getRelativeIndex', () => {
    const slides = ['a', 'b', 'c', 'd', 'e'];

    it('should get correct relative index with a negative step', () => {
      let index = AmpSlides.getRelativeIndex(0, -1, slides.length);
      expect(index).to.equal(4);
      expect(slides[index]).to.equal('e');

      index = AmpSlides.getRelativeIndex(0, -2, slides.length);
      expect(index).to.equal(3);
      expect(slides[index]).to.equal('d');

      index = AmpSlides.getRelativeIndex(2, -1, slides.length);
      expect(index).to.equal(1);
      expect(slides[index]).to.equal('b');
    });

    it('should get correct relative index with a positive step', () => {
      let index = AmpSlides.getRelativeIndex(0, 1, slides.length);
      expect(index).to.equal(1);
      expect(slides[index]).to.equal('b');

      index = AmpSlides.getRelativeIndex(0, 2, slides.length);
      expect(index).to.equal(2);
      expect(slides[index]).to.equal('c');

      index = AmpSlides.getRelativeIndex(2, 1, slides.length);
      expect(index).to.equal(3);
      expect(slides[index]).to.equal('d');

      index = AmpSlides.getRelativeIndex(2, 4, slides.length);
      expect(index).to.equal(1);
      expect(slides[index]).to.equal('b');

      index = AmpSlides.getRelativeIndex(2, 11, slides.length);
      expect(index).to.equal(3);
      expect(slides[index]).to.equal('d');

      index = AmpSlides.getRelativeIndex(2, 23, slides.length);
      expect(index).to.equal(0);
      expect(slides[index]).to.equal('a');
    });

    it('should return current index if 0 step', () => {
      let index = AmpSlides.getRelativeIndex(0, 0, slides.length);
      expect(index).to.equal(0);
      expect(slides[index]).to.equal('a');

      index = AmpSlides.getRelativeIndex(2, 0, slides.length);
      expect(index).to.equal(2);
      expect(slides[index]).to.equal('c');

      index = AmpSlides.getRelativeIndex(4, 0, slides.length);
      expect(index).to.equal(4);
      expect(slides[index]).to.equal('e');
    });
  });

  describe('scheduling slides and updating viewport', () => {
    beforeEach(() => {
      setupElements();
      setupSlides();
      slides.inViewport_ = true;
      slides.getVsync = function() {
        return {
          mutate: function(fn) {
            fn();
          },
        };
      };
      slides.deferMutate = function(fn) {
        fn();
      };
      slides.scheduleLayout = sandbox.spy();
      slides.updateInViewport = sandbox.spy();
      slides.schedulePause = sandbox.spy();
      slides.scheduleResume = sandbox.spy();
      slides.schedulePreload = sandbox.spy();
      sandbox.stub(Animation, 'animate', () => {
        return {
          thenAlways: cb => cb(),
        };
      });
    });
    afterEach(() => {
      sandbox.restore();
      teardownElements();
    });

    it('should update viewport before scheduling slides', () => {
      slides.goCallback(1, /*animate*/ false);
      expect(slides.updateInViewport.calledBefore(
          slides.scheduleLayout)).to.be.true;
      expect(slides.updateInViewport.calledWith(slide0, false)).to.be.true;
      expect(slides.updateInViewport.calledWith(slide1, true)).to.be.true;

      slides.goCallback(-1, /*animate*/ false);
      expect(slides.updateInViewport.calledBefore(
          slides.scheduleLayout)).to.be.true;
      expect(slides.updateInViewport.calledWith(slide0, true)).to.be.true;
      expect(slides.updateInViewport.calledWith(slide1, false)).to.be.true;
    });
  });

  describe('Navigating slides', () => {
    beforeEach(() => {
      setupElements();
      setupSlides();
      slides.inViewport_ = true;
      slides.getVsync = function() {
        return {
          mutate: function(fn) {
            fn();
          },
        };
      };
      slides.deferMutate = function(fn) {
        fn();
      };
      slides.scheduleLayout = sandbox.spy();
      slides.updateInViewport = sandbox.spy();
      slides.schedulePause = sandbox.spy();
      slides.scheduleResume = sandbox.spy();
      slides.schedulePreload = sandbox.spy();
      sandbox.stub(Animation, 'animate', () => {
        return {
          thenAlways: cb => cb(),
        };
      });
    });
    afterEach(() => {
      sandbox.restore();
      teardownElements();
    });

    it('should hide slides that are not the current one', () => {
      expect(slide0.style.visibility).to.be.equal('visible');
      expect(slide1.style.visibility).to.be.equal('hidden');
      expect(slide2.style.visibility).to.be.equal('hidden');

      slides.goCallback(1, /*animate*/ false);
      expect(slide0.style.visibility).to.be.equal('hidden');
      expect(slide1.style.visibility).to.be.equal('visible');
      expect(slide2.style.visibility).to.be.equal('hidden');

      slides.goCallback(-1, /*animate*/ false);
      expect(slide0.style.visibility).to.be.equal('visible');
      expect(slide1.style.visibility).to.be.equal('hidden');
      expect(slide2.style.visibility).to.be.equal('hidden');
    });

    it('should preload slides in direction of navigation', () => {
      expect(slide0.style.visibility).to.be.equal('visible');
      expect(slide1.style.visibility).to.be.equal('hidden');

      slides.goCallback(1, /*animate*/ true);
      expect(slide0.style.visibility).to.be.equal('hidden');
      expect(slide1.style.visibility).to.be.equal('visible');
      expect(slide2.style.visibility).to.be.equal('hidden');
      expect(slides.scheduleLayout.calledWith(slide1)).to.be.true;
      expect(slides.schedulePreload.calledWith(slide2)).to.be.true;

      slides.goCallback(-1, /*animate*/ false);
      expect(slide0.style.visibility).to.be.equal('visible');
      expect(slide1.style.visibility).to.be.equal('hidden');
      expect(slide2.style.visibility).to.be.equal('hidden');
      expect(slides.scheduleLayout.calledWith(slide0)).to.be.true;
      expect(slides.schedulePreload.calledWith(slide2)).to.be.true;
    });

    it('should pause hidden slides and resume visible ones', () => {
      expect(slides.schedulePause.callCount).to.equal(0);
      expect(slides.scheduleResume.callCount).to.equal(0);

      slides.goCallback(1, /*animate*/ true);
      expect(slides.schedulePause.withArgs(slide0).callCount).to.equal(1);
      expect(slides.scheduleResume.withArgs(slide1).callCount).to.equal(1);

      slides.goCallback(-1, /*animate*/ false);
      expect(slides.schedulePause.withArgs(slide1).callCount).to.equal(1);
      expect(slides.scheduleResume.withArgs(slide0).callCount).to.equal(1);
    });
  });
});

describe('empty Slides functional', () => {

  let element;
  let slides;

  function setupElements() {
    element = document.createElement('div');
    element.setAttribute('type', 'slides');
    element.style.width = '320px';
    element.style.height = '200px';
    document.body.appendChild(element);

    element.getRealChildren = () => [];
    return element;
  }

  function setupSlides() {
    slides = new AmpSlides(element);
    return slides;
  }

  function teardownElements() {
    document.body.removeChild(element);
  }

  beforeEach(() => {
    setupElements();
    setupSlides();
  });

  afterEach(() => {
    teardownElements();
  });

  it('should throw an assert error on buildCallback', () => {
    expect(() => {
      slides.buildCallback();
    }).to.throw(/should have at least 1 slide/);
  });

  it('should not throw an error on layoutCallback', () => {
    expect(() => {
      slides.buildCallback();
    }).to.throw(/should have at least 1 slide/);
    expect(() => {
      slides.layoutCallback();
    }).to.not.throw();
  });

  it('should not throw an error on viewportCallback', () => {
    expect(() => {
      slides.buildCallback();
    }).to.throw(/should have at least 1 slide/);
    expect(() => {
      slides.viewportCallback();
    }).to.not.throw();
  });

  it('should not throw an error on goCallback', () => {
    expect(() => {
      slides.buildCallback();
    }).to.throw(/should have at least 1 slide/);
    expect(() => {
      slides.goCallback();
    }).to.not.throw();
  });

  it('should not have any controls', () => {
    expect(() => {
      slides.buildCallback();
    }).to.throw(/should have at least 1 slide/);
    expect(slides.hasNext()).to.be.false;
    expect(slides.hasPrev()).to.be.false;
  });
});
