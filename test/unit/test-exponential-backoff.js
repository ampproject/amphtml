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

import {
  exponentialBackoff,
  exponentialBackoffClock,
} from '../../src/exponential-backoff';

describe('exponentialBackoff', () => {
  let sandbox;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    clock = sandbox.useFakeTimers();
    sandbox.stub(Math, 'random').callsFake(() => 1);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should backoff exponentially', () => {
    let count = 0;
    const backoff = exponentialBackoff();
    const backoff2 = exponentialBackoff();
    const increment = () => {
      count++;
    };

    backoff(increment);
    expect(count).to.equal(0);
    clock.tick(600);
    expect(count).to.equal(0);
    // Account for jitter
    clock.tick(701);
    expect(count).to.equal(1);

    // Round 2
    backoff(increment);
    expect(count).to.equal(1);
    clock.tick(1200);
    expect(count).to.equal(1);
    clock.tick(1800);
    expect(count).to.equal(2);

    // Round 3
    backoff(increment);
    expect(count).to.equal(2);
    clock.tick(2200);
    expect(count).to.equal(2);
    clock.tick(3200);
    expect(count).to.equal(3);

    // 2nd independent backoff
    backoff2(increment);
    expect(count).to.equal(3);
    clock.tick(600);
    expect(count).to.equal(3);
    clock.tick(701);
    expect(count).to.equal(4);
  });

  it('should exponentiate correctly', () => {
    const backoff = exponentialBackoffClock();
    const backoff2 = exponentialBackoffClock();

    // base of 2 = 1000 - 300 (30% jitter) = 700
    expect(backoff()).to.equal(700);
    expect(backoff()).to.equal(1400);
    // tick backoff2
    expect(backoff2()).to.equal(700);
    // back to backoff
    expect(backoff()).to.equal(2800);
    expect(backoff()).to.equal(5600);
    expect(backoff()).to.equal(11200);
    expect(backoff()).to.equal(22400);

    expect(backoff2()).to.equal(1400);
    expect(backoff2()).to.equal(2800);
  });
});
