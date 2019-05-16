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

import {
  camelCaseToDash,
  dashToCamelCase,
  endsWith,
  expandTemplate,
  includes,
} from '../../src/string';

describe('dashToCamelCase', () => {
  it('should transform dashes to camel case.', () => {
    expect(dashToCamelCase('foo')).to.equal('foo');
    expect(dashToCamelCase('foo-bar')).to.equal('fooBar');
    expect(dashToCamelCase('foo-bar-baz')).to.equal('fooBarBaz');
    expect(dashToCamelCase('-foo')).to.equal('Foo');
  });
});

describe('endsWith', () => {
  it('should determine whether string ends with.', () => {
    expect(endsWith('a', 'a')).to.be.true;
    expect(endsWith('b', 'a')).to.be.false;
    expect(endsWith('ab', 'a')).to.be.false;
    expect(endsWith('aba', 'a')).to.be.true;
    expect(endsWith('aba', 'aba')).to.be.true;
    expect(endsWith('Xaba', 'aba')).to.be.true;
    expect(endsWith('Xaba', '')).to.be.true;
    expect(endsWith('', 'a')).to.be.false;
    expect(endsWith('aa', 'aaa')).to.be.false;
    expect(endsWith('aa', 'aaaa')).to.be.false;
    expect(endsWith('', '')).to.be.true;
  });
});

describe('includes', () => {
  it('should determine whether string includes.', () => {
    expect(includes('a', 'a')).to.be.true;
    expect(includes('a', 'a', 0)).to.be.true;
    expect(includes('a', 'a', 1)).to.be.false;
    expect(includes('b', 'a')).to.be.false;
    expect(includes('ab', 'a')).to.be.true;
    expect(includes('aba', 'a')).to.be.true;
    expect(includes('aba', 'aba')).to.be.true;
    expect(includes('Xaba', 'aba')).to.be.true;
    expect(includes('Xaba', '')).to.be.true;
    expect(includes('', 'a')).to.be.false;
    expect(includes('aa', 'aaa')).to.be.false;
    expect(includes('aa', 'aaaa')).to.be.false;
    expect(includes('', '')).to.be.true;
  });
});

describe('expandTemplate', () => {
  const data = {
    'x': 'Test 1',
    'y': 'Test 2',
    'test': 'test value',
    'test2': 'another test value',
    'tox': '${x}',
    'toy': '${y}',
    'toxy': '${x}${y}',
    'totoxy': '${toxy}',
    'loop1': '${loop2}',
    'loop2': '${loop1}',
    'loop': '${loop}',
  };

  function testGetter(key) {
    return data[key] || 'not found';
  }

  it('should replace place holders with values.', () => {
    expect(expandTemplate('${x}', testGetter)).to.equal('Test 1');
    expect(expandTemplate('${y}', testGetter)).to.equal('Test 2');
    expect(expandTemplate('${x} ${y}', testGetter)).to.equal('Test 1 Test 2');
    expect(expandTemplate('a${x}', testGetter)).to.equal('aTest 1');
    expect(expandTemplate('${x}a', testGetter)).to.equal('Test 1a');
    expect(expandTemplate('a${x}a', testGetter)).to.equal('aTest 1a');
    expect(expandTemplate('${unknown}', testGetter)).to.equal('not found');
  });

  it('should handle malformed place holders.', () => {
    expect(expandTemplate('${x', testGetter)).to.equal('${x');
    expect(expandTemplate('${', testGetter)).to.equal('${');
    expect(expandTemplate('$x}', testGetter)).to.equal('$x}');
    expect(expandTemplate('$x', testGetter)).to.equal('$x');
    expect(expandTemplate('{x}', testGetter)).to.equal('{x}');
    expect(expandTemplate('${{x}', testGetter)).to.equal('not found');
  });

  it('should default to one iteration.', () => {
    expect(expandTemplate('${tox}', testGetter)).to.equal('${x}');
    expect(expandTemplate('${toxy}', testGetter)).to.equal('${x}${y}');
  });

  it('should handle multiple iterations when asked to.', () => {
    expect(expandTemplate('${tox}', testGetter, 2)).to.equal('Test 1');
    expect(expandTemplate('${toxy}', testGetter, 2)).to.equal('Test 1Test 2');
    expect(expandTemplate('${totoxy}', testGetter, 2)).to.equal('${x}${y}');
    expect(expandTemplate('${totoxy}', testGetter, 3)).to.equal('Test 1Test 2');
    expect(expandTemplate('${totoxy}', testGetter, 10)).to.equal(
      'Test 1Test 2'
    );
  });

  it('should handle circular expansions without hanging', () => {
    expect(expandTemplate('${loop}', testGetter)).to.equal('${loop}');
    expect(expandTemplate('${loop}', testGetter), 10).to.equal('${loop}');
    expect(expandTemplate('${loop1}', testGetter), 10).to.equal('${loop2}');
  });
});

describe('camelCaseToDash', () => {
  it('should convert camelCase strings to dash-case strings', () => {
    expect(camelCaseToDash('foo')).to.equal('foo');
    expect(camelCaseToDash('fooBar')).to.equal('foo-bar');
    expect(camelCaseToDash('fooBarBaz')).to.equal('foo-bar-baz');
    // Not really valid camel case
    expect(camelCaseToDash('FooBarBaz')).to.equal('Foo-bar-baz');
    expect(camelCaseToDash('f00B4rB4z')).to.equal('f00-b4r-b4z');
    expect(camelCaseToDash('f00b4rb4z')).to.equal('f00b4rb4z');
    expect(camelCaseToDash('ABC')).to.equal('A-b-c');
    expect(camelCaseToDash('aBC')).to.equal('a-b-c');
  });
});
