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
  ClickEventTracker,
  CustomEventTracker,
  IniLoadTracker,
  ScrollEventTracker,
  SignalTracker,
  TimerEventTracker,
  VisibilityTracker,
} from '../events';

import {
  InstrumentationService,
} from '../instrumentation.js';

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

    beforeEach(() => {
      group = service.createAnalyticsGroup(analyticsElement);
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
      expect(() => {
        group.addTrigger({on: 'click', selector: '*'});
      }).to.throw(/intentional/);
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
    });

    it('should add "scroll" trigger', () => {
      const tracker = root.getTracker('scroll', ScrollEventTracker);
      const unlisten = function() {};
      const stub = sandbox.stub(tracker, 'add').callsFake(() => unlisten);
      const config = {on: 'scroll', selector: '*'};
      const handler = function() {};
      expect(group.listeners_).to.be.empty;
      group.addTrigger(config, handler);
      expect(stub).to.be.calledOnce;
      expect(stub).to.be.calledWith(
          analyticsElement, 'scroll', config, handler);
      expect(group.listeners_).to.have.length(1);
      expect(group.listeners_[0]).to.equal(unlisten);
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

