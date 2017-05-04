/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import * as PromiseUtils from '../../../src/utils/promise';

describes.sandboxed('PromiseUtils', {}, () => {

  function getPromiseObject() {
    let resolve, reject;
    const promise = new Promise((resolve_, reject_) => {
      resolve = resolve_;
      reject = reject_;
    });

    return {promise, resolve, reject};
  }

  describe('LastAddedResolver', () => {
    it('should resolve when its only promise resolves', () => {
      const one = getPromiseObject();
      const resolver = new PromiseUtils.LastAddedResolver();
      resolver.add(one.promise);

      setTimeout(() => one.resolve('one'), 0);

      return resolver.get().then(result => {
        expect(result).to.equal('one');
      });
    });

    it('should resolve when its last promise added resolves', () => {
      const one = getPromiseObject();
      const two = getPromiseObject();
      const firstResolver = new PromiseUtils.LastAddedResolver();
      firstResolver.add(one.promise);
      firstResolver.add(two.promise);

      setTimeout(() => one.resolve('one'), 0);
      setTimeout(() => two.resolve('two'), 10);

      const three = getPromiseObject();
      const four = getPromiseObject();
      const five = getPromiseObject();
      const secondResolver = new PromiseUtils.LastAddedResolver();
      secondResolver.add(three.promise);
      secondResolver.add(four.promise);
      secondResolver.add(five.promise);

      setTimeout(() => three.resolve('three'), 0);
      setTimeout(() => four.resolve('four'), 20);
      setTimeout(() => five.resolve('five'), 10);

      return Promise.all([
        firstResolver.get().then(result => {
          expect(result).to.equal('two');
        }),
        secondResolver.get().then(result => {
          expect(result).to.equal('five');
        }),
      ]);
    });

    it('should support adding initial promises in the constructor', () => {
      const one = getPromiseObject();
      const two = getPromiseObject();
      const resolver =
          new PromiseUtils.LastAddedResolver([one.promise, two.promise]);

      setTimeout(() => one.resolve('one'), 0);
      setTimeout(() => two.resolve('two'), 10);

      return resolver.get().then(result => {
        expect(result).to.equal('two');
      });
    });

    it('should reject when the first promise rejects', () => {
      const one = getPromiseObject();
      const two = getPromiseObject();
      const firstResolver = new PromiseUtils.LastAddedResolver();
      firstResolver.add(one.promise);
      firstResolver.add(two.promise);

      setTimeout(() => one.reject('one'), 0);
      setTimeout(() => two.resolve('two'), 10);

      const three = getPromiseObject();
      const four = getPromiseObject();
      const five = getPromiseObject();
      const secondResolver = new PromiseUtils.LastAddedResolver();
      secondResolver.add(three.promise);
      secondResolver.add(four.promise);
      secondResolver.add(five.promise);

      setTimeout(() => three.resolve('three'), 0);
      setTimeout(() => four.reject('four'), 10);
      setTimeout(() => five.resolve('five'), 20);

      return Promise.all([
        firstResolver.get().catch(error => {
          expect(error).to.equal('one');
        }),
        secondResolver.get().catch(error => {
          expect(error).to.equal('four');
        }),
      ]);
    });
  });
});
