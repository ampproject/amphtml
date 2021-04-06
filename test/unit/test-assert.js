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

import {USER_ERROR_SENTINEL} from '../../src/core/error-message-helpers';
import {
  pureDevAssert as devAssert,
  pureUserAssert as userAssert,
} from '../../src/core/assert';

describes.sandboxed('assertions', {}, () => {
  describe('devAssert', () => {
    it('should not fail for truthy values', () => {
      devAssert(true, 'True!');
      devAssert(1, '1');
      devAssert('abc', 'abc');
    });

    it('should fail for falsey values dev', () => {
      expect(() => devAssert(false, 'xyz')).to.throw('xyz');
      expect(() => userAssert(false, '123')).to.throw(
        `123${USER_ERROR_SENTINEL}`
      );
    });
  });

  describe('userAssert', () => {
    it('should not fail for truthy values', () => {
      userAssert(true, 'True!');
      userAssert(1, '1');
      userAssert('abc', 'abc');
    });

    it('should fail for falsey values dev', () => {
      expect(() => userAssert(false, 'xyz')).to.throw(
        `xyz${USER_ERROR_SENTINEL}`
      );
    });
  });

  it('should substitute', () => {
    expect(() => devAssert(false, 'should fail %s', 'XYZ')).to.throw(
      'should fail XYZ'
    );
    expect(() => devAssert(false, 'should fail %s %s', 'XYZ', 'YYY')).to.throw(
      'should fail XYZ YYY'
    );
    expect(() => userAssert(false, '%s a %s b %s', 1, 2, 3)).to.throw(
      `1 a 2 b 3${USER_ERROR_SENTINEL}`
    );
  });

  it('should add element and message info', () => {
    const div = document.createElement('div');
    div.id = 'testId';
    let error;
    try {
      devAssert(false, '%s a %s b %s', div, 2, 3);
    } catch (e) {
      error = e;
    }

    expect(error.toString()).to.match(/div#testId a 2 b 3/);
    expect(error.associatedElement).to.equal(div);
    expect(error.messageArray).to.deep.equal([div, 2, 3]);
  });
});
