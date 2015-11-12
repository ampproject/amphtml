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

import * as sinon from 'sinon';
import {Performance, performanceFor} from '../../src/performance';
import {adopt} from '../../src/runtime';


describe('performance', () => {
  let sandbox;
  let windowMock;
  let perf;
  let windowApi;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    const WindowApi = function() {};
    windowApi = new WindowApi();
    windowMock = sandbox.mock(windowApi);
    perf = new Performance(windowMock);
  });

  afterEach(() => {
    perf = null;
    windowAPi = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });

  describe('when no tick function is set,', () => {

    it('should not have a tick function', () => {
      expect(perf.tick_).to.be.undefined;
    });

    it('should queue up tick events', () => {
      expect(perf.events_.length).to.equal(0);

      perf.tick('start');
      expect(perf.events_.length).to.equal(1);

      perf.tick('startEnd');
      expect(perf.events_.length).to.equal(2);
    });

    it('should have max 50 queued events', () => {
      expect(perf.events_.length).to.equal(0);

      for (let i = 0; i < 200; i++) {
        perf.tick(`start${i}`);
      }

      expect(perf.events_.length).to.equal(50);
    });

    it('should add default optional relative start time on the ' +
       'queued tick event', () => {
      clock.tick(150);
      perf.tick('start0');

      expect(perf.events_[0]).to.deep.equal({
        label: 'start0',
        opt_from: undefined,
        opt_value: 150
      });
    });

    it('should save all 3 arguments as queued tick event if present', () => {
      clock.tick(150);
      perf.tick('start0', 'start1', 300);

      expect(perf.events_[0]).to.deep.equal({
        label: 'start0',
        opt_from: 'start1',
        opt_value: 300
      });
    });

    it('should drop events in the head of the queue', () => {
      const tickTime = 100;
      clock.tick(tickTime);

      expect(perf.events_.length).to.equal(0);

      for (let i = 0; i < 50 ; i++) {
        perf.tick(`start${i}`);
      }

      expect(perf.events_.length).to.equal(50);
      expect(perf.events_[0]).to.deep.equal({
        label: 'start0',
        opt_from: undefined,
        opt_value: tickTime
      });

      clock.tick(1);
      perf.tick('start50');

      expect(perf.events_[0]).to.deep.equal({
        label: 'start1',
        opt_from: undefined,
        opt_value: tickTime
      });
      expect(perf.events_[49]).to.deep.equal({
        label: 'start50',
        opt_from: undefined,
        opt_value: tickTime + 1
      });
    });
  });

  describe('when tick function is set,', () => {
    let spy;

    beforeEach(() => {
      spy = sinon.spy();
    });

    it('should be able to install a performance function', () => {
      expect(perf.tick_).to.be.undefined;

      perf.setTickFunction(spy);

      expect(perf.tick_).to.be.an.instanceof(Function);
    });

    it('should forward all queued tick events', () => {
      perf.tick('start0');
      clock.tick(1);
      perf.tick('start1', 'start0');

      expect(perf.events_.length).to.equal(2);

      perf.setTickFunction(spy);

      expect(spy.firstCall.args[0]).to.equal('start0');
      expect(spy.firstCall.args[1]).to.equal(undefined);
      expect(spy.firstCall.args[2]).to.equal(0);
      expect(spy.secondCall.args[0]).to.equal('start1');
      expect(spy.secondCall.args[1]).to.equal('start0');
      expect(spy.secondCall.args[2]).to.equal(1);
    });

    it('should have no more queued tick events after flush', () => {
      perf.tick('start0');
      perf.tick('start1');

      expect(perf.events_.length).to.equal(2);

      perf.setTickFunction(spy);

      expect(perf.events_.length).to.equal(0);
    });

    it('should forward tick events', () => {
      perf.setTickFunction(spy);

      perf.tick('start0');
      clock.tick(100);
      perf.tick('start1', 'start0', 300);

      expect(spy.firstCall.args[0]).to.equal('start0');
      expect(spy.firstCall.args[1]).to.equal(undefined);
      expect(spy.firstCall.args[2]).to.equal(undefined);

      expect(spy.secondCall.args[0]).to.equal('start1');
      expect(spy.secondCall.args[1]).to.equal('start0');
      expect(spy.secondCall.args[2]).to.equal(300);
    });

    it('should call the flush callback', () => {
      perf.setTickFunction(function() {}, spy);

      expect(spy.callCount).to.equal(0);
      perf.flush();
      expect(spy.callCount).to.equal(1);
      perf.flush();
      expect(spy.callCount).to.equal(2);
    });
  });

  it('can set the performance function through the runtime', () => {
    const perf = performanceFor(window);
    const spy = sinon.spy(perf, 'setTickFunction');
    const fn = function() {};

    adopt(window);

    window.AMP.setTickFunction(fn);

    expect(spy.firstCall.args[0]).to.equal(fn);

    spy.restore();
  });

  it('can set the flush function through the runtime', () => {
    const perf = performanceFor(window);
    const spy = sinon.spy(perf, 'setTickFunction');
    const fn = function() {};

    adopt(window);

    window.AMP.setTickFunction(function() {}, fn);

    expect(spy.firstCall.args[1]).to.equal(fn);

    spy.restore();
  });
});
