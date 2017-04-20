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

import {rateLimit} from '../../../src/utils/rate-limit';
import * as sinon from 'sinon';

describe('rate-limit', () => {

  let sandbox;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should work', () => {
    const callback = sandbox.spy();
    const rateLimitedCallback = rateLimit(window, callback, 100);

    rateLimitedCallback(1);
    expect(callback).to.be.calledWith(1); // let 1st call through immediately
    callback.reset();

    clock.tick(20);
    rateLimitedCallback(2);
    clock.tick(20);
    rateLimitedCallback(3);
    clock.tick(20);
    rateLimitedCallback(4);
    clock.tick(20);
    rateLimitedCallback(5);
    clock.tick(19);
    expect(callback).not.to.be.called; // not 100ms yet

    clock.tick(1);
    expect(callback).to.be.calledOnce;
    expect(callback).to.be.calledWith(5);
    callback.reset();

    clock.tick(10);
    rateLimitedCallback(6);
    expect(callback).not.to.be.called;
    clock.tick(89);
    rateLimitedCallback(7, 'another param');
    expect(callback).not.to.be.called;
    clock.tick(1);
    expect(callback).to.be.calledOnce;
    expect(callback).to.be.calledWith(7, 'another param');
  });

  it('is re-entrant', () => {
    let calls = 0;
    let rateLimitedCallback;
    function fn(call) {
      if (calls++ < 1) {
        rateLimitedCallback(calls);
      }
      expect(call + 1).to.equal(calls);
    }
    rateLimitedCallback = rateLimit(window, fn, 100);

    rateLimitedCallback(calls);
    expect(calls).to.equal(1);

    clock.tick(100);
    expect(calls).to.equal(2);
  });
});
