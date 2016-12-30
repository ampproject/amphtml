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

import {
  getValueForExpr,
  recreateNonProtoObject,
  tryParseJson,
} from '../../src/json';

describe('json', () => {

  describe('getValueForExpr', () => {
    it('should return self for "."', () => {
      const obj = {str: 'A', num: 1, bool: true, val: null};
      expect(getValueForExpr(obj, '.')).to.equal(obj);
    });

    it('should return a simple value', () => {
      const obj = {str: 'A', num: 1, bool: true, val: null};
      expect(getValueForExpr(obj, 'str')).to.equal('A');
      expect(getValueForExpr(obj, 'num')).to.equal(1);
      expect(getValueForExpr(obj, 'bool')).to.equal(true);
      expect(getValueForExpr(obj, 'val')).to.be.null;
      expect(getValueForExpr(obj, 'other')).to.be.undefined;
    });

    it('should return a nested value', () => {
      const child = {str: 'A', num: 1, bool: true, val: null};
      const obj = {child};
      expect(getValueForExpr(obj, 'child')).to.deep.equal(child);
      expect(getValueForExpr(obj, 'child.str')).to.equal('A');
      expect(getValueForExpr(obj, 'child.num')).to.equal(1);
      expect(getValueForExpr(obj, 'child.bool')).to.equal(true);
      expect(getValueForExpr(obj, 'child.val')).to.be.null;
      expect(getValueForExpr(obj, 'child.other')).to.be.undefined;
    });

    it('should return a nested value without proto', () => {
      const child = {str: 'A', num: 1, bool: true, val: null};
      const obj = recreateNonProtoObject({child});
      expect(getValueForExpr(obj, 'child')).to.deep.equal(child);
      expect(getValueForExpr(obj, 'child.str')).to.equal('A');
      expect(getValueForExpr(obj, 'child.num')).to.equal(1);
      expect(getValueForExpr(obj, 'child.bool')).to.equal(true);
      expect(getValueForExpr(obj, 'child.val')).to.be.null;
      expect(getValueForExpr(obj, 'child.other')).to.be.undefined;
    });

    it('should shortcircuit if a parent in chain missing', () => {
      const child = {str: 'A'};
      const obj = {child};
      expect(getValueForExpr(obj, 'child.str')).to.equal('A');
      expect(getValueForExpr(obj, 'unknown.str')).to.be.undefined;
      expect(getValueForExpr(obj, 'unknown.chain.str')).to.be.undefined;
    });

    it('should shortcircuit if a parent in chain is not an object', () => {
      const child = {str: 'A'};
      const obj = {child, nonobj: 'B'};
      expect(getValueForExpr(obj, 'child.str')).to.equal('A');
      expect(getValueForExpr(obj, 'nonobj')).to.equal('B');
      expect(getValueForExpr(obj, 'nonobj.str')).to.be.undefined;
    });

    it('should only search in own properties', () => {
      const ancestor = {num: 1};
      const obj = Object.create(ancestor);
      obj.str = 'A';
      expect(getValueForExpr(obj, 'str')).to.equal('A');
      expect(getValueForExpr(ancestor, 'num')).to.equal(1);
      expect(getValueForExpr(obj, 'num')).to.be.undefined;
      expect(getValueForExpr(obj, '__proto__')).to.be.undefined;
    });
  });

  describe('recreateNonProtoObject', () => {
    it('should recreate an empty object', () => {
      const original = {};
      const copy = recreateNonProtoObject(original);
      expect(copy).to.deep.equal(original);
      expect(copy === original).to.be.false;
      expect(copy.__proto__).to.be.undefined;
    });

    it('should recreate an object', () => {
      const original = {str: 'A', num: 1, bool: true, val: null};
      const copy = recreateNonProtoObject(original);
      expect(copy).to.deep.equal(original);
      expect(copy === original).to.be.false;
      expect(copy.__proto__).to.be.undefined;
      expect(copy.val).to.be.null;
    });

    it('should recreate a nested object', () => {
      const original = {child: {str: 'A', num: 1, bool: true, val: null}};
      const copy = recreateNonProtoObject(original);
      expect(copy).to.deep.equal(original);
      expect(copy === original).to.be.false;
      expect(copy.__proto__).to.be.undefined;
      expect(copy.child).to.deep.equal(original.child);
      expect(copy.child === original.child).to.be.false;
      expect(copy.child.__proto__).to.be.undefined;
    });
  });

  describe('tryParseJson', () => {
    it('should return object for valid json', () => {
      const json = '{"key": "value"}';
      const result = tryParseJson(json);
      expect(result.key).to.equal('value');
    });

    it('should not throw and return undefined for invalid json', () => {
      const json = '{"key": "val';
      expect(tryParseJson.bind(null, json)).to.not.throw;
      const result = tryParseJson(json);
      expect(result).to.be.undefined;
    });

    it('should call onFailed for invalid and not call for valid json', () => {
      let onFailedCalled = false;
      const validJson = '{"key": "value"}';
      tryParseJson(validJson, () => {
        onFailedCalled = true;
      });
      expect(onFailedCalled).to.be.false;

      const invalidJson = '{"key": "val';
      tryParseJson(invalidJson, err => {
        onFailedCalled = true;
        expect(err).to.exist;
      });
      expect(onFailedCalled).to.be.true;
    });
  });
});
