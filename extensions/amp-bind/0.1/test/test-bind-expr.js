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
});
