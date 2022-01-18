import {toggleExperiment} from '#experiments';

import {AnalyticsGroup} from '../analytics-group';
import {AmpdocAnalyticsRoot} from '../analytics-root';
import {
  AnalyticsEventType,
  ClickEventTracker,
  CustomEventTracker,
  IniLoadTracker,
  ScrollEventTracker,
  SignalTracker,
  TimerEventTracker,
  VisibilityTracker,
} from '../events';

describes.realWin('AnalyticsGroup', {amp: 1}, (env) => {
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

  afterEach(() => {
    toggleExperiment(win, 'analytics-chunks', false);
  });

  it('should create group for the ampdoc root', () => {
    expect(group.root_).to.equal(root);
  });

  it('should reject trigger in a disallowed environment', () => {
    env.sandbox.stub(root, 'getType').callsFake(() => 'other');
    allowConsoleError(() => {
      expect(() => {
        group.addTrigger({on: 'click', selector: '*'});
      }).to.throw(/Trigger type "click" is not allowed in the other/);
    });
  });

  it('should reject trigger that fails to initialize', () => {
    env.sandbox.stub(root, 'getTracker').callsFake(() => {
      throw new Error('intentional');
    });
    expect(() => {
      group.addTrigger({on: 'click', selector: '*'});
    }).to.throw(/intentional/);
  });

  it('should add "click" trigger', async () => {
    const tracker = root.getTracker('click', ClickEventTracker);
    const unlisten = function () {};
    const stub = env.sandbox.stub(tracker, 'add').callsFake(() => unlisten);
    const config = {on: 'click', selector: '*'};
    const handler = function () {};
    expect(group.listeners_).to.be.empty;
    await group.addTrigger(config, handler);
    expect(stub).to.be.calledOnce;
    expect(stub).to.be.calledWith(analyticsElement, 'click', config, handler);
    expect(group.listeners_).to.have.length(1);
    expect(group.listeners_[0]).to.equal(unlisten);
  });

  it('should add "scroll" trigger', async () => {
    const tracker = root.getTracker(
      AnalyticsEventType.SCROLL,
      ScrollEventTracker
    );
    const unlisten = function () {};
    const stub = env.sandbox.stub(tracker, 'add').callsFake(() => unlisten);
    const config = {on: 'scroll', selector: '*'};
    const handler = function () {};
    expect(group.listeners_).to.be.empty;
    await group.addTrigger(config, handler);
    expect(stub).to.be.calledOnce;
    expect(stub).to.be.calledWith(
      analyticsElement,
      AnalyticsEventType.SCROLL,
      config,
      handler
    );
    expect(group.listeners_).to.have.length(1);
    expect(group.listeners_[0]).to.equal(unlisten);
  });

  it('should add "custom" trigger', async () => {
    const tracker = root.getTracker(
      AnalyticsEventType.CUSTOM,
      CustomEventTracker
    );
    const unlisten = function () {};
    const stub = env.sandbox.stub(tracker, 'add').callsFake(() => unlisten);
    const config = {on: 'custom-event-1', selector: '*'};
    const handler = function () {};
    expect(group.listeners_).to.be.empty;
    await group.addTrigger(config, handler);
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

  it('should add "render-start" trigger', async () => {
    const config = {on: 'render-start'};
    await group.addTrigger(config, handler);
    const tracker = root.getTrackerOptional('render-start');
    expect(tracker).to.be.instanceOf(SignalTracker);

    const unlisten = function () {};
    const stub = env.sandbox.stub(tracker, 'add').callsFake(() => unlisten);
    const handler = function () {};
    await group.addTrigger(config, handler);
    expect(stub).to.be.calledOnce;
    expect(stub).to.be.calledWith(
      analyticsElement,
      'render-start',
      config,
      handler
    );
  });

  it('should add "ini-load" trigger', async () => {
    const config = {on: 'ini-load'};
    await group.addTrigger(config, handler);
    const tracker = root.getTrackerOptional('ini-load');
    expect(tracker).to.be.instanceOf(IniLoadTracker);

    const unlisten = function () {};
    const stub = env.sandbox.stub(tracker, 'add').callsFake(() => unlisten);
    const handler = function () {};
    await group.addTrigger(config, handler);
    expect(stub).to.be.calledOnce;
    expect(stub).to.be.calledWith(
      analyticsElement,
      'ini-load',
      config,
      handler
    );
  });

  it('should add "timer" trigger', async () => {
    const handler = function () {};
    const unlisten = function () {};
    const stub = env.sandbox
      .stub(TimerEventTracker.prototype, 'add')
      .callsFake(() => unlisten);
    const config = {on: 'timer'};
    await group.addTrigger(config, handler);
    const tracker = root.getTrackerOptional(AnalyticsEventType.TIMER);
    expect(tracker).to.be.instanceOf(TimerEventTracker);
    expect(stub).to.be.calledOnce;
    expect(stub).to.be.calledWith(analyticsElement, 'timer', config, handler);
    expect(group.listeners_).to.have.length(1);
    expect(group.listeners_[0]).to.equal(unlisten);
  });

  it('should add "visible" trigger', async () => {
    const config = {on: 'visible'};
    await group.addTrigger(config, handler);
    const tracker = root.getTrackerOptional('visible');
    expect(tracker).to.be.instanceOf(VisibilityTracker);

    const unlisten = function () {};
    const stub = env.sandbox.stub(tracker, 'add').callsFake(() => unlisten);
    const handler = function () {};
    await group.addTrigger(config, handler);
    expect(stub).to.be.calledOnce;
    expect(stub).to.be.calledWith(analyticsElement, 'visible', config, handler);
  });

  it('should add "visible" trigger for hidden', async () => {
    const config = {on: 'hidden'};
    const getTrackerSpy = env.sandbox.spy(root, 'getTracker');
    await group.addTrigger(config, () => {});
    expect(getTrackerSpy).to.be.calledWith('visible');
    const tracker = root.getTrackerOptional('visible');
    const unlisten = function () {};
    const stub = env.sandbox.stub(tracker, 'add').callsFake(() => unlisten);
    await group.addTrigger(config, () => {});
    expect(stub).to.be.calledWith(analyticsElement, 'hidden', config);
  });

  it('should prioritize first trigger', async () => {
    toggleExperiment(win, 'analytics-chunks', true);
    const config = {on: 'visible'};
    // First trigger is handled immediately
    group.addTrigger(config, handler);
    const tracker = root.getTrackerOptional('visible');
    expect(tracker).to.be.instanceOf(VisibilityTracker);
    const unlisten = function () {};
    const stub = env.sandbox.stub(tracker, 'add').callsFake(() => unlisten);
    const handler = function () {};
    await group.addTrigger(config, handler);
    expect(stub).to.be.calledOnce;
    expect(stub).to.be.calledWith(analyticsElement, 'visible', config, handler);
  });
});
