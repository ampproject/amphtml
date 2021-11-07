import sinon from /*OK*/ 'sinon';

import {ControllerPromise} from '../../build-system/tasks/e2e/controller-promise';

/**
 * This is a unit test that is located with the E2E tests because it
 * only tests the E2E features itself. It is not written like other E2E tests
 * because it does not need a WebDriver instance and can run on Node only.
 */
describe('ControllerPromise', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Promise wrapping behavior', () => {
    it('should behave like a normal thenable', () => {
      const p = new ControllerPromise(Promise.resolve('success'));
      return p.then((result) => /*OK*/ expect(result).to.equal('success'));
    });

    it('should behave like a normal thenable with await', async () => {
      const p = new ControllerPromise(Promise.resolve('success'));
      await expect(await p).to.equal('success');
    });

    it('should accept calls to `then`', async () => {
      const p = new ControllerPromise(Promise.resolve(1));
      const two = p.then((x) => x + 1);

      const three = two.then((x) => x + 1);
      const four = two.then((x) => x + 2);

      await expect(await two).to.equal(2);
      await expect(await three).to.equal(3);
      await expect(await four).to.equal(4);
    });

    it('should allow empty `then` calls', async () => {
      const p = new ControllerPromise(Promise.resolve(1));
      const two = p.then(null).then((x) => x + 1);

      const three = two.then((x) => x + 1);
      const four = two.then((x) => x + 2);

      await expect(await two).to.equal(2);
      await expect(await three).to.equal(3);
      await expect(await four).to.equal(4);
    });

    it('should accept calls to `catch`', async () => {
      const catchSpy = sandbox.spy();
      const errorObject = {};
      const p = new ControllerPromise(Promise.reject(errorObject));

      await p.catch(catchSpy);

      /*OK*/ expect(catchSpy.calledOnce).to.be.true;
      /*OK*/ expect(catchSpy.calledWith(errorObject)).to.be.true;
    });

    it('should accept a second parameter for `then`', async () => {
      const thenSpy = sandbox.spy();
      const thenCatchSpy = sandbox.spy();
      const onlyCatchSpy = sandbox.spy();
      const errorObject = {};

      const p = new ControllerPromise(Promise.reject(errorObject));
      await p.then(thenSpy, thenCatchSpy);
      await p.then(null, onlyCatchSpy);

      /*OK*/ expect(thenSpy.called).to.be.false;
      /*OK*/ expect(thenCatchSpy.calledOnce).to.be.true;
      /*OK*/ expect(thenCatchSpy.calledWith(errorObject)).to.be.true;
      /*OK*/ expect(onlyCatchSpy.calledOnce).to.be.true;
      /*OK*/ expect(onlyCatchSpy.calledWith(errorObject)).to.be.true;
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

      /*OK*/ expect(catchSpy.calledOnce).to.be.true;
      /*OK*/ expect(finallySpy.calledOnce).to.be.true;
    });

    it('should accept resolved calls to `finally`', async () => {
      const finallySpy = sandbox.spy();
      const thenSpy = sandbox.spy();
      const successObject = {};
      const resolvedControllerPromise = new ControllerPromise(
        Promise.resolve(successObject)
      );

      await resolvedControllerPromise.then(thenSpy).finally(finallySpy);

      /*OK*/ expect(thenSpy.calledWith(successObject)).to.be.true;
      /*OK*/ expect(finallySpy.calledOnce).to.be.true;
    });

    it('should pass errors beyond `finally` to `catch` blocks', async () => {
      const finallySpy = sandbox.spy();
      const catchSpy = sandbox.spy();
      const failureObject = {};
      const rejectedControllerPromise = new ControllerPromise(
        Promise.reject(failureObject)
      );

      await rejectedControllerPromise.finally(finallySpy).catch(catchSpy);

      /*OK*/ expect(finallySpy.calledOnce).to.be.true;
      /*OK*/ expect(catchSpy.calledWith(failureObject)).to.be.true;
    });

    it('should accept long then chains', async () => {
      const p = new ControllerPromise(Promise.resolve(1));
      const two = p.then((x) => x + 1);

      const three = two.then((x) => x + 1).then((x) => 'hello world ' + x);

      /*OK*/ expect(await three).to.equal('hello world 3');
    });
  });

  describe('retryable behavior', () => {
    it('should allow promises to be retryable', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(getValueFunction)
      );

      /*OK*/ expect(await p).to.equal(0);
      /*OK*/ expect(await p.waitForValue((x) => x == 5)).to.equal(5);
      /*OK*/ expect(await p).to.equal(0);
    });

    it('should allow retryable promises to be then-ed once', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(getValueFunction)
      );
      const testP = p.then((x) => (x + 1) * 2);

      /*OK*/ expect(await testP).to.equal(2);
      /*OK*/ expect(await testP.waitForValue((x) => x == 12)).to.equal(12);
      /*OK*/ expect(await testP).to.equal(2);
    });

    it('should allow retryable promises to be then-ed more than once', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(getValueFunction)
      );
      const testP = p.then((x) => (x + 1) * 2).then((x) => x + 1);

      /*OK*/ expect(await testP).to.equal(3);
      /*OK*/ expect(await testP.waitForValue((x) => x == 13)).to.equal(13);
      /*OK*/ expect(await testP).to.equal(3);
    });

    it('should reject on failure and not allow retrying', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(getErrorFunction)
      );
      const testP = p.then((x) => (x + 1) * 2).then((x) => x + 1);

      /*OK*/ expect(await testP).to.equal(3);
      /*OK*/ expect(await testP.waitForValue((x) => x == 7)).to.equal(7);

      return testP
        .waitForValue((x) => x == 11)
        .then(
          () => {
            throw new Error('should not succeed');
          },
          (e) => {
            /*OK*/ expect(e).to.be.an('error');
            return testP.waitForValue((x) => x == 13);
          }
        )
        .then(
          () => {
            throw new Error('should not succeed');
          },
          (e) => {
            /*OK*/ expect(e).to.be.an('error');
          }
        );
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
      errorFunction.rejects();
      errorFunction
        .onCall(0)
        .resolves(0)
        .onCall(1)
        .resolves(1)
        .onCall(2)
        .resolves(2)
        .onCall(3)
        .resolves(3);
      return errorFunction;
    }

    /**
     * Simulate the WebDriver polling functionality to get the latest value
     * and mutate it with any `then` blocks that have been chained to the
     * ControllerPromise.
     * See {@link ../../build-system/tasks/e2e/expect.js} for real usage
     * @param {function(): function():(!Promise<T>|T)}
     * @template T
     */
    function getWaitFunction(valueFunctionGetter) {
      return (conditionFn, opt_mutate) => {
        /**
         * Each call to `waitForValue` gets its own value function thunk.
         * This simulates the value returned by a WebDriver framework for
         * a request for a value e.g. from the DOM.
         * See {@link ../../build-system/tasks/e2e/selenium-webdriver-controller.js#getElementText}
         */
        const valueFunction = valueFunctionGetter();

        opt_mutate = opt_mutate || ((x) => x);
        return new Promise((resolve, reject) => {
          /**
           * Poll for the new value.
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
             * This resolves the promise that the Chai wrapper `expect.js` awaits.
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
