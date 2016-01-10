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

import {addListener, instrumentationServiceFor} from '../instrumentation.js';
import {adopt} from '../../../../src/runtime';
import * as sinon from 'sinon';

adopt(window);

describe('instrumentation', function() {

  let ins;

  beforeEach(() => {
    ins = instrumentationServiceFor(window);
  });

  it('always fires click listeners when selector is set to *', () => {
    const el1 = document.createElement('test');
    const fn1 = sinon.stub();
    addListener(window, 'click', fn1, '*');
    ins.onClick_({target: el1});
    expect(fn1.calledOnce).to.be.true;

    const el2 = document.createElement('test2');
    const fn2 = sinon.stub();
    addListener(window, 'click', fn2, '*');
    ins.onClick_({target: el2});
    expect(fn1.calledTwice).to.be.true;
    expect(fn2.calledOnce).to.be.true;
  });

  it('never fires click listeners when the selector is empty', () => {
    const el1 = document.createElement('test');
    const fn1 = sinon.stub();
    addListener(window, 'click', fn1, '');
    ins.onClick_({target: el1});
    expect(fn1.callCount).to.equal(0);

    const el2 = document.createElement('test2');
    const fn2 = sinon.stub();
    addListener(window, 'click', fn2);
    ins.onClick_({target: el2});
    expect(fn1.callCount).to.equal(0);
    expect(fn2.callCount).to.equal(0);
  });

  it('only fires on matching elements', () => {
    const el1 = document.createElement('div');

    const el2 = document.createElement('div');
    el2.className = 'x';

    const el3 = document.createElement('div');
    el3.className = 'x';
    el3.id = 'y';

    const fnClassX = sinon.stub();
    addListener(window, 'click', fnClassX, '.x');

    const fnIdY = sinon.stub();
    addListener(window, 'click', fnIdY, '#y');

    ins.onClick_({target: el1});
    expect(fnClassX.callCount).to.equal(0);
    expect(fnIdY.callCount).to.equal(0);

    ins.onClick_({target: el2});
    expect(fnClassX.callCount).to.equal(1);
    expect(fnIdY.callCount).to.equal(0);

    ins.onClick_({target: el3});
    expect(fnClassX.callCount).to.equal(2);
    expect(fnIdY.callCount).to.equal(1);
  });

});
