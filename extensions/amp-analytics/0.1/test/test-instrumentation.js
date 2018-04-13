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
import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {
  AnalyticsEventType,
  ClickEventTracker,
  CustomEventTracker,
  IniLoadTracker,
  SignalTracker,
  TimerEventTracker,
  VisibilityTracker,
} from '../events';

import {
  InstrumentationService,
} from '../instrumentation.js';
import {Services} from '../../../../src/services';
import {installPlatformService} from '../../../../src/service/platform-impl';
import {
  installResourcesServiceForDoc,
} from '../../../../src/service/resources-impl';
import {installTimerService} from '../../../../src/service/timer-impl';

describes.realWin('InstrumentationService', {amp: 1}, env => {
  let win;
  let ampdoc;
  let service;
  let root;
  let analyticsElement;
  let target;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    service = new InstrumentationService(ampdoc);
    root = service.ampdocRoot_;

    analyticsElement = win.document.createElement('amp-analytics');
    win.document.body.appendChild(analyticsElement);

    target = win.document.createElement('div');
    win.document.body.appendChild(target);
  });

  it('should create and dispose the ampdoc root', () => {
    expect(root).to.be.ok;
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.parent).to.be.null;

    const stub = sandbox.stub(root, 'dispose');
    service.dispose();
    expect(stub).to.be.calledOnce;
  });

  it('should trigger a custom event on the ampdoc root', () => {
    const tracker = root.getTracker('custom', CustomEventTracker);
    const triggerStub = sandbox.stub(tracker, 'trigger');
    service.triggerEventForTarget(target, 'test-event', {foo: 'bar'});
    expect(triggerStub).to.be.calledOnce;

    const event = triggerStub.args[0][0];
    expect(event.target).to.equal(target);
    expect(event.type).to.equal('test-event');
    expect(event.vars).to.deep.equal({foo: 'bar'});
  });

  it('should backfill target for the old triggerEvent', () => {
    // TODO(dvoytenko): remove in preference of triggerEventForTarget.
    const tracker = root.getTracker('custom', CustomEventTracker);
    const triggerStub = sandbox.stub(tracker, 'trigger');
    service.triggerEventForTarget(ampdoc, 'test-event', {foo: 'bar'});
    expect(triggerStub).to.be.calledOnce;

    const event = triggerStub.args[0][0];
    expect(event.target).to.equal(ampdoc);
    expect(event.type).to.equal('test-event');
    expect(event.vars).to.deep.equal({foo: 'bar'});
  });

  describe('AnalyticsGroup', () => {
    let group;
    let insStub;

    beforeEach(() => {
      group = service.createAnalyticsGroup(analyticsElement);
      insStub = sandbox.stub(service, 'addListenerDepr_');
    });

    it('should create group for the ampdoc root', () => {
      expect(group.root_).to.equal(root);
    });

    it('should reject trigger in a disallowed environment', () => {
      sandbox.stub(root, 'getType').callsFake(() => 'other');
      allowConsoleError(() => { expect(() => {
        group.addTrigger({on: 'click', selector: '*'});
      }).to.throw(/Trigger type "click" is not allowed in the other/); });
    });

    it('should reject trigger that fails to initialize', () => {
      sandbox.stub(root, 'getTracker').callsFake(() => {
        throw new Error('intentional');
      });
      allowConsoleError(() => { expect(() => {
        group.addTrigger({on: 'click', selector: '*'});
      }).to.throw(/intentional/); });
    });

    it('should delegate to deprecated addListener', () => {
      const trackerStub = sandbox.stub(root, 'getTracker');
      const handler = function() {};
      group.addTrigger({on: 'scroll'}, handler);

      expect(trackerStub).to.not.be.called;
      expect(group.listeners_).to.be.empty;

      expect(insStub).to.have.callCount(1);

      expect(insStub.args[0][0].on).to.equal('scroll');
      expect(insStub.args[0][1]).to.equal(handler);
      expect(insStub.args[0][2]).to.equal(analyticsElement);

    });

    it('should add "click" trigger', () => {
      const tracker = root.getTracker('click', ClickEventTracker);
      const unlisten = function() {};
      const stub = sandbox.stub(tracker, 'add').callsFake(() => unlisten);
      const config = {on: 'click', selector: '*'};
      const handler = function() {};
      expect(group.listeners_).to.be.empty;
      group.addTrigger(config, handler);
      expect(stub).to.be.calledOnce;
      expect(stub).to.be.calledWith(
          analyticsElement, 'click', config, handler);
      expect(group.listeners_).to.have.length(1);
      expect(group.listeners_[0]).to.equal(unlisten);
      expect(insStub).to.not.be.called;
    });

    it('should add "custom" trigger', () => {
      const tracker = root.getTracker('custom', CustomEventTracker);
      const unlisten = function() {};
      const stub = sandbox.stub(tracker, 'add').callsFake(() => unlisten);
      const config = {on: 'custom-event-1', selector: '*'};
      const handler = function() {};
      expect(group.listeners_).to.be.empty;
      group.addTrigger(config, handler);
      expect(stub).to.be.calledOnce;
      expect(stub).to.be.calledWith(
          analyticsElement, 'custom-event-1', config, handler);
      expect(group.listeners_).to.have.length(1);
      expect(group.listeners_[0]).to.equal(unlisten);
      expect(insStub).to.not.be.called;
    });

    it('should add "render-start" trigger', () => {
      const config = {on: 'render-start'};
      group.addTrigger(config, handler);
      const tracker = root.getTrackerOptional('render-start');
      expect(tracker).to.be.instanceOf(SignalTracker);

      const unlisten = function() {};
      const stub = sandbox.stub(tracker, 'add').callsFake(() => unlisten);
      const handler = function() {};
      group.addTrigger(config, handler);
      expect(stub).to.be.calledOnce;
      expect(stub).to.be.calledWith(
          analyticsElement, 'render-start', config, handler);
    });

    it('should add "ini-load" trigger', () => {
      const config = {on: 'ini-load'};
      group.addTrigger(config, handler);
      const tracker = root.getTrackerOptional('ini-load');
      expect(tracker).to.be.instanceOf(IniLoadTracker);

      const unlisten = function() {};
      const stub = sandbox.stub(tracker, 'add').callsFake(() => unlisten);
      const handler = function() {};
      group.addTrigger(config, handler);
      expect(stub).to.be.calledOnce;
      expect(stub).to.be.calledWith(
          analyticsElement, 'ini-load', config, handler);
    });

    it('should add "timer" trigger', () => {
      const handler = function() {};
      const unlisten = function() {};
      const stub = sandbox.stub(TimerEventTracker.prototype, 'add').callsFake(
          () => unlisten);
      const config = {on: 'timer'};
      group.addTrigger(config, handler);
      const tracker = root.getTrackerOptional('timer');
      expect(tracker).to.be.instanceOf(TimerEventTracker);
      expect(stub).to.be.calledOnce;
      expect(stub).to.be.calledWith(analyticsElement, 'timer', config, handler);
      expect(group.listeners_).to.have.length(1);
      expect(group.listeners_[0]).to.equal(unlisten);
    });

    it('should add "visible" trigger', () => {
      const config = {on: 'visible'};
      group.addTrigger(config, handler);
      const tracker = root.getTrackerOptional('visible');
      expect(tracker).to.be.instanceOf(VisibilityTracker);

      const unlisten = function() {};
      const stub = sandbox.stub(tracker, 'add').callsFake(() => unlisten);
      const handler = function() {};
      group.addTrigger(config, handler);
      expect(stub).to.be.calledOnce;
      expect(stub).to.be.calledWith(
          analyticsElement, 'visible', config, handler);
    });

    it('should add "visible" trigger for hidden', () => {
      group = service.createAnalyticsGroup(analyticsElement);
      const config = {on: 'hidden'};
      const getTrackerSpy = sandbox.spy(root, 'getTracker');
      group.addTrigger(config, () => {});
      expect(getTrackerSpy).to.be.calledWith('visible');
      const tracker = root.getTrackerOptional('visible');
      const unlisten = function() {};
      const stub = sandbox.stub(tracker, 'add').callsFake(() => unlisten);
      group.addTrigger(config, () => {});
      expect(stub).to.be.calledWith(analyticsElement, 'hidden', config);
    });
  });
});


