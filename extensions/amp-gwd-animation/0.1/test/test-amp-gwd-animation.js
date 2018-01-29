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
import {
  GWD_PAGEDECK_ID,
  TAG,
  addAction,
} from '../amp-gwd-animation';
import {
  ANIMATIONS_DISABLED_CLASS,
  CURRENT_LABEL_ANIMATION_ATTR,
  GWD_PAGE_WRAPPER_CLASS,
  GWD_SERVICE_NAME,
  PlaybackCssClass,
  AmpGwdRuntimeService,
} from '../amp-gwd-animation-impl';
import {getServiceForDoc} from '../../../../src/service';
import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {Services} from '../../../../src/services';
import * as sinon from 'sinon';

describes.sandboxed('AMP GWD Animation', {}, () => {
  /**
   * Creates a test amp-gwd-animation element in the given document.
   * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Object} attrs Attributes to set on the element.
   */
  function createGwdAnimationElement(ampdoc, attrs) {
    const element =
        ampdoc.getBody().ownerDocument.createElement(TAG);
    for (const attr in attrs) {
      element.setAttribute(attr, attrs[attr]);
    }
    ampdoc.getBody().appendChild(element);
    element.build();
    return element;
  }

  /**
   * Exercises the given invocation with each of the required arguments
   * undefined to test that the invoked action fails quietly.
   * @param {!Object} impl Extension class implementation.
   * @param {!Object} invocation Action invocation to execute.
   */
  function invokeWithSomeArgsUndefined(impl, invocation) {
    for (const argName in invocation.args) {
      // Temporarily delete the arg and test that the function can be executed
      // without errors.
      const oldValue = invocation.args[argName];
      delete invocation.args[argName];
      impl.executeAction(invocation);
      invocation.args[argName] = oldValue;
    }
  }

  describes.repeated('in single and shadow doc', {
    'single ampdoc': {ampdoc: 'single'},
    'shadow ampdoc': {ampdoc: 'shadow'},
  }, (name, variant) => {

    describes.realWin('in iframe', {
      amp: {
        ampdoc: variant.ampdoc,
        extensions: ['amp-gwd-animation'],
      },
    }, env => {
      let ampdoc;
      let element;
      let impl;
      let page1Elem;
      let sandbox;
      let initializeSpy;

      before(() => {
        // The service's bodyAvailable callback will execute once the iframe is
        // ready but before any beforEach hooks, so test that the service
        // initializes by spying on the method here.
        // TODO(sklobovskaya): initialize_() should remain private as it's not
        // part of the service's public API, but stubbing it here is the only
        // way to verify it is called. Revisit if another solution becomes
        // available.
        sandbox = sinon.sandbox.create();
        initializeSpy =
            sandbox.spy(AmpGwdRuntimeService.prototype, 'initialize_');
      });

      beforeEach(() => {
        ampdoc = env.ampdoc;

        ampdoc.getBody().innerHTML =
            `<amp-carousel id="pagedeck"
                on="slideChange:node1.hide;event1:node1.show">
              <div id="page1" class="${GWD_PAGE_WRAPPER_CLASS}">
                <div>
                  <div id="not-an-event"></div>
                  <div id="event1" data-event-name="event-1"></div>
                  <div id="event2" data-event-name="event-2"></div>
                </div>
              </div>
              <div id="page2" class="${GWD_PAGE_WRAPPER_CLASS}"></div>
            </amp-carousel>`;

        element = createGwdAnimationElement(ampdoc, {
          'id': 'gwdAnim',
          'timeline-event-prefix': 'tl_',
          'layout': 'nodisplay',
        });

        impl = element.implementation_;
        page1Elem = ampdoc.getRootNode().getElementById('page1');
      });

      afterEach(() => {
        ampdoc.getBody().innerHTML = '';
      });

      // TODO(#7846): This test case verifies the GWD runtime disables itself
      // initially. It skips doing so for now because the AMP runtime does not
      // yet invoke setEnabled. Uncomment the test case when this integration is
      // complete.
      /*
      it('should immediately disable animations', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          expect(ampdoc.getBody().classList.contains(ANIMATIONS_DISABLED_CLASS))
              .to.be.true;
        });
      });
      */

      it('should initialize on bodyAvailable', () => {
        // Waiting for bodyAvailable is only necessary here to avoid JS errors
        // caused by beforeEach building the element after a test case
        // environment has already been disposed.
        return ampdoc.whenBodyAvailable().then(() => {
          expect(initializeSpy).to.be.called;
          sandbox.restore();
        });
      });

      it('should initially enable animations on GWD page 1', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          // Execute the initialize step (normally executed on bodyAvailable).
          const runtime = getServiceForDoc(ampdoc, GWD_SERVICE_NAME);
          runtime.initialize_();

          // Page 1 should have been enabled.
          const page1 = ampdoc.getRootNode().getElementById('page1');
          expect(page1.classList.contains(PlaybackCssClass.PLAY)).to.be.true;

          // Page 2 should remain unaffected.
          const page2 = ampdoc.getRootNode().getElementById('page2');
          expect(page2.classList.contains(PlaybackCssClass.PLAY)).to.be.false;
        });
      });

      it('should install slideChange listeners on the GWD pagedeck', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          const pagedeck = ampdoc.getRootNode().getElementById(GWD_PAGEDECK_ID);
          expect(pagedeck.getAttribute('on')).to.contain('setCurrentPage');
          // @see addAction test case below.
        });
      });

      it('should set a page as current', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          // Set page 1 as current.
          const page1 = ampdoc.getRootNode().getElementById('page1');
          page1.classList.add(PlaybackCssClass.PLAY);

          // Change to page 2.
          const runtime = getServiceForDoc(ampdoc, GWD_SERVICE_NAME);
          runtime.setCurrentPage(1);

          expect(page1.classList.contains(PlaybackCssClass.PLAY)).to.be.false;

          const page2 = ampdoc.getRootNode().getElementById('page2');
          expect(page2.classList.contains(PlaybackCssClass.PLAY)).to.be.true;
        });
      });

      it('should disable and re-enable', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          getServiceForDoc(ampdoc, GWD_SERVICE_NAME).setEnabled(true);
          expect(ampdoc.getBody().classList.contains(ANIMATIONS_DISABLED_CLASS))
              .to.be.false;

          getServiceForDoc(ampdoc, GWD_SERVICE_NAME).setEnabled(false);
          expect(ampdoc.getBody().classList.contains(ANIMATIONS_DISABLED_CLASS))
              .to.be.true;
        });
      });

      it('should execute play', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          // Pause an animation to test resuming it.
          const pauseInvocation = {
            method: 'pause',
            args: {id: 'page1'},
            satisfiesTrust: () => true,
          };
          impl.executeAction(pauseInvocation);

          const playInvocation = {
            method: 'play',
            args: {id: 'page1'},
            satisfiesTrust: () => true,
          };
          impl.executeAction(playInvocation);
          expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE))
              .to.be.false;

          // Repeated play invocations should have no change.
          impl.executeAction(playInvocation);
          expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE))
              .to.be.false;

          // Test handling missing arguments.
          invokeWithSomeArgsUndefined(impl, playInvocation);
        });
      });

      it('should execute pause', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          const invocation = {
            method: 'pause',
            args: {id: 'page1'},
            satisfiesTrust: () => true,
          };

          impl.executeAction(invocation);
          expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE))
              .to.be.true;

          // Repeated pause invocations should have no change.
          impl.executeAction(invocation);
          expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE))
              .to.be.true;

          // Test handling missing arguments.
          invokeWithSomeArgsUndefined(impl, invocation);
        });
      });

      it('should execute togglePlay', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          const invocation = {
            method: 'togglePlay',
            args: {id: 'page1'},
            satisfiesTrust: () => true,
          };

          impl.executeAction(invocation);
          expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE))
              .to.be.true;

          impl.executeAction(invocation);
          expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE))
              .to.be.false;

          // Test handling missing arguments.
          invokeWithSomeArgsUndefined(impl, invocation);
        });
      });

      it('should execute gotoAndPlay', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          const invocation = {
            method: 'gotoAndPlay',
            args: {id: 'page1', label: 'foo'},
            satisfiesTrust: () => true,
          };
          impl.executeAction(invocation);
          expect(page1Elem.classList.contains('foo')).to.be.true;
          expect(page1Elem.getAttribute(CURRENT_LABEL_ANIMATION_ATTR))
              .to.equal('foo');

          // Repeated invocations should have no effect (animation will be
          // restarted, however).
          impl.executeAction(invocation);
          expect(page1Elem.classList.contains('foo')).to.be.true;
          expect(page1Elem.getAttribute(CURRENT_LABEL_ANIMATION_ATTR))
              .to.equal('foo');

          // Change to a different label.
          invocation.args.label = 'bar';
          impl.executeAction(invocation);
          expect(page1Elem.classList.contains('foo')).to.be.false;
          expect(page1Elem.classList.contains('bar')).to.be.true;
          expect(page1Elem.getAttribute(CURRENT_LABEL_ANIMATION_ATTR))
              .to.equal('bar');

          // Test handling missing arguments.
          invokeWithSomeArgsUndefined(impl, invocation);
        });
      });

      it('should execute gotoAndPause', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          // Test handling missing arguments.
          const invocation = {
            method: 'gotoAndPause',
            args: {id: 'page1', label: 'foo'},
            satisfiesTrust: () => true,
          };
          invokeWithSomeArgsUndefined(impl, invocation);

          // gotoAndPause invokes a pause after a short delay, but waiting for
          // this time to pass makes the test flaky. Stub setTimeout to
          // execute the callback synchronously.
          const origSetTimeout = ampdoc.win.setTimeout;
          ampdoc.win.setTimeout = func => func();

          // Test a valid gotoAndPause invocation. Verify animation was
          // switched to the label and has been paused.
          impl.executeAction(invocation);
          expect(page1Elem.classList.contains('foo')).to.be.true;
          expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE))
              .to.be.true;

          ampdoc.win.setTimeout = origSetTimeout;
        });
      });

      it('should execute gotoAndPlayNTimes', () => {
        return ampdoc.whenBodyAvailable().then(() => {
          // Invoking gotoAndPlayNTimes with a negative N value is a no-op.
          const invocationWithBadNValue = {
            method: 'gotoAndPlayNTimes',
            args: {id: 'page1', label: 'foo', N: -5},
            event: {eventName: 'event-1'},
            satisfiesTrust: () => true,
          };

          impl.executeAction(invocationWithBadNValue);
          expect(page1Elem.classList.contains('foo')).to.be.false;

          // Initialize a valid gotoAndPlayNTimes invocation from some event.
          const invocation = {
            method: 'gotoAndPlayNTimes',
            args: {id: 'page1', label: 'foo', N: 2},
            event: {eventName: 'event-1'},
            satisfiesTrust: () => true,
          };

          // gotoAndPlay call #1 from 'event-1'.
          impl.executeAction(invocation);
          expect(page1Elem.classList.contains('foo')).to.be.true;

          page1Elem.classList.remove('foo');

          // gotoAndPlay call #2 from 'event-1'.
          impl.executeAction(invocation);
          expect(page1Elem.classList.contains('foo')).to.be.true;

          page1Elem.classList.remove('foo');

          // gotoAndPlay call #3 from 'event-1'. The number of invocations
          // from event 'event-1' is now past the specified max count, so this
          // and subsequent gotoAndPlayNTimes invocations from this event should
          // have no effect.
          impl.executeAction(invocation);
          impl.executeAction(invocation);
          expect(page1Elem.classList.contains('foo')).to.be.false;

          // gotoAndPlayNTimes invocations originating from a different timeline
          // event begin their own counters.
          const invocationFromEvent2 = {
            method: 'gotoAndPlayNTimes',
            args: {id: 'page1', label: 'foo', N: 1},
            event: {eventName: 'event-2'}, // Different event.
            satisfiesTrust: () => true,
          };

          impl.executeAction(invocationFromEvent2);
          expect(page1Elem.classList.contains('foo')).to.be.true;

          page1Elem.classList.remove('foo');

          // Counter for 'event-2' has now run out; no more gotoAndPlays may
          // execute.
          impl.executeAction(invocationFromEvent2);
          expect(page1Elem.classList.contains('foo')).to.be.false;

          // Test handling missing arguments.
          invokeWithSomeArgsUndefined(impl, invocation);
        });
      });

      it('should trigger timeline events', () => {
        const triggeredAmpEventNames = [];
        const triggeredEvents = [];
        sandbox.stub(Services.actionServiceForDoc(ampdoc), 'trigger').callsFake(
            (target, name, event) => {
              triggeredAmpEventNames.push(name);
              triggeredEvents.push(event);
            });

        return ampdoc.whenBodyAvailable().then(() => {
          const animationendEvent =
              new AnimationEvent('animationend', {bubbles: true});

          // Dispatch `animationend` events on GWD event elements and on a
          // non-event element (to test it is ignored).
          ampdoc.getRootNode().getElementById('event1').dispatchEvent(
              animationendEvent);
          ampdoc.getRootNode().getElementById('event2').dispatchEvent(
              animationendEvent);
          ampdoc.getRootNode().getElementById('not-an-event').dispatchEvent(
              animationendEvent);

          expect(triggeredAmpEventNames)
              .to.deep.equal(['tl_event-1', 'tl_event-2']);
          expect(triggeredEvents.map(event => event.eventName))
              .to.deep.equal(['event-1', 'event-2']);
        });

        it('should get the receiver element by id if it exists', () => {
          const runtime = getServiceForDoc(ampdoc, GWD_SERVICE_NAME);

          expect(runtime.getReceiver('document.body')).to.equal(
              ampdoc.getBody());
          expect(runtime.getReceiver('page1')).to.equal(page1Elem);
          expect(runtime.getReceiver('nonexistentElement')).to.be.null;
        });
      });
    });
  });
});

describe('addAction', () => {
  let ampdoc;

  beforeEach(() => {
    ampdoc = new AmpDocSingle(window);
  });

  it('should insert when no existing actions', () => {
    const element = document.createElement('div');

    addAction(ampdoc, element, 'event1', 'node1.foo()');

    expect(element.getAttribute('on')).to.equal('event1:node1.foo()');
  });

  it('should insert when actions defined for this event', () => {
    const element = document.createElement('div');
    element.setAttribute('on', 'event1:node2.hide;event2:node2.show');

    addAction(ampdoc, element, 'event1', 'node1.foo()');

    expect(element.getAttribute('on')).to.equal(
        'event1:node1.foo(),node2.hide;event2:node2.show');
  });

  it('should insert when actions defined for other events only', () => {
    const element = document.createElement('div');
    element.setAttribute('on', 'event2:node2.hide');

    addAction(ampdoc, element, 'event1', 'node1.foo()');

    expect(element.getAttribute('on')).to.equal(
        'event2:node2.hide;event1:node1.foo()');
  });
});
