/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {duplicateErrorIfNecessary, rethrowAsync} from '../../../src/core/error';
import {isUserErrorMessage, user} from '../../../src/log';

describes.sandboxed('errors', {}, (env) => {
  describe('rethrowAsync', () => {
    let clock;

    beforeEach(() => {
      clock = env.sandbox.useFakeTimers();
      restoreAsyncErrorThrows();
    });

    afterEach(() => {
      stubAsyncErrorThrows();
    });

    it('should rethrow error with single message', () => {
      rethrowAsync('intended');
      expect(() => {
        clock.tick(1);
      }).to.throw(Error, /^intended/);
    });

    it('should rethrow a single error', () => {
      const orig = new Error('intended');
      rethrowAsync(orig);
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error).to.equal(orig);
      expect(error.message).to.match(/^intended/);
    });

    it('should rethrow error with many messages', () => {
      rethrowAsync('first', 'second', 'third');
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error.message).to.match(/^first second third/);
    });

    it('should rethrow error with original error and messages', () => {
      const orig = new Error('intended');
      rethrowAsync('first', orig, 'second', 'third');
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error).to.equal(orig);
      expect(error.message).to.match(/^first second third: intended/);
    });

    it('should preserve error suffix', () => {
      const orig = user().createError('intended');
      expect(isUserErrorMessage(orig.message)).to.be.true;
      rethrowAsync('first', orig, 'second');
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error).to.equal(orig);
      expect(isUserErrorMessage(error.message)).to.be.true;
    });
  });

  describe('duplicateErrorIfNecessary', () => {
    it('should not duplicate if message is writeable', () => {
      const error = {message: 'test'};

      expect(duplicateErrorIfNecessary(error)).to.equal(error);
    });

    it('should duplicate if message is non-writable', () => {
      const error = {};
      Object.defineProperty(error, 'message', {
        value: 'test',
        writable: false,
      });

      expect(duplicateErrorIfNecessary(error)).to.not.equal(error);
    });

    it('copies all the tidbits', () => {
      const error = {
        stack: 'stack',
        args: [1, 2, 3],
        associatedElement: error,
      };

      Object.defineProperty(error, 'message', {
        value: 'test',
        writable: false,
      });

      const duplicate = duplicateErrorIfNecessary(error);
      expect(duplicate.stack).to.equal(error.stack);
      expect(duplicate.args).to.equal(error.args);
      expect(duplicate.associatedElement).to.equal(error.associatedElement);
    });
  });
});
