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

import {calcVelocity, continueMotion} from '../../src/motion';

describe('Motion calcVelocity', () => {
  it('should dampen velocity when prevVelocity is 0', () => {
    expect(calcVelocity(200, 10, 0)).to.be.closeTo(15.999, 1e-3);
  });

  it('should not affect velocity when prevVelocity the same', () => {
    expect(calcVelocity(200, 10, 20)).to.be.closeTo(20, 1e-3);
  });

  it('should slow down deceleration when prevVelocity is available', () => {
    expect(calcVelocity(0, 10, 20)).to.be.closeTo(4.001, 1e-3);
  });

  it('should be zero when both new and old velocity are zero', () => {
    expect(calcVelocity(0, 10, 0)).to.equal(0);
  });

  it('should calculate even when time is zero', () => {
    expect(calcVelocity(20, 0, 20)).to.be.closeTo(20, 1e-3);
  });

  it('should calculate continuosly', () => {
    let v = 0;
    v = calcVelocity(-11.25, 16, v);
    expect(v).to.be.closeTo(-0.689, 1e-3);

    v = calcVelocity(-11.25, 17, v);
    expect(v).to.be.closeTo(-0.662, 1e-3);

    v = calcVelocity(-11.25, 18, v);
    expect(v).to.be.closeTo(-0.625, 1e-3);
  });
});

describe('Motion continueMotion', () => {
  let sandbox;
  let clock;
  let vsync;
  let vsyncTasks;
  let contextNode;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    clock = sandbox.useFakeTimers();
    vsyncTasks = [];
    vsync = {
      runAnimMutateSeries: (unusedContextNode, mutator) => {
        vsyncTasks.push(mutator);
        return new Promise((unusedResolve, unusedReject) => {});
      },
    };
    contextNode = document.createElement('div');
  });

  afterEach(() => {
    sandbox.restore();
  });

  function testContinuation(maxVelocity, haltAfterTime) {
    let resultX = null;
    let resultY = null;
    const motion = continueMotion(
      contextNode,
      141,
      104,
      maxVelocity,
      maxVelocity,
      (x, y) => {
        resultX = x;
        resultY = y;
        return true;
      },
      vsync
    );

    expect(vsyncTasks.length).to.equal(1);
    const mutator = vsyncTasks[0];
    vsyncTasks = [];

    resultX = resultY = null;
    mutator(0, 0, {});
    expect(resultX).to.be.closeTo(141, 1e-3);
    expect(resultY).to.be.closeTo(104, 1e-3);

    const values = [];
    let time = 0;
    let continuing = true;
    do {
      resultX = resultY = null;
      clock.tick(100);
      const prev = time;
      time += 100;
      continuing = mutator(time, time - prev, {});
      if (resultX != null) {
        expect(resultX - 141).to.be.closeTo(resultY - 104, 1e-3);
        values.push(resultX - 141);
      }
      if (haltAfterTime && time >= haltAfterTime) {
        motion.halt();
      }
    } while (continuing && time < 10000);
    expect(continuing).to.equal(false);
    return values;
  }

  it('should follow positive inertia', () => {
    const values = testContinuation(0.665, 0);
    expect(values.length).to.equal(12);
    expect(values[0]).to.be.closeTo(66, 1);
    expect(values[1]).to.be.closeTo(115, 1);
    expect(values[2]).to.be.closeTo(151, 1);
    expect(values[values.length - 2]).to.be.closeTo(243, 1);
    expect(values[values.length - 1]).to.be.closeTo(245, 1);
  });

  it('should halt when requested while following positive inertia', () => {
    const values = testContinuation(0.665, 300);
    expect(values.length).to.equal(3);
    expect(values[0]).to.be.closeTo(66, 1);
    expect(values[1]).to.be.closeTo(115, 1);
    expect(values[2]).to.be.closeTo(151, 1);
  });

  it('should follow negative inertia', () => {
    const values = testContinuation(-0.665, 0);
    expect(values.length).to.equal(12);
    expect(values[0]).to.be.closeTo(-66, 1);
    expect(values[1]).to.be.closeTo(-115, 1);
    expect(values[2]).to.be.closeTo(-151, 1);
    expect(values[values.length - 2]).to.be.closeTo(-243, 1);
    expect(values[values.length - 1]).to.be.closeTo(-245, 1);
  });

  it('should halt when requested while following negative inertia', () => {
    const values = testContinuation(-0.665, 300);
    expect(values.length).to.equal(3);
    expect(values[0]).to.be.closeTo(-66, 1);
    expect(values[1]).to.be.closeTo(-115, 1);
    expect(values[2]).to.be.closeTo(-151, 1);
  });
});
