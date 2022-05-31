import * as fakeTimers from '@sinonjs/fake-timers';

import {Deferred} from '#core/data-structures/promise';
import {Signals} from '#core/data-structures/signals';

import {macroTask} from '#testing/helpers';

import {AmpdocAnalyticsRoot} from '../analytics-root';
import {
  AmpStoryEventTracker,
  AnalyticsEvent,
  AnalyticsEventType,
  ClickEventTracker,
  CustomEventTracker,
  IniLoadTracker,
  ScrollEventTracker,
  SignalTracker,
  TimerEventTracker,
  VisibilityTracker,
  trackerTypeForTesting,
} from '../events';

describes.realWin('Events', {amp: 1}, (env) => {
  let win;
  let ampdoc;
  let root;
  let handler;
  let analyticsElement;
  let target;
  let child;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    root = new AmpdocAnalyticsRoot(ampdoc);
    handler = env.sandbox.spy();

    analyticsElement = win.document.createElement('amp-analytics');
    win.document.body.appendChild(analyticsElement);

    target = win.document.createElement('div');
    target.classList.add('target');
    win.document.body.appendChild(target);

    child = win.document.createElement('div');
    child.classList.add('child');
    target.appendChild(child);
  });

  describe('AnalyticsEvent', () => {
    it('should handle data-vars', () => {
      let analyticsEvent = new AnalyticsEvent(target, 'custom-event', {
        'var': 'test',
      });
      expect(analyticsEvent.vars).to.deep.equal({
        'var': 'test',
      });

      target.setAttribute('data-params-test-param', 'error');
      target.setAttribute('data-vars-test-var', 'default');
      analyticsEvent = new AnalyticsEvent(target, 'custom-event');
      expect(analyticsEvent.vars).to.deep.equal({
        'testVar': 'default',
      });

      analyticsEvent = new AnalyticsEvent(
        target,
        'custom-event',
        {
          'var': 'test',
        },
        false
      );
      expect(analyticsEvent.vars).to.deep.equal({
        'var': 'test',
      });
    });

    it('event vars should override data-vars', () => {
      target.setAttribute('data-vars-test-var', 'error');
      target.setAttribute('data-vars-test-var1', 'test1');
      const analyticsEvent = new AnalyticsEvent(target, 'custom-event', {
        'testVar': 'override',
        'someVar': 'test',
      });
      expect(analyticsEvent.vars).to.deep.equal({
        'testVar': 'override',
        'testVar1': 'test1',
        'someVar': 'test',
      });
    });
  });

  describe('AnalyticsEventType', () => {
    it('should match TRACKER_TYPES', () => {
      const analyticsEventTypes = Object.values(AnalyticsEventType);
      const trackerTypes = Object.keys(trackerTypeForTesting);
      expect(analyticsEventTypes).to.deep.equal(trackerTypes);
    });
  });

  describe('ClickEventTracker', () => {
    let iniEventCount;
    let tracker;

    beforeEach(() => {
      // ActionService and some other services may also add click listeners.
      iniEventCount = win.document.eventListeners.count('click');
      tracker = root.getTracker('click', ClickEventTracker);
    });

    it('should initalize, add listeners and dispose', () => {
      expect(tracker.root).to.equal(root);
      expect(tracker.clickObservable_.getHandlerCount()).to.equal(0);
      expect(win.document.eventListeners.count('click')).to.equal(
        iniEventCount + 1
      );

      tracker.dispose();
      expect(win.document.eventListeners.count('click')).to.equal(
        iniEventCount
      );
    });

    it('should require selector', () => {
      allowConsoleError(() => {
        expect(() => {
          tracker.add(analyticsElement, 'click', {selector: ''});
        }).to.throw(/Missing required selector/);
      });
    });

    it('should add listener', () => {
      const selUnlisten = function () {};
      const selListenerStub = env.sandbox
        .stub(root, 'createSelectiveListener')
        .callsFake(() => selUnlisten);
      tracker.add(
        analyticsElement,
        'click',
        {selector: '*', selectionMethod: 'scope'},
        handler
      );
      expect(tracker.clickObservable_.getHandlerCount()).to.equal(1);
      expect(tracker.clickObservable_.handlers_[0]).to.equal(selUnlisten);
      expect(selListenerStub).to.be.calledOnce;
      const args = selListenerStub.args[0];
      expect(args[0]).to.be.a('function');
      expect(args[1]).to.equal(win.document.body); // Parent element of amp-analytics.
      expect(args[2]).to.equal('*');
      expect(args[3]).to.equal('scope'); // Default selection method.
    });

    it('should add listener with default selection method', () => {
      const selListenerStub = env.sandbox.stub(root, 'createSelectiveListener');
      tracker.add(analyticsElement, 'click', {selector: '*'}, handler);
      expect(selListenerStub.args[0][3]).to.be.null; // Default selection method.
    });

    it('should handle click on target', () => {
      tracker.add(analyticsElement, 'click', {selector: '.target'}, handler);
      target.click();
      expect(handler).to.be.calledOnce;
      const event = handler.args[0][0];
      expect(event.target).to.equal(target);
      expect(event.type).to.equal('click');
      expect(event.vars).to.deep.equal({});
    });

    it('should handle click on child', () => {
      tracker.add(analyticsElement, 'click', {selector: '.target'}, handler);
      child.click();
      expect(handler).to.be.calledOnce;
      const event = handler.args[0][0];
      expect(event.target).to.equal(target);
      expect(event.type).to.equal('click');
      expect(event.vars).to.deep.equal({});
    });

    it('should call multiple handlers', () => {
      tracker.add(analyticsElement, 'click', {selector: '.target'}, handler);
      target.click();
      expect(handler).to.be.calledOnce;

      const handler2 = env.sandbox.spy();
      tracker.add(analyticsElement, 'click', {selector: '.target'}, handler2);
      child.click();
      expect(handler).to.be.calledTwice;
      expect(handler2).to.be.calledOnce;
    });

    it('should only stop on the first found target', () => {
      tracker.add(analyticsElement, 'click', {selector: '.target'}, handler);
      const handler2 = env.sandbox.spy();
      tracker.add(analyticsElement, 'click', {selector: '.child'}, handler2);
      target.click();
      child.click();
      expect(handler2).to.be.calledOnce;
      expect(handler).to.be.calledTwice;
    });

    it('should expand data params', () => {
      tracker.add(analyticsElement, 'click', {selector: '.target'}, handler);
      target.setAttribute('data-vars-foo', 'bar');
      target.click();
      const event = handler.args[0][0];
      expect(event.vars).to.deep.equal({'foo': 'bar'});
    });
  });

  describe('ScrollEventTracker', () => {
    let tracker;
    let fakeViewport;
    let getFakeViewportChangedEvent;
    const defaultScrollConfig = {
      'on': AnalyticsEventType.SCROLL,
      'scrollSpec': {
        'verticalBoundaries': [0, 100],
        'horizontalBoundaries': [0, 100],
      },
    };
    let scrollManager;

    beforeEach(() => {
      tracker = root.getTracker(AnalyticsEventType.SCROLL, ScrollEventTracker);
      fakeViewport = {
        'getSize': env.sandbox
          .stub()
          .returns({top: 0, left: 0, height: 200, width: 200}),
        'getScrollTop': env.sandbox.stub().returns(0),
        'getScrollLeft': env.sandbox.stub().returns(0),
        'getLayoutRect': env.sandbox
          .stub()
          .returns({width: 500, height: 500, top: 0, left: 0}),
        'onChanged': env.sandbox.stub(),
      };
      scrollManager = tracker.root_.getScrollManager();
      scrollManager.viewport_ = fakeViewport;

      getFakeViewportChangedEvent = () => {
        const size = fakeViewport.getSize();
        return {
          top: fakeViewport.getScrollTop(),
          left: fakeViewport.getScrollLeft(),
          width: size.width,
          height: size.height,
          relayoutAll: false,
          velocity: 0, // Hack for typing.
        };
      };
    });

    it('should initalize, add listeners and dispose', () => {
      expect(tracker.root).to.equal(root);
      expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(0);

      tracker.add(
        undefined,
        AnalyticsEventType.SCROLL,
        defaultScrollConfig,
        env.sandbox.stub()
      );
      expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(1);

      tracker.dispose();
      expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(0);
    });

    it('fires on scroll', async () => {
      const fn1 = env.sandbox.stub();
      const fn2 = env.sandbox.stub();
      tracker.add(
        undefined,
        AnalyticsEventType.SCROLL,
        defaultScrollConfig,
        fn1
      );
      tracker.add(
        undefined,
        AnalyticsEventType.SCROLL,
        {
          'on': AnalyticsEventType.SCROLL,
          'scrollSpec': {
            'verticalBoundaries': [92],
            'horizontalBoundaries': [92],
          },
        },
        fn2
      );

      await scrollManager.measureRootElement_(true);

      function matcher(expected) {
        return (actual) => {
          return (
            actual.vars.horizontalScrollBoundary === String(expected) ||
            actual.vars.verticalScrollBoundary === String(expected)
          );
        };
      }

      function expectNthCallToMatch(fn, callIndex, expected) {
        expect(
          fn
            .getCall(callIndex)
            .calledWithMatch(env.sandbox.match(matcher(expected)))
        ).to.be.true;
      }

      expect(fn1).to.have.callCount(2);
      expectNthCallToMatch(fn1, 0, 0);
      expectNthCallToMatch(fn1, 1, 0);
      expect(fn2).to.have.not.been.called;

      // Scroll Down
      fakeViewport.getScrollTop.returns(500);
      fakeViewport.getScrollLeft.returns(500);
      await tracker.root_
        .getScrollManager()
        .onScroll_(getFakeViewportChangedEvent());

      expect(fn1).to.have.callCount(4);
      expectNthCallToMatch(fn1, 2, 100);
      expectNthCallToMatch(fn1, 3, 100);
      expect(fn2).to.have.callCount(2);
      expectNthCallToMatch(fn2, 0, 90);
      expectNthCallToMatch(fn2, 1, 90);
    });

    it('ignores resize changes if needed', async () => {
      const fn1 = env.sandbox.stub();
      const fn2 = env.sandbox.stub();
      tracker.add(
        undefined,
        AnalyticsEventType.SCROLL,
        {
          'on': AnalyticsEventType.SCROLL,
          'scrollSpec': {
            'verticalBoundaries': [0, 50, 100],
          },
        },
        fn1
      );
      tracker.add(
        undefined,
        AnalyticsEventType.SCROLL,
        {
          'on': AnalyticsEventType.SCROLL,
          'scrollSpec': {
            'verticalBoundaries': [0, 50, 100],
            'useInitialPageSize': true,
          },
        },
        fn2
      );

      await scrollManager.measureRootElement_(true);

      function matcher(expected) {
        return (actual) => {
          return actual.vars.verticalScrollBoundary === String(expected);
        };
      }

      function expectNthCallToMatch(fn, callIndex, expected) {
        expect(
          fn
            .getCall(callIndex)
            .calledWithMatch(env.sandbox.match(matcher(expected)))
        ).to.be.true;
      }

      expect(fn1).to.have.callCount(1);
      expectNthCallToMatch(fn1, 0, 0);
      expect(fn2).to.have.callCount(1);
      expectNthCallToMatch(fn2, 0, 0);

      // Scroll Down
      fakeViewport.getScrollTop.returns(500);
      fakeViewport.getLayoutRect.returns({
        width: 500,
        height: 1000,
        top: 0,
        left: 0,
      });
      await tracker.root_
        .getScrollManager()
        .onScroll_(getFakeViewportChangedEvent());

      expect(fn1).to.have.callCount(2);
      expectNthCallToMatch(fn1, 1, 50);
      expect(fn2).to.have.callCount(3);
      expectNthCallToMatch(fn2, 1, 50);
      expectNthCallToMatch(fn2, 2, 100);
    });

    it('does not fire duplicates on scroll', async () => {
      const fn1 = env.sandbox.stub();
      tracker.add(
        undefined,
        AnalyticsEventType.SCROLL,
        defaultScrollConfig,
        fn1
      );

      // Scroll Down
      fakeViewport.getScrollTop.returns(10);
      fakeViewport.getScrollLeft.returns(10);
      await tracker.root_
        .getScrollManager()
        .onScroll_(getFakeViewportChangedEvent());

      expect(fn1).to.have.callCount(2);
    });

    it('fails gracefully on bad scroll config', () => {
      const fn1 = env.sandbox.stub();

      allowConsoleError(() => {
        tracker.add(
          undefined,
          AnalyticsEventType.SCROLL,
          {'on': AnalyticsEventType.SCROLL},
          fn1
        );
        expect(fn1).to.have.not.been.called;

        tracker.add(
          undefined,
          AnalyticsEventType.SCROLL,
          {
            'on': AnalyticsEventType.SCROLL,
            'scrollSpec': {},
          },
          fn1
        );
        expect(fn1).to.have.not.been.called;

        tracker.add(
          undefined,
          AnalyticsEventType.SCROLL,
          {
            'on': AnalyticsEventType.SCROLL,
            'scrollSpec': {
              'verticalBoundaries': undefined,
              'horizontalBoundaries': undefined,
            },
          },
          fn1
        );
        expect(fn1).to.have.not.been.called;

        tracker.add(
          undefined,
          AnalyticsEventType.SCROLL,
          {
            'on': AnalyticsEventType.SCROLL,
            'scrollSpec': {
              'verticalBoundaries': [],
              'horizontalBoundaries': [],
            },
          },
          fn1
        );
        expect(fn1).to.have.not.been.called;

        tracker.add(
          undefined,
          AnalyticsEventType.SCROLL,
          {
            'on': AnalyticsEventType.SCROLL,
            'scrollSpec': {
              'verticalBoundaries': ['foo'],
              'horizontalBoundaries': ['foo'],
            },
          },
          fn1
        );
        expect(fn1).to.have.not.been.called;
      });
    });

    it('normalizes boundaries correctly.', () => {
      allowConsoleError(() => {
        expect(tracker.normalizeBoundaries_([])).to.be.empty;
        expect(tracker.normalizeBoundaries_(undefined)).to.be.empty;
        expect(tracker.normalizeBoundaries_(['foo'])).to.be.empty;
        expect(tracker.normalizeBoundaries_(['0', '1'])).to.be.empty;
      });
      expect(tracker.normalizeBoundaries_([1])).to.deep.equal({0: false});
      expect(tracker.normalizeBoundaries_([1, 4, 99, 1001])).to.deep.equal({
        0: false,
        5: false,
        100: false,
      });
    });

    it('fires events on normalized boundaries.', async () => {
      const fn1 = env.sandbox.stub();
      const fn2 = env.sandbox.stub();
      tracker.add(
        undefined,
        AnalyticsEventType.SCROLL,
        {
          'on': AnalyticsEventType.SCROLL,
          'scrollSpec': {
            'verticalBoundaries': [1],
          },
        },
        fn1
      );
      tracker.add(
        undefined,
        AnalyticsEventType.SCROLL,
        {
          'on': AnalyticsEventType.SCROLL,
          'scrollSpec': {
            'verticalBoundaries': [4],
          },
        },
        fn2
      );
      await scrollManager.measureRootElement_(true);
      expect(fn2).to.be.calledOnce;
    });
  });

  describe('CustomEventTracker', () => {
    let tracker;
    let clock;
    const targetReadyPromise = Promise.resolve();
    let getElementSpy;

    beforeEach(() => {
      clock = env.sandbox.useFakeTimers();
      tracker = root.getTracker(AnalyticsEventType.CUSTOM, CustomEventTracker);
      getElementSpy = env.sandbox.spy(root, 'getElement');
    });

    it('should initalize, add listeners and dispose', () => {
      expect(tracker.root).to.equal(root);
      expect(tracker.buffer_).to.exist;
      expect(tracker.sandboxBuffer_).to.exist;

      tracker.dispose();
      expect(tracker.buffer_).to.not.exist;
      expect(tracker.sandboxBuffer_).to.not.exist;
    });

    it('should listen on custom events', () => {
      const handler2 = env.sandbox.spy();
      tracker.add(analyticsElement, 'custom-event-1', {}, handler);
      tracker.add(analyticsElement, 'custom-event-2', {}, handler2);
      tracker.trigger(new AnalyticsEvent(target, 'custom-event-1'));
      expect(getElementSpy).to.be.calledTwice;
      return getElementSpy.returnValues[1].then(() => {
        expect(handler).to.be.calledOnce;
        expect(handler2).to.have.not.been.called;
        tracker.trigger(new AnalyticsEvent(target, 'custom-event-2'));
        return targetReadyPromise.then(() => {
          expect(handler).to.be.calledOnce;
          expect(handler2).to.be.calledOnce;
          tracker.trigger(new AnalyticsEvent(target, 'custom-event-1'));
          return targetReadyPromise.then(() => {
            expect(handler).to.have.callCount(2);
            expect(handler2).to.be.calledOnce;
          });
        });
      });
    });

    it('should support selector', () => {
      let eventResolver1, eventResolver2;
      const eventPromise1 = new Promise((resolve) => {
        eventResolver1 = resolve;
      });
      const eventPromise2 = new Promise((resolve) => {
        eventResolver2 = resolve;
      });
      tracker.add(
        analyticsElement,
        'custom-event',
        {'selector': '.child'},
        handler
      );
      tracker.add(
        analyticsElement,
        'custom-event',
        {'selector': '.target'},
        eventResolver1
      );
      tracker.add(analyticsElement, 'custom-event', {}, eventResolver2);
      tracker.trigger(new AnalyticsEvent(target, 'custom-event'));
      return eventPromise1.then(() => {
        return eventPromise2.then(() => {
          expect(handler).to.not.be.called;
        });
      });
    });

    it('should differ custom event with same name different selector', () => {
      const child2 = win.document.createElement('div');
      child2.classList.add('child2');
      target.appendChild(child2);
      const handler2 = env.sandbox.spy();
      tracker.add(
        analyticsElement,
        'custom-event',
        {'selector': '.child'},
        handler
      );
      tracker.add(
        analyticsElement,
        'custom-event',
        {'selector': '.child2'},
        handler2
      );
      tracker.trigger(new AnalyticsEvent(child, 'custom-event'));
      expect(getElementSpy).to.be.calledTwice;
      return getElementSpy.returnValues[1]
        .then(() => {
          expect(handler).to.be.calledOnce;
          expect(handler2).to.not.be.called;
          handler.resetHistory();
          tracker.trigger(new AnalyticsEvent(child2, 'custom-event'));
        })
        .then(() => {
          expect(handler).to.not.be.called;
          expect(handler2).to.be.calledOnce;
        });
    });

    it('should buffer custom events early on', function* () {
      // Events before listeners added.
      tracker.trigger(new AnalyticsEvent(target, 'custom-event-1'));
      tracker.trigger(new AnalyticsEvent(target, 'custom-event-2'));
      tracker.trigger(new AnalyticsEvent(target, 'custom-event-2'));
      expect(tracker.buffer_['custom-event-1']).to.have.length(1);
      expect(tracker.buffer_['custom-event-2']).to.have.length(2);

      // Listeners added: immediate events fired.
      const handler2 = env.sandbox.spy();
      const handler3 = env.sandbox.spy();
      tracker.add(analyticsElement, 'custom-event-1', {}, handler);
      tracker.add(analyticsElement, 'custom-event-2', {}, handler2);
      tracker.add(analyticsElement, 'custom-event-3', {}, handler3);
      yield getElementSpy.returnValues[2];
      clock.tick(1);
      expect(handler).to.be.calledOnce;
      expect(handler2).to.have.callCount(2);
      expect(handler3).to.have.not.been.called;
      expect(tracker.buffer_['custom-event-1']).to.have.length(1);
      expect(tracker.buffer_['custom-event-2']).to.have.length(2);
      expect(tracker.buffer_['custom-event-3']).to.be.undefined;

      // Second round of events.
      tracker.trigger(new AnalyticsEvent(target, 'custom-event-1'));
      tracker.trigger(new AnalyticsEvent(target, 'custom-event-2'));
      tracker.trigger(new AnalyticsEvent(target, 'custom-event-3'));
      expect(getElementSpy).to.have.callCount(3);

      yield getElementSpy.returnValues[2];

      expect(handler).to.have.callCount(2);
      expect(handler2).to.have.callCount(3);
      expect(handler3).to.be.calledOnce;
      expect(tracker.buffer_['custom-event-1']).to.have.length(2);
      expect(tracker.buffer_['custom-event-2']).to.have.length(3);
      expect(tracker.buffer_['custom-event-3']).to.have.length(1);

      // Buffering time expires.
      clock.tick(10001);
      expect(tracker.buffer_).to.be.undefined;

      // Post-buffering round of events.
      tracker.trigger(new AnalyticsEvent(target, 'custom-event-1'));
      tracker.trigger(new AnalyticsEvent(target, 'custom-event-2'));
      tracker.trigger(new AnalyticsEvent(target, 'custom-event-3'));
      return targetReadyPromise.then(() => {
        expect(handler).to.have.callCount(3);
        expect(handler2).to.have.callCount(4);
        expect(handler3).to.have.callCount(2);
        expect(tracker.buffer_).to.be.undefined;
      });
    });

    it('should not not fire twice from observerable and buffer', function* () {
      tracker.trigger(
        new AnalyticsEvent(target, 'custom-event-1', {'order': '1'})
      );
      tracker.add(analyticsElement, 'custom-event-1', {}, handler);
      yield targetReadyPromise;
      tracker.trigger(
        new AnalyticsEvent(target, 'custom-event-1', {'order': '2'})
      );
      yield targetReadyPromise;
      clock.tick(1);
      expect(handler).to.have.callCount(2);
      expect(handler.firstCall).to.be.calledWith(
        new AnalyticsEvent(target, 'custom-event-1', {'order': '2'})
      );
      expect(handler.secondCall).to.be.calledWith(
        new AnalyticsEvent(target, 'custom-event-1', {'order': '1'})
      );
    });

    it('should buffer sandbox events in different list', function* () {
      // Events before listeners added.
      tracker.trigger(new AnalyticsEvent(target, 'sandbox-1-event-1'));
      tracker.trigger(new AnalyticsEvent(target, 'event-1'));

      expect(tracker.buffer_['event-1']).to.have.length(1);
      expect(tracker.sandboxBuffer_['sandbox-1-event-1']).to.have.length(1);
      clock.tick(10001);
      expect(tracker.buffer_).to.be.undefined;
      expect(tracker.sandboxBuffer_['sandbox-1-event-1']).to.have.length(1);
      tracker.add(analyticsElement, 'sandbox-1-event-1', {}, handler);
      yield targetReadyPromise;
      clock.tick(1);
      expect(handler).to.be.calledOnce;
      expect(tracker.sandboxBuffer_['sandbox-1-event-1']).to.be.undefined;
    });

    it('should keep sandbox buffer before handler is added', function* () {
      tracker.trigger(new AnalyticsEvent(target, 'sandbox-1-event-1'));
      clock.tick(10001);
      tracker.trigger(new AnalyticsEvent(target, 'sandbox-1-event-1'));
      clock.tick(1000);
      tracker.add(analyticsElement, 'sandbox-1-event-1', {}, handler);
      yield targetReadyPromise;
      clock.tick(1);
      expect(handler).to.be.calledTwice;
    });

    it('should handle all events without duplicate trigger', function* () {
      tracker.trigger(
        new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '1'})
      );
      tracker.trigger(
        new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '2'})
      );
      tracker.add(analyticsElement, 'sandbox-1-event-1', {}, handler);
      yield targetReadyPromise;
      tracker.trigger(
        new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '3'})
      );
      yield targetReadyPromise;
      clock.tick(1);
      expect(tracker.sandboxBuffer_['sandbox-1-event-1']).to.be.undefined;
      tracker.trigger(
        new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '4'})
      );
      yield targetReadyPromise;
      expect(handler).to.have.callCount(4);
      expect(handler.firstCall).to.be.calledWith(
        new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '3'})
      );
      expect(handler.secondCall).to.be.calledWith(
        new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '1'})
      );
      expect(handler.thirdCall).to.be.calledWith(
        new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '2'})
      );
      expect(handler.lastCall).to.be.calledWith(
        new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '4'})
      );
    });
  });

  describe('AmpStoryEventTracker', () => {
    let tracker;
    let clock;
    let getRootElementSpy;
    let rootTarget;

    beforeEach(() => {
      clock = env.sandbox.useFakeTimers();
      tracker = root.getTracker(AnalyticsEventType.STORY, AmpStoryEventTracker);
      rootTarget = root.getRootElement();
      getRootElementSpy = env.sandbox.spy(root, 'getRootElement');
    });

    it('should initalize, add listeners, and dispose', () => {
      expect(tracker.root).to.equal(root);
      expect(tracker.buffer_).to.exist;

      tracker.dispose();
      expect(tracker.buffer_).to.not.exist;
    });

    it('should listen on story events', () => {
      const handler2 = env.sandbox.spy();
      tracker.add(analyticsElement, 'story-event-1', {}, handler);
      tracker.add(analyticsElement, 'story-event-2', {}, handler2);
      tracker.trigger(new AnalyticsEvent(target, 'story-event-1'));
      expect(getRootElementSpy).to.be.calledTwice;

      expect(handler).to.be.calledOnce;
      expect(handler2).to.have.not.been.called;
      tracker.trigger(new AnalyticsEvent(target, 'story-event-2'));

      expect(handler).to.be.calledOnce;
      expect(handler2).to.be.calledOnce;
      tracker.trigger(new AnalyticsEvent(target, 'story-event-1'));

      expect(handler).to.have.callCount(2);
      expect(handler2).to.be.calledOnce;
    });

    it('should buffer story events early on', () => {
      // Events before listeners added.
      tracker.trigger(new AnalyticsEvent(target, 'story-event-1'));
      tracker.trigger(new AnalyticsEvent(target, 'story-event-2'));
      tracker.trigger(new AnalyticsEvent(target, 'story-event-2'));
      expect(tracker.buffer_['story-event-1']).to.have.length(1);
      expect(tracker.buffer_['story-event-2']).to.have.length(2);

      // Listeners added: immediate events fired.
      const handler2 = env.sandbox.spy();
      const handler3 = env.sandbox.spy();
      tracker.add(analyticsElement, 'story-event-1', {}, handler);
      tracker.add(analyticsElement, 'story-event-2', {}, handler2);
      tracker.add(
        analyticsElement,
        'story-event-3',
        {on: 'story-event-3'},
        handler3
      );

      expect(handler).to.be.calledOnce;
      expect(handler2).to.have.callCount(2);
      expect(handler3).to.have.not.been.called;
      expect(tracker.buffer_['story-event-1']).to.have.length(1);
      expect(tracker.buffer_['story-event-2']).to.have.length(2);
      expect(tracker.buffer_['story-event-3']).to.be.undefined;

      // Second round of events.
      tracker.trigger(new AnalyticsEvent(target, 'story-event-1'));
      tracker.trigger(new AnalyticsEvent(target, 'story-event-2'));
      tracker.trigger(new AnalyticsEvent(target, 'story-event-3'));
      expect(getRootElementSpy).to.have.callCount(3);

      expect(handler).to.have.callCount(2);
      expect(handler2).to.have.callCount(3);
      expect(handler3).to.be.calledOnce;
      expect(tracker.buffer_['story-event-1']).to.have.length(2);
      expect(tracker.buffer_['story-event-2']).to.have.length(3);
      expect(tracker.buffer_['story-event-3']).to.have.length(1);

      // Buffering time expires.
      clock.tick(10001);
      expect(tracker.buffer_).to.be.undefined;

      // Post-buffering round of events.
      tracker.trigger(new AnalyticsEvent(target, 'story-event-1'));
      tracker.trigger(new AnalyticsEvent(target, 'story-event-2'));
      tracker.trigger(new AnalyticsEvent(target, 'story-event-3'));

      expect(handler).to.have.callCount(3);
      expect(handler2).to.have.callCount(4);
      expect(handler3).to.have.callCount(2);
      expect(tracker.buffer_).to.be.undefined;
    });

    it('should not fire twice from observable and buffer', () => {
      tracker.trigger(
        new AnalyticsEvent(target, 'story-event-1', {'order': '1'})
      );
      tracker.add(target, 'story-event-1', {}, handler);

      tracker.trigger(
        new AnalyticsEvent(target, 'story-event-1', {'order': '2'})
      );

      expect(handler).to.have.callCount(2);
      expect(handler.firstCall).to.be.calledWith(
        new AnalyticsEvent(rootTarget, 'story-event-1', {'order': '1'})
      );
      expect(handler.secondCall).to.be.calledWith(
        new AnalyticsEvent(rootTarget, 'story-event-1', {'order': '2'})
      );
    });

    it('should handle all events without duplicate trigger', () => {
      tracker.trigger(
        new AnalyticsEvent(target, 'story-event-1', {'order': '1'})
      );
      tracker.trigger(
        new AnalyticsEvent(target, 'story-event-1', {'order': '2'})
      );
      tracker.add(analyticsElement, 'story-event-1', {}, handler);

      tracker.trigger(
        new AnalyticsEvent(target, 'story-event-1', {'order': '3'})
      );
      tracker.trigger(
        new AnalyticsEvent(target, 'story-event-1', {'order': '4'})
      );

      expect(handler).to.have.callCount(4);
      expect(handler.firstCall).to.be.calledWith(
        new AnalyticsEvent(rootTarget, 'story-event-1', {'order': '1'})
      );
      expect(handler.secondCall).to.be.calledWith(
        new AnalyticsEvent(rootTarget, 'story-event-1', {'order': '2'})
      );
      expect(handler.thirdCall).to.be.calledWith(
        new AnalyticsEvent(rootTarget, 'story-event-1', {'order': '3'})
      );
      expect(handler.lastCall).to.be.calledWith(
        new AnalyticsEvent(rootTarget, 'story-event-1', {'order': '4'})
      );
    });

    it(
      'should fire event once when repeat option is false and event has ' +
        'not been fired before',
      () => {
        const storyAnalyticsConfig = {
          'on': 'story-page-visible',
          'storySpec': {
            'repeat': false,
          },
        };
        const vars = {
          'storyPageIndex': '0',
          'storyPageId': 'p4',
          'storyPageCount': '4',
          'eventDetails': {'repeated': false},
        };

        tracker.add(
          target,
          'story-page-visible',
          storyAnalyticsConfig,
          handler
        );
        tracker.trigger(new AnalyticsEvent(target, 'story-page-visible', vars));
        expect(handler).to.have.been.calledOnce;
      }
    );

    it('should not fire event when repeat option is false', () => {
      const storyAnalyticsConfig = {
        'on': 'story-page-visible',
        'storySpec': {
          'repeat': false,
        },
      };
      const vars = {
        'storyPageIndex': '0',
        'storyPageId': 'p4',
        'storyPageCount': '4',
        'eventDetails': {'repeated': true},
      };

      tracker.add(target, 'story-page-visible', storyAnalyticsConfig, handler);
      tracker.trigger(new AnalyticsEvent(target, 'story-page-visible', vars));
      expect(handler).to.not.have.been.called;
    });

    it('should fire event more than once when repeat option is absent', () => {
      const storyAnalyticsConfig = {
        'on': 'story-page-visible',
        'storySpec': {},
      };
      const vars = {
        'storyPageIndex': '0',
        'storyPageId': 'p4',
        'storyPageCount': '4',
        'eventDetails': {'repeated': true},
      };

      tracker.add(target, 'story-page-visible', storyAnalyticsConfig, handler);
      tracker.trigger(new AnalyticsEvent(target, 'story-page-visible', vars));
      tracker.trigger(new AnalyticsEvent(target, 'story-page-visible', vars));
      expect(handler).to.have.been.calledTwice;
    });
  });

  describe('SignalTracker', () => {
    let tracker;
    let targetSignals;

    beforeEach(() => {
      tracker = root.getTracker('render-start', SignalTracker);
      target.classList.add('i-amphtml-element');
      targetSignals = new Signals();
      target.signals = () => targetSignals;
    });

    it('should initalize, add listeners and dispose', () => {
      expect(tracker.root).to.equal(root);
    });

    it('should add doc listener', () => {
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      tracker.add(analyticsElement, 'sig1', {}, resolver);
      root.signals().signal('sig1');
      return promise.then((event) => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('sig1');
      });
    });

    it('should add root listener', () => {
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      tracker.add(analyticsElement, 'sig1', {selector: ':root'}, resolver);
      root.signals().signal('sig1');
      return promise.then((event) => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('sig1');
      });
    });

    it('should add host listener equal to root', () => {
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      tracker.add(analyticsElement, 'sig1', {selector: ':host'}, resolver);
      root.signals().signal('sig1');
      return promise.then((event) => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('sig1');
      });
    });

    it('should add target listener', () => {
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      tracker.add(analyticsElement, 'sig1', {selector: '.target'}, resolver);
      targetSignals.signal('sig1');
      return promise.then((event) => {
        expect(event.target).to.equal(target);
        expect(event.type).to.equal('sig1');
      });
    });
  });

  describe('IniLoadTracker', () => {
    let tracker;
    let targetSignals;

    beforeEach(() => {
      tracker = root.getTracker('ini-load', IniLoadTracker);
      target.classList.add('i-amphtml-element');
      targetSignals = new Signals();
      target.signals = () => targetSignals;
    });

    it('should initalize, add listeners and dispose', () => {
      expect(tracker.root).to.equal(root);
    });

    it('should add doc listener', () => {
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      const iniLoadStub = env.sandbox
        .stub(root, 'whenIniLoaded')
        .callsFake(() => Promise.resolve());
      tracker.add(analyticsElement, 'ini-load', {}, resolver);
      return promise.then((event) => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('ini-load');
        expect(iniLoadStub).to.be.calledOnce;
      });
    });

    it('should add root listener', () => {
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      const iniLoadStub = env.sandbox
        .stub(root, 'whenIniLoaded')
        .callsFake(() => Promise.resolve());
      tracker.add(analyticsElement, 'ini-load', {selector: ':root'}, resolver);
      return promise.then((event) => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('ini-load');
        expect(iniLoadStub).to.be.calledOnce;
      });
    });

    it('should add host listener equal to root', () => {
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      const iniLoadStub = env.sandbox
        .stub(root, 'whenIniLoaded')
        .callsFake(() => Promise.resolve());
      tracker.add(analyticsElement, 'sig1', {selector: ':host'}, resolver);
      return promise.then((event) => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('sig1');
        expect(iniLoadStub).to.be.calledOnce;
      });
    });

    it('should add target listener', () => {
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      const spy = env.sandbox.spy(targetSignals, 'whenSignal');
      tracker.add(
        analyticsElement,
        'ini-load',
        {selector: '.target'},
        resolver
      );
      targetSignals.signal('ini-load');
      return promise.then((event) => {
        expect(event.target).to.equal(target);
        expect(event.type).to.equal('ini-load');
        expect(spy).to.be.calledWith('ini-load');
      });
    });

    it('should trigger via load-end as well', () => {
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      const spy = env.sandbox.spy(targetSignals, 'whenSignal');
      tracker.add(
        analyticsElement,
        'ini-load',
        {selector: '.target'},
        resolver
      );
      targetSignals.signal('load-end');
      return promise.then((event) => {
        expect(event.target).to.equal(target);
        expect(event.type).to.equal('ini-load');
        expect(spy).to.be.calledWith('load-end');
      });
    });
  });

  describe('TimerEventTracker', () => {
    let clock;
    let tracker;

    beforeEach(() => {
      clock = fakeTimers.withGlobal(root.ampdoc.win).install();
      tracker = root.getTracker(AnalyticsEventType.TIMER, TimerEventTracker);
    });

    afterEach(() => {
      clock.uninstall();
    });

    function countIntervals() {
      let count = 0;
      for (const t in clock.timers) {
        if (clock.timers[t].interval !== undefined) {
          count++;
        }
      }
      return count;
    }

    it('should initalize, add listeners and dispose', () => {
      expect(tracker.root).to.equal(root);
      expect(tracker.getTrackedTimerKeys()).to.have.length(0);

      tracker.dispose();
      expect(tracker.getTrackedTimerKeys()).to.have.length(0);
    });

    it('should validate timerSpec', () => {
      const handler = env.sandbox.stub();
      allowConsoleError(() => {
        expect(() => {
          tracker.add(analyticsElement, AnalyticsEventType.TIMER, {}, handler);
        }).to.throw(/Bad timer specification/);
        expect(() => {
          tracker.add(
            analyticsElement,
            AnalyticsEventType.TIMER,
            {timerSpec: 1},
            handler
          );
        }).to.throw(/Bad timer specification/);
        expect(() => {
          tracker.add(
            analyticsElement,
            AnalyticsEventType.TIMER,
            {timerSpec: {}},
            handler
          );
        }).to.throw(/Timer interval specification required/);
        expect(() => {
          tracker.add(
            analyticsElement,
            AnalyticsEventType.TIMER,
            {
              timerSpec: {
                interval: null,
              },
            },
            handler
          );
        }).to.throw(/Bad timer interval specification/);
        expect(() => {
          tracker.add(
            analyticsElement,
            AnalyticsEventType.TIMER,
            {
              timerSpec: {
                interval: 'two',
              },
            },
            handler
          );
        }).to.throw(/Bad timer interval specification/);
        expect(() => {
          tracker.add(
            analyticsElement,
            AnalyticsEventType.TIMER,
            {
              timerSpec: {
                interval: 0.1,
              },
            },
            handler
          );
        }).to.throw(/Bad timer interval specification/);
        expect(() => {
          tracker.add(
            analyticsElement,
            AnalyticsEventType.TIMER,
            {
              timerSpec: {
                interval: 0.49,
              },
            },
            handler
          );
        }).to.throw(/Bad timer interval specification/);
        expect(() => {
          tracker.add(
            analyticsElement,
            AnalyticsEventType.TIMER,
            {
              timerSpec: {
                interval: 1,
                maxTimerLength: '',
              },
            },
            handler
          );
        }).to.throw(/Bad maxTimerLength specification/);
        expect(() => {
          tracker.add(
            analyticsElement,
            AnalyticsEventType.TIMER,
            {
              timerSpec: {
                interval: 1,
                maxTimerLength: 0,
              },
            },
            handler
          );
        }).to.throw(/Bad maxTimerLength specification/);
        expect(() => {
          tracker.add(
            analyticsElement,
            AnalyticsEventType.TIMER,
            {
              timerSpec: {
                interval: 1,
                startSpec: {on: 'timer', selector: '.target'},
              },
            },
            handler
          );
        }).to.throw(/Cannot track timer start/);
      });

      expect(handler).to.not.be.called;
      expect(() => {
        tracker.add(
          analyticsElement,
          AnalyticsEventType.TIMER,
          {timerSpec: {interval: 1}},
          handler
        );
      }).to.not.throw();

      const clickTracker = root.getTracker('click', ClickEventTracker);
      expect(() => {
        tracker.add(
          analyticsElement,
          AnalyticsEventType.TIMER,
          {
            timerSpec: {
              startSpec: {on: 'click', selector: '.target'},
              stopSpec: {on: 'click', selector: '.target'},
              interval: 1,
            },
          },
          handler,
          function (unused) {
            return clickTracker;
          }
        );
      }).to.not.throw();
    });

    it('timers start and stop by tracking different events', () => {
      const fn1 = env.sandbox.stub();
      const clickTracker = root.getTracker('click', ClickEventTracker);
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 1,
            startSpec: {on: 'click', selector: '.target'},
            stopSpec: {on: 'click', selector: '.target'},
          },
        },
        fn1,
        function (unused) {
          return clickTracker;
        }
      );
      expect(fn1).to.have.not.been.called;

      clock.tick(5 * 1000); // 5 seconds
      expect(fn1).to.have.not.been.called;

      target.click(); // Start timer.
      expect(fn1).to.be.calledOnce;
      expect(fn1.args[0][0]).to.be.instanceOf(AnalyticsEvent);
      expect(fn1.args[0][0].target).to.equal(root.getRootElement());
      expect(fn1.args[0][0].type).to.equal(AnalyticsEventType.TIMER);
      target.click(); // Stop timer.

      const fn2 = env.sandbox.stub();
      const customTracker = root.getTracker(
        AnalyticsEventType.CUSTOM,
        CustomEventTracker
      );
      const getElementSpy = env.sandbox.spy(root, 'getElement');
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 1,
            startSpec: {on: 'custom-event-start', selector: '.target'},
            stopSpec: {on: 'custom-event-stop', selector: '.target'},
          },
        },
        fn2,
        function (unused) {
          return customTracker;
        }
      );
      expect(fn2).to.have.not.been.called;
      customTracker.trigger(new AnalyticsEvent(target, 'custom-event-start'));

      expect(getElementSpy.returnValues.length).to.equal(1);
      return getElementSpy.returnValues[0].then(() => {
        expect(fn2).to.be.calledOnce;
        expect(fn2.args[0][0]).to.be.instanceOf(AnalyticsEvent);
        expect(fn2.args[0][0].target).to.equal(root.getRootElement());
        expect(fn2.args[0][0].type).to.equal(AnalyticsEventType.TIMER);
        customTracker.trigger(new AnalyticsEvent(target, 'custom-event-stop'));

        expect(getElementSpy.returnValues.length).to.equal(2);
        getElementSpy.returnValues[1].then(() => {
          // Timers have genuinely stopped.
          clock.tick(5 * 1000); // 5 seconds
          expect(fn1).to.have.callCount(1);
          expect(fn2).to.have.callCount(1);
        });
      });
    });

    it(
      'timers started and stopped by the same event on the same target' +
        ' do not have race condition problems',
      () => {
        const fn1 = env.sandbox.stub();
        tracker.add(
          analyticsElement,
          AnalyticsEventType.TIMER,
          {
            timerSpec: {
              interval: 1,
              immediate: false,
              startSpec: {on: 'click', selector: '.target'},
              stopSpec: {on: 'click', selector: '.target'},
            },
          },
          fn1
        );
        expect(fn1).to.have.not.been.called;

        target.click(); // Start timer.
        expect(fn1).to.have.not.been.called;
        target.click(); // Stop timer.
        expect(fn1).to.be.calledOnce;
        target.click(); // Start timer.
        expect(fn1).to.be.calledOnce;
        target.click(); // Stop timer.
        expect(fn1).to.be.calledTwice;
        clock.tick(5);
        target.click(); // Start timer.
        expect(fn1).to.be.calledTwice;
        target.click(); // Stop timer.
        expect(fn1).to.be.calledThrice;
        target.click(); // Start timer.
        expect(fn1).to.be.calledThrice;
        target.click(); // Stop timer.
        expect(fn1).to.have.callCount(4);
        target.click(); // Start timer.
        expect(fn1).to.have.callCount(4);

        clock.tick(3 * 1000); // 3 seconds
        expect(fn1).to.have.callCount(7); // 4 timer stops + 3.005 seconds
      }
    );

    it('only fires when the timer interval exceeds the minimum', () => {
      const fn1 = env.sandbox.stub();
      allowConsoleError(() => {
        expect(() => {
          tracker.add(
            analyticsElement,
            AnalyticsEventType.TIMER,
            {
              timerSpec: {
                interval: 0,
              },
            },
            fn1
          );
        }).to.throw();
      });
      expect(fn1).to.have.not.been.called;

      const fn2 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 1,
          },
        },
        fn2
      );
      expect(fn2).to.be.calledOnce;
      expect(fn2.args[0][0]).to.be.instanceOf(AnalyticsEvent);
      expect(fn2.args[0][0].target).to.equal(root.getRootElement());
      expect(fn2.args[0][0].type).to.equal(AnalyticsEventType.TIMER);
    });

    it('fires on the appropriate interval', () => {
      const fn1 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 10,
          },
        },
        fn1
      );
      expect(fn1).to.be.calledOnce;

      const fn2 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 15,
          },
        },
        fn2
      );
      expect(fn2).to.be.calledOnce;

      const fn3 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 10,
            immediate: false,
          },
        },
        fn3
      );
      expect(fn3).to.have.not.been.called;

      const fn4 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 15,
            immediate: false,
          },
        },
        fn4
      );
      expect(fn4).to.have.not.been.called;

      clock.tick(10 * 1000); // 10 seconds
      expect(fn1).to.have.callCount(2);
      expect(fn2).to.be.calledOnce;
      expect(fn3).to.be.calledOnce;
      expect(fn4).to.have.not.been.called;

      clock.tick(10 * 1000); // 20 seconds
      expect(fn1).to.have.callCount(3);
      expect(fn2).to.have.callCount(2);
      expect(fn3).to.have.callCount(2);
      expect(fn4).to.be.calledOnce;

      clock.tick(10 * 1000); // 30 seconds
      expect(fn1).to.have.callCount(4);
      expect(fn2).to.have.callCount(3);
      expect(fn3).to.have.callCount(3);
      expect(fn4).to.have.callCount(2);

      expect(fn1.args[0][0]).to.be.instanceOf(AnalyticsEvent);
      expect(fn1.args[0][0].target).to.equal(root.getRootElement());
      expect(fn1.args[0][0].type).to.equal(AnalyticsEventType.TIMER);
    });

    it('stops firing after the maxTimerLength is exceeded', () => {
      const fn1 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 10,
            maxTimerLength: 15,
          },
        },
        fn1
      );
      expect(fn1).to.be.calledOnce;

      const fn2 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 10,
            maxTimerLength: 20,
          },
        },
        fn2
      );
      expect(fn2).to.be.calledOnce;

      const fn3 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 3600,
          },
        },
        fn3
      );
      expect(fn3).to.be.calledOnce;

      const fn4 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 10,
            stopSpec: {on: 'click', selector: '.target'},
            maxTimerLength: 20,
          },
        },
        fn4
      );

      const fn5 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 10,
            stopSpec: {on: 'click', selector: '.target'},
          },
        },
        fn5
      );

      expect(tracker.getTrackedTimerKeys()).to.have.length(5);

      clock.tick(10 * 1000); // 10 seconds
      expect(fn1).to.have.callCount(2);
      expect(fn2).to.have.callCount(2);
      expect(fn3).to.have.callCount(1);
      expect(fn4).to.have.callCount(2);
      expect(fn5).to.have.callCount(2);
      expect(tracker.getTrackedTimerKeys()).to.have.length(5);

      clock.tick(10 * 1000); // 20 seconds
      expect(fn1).to.have.callCount(3);
      expect(fn2).to.have.callCount(4);
      expect(fn3).to.have.callCount(1);
      expect(fn4).to.have.callCount(4);
      expect(fn5).to.have.callCount(3);
      expect(tracker.getTrackedTimerKeys()).to.have.length(2);

      clock.tick(10 * 1000); // 30 seconds
      expect(fn1).to.have.callCount(3);
      expect(fn2).to.have.callCount(4);
      expect(fn3).to.have.callCount(1);
      expect(fn4).to.have.callCount(4);
      expect(fn5).to.have.callCount(4);
      expect(tracker.getTrackedTimerKeys()).to.have.length(2);

      // Default maxTimerLength is 2 hours
      clock.tick(3 * 3600 * 1000); // 3 hours
      expect(fn3).to.have.callCount(4); // Hit maxTimerLength and stopped.
      expect(fn5).to.have.callCount(1084);

      // All timers removed except the one that never ends.
      expect(tracker.getTrackedTimerKeys()).to.have.length(1);
    });

    it('should unlisten tracker', () => {
      const fn1 = env.sandbox.stub();
      const u1 = tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 10,
            maxTimerLength: 15,
          },
        },
        fn1
      );
      expect(fn1).to.be.calledOnce;

      const fn2 = env.sandbox.stub();
      const u2 = tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 10,
            maxTimerLength: 20,
          },
        },
        fn2
      );
      expect(fn2).to.be.calledOnce;

      expect(tracker.getTrackedTimerKeys()).to.have.length(2);
      expect(countIntervals()).to.equal(2);

      u1();
      expect(tracker.getTrackedTimerKeys()).to.have.length(1);
      expect(countIntervals()).to.equal(1);

      u2();
      expect(tracker.getTrackedTimerKeys()).to.have.length(0);
      expect(countIntervals()).to.equal(0);
    });

    it('should dispose all trackers', () => {
      const fn1 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 10,
            maxTimerLength: 15,
          },
        },
        fn1
      );
      expect(fn1).to.be.calledOnce;

      const fn2 = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 10,
            maxTimerLength: 20,
          },
        },
        fn2
      );
      expect(fn2).to.be.calledOnce;

      expect(countIntervals()).to.equal(2);

      tracker.dispose();
      expect(countIntervals()).to.equal(0);
    });

    it('should create events with timer vars', () => {
      const handler = env.sandbox.stub();
      tracker.add(
        analyticsElement,
        AnalyticsEventType.TIMER,
        {
          timerSpec: {
            interval: 3,
            immediate: false,
            startSpec: {on: 'click', selector: '.target'},
            stopSpec: {on: 'click', selector: '.target'},
          },
        },
        handler
      );
      expect(handler).to.have.not.been.called;

      // Fake out the time since clock.tick will not actually advance the time.
      let fakeTime = 1000; // 1 second past epoch
      env.sandbox.stub(Date, 'now').callsFake(() => {
        return fakeTime;
      });
      target.click();
      fakeTime = 1600; // Must set fake time before advancing the interval.
      clock.tick(600); // Not a full second.
      target.click();
      expect(handler).to.be.calledOnce;
      const stopEvent1 = handler.args[0][0];
      expect(stopEvent1).to.be.instanceOf(AnalyticsEvent);
      expect(stopEvent1.vars.timerStart).to.equal(1000);
      expect(stopEvent1.vars.timerDuration).to.equal(600);

      target.click();
      expect(handler).to.be.calledOnce;
      fakeTime = 4600;
      clock.tick(3000); // 3 seconds.
      expect(handler).to.have.callCount(2);
      const intervalEvent = handler.args[1][0];
      expect(intervalEvent).to.be.instanceOf(AnalyticsEvent);
      expect(intervalEvent.vars.timerStart).to.equal(1600);
      expect(intervalEvent.vars.timerDuration).to.equal(3000);

      fakeTime = 6200;
      clock.tick(1600); // 4.6 seconds.
      target.click();

      expect(handler).to.have.callCount(3);
      const stopEvent2 = handler.args[2][0];
      expect(stopEvent2).to.be.instanceOf(AnalyticsEvent);
      // Report partial interval time on timer stop between intervals.
      expect(stopEvent2.vars.timerDuration).to.equal(1600);
      expect(stopEvent2.vars.timerStart).to.equal(1600);
    });
  });

  describe('VisibilityTracker', () => {
    let tracker;
    let visibilityManagerMock;
    let iniLoadTrackerMock;
    let targetSignals;
    let eventResolver, eventPromise;
    let saveCallback;
    let matchEmptySpec;
    let matchFunc;
    let getElementSpy;

    beforeEach(() => {
      tracker = root.getTracker('visible', VisibilityTracker);
      visibilityManagerMock = env.sandbox.mock(root.getVisibilityManager());
      getElementSpy = env.sandbox.spy(root, 'getElement');
      tracker.waitForTrackers_['ini-load'] = root.getTracker(
        'ini-load',
        IniLoadTracker
      );
      iniLoadTrackerMock = env.sandbox.mock(
        tracker.waitForTrackers_['ini-load']
      );

      target.parentNode.removeChild(target);

      target = win.document.createElement('amp-list');
      target.classList.add('target');
      win.document.body.appendChild(target);

      child = win.document.createElement('div');
      child.classList.add('child');
      target.appendChild(child);

      target.classList.add('i-amphtml-element');
      targetSignals = new Signals();
      target.signals = () => targetSignals;

      eventPromise = new Promise((resolve) => {
        eventResolver = resolve;
      });

      matchEmptySpec = env.sandbox.match((arg) => {
        return Object.keys(arg).length == 0;
      });
      matchFunc = env.sandbox.match((arg) => {
        if (typeof arg == 'function') {
          const promise = arg();
          if (typeof promise.then == 'function') {
            return true;
          }
        }
        return false;
      });
      saveCallback = env.sandbox.match((arg) => {
        if (typeof arg == 'function') {
          saveCallback.callback = arg;
          return true;
        }
        return false;
      });
    });

    afterEach(() => {
      visibilityManagerMock.verify();
    });

    it('should initialize, add listeners and dispose', () => {
      expect(tracker.root).to.equal(root);
    });

    it('should add doc listener', async () => {
      iniLoadTrackerMock.expects('getRootSignal').never();
      iniLoadTrackerMock.expects('getElementSignal').never();
      visibilityManagerMock
        .expects('listenRoot')
        .withExactArgs(
          matchEmptySpec,
          /* readyPromise */ null,
          /* createReportReadyPromiseFunc */ null,
          saveCallback
        )
        .once()
        .returns(() => {});
      const res = tracker.add(analyticsElement, 'visible', {}, eventResolver);
      expect(res).to.be.a('function');
      await macroTask();
      saveCallback.callback({totalVisibleTime: 10});
      const event = await eventPromise;
      expect(event.target).to.equal(root.getRootElement());
      expect(event.type).to.equal('visible');
      expect(event.vars.totalVisibleTime).to.equal(10);
    });

    it('should add root listener', async () => {
      const config = {selector: ':root'};
      iniLoadTrackerMock.expects('getElementSignal').never();
      const readyPromise = Promise.resolve();
      iniLoadTrackerMock.expects('getRootSignal').returns(readyPromise).once();
      visibilityManagerMock
        .expects('listenRoot')
        .withExactArgs(matchEmptySpec, readyPromise, null, saveCallback)
        .once()
        .returns(() => {});
      const res = tracker.add(
        analyticsElement,
        'visible',
        config,
        eventResolver
      );
      expect(res).to.be.a('function');
      await macroTask();
      saveCallback.callback({totalVisibleTime: 10});
      const event = await eventPromise;
      expect(event.target).to.equal(root.getRootElement());
      expect(event.type).to.equal('visible');
      expect(event.vars.totalVisibleTime).to.equal(10);
    });

    it('should add host listener and spec', async () => {
      const config = {visibilitySpec: {selector: ':host'}};
      iniLoadTrackerMock.expects('getElementSignal').never();
      const readyPromise = Promise.resolve();
      iniLoadTrackerMock.expects('getRootSignal').returns(readyPromise).once();
      visibilityManagerMock
        .expects('listenRoot')
        .withExactArgs(
          config.visibilitySpec,
          readyPromise,
          /* createReportReadyPromiseFunc */ null,
          saveCallback
        )
        .once()
        .returns(() => {});
      const res = tracker.add(
        analyticsElement,
        'visible',
        config,
        eventResolver
      );
      expect(res).to.be.a('function');
      await macroTask();
      saveCallback.callback({totalVisibleTime: 10});
      const event = await eventPromise;
      expect(event.target).to.equal(root.getRootElement());
      expect(event.type).to.equal('visible');
      expect(event.vars.totalVisibleTime).to.equal(10);
    });

    describe('visibility tracker for target selector', () => {
      it('should add target listener', async () => {
        const config = {visibilitySpec: {selector: '.target'}};
        iniLoadTrackerMock.expects('getRootSignal').once();
        const readyPromise = Promise.resolve();
        iniLoadTrackerMock
          .expects('getElementSignal')
          .withExactArgs('ini-load', target)
          .returns(readyPromise)
          .once();
        visibilityManagerMock
          .expects('listenElement')
          .withExactArgs(
            target,
            config.visibilitySpec,
            readyPromise,
            /* createReportReadyPromiseFunc */ null,
            saveCallback
          )
          .once();
        const res = tracker.add(
          analyticsElement,
          'visible',
          config,
          eventResolver
        );
        expect(res).to.be.a('function');
        const unlistenReady = getElementSpy.returnValues[0];
        // #getAmpElement Promise
        await unlistenReady;
        // #assertMeasurable_ Promise
        await macroTask();
        saveCallback.callback({totalVisibleTime: 10});
        const event = await eventPromise;
        expect(event.target).to.equal(target);
        expect(event.type).to.equal('visible');
        expect(event.vars.totalVisibleTime).to.equal(10);
      });

      describe('multi selector visibility trigger', () => {
        let unlisten;
        let unlisten2;
        let config;
        let readyPromise;
        let targetSignals2;
        let saveCallback2;
        let eventsSpy;
        let res;
        let error;
        let target2;

        beforeEach(() => {
          readyPromise = Promise.resolve();
          unlisten = env.sandbox.spy();
          unlisten2 = env.sandbox.spy();
          config = {};

          eventsSpy = env.sandbox.spy(tracker, 'onEvent_');

          target2 = win.document.createElement('amp-list');
          win.document.body.appendChild(target2);

          target2.classList.add('target2');
          target2.classList.add('i-amphtml-element');
          targetSignals2 = new Signals();
          target2.signals = () => targetSignals2;

          target.setAttribute('data-vars-id', '123');
          target2.setAttribute('data-vars-id', '123');

          saveCallback2 = env.sandbox.match((arg) => {
            if (typeof arg == 'function') {
              saveCallback2.callback = arg;
              return true;
            }
            return false;
          });
        });

        afterEach(async () => {
          if (!error) {
            [unlisten, unlisten2].forEach((value) => {
              if (value) {
                expect(value).to.not.be.called;
              }
            });
            expect(res).to.be.a('function');
            await res();
            [unlisten, unlisten2].forEach((value) => {
              if (value) {
                expect(value).to.be.calledOnce;
              }
            });
          }
        });

        it('should fire event per selector', async () => {
          config['visibilitySpec'] = {
            selector: ['.target', '.target2'],
          };
          iniLoadTrackerMock.expects('getRootSignal').twice();
          iniLoadTrackerMock
            .expects('getElementSignal')
            .withExactArgs('ini-load', target)
            .returns(readyPromise)
            .once();
          iniLoadTrackerMock
            .expects('getElementSignal')
            .withExactArgs('ini-load', target2)
            .returns(readyPromise)
            .once();
          visibilityManagerMock
            .expects('listenElement')
            .withExactArgs(
              target,
              config.visibilitySpec,
              readyPromise,
              /* createReportReadyPromiseFunc */ null,
              saveCallback
            )
            .returns(unlisten)
            .once();
          visibilityManagerMock
            .expects('listenElement')
            .withExactArgs(
              target2,
              config.visibilitySpec,
              readyPromise,
              /* createReportReadyPromiseFunc */ null,
              saveCallback2
            )
            .returns(unlisten2)
            .once();
          // Dispose function
          res = tracker.add(analyticsElement, 'visible', config, eventResolver);
          const unlistenReady = getElementSpy.returnValues[0];
          const unlistenReady2 = getElementSpy.returnValues[1];
          // #getAmpElement Promise
          await unlistenReady;
          await unlistenReady2;
          // #assertMeasurable_ Promise
          await macroTask();
          await macroTask();
          saveCallback.callback({totalVisibleTime: 10});
          saveCallback2.callback({totalVisibleTime: 15});

          // Testing that visibilty manager mock sends state to onEvent_
          expect(eventsSpy.getCall(0).args[0]).to.equal('visible');
          expect(eventsSpy.getCall(0).args[1]).to.equal(eventResolver);
          expect(eventsSpy.getCall(0).args[2]).to.equal(target);
          expect(eventsSpy.getCall(0).args[3]).to.deep.equal({
            totalVisibleTime: 10,
            id: '123',
          });
          expect(eventsSpy.getCall(1).args[0]).to.equal('visible');
          expect(eventsSpy.getCall(1).args[1]).to.equal(eventResolver);
          expect(eventsSpy.getCall(1).args[2]).to.equal(target2);
          expect(eventsSpy.getCall(1).args[3]).to.deep.equal({
            totalVisibleTime: 15,
            id: '123',
          });
        });

        it('should error on duplicate selectors', async () => {
          error = true;
          config['visibilitySpec'] = {
            selector: ['.target', '.target'],
          };
          expect(() => {
            tracker.add(analyticsElement, 'visible', config, eventResolver);
          }).to.throw(
            /Cannot have duplicate selectors in selectors list: .target/
          );
        });
      });
    });

    it('should expand data params', async () => {
      target.setAttribute('data-vars-foo', 'bar');

      const config = {selector: '.target'};
      iniLoadTrackerMock.expects('getRootSignal').never();
      const readyPromise = Promise.resolve();

      iniLoadTrackerMock
        .expects('getElementSignal')
        .withExactArgs('ini-load', target)
        .returns(readyPromise)
        .once();
      visibilityManagerMock
        .expects('listenElement')
        .withExactArgs(
          target,
          matchEmptySpec,
          readyPromise,
          /* createReportReadyPromiseFunc */ null,
          saveCallback
        )
        .once();
      const res = tracker.add(
        analyticsElement,
        'visible',
        config,
        eventResolver
      );
      expect(res).to.be.a('function');
      const unlistenReady = getElementSpy.returnValues[0];
      // #getAmpElement Promise
      await unlistenReady;
      // #assertMeasurable_ Promise
      await macroTask();
      saveCallback.callback({totalVisibleTime: 10});
      const event = await eventPromise;
      expect(event.vars.totalVisibleTime).to.equal(10);
      expect(event.vars.foo).to.equal('bar');
    });

    it('should pass func to get reportReady with "hidden" trigger', function* () {
      const config = {visibilitySpec: {selector: '.target', waitFor: 'none'}};
      visibilityManagerMock
        .expects('listenElement')
        .withExactArgs(
          target,
          config.visibilitySpec,
          /* readyPromise */ null,
          /* createReportReadyPromiseFunc */ matchFunc,
          saveCallback
        )
        .returns(null)
        .once();
      tracker.add(analyticsElement, 'hidden', config, eventResolver);
      const unlistenReady = getElementSpy.returnValues[0];
      // #getElement Promise
      yield unlistenReady;
      // #assertMeasurable_ Promise
      yield macroTask();

      // NOTE: createReportReadyPromiseFunc is
      // fully tested in test-visibility-manager

      saveCallback.callback({totalVisibleTime: 10});
      return eventPromise.then((event) => {
        expect(event.vars.totalVisibleTime).to.equal(10);
        expect(event.type).to.equal('hidden');
      });
    });

    describe('should wait on correct readyPromise', () => {
      it('with waitFor NONE', () => {
        expect(tracker.getReadyPromise('none')).to.be.null;
      });

      it('with waitFor INI_LOAD', () => {
        iniLoadTrackerMock
          .expects('getRootSignal')
          .returns(Promise.resolve())
          .twice();
        const promise = tracker.getReadyPromise('ini-load');
        return promise.then(() => {
          iniLoadTrackerMock
            .expects('getElementSignal')
            .withExactArgs('ini-load', target)
            .returns(Promise.resolve())
            .once();
          const promise2 = tracker.getReadyPromise('ini-load', target);
          return promise2;
        });
      });

      it('with waitFor RENDER_START', () => {
        tracker.waitForTrackers_['render-start'] = root.getTracker(
          'render-start',
          SignalTracker
        );
        const signalTrackerMock = env.sandbox.mock(
          tracker.waitForTrackers_['render-start']
        );
        signalTrackerMock
          .expects('getRootSignal')
          .withExactArgs('render-start')
          .returns(Promise.resolve())
          .twice();
        const promise = tracker.getReadyPromise('render-start');
        return promise.then(() => {
          signalTrackerMock
            .expects('getElementSignal')
            .withExactArgs('render-start', target)
            .returns(Promise.resolve())
            .once();
          const promise2 = tracker.getReadyPromise('render-start', target);
          return promise2;
        });
      });

      describe('non AMP elements', () => {
        it('with non AMP element and waitFor NONE or null', () => {
          const element = win.document.createElement('p');
          expect(tracker.getReadyPromise('none', element)).to.be.null;
          expect(tracker.getReadyPromise(null, element)).to.be.null;
          expect(tracker.getReadyPromise(undefined, element)).to.be.null;
        });

        it('error with non AMP element and waitFor not NONE or null', () => {
          const element = win.document.createElement('p');
          expect(() => tracker.getReadyPromise('ini-load', element)).to.throw(
            /waitFor for non-AMP elements must be none or null. Found ini-load/
          );
        });

        it('should set default waitFor for AMP element', async () => {
          const element = win.document.createElement('amp-list');
          tracker.waitForTrackers_['render-start'] = root.getTracker(
            'render-start',
            SignalTracker
          );
          const signalTrackerMock = env.sandbox.mock(
            tracker.waitForTrackers_['render-start']
          );
          const iniLoadTrackerMock = env.sandbox.mock(
            tracker.waitForTrackers_['ini-load']
          );

          await tracker.getReadyPromise(null, element);
          iniLoadTrackerMock
            .expects('getElementSignal')
            .withExactArgs('ini-load', element)
            .returns(Promise.resolve())
            .once();

          await tracker.getReadyPromise('render-start', element);
          signalTrackerMock
            .expects('getElementSignal')
            .withExactArgs('render-start')
            .returns(Promise.resolve())
            .once();
        });
      });
    });

    describe('should create correct reportReadyPromise', () => {
      it('with viewer hidden', () => {
        const stub = env.sandbox.stub(ampdoc, 'isVisible').returns(false);
        const promise = tracker.createReportReadyPromiseForDocumentHidden_();
        return promise.then(() => {
          expect(stub).to.be.calledOnce;
        });
      });

      it('with documentExit trigger on unload if pagehide is unsupported', function* () {
        const config = {visibilitySpec: {reportWhen: 'documentExit'}};
        const tracker = root.getTracker('visible', VisibilityTracker);
        const deferred = new Deferred();
        const handlerSpy = env.sandbox.spy();
        const handler = (event) => {
          deferred.resolve(event);
          handlerSpy();
        };
        env.sandbox.stub(tracker, 'supportsPageHide_').returns(false);

        tracker.add(tracker.root, 'visible', config, handler);

        // Ensure unload event is dispatched after visibiltyModel is ready
        yield macroTask();
        expect(handlerSpy).to.not.be.called;
        win.dispatchEvent(new Event('unload'));

        return deferred.promise.then((event) => {
          expect(event.type).to.equal('visible');
        });
      });

      it('with documentExit trigger on pagehide', function* () {
        const config = {visibilitySpec: {reportWhen: 'documentExit'}};
        const tracker = root.getTracker('visible', VisibilityTracker);

        const deferred = new Deferred();
        const handlerSpy = env.sandbox.spy();
        const handler = (event) => {
          deferred.resolve(event);
          handlerSpy();
        };
        tracker.add(tracker.root, 'visible', config, handler);

        // Ensure pagehide event is dispatched after visibiltyModel is ready
        yield macroTask();
        expect(handlerSpy).to.not.be.called;
        win.dispatchEvent(new Event('pagehide'));

        return deferred.promise.then((event) => {
          expect(event.type).to.equal('visible');
        });
      });

      it('with no trigger on unload if pagehide is supported', function* () {
        const config = {visibilitySpec: {reportWhen: 'documentExit'}};
        const tracker = root.getTracker('visible', VisibilityTracker);
        const deferred = new Deferred();
        const handlerSpy = env.sandbox.spy();
        const handler = (event) => {
          deferred.resolve(event);
          handlerSpy();
        };
        env.sandbox.stub(tracker, 'supportsPageHide_').returns(true);

        tracker.add(tracker.root, 'visible', config, handler);

        yield macroTask();
        expect(handlerSpy).to.not.be.called;
        win.dispatchEvent(new Event('unload'));
        // Should not be triggered

        // Ensure pagehide event is dispatched after visibiltyModel is ready
        yield macroTask();
        expect(handlerSpy).to.not.be.called;
        win.dispatchEvent(new Event('pagehide'));

        return deferred.promise.then((event) => {
          expect(handlerSpy).to.be.calledOnce;
          expect(event.type).to.equal('visible');
        });
      });
    });
  });
});
