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
      const catchSpy = sandbox.spy();
      const errorObject = {};
      const p = new ControllerPromise(Promise.reject(errorObject));

      await p.catch(catchSpy);

      expect(catchSpy).to.have.been.calledOnce;
      expect(catchSpy).to.have.been.calledWith(errorObject);
    });

    it('should accept a second parameter for `then`', async () => {
      const thenSpy = sandbox.spy();
      const thenCatchSpy = sandbox.spy();
      const onlyCatchSpy = sandbox.spy();
      const errorObject = {};

      const p = new ControllerPromise(Promise.reject(errorObject));
      await p.then(thenSpy, thenCatchSpy);
      await p.then(null, onlyCatchSpy);

      expect(thenSpy).to.not.have.been.called;
      expect(thenCatchSpy).to.have.been.calledOnce;
      expect(thenCatchSpy).to.have.been.calledWith(errorObject);
      expect(onlyCatchSpy).to.have.been.calledOnce;
      expect(onlyCatchSpy).to.have.been.calledWith(errorObject);
    });

    it('should accept rejected calls to `finally`', async () => {
      const catchSpy = sandbox.spy();
      const finallySpy = sandbox.spy();
      const failureObject = {};
      const rejectedControllerPromise = new ControllerPromise(
        Promise.reject(failureObject)
      );

      // The catch in this line prevents Promise.reject from breaking the test
      await rejectedControllerPromise.catch(catchSpy).finally(finallySpy);

      expect(catchSpy).to.have.been.calledOnce;
      expect(finallySpy).to.have.been.calledOnce;
    });

    it('should accept resolved calls to `finally`', async () => {
      const finallySpy = sandbox.spy();
      const thenSpy = sandbox.spy();
      const successObject = {};
      const resolvedControllerPromise = new ControllerPromise(
        Promise.resolve(successObject)
      );

      await resolvedControllerPromise.then(thenSpy).finally(finallySpy);

      expect(thenSpy).to.have.been.calledWith(successObject);
      expect(finallySpy).to.have.been.calledOnce;
    });

    it('should pass errors beyond `finally` to `catch` blocks', async () => {
      const finallySpy = sandbox.spy();
      const catchSpy = sandbox.spy();
      const failureObject = {};
      const rejectedControllerPromise = new ControllerPromise(
        Promise.reject(failureObject)
      );

      await rejectedControllerPromise.finally(finallySpy).catch(catchSpy);

      expect(finallySpy).to.have.been.calledOnce;
      expect(catchSpy).to.have.been.calledWith(failureObject);
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
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(getValueFunction)
      );

      expect(await p).to.equal(0);
      expect(await p.waitForValue(x => x == 5)).to.equal(5);
      expect(await p).to.equal(0);
    });

    it('should allow retryable promises to be then-ed once', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(getValueFunction)
      );
      const testP = p.then(x => (x + 1) * 2);

      expect(await testP).to.equal(2);
      expect(await testP.waitForValue(x => x == 12)).to.equal(12);
      expect(await testP).to.equal(2);
    });

    it('should allow retryable promises to be then-ed more than once', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(getValueFunction)
      );
      const testP = p.then(x => (x + 1) * 2).then(x => x + 1);

      expect(await testP).to.equal(3);
      expect(await testP.waitForValue(x => x == 13)).to.equal(13);
      expect(await testP).to.equal(3);
    });

    it('should reject on failure and not allow retrying', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(getErrorFunction)
      );
      const testP = p.then(x => (x + 1) * 2).then(x => x + 1);

      expect(await testP).to.equal(3);
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
     * Returns a method that resolves the numbers 0 through 6.
     * @return {function():!Promise<number>}
     */
    function getValueFunction() {
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

      return valueFunction;
    }

    /**
     * Returns a method that rejects on its fourth call.
     * @return {function():!Promise<number>}
     */
    function getErrorFunction() {
      const errorFunction = sandbox.stub();
      errorFunction.returns(6);
      errorFunction
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

      return errorFunction;
    }

    /**
     * Simulate the WebDriver polling functionality to get the latest value
     * and mutate it with any `then` blocks that have been chained to the
     * ControllerPromise.
     * See {@link ../../build-system/tasks/e2e/expect.js} for real usage
     */
    function getWaitFunction(valueFunctionGetter) {
      return (conditionFn, opt_mutate) => {
        /**
         * Each call to `waitForValue` gets its own value function.
         * This simulates the value returned by a WebDriver framework for
         * a request for a value e.g. from the DOM.
         * See {@link ../../build-system/tasks/e2e/selenium-webdriver-controller.js#getElementText}
         */
        const valueFunction = valueFunctionGetter();

        opt_mutate = opt_mutate || (x => x);
        return new Promise((resolve, reject) => {
          /**
           * Poll for the new value. This simulates behavior in the concrete
           * implementations of the `FunctionalTestController` implementations.
           * See {@link ../../build-system/tasks/e2e/selenium-webdriver-controller.js#getWaitFn_}
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
