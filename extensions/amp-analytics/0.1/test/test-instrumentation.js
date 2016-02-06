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
  let fakeViewport;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    ins = instrumentationServiceFor(window);
    fakeViewport = {
      'getSize': sandbox.stub().returns(
          {top: 0, left: 0, height: 200, width: 200}),
      'getScrollTop': sandbox.stub().returns(0),
      'getScrollLeft': sandbox.stub().returns(0),
      'getScrollHeight': sandbox.stub().returns(500),
      'getScrollWidth': sandbox.stub().returns(500),
      'onChanged': sandbox.stub(),
    };
    ins.viewport_ = fakeViewport;
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
    fakeViewport = null;
    ins = null;
  });

  it('always fires click listeners when selector is set to *', () => {
    const el1 = document.createElement('test');
    const fn1 = sandbox.stub();
    addListener(window, {'on': 'click', 'selector': '*'}, fn1);
    ins.onClick_({target: el1});
    expect(fn1.calledOnce).to.be.true;

    const el2 = document.createElement('test2');
    const fn2 = sandbox.stub();
    addListener(window, {'on': 'click', 'selector': '*'}, fn2);
    ins.onClick_({target: el2});
    expect(fn1.calledTwice).to.be.true;
    expect(fn2.calledOnce).to.be.true;
  });

  it('never fires click listeners when the selector is empty', () => {
    const el1 = document.createElement('test');
    const fn1 = sandbox.stub();
    addListener(window, {'on': 'click', 'selector': ''}, fn1);
    ins.onClick_({target: el1});
    expect(fn1.callCount).to.equal(0);

    const el2 = document.createElement('test2');
    const fn2 = sandbox.stub();
    addListener(window, {'on': 'click'}, fn2);
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
    addListener(window, {'on': 'click', 'selector': '.x'}, fnClassX);

    const fnIdY = sandbox.stub();
    addListener(window, {'on': 'click', 'selector': '#y'}, fnIdY);

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
    ins.addListener({'on': 'custom-event-1'}, handler1);
    ins.addListener({'on': 'custom-event-2'}, handler2);

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
    addListener(window, {'on': 'timer', 'timerSpec': {"interval": 0}}, fn1);
    expect(fn1.callCount).to.equal(0);

    const fn2 = sandbox.stub();
    addListener(window, {'on': 'timer', 'timerSpec': {"interval": 1}}, fn2);
    expect(fn2.callCount).to.equal(1);
  });

  it('never fires when the timer spec is malformed', () => {
    const fn1 = sandbox.stub();
    addListener(window, {'on': 'timer'}, fn1);
    expect(fn1.callCount).to.equal(0);

    const fn2 = sandbox.stub();
    addListener(window, {'on': 'timer', 'timerSpec': 1}, fn2);
    expect(fn2.callCount).to.equal(0);

    const fn3 = sandbox.stub();
    addListener(window, {'on': 'timer', 'timerSpec': {'misc': 1}}, fn3);
    expect(fn3.callCount).to.equal(0);

    const fn4 = sandbox.stub();
    addListener(window,
        {'on': 'timer', 'timerSpec': {'interval': 'two'}}, fn4);
    expect(fn4.callCount).to.equal(0);

    const fn5 = sandbox.stub();
    addListener(window,
        {'on': 'timer', 'timerSpec': {'interval': null}}, fn5);
    expect(fn5.callCount).to.equal(0);

    const fn6 = sandbox.stub();
    addListener(window, {
      'on': 'timer',
      'timerSpec': {'interval': 2, 'maxTimerLength': 0}
    }, fn6);
    expect(fn6.callCount).to.equal(0);

    const fn7 = sandbox.stub();
    addListener(window, {
      'on': 'timer',
      'timerSpec': {'interval': 2, 'maxTimerLength': null}
    }, fn7);
    expect(fn7.callCount).to.equal(0);
  });

  it('fires on the appropriate interval', () => {
    const clock = sandbox.useFakeTimers();
    const fn1 = sandbox.stub();
    addListener(window, {'on': 'timer', 'timerSpec': {"interval": 10}}, fn1);
    expect(fn1.callCount).to.equal(1);

    const fn2 = sandbox.stub();
    addListener(window, {'on': 'timer', 'timerSpec': {"interval": 15}}, fn2);
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

  it('stops firing after the maxTimerLength is exceeded', () => {
    const clock = sandbox.useFakeTimers();
    const fn1 = sandbox.stub();
    addListener(window, {
      'on': 'timer', 'timerSpec': {"interval": 10, "maxTimerLength": 15}
    }, fn1);
    expect(fn1.callCount).to.equal(1);

    const fn2 = sandbox.stub();
    addListener(window, {
      'on': 'timer', 'timerSpec': {"interval": 10, "maxTimerLength": 20}
    }, fn2);
    expect(fn2.callCount).to.equal(1);

    const fn3 = sandbox.stub();
    addListener(window, {'on': 'timer', 'timerSpec': {"interval": 3600}}, fn3);
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

    // Default maxTimerLength is 2 hours
    clock.tick(3 * 3600 * 1000); // 3 hours
    expect(fn3.callCount).to.equal(3);
  });

  it('fires on scroll', () => {
    const fn1 = sandbox.stub();
    const fn2 = sandbox.stub();
    addListener(window, {
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [0, 100],
        'horizontalBoundaries': [0, 100]
      }},
      fn1);
    addListener(window, {'on': 'scroll', 'scrollSpec': {
      'verticalBoundaries': [90], 'horizontalBoundaries': [90]}}, fn2);

    expect(fn1.callCount).to.equal(2);
    expect(fn2.callCount).to.equal(0);

    // Scroll Down
    fakeViewport.getScrollTop.returns(500);
    fakeViewport.getScrollLeft.returns(500);
    ins.onScroll_({top: 500, left: 500, height: 250, width: 250});

    expect(fn1.callCount).to.equal(4);
    expect(fn2.callCount).to.equal(2);
  });

  it('does not fire duplicates on scroll', () => {
    const fn1 = sandbox.stub();
    addListener(window, {
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [0, 100],
        'horizontalBoundaries': [0, 100]
      }},
      fn1);

    // Scroll Down
    fakeViewport.getScrollTop.returns(10);
    fakeViewport.getScrollLeft.returns(10);
    ins.onScroll_({top: 10, left: 10, height: 250, width: 250});

    expect(fn1.callCount).to.equal(2);
  });

  it('fails gracefully on bad scroll config', () => {
    const fn1 = sandbox.stub();

    addListener(window, {'on': 'scroll'}, fn1);
    expect(fn1.callCount).to.equal(0);

    addListener(window, {'on': 'scroll', 'scrollSpec': {}}, fn1);
    expect(fn1.callCount).to.equal(0);

    addListener(window, {
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': undefined, 'horizontalBoundaries': undefined
      }},
      fn1);
    expect(fn1.callCount).to.equal(0);

    addListener(window, {
      'on': 'scroll',
      'scrollSpec': {'verticalBoundaries': [], 'horizontalBoundaries': []}},
      fn1);
    expect(fn1.callCount).to.equal(0);

    addListener(window, {
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': ['foo'], 'horizontalBoundaries': ['foo']
      }},
      fn1);
    expect(fn1.callCount).to.equal(0);
  });

  it('normalizes boundaries correctly.', () => {
    expect(ins.normalizeBoundaries_([])).to.be.empty;
    expect(ins.normalizeBoundaries_(undefined)).to.be.empty;
    expect(ins.normalizeBoundaries_(['foo'])).to.be.empty;
    expect(ins.normalizeBoundaries_(['0', '1'])).to.be.empty;
    expect(ins.normalizeBoundaries_([1])).to.deep.equal({0: false});
    expect(ins.normalizeBoundaries_([1, 4, 99, 1001])).to.deep.equal({
      0: false,
      5: false,
      100: false,
    });
  });

  it('fires events on normalized boundaries.', () => {
    const fn1 = sandbox.stub();
    const fn2 = sandbox.stub();
    addListener(window,
        {'on': 'scroll', 'scrollSpec': {'verticalBoundaries': [1]}},
        fn1);
    addListener(window,
        {'on': 'scroll', 'scrollSpec': {'verticalBoundaries': [4]}},
        fn2);
    expect(fn2.callCount).to.equal(1);
  });
});
