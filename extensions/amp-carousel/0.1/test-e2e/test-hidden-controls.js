describes.endtoend(
  'AMP carousel 0.1 buttons with hidden controls',
  {
    fixture: 'amp-carousel/0.1/hidden-controls.amp.html',
    experiments: ['amp-carousel'],
    environments: ['single'],
  },
  async function (env) {
    /**
     * A helper function for expecting an error from an async function since we
     * don't have ChaiAsExpected and we cannot wait for errors from
     * @param {function()} fn A function to run
     * @param {RegExp} regExp A regular expression to match the error message.
     */
    async function expectAysncError(fn, regExp) {
      let error;

      try {
        await fn();
      } catch (e) {
        error = e;
      } finally {
        await expect(error, 'Expected an error to be thrown.').to.not.be
          .undefined;
        await expect(error.toString()).to.match(regExp);
      }
    }

    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should not go to the next slide', async () => {
      const nextArrow = await controller.findElement(
        '.amp-carousel-button-next'
      );

      // The test driver should throw an error, since the element is not
      // clickable.
      // TODO(sparhami) Ideally we would do something like:
      // `await expect(() => controller.click(nextArrow)).to.throw();`, but
      // that  does not work for a few reasons, including:
      // * Click does not return a ControllerPromise
      // * ControllerPromise uses a Promise rejection to singal it is not done
      //   yet. The wrapper logic would need to be modified to allow for an
      //   expected error type or message to sort circuit the waiting, allowing
      //   use of something like:
      //   ```
      //   await expect(() => controller.click(nextArrow))
      //      .to.throw(/ElementClickInterceptedError/);
      //   ```
      expectAysncError(
        () => controller.click(nextArrow),
        /ElementClickInterceptedError/
      );
    });
  }
);
