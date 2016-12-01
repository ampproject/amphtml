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

import {
  InstrumentationService,
  AnalyticsEventType,
} from '../instrumentation.js';
import {adopt} from '../../../../src/runtime';
import {VisibilityState} from '../../../../src/visibility-state';
import * as sinon from 'sinon';

import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {installTimerService} from '../../../../src/service/timer-impl';
import {installPlatformService} from '../../../../src/service/platform-impl';
import {
    installResourcesServiceForDoc,
} from '../../../../src/service/resources-impl';
import {documentStateFor} from '../../../../src/service/document-state';


adopt(window);

describe('amp-analytics.instrumentation', function() {

  let ins;
  let fakeViewport;
  let clock;
  let sandbox;
  let ampdoc;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    const docState = documentStateFor(window);
    sandbox.stub(docState, 'isHidden', () => false);
    ampdoc = new AmpDocSingle(window);
    installResourcesServiceForDoc(ampdoc);
    installPlatformService(window);
    installTimerService(window);
    ins = new InstrumentationService(ampdoc);
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
    sandbox.stub(ins, 'isTriggerAllowed_').returns(true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('works for visible event', () => {
    ins.viewer_.setVisibilityState_(VisibilityState.VISIBLE);
    const fn = sandbox.stub();
    ins.addListener({'on': 'visible'}, fn);
    expect(fn).to.be.calledOnce;
  });

  it('works for hidden event', () => {
    const fn = sandbox.stub();
    ins.addListener({'on': 'hidden'}, fn);
    ins.viewer_.setVisibilityState_(VisibilityState.HIDDEN);
    expect(fn.calledOnce).to.be.true;
  });

  describe('click listeners', () => {
    let el1, el2, fn1, fn2, ampAnalytics;
    beforeEach(() => {
      el1 = document.createElement('test');
      fn1 = sandbox.stub();
      el2 = document.createElement('test2');
      fn2 = sandbox.stub();
      ampAnalytics = document.createElement('amp-analytics');
      document.body.appendChild(ampAnalytics);
      document.body.appendChild(el1);
      document.body.appendChild(el2);
    });

    it('always fires click listeners when selector is set to *', () => {
      ins.addListener({'on': 'click', 'selector': '*'}, fn1, ampAnalytics);
      ins.onClick_({target: el1});
      expect(fn1.calledOnce).to.be.true;

      ins.addListener({'on': 'click', 'selector': '*'}, fn2, ampAnalytics);
      ins.onClick_({target: el2});
      expect(fn1.calledTwice).to.be.true;
      expect(fn2.calledOnce).to.be.true;
    });

    it('never fires click listeners when the selector is empty', () => {
      ins.addListener({'on': 'click', 'selector': ''}, fn1, ampAnalytics);
      ins.onClick_({target: el1});
      expect(fn1.callCount).to.equal(0);

      ins.addListener({'on': 'click'}, fn2, ampAnalytics);
      ins.onClick_({target: el2});
      expect(fn1.callCount).to.equal(0);
      expect(fn2.callCount).to.equal(0);
    });

    it('only fires on matching elements', () => {

      el2.className = 'x';

      const el3 = document.createElement('div');
      el3.className = 'x';
      el3.id = 'y';

      const fnClassX = sandbox.stub();
      ins.addListener({'on': 'click', 'selector': '.x'}, fnClassX,
          ampAnalytics);

      const fnIdY = sandbox.stub();
      ins.addListener({'on': 'click', 'selector': '#y'}, fnIdY, ampAnalytics);

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

    it('fires for events on child elements', () => {

      const el3 = document.createElement('div');
      el3.className = 'x z';
      el3.appendChild(el1);

      const el4 = document.createElement('div');
      el4.className = 'x';
      el4.id = 'y';
      el4.appendChild(el3);
      el4.appendChild(el2);

      const fnClassX = sandbox.stub();
      ins.addListener({'on': 'click', 'selector': '.x'}, fnClassX,
          ampAnalytics);

      const fnIdY = sandbox.stub();
      ins.addListener({'on': 'click', 'selector': '#y'}, fnIdY, ampAnalytics);

      const fnClassZ = sandbox.stub();
      ins.addListener({'on': 'click', 'selector': '.z'}, fnClassZ,
          ampAnalytics);

      ins.onClick_({target: el1});
      expect(fnClassX.callCount).to.equal(1);
      expect(fnIdY.callCount).to.equal(1);
      expect(fnClassZ.callCount).to.equal(1);

      ins.onClick_({target: el2});
      expect(fnClassX.callCount).to.equal(2);
      expect(fnIdY.callCount).to.equal(2);
      expect(fnClassZ.callCount).to.equal(1);

      ins.onClick_({target: el3});
      expect(fnClassX.callCount).to.equal(3);
      expect(fnIdY.callCount).to.equal(3);
      expect(fnClassZ.callCount).to.equal(2);
    });
  });

  it('should listen on custom events', () => {
    const handler1 = sandbox.spy();
    const handler2 = sandbox.spy();
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

  it('should buffer custom events early on', () => {
    // Events before listeners added.
    ins.triggerEvent('custom-event-1');
    ins.triggerEvent('custom-event-2');
    ins.triggerEvent('custom-event-2');
    expect(ins.customEventBuffer_['custom-event-1']).to.have.length(1);
    expect(ins.customEventBuffer_['custom-event-2']).to.have.length(2);

    // Listeners added: immediate events fired.
    const handler1 = sandbox.spy();
    const handler2 = sandbox.spy();
    const handler3 = sandbox.spy();
    ins.addListener({'on': 'custom-event-1'}, handler1);
    ins.addListener({'on': 'custom-event-2'}, handler2);
    ins.addListener({'on': 'custom-event-3'}, handler3);
    clock.tick(1);
    expect(handler1.callCount).to.equal(1);
    expect(handler2.callCount).to.equal(2);
    expect(handler3.callCount).to.equal(0);
    expect(ins.customEventBuffer_['custom-event-1']).to.have.length(1);
    expect(ins.customEventBuffer_['custom-event-2']).to.have.length(2);
    expect(ins.customEventBuffer_['custom-event-3']).to.be.undefined;

    // Second round of events.
    ins.triggerEvent('custom-event-1');
    ins.triggerEvent('custom-event-2');
    ins.triggerEvent('custom-event-3');
    expect(handler1.callCount).to.equal(2);
    expect(handler2.callCount).to.equal(3);
    expect(handler3.callCount).to.equal(1);
    expect(ins.customEventBuffer_['custom-event-1']).to.have.length(2);
    expect(ins.customEventBuffer_['custom-event-2']).to.have.length(3);
    expect(ins.customEventBuffer_['custom-event-3']).to.have.length(1);

    // Buffering time expires.
    clock.tick(10001);
    expect(ins.customEventBuffer_).to.be.undefined;

    // Post-buffering round of events.
    ins.triggerEvent('custom-event-1');
    ins.triggerEvent('custom-event-2');
    ins.triggerEvent('custom-event-3');
    expect(handler1.callCount).to.equal(3);
    expect(handler2.callCount).to.equal(4);
    expect(handler3.callCount).to.equal(2);
    expect(ins.customEventBuffer_).to.be.undefined;
  });

  it('only fires when the timer interval exceeds the minimum', () => {
    const fn1 = sandbox.stub();
    ins.addListener({'on': 'timer', 'timerSpec': {'interval': 0}}, fn1);
    expect(fn1.callCount).to.equal(0);

    const fn2 = sandbox.stub();
    ins.addListener({'on': 'timer', 'timerSpec': {'interval': 1}}, fn2);
    expect(fn2.callCount).to.equal(1);
  });

  it('never fires when the timer spec is malformed', () => {
    const fn1 = sandbox.stub();
    ins.addListener({'on': 'timer'}, fn1);
    expect(fn1.callCount).to.equal(0);

    const fn2 = sandbox.stub();
    ins.addListener({'on': 'timer', 'timerSpec': 1}, fn2);
    expect(fn2.callCount).to.equal(0);

    const fn3 = sandbox.stub();
    ins.addListener({'on': 'timer', 'timerSpec': {'misc': 1}}, fn3);
    expect(fn3.callCount).to.equal(0);

    const fn4 = sandbox.stub();
    ins.addListener(
        {'on': 'timer', 'timerSpec': {'interval': 'two'}}, fn4);
    expect(fn4.callCount).to.equal(0);

    const fn5 = sandbox.stub();
    ins.addListener(
        {'on': 'timer', 'timerSpec': {'interval': null}}, fn5);
    expect(fn5.callCount).to.equal(0);

    const fn6 = sandbox.stub();
    ins.addListener({
      'on': 'timer',
      'timerSpec': {'interval': 2, 'maxTimerLength': 0},
    }, fn6);
    expect(fn6.callCount).to.equal(0);

    const fn7 = sandbox.stub();
    ins.addListener({
      'on': 'timer',
      'timerSpec': {'interval': 2, 'maxTimerLength': null},
    }, fn7);
    expect(fn7.callCount).to.equal(0);
  });

  it('fires on the appropriate interval', () => {
    const fn1 = sandbox.stub();
    ins.addListener({'on': 'timer', 'timerSpec': {'interval': 10}}, fn1);
    expect(fn1.callCount).to.equal(1);

    const fn2 = sandbox.stub();
    ins.addListener({'on': 'timer', 'timerSpec': {'interval': 15}}, fn2);
    expect(fn2.callCount).to.equal(1);

    const fn3 = sandbox.stub();
    ins.addListener({
      'on': 'timer', 'timerSpec': {'interval': 10, 'immediate': false},
    }, fn3);
    expect(fn3.callCount).to.equal(0);

    const fn4 = sandbox.stub();
    ins.addListener({
      'on': 'timer', 'timerSpec': {'interval': 15, 'immediate': false},
    }, fn4);
    expect(fn4.callCount).to.equal(0);

    clock.tick(10 * 1000); // 10 seconds
    expect(fn1.callCount).to.equal(2);
    expect(fn2.callCount).to.equal(1);
    expect(fn3.callCount).to.equal(1);
    expect(fn4.callCount).to.equal(0);

    clock.tick(10 * 1000); // 20 seconds
    expect(fn1.callCount).to.equal(3);
    expect(fn2.callCount).to.equal(2);
    expect(fn3.callCount).to.equal(2);
    expect(fn4.callCount).to.equal(1);

    clock.tick(10 * 1000); // 30 seconds
    expect(fn1.callCount).to.equal(4);
    expect(fn2.callCount).to.equal(3);
    expect(fn3.callCount).to.equal(3);
    expect(fn4.callCount).to.equal(2);
  });

  it('stops firing after the maxTimerLength is exceeded', () => {
    const fn1 = sandbox.stub();
    ins.addListener({
      'on': 'timer', 'timerSpec': {'interval': 10, 'maxTimerLength': 15},
    }, fn1);
    expect(fn1.callCount).to.equal(1);

    const fn2 = sandbox.stub();
    ins.addListener({
      'on': 'timer', 'timerSpec': {'interval': 10, 'maxTimerLength': 20},
    }, fn2);
    expect(fn2.callCount).to.equal(1);

    const fn3 = sandbox.stub();
    ins.addListener({'on': 'timer', 'timerSpec': {'interval': 3600}}, fn3);
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
    ins.addListener({
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [0, 100],
        'horizontalBoundaries': [0, 100],
      }},
      fn1);
    ins.addListener({'on': 'scroll', 'scrollSpec': {
      'verticalBoundaries': [92], 'horizontalBoundaries': [92]}}, fn2);

    function matcher(expected) {
      return actual => {
        return actual.vars.horizontalScrollBoundary === String(expected) ||
          actual.vars.verticalScrollBoundary === String(expected);
      };
    }
    expect(fn1.callCount).to.equal(2);
    expect(fn1.getCall(0).calledWithMatch(sinon.match(matcher(0)))).to.be.true;
    expect(fn1.getCall(1).calledWithMatch(sinon.match(matcher(0)))).to.be.true;
    expect(fn2.callCount).to.equal(0);

    // Scroll Down
    fakeViewport.getScrollTop.returns(500);
    fakeViewport.getScrollLeft.returns(500);
    ins.onScroll_({top: 500, left: 500, height: 250, width: 250});

    expect(fn1.callCount).to.equal(4);
    expect(fn1.getCall(2).calledWithMatch(sinon.match(matcher(100)))).to.be
        .true;
    expect(fn1.getCall(3).calledWithMatch(sinon.match(matcher(100)))).to.be
        .true;
    expect(fn2.callCount).to.equal(2);
    expect(fn2.getCall(0).calledWithMatch(sinon.match(matcher(90)))).to.be.true;
    expect(fn2.getCall(1).calledWithMatch(sinon.match(matcher(90)))).to.be.true;
  });

  it('does not fire duplicates on scroll', () => {
    const fn1 = sandbox.stub();
    ins.addListener({
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [0, 100],
        'horizontalBoundaries': [0, 100],
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

    ins.addListener({'on': 'scroll'}, fn1);
    expect(fn1.callCount).to.equal(0);

    ins.addListener({'on': 'scroll', 'scrollSpec': {}}, fn1);
    expect(fn1.callCount).to.equal(0);

    ins.addListener({
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': undefined, 'horizontalBoundaries': undefined,
      }},
      fn1);
    expect(fn1.callCount).to.equal(0);

    ins.addListener({
      'on': 'scroll',
      'scrollSpec': {'verticalBoundaries': [], 'horizontalBoundaries': []}},
      fn1);
    expect(fn1.callCount).to.equal(0);

    ins.addListener({
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': ['foo'], 'horizontalBoundaries': ['foo'],
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
    ins.addListener(
        {'on': 'scroll', 'scrollSpec': {'verticalBoundaries': [1]}},
        fn1);
    ins.addListener(
        {'on': 'scroll', 'scrollSpec': {'verticalBoundaries': [4]}},
        fn2);
    expect(fn2.callCount).to.equal(1);
  });


  it('extract element level vars from data attribute with prefix vars.',
    () => {
      const el1 = document.createElement('div');
      const ampAnalytics = document.createElement('amp-analytics');
      document.body.appendChild(ampAnalytics);
      el1.className = 'x';
      el1.dataset.varsTest = 'foo';
      ins.addListener({'on': 'click', 'selector': '.x'},
        function(arg) {
          expect(arg.vars.test).to.equal('foo');
        }, ampAnalytics);
      ins.onClick_({target: el1});
    });

  describe('isTriggerAllowed_', () => {
    let el;
    beforeEach(() => {
      ins.isTriggerAllowed_.restore();
    });

    it('allows all triggers for top level window', () => {
      el = document.createElement('amp-analytics');
      document.body.appendChild(el);

      expect(ins.isTriggerAllowed_(AnalyticsEventType.VISIBLE, el)).to.be.true;
      expect(ins.isTriggerAllowed_(AnalyticsEventType.CLICK, el)).to.be.true;
      expect(ins.isTriggerAllowed_(AnalyticsEventType.TIMER, el)).to.be.true;
      expect(ins.isTriggerAllowed_(AnalyticsEventType.SCROLL, el)).to.be.true;
      expect(ins.isTriggerAllowed_(AnalyticsEventType.HIDDEN, el)).to.be.true;
    });

    it('allows some trigger', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      el = document.createElement('foo');  // dummy element as amp-analytics can't be used in iframe.
      iframe.contentWindow.document.body.appendChild(el);
      expect(ins.isTriggerAllowed_(AnalyticsEventType.VISIBLE, el)).to.be.true;
      expect(ins.isTriggerAllowed_(AnalyticsEventType.CLICK, el)).to.be.true;
      expect(ins.isTriggerAllowed_(AnalyticsEventType.TIMER, el)).to.be.true;
      expect(ins.isTriggerAllowed_(AnalyticsEventType.HIDDEN, el)).to.be.true;
    });


    it('disallows scroll trigger', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      el = document.createElement('foo');  // dummy element as amp-analytics can't be used in iframe.
      iframe.contentWindow.document.body.appendChild(el);

      expect(ins.isTriggerAllowed_(AnalyticsEventType.SCROLL, el)).to.be.false;
      expect(ins.isTriggerAllowed_('custom-trigger', el)).to.be.false;
    });
  });
});
