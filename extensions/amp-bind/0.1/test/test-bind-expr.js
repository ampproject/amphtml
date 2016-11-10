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

import {evaluateBindExpr} from '../bind-expr';

describe('evaluateBindExpr', () => {
  it('should evaluate simple number operations', () => {
    expect(evaluateBindExpr('-1')).to.equal(-1);
    expect(evaluateBindExpr('1 + 2')).to.equal(3);
    expect(evaluateBindExpr('2 - 3.5')).to.equal(-1.5);
    expect(evaluateBindExpr('3 * 4')).to.equal(12);
    expect(evaluateBindExpr('4 / 5')).to.equal(0.8);
    expect(evaluateBindExpr('5 % 4')).to.equal(1);
    expect(evaluateBindExpr('2 > 1')).to.be.true;
    expect(evaluateBindExpr('1 > 1')).to.be.false;
    expect(evaluateBindExpr('1 >= 1')).to.be.true;
    expect(evaluateBindExpr('1 >= 2')).to.be.false;
    expect(evaluateBindExpr('1 < 2')).to.be.true;
    expect(evaluateBindExpr('0 < 0')).to.be.false;
    expect(evaluateBindExpr('1 <= 1')).to.be.true;
    expect(evaluateBindExpr('1 <= 0')).to.be.false;
    expect(evaluateBindExpr('0 == 1')).to.be.false;
    expect(evaluateBindExpr('1 == 1')).to.be.true;
  });

  it('should evaluate simple logical operations', () => {
    expect(evaluateBindExpr('!false')).to.be.true;
    expect(evaluateBindExpr('true && true')).to.be.true;
    expect(evaluateBindExpr('true && false')).to.be.false;
    expect(evaluateBindExpr('false && false')).to.be.false;
    expect(evaluateBindExpr('true || true')).to.be.true;
    expect(evaluateBindExpr('true || false')).to.be.true;
    expect(evaluateBindExpr('false || false')).to.be.false;
    expect(evaluateBindExpr('true == false')).to.be.false;
    expect(evaluateBindExpr('false == false')).to.be.true;
  });

  it('should respect arithmetic operator precedence', () => {
    expect(evaluateBindExpr('-1 + 2')).to.equal(1);
    expect(evaluateBindExpr('1 - -0.5')).to.equal(1.5);
    expect(evaluateBindExpr('1 + -2 * 3')).to.equal(-5);
    expect(evaluateBindExpr('1 / 2 - 3')).to.equal(-2.5);
    expect(evaluateBindExpr('4 % 3 - 2 * 1')).to.equal(-1);
  });

  it('should respect logical operator precedence', () => {
    expect(evaluateBindExpr('!false && true')).to.be.true;
    expect(evaluateBindExpr('false || !true')).to.be.false;
    expect(evaluateBindExpr('true && false || true')).to.be.true;
    expect(evaluateBindExpr('true && false == false')).to.be.true;
    expect(evaluateBindExpr('false || false == true')).to.be.false;
    expect(evaluateBindExpr('false == !true')).to.be.true;
  });

  it('should support array literals and whitelisted methods', () => {
    expect(evaluateBindExpr('[]')).to.deep.equal([]);
    expect(evaluateBindExpr('[1, "a", [], {}]')).to.deep.equal([1, 'a', [], {}]);
    expect(evaluateBindExpr('["a", "b"].length')).to.equal(2);
    expect(evaluateBindExpr('["a", "b"].concat(["c", "d"])')).to.deep.equal(['a', 'b', 'c', 'd']);
    expect(evaluateBindExpr('["a"].includes("a")')).to.be.true;
    expect(evaluateBindExpr('["a", "a"].indexOf("a")')).to.equal(0);
    expect(evaluateBindExpr('["a", "b", "c"].join("-")')).to.equal('a-b-c');
    expect(evaluateBindExpr('["a", "a"].lastIndexOf("a")')).to.equal(1);
    expect(evaluateBindExpr('["a", "b", "c"].slice(1, 2)')).to.deep.equal(['b']);
  });

  it('should NOT allow array properties (except length) or non-whitelisted methods', () => {
    expect(evaluateBindExpr('[].constructor')).to.be.null;
    expect(evaluateBindExpr('[].prototype')).to.be.null;
    expect(evaluateBindExpr('[].__proto__')).to.be.null;

    expect(evaluateBindExpr('foo.constructor', {foo: []})).to.be.null;
    expect(evaluateBindExpr('foo.prototype', {foo: []})).to.be.null;
    expect(evaluateBindExpr('foo.__proto__', {foo: []})).to.be.null;

    expect(evaluateBindExpr('["a", "b", "c"].find()')).to.be.null;
    expect(evaluateBindExpr('["a", "b", "c"].forEach()')).to.be.null;
    expect(evaluateBindExpr('["a", "b", "c"].splice(1, 1)')).to.be.null;

    expect(evaluateBindExpr('foo.find()', {foo: ['a', 'b', 'c']})).to.be.null;
    expect(evaluateBindExpr('foo.forEach()', {foo: ['a', 'b', 'c']})).to.be.null;
    expect(evaluateBindExpr('foo.splice(1, 1)', {foo: ['a', 'b', 'c']})).to.be.null;
  });
});
