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

import {assert} from '../../src/asserts';

describe('asserts', () => {

  it('should fail', () => {
    expect(function() {
      assert(false, 'xyz');
    }).to.throw(/xyz/);
  });

  it('should not fail', () => {
    assert(true, 'True!');
    assert(1, '1');
    assert('abc', 'abc');
  });

  it('should substitute', () => {
    expect(function() {
      assert(false, 'should fail %s', 'XYZ');
    }).to.throw(/should fail XYZ/);
    expect(function() {
      assert(false, 'should fail %s %s', 'XYZ', 'YYY');
    }).to.throw(/should fail XYZ YYY/);
    var div = document.createElement('div');
    div.id = 'abc';
    div.textContent = 'foo';
    expect(function() {
      assert(false, 'should fail %s', div);
    }).to.throw(/should fail div#abc/);

    var error;
    try {
      assert(false, '%s a %s b %s', 1, 2, 3);
    } catch (e) {
      error = e;
    }
    expect(error).to.be.instanceof(Error);
    expect(error.message).to.equal('1 a 2 b 3');
    expect(error.messageArray).to.deep.equal([1, 'a', 2, 'b', 3]);
  });
});
