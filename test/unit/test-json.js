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
  deepEquals,
  getChildJsonConfig,
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

    it('should support array index', () => {
      const child = {num: 1, str: 'A'};
      const obj = {foo: [child]};
      expect(getValueForExpr(obj, 'foo.0.num')).to.equal(1);
      expect(getValueForExpr(obj, 'foo.0.str')).to.equal('A');
      expect(getValueForExpr(obj, 'foo.0a.str')).to.be.undefined;
      expect(getValueForExpr(obj, 'foo.1.num')).to.be.undefined;
      expect(getValueForExpr(obj, 'foo.1.str')).to.be.undefined;
    });

    it('should only search in own properties of arrays', () => {
      const arr = ['A'];
      expect(getValueForExpr(arr, '0')).to.equal('A');
      expect(getValueForExpr(arr, '1')).to.be.undefined;
      expect(getValueForExpr(arr, 'concat')).to.be.undefined;
      expect(getValueForExpr(arr, '__proto__')).to.be.undefined;
    });
  });

  describe('recreateNonProtoObject', () => {
    it('should recreate an empty object', () => {
      const original = {};
      const copy = recreateNonProtoObject(original);
      expect(copy).to.deep.equal(original);
      expect(copy).to.not.equal(original);
      expect(copy.__proto__).to.be.undefined;
    });

    it('should recreate an object', () => {
      const original = {str: 'A', num: 1, bool: true, val: null};
      const copy = recreateNonProtoObject(original);
      expect(copy).to.deep.equal(original);
      expect(copy).to.not.equal(original);
      expect(copy.__proto__).to.be.undefined;
      expect(copy.val).to.be.null;
    });

    it('should recreate a nested object', () => {
      const original = {child: {str: 'A', num: 1, bool: true, val: null}};
      const copy = recreateNonProtoObject(original);
      expect(copy).to.deep.equal(original);
      expect(copy).to.not.equal(original);
      expect(copy.__proto__).to.be.undefined;
      expect(copy.child).to.deep.equal(original.child);
      expect(copy.child).to.not.equal(original.child);
      expect(copy.child.__proto__).to.be.undefined;
    });
  });

  describe('tryParseJson', () => {
    it('should return object for valid json', () => {
      const json = '{"key": "value"}';
      const result = tryParseJson(json);
      expect(result.key).to.equal('value');
    });

    it('should not throw and return null for invalid json', () => {
      const json = '{"key": "val';
      expect(tryParseJson.bind(null, json)).to.not.throw;
      const result = tryParseJson(json);
      expect(result).to.be.null;
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

  describe('getChildJsonConfig', () => {
    let element;
    let script;
    let text;
    beforeEach(() => {
      element = document.createElement('div');
      script = document.createElement('script');
      script.setAttribute('type', 'application/json');
      text = '{"a":{"b": "c"}}';
      script.textContent = text;
    });

    it('return json config', () => {
      element.appendChild(script);
      expect(getChildJsonConfig(element)).to.deep.equal({
        'a': {
          'b': 'c',
        },
      });
    });

    it('throw if not one script', () => {
      expect(() => getChildJsonConfig(element)).to.throw(
          'Found 0 <script> children. Expected 1');
      element.appendChild(script);
      const script2 = document.createElement('script');
      element.appendChild(script2);
      expect(() => getChildJsonConfig(element)).to.throw(
          'Found 2 <script> children. Expected 1');
    });

    it('throw if type is not application/json', () => {
      script.setAttribute('type', '');
      element.appendChild(script);
      expect(() => getChildJsonConfig(element)).to.throw(
          '<script> child must have type="application/json"');
    });

    it('throw if cannot parse json', () => {
      const invalidText = '{"a":{"b": "c",}}';
      script.textContent = invalidText;
      element.appendChild(script);
      expect(() => getChildJsonConfig(element)).to.throw(
          'Failed to parse <script> contents. Is it valid JSON?');
    });
  });


  describe('deepEquals', () => {
    it('should throw on non-finite depth arg', () => {
      expect(() => {
        deepEquals({}, {}, Number.POSITIVE_INFINITY);
      }).to.throw(/Invalid depth/);
    });

    it('should handle null and empty objects', () => {
      expect(deepEquals(null, null)).to.be.true;

      expect(deepEquals({}, {})).to.be.true;
      expect(deepEquals({}, null)).to.be.false;

      expect(deepEquals([], [])).to.be.true;
      expect(deepEquals([], null)).to.be.false;
    });

    it('should check strict equality', () => {
      expect(deepEquals({x: 1}, {x: 1})).to.be.true;
      expect(deepEquals({x: false}, {x: false})).to.be.true;
      expect(deepEquals({x: 'abc'}, {x: 'abc'})).to.be.true;

      expect(deepEquals({x: ''}, {x: false})).to.be.false;
      expect(deepEquals({x: false}, {x: ''})).to.be.false;

      expect(deepEquals({x: ''}, {x: 0})).to.be.false;
      expect(deepEquals({x: 0}, {x: ''})).to.be.false;

      expect(deepEquals({x: 1}, {x: true})).to.be.false;
      expect(deepEquals({x: true}, {x: 1})).to.be.false;

      expect(deepEquals({x: 1}, {x: '1'})).to.be.false;
      expect(deepEquals({x: '1'}, {x: 1})).to.be.false;

      expect(deepEquals({x: undefined}, {x: null})).to.be.false;
      expect(deepEquals({x: null}, {x: undefined})).to.be.false;

      expect(deepEquals({x: {}}, {x: '[object Object]'})).to.be.false;
      expect(deepEquals({x: '[object Object]'}, {x: {}})).to.be.false;
    });

    it('should check deep equality in nested arrays and objects', () => {
      expect(deepEquals({x: {y: 1}}, {x: {y: 1}})).to.be.true;
      expect(deepEquals({x: {y: 1}}, {x: {}})).to.be.false;
      expect(deepEquals({x: {y: 1}}, {x: {y: 0}})).to.be.false;
      expect(deepEquals({x: {y: 1}}, {x: {y: 1, z: 2}})).to.be.false;

      expect(deepEquals({x: [1, 2, 3]}, {x: [1, 2, 3]})).to.be.true;
      expect(deepEquals({x: [1, 2, 3]}, {x: []})).to.be.false;
      expect(deepEquals({x: [1, 2, 3]}, {x: [1, 2, 3, 4]})).to.be.false;

      expect(deepEquals([1, 2, [3, 4]], [1, 2, [3, 4]])).to.be.true;
      expect(deepEquals([1, 2, []], [1, 2, []])).to.be.true;
      expect(deepEquals([1, 2, [3, 4]], [1, 2, [3, 4, 5]])).to.be.false;
    });

    it('should check array order', () => {
      expect(deepEquals([1, 2], [2, 1])).to.be.false;
      expect(deepEquals([1, 2, [3, 4]], [1, 2, [4, 3]])).to.be.false;
    });

    it('should not check object key order', () => {
      expect(deepEquals({x: 1, y: 2, z: 3}, {y: 2, z: 3, x: 1})).to.be.true;
    });

    it('should stop diving once depth arg is exceeded', () => {
      let depth = 0;
      expect(deepEquals(1, 1, depth)).to.be.true;
      expect(deepEquals('a', 'a', depth)).to.be.true;
      expect(deepEquals([], [], depth)).to.be.false;
      expect(deepEquals({}, {}, depth)).to.be.false;

      depth = 1;
      expect(deepEquals({x: 1}, {x: 1}, depth)).to.be.true;
      expect(deepEquals([1, 2], [1, 2], depth)).to.be.true;
      expect(deepEquals({x: {y: 1}}, {x: {y: 1}}, depth)).to.be.false;
      expect(deepEquals({x: []}, {x: []}, depth)).to.be.false;
    });
  });
});
