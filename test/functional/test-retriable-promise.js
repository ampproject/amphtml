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

import {retriablePromise} from '../../src/retriable-promise';
import {timer} from '../../src/timer';

describe('retriablePromise', () => {

  let sandbox;
  let saveDelayFunc = timer.delay;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    timer.delay = null;
  });

  afterEach(() => {
    timer.delay = saveDelayFunc;
    sandbox.restore();
    sandbox = null;
  });

  it('success on first attempt', () => {
    let attemptCount = 0;
    return retriablePromise(() => {
      attemptCount++;
      return Promise.resolve('A');
    }, 2, 111, 2).then((result) => {
      expect(result).to.equal('A');
      expect(attemptCount).to.equal(1);
    });
  });

  it('fail first attempt and succeed the second attempt', () => {
    let lastTime = 0;
    timer.delay = (callback, time) => {
      lastTime = time;
      callback();
    };

    let attemptCount = 0;
    return retriablePromise(() => {
      attemptCount++;
      if (attemptCount == 1) {
        return Promise.reject('first attempt failed');
      }
      return Promise.resolve('A');
    }, 2, 111, 2).then((result) => {
      expect(result).to.equal('A');
      expect(attemptCount).to.equal(2);
      expect(lastTime).to.equal(111);
    });
  });

  it('fail two attempts and succeed the third attempt', () => {
    let lastTime = 0;
    timer.delay = (callback, time) => {
      lastTime = time;
      callback();
    };

    let attemptCount = 0;
    return retriablePromise(() => {
      attemptCount++;
      if (attemptCount == 1) {
        return Promise.reject('first attempt failed');
      }
      if (attemptCount == 2) {
        return Promise.reject('second attempt failed');
      }
      return Promise.resolve('A');
    }, 3, 111, 2).then((result) => {
      expect(result).to.equal('A');
      expect(attemptCount).to.equal(3);
      expect(lastTime).to.be.above(111);
      expect(lastTime).to.be.below(111 * 2 + 1);
    });
  });

  it('fail all attempts', () => {
    timer.delay = (callback, time) => {
      callback();
    };

    let attemptCount = 0;
    return retriablePromise(() => {
      attemptCount++;
      return Promise.reject('attempt ' + attemptCount + ' failed');
    }, 2, 111, 2).then((result) => {
      assert.fail('should not be here');
    }, () => {
      expect(attemptCount).to.equal(2);
    });
  });
});
