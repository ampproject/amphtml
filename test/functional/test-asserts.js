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

import {ASSERT_SENTINEL, assert, assertEnumValue, isAssertErrorMessage,
    userError} from '../../src/asserts';

describe('asserts', () => {

  it('should fail', () => {
    expect(function() {
      assert(false, 'xyz');
    }).to.throw(/xyz/);
    try {
      assert(false, '123');
    } catch (e) {
      expect(e.message).to.equal('123' + ASSERT_SENTINEL);
      return;
    }
    // Unreachable
    expect(false).to.be.true;
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
    const div = document.createElement('div');
    div.id = 'abc';
    div.textContent = 'foo';
    expect(function() {
      assert(false, 'should fail %s', div);
    }).to.throw(/should fail div#abc/);

    let error;
    try {
      assert(false, '%s a %s b %s', 1, 2, 3);
    } catch (e) {
      error = e;
    }
    expect(error).to.be.instanceof(Error);
    expect(error.message).to.equal('1 a 2 b 3' + ASSERT_SENTINEL);
    expect(error.messageArray).to.deep.equal([1, 'a', 2, 'b', 3]);
  });

  it('should add element and assert info', () => {
    const div = document.createElement('div');
    let error;
    try {
      assert(false, '%s a %s b %s', div, 2, 3);
    } catch (e) {
      error = e;
    }
    expect(error).to.be.instanceof(Error);
    expect(error.associatedElement).to.equal(div);
    expect(error.fromAssert).to.equal(true);
  });

  it('should recognize asserts', () => {
    try {
      assert(false, '123');
    } catch (e) {
      expect(isAssertErrorMessage(e.message)).to.be.true;
      return;
    }
    // Unreachable
    expect(false).to.be.true;
  });

  it('should recognize non-asserts', () => {
    try {
      throw new Error('123');
    } catch (e) {
      expect(isAssertErrorMessage(e.message)).to.be.false;
      return;
    }
    // Unreachable
    expect(false).to.be.true;
  });

  it('should create user errors', () => {
    expect(userError('test')).to.be.instanceof(Error);
    expect(isAssertErrorMessage(userError('test').message)).to.be.true;
    expect(userError('test').message).to.contain('test');
  });
});


describe('assertEnumValue', () => {

  it('should return the enum value', () => {
    const enum1 = {a: 'value1', b: 'value2'};
    expect(assertEnumValue(enum1, 'value1')).to.equal('value1');
    expect(assertEnumValue(enum1, 'value2')).to.equal('value2');
  });

  it('should fail with unknown enum value', () => {
    const enum1 = {a: 'value1', b: 'value2'};
    expect(() => assertEnumValue(enum1, 'value3'))
        .to.throw('Unknown enum value: "value3"');
    expect(() => assertEnumValue(enum1, 'value3', 'MyEnum'))
        .to.throw('Unknown MyEnum value: "value3"');
  });

  it('should fail with values of different case', () => {
    const enum1 = {a: 'value1', b: 'value2'};
    expect(() => assertEnumValue(enum1, 'VALUE1'))
        .to.throw('Unknown enum value: "VALUE1"');
  });
});
