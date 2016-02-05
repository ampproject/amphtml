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
    sandbox = sinon.sandbox.create();
    ins = instrumentationServiceFor(window);
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
  });

  it('always fires click listeners when selector is set to *', () => {
    const el1 = document.createElement('test');
    const fn1 = sandbox.stub();
    addListener(window, 'click', fn1, '*');
    ins.onClick_({target: el1});
    expect(fn1.calledOnce).to.be.true;

    const el2 = document.createElement('test2');
    const fn2 = sandbox.stub();
    addListener(window, 'click', fn2, '*');
    ins.onClick_({target: el2});
    expect(fn1.calledTwice).to.be.true;
    expect(fn2.calledOnce).to.be.true;
  });

  it('never fires click listeners when the selector is empty', () => {
    const el1 = document.createElement('test');
    const fn1 = sandbox.stub();
    addListener(window, 'click', fn1, '');
    ins.onClick_({target: el1});
    expect(fn1.callCount).to.equal(0);

    const el2 = document.createElement('test2');
    const fn2 = sandbox.stub();
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

    const fnClassX = sandbox.stub();
    addListener(window, 'click', fnClassX, '.x');

    const fnIdY = sandbox.stub();
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

  it('should listen on custom events', () => {
    const handler1 = sinon.spy();
    const handler2 = sinon.spy();
    ins.addListener('custom-event-1', handler1);
    ins.addListener('custom-event-2', handler2);

    ins.triggerEvent('custom-event-1');
    expect(handler1.callCount).to.equal(1);
    expect(handler2.callCount).to.equal(0);

    ins.triggerEvent('custom-event-2');
    expect(handler1.callCount).to.equal(1);
    expect(handler2.callCount).to.equal(1);

    ins.triggerEvent('custom-event-1');
    expect(handler1.callCount).to.equal(2);
    expect(handler2.callCount).to.equal(1);
  });

  it('only fires when the timer interval exceeds the minimum', () => {
    const fn1 = sandbox.stub();
    addListener(window, 'timer', fn1, null, {"interval": 0});
    expect(fn1.callCount).to.equal(0);

    const fn2 = sandbox.stub();
    addListener(window, 'timer', fn2, null, {"interval": 1});
    expect(fn2.callCount).to.equal(1);
  });

  it('never fires when the timer spec is malformed', () => {
    const fn1 = sandbox.stub();
    addListener(window, 'timer', fn1, null, null);
    expect(fn1.callCount).to.equal(0);

    const fn2 = sandbox.stub();
    addListener(window, 'timer', fn2, null, 1);
    expect(fn2.callCount).to.equal(0);

    const fn3 = sandbox.stub();
    addListener(window, 'timer', fn3, null, {'misc': 1});
    expect(fn3.callCount).to.equal(0);

    const fn4 = sandbox.stub();
    addListener(window, 'timer', fn4, null, {'interval': 'two'});
    expect(fn4.callCount).to.equal(0);

    const fn5 = sandbox.stub();
    addListener(window, 'timer', fn5, null, {'interval': null});
    expect(fn5.callCount).to.equal(0);

    const fn6 = sandbox.stub();
    addListener(window, 'timer', fn6, null,
        {'interval': 2, 'max-timer-length': 0});
    expect(fn6.callCount).to.equal(0);

    const fn7 = sandbox.stub();
    addListener(window, 'timer', fn7, null,
        {'interval': 2, 'max-timer-length': null});
    expect(fn7.callCount).to.equal(0);
  });

  it('fires on the appropriate interval', () => {
    const clock = sandbox.useFakeTimers();
    const fn1 = sandbox.stub();
    addListener(window, 'timer', fn1, null, {"interval": 10});
    expect(fn1.callCount).to.equal(1);

    const fn2 = sandbox.stub();
    addListener(window, 'timer', fn2, null, {"interval": 15});
    expect(fn2.callCount).to.equal(1);

    clock.tick(10 * 1000); // 10 seconds
    expect(fn1.callCount).to.equal(2);
    expect(fn2.callCount).to.equal(1);

    clock.tick(10 * 1000); // 20 seconds
    expect(fn1.callCount).to.equal(3);
    expect(fn2.callCount).to.equal(2);

    clock.tick(10 * 1000); // 30 seconds
    expect(fn1.callCount).to.equal(4);
    expect(fn2.callCount).to.equal(3);
  });

  it('stops firing after the max-timer-length is exceeded', () => {
    const clock = sandbox.useFakeTimers();
    const fn1 = sandbox.stub();
    addListener(window, 'timer', fn1, null,
        {"interval": 10, "max-timer-length": 15});
    expect(fn1.callCount).to.equal(1);

    const fn2 = sandbox.stub();
    addListener(window, 'timer', fn2, null,
        {"interval": 10, "max-timer-length": 20});
    expect(fn2.callCount).to.equal(1);

    const fn3 = sandbox.stub();
    addListener(window, 'timer', fn3, null, {"interval": 3600});
    expect(fn3.callCount).to.equal(1);

    clock.tick(10 * 1000); // 10 seconds
    expect(fn1.callCount).to.equal(2);
    expect(fn2.callCount).to.equal(2);

    clock.tick(10 * 1000); // 20 seconds
    expect(fn1.callCount).to.equal(2);
    expect(fn2.callCount).to.equal(3);

    clock.tick(10 * 1000); // 30 seconds
    expect(fn1.callCount).to.equal(2);
    expect(fn2.callCount).to.equal(3);

    // Default max-timer-length is 2 hours
    clock.tick(3 * 3600 * 1000); // 3 hours
    expect(fn3.callCount).to.equal(3);
  });
});
