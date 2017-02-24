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

import {BindEvaluator, BindingDef} from '../bind-evaluator';

describe('BindEvaluator', () => {

  let evaluator;

  beforeEach(() => {
    evaluator = new BindEvaluator();
  });

  it('should allow callers to add bindings multiple times', () => {
    expect(evaluator.bindingsForTesting().length).to.equal(0);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    }]);
    expect(evaluator.bindingsForTesting().length).to.equal(1);
    evaluator.addBindings([{
      tagName: 'SPAN',
      property: 'text',
      expressionString: 'oneplusone + 3',
    }]);
    expect(evaluator.bindingsForTesting().length).to.equal(2);
  });

  it('should allow callers to remove bindings', () => {
    expect(evaluator.bindingsForTesting().length).to.equal(0);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    }]);
    expect(evaluator.bindingsForTesting().length).to.equal(1);
    evaluator.addBindings([{
      tagName: 'SPAN',
      property: 'text',
      expressionString: 'oneplusone + 3',
    }]);
    expect(evaluator.bindingsForTesting().length).to.equal(2);
    evaluator.removeBindingsWithExpressionStrings(['oneplusone + 2']);
    expect(evaluator.bindingsForTesting().length).to.equal(1);
    evaluator.removeBindingsWithExpressionStrings(['oneplusone + 3']);
    expect(evaluator.bindingsForTesting().length).to.equal(0);
  });

  it('should evaluate expressions given a scope with needed bindings', () => {
    const bindingDef = {
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    };
    expect(evaluator.bindingsForTesting().length).to.equal(0);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    }]);
    expect(evaluator.bindingsForTesting().length).to.equal(1);
    const results = evaluator.evaluateBindings({oneplusone: 2});
    const evaluated = results['results'];
    const errors = results['errors'];
    expect(errors['oneplusone + 2']).to.be.undefined;
    expect(evaluated['oneplusone + 2']).to.not.be.undefined;
    expect(evaluated['oneplusone + 2'] = '4');
  });

  it('should treat out-of-scope vars as null', () => {
    expect(evaluator.bindingsForTesting().length).to.equal(0);
    evaluator.addBindings([{
      tagName: 'P',
      property: 'text',
      expressionString: 'outOfScope',
    }]);
    expect(evaluator.bindingsForTesting().length).to.equal(1);
    const results = evaluator.evaluateBindings({});
    const evaluated = results['results'];
    const errors = results['errors'];
    expect(errors['outOfScope']).to.be.undefined;
    expect(evaluated['outOfScope']).to.not.be.undefined;
    expect(evaluated['outOfScope']).to.be.null;
  });

});
