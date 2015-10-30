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

import {AmpCarousel} from '../carousel';


describe('Carousel gestures', () => {

  let element;
  let carousel;

  beforeEach(() => {
    element = document.createElement('div');
    element.style.width = '320px';
    element.style.height = '200px';
    element.getRealChildren = () => [];
    document.body.appendChild(element);

    carousel = new AmpCarousel(element);
    carousel.buildCarousel();
    carousel.setupGestures();
    carousel.container_.style.width = '640px';
  });

  afterEach(() => {
    document.body.removeChild(element);
  });


  it('should start swiping; content is bigger than element', () => {
    carousel.pos_ = 1;
    carousel.onSwipeStart_({});
    expect(carousel.startPos_).to.equal(1);
    expect(carousel.motion_).to.equal(null);
    expect(carousel.minPos_).to.equal(0);
    expect(carousel.maxPos_).to.equal(320);  // 640 - 320
    expect(carousel.extent_).to.equal(128);  // 40% of 320
  });

  it('should start swiping; content is smaller than element', () => {
    carousel.container_.style.width = '300px';
    carousel.onSwipeStart_({});
    expect(carousel.maxPos_).to.equal(0);
  });


  it('should update on swipe within range in neg direction', () => {
    carousel.onSwipeStart_({});
    carousel.onSwipe_({deltaX: -11, velocityX: 0.5});
    expect(carousel.pos_).to.equal(11);
  });

  it('should update on swipe within range in pos direction', () => {
    carousel.pos_ = 51;
    carousel.onSwipeStart_({});
    carousel.onSwipe_({deltaX: 11, velocityX: 0.5});
    expect(carousel.pos_).to.equal(40);
  });

  it('should update on swipe overshoot in neg direction', () => {
    carousel.onSwipeStart_({});
    carousel.onSwipe_({deltaX: -400, velocityX: 0.5});
    expect(carousel.pos_).to.equal(400);
  });

  it('should update on swipe overshoot in pos direction', () => {
    carousel.onSwipeStart_({});
    carousel.onSwipe_({deltaX: 100, velocityX: 0.5});
    expect(carousel.pos_).to.equal(-100);
  });

  it('should update on swipe overshoot in neg direction out of range', () => {
    carousel.onSwipeStart_({});
    carousel.onSwipe_({deltaX: -500, velocityX: 0.5});
    expect(carousel.pos_).to.equal(448);  // 320 + 128
  });

  it('should update on swipe overshoot in pos direction out of range', () => {
    carousel.onSwipeStart_({});
    carousel.onSwipe_({deltaX: 200, velocityX: 0.5});
    expect(carousel.pos_).to.equal(-128);
  });


  it('should continue innertia', () => {
    carousel.onSwipeStart_({});
    const promise = carousel.onSwipeEnd_({deltaX: 0, velocityX: -0.11});
    expect(carousel.motion_).to.not.equal(null);
  });

  it('should not continue innertia', () => {
    carousel.onSwipeStart_({});
    const promise = carousel.onSwipeEnd_({deltaX: 0, velocityX: -0.01});
    expect(carousel.motion_).to.equal(null);
  });
});
