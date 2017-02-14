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
    const bindingDef = {
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    };
    const bindingDef2 = {
      tagName: 'SPAN',
      property: 'text',
      expressionString: 'oneplusone + 3',
    };
    expect(evaluator.parsedBindings_.length).to.equal(0);
    evaluator.addBindings([bindingDef]);
    expect(evaluator.parsedBindings_.length).to.equal(1);
    evaluator.addBindings([bindingDef2]);
    expect(evaluator.parsedBindings_.length).to.equal(2);
  });

  it('should allow callers to remove bindings', () => {
    const bindingDef = {
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    };
    const bindingDef2 = {
      tagName: 'SPAN',
      property: 'text',
      expressionString: 'oneplusone + 3',
    };
    expect(evaluator.parsedBindings_.length).to.equal(0);
    evaluator.addBindings([bindingDef]);
    expect(evaluator.parsedBindings_.length).to.equal(1);
    evaluator.addBindings([bindingDef2]);
    expect(evaluator.parsedBindings_.length).to.equal(2);
    evaluator.removeBindingsForExpressions([bindingDef.expressionString]);
    expect(evaluator.parsedBindings_.length).to.equal(1);
    evaluator.removeBindingsForExpressions([bindingDef2.expressionString]);
    expect(evaluator.parsedBindings_.length).to.equal(0);
  });

  it('should evaluate expressions given a scope with needed bindings', () => {
    const bindingDef = {
      tagName: 'P',
      property: 'text',
      expressionString: 'oneplusone + 2',
    };
    expect(evaluator.parsedBindings_.length).to.equal(0);
    evaluator.addBindings([bindingDef]);
    expect(evaluator.parsedBindings_.length).to.equal(1);
    const results = evaluator.evaluate({oneplusone: 2});
    const evaluated = results['results'];
    const errors = results['errors'];
    expect(errors[bindingDef.expressionString]).to.be.undefined;
    expect(evaluated[bindingDef.expressionString]).to.not.be.undefined;
    expect(evaluated[bindingDef.expressionString] = '4');
  });

  it('should treat out-of-scope vars as null', () => {
    const outOfScopeDef = {
      tagName: 'P',
      property: 'text',
      expressionString: 'outOfScope',
    };
    expect(evaluator.parsedBindings_.length).to.equal(0);
    evaluator.addBindings([outOfScopeDef]);
    expect(evaluator.parsedBindings_.length).to.equal(1);
    const results = evaluator.evaluate({});
    const evaluated = results['results'];
    const errors = results['errors'];
    expect(errors[outOfScopeDef.expressionString]).to.be.undefined;
    expect(evaluated[outOfScopeDef.expressionString]).to.not.be.undefined;
    expect(evaluated[outOfScopeDef.expressionString]).to.be.null;
  });

});
