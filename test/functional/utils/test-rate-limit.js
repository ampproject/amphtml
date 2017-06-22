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

import {throttle, debounce} from '../../../src/utils/rate-limit';
import * as sinon from 'sinon';

describe('function utils', () => {
  describe('throttle', () => {
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
      const throttledCallback = throttle(window, callback, 100);

      throttledCallback(1);
      expect(callback).to.be.calledWith(1); // let 1st call through immediately
      callback.reset();

      clock.tick(20);
      throttledCallback(2);
      clock.tick(20);
      throttledCallback(3);
      clock.tick(20);
      throttledCallback(4);
      clock.tick(20);
      throttledCallback(5);
      clock.tick(19);
      expect(callback).not.to.be.called; // not 100ms yet

      clock.tick(1);
      expect(callback).to.be.calledOnce;
      expect(callback).to.be.calledWith(5);
      callback.reset();

      clock.tick(10);
      throttledCallback(6);
      expect(callback).not.to.be.called;
      clock.tick(89);
      throttledCallback(7, 'another param');
      expect(callback).not.to.be.called;
      clock.tick(1);
      expect(callback).to.be.calledOnce;
      expect(callback).to.be.calledWith(7, 'another param');
    });

    it('should throttle recursive callback', () => {
      let totalCalls = 0;
      function recursive(countdown) {
        totalCalls++;
        if (countdown > 0) {
          throttledCallback(countdown - 1);
        }
      }
      const throttledCallback = throttle(window, recursive, 100);

      // recursive 3 times
      throttledCallback(3);
      // should immediately invoke callback only once.
      expect(totalCalls).to.equal(1);
      // 2nd invocation happen after the min interval
      clock.tick(100);
      expect(totalCalls).to.equal(2);
      // 3rd invocation
      clock.tick(100);
      expect(totalCalls).to.equal(3);
    });
  });

  describe('debounce', () => {
    let sandbox;
    let clock;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      clock = sandbox.useFakeTimers();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should wait before calling', () => {
      const callback = sandbox.spy();
      const debounced = debounce(window, callback, 100);

      debounced(1);
      expect(callback).to.not.have.been.called;
      clock.tick(100);
      expect(callback).to.have.been.calledWith(1);

      callback.reset();
      debounced(1);
      expect(callback).to.not.have.been.called;
      debounced(2);
      expect(callback).to.not.have.been.called;
      clock.tick(10);
      debounced(3);
      expect(callback).to.not.have.been.called;
      clock.tick(99);
      expect(callback).to.not.have.been.called;
      clock.tick(1);
      expect(callback).to.have.been.calledWith(3);
    });

    it('should debounce recursive callback', () => {
      let totalCalls = 0;
      function recursive(countdown) {
        totalCalls++;
        if (countdown > 0) {
          debounced(countdown - 1);
        }
      }
      const debounced = debounce(window, recursive, 100);

      // recursive 3 times
      debounced(2);
      expect(totalCalls).to.equal(0);
      // 1st invocation happen after the min interval
      clock.tick(100);
      expect(totalCalls).to.equal(1);
      // 2nd invocation
      clock.tick(100);
      expect(totalCalls).to.equal(2);
    });
  });
});
