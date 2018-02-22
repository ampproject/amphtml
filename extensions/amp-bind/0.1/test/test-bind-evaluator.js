/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import * as sinon from 'sinon';
import {BindEvaluator, BindingDef} from '../bind-evaluator';
import {BindExpression} from '../bind-expression';

describe('BindEvaluator', () => {
  let evaluator;
  let sandbox;

  beforeEach(() => {
    evaluator = new BindEvaluator();
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  /** @return {number} */
  function numberOfBindings() {
    return evaluator.bindingsForTesting().length;
  }

  function numberOfCachedExpressions() {
    const cache = evaluator.expressionsForTesting();
    return Object.keys(cache).length;
  }

  it('should allow callers to add bindings multiple times', () => {
    expect(numberOfBindings()).to.equal(0);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    }]);
    expect(numberOfBindings()).to.equal(1);
    evaluator.addBindings([{
      tagName: 'SPAN',
      property: 'text',
      expressionString: 'oneplusone + 3',
    }]);
    expect(numberOfBindings()).to.equal(2);
  });

  it('should allow callers to remove bindings', () => {
    expect(numberOfBindings()).to.equal(0);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    }]);
    expect(numberOfBindings()).to.equal(1);
    evaluator.addBindings([{
      tagName: 'SPAN',
      property: 'text',
      expressionString: 'oneplusone + 3',
    }]);
    expect(numberOfBindings()).to.equal(2);
    evaluator.removeBindingsWithExpressionStrings(['oneplusone + 2']);
    expect(numberOfBindings()).to.equal(1);
    evaluator.removeBindingsWithExpressionStrings(['oneplusone + 3']);
    expect(numberOfBindings()).to.equal(0);
  });

  it('should only evaluate duplicate expressions once', () => {
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: '1+1',
    }, {
      tagName: 'DIV',
      property: 'text',
      expressionString: '1+1',
    }]);
    const stub = sandbox.stub(BindExpression.prototype, 'evaluate');
    stub.returns('stubbed');
    evaluator.evaluateBindings({});
    expect(stub.calledOnce).to.be.true;
  });

  it('should clean up removed expressions from its cache', () => {
    expect(numberOfCachedExpressions()).to.equal(0);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    }, {
      tagName: 'A',
      property: 'href',
      expressionString: 'url',
    }]);
    expect(numberOfCachedExpressions()).to.equal(2);
    evaluator.removeBindingsWithExpressionStrings(['url']);
    expect(numberOfCachedExpressions()).to.equal(1);
  });

  it('should evaluate expressions given a scope with needed bindings', () => {
    expect(numberOfBindings()).to.equal(0);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    }]);
    expect(numberOfBindings()).to.equal(1);
    const {results, errors} = evaluator.evaluateBindings({oneplusone: 2});
    expect(results['oneplusone + 2']).to.equal(4);
    expect(errors['oneplusone + 2']).to.be.undefined;
  });

  it('should treat out-of-scope vars as null', () => {
    expect(numberOfBindings()).to.equal(0);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'outOfScope',
    }]);
    expect(numberOfBindings()).to.equal(1);
    const {results, errors} = evaluator.evaluateBindings({});
    expect(results['outOfScope']).to.be.null;
    expect(errors['outOfScope']).to.be.undefined;
  });

  it('should validate a common expression on each respective binding', () => {
    const string = /* eslint no-script-url: 0 */ '"javascript:alert(1)"';
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: string,
    }]);
    let {results, errors} = evaluator.evaluateBindings({});
    expect(results[string])
        .to.equal(/* eslint no-script-url: 0 */ 'javascript:alert(1)');
    expect(errors[string]).to.be.undefined;

    // An expression used in a single invalid binding should be removed.
    evaluator.addBindings([{
      tagName: 'A',
      property: 'href',
      expressionString: string,
    }]);
    ({results, errors} = evaluator.evaluateBindings({}));
    expect(results[string]).to.be.undefined;
    expect(errors[string].message).to.match(/not a valid result/);
  });

  it('should evaluate expressions with macros', () => {
    expect(numberOfBindings()).to.equal(0);
    evaluator.addMacros([{
      id: 'add',
      argumentNames: ['a', 'b'],
      expressionString: 'a + b',
    }]);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'add(oneplusone, 2)',
    }]);
    expect(numberOfBindings()).to.equal(1);
    const {results, errors} = evaluator.evaluateBindings({oneplusone: 2});
    expect(results['add(oneplusone, 2)']).to.equal(4);
    expect(errors['add(oneplusone, 2)']).to.be.undefined;
  });

  it('should evaluate expressions with nested macros', () => {
    expect(numberOfBindings()).to.equal(0);
    evaluator.addMacros([{
      id: 'add',
      argumentNames: ['a', 'b'],
      expressionString: 'a + b',
    }, {
      id: 'addThree',
      argumentNames: ['a', 'b', 'c'],
      expressionString: 'add(add(a, b), c)',
    }]);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'addThree(oneplusone, 2, 2)',
    }]);
    expect(numberOfBindings()).to.equal(1);
    const {results, errors} = evaluator.evaluateBindings({oneplusone: 2});
    expect(results['addThree(oneplusone, 2, 2)']).to.equal(6);
    expect(errors['addThree(oneplusone, 2, 2)']).to.be.undefined;
  });

  it('should not allow recursive macros', () => {
    evaluator.addMacros([{
      id: 'recurse',
      expressionString: 'recurse()',
    }]);

    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'recurse()',
    }]);

    const {results, errors} = evaluator.evaluateBindings({});
    expect(results['recurse()']).to.be.undefined;
    expect(errors['recurse()'].message).to.match(
        /recurse is not a supported function/);
  });

  it('should not allow cyclic references in macros', () => {
    evaluator.addMacros([{
      id: 'foo',
      argumentNames: ['x'],
      expressionString: 'bar(x)',
    }, {
      id: 'bar',
      argumentNames: ['x'],
      expressionString: 'foo(x)',
    }]);

    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'bar()',
    }]);

    const {results, errors} = evaluator.evaluateBindings({});
    expect(results['bar()']).to.be.undefined;
    expect(errors['bar()'].message).to.match(
        /bar is not a supported function/);
  });
});
