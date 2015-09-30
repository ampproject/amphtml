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

import {Gestures} from '../../src/gesture';
import {DoubletapRecognizer, SwipeXYRecognizer, TapRecognizer,
    TapzoomRecognizer} from '../../src/gesture-recognizers';
import * as sinon from 'sinon';


describe('TapRecognizer', () => {

  let sandbox;
  let element;
  let clock;
  let recognizer;
  let gestures;
  let gesturesMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();

    element = {
      addEventListener: (eventType, handler) => {}
    };

    gestures = new Gestures(element);
    gesturesMock = sandbox.mock(gestures);

    recognizer = new TapRecognizer(gestures);
  });

  afterEach(() => {
    gesturesMock.verify();
    gesturesMock.restore();
    gesturesMock = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });


  it('should allow single-point touchstart', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);
  });

  it('should deny two-point touchstart', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}, {}]});
    expect(res).to.equal(false);
    expect(recognizer.startX_).to.equal(0);
    expect(recognizer.startY_).to.equal(0);
  });


  it('should allow small drift', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches:
        [{clientX: 102, clientY: 202}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(102);
    expect(recognizer.lastY_).to.equal(202);
  });

  it('should deny large drift', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches:
        [{clientX: 111, clientY: 211}]});
    expect(res).to.equal(false);
  });


  it('should signal ready on touchend', () => {
    gesturesMock.expects('signalReady_').withExactArgs(recognizer, 0).once();
    recognizer.onTouchEnd({});
  });

  it('should emit and end on start', () => {
    recognizer.lastX_ = 101;
    recognizer.lastY_ = 201;
    gesturesMock.expects('signalEmit_').withExactArgs(recognizer,
        sinon.match((data) => {
          return data.clientX == 101 && data.clientY == 201;
        }), null).once();
    gesturesMock.expects('signalEnd_').withExactArgs(recognizer).once();
    recognizer.acceptStart();
  });
});


describe('DoubletapRecognizer', () => {

  let sandbox;
  let element;
  let clock;
  let recognizer;
  let gestures;
  let gesturesMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();

    element = {
      addEventListener: (eventType, handler) => {}
    };

    gestures = new Gestures(element);
    gesturesMock = sandbox.mock(gestures);

    recognizer = new DoubletapRecognizer(gestures);
  });

  afterEach(() => {
    gesturesMock.verify();
    gesturesMock.restore();
    gesturesMock = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });


  it('should allow single-point touchstart', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);
  });

  it('should deny two-point touchstart', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}, {}]});
    expect(res).to.equal(false);
    expect(recognizer.startX_).to.equal(0);
    expect(recognizer.startY_).to.equal(0);
  });


  it('should allow small drift', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches:
        [{clientX: 102, clientY: 202}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(102);
    expect(recognizer.lastY_).to.equal(202);
  });

  it('should deny large drift', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches:
        [{clientX: 111, clientY: 211}]});
    expect(res).to.equal(false);
  });


  it('should ask pending for first touchend', () => {
    gesturesMock.expects('signalPending_').withExactArgs(
        recognizer, 300).once();
    gesturesMock.expects('signalReady_').never();
    recognizer.onTouchEnd({});
    expect(recognizer.tapCount_).to.equal(1);
  });

  it('should send ready for second touchend', () => {
    gesturesMock.expects('signalPending_').once();
    recognizer.onTouchEnd({});

    gesturesMock.expects('signalReady_').withExactArgs(recognizer, 0).once();
    recognizer.onTouchEnd({});
    expect(recognizer.tapCount_).to.equal(2);
  });


  it('should emit and end on start', () => {
    recognizer.lastX_ = 101;
    recognizer.lastY_ = 201;
    gesturesMock.expects('signalEmit_').withExactArgs(recognizer,
        sinon.match((data) => {
          return data.clientX == 101 && data.clientY == 201;
        }), null).once();
    gesturesMock.expects('signalEnd_').withExactArgs(recognizer).once();
    recognizer.acceptStart();
    expect(recognizer.tapCount_).to.equal(0);
  });
});


