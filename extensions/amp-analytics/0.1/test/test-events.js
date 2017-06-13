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

import {AmpdocAnalyticsRoot} from '../analytics-root';
import {
  AnalyticsEvent,
  ClickEventTracker,
  CustomEventTracker,
  IniLoadTracker,
  SignalTracker,
  VisibilityTracker,
} from '../events';
import {Signals} from '../../../../src/utils/signals';
import * as sinon from 'sinon';


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
      tracker = new ClickEventTracker(root);
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
      expect(() => {
        tracker.add(analyticsElement, 'click', {selector: ''});
      }).to.throw(/Missing required selector/);
    });

    it('should add listener', () => {
      const selUnlisten = function() {};
      const selListenerStub = sandbox.stub(root, 'createSelectiveListener',
          () => selUnlisten);
      tracker.add(analyticsElement, 'click',
          {selector: '*', selectionMethod: 'scope'}, handler);
      expect(tracker.clickObservable_.getHandlerCount()).to.equal(1);
      expect(tracker.clickObservable_.handlers_[0]).to.equal(selUnlisten);
      expect(selListenerStub).to.be.calledOnce;
      const args = selListenerStub.args[0];
      expect(args[0]).to.be.function;
      expect(args[1]).to.equal(win.document.body);  // Parent element of amp-analytics.
      expect(args[2]).to.equal('*');
      expect(args[3]).to.equal('scope');  // Default selection method.
    });

    it('should add listener with default selection method', () => {
      const selListenerStub = sandbox.stub(root, 'createSelectiveListener');
      tracker.add(analyticsElement, 'click', {selector: '*'}, handler);
      expect(selListenerStub.args[0][3]).to.be.null;  // Default selection method.
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


  describe('CustomEventTracker', () => {
    let tracker;
    let clock;
    const targetReadyPromise = Promise.resolve();
    let getElementSpy;


    beforeEach(() => {
      clock = sandbox.useFakeTimers();
      tracker = new CustomEventTracker(root);
      getElementSpy = sandbox.spy(root, 'getElement');
    });

    it('should initalize, add listeners and dispose', () => {
      expect(tracker.root).to.equal(root);
      expect(tracker.buffer_).to.exist;

      tracker.dispose();
      expect(tracker.buffer_).to.not.exist;
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
        handler.reset();
        tracker.trigger(new AnalyticsEvent(child2, 'custom-event'));
      }).then(() => {
        expect(handler).to.not.be.called;
        expect(handler2).to.be.calledOnce;
      });
    });

    it('should buffer custom events early on', () => {
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

      return getElementSpy.returnValues[2].then(() => {
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
    });
  });


  describe('SignalTracker', () => {
    let tracker;
    let targetSignals;

    beforeEach(() => {
      tracker = new SignalTracker(root);
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
      tracker = new IniLoadTracker(root);
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
      const iniLoadStub = sandbox.stub(root, 'whenIniLoaded',
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
      const iniLoadStub = sandbox.stub(root, 'whenIniLoaded',
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
      const iniLoadStub = sandbox.stub(root, 'whenIniLoaded',
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
      tracker = new VisibilityTracker(root);
      visibilityManagerMock = sandbox.mock(root.getVisibilityManager());
      getAmpElementSpy = sandbox.spy(root, 'getAmpElement');
      tracker.waitForTrackers_['ini-load'] = new IniLoadTracker(tracker.root);
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

    it('should initalize, add listeners and dispose', () => {
      expect(tracker.root).to.equal(root);
    });

    it('should add doc listener', () => {
      const unlisten = function() {};
      iniLoadTrackerMock.expects('getRootSignal').never();
      iniLoadTrackerMock.expects('getElementSignal').never();
      visibilityManagerMock
          .expects('listenRoot')
          .withExactArgs(
          matchEmptySpec,
          /* readyPromise */ null,
          /* createReadyReportPromiseFunc */ null,
          saveCallback)
          .returns(unlisten)
          .once();
      const res = tracker.add(analyticsElement, 'visible', {}, eventResolver);
      expect(res).to.equal(unlisten);
      saveCallback.callback({totalVisibleTime: 10});
      return eventPromise.then(event => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('visible');
        expect(event.vars.totalVisibleTime).to.equal(10);
      });
    });

    it('should add root listener', () => {
      const config = {selector: ':root'};
      const unlisten = function() {};
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
      const res = tracker.add(analyticsElement,
          'visible', config, eventResolver);
      expect(res).to.equal(unlisten);
      saveCallback.callback({totalVisibleTime: 10});
      return eventPromise.then(event => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('visible');
        expect(event.vars.totalVisibleTime).to.equal(10);
      });
    });

    it('should add host listener and spec', () => {
      const config = {visibilitySpec: {selector: ':host'}};
      const unlisten = function() {};
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
          /* createReadyReportPromiseFunc */ null,
          saveCallback)
          .returns(unlisten)
          .once();
      const res = tracker.add(analyticsElement,
          'visible', config, eventResolver);
      expect(res).to.equal(unlisten);
      saveCallback.callback({totalVisibleTime: 10});
      return eventPromise.then(event => {
        expect(event.target).to.equal(root.getRootElement());
        expect(event.type).to.equal('visible');
        expect(event.vars.totalVisibleTime).to.equal(10);
      });
    });

    it('should add target listener', () => {
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
          /* createReadyReportPromiseFunc */ null,
          saveCallback)
          .returns(unlisten)
          .once();
      const res = tracker.add(analyticsElement,
          'visible', config, eventResolver);
      expect(res).to.be.function;
      const unlistenReady = getAmpElementSpy.returnValues[0];

      return unlistenReady.then(() => {
        saveCallback.callback({totalVisibleTime: 10});
        return eventPromise.then(event => {
          expect(event.target).to.equal(target);
          expect(event.type).to.equal('visible');
          expect(event.vars.totalVisibleTime).to.equal(10);

          // Test unlisten.
          expect(unlisten).to.not.be.called;
          res();
        }).then(() => {
          expect(unlisten).to.be.calledOnce;
        });
      });
    });

    it('should expand data params', () => {
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
          /* createReadyReportPromiseFunc */ null,
          saveCallback)
          .returns(unlisten)
          .once();
      tracker.add(analyticsElement, 'visible', config, eventResolver);
      const unlistenReady = getAmpElementSpy.returnValues[0];
      return unlistenReady.then(() => {
        saveCallback.callback({totalVisibleTime: 10});
        return eventPromise.then(event => {
          expect(event.vars.totalVisibleTime).to.equal(10);
          expect(event.vars.foo).to.equal('bar');
        });
      });
    });

    it('should pass func to get reportReady with "hidden" trigger', () => {
      const config = {visibilitySpec: {selector: '.target', waitFor: 'none'}};
      visibilityManagerMock
          .expects('listenElement')
          .withExactArgs(
          target,
          config.visibilitySpec,
          /* readyPromise */ null,
          /* createReadyReportPromiseFunc */ matchFunc,
          saveCallback)
          .returns(null)
          .once();
      tracker.add(analyticsElement, 'hidden-v3', config, eventResolver);
      const unlistenReady = getAmpElementSpy.returnValues[0];
      // NOTE: createReadyReportPromiseFunc is
      // fully tested in test-visibility-manager
      return unlistenReady.then(() => {
        saveCallback.callback({totalVisibleTime: 10});
        return eventPromise.then(event => {
          expect(event.vars.totalVisibleTime).to.equal(10);
          expect(event.type).to.equal('hidden-v3');
        });
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
            new SignalTracker(tracker.root);
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

    describe('should create correct readyReportPromise', () => {
      it('with viewer hidden', () => {
        const stub = sandbox.stub(tracker.root, 'getViewer', () => {
          return {
            isVisible: () => {return false;},
          };
        });
        const promise = tracker.createReportReadyPromise_();
        return promise.then(() => {
          expect(stub).to.be.calledOnce;
        });
      });
    });
  });
});