describes.realWin('InstrumentationService in FIE', {
  amp: {ampdoc: 'fie'},
}, env => {
  let win;
  let embed;
  let ampdoc;
  let service;
  let root;
  let analyticsElement;
  let target;

  beforeEach(() => {
    win = env.win;
    embed = env.embed;
    ampdoc = env.ampdoc;
    service = new InstrumentationService(ampdoc);
    root = service.ampdocRoot_;

    analyticsElement = win.document.createElement('amp-analytics');
    win.document.body.appendChild(analyticsElement);

    target = win.document.createElement('div');
    win.document.body.appendChild(target);
  });

  it('should create and reuse embed root', () => {
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.parent).to.be.null;

    const group1 = service.createAnalyticsGroup(analyticsElement);
    const embedRoot = group1.root_;
    expect(embedRoot).to.not.equal(root);
    expect(embedRoot.parent).to.equal(root);
    expect(embedRoot.ampdoc).to.equal(ampdoc);
    expect(embedRoot.embed).to.equal(embed);

    // Reuse the previously created instance.
    const analyticsElement2 = win.document.createElement('amp-analytics');
    win.document.body.appendChild(analyticsElement2);
    const group2 = service.createAnalyticsGroup(analyticsElement2);
    expect(group2.root_).to.equal(embedRoot);
  });
});


