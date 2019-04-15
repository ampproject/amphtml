/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import * as lolex from 'lolex';
import {AmpdocAnalyticsRoot} from '../analytics-root';
import {
  AnalyticsEvent,
  ClickEventTracker,
  CustomEventTracker,
  IniLoadTracker,
  ScrollEventTracker,
  SignalTracker,
  TimerEventTracker,
  VisibilityTracker,
} from '../events';
import {Deferred} from '../../../../src/utils/promise';
import {Signals} from '../../../../src/utils/signals';
import {macroTask} from '../../../../testing/yield';


describes.realWin('Events', {amp: 1}, env => {
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
    handler = sandbox.spy();

    analyticsElement = win.document.createElement('amp-analytics');
    win.document.body.appendChild(analyticsElement);

    target = win.document.createElement('div');
    target.classList.add('target');
    win.document.body.appendChild(target);

    child = win.document.createElement('div');
    child.classList.add('child');
    target.appendChild(child);
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
      expect(win.document.eventListeners.count('click'))
          .to.equal(iniEventCount + 1);

      tracker.dispose();
      expect(win.document.eventListeners.count('click'))
          .to.equal(iniEventCount);
    });

    it('should require selector', () => {
      allowConsoleError(() => { expect(() => {
        tracker.add(analyticsElement, 'click', {selector: ''});
      }).to.throw(/Missing required selector/); });
    });

    it('should add listener', () => {
      const selUnlisten = function() {};
      const selListenerStub =
          sandbox.stub(root, 'createSelectiveListener').callsFake(
              () => selUnlisten);
      tracker.add(analyticsElement, 'click',
          {selector: '*', selectionMethod: 'scope'}, handler);
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
      const selListenerStub = sandbox.stub(root, 'createSelectiveListener');
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

      const handler2 = sandbox.spy();
      tracker.add(analyticsElement, 'click', {selector: '.target'}, handler2);
      child.click();
      expect(handler).to.be.calledTwice;
      expect(handler2).to.be.calledOnce;
    });

    it('should only stop on the first found target', () => {
      tracker.add(analyticsElement, 'click', {selector: '.target'}, handler);
      const handler2 = sandbox.spy();
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
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [0, 100],
        'horizontalBoundaries': [0, 100],
      },
    };
    let scrollManager;

    beforeEach(() => {
      tracker = root.getTracker('scroll', ScrollEventTracker);
      fakeViewport = {
        'getSize': sandbox.stub().returns(
            {top: 0, left: 0, height: 200, width: 200}),
        'getScrollTop': sandbox.stub().returns(0),
        'getScrollLeft': sandbox.stub().returns(0),
        'getScrollHeight': sandbox.stub().returns(500),
        'getScrollWidth': sandbox.stub().returns(500),
        'onChanged': sandbox.stub(),
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

      tracker.add(undefined, 'scroll', defaultScrollConfig, sandbox.stub());
      expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(1);

      tracker.dispose();
      expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(0);
    });


    it('fires on scroll', () => {
      const fn1 = sandbox.stub();
      const fn2 = sandbox.stub();
      tracker.add(undefined, 'scroll', defaultScrollConfig, fn1);
      tracker.add(undefined, 'scroll', {
        'on': 'scroll',
        'scrollSpec': {
          'verticalBoundaries': [92],
          'horizontalBoundaries': [92],
        },
      }, fn2);

      function matcher(expected) {
        return actual => {
          return actual.vars.horizontalScrollBoundary === String(expected) ||
            actual.vars.verticalScrollBoundary === String(expected);
        };
      }
      expect(fn1).to.have.callCount(2);
      expect(
          fn1.getCall(0)
              .calledWithMatch(sinon.match(matcher(0)))
      ).to.be.true;
      expect(
          fn1.getCall(1)
              .calledWithMatch(sinon.match(matcher(0)))
      ).to.be.true;
      expect(fn2).to.have.not.been.called;

      // Scroll Down
      fakeViewport.getScrollTop.returns(500);
      fakeViewport.getScrollLeft.returns(500);
      tracker.root_.getScrollManager().onScroll_(getFakeViewportChangedEvent());

      expect(fn1).to.have.callCount(4);
      expect(fn1.getCall(2).calledWithMatch(sinon.match(matcher(100)))).to.be
          .true;
      expect(fn1.getCall(3).calledWithMatch(sinon.match(matcher(100)))).to.be
          .true;
      expect(fn2).to.have.callCount(2);
      expect(
          fn2.getCall(0)
              .calledWithMatch(sinon.match(matcher(90)))
      ).to.be.true;
      expect(
          fn2.getCall(1)
              .calledWithMatch(sinon.match(matcher(90)))
      ).to.be.true;
    });

    it('does not fire duplicates on scroll', () => {
      const fn1 = sandbox.stub();
      tracker.add(undefined, 'scroll', defaultScrollConfig, fn1);

      // Scroll Down
      fakeViewport.getScrollTop.returns(10);
      fakeViewport.getScrollLeft.returns(10);
      tracker.root_.getScrollManager().onScroll_(getFakeViewportChangedEvent());

      expect(fn1).to.have.callCount(2);
    });

    it('fails gracefully on bad scroll config', () => {
      const fn1 = sandbox.stub();

      allowConsoleError(() => {
        tracker.add(undefined, 'scroll', {'on': 'scroll'}, fn1);
        expect(fn1).to.have.not.been.called;

        tracker.add(undefined, 'scroll', {
          'on': 'scroll',
          'scrollSpec': {},
        }, fn1);
        expect(fn1).to.have.not.been.called;

        tracker.add(undefined, 'scroll', {
          'on': 'scroll',
          'scrollSpec': {
            'verticalBoundaries': undefined, 'horizontalBoundaries': undefined,
          },
        }, fn1);
        expect(fn1).to.have.not.been.called;

        tracker.add(undefined, 'scroll', {
          'on': 'scroll',
          'scrollSpec': {'verticalBoundaries': [], 'horizontalBoundaries': []},
        }, fn1);
        expect(fn1).to.have.not.been.called;

        tracker.add(undefined, 'scroll', {
          'on': 'scroll',
          'scrollSpec': {
            'verticalBoundaries': ['foo'], 'horizontalBoundaries': ['foo'],
          },
        }, fn1);
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

    it('fires events on normalized boundaries.', () => {
      const fn1 = sandbox.stub();
      const fn2 = sandbox.stub();
      tracker.add(undefined, 'scroll', {
        'on': 'scroll',
        'scrollSpec': {
          'verticalBoundaries': [1],
        },
      }, fn1);
      tracker.add(undefined, 'scroll', {
        'on': 'scroll',
        'scrollSpec': {
          'verticalBoundaries': [4],
        },
      }, fn2);
      expect(fn2).to.be.calledOnce;
    });
  });


  describe('CustomEventTracker', () => {
    let tracker;
    let clock;
    const targetReadyPromise = Promise.resolve();
    let getElementSpy;


    beforeEach(() => {
      clock = sandbox.useFakeTimers();
      tracker = root.getTracker('custom', CustomEventTracker);
      getElementSpy = sandbox.spy(root, 'getElement');
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
      const handler2 = sandbox.spy();
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
      const eventPromise1 = new Promise(resolve => {
        eventResolver1 = resolve;
      });
      const eventPromise2 = new Promise(resolve => {
        eventResolver2 = resolve;
      });
      tracker.add(
          analyticsElement, 'custom-event', {'selector': '.child'}, handler);
      tracker.add(analyticsElement,
          'custom-event', {'selector': '.target'}, eventResolver1);
      tracker.add(
          analyticsElement, 'custom-event', {}, eventResolver2);
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
      const handler2 = sandbox.spy();
      tracker.add(
          analyticsElement, 'custom-event', {'selector': '.child'}, handler);
      tracker.add(
          analyticsElement, 'custom-event', {'selector': '.child2'}, handler2);
      tracker.trigger(new AnalyticsEvent(child, 'custom-event'));
      expect(getElementSpy).to.be.calledTwice;
      return getElementSpy.returnValues[1].then(() => {
        expect(handler).to.be.calledOnce;
        expect(handler2).to.not.be.called;
        handler.resetHistory();
        tracker.trigger(new AnalyticsEvent(child2, 'custom-event'));
      }).then(() => {
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
      const handler2 = sandbox.spy();
      const handler3 = sandbox.spy();
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
          new AnalyticsEvent(target, 'custom-event-1', {'order': '1'}));
      tracker.add(analyticsElement, 'custom-event-1', {}, handler);
      yield targetReadyPromise;
      tracker.trigger(
          new AnalyticsEvent(target, 'custom-event-1', {'order': '2'}));
      yield targetReadyPromise;
      clock.tick(1);
      expect(handler).to.have.callCount(2);
      expect(handler.firstCall).to.be.calledWith(new AnalyticsEvent(
          target, 'custom-event-1', {'order': '2'}));
      expect(handler.secondCall).to.be.calledWith(new AnalyticsEvent(
          target, 'custom-event-1', {'order': '1'}));
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
          new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '1'}));
      tracker.trigger(
          new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '2'}));
      tracker.add(analyticsElement, 'sandbox-1-event-1', {}, handler);
      yield targetReadyPromise;
      tracker.trigger(
          new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '3'}));
      yield targetReadyPromise;
      clock.tick(1);
      expect(tracker.sandboxBuffer_['sandbox-1-event-1']).to.be.undefined;
      tracker.trigger(
          new AnalyticsEvent(target, 'sandbox-1-event-1', {'order': '4'}));
      yield targetReadyPromise;
      expect(handler).to.have.callCount(4);
      expect(handler.firstCall).to.be.calledWith(new AnalyticsEvent(
          target, 'sandbox-1-event-1', {'order': '3'}));
      expect(handler.secondCall).to.be.calledWith(new AnalyticsEvent(
          target, 'sandbox-1-event-1', {'order': '1'}));
      expect(handler.thirdCall).to.be.calledWith(new AnalyticsEvent(
          target, 'sandbox-1-event-1', {'order': '2'}));
      expect(handler.lastCall).to.be.calledWith(new AnalyticsEvent(
          target, 'sandbox-1-event-1', {'order': '4'}));
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
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      tracker.add(analyticsElement, 'sig1', {}, resolver);
      root.signals().signal('sig1');
      return promise.then(event => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('sig1');
      });
    });

    it('should add root listener', () => {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      tracker.add(analyticsElement, 'sig1', {selector: ':root'}, resolver);
      root.signals().signal('sig1');
      return promise.then(event => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('sig1');
      });
    });

    it('should add host listener equal to root', () => {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      tracker.add(analyticsElement, 'sig1', {selector: ':host'}, resolver);
      root.signals().signal('sig1');
      return promise.then(event => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('sig1');
      });
    });

    it('should add target listener', () => {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      tracker.add(analyticsElement, 'sig1', {selector: '.target'}, resolver);
      targetSignals.signal('sig1');
      return promise.then(event => {
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
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      const iniLoadStub = sandbox.stub(root, 'whenIniLoaded').callsFake(
          () => Promise.resolve());
      tracker.add(analyticsElement, 'ini-load', {}, resolver);
      return promise.then(event => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('ini-load');
        expect(iniLoadStub).to.be.calledOnce;
      });
    });

    it('should add root listener', () => {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      const iniLoadStub = sandbox.stub(root, 'whenIniLoaded').callsFake(
          () => Promise.resolve());
      tracker.add(analyticsElement, 'ini-load', {selector: ':root'}, resolver);
      return promise.then(event => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('ini-load');
        expect(iniLoadStub).to.be.calledOnce;
      });
    });

    it('should add host listener equal to root', () => {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      const iniLoadStub = sandbox.stub(root, 'whenIniLoaded').callsFake(
          () => Promise.resolve());
      tracker.add(analyticsElement, 'sig1', {selector: ':host'}, resolver);
      return promise.then(event => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('sig1');
        expect(iniLoadStub).to.be.calledOnce;
      });
    });

    it('should add target listener', () => {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      const spy = sandbox.spy(targetSignals, 'whenSignal');
      tracker.add(analyticsElement, 'ini-load', {selector: '.target'},
          resolver);
      targetSignals.signal('ini-load');
      return promise.then(event => {
        expect(event.target).to.equal(target);
        expect(event.type).to.equal('ini-load');
        expect(spy).to.be.calledWith('ini-load');
      });
    });

    it('should trigger via load-end as well', () => {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      const spy = sandbox.spy(targetSignals, 'whenSignal');
      tracker.add(analyticsElement, 'ini-load', {selector: '.target'},
          resolver);
      targetSignals.signal('load-end');
      return promise.then(event => {
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
      clock = lolex.install({target: root.ampdoc.win});
      tracker = root.getTracker('timer', TimerEventTracker);
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
      const handler = sandbox.stub();
      allowConsoleError(() => {
        expect(() => {
          tracker.add(analyticsElement, 'timer', {}, handler);
        }).to.throw(/Bad timer specification/);
        expect(() => {
          tracker.add(analyticsElement, 'timer', {timerSpec: 1}, handler);
        }).to.throw(/Bad timer specification/);
        expect(() => {
          tracker.add(analyticsElement, 'timer', {timerSpec: {}}, handler);
        }).to.throw(/Timer interval specification required/);
        expect(() => {
          tracker.add(analyticsElement, 'timer', {timerSpec: {
            interval: null,
          }}, handler);
        }).to.throw(/Bad timer interval specification/);
        expect(() => {
          tracker.add(analyticsElement, 'timer', {timerSpec: {
            interval: 'two',
          }}, handler);
        }).to.throw(/Bad timer interval specification/);
        expect(() => {
          tracker.add(analyticsElement, 'timer', {timerSpec: {
            interval: 0.1,
          }}, handler);
        }).to.throw(/Bad timer interval specification/);
        expect(() => {
          tracker.add(analyticsElement, 'timer', {timerSpec: {
            interval: 0.49,
          }}, handler);
        }).to.throw(/Bad timer interval specification/);
        expect(() => {
          tracker.add(analyticsElement, 'timer', {timerSpec: {
            interval: 1,
            maxTimerLength: '',
          }}, handler);
        }).to.throw(/Bad maxTimerLength specification/);
        expect(() => {
          tracker.add(analyticsElement, 'timer', {timerSpec: {
            interval: 1,
            maxTimerLength: 0,
          }}, handler);
        }).to.throw(/Bad maxTimerLength specification/);
        expect(() => {
          tracker.add(analyticsElement, 'timer', {timerSpec: {
            interval: 1,
            startSpec: {on: 'timer', selector: '.target'},
          }}, handler);
        }).to.throw(/Cannot track timer start/);
      });

      expect(handler).to.not.be.called;
      expect(() => {
        tracker.add(analyticsElement, 'timer',
            {timerSpec: {interval: 1}}, handler);
      }).to.not.throw();

      const clickTracker = root.getTracker('click', ClickEventTracker);
      expect(() => {
        tracker.add(analyticsElement, 'timer',
            {
	      timerSpec: {
	        startSpec: {on: 'click', selector: '.target'},
	        stopSpec: {on: 'click', selector: '.target'},
	        interval: 1},
	    }, handler, function(unused) { return clickTracker; });
      }).to.not.throw();
    });

    it('timers start and stop by tracking different events', () => {
      const fn1 = sandbox.stub();
      const clickTracker = root.getTracker('click', ClickEventTracker);
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 1,
        startSpec: {on: 'click', selector: '.target'},
        stopSpec: {on: 'click', selector: '.target'},
      }}, fn1, function(unused) { return clickTracker; });
      expect(fn1).to.have.not.been.called;

      clock.tick(5 * 1000); // 5 seconds
      expect(fn1).to.have.not.been.called;

      target.click(); // Start timer.
      expect(fn1).to.be.calledOnce;
      expect(fn1.args[0][0]).to.be.instanceOf(AnalyticsEvent);
      expect(fn1.args[0][0].target).to.equal(root.getRootElement());
      expect(fn1.args[0][0].type).to.equal('timer');
      target.click(); // Stop timer.

      const fn2 = sandbox.stub();
      const customTracker = root.getTracker('custom', CustomEventTracker);
      const getElementSpy = sandbox.spy(root, 'getElement');
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 1,
        startSpec: {on: 'custom-event-start', selector: '.target'},
        stopSpec: {on: 'custom-event-stop', selector: '.target'},
      }}, fn2, function(unused) { return customTracker; });
      expect(fn2).to.have.not.been.called;
      customTracker.trigger(new AnalyticsEvent(target, 'custom-event-start'));

      expect(getElementSpy.returnValues.length).to.equal(1);
      return getElementSpy.returnValues[0].then(() => {
        expect(fn2).to.be.calledOnce;
        expect(fn2.args[0][0]).to.be.instanceOf(AnalyticsEvent);
        expect(fn2.args[0][0].target).to.equal(root.getRootElement());
        expect(fn2.args[0][0].type).to.equal('timer');
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

    it('timers started and stopped by the same event on the same target'
        + ' do not have race condition problems', () => {
      const fn1 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 1,
        immediate: false,
        startSpec: {on: 'click', selector: '.target'},
        stopSpec: {on: 'click', selector: '.target'},
      }}, fn1);
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
    });

    it('only fires when the timer interval exceeds the minimum', () => {
      const fn1 = sandbox.stub();
      allowConsoleError(() => { expect(() => {
        tracker.add(analyticsElement, 'timer', {timerSpec: {
          interval: 0,
        }}, fn1);
      }).to.throw(); });
      expect(fn1).to.have.not.been.called;

      const fn2 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 1,
      }}, fn2);
      expect(fn2).to.be.calledOnce;
      expect(fn2.args[0][0]).to.be.instanceOf(AnalyticsEvent);
      expect(fn2.args[0][0].target).to.equal(root.getRootElement());
      expect(fn2.args[0][0].type).to.equal('timer');
    });

    it('fires on the appropriate interval', () => {
      const fn1 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 10,
      }}, fn1);
      expect(fn1).to.be.calledOnce;

      const fn2 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 15,
      }}, fn2);
      expect(fn2).to.be.calledOnce;

      const fn3 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 10,
        immediate: false,
      }}, fn3);
      expect(fn3).to.have.not.been.called;

      const fn4 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 15,
        immediate: false,
      }}, fn4);
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
      expect(fn1.args[0][0].type).to.equal('timer');
    });

    it('stops firing after the maxTimerLength is exceeded', () => {
      const fn1 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 10,
        maxTimerLength: 15,
      }}, fn1);
      expect(fn1).to.be.calledOnce;

      const fn2 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 10,
        maxTimerLength: 20,
      }}, fn2);
      expect(fn2).to.be.calledOnce;

      const fn3 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 3600,
      }}, fn3);
      expect(fn3).to.be.calledOnce;

      const fn4 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 10,
        stopSpec: {on: 'click', selector: '.target'},
        maxTimerLength: 20,
      }}, fn4);

      const fn5 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 10,
        stopSpec: {on: 'click', selector: '.target'},
      }}, fn5);

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
      const fn1 = sandbox.stub();
      const u1 = tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 10,
        maxTimerLength: 15,
      }}, fn1);
      expect(fn1).to.be.calledOnce;

      const fn2 = sandbox.stub();
      const u2 = tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 10,
        maxTimerLength: 20,
      }}, fn2);
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
      const fn1 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 10,
        maxTimerLength: 15,
      }}, fn1);
      expect(fn1).to.be.calledOnce;

      const fn2 = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 10,
        maxTimerLength: 20,
      }}, fn2);
      expect(fn2).to.be.calledOnce;

      expect(countIntervals()).to.equal(2);

      tracker.dispose();
      expect(countIntervals()).to.equal(0);
    });

    it('should create events with timer vars', () => {
      const handler = sandbox.stub();
      tracker.add(analyticsElement, 'timer', {timerSpec: {
        interval: 3,
        immediate: false,
        startSpec: {on: 'click', selector: '.target'},
        stopSpec: {on: 'click', selector: '.target'},
      }}, handler);
      expect(handler).to.have.not.been.called;

      // Fake out the time since clock.tick will not actually advance the time.
      let fakeTime = 1000; // 1 second past epoch
      sandbox.stub(Date, 'now').callsFake(() => { return fakeTime; });
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
    let getAmpElementSpy;

    beforeEach(() => {
      tracker = root.getTracker('visible', VisibilityTracker);
      visibilityManagerMock = sandbox.mock(root.getVisibilityManager());
      getAmpElementSpy = sandbox.spy(root, 'getAmpElement');
      tracker.waitForTrackers_['ini-load'] =
          root.getTracker('ini-load', IniLoadTracker);
      iniLoadTrackerMock = sandbox.mock(tracker.waitForTrackers_['ini-load']);

      target.classList.add('i-amphtml-element');
      targetSignals = new Signals();
      target.signals = () => targetSignals;

      eventPromise = new Promise(resolve => {
        eventResolver = resolve;
      });

      matchEmptySpec = sinon.match(arg => {
        return Object.keys(arg).length == 0;
      });
      matchFunc = sinon.match(arg => {
        if (typeof arg == 'function') {
          const promise = arg();
          if (typeof promise.then == 'function') {
            return true;
          }
        }
        return false;
      });
      saveCallback = sinon.match(arg => {
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

    it('should add doc listener', function* () {
      const unlisten = sandbox.spy();
      iniLoadTrackerMock.expects('getRootSignal').never();
      iniLoadTrackerMock.expects('getElementSignal').never();
      visibilityManagerMock
          .expects('listenRoot')
          .withExactArgs(
              matchEmptySpec,
              /* readyPromise */ null,
              /* createReportReadyPromiseFunc */ null,
              saveCallback)
          .returns(unlisten)
          .once();
      tracker.add(analyticsElement, 'visible', {}, eventResolver);
      yield macroTask();
      saveCallback.callback({totalVisibleTime: 10});
      return eventPromise.then(function *(event) {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('visible');
        expect(event.vars.totalVisibleTime).to.equal(10);
        yield macroTask();
        expect(unlisten).to.be.called;
      });
    });

    it('should add root listener', function* () {
      const config = {selector: ':root'};
      const unlisten = sandbox.spy();
      iniLoadTrackerMock.expects('getElementSignal').never();
      const readyPromise = Promise.resolve();
      iniLoadTrackerMock
          .expects('getRootSignal')
          .returns(readyPromise)
          .once();
      visibilityManagerMock
          .expects('listenRoot')
          .withExactArgs(
              matchEmptySpec,
              readyPromise,
              null,
              saveCallback)
          .returns(unlisten)
          .once();
      tracker.add(analyticsElement,
          'visible', config, eventResolver);
      yield macroTask();
      saveCallback.callback({totalVisibleTime: 10});
      return eventPromise.then(function* (event) {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('visible');
        expect(event.vars.totalVisibleTime).to.equal(10);
        yield macroTask();
        expect(unlisten).to.be.called;
      });
    });

    it('should add host listener and spec', function* () {
      const config = {visibilitySpec: {selector: ':host'}};
      const unlisten = sandbox.spy();
      iniLoadTrackerMock.expects('getElementSignal').never();
      const readyPromise = Promise.resolve();
      iniLoadTrackerMock
          .expects('getRootSignal')
          .returns(readyPromise)
          .once();
      visibilityManagerMock
          .expects('listenRoot')
          .withExactArgs(
              config.visibilitySpec,
              readyPromise,
              /* createReportReadyPromiseFunc */ null,
              saveCallback)
          .returns(unlisten)
          .once();
      tracker.add(analyticsElement,
          'visible', config, eventResolver);
      yield macroTask();
      saveCallback.callback({totalVisibleTime: 10});
      return eventPromise.then(function* (event) {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('visible');
        expect(event.vars.totalVisibleTime).to.equal(10);
        yield macroTask();
        expect(unlisten).to.be.called;
      });
    });

    it('should add target listener', function* () {
      const config = {visibilitySpec: {selector: '.target'}};
      const unlisten = sandbox.spy();
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
              saveCallback)
          .returns(unlisten)
          .once();
      const res = tracker.add(analyticsElement,
          'visible', config, eventResolver);
      expect(res).to.be.a('function');
      const unlistenReady = getAmpElementSpy.returnValues[0];
      // #getAmpElement Promise
      yield unlistenReady;
      // #assertMeasurable_ Promise
      yield macroTask();
      saveCallback.callback({totalVisibleTime: 10});
      return eventPromise.then(function* (event) {
        expect(event.target).to.equal(target);
        expect(event.type).to.equal('visible');
        expect(event.vars.totalVisibleTime).to.equal(10);
        yield macroTask();
        expect(unlisten).to.be.calledOnce;
      });
    });

    it('should expand data params', function* () {
      target.setAttribute('data-vars-foo', 'bar');

      const config = {selector: '.target'};
      const unlisten = sandbox.spy();
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
              saveCallback)
          .returns(unlisten)
          .once();
      tracker.add(analyticsElement, 'visible', config, eventResolver);
      const unlistenReady = getAmpElementSpy.returnValues[0];
      // #getAmpElement Promise
      yield unlistenReady;
      // #assertMeasurable_ Promise
      yield macroTask();
      saveCallback.callback({totalVisibleTime: 10});
      return eventPromise.then(function* (event) {
        expect(event.vars.totalVisibleTime).to.equal(10);
        expect(event.vars.foo).to.equal('bar');
        yield macroTask();
        expect(unlisten).to.be.calledOnce;
      });
    });

    it('should pass func to get reportReady with "hidden" trigger',
        function* () {
          const config =
            {visibilitySpec: {selector: '.target', waitFor: 'none'}};
          visibilityManagerMock
              .expects('listenElement')
              .withExactArgs(
                  target,
                  config.visibilitySpec,
                  /* readyPromise */ null,
                  /* createReportReadyPromiseFunc */ matchFunc,
                  saveCallback)
              .returns(null)
              .once();
          tracker.add(analyticsElement, 'hidden', config, eventResolver);
          const unlistenReady = getAmpElementSpy.returnValues[0];
          // #getAmpElement Promise
          yield unlistenReady;
          // #assertMeasurable_ Promise
          yield macroTask();

          // NOTE: createReportReadyPromiseFunc is
          // fully tested in test-visibility-manager

          saveCallback.callback({totalVisibleTime: 10});
          return eventPromise.then(event => {
            expect(event.vars.totalVisibleTime).to.equal(10);
            expect(event.type).to.equal('hidden');
          });
        });

    describe('should wait on correct readyPromise', () => {
      const selector = '.target';

      it('with waitFor default value', () => {
        // Default case: selector is not specified
        expect(tracker.getReadyPromise(undefined, undefined)).to.be.null;
        // Default case: waitFor is not specified, no AMP element selected
        iniLoadTrackerMock
            .expects('getRootSignal')
            .returns(Promise.resolve())
            .once();
        const waitForTracker1 = tracker.getReadyPromise(undefined, ':root');
        return waitForTracker1.then(() => {
          iniLoadTrackerMock
              .expects('getElementSignal')
              .withExactArgs('ini-load', target)
              .returns(Promise.resolve())
              .once();
          // Default case: waitFor is not specified, AMP element selected
          const promise2 = tracker.getReadyPromise(undefined, selector, target);
          target.signals().signal('ini-load');
          return promise2;
        });
      });

      it('with waitFor NONE', () => {
        expect(tracker.getReadyPromise('none', undefined, undefined))
            .to.be.null;
        expect(tracker.getReadyPromise('none', ':root', undefined))
            .to.be.null;
        expect(tracker.getReadyPromise('none', selector, target))
            .to.be.null;
      });

      it('with waitFor INI_LOAD', () => {
        iniLoadTrackerMock
            .expects('getRootSignal')
            .returns(Promise.resolve())
            .twice();
        const promise =
            tracker.getReadyPromise('ini-load', undefined, undefined);
        return promise.then(() => {
          const promise1 =
            tracker.getReadyPromise('ini-load', ':root', undefined);
          return promise1.then(() => {
            iniLoadTrackerMock
                .expects('getElementSignal')
                .withExactArgs('ini-load', target)
                .returns(Promise.resolve())
                .once();
            const promise2 =
                tracker.getReadyPromise('ini-load', selector, target);
            return promise2;
          });
        });
      });

      it('with waitFor RENDER_START', () => {
        tracker.waitForTrackers_['render-start'] =
            root.getTracker('render-start', SignalTracker);
        const signalTrackerMock =
            sandbox.mock(tracker.waitForTrackers_['render-start']);
        signalTrackerMock
            .expects('getRootSignal')
            .withExactArgs('render-start')
            .returns(Promise.resolve())
            .twice();
        const promise =
            tracker.getReadyPromise('render-start', undefined, undefined);
        return promise.then(() => {
          const promise1 =
              tracker.getReadyPromise('render-start', ':root', undefined);
          return promise1.then(() => {
            signalTrackerMock
                .expects('getElementSignal')
                .withExactArgs('render-start', target)
                .returns(Promise.resolve())
                .once();
            const promise2 =
                tracker.getReadyPromise('render-start', selector, target);
            return promise2;
          });
        });
      });
    });

    describe('should create correct reportReadyPromise', () => {
      it('with viewer hidden', () => {
        const stub = sandbox.stub(tracker.root, 'getViewer').callsFake(() => {
          return {
            isVisible: () => {return false;},
          };
        });
        const promise = tracker.createReportReadyPromiseForDocumentHidden_();
        return promise.then(() => {
          expect(stub).to.be.calledOnce;
        });
      });

      it('with documentExit trigger on unload', function* () {
        const config = {visibilitySpec: {reportWhen: 'documentExit'}};
        const tracker = root.getTracker('visible', VisibilityTracker);
        const deferred = new Deferred();
        const handlerSpy = sandbox.spy();
        const handler = event => {
          deferred.resolve(event);
          handlerSpy();
        };

        tracker.add(tracker.root, 'visible', config, handler);

        // Ensure unload event is dispatched after visibiltyModel is ready
        yield macroTask();
        expect(handlerSpy).to.not.be.called;
        win.dispatchEvent(new Event('unload'));

        return deferred.promise.then(event => {
          expect(event.type).to.equal('visible');
        });
      });

      it('with documentExit trigger on pagehide', function* () {
        const config = {visibilitySpec: {reportWhen: 'documentExit'}};
        const tracker = root.getTracker('visible', VisibilityTracker);

        const deferred = new Deferred();
        const handlerSpy = sandbox.spy();
        const handler = event => {
          deferred.resolve(event);
          handlerSpy();
        };
        tracker.add(tracker.root, 'visible', config, handler);

        // Ensure pagehide event is dispatched after visibiltyModel is ready
        yield macroTask();
        expect(handlerSpy).to.not.be.called;
        win.dispatchEvent(new Event('pagehide'));

        return deferred.promise.then(event => {
          expect(event.type).to.equal('visible');
        });
      });
    });

    describe('Unmeasurable with HostAPI', () => {
      beforeEach(() => {
        sandbox.stub(tracker.root, 'isUsingHostAPI').callsFake(() => {
          return Promise.resolve(true);
        });
      });

      it('element level selector is unmeasurable', () => {
        expectAsyncConsoleError(
            /Element  .target that is not root is not supported with host API/);
        const config =
            {visibilitySpec: {selector: '.target'}};
        tracker.add(analyticsElement, 'visible', config, eventResolver);
      });

      it('reportWhen documentExit is unmeasurable', () => {
        expectAsyncConsoleError(
            /reportWhen : documentExit is not supported with host API/);
        const config =
            {visibilitySpec: {selector: ':root', reportWhen: 'documentExit'}};
        tracker.add(analyticsElement, 'visible', config, eventResolver);
      });
    });
  });
});
