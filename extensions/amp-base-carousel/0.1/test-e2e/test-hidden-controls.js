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

import {getNextArrow} from './helpers';

describes.endtoend(
  'AMP carousel arrows with hidden controls',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/hidden-controls.amp.html',
    experiments: ['amp-base-carousel'],
    environments: ['single'],
  },
  async function (env) {
    /**
     * A helper function for expecting an error from an async function since we
     * don't have ChaiAsExpected and we cannot wait for errors from
     * @param {function()} fn A function to run
     * @param {!RegExp} regExp A regular expression to match the error message.
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

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should not go to the next slide', async () => {
      const nextArrow = await getNextArrow(controller);

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
