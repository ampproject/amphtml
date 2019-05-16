/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {AmpdocAnalyticsRoot} from '../analytics-root.js';
import {AnalyticsGroup} from '../analytics-group.js';
import {
  ClickEventTracker,
  CustomEventTracker,
  IniLoadTracker,
  ScrollEventTracker,
  SignalTracker,
  TimerEventTracker,
  VisibilityTracker,
} from '../events';

describes.realWin('AnalyticsGroup', {amp: 1}, env => {
  let win;
  let root;
  let analyticsElement;
  let group;

  beforeEach(() => {
    win = env.win;
    root = new AmpdocAnalyticsRoot(env.ampdoc);
    analyticsElement = win.document.createElement('amp-analytics');
    win.document.body.appendChild(analyticsElement);
    group = new AnalyticsGroup(root, analyticsElement);
  });

  it('should create group for the ampdoc root', () => {
    expect(group.root_).to.equal(root);
  });

  it('should reject trigger in a disallowed environment', () => {
    sandbox.stub(root, 'getType').callsFake(() => 'other');
    allowConsoleError(() => {
      expect(() => {
        group.addTrigger({on: 'click', selector: '*'});
      }).to.throw(/Trigger type "click" is not allowed in the other/);
    });
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
    expect(stub).to.be.calledWith(analyticsElement, 'click', config, handler);
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
    expect(stub).to.be.calledWith(analyticsElement, 'scroll', config, handler);
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
      analyticsElement,
      'custom-event-1',
      config,
      handler
    );
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
      analyticsElement,
      'render-start',
      config,
      handler
    );
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
      analyticsElement,
      'ini-load',
      config,
      handler
    );
  });

  it('should add "timer" trigger', () => {
    const handler = function() {};
    const unlisten = function() {};
    const stub = sandbox
      .stub(TimerEventTracker.prototype, 'add')
      .callsFake(() => unlisten);
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
    expect(stub).to.be.calledWith(analyticsElement, 'visible', config, handler);
  });

  it('should add "visible" trigger for hidden', () => {
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
