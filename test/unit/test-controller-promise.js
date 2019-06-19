/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {ControllerPromise} from '../../build-system/tasks/e2e/controller-promise';

// Since this is designed to run in Node we don't need to run it
// on the full set of sauce labs browsers
const config = describe.configure().ifChrome();
config.run('ControllerPromise', () => {
  describe('Promise wrapping behavior', () => {
    it('should behave like a normal thenable', () => {
      const p = new ControllerPromise(Promise.resolve('success'));
      return p.then(result => expect(result).to.equal('success'));
    });

    it('should behave like a normal thenable with await', async () => {
      const p = new ControllerPromise(Promise.resolve('success'));
      await expect(await p).to.equal('success');
    });

    it('should accept calls to `then`', async () => {
      const p = new ControllerPromise(Promise.resolve(1));
      const two = p.then(x => x + 1);

      const three = two.then(x => x + 1);
      const four = two.then(x => x + 2);

      await expect(await two).to.equal(2);
      await expect(await three).to.equal(3);
      await expect(await four).to.equal(4);
    });

    it('should allow empty `then` calls', async () => {
      const p = new ControllerPromise(Promise.resolve(1));
      const two = p.then(null).then(x => x + 1);

      const three = two.then(x => x + 1);
      const four = two.then(x => x + 2);

      await expect(await two).to.equal(2);
      await expect(await three).to.equal(3);
      await expect(await four).to.equal(4);
    });

    it('should accept calls to `catch`', async () => {
      const p = new ControllerPromise(Promise.reject('failure'));
      p.then(() => {
        throw new Error('should not happen');
      });
      return p.catch(e => {
        expect(e).to.equal('failure');
      });
    });

    it('should accept a second parameter for `then`', async () => {
      const p = new ControllerPromise(Promise.reject('failure'));
      p.then(() => {
        throw new Error('should not happen');
      });
      return p.then(null, e => {
        expect(e).to.equal('failure');
      });
    });

    it('should accept calls to `finally`', () => {
      const rejectedControllerPromise = new ControllerPromise(
        Promise.reject('failure')
      );
      const rejectedFinallyPromise = new Promise(resolve => {
        rejectedControllerPromise.finally(() => resolve('success'));
      });

      const resolvedControllerPromise = new ControllerPromise(
        Promise.reject('failure')
      );
      const resolvedFinallyPromise = new Promise(resolve => {
        resolvedControllerPromise.finally(() => resolve('success'));
      });

      return Promise.all([
        expect(rejectedFinallyPromise).to.eventually.equal('success'),
        expect(resolvedFinallyPromise).to.eventually.equal('success'),
      ]);
    });

    it('should accept long then chains', async () => {
      const p = new ControllerPromise(Promise.resolve(1));
      const two = p.then(x => x + 1);

      const three = two.then(x => x + 1).then(x => 'hello world ' + x);

      expect(await three).to.equal('hello world 3');
    });
  });

  describe('retryable behavior', () => {
    it('should allow promises to be retryable', async () => {
      const valueFunction = sandbox.stub();
      valueFunction.resolves(6);
      valueFunction
        .onCall(0)
        .resolves(0)
        .onCall(1)
        .resolves(1)
        .onCall(2)
        .resolves(2)
        .onCall(3)
        .resolves(3)
        .onCall(4)
        .resolves(4)
        .onCall(5)
        .resolves(5);

      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(valueFunction)
      );

      expect(await p).to.equal(0);
      expect(await p.waitForValue(x => x == 1)).to.equal(1);
      expect(await p.waitForValue(x => x == 2)).to.equal(2);
      expect(await p.waitForValue(x => x == 3)).to.equal(3);
      expect(await p.waitForValue(x => x == 4)).to.equal(4);
      expect(await p.waitForValue(x => x == 5)).to.equal(5);
      expect(await p).to.equal(0);
    });

    it('should allow retryable promises to be then-ed once', async () => {
      const valueFunction = sandbox.stub();
      valueFunction.returns(6);
      valueFunction
        .onCall(0)
        .resolves(0)
        .onCall(1)
        .resolves(1)
        .onCall(2)
        .resolves(2)
        .onCall(3)
        .resolves(3)
        .onCall(4)
        .resolves(4)
        .onCall(5)
        .resolves(5);

      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(valueFunction)
      );
      const testP = p.then(x => (x + 1) * 2);

      expect(await testP).to.equal(2);
      expect(await testP.waitForValue(x => x == 4)).to.equal(4);
      expect(await testP.waitForValue(x => x == 6)).to.equal(6);
      expect(await testP.waitForValue(x => x == 8)).to.equal(8);
      expect(await testP.waitForValue(x => x == 10)).to.equal(10);
      expect(await testP.waitForValue(x => x == 12)).to.equal(12);
      expect(await testP).to.equal(2);
    });

    it('should allow retryable promises to be then-ed more than once', async () => {
      const valueFunction = sandbox.stub();
      valueFunction.resolves(6);
      valueFunction
        .onCall(0)
        .resolves(0)
        .onCall(1)
        .resolves(1)
        .onCall(2)
        .resolves(2)
        .onCall(3)
        .resolves(3)
        .onCall(4)
        .resolves(4)
        .onCall(5)
        .resolves(5);

      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(valueFunction)
      );
      const testP = p.then(x => (x + 1) * 2).then(x => x + 1);

      expect(await testP).to.equal(3);
      expect(await testP.waitForValue(x => x == 5)).to.equal(5);
      expect(await testP.waitForValue(x => x == 7)).to.equal(7);
      expect(await testP.waitForValue(x => x == 9)).to.equal(9);
      expect(await testP.waitForValue(x => x == 11)).to.equal(11);
      expect(await testP.waitForValue(x => x == 13)).to.equal(13);
      expect(await testP).to.equal(3);
    });

    it('should reject on failure and not allow retrying', async () => {
      const valueFunction = sandbox.stub();
      valueFunction.returns(6);
      valueFunction
        .onCall(0)
        .resolves(0)
        .onCall(1)
        .resolves(1)
        .onCall(2)
        .resolves(2)
        .onCall(3)
        .resolves(3)
        .onCall(4)
        .rejects('failure');

      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(valueFunction)
      );
      const testP = p.then(x => (x + 1) * 2).then(x => x + 1);

      expect(await testP).to.equal(3);
      expect(await testP.waitForValue(x => x == 5)).to.equal(5);
      expect(await testP.waitForValue(x => x == 7)).to.equal(7);
      expect(testP.waitForValue(x => x == 9)).to.eventually.be.rejectedWith(
        'failure'
      );
      expect(testP.waitForValue(x => x == 5)).to.eventually.be.rejectedWith(
        'failure'
      );
      expect(await testP).to.equal(3);
    });

    /**
     * Simulate the WebDriver polling functionality to get the latest value
     * and mutate it with any `then` blocks that have been chained to the
     * ControllerPromise.
     * See {@link ../../build-system/tasks/e2e/expect.js} for real usage
     */
    function getWaitFunction(valueFunction) {
      return (conditionFn, opt_mutate) => {
        opt_mutate = opt_mutate || (x => x);
        return new Promise((resolve, reject) => {
          /**
           * Poll for the new value. This simulates behavior in the concrete
           * implementations of the FunctionalTestController implementations.
           * See {@link build-system/tasks/e2e/selenium-webdriver-controller.js#getWaitFn_}
           */
          const id = setInterval(async () => {
            let value;
            try {
              value = await opt_mutate(await valueFunction());
            } catch (e) {
              clearInterval(id);
              reject(e);
              return;
            }

            /**
             * This simulates behavior in the Chai wrapper `expect.js`
             * The condition is passed in by the expectations and it
             * stops polling when the condition matches.
             * See {@link ../../build-system/tasks/e2e/expect.js#valueSatisfiesExpectation}
             */
            if (conditionFn(value)) {
              clearInterval(id);
              resolve(value);
            }
          }, 4);
        });
      };
    }
  });
});