// TODO(dvoytenko): remove after migration to trackers.
describe('amp-analytics.instrumentation OLD', function() {

  let ins;
  let fakeViewport;
  let sandbox;
  let ampdoc;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const docState = Services.documentStateFor(window);
    sandbox.stub(docState, 'isHidden').callsFake(() => false);
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

  it('fires on scroll', () => {
    const fn1 = sandbox.stub();
    const fn2 = sandbox.stub();
    ins.addListenerDepr_({
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [0, 100],
        'horizontalBoundaries': [0, 100],
      }},
    fn1);
    ins.addListenerDepr_({'on': 'scroll', 'scrollSpec': {
      'verticalBoundaries': [92], 'horizontalBoundaries': [92]}}, fn2);

    function matcher(expected) {
      return actual => {
        return actual.vars.horizontalScrollBoundary === String(expected) ||
          actual.vars.verticalScrollBoundary === String(expected);
      };
    }
    expect(fn1).to.have.callCount(2);
    expect(fn1.getCall(0).calledWithMatch(sinon.match(matcher(0)))).to.be.true;
    expect(fn1.getCall(1).calledWithMatch(sinon.match(matcher(0)))).to.be.true;
    expect(fn2).to.have.not.been.called;

    // Scroll Down
    fakeViewport.getScrollTop.returns(500);
    fakeViewport.getScrollLeft.returns(500);
    ins.onScroll_({top: 500, left: 500, height: 250, width: 250});

    expect(fn1).to.have.callCount(4);
    expect(fn1.getCall(2).calledWithMatch(sinon.match(matcher(100)))).to.be
        .true;
    expect(fn1.getCall(3).calledWithMatch(sinon.match(matcher(100)))).to.be
        .true;
    expect(fn2).to.have.callCount(2);
    expect(fn2.getCall(0).calledWithMatch(sinon.match(matcher(90)))).to.be.true;
    expect(fn2.getCall(1).calledWithMatch(sinon.match(matcher(90)))).to.be.true;
  });

  it('does not fire duplicates on scroll', () => {
    const fn1 = sandbox.stub();
    ins.addListenerDepr_({
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

    expect(fn1).to.have.callCount(2);
  });

  it('fails gracefully on bad scroll config', () => {
    const fn1 = sandbox.stub();

    ins.addListenerDepr_({'on': 'scroll'}, fn1);
    expect(fn1).to.have.not.been.called;

    ins.addListenerDepr_({'on': 'scroll', 'scrollSpec': {}}, fn1);
    expect(fn1).to.have.not.been.called;

    ins.addListenerDepr_({
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': undefined, 'horizontalBoundaries': undefined,
      }},
    fn1);
    expect(fn1).to.have.not.been.called;

    ins.addListenerDepr_({
      'on': 'scroll',
      'scrollSpec': {'verticalBoundaries': [], 'horizontalBoundaries': []}},
    fn1);
    expect(fn1).to.have.not.been.called;

    ins.addListenerDepr_({
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': ['foo'], 'horizontalBoundaries': ['foo'],
      }},
    fn1);
    expect(fn1).to.have.not.been.called;
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
    ins.addListenerDepr_(
        {'on': 'scroll', 'scrollSpec': {'verticalBoundaries': [1]}},
        fn1);
    ins.addListenerDepr_(
        {'on': 'scroll', 'scrollSpec': {'verticalBoundaries': [4]}},
        fn2);
    expect(fn2).to.be.calledOnce;
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
      el = document.createElement('foo'); // dummy element as amp-analytics can't be used in iframe.
      iframe.contentWindow.document.body.appendChild(el);
      expect(ins.isTriggerAllowed_(AnalyticsEventType.VISIBLE, el)).to.be.true;
      expect(ins.isTriggerAllowed_(AnalyticsEventType.CLICK, el)).to.be.true;
      expect(ins.isTriggerAllowed_(AnalyticsEventType.TIMER, el)).to.be.true;
      expect(ins.isTriggerAllowed_(AnalyticsEventType.HIDDEN, el)).to.be.true;
    });


    it('disallows scroll trigger', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      el = document.createElement('foo'); // dummy element as amp-analytics can't be used in iframe.
      iframe.contentWindow.document.body.appendChild(el);

      expect(ins.isTriggerAllowed_(AnalyticsEventType.SCROLL, el)).to.be.false;
      expect(ins.isTriggerAllowed_('custom-trigger', el)).to.be.false;
    });
  });
});
