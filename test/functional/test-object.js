/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import * as object from '../../src/utils/object';

describe('Object', () => {
  it('hasOwn works', () => {
    expect(object.hasOwn(object.map(), 'a')).to.be.false;
    expect(object.hasOwn(object.map({'a': 'b'}), 'b')).to.be.false;
    expect(object.hasOwn(object.map({'a': {}}), 'a')).to.be.true;
  });

  describe('map', () => {
    it('should make map like objects', () => {
      expect(object.map().prototype).to.be.undefined;
      expect(object.map().__proto__).to.be.undefined;
      expect(object.map().toString).to.be.undefined;
    });

    it('should make map like objects from objects', () => {
      expect(object.map({}).prototype).to.be.undefined;
      expect(object.map({}).__proto__).to.be.undefined;
      expect(object.map({}).toString).to.be.undefined;
      expect(object.map({foo: 'bar'}).foo).to.equal('bar');
      const obj = {foo: 'bar', test: 1};
      expect(object.map(obj).test).to.equal(1);
      expect(object.map(obj)).to.not.equal(obj);
    });
  });

  describe('getPath', () => {
    const obj = {a: {aa: [{aaa: 1}, {bbb: 2}]}, b: 3};

    it('should return the value of a single property', () => {
      expect(object.getPath('b', obj)).to.equal(3);
    });

    it('should return the value of a deeply nested property', () => {
      expect(object.getPath('a.aa[0].aaa', obj)).to.equal(1);
    });

    it('should return the value of a sub-object', () => {
      expect(object.getPath('a.aa', obj)).to.jsonEqual(obj.a.aa);
    });
  });

  describe('sortProperties', () => {
    it('should sort an object\'s properties alphabetically', () => {
      const unsorted = {z: 0, y: 1, x: 2, w: 3};
      const sorted = {w: 3, x: 2, y: 1, z: 0};

      const testSorted = JSON.stringify(object.sortProperties(unsorted));
      const expectedSorted = JSON.stringify(sorted);
      expect(testSorted).to.equal(expectedSorted);
      expect(object.sortProperties({})).to.deep.equal({});
    });

    it('should deep sort all nested objects\' properties', () => {
      const unsorted = {z: 0, y: 1, x: 2, w: {c: 3, b: 4, a: {e: 6, d: 5}}};
      const sorted = {w: {a: {d: 5, e: 6}, b: 4, c: 3}, x: 2, y: 1, z: 0};

      const testSorted = JSON.stringify(object.sortProperties(unsorted));
      const expectedSorted = JSON.stringify(sorted);
      expect(testSorted).to.equal(expectedSorted);
    });

    it('should return the input value for non-objects', () => {
      const identity = x => x;

      expect(object.sortProperties(0)).to.equal(0);
      expect(object.sortProperties('hello, world!')).to.equal('hello, world!');
      expect(object.sortProperties(null)).to.equal(null);
      expect(object.sortProperties(NaN)).to.be.NaN;
      expect(object.sortProperties(identity)).to.equal(identity);
    });
  });
});
