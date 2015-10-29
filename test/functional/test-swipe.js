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

import {SwipeXRecognizer} from '../../src/swipe';
import * as sinon from 'sinon';

describe('Swipe', () => {

  let sandbox;
  let element;
  let clock;
  let vsync;
  let vsyncTasks;
  let swipeX;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    element = document.createElement('div');
    clock = sandbox.useFakeTimers();
    vsyncTasks = [];
    vsync = {
      runMutateSeries: mutator => {
        vsyncTasks.push(mutator);
        return new Promise((resolve, reject) => {});
      }
    };
    swipeX = new SwipeXRecognizer(element, vsync);
  });

  afterEach(() => {
    expect(vsyncTasks.length).to.equal(0);
    vsync = null;
    vsyncTasks = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });

  function testContinuation(maxVelocity, resetVelocity, repeatContinue,
        x1, x05, x0) {
    let resultMaxVelocity = null;
    let resultRepeatContinue = null;
    let resultVelocityFunc = null;
    swipeX.runContinuing_ = (maxVelocity, repeatContinue, velocityFunc) => {
      resultMaxVelocity = maxVelocity;
      resultRepeatContinue = repeatContinue;
      resultVelocityFunc = velocityFunc;
    };

    // Start tracking and eventing.
    swipeX.touchStart_({touches: [{clientX: 101, clientY: 102}]});
    swipeX.touchMove_({touches: [{clientX: 121, clientY: 104}]});
    clock.tick(20);  // 20
    swipeX.touchMove_({touches: [{clientX: 141, clientY: 104}]});
    expect(swipeX.velocity_).to.be.closeTo(0.7, 1e-3);
    expect(swipeX.lastX_).to.be.closeTo(141, 1e-3);

    // End touch.
    if (resetVelocity) {
      swipeX.velocity_ = 0;
    }
    swipeX.touchEnd_({});

    expect(resultMaxVelocity).to.be.closeTo(maxVelocity, 1e-3);
    expect(resultRepeatContinue).to.equal(repeatContinue);

    swipeX.lastX_ = resultVelocityFunc(maxVelocity, 0, 0);
    expect(swipeX.lastX_).to.equal(x1, 1e-3);

    swipeX.lastX_ = resultVelocityFunc(maxVelocity * 0.5, 100, 100);
    expect(swipeX.lastX_).to.equal(x05, 1e-3);

    swipeX.lastX_ = resultVelocityFunc(maxVelocity * 0, 200, 100);
    expect(swipeX.lastX_).to.equal(x0, 1e-3);
  }


  it('swipeX - touchStart', () => {
    // No touches.
    swipeX.touchStart_({});
    expect(swipeX.tracking_).to.equal(false);

    // More than one touch.
    swipeX.touchStart_({
      touches: [{}, {}]
    });
    expect(swipeX.tracking_).to.equal(false);

    // Proper touch.
    swipeX.touchStart_({
      touches: [{
        clientX: 101,
        clientY: 102
      }]
    });
    expect(swipeX.tracking_).to.equal(true);
    expect(swipeX.startX_).to.equal(101);
    expect(swipeX.startY_).to.equal(102);
  });


  it('swipeX - touchMove', () => {
    let startEvent = null;
    swipeX.onStart(e => {
      startEvent = e;
    });

    let moveEvent = null;
    swipeX.onMove(e => {
      moveEvent = e;
    });

    // Not tracking yet.
    swipeX.touchMove_({clientX: 121, clientY: 102});
    expect(swipeX.tracking_).to.equal(false);
    expect(swipeX.eventing_).to.equal(false);

    // Start tracking.
    swipeX.touchStart_({touches: [{clientX: 101, clientY: 102}]});
    expect(swipeX.tracking_).to.equal(true);

    // Vertical swipe detected
    swipeX.touchMove_({touches: [{clientX: 121, clientY: 122}]});
    expect(swipeX.tracking_).to.equal(false);
    expect(swipeX.eventing_).to.equal(false);

    // Start tracking again.
    swipeX.touchStart_({touches: [{clientX: 101, clientY: 102}]});
    expect(swipeX.tracking_).to.equal(true);
    expect(swipeX.startX_).to.equal(101);

    // Small horizontal move and tiny vetical move.
    swipeX.touchMove_({touches: [{clientX: 104, clientY: 104}]});
    expect(swipeX.tracking_).to.equal(true);
    expect(swipeX.eventing_).to.equal(false);

    // Horizontal swipe and tiny vetical move.
    expect(startEvent).to.equal(null);
    swipeX.touchMove_({touches: [{clientX: 121, clientY: 104}]});
    expect(swipeX.tracking_).to.equal(true);
    expect(swipeX.eventing_).to.equal(true);
    expect(startEvent).to.not.equal(null);
    expect(swipeX.startX_).to.equal(121);

    // Move.
    expect(moveEvent).to.equal(null);
    swipeX.touchMove_({touches: [{clientX: 131, clientY: 104}]});
    expect(moveEvent).to.not.equal(null);
    expect(moveEvent.delta).to.equal(131 - 121);

    // Move back.
    moveEvent = null;
    swipeX.touchMove_({touches: [{clientX: 121, clientY: 104}]});
    expect(moveEvent).to.not.equal(null);
    expect(moveEvent.delta).to.equal(0);
  });


  it('swipeX - touchEnd', () => {
    let endEvent = null;
    swipeX.onEnd(e => {
      endEvent = e;
    });

    // Start tracking and eventing.
    swipeX.touchStart_({touches: [{clientX: 101, clientY: 102}]});
    swipeX.touchMove_({touches: [{clientX: 121, clientY: 104}]});
    swipeX.touchMove_({touches: [{clientX: 131, clientY: 104}]});
    expect(swipeX.tracking_).to.equal(true);
    expect(swipeX.eventing_).to.equal(true);
    expect(swipeX.startX_).to.equal(121);

    // End touch.
    swipeX.touchEnd_({});
    expect(swipeX.tracking_).to.equal(false);
    expect(swipeX.eventing_).to.equal(false);
    expect(endEvent).to.not.equal(null);
    expect(endEvent.delta).to.equal(131 - 121);
  });


  it('swipeX - touchCancel', () => {
    let endEvent = null;
    swipeX.onEnd(e => {
      endEvent = e;
    });

    // Start tracking and eventing.
    swipeX.touchStart_({touches: [{clientX: 101, clientY: 102}]});
    swipeX.touchMove_({touches: [{clientX: 121, clientY: 104}]});
    swipeX.touchMove_({touches: [{clientX: 131, clientY: 104}]});
    expect(swipeX.tracking_).to.equal(true);
    expect(swipeX.eventing_).to.equal(true);
    expect(swipeX.startX_).to.equal(121);

    // Cancel touch.
    swipeX.touchCancel_({});
    expect(swipeX.tracking_).to.equal(false);
    expect(swipeX.eventing_).to.equal(false);
    expect(endEvent).to.not.equal(null);
    expect(endEvent.delta).to.equal(131 - 121);
  });


  it('swipeX - calcVelocity', () => {
    let v = 0;
    v = swipeX.calcVelocity_(-8.75, -20, 0, 16, v);
    expect(v).to.be.closeTo(-0.464, 1e-3);

    v = swipeX.calcVelocity_(-20, -31.25, 16, 33, v);
    expect(v).to.be.closeTo(-0.597, 1e-3);

    v = swipeX.calcVelocity_(-31.25, -42.50, 33, 51, v);
    expect(v).to.be.closeTo(-0.616, 1e-3);
  });


  it('swipeX - position', () => {
    swipeX.setPositionOffset(1);
    swipeX.setPositionMultiplier(0.1);

    let moveEvent = null;
    swipeX.onMove(e => {
      moveEvent = e;
    });

    // Start tracking and eventing.
    swipeX.touchStart_({touches: [{clientX: 101, clientY: 102}]});
    swipeX.touchMove_({touches: [{clientX: 121, clientY: 104}]});
    swipeX.touchMove_({touches: [{clientX: 131, clientY: 104}]});

    expect(moveEvent).to.not.equal(null);
    expect(moveEvent.delta).to.equal(10);
    expect(moveEvent.position).to.equal(2);  // 1 + 10 * 0.1
  });


  it('swipeX - bounds', () => {
    // No overpull.
    swipeX.setBounds(-10, 10, 0);

    let moveEvent = null;
    swipeX.onMove(e => {
      moveEvent = e;
    });

    // Start tracking and eventing.
    swipeX.touchStart_({touches: [{clientX: 101, clientY: 102}]});
    swipeX.touchMove_({touches: [{clientX: 121, clientY: 104}]});

    // Normal move.
    swipeX.touchMove_({touches: [{clientX: 131, clientY: 104}]});
    expect(moveEvent).to.not.equal(null);
    expect(moveEvent.delta).to.equal(10);

    // Move out of bounds.
    moveEvent = null;
    swipeX.touchMove_({touches: [{clientX: 141, clientY: 104}]});
    expect(moveEvent).to.not.equal(null);
    expect(moveEvent.delta).to.equal(10);

    // With overpull.
    swipeX.setBounds(-10, 10, 10);

    // Move within overpull
    swipeX.touchMove_({touches: [{clientX: 141, clientY: 104}]});
    expect(moveEvent).to.not.equal(null);
    expect(moveEvent.delta).to.equal(20);
  });


  it('swipeX - continued motion - velocity cycles', () => {
    swipeX.setBounds(-10, 10, 10);
    swipeX.continueMotion(0, false);

    let moveEvent = null;
    swipeX.onMove(e => {
      moveEvent = e;
    });

    // Start tracking and eventing.
    swipeX.touchStart_({touches: [{clientX: 101, clientY: 102}]});
    swipeX.touchMove_({touches: [{clientX: 121, clientY: 104}]});
    clock.tick(20);  // 20
    swipeX.touchMove_({touches: [{clientX: 141, clientY: 104}]});
    expect(swipeX.velocity_).to.be.closeTo(0.7, 1e-3);
    expect(swipeX.lastX_).to.be.closeTo(141, 1e-3);

    // End touch.
    swipeX.touchEnd_({});

    expect(vsyncTasks.length).to.equal(1);
    let mutator = vsyncTasks[0];
    vsyncTasks = [];
    let cont = false;

    // First vsync with time = 0
    moveEvent = null;
    cont = mutator(0, 0, {});
    expect(cont).to.equal(true);
    expect(swipeX.velocity_).to.be.closeTo(-0.56, 1e-3);
    expect(moveEvent.continued).to.equal(true);
    expect(moveEvent.synthetic).to.equal(true);

    // Vsync with time = 100
    cont = mutator(100, 100, {});
    expect(cont).to.equal(true);
    expect(swipeX.velocity_).to.be.closeTo(-0.302, 1e-3);

    // Vsync with time = 200
    cont = mutator(200, 100, {});
    expect(cont).to.equal(true);
    expect(swipeX.velocity_).to.be.closeTo(-0.163, 1e-3);

    // Vsync with time = 400
    cont = mutator(400, 200, {});
    expect(cont).to.equal(true);
    expect(swipeX.velocity_).to.be.closeTo(-0.047, 1e-3);

    // Vsync with time = 1000
    cont = mutator(2000, 1600, {});
    expect(cont).to.equal(false);
    expect(swipeX.velocity_).to.be.closeTo(0, 1e-3);
  });


  it('swipeX - continued motion - overpull', () => {
    swipeX.setBounds(-10, 10, 10);
    swipeX.continueMotion(0, false);
    testContinuation(/* maxVelocity */ -0.56,
        /* resetVelocity */ false,
        /* repeatContinue */ false,
        /* x1 */ 141, /* x05 */ 131.25, /* x0 */ 131);
  });


  it('swipeX - continued motion - snap back', () => {
    swipeX.setBounds(-40, 40, 0);
    swipeX.continueMotion(30, false);
    testContinuation(/* maxVelocity */ -0.5,
        /* resetVelocity */ true,
        /* repeatContinue */ false,
        /* x1 */ 141, /* x05 */ 131, /* x0 */ 121);
  });


  it('swipeX - continued motion - snap forward', () => {
    swipeX.setBounds(-40, 40, 0);
    swipeX.continueMotion(4, false);
    testContinuation(/* maxVelocity */ 0.5,
        /* resetVelocity */ true,
        /* repeatContinue */ false,
        /* x1 */ 141, /* x05 */ 151, /* x0 */ 161);
  });


  it('swipeX - continued motion - inertia', () => {
    swipeX.continueMotion(0, true);
    testContinuation(/* maxVelocity */ 0.665,
        /* resetVelocity */ false,
        /* repeatContinue */ true,
        /* x1 */ 141, /* x05 */ 174.25, /* x0 */ 174.25);
  });


  it('swipeX - continued motion - inertia - stop on touch', () => {
    swipeX.continueMotion(0, true);

    // Start tracking and eventing.
    swipeX.touchStart_({touches: [{clientX: 101, clientY: 102}]});
    swipeX.touchMove_({touches: [{clientX: 121, clientY: 104}]});
    clock.tick(20);  // 20
    swipeX.touchMove_({touches: [{clientX: 141, clientY: 104}]});
    expect(swipeX.velocity_).to.be.closeTo(0.7, 1e-3);
    expect(swipeX.lastX_).to.be.closeTo(141, 1e-3);

    // End touch.
    swipeX.touchEnd_({});

    expect(vsyncTasks.length).to.equal(1);
    vsyncTasks = [];

    expect(swipeX.eventing_).to.equal(true);
    expect(swipeX.continuing_).to.equal(true);

    swipeX.touchStart_({touches: [{clientX: 141, clientY: 102}]});
    expect(swipeX.eventing_).to.equal(false);
    expect(swipeX.continuing_).to.equal(false);
  });
});