describe('SwipeXYRecognizer', () => {

  let sandbox;
  let element;
  let clock;
  let recognizer;
  let gestures;
  let gesturesMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();

    element = {
      addEventListener: (eventType, handler) => {}
    };

    gestures = new Gestures(element);
    gesturesMock = sandbox.mock(gestures);

    recognizer = new SwipeXYRecognizer(gestures);
  });

  afterEach(() => {
    gesturesMock.verify();
    gesturesMock.restore();
    gesturesMock = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });

  function diff(value, compare, error) {
    return Math.abs(value - compare) <= error;
  }


  it('should allow single-point touchstart', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);
  });

  it('should deny two-point touchstart', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}, {}]});
    expect(res).to.equal(false);
    expect(recognizer.startX_).to.equal(0);
    expect(recognizer.startY_).to.equal(0);
  });


  it('should allow small drift before requesting ready', () => {
    gesturesMock.expects('signalReady_').never();
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches:
        [{clientX: 102, clientY: 202}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(102);
    expect(recognizer.lastY_).to.equal(202);
  });

  it('should send ready after significant move', () => {
    gesturesMock.expects('signalReady_').withExactArgs(recognizer, -10).once();

    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);

    res = recognizer.onTouchMove({touches:
        [{clientX: 112, clientY: 212}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(112);
    expect(recognizer.lastY_).to.equal(212);
  });


  it('should emit on start', () => {
    recognizer.startTime_ = 1;
    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.lastX_ = 111;
    recognizer.lastY_ = 211;
    gesturesMock.expects('signalEmit_').withExactArgs(recognizer,
        sinon.match((data) => {
          return (data.first === true && data.last === false &&
              data.deltaX == 0 &&
              data.deltaY == 0 &&
              data.time == 10 &&
              diff(data.velocityX, 0.86, 1e-2) &&
              diff(data.velocityY, 0.86, 1e-2));
        }), null).once();
    gesturesMock.expects('signalEnd_').never();

    clock.tick(10);
    recognizer.acceptStart();

    expect(recognizer.eventing_).to.equal(true);
    expect(recognizer.startTime_).to.equal(1);
    expect(recognizer.startX_).to.equal(111);
    expect(recognizer.startY_).to.equal(211);
    expect(recognizer.prevTime_).to.equal(10);
    expect(recognizer.prevX_).to.equal(111);
    expect(recognizer.prevY_).to.equal(211);
  });

  it('should emit on touchmove after start', () => {
    let event = {touches: [{clientX: 111, clientY: 211}]};

    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.eventing_ = true;
    gesturesMock.expects('signalEmit_').withExactArgs(recognizer,
        sinon.match((data) => {
          return (data.first === false && data.last === false &&
              data.deltaX == 10 &&
              data.deltaY == 10 &&
              data.velocityX > 0 &&
              data.velocityY > 0);
        }), event).once();
    gesturesMock.expects('signalEnd_').never();

    clock.tick(10);
    let res = recognizer.onTouchMove(event);
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(111);
    expect(recognizer.lastY_).to.equal(211);
  });

  it('should stop on touchend; velocity doesn\'t change', () => {
    let event = {};

    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.lastX_ = 111;
    recognizer.lastY_ = 211;
    recognizer.velocityX_ = 0.5;
    recognizer.velocityY_ = 0.5;
    recognizer.eventing_ = true;
    gesturesMock.expects('signalEmit_').withExactArgs(recognizer,
        sinon.match((data) => {
          return (data.first === false && data.last === true &&
              data.deltaX == 10 &&
              data.deltaY == 10 &&
              data.velocityX == 0.5 &&
              data.velocityY == 0.5);
        }), event).once();
    gesturesMock.expects('signalEnd_').once();

    clock.tick(10);
    recognizer.onTouchEnd(event);
    expect(recognizer.eventing_).to.equal(false);
  });

  it('should stop on touchend; velocity changes', () => {
    let event = {};

    recognizer.startX_ = 101;
    recognizer.startY_ = 201;
    recognizer.lastX_ = recognizer.prevX_ = 111;
    recognizer.lastY_ = recognizer.prevY_ = 211;
    recognizer.velocityX_ = 0.5;
    recognizer.velocityY_ = 0.5;
    recognizer.eventing_ = true;
    gesturesMock.expects('signalEmit_').withExactArgs(recognizer,
        sinon.match((data) => {
          return (data.first === false && data.last === true &&
              data.deltaX == 10 &&
              data.deltaY == 10 &&
              data.velocityX == 0 &&
              data.velocityY == 0);
        }), event).once();
    gesturesMock.expects('signalEnd_').once();

    clock.tick(50);
    recognizer.onTouchEnd(event);
    expect(recognizer.eventing_).to.equal(false);
  });
});


describe('TapzoomRecognizer', () => {

  let sandbox;
  let element;
  let clock;
  let recognizer;
  let gestures;
  let gesturesMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();

    element = {
      addEventListener: (eventType, handler) => {}
    };

    gestures = new Gestures(element);
    gesturesMock = sandbox.mock(gestures);

    recognizer = new TapzoomRecognizer(gestures);
  });

  afterEach(() => {
    gesturesMock.verify();
    gesturesMock.restore();
    gesturesMock = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });


  it('should allow single-point touchstart', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);
  });

  it('should deny two-point touchstart', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}, {}]});
    expect(res).to.equal(false);
    expect(recognizer.startX_).to.equal(0);
    expect(recognizer.startY_).to.equal(0);
  });

  it('should allow small drift for tap', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches:
        [{clientX: 102, clientY: 202}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(102);
    expect(recognizer.lastY_).to.equal(202);
  });

  it('should deny large drift for tap', () => {
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches:
        [{clientX: 111, clientY: 211}]});
    expect(res).to.equal(false);
  });

  it('should ask pending for first touchend', () => {
    gesturesMock.expects('signalPending_').withExactArgs(
        recognizer, 400).once();
    gesturesMock.expects('signalReady_').never();
    recognizer.onTouchEnd({});
    expect(recognizer.tapCount_).to.equal(1);
  });

  it('should ignore small drift after first tap', () => {
    recognizer.tapCount_ = 1;
    gesturesMock.expects('signalReady_').never();
    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches:
        [{clientX: 102, clientY: 202}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(102);
    expect(recognizer.lastY_).to.equal(202);
  });

  it('should send ready after significant move', () => {
    recognizer.tapCount_ = 1;
    gesturesMock.expects('signalReady_').withExactArgs(recognizer, 0).once();

    let res = recognizer.onTouchStart({touches:
        [{clientX: 101, clientY: 201}]});
    expect(res).to.equal(true);

    res = recognizer.onTouchMove({touches:
        [{clientX: 112, clientY: 212}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(112);
    expect(recognizer.lastY_).to.equal(212);
  });


  it('should emit on start', () => {
    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.lastX_ = 111;
    recognizer.lastY_ = 211;
    gesturesMock.expects('signalEmit_').withExactArgs(recognizer,
        sinon.match((data) => {
          return (data.first === true && data.last === false &&
              data.centerClientX == 101 && data.centerClientY == 201 &&
              data.deltaX == 10 && data.deltaY == 10 &&
              data.velocityX == 0 && data.velocityY == 0);
        }), null).once();
    gesturesMock.expects('signalEnd_').never();

    clock.tick(10);
    recognizer.acceptStart();

    expect(recognizer.eventing_).to.equal(true);
  });

  it('should emit on touchmove after start', () => {
    let event = {touches: [{clientX: 111, clientY: 211}]};

    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.eventing_ = true;
    gesturesMock.expects('signalEmit_').withExactArgs(recognizer,
        sinon.match((data) => {
          return (data.first === false && data.last === false &&
              data.centerClientX == 101 && data.centerClientY == 201 &&
              data.deltaX == 10 && data.deltaY == 10 &&
              data.velocityX > 0 && data.velocityY > 0);
        }), event).once();
    gesturesMock.expects('signalEnd_').never();

    clock.tick(10);
    let res = recognizer.onTouchMove(event);
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(111);
    expect(recognizer.lastY_).to.equal(211);
  });

  it('should stop on touchend', () => {
    let event = {};

    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.lastX_ = 111;
    recognizer.lastY_ = 211;
    recognizer.eventing_ = true;
    gesturesMock.expects('signalEmit_').withExactArgs(recognizer,
        sinon.match((data) => {
          return (data.first === false && data.last === true &&
              data.centerClientX == 101 && data.centerClientY == 201 &&
              data.deltaX == 10 && data.deltaY == 10 &&
              data.velocityX > 0 && data.velocityY > 0);
        }), event).once();
    gesturesMock.expects('signalEnd_').once();

    clock.tick(10);
    recognizer.onTouchEnd(event);
    expect(recognizer.eventing_).to.equal(false);
    expect(recognizer.tapCount_).to.equal(0);
  });
});
