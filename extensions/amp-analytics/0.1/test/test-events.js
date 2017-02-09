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
  SignalTracker,
} from '../events';
import {Signals} from '../../../../src/utils/signals';


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

    beforeEach(() => {
      clock = sandbox.useFakeTimers();
      tracker = new CustomEventTracker(root);
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
      expect(handler).to.be.calledOnce;
      expect(handler2).to.have.not.been.called;

      tracker.trigger(new AnalyticsEvent(target, 'custom-event-2'));
      expect(handler).to.be.calledOnce;
      expect(handler2).to.be.calledOnce;

      tracker.trigger(new AnalyticsEvent(target, 'custom-event-1'));
      expect(handler).to.have.callCount(2);
      expect(handler2).to.be.calledOnce;
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
      expect(handler).to.have.callCount(3);
      expect(handler2).to.have.callCount(4);
      expect(handler3).to.have.callCount(2);
      expect(tracker.buffer_).to.be.undefined;
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
});
