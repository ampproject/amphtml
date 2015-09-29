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

import {AmpSlides} from '../slides';
import * as tr from '../../../../src/transition';


describe('Slides gestures', () => {

  let element;
  let slide0, slide1, slide2;
  let slides;
  let prepareCallback, switchCallback;

  beforeEach(() => {
    element = document.createElement('div');
    element.style.width = '320px';
    element.style.height = '200px';
    document.body.appendChild(element);

    element.appendChild(slide0 = document.createElement('div'));
    element.appendChild(slide1 = document.createElement('div'));
    element.appendChild(slide2 = document.createElement('div'));

    slides = new AmpSlides(element);
    slides.buildCarousel();
    slides.setupGestures();

    slides.prepareSlide_ = prepareCallback = sinon.spy();
    slides.commitSwitch_ = switchCallback = sinon.spy();
  });

  afterEach(() => {
    document.body.removeChild(element);
  });


  it('should start swiping with slide0', () => {
    slides.currentIndex_ = 0;
    slides.onSwipeStart_({});
    expect(slides.swipeState_).to.not.equal(null);
    expect(slides.swipeState_.currentIndex).to.equal(0);
    expect(slides.swipeState_.containerWidth).to.equal(320);
    expect(slides.swipeState_.prevTr).to.equal(tr.NOOP);
    expect(slides.swipeState_.nextTr).to.not.equal(tr.NOOP);
    expect(slides.swipeState_.min).to.equal(0);
    expect(slides.swipeState_.max).to.equal(1);
    expect(slides.swipeState_.pos).to.equal(0);
    expect(prepareCallback.callCount).to.equal(1);
    expect(prepareCallback.getCall(0).args[0]).to.equal(slide1);
    expect(prepareCallback.getCall(0).args[1]).to.equal(1);
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


  it('should update on swipe within range in neg direction', () => {
    let prevTr = sinon.spy();
    let nextTr = sinon.spy();
    slides.currentIndex_ = 0;
    slides.swipeState_ = {
      currentIndex: 0,
      containerWidth: 320,
      pos: 0,
      min: 0,
      max: 1,
      prevTr: prevTr,
      nextTr: nextTr
    };
    slides.onSwipe_({deltaX: -32});
    expect(slides.swipeState_.pos).to.equal(0.1);
    expect(nextTr.callCount).to.equal(1);
    expect(prevTr.callCount).to.equal(1);
    expect(nextTr.getCall(0).args[0]).to.equal(0.1);
    expect(prevTr.getCall(0).args[0]).to.equal(0);
  });

  it('should update on swipe within range in pos direction', () => {
    let prevTr = sinon.spy();
    let nextTr = sinon.spy();
    slides.currentIndex_ = 1;
    slides.swipeState_ = {
      currentIndex: 1,
      containerWidth: 320,
      pos: 0,
      min: -1,
      max: 1,
      prevTr: prevTr,
      nextTr: nextTr
    };
    slides.onSwipe_({deltaX: 32});
    expect(slides.swipeState_.pos).to.equal(-0.1);
    expect(nextTr.callCount).to.equal(1);
    expect(prevTr.callCount).to.equal(1);
    expect(nextTr.getCall(0).args[0]).to.equal(0);
    expect(prevTr.getCall(0).args[0]).to.equal(0.1);
  });

  it('should stay in-bounds on swipe', () => {
    let prevTr = sinon.spy();
    let nextTr = sinon.spy();
    slides.currentIndex_ = 0;
    slides.swipeState_ = {
      currentIndex: 0,
      containerWidth: 320,
      pos: 0,
      min: 0,
      max: 1,
      prevTr: prevTr,
      nextTr: nextTr
    };
    slides.onSwipe_({deltaX: 32});
    expect(slides.swipeState_.pos).to.equal(0);
    expect(nextTr.callCount).to.equal(1);
    expect(prevTr.callCount).to.equal(1);
    expect(nextTr.getCall(0).args[0]).to.equal(0);
    expect(prevTr.getCall(0).args[0]).to.equal(0);
  });


  it('should go next after threshold', () => {
    let prevTr = sinon.spy();
    let nextTr = sinon.spy();
    slides.currentIndex_ = 0;
    let s = {
      currentIndex: 0,
      containerWidth: 320,
      pos: 0.55,
      min: 0,
      max: 1,
      prevTr: prevTr,
      nextTr: nextTr
    };
    slides.swipeState_ = s;
    let promise = slides.onSwipeEnd_({velocityX: 0});
    expect(slides.swipeState_).to.equal(null);
    return promise.then(() => {
      expect(nextTr.callCount).to.be.gt(1);
      expect(prevTr.callCount).to.be.gt(1);
      expect(nextTr.lastCall.args[0]).to.equal(1);
      expect(prevTr.lastCall.args[0]).to.equal(0);
      expect(switchCallback.callCount).to.equal(1);
      expect(switchCallback.firstCall.args[0]).to.equal(slide0);
      expect(switchCallback.firstCall.args[1]).to.equal(slide1);
    });
  });

  it('should go next before threshold but with velocity', () => {
    let prevTr = sinon.spy();
    let nextTr = sinon.spy();
    slides.currentIndex_ = 0;
    let s = {
      currentIndex: 0,
      containerWidth: 320,
      pos: 0.45,
      min: 0,
      max: 1,
      prevTr: prevTr,
      nextTr: nextTr
    };
    slides.swipeState_ = s;
    let promise = slides.onSwipeEnd_({velocityX: -0.5});
    expect(slides.swipeState_).to.equal(null);
    return promise.then(() => {
      expect(nextTr.callCount).to.be.gt(1);
      expect(prevTr.callCount).to.be.gt(1);
      expect(nextTr.lastCall.args[0]).to.equal(1);
      expect(prevTr.lastCall.args[0]).to.equal(0);
      expect(switchCallback.callCount).to.equal(1);
      expect(switchCallback.firstCall.args[0]).to.equal(slide0);
      expect(switchCallback.firstCall.args[1]).to.equal(slide1);
    });
  });

  it('should bounce back before threshold and no velocity', () => {
    let prevTr = sinon.spy();
    let nextTr = sinon.spy();
    slides.currentIndex_ = 0;
    let s = {
      currentIndex: 0,
      containerWidth: 320,
      pos: 0.45,
      min: 0,
      max: 1,
      prevTr: prevTr,
      nextTr: nextTr
    };
    slides.swipeState_ = s;
    let promise = slides.onSwipeEnd_({velocityX: 0});
    expect(slides.swipeState_).to.equal(null);
    return promise.then(() => {
      expect(nextTr.callCount).to.be.gt(1);
      expect(prevTr.callCount).to.be.gt(1);
      expect(nextTr.lastCall.args[0]).to.equal(0);
      expect(prevTr.lastCall.args[0]).to.equal(0);
      expect(switchCallback.callCount).to.equal(0);
    });
  });

  it('should bounce back before threshold and opposite velocity', () => {
    let prevTr = sinon.spy();
    let nextTr = sinon.spy();
    slides.currentIndex_ = 0;
    let s = {
      currentIndex: 0,
      containerWidth: 320,
      pos: 0.45,
      min: 0,
      max: 1,
      prevTr: prevTr,
      nextTr: nextTr
    };
    slides.swipeState_ = s;
    let promise = slides.onSwipeEnd_({velocityX: 0.5});
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
