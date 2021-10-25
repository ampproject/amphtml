import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';

import {getServiceForDocOrNull} from '../../../../src/service-helpers';
import {GWD_PAGEDECK_ID, TAG, addAction} from '../amp-gwd-animation';
import {
  ANIMATIONS_DISABLED_CLASS,
  CURRENT_LABEL_ANIMATION_ATTR,
  GOTO_COUNTER_PROP,
  GWD_PAGE_WRAPPER_CLASS,
  GWD_SERVICE_NAME,
  GWD_TIMELINE_EVENT,
  PlaybackCssClass,
} from '../amp-gwd-animation-impl';

describes.sandboxed('AMP GWD Animation', {}, (env) => {
  /**
   * Creates a test amp-gwd-animation element in the given document.
   * @param {!Document} root
   * @param {!Object} attrs Attributes to set on the element.
   * @return {!Promise}
   */
  function createGwdAnimationElement(root, attrs) {
    const element = root.createElement(TAG);
    for (const attr in attrs) {
      element.setAttribute(attr, attrs[attr]);
    }
    root.body.appendChild(element);
    return element.buildInternal().then(() => element);
  }

  /**
   * Exercises the given invocation with each of the required arguments
   * undefined to test that the invoked action fails quietly.
   * @param {!Object} impl Extension class implementation.
   * @param {!Object} invocation Action invocation to execute.
   */
  function invokeWithSomeArgsUndefined(impl, invocation) {
    // These invocations are expected to generate console errors in most cases.
    allowConsoleError(() => {
      for (const argName in invocation.args) {
        // Temporarily delete the arg and test that the function can be executed
        // without errors.
        const oldValue = invocation.args[argName];
        delete invocation.args[argName];
        impl.executeAction(invocation);
        invocation.args[argName] = oldValue;
      }
    });
  }

  describes.repeated(
    '',
    {
      'in top-level document': {ampdoc: 'single'},
      'in FIE document': {ampdoc: 'fie'},
    },
    (name, variant) => {
      describes.realWin(
        '',
        {
          amp: {
            ampdoc: variant.ampdoc,
            extensions: ['amp-gwd-animation'],
          },
        },
        (env) => {
          let ampdoc;
          let element;
          let impl;
          let page1Elem;
          let win;
          let doc;
          let runtime;

          beforeEach(() => {
            ampdoc = env.ampdoc;
            win = ampdoc.win;
            doc = ampdoc.getRootNode();

            // Create a test amp-carousel GWD page deck.
            doc.body.innerHTML = `<amp-carousel id="pagedeck"
                on="slideChange:node1.hide;event1:node1.show">
              <div id="page1" class="${GWD_PAGE_WRAPPER_CLASS}">
                <div>
                  <div id="not-an-event"></div>
                  <div id="grandchild"></div>
                  <div id="event1" data-event-name="event-1"></div>
                  <div id="event2" data-event-name="event-2"></div>
                </div>
              </div>
              <div id="page2" class="${GWD_PAGE_WRAPPER_CLASS}"></div>
            </amp-carousel>`;

            // Create a test amp-gwd-animation element.
            const config = {
              'id': 'gwdAnim',
              'timeline-event-prefix': 'tl_',
              'layout': 'nodisplay',
            };
            return createGwdAnimationElement(doc, config)
              .then((el) => {
                element = el;
                runtime = getServiceForDocOrNull(element, GWD_SERVICE_NAME);
                page1Elem = doc.getElementById('page1');
                return element.getImpl(false);
              })
              .then((aImpl) => {
                impl = aImpl;
              });
          });

          afterEach(() => {
            doc.body.innerHTML = '';
          });

          // TODO(#7846): This test case verifies the GWD runtime disables itself
          // initially. It skips doing so for now because the AMP runtime does not
          // yet invoke setEnabled. Uncomment the test case when this integration is
          // complete.
          /*
      it('should immediately disable animations', () => {
        return ampdoc.waitForBodyOpen().then(() => {
          expect(doc.body.classList.contains(ANIMATIONS_DISABLED_CLASS))
            .to.be.true;
        });
      });
      */

          it('should initially enable animations on GWD page 1', () => {
            // Page 1 should have been enabled.
            const page1 = doc.getElementById('page1');
            expect(page1.classList.contains(PlaybackCssClass.PLAY)).to.be.true;

            // Page 2 should remain unaffected.
            const page2 = doc.getElementById('page2');
            expect(page2.classList.contains(PlaybackCssClass.PLAY)).to.be.false;
          });

          it('should install slideChange listeners on the GWD pagedeck', () => {
            const pagedeck = doc.getElementById(GWD_PAGEDECK_ID);
            expect(pagedeck.getAttribute('on')).to.contain('setCurrentPage');
            // @see addAction test case below.
          });

          it('should change the current page on pagedeck slideChange', () => {
            const pagedeck = doc.getElementById(GWD_PAGEDECK_ID);
            const page1 = doc.getElementById('page1');
            const page2 = doc.getElementById('page2');

            // Verify the first page was activated on initialization.
            expect(page1.classList.contains(PlaybackCssClass.PLAY)).to.be.true;

            // Trigger a setCurrentPage action as though it originated from a
            // pagedeck slideChange event and verify that page 2 is activated.
            const setCurrentPageInvocation = {
              method: 'setCurrentPage',
              args: {index: 1},
              source: pagedeck,
              caller: pagedeck,
              satisfiesTrust: () => true,
            };
            impl.executeAction(setCurrentPageInvocation);

            expect(page1.classList.contains(PlaybackCssClass.PLAY)).to.be.false;
            expect(page2.classList.contains(PlaybackCssClass.PLAY)).to.be.true;

            // Simulate setCurrentPage from a slideChange event which originated
            // from some other carousel. There should be no page change.
            const otherSetCurrentPageInvocation = {
              method: 'setCurrentPage',
              args: {index: 0},
              source: null,
              caller: pagedeck,
              satisfiesTrust: () => true,
            };
            impl.executeAction(otherSetCurrentPageInvocation);

            expect(page1.classList.contains(PlaybackCssClass.PLAY)).to.be.false;
            expect(page2.classList.contains(PlaybackCssClass.PLAY)).to.be.true;

            // Remove the pagedeck element and verify that triggering
            // setCurrentPage does not throw errors. Set a null source on the
            // dummy invocation to test the comparison to a null pagedeck
            // reference.
            pagedeck.remove();
            otherSetCurrentPageInvocation.source = null;
            impl.executeAction(otherSetCurrentPageInvocation);
          });

          it('should activate and deactivate pages', () => {
            const page1 = doc.getElementById('page1');
            const grandchild = page1.querySelector('#grandchild');
            const page2 = doc.getElementById('page2');

            // Activate page 1.
            runtime.setCurrentPage(0);

            // Animations should be enabled on page1 only.
            expect(page1.classList.contains(PlaybackCssClass.PLAY)).to.be.true;
            expect(page2.classList.contains(PlaybackCssClass.PLAY)).to.be.false;

            // Set an active label animation, goto counters, and a pause on
            // several descendant elements and the page element itself to test
            // that this state is reset when the page is deactivated.
            page1.classList.add(PlaybackCssClass.PAUSE);
            grandchild.classList.add(PlaybackCssClass.PAUSE);
            page1[GOTO_COUNTER_PROP] = {};
            grandchild[GOTO_COUNTER_PROP] = {};
            page1.setAttribute(CURRENT_LABEL_ANIMATION_ATTR, 'someLabel1');
            grandchild.setAttribute(CURRENT_LABEL_ANIMATION_ATTR, 'someLabel2');

            // Change to page 2.
            runtime.setCurrentPage(1);

            // Animations should be enabled on page2 only.
            expect(page1.classList.contains(PlaybackCssClass.PLAY)).to.be.false;
            expect(page2.classList.contains(PlaybackCssClass.PLAY)).to.be.true;

            // Pause, goto counters, and current label animation data should have
            // been cleared from all elements under page1, including the page
            // itself.
            expect(page1.classList.contains(PlaybackCssClass.PAUSE)).to.be
              .false;
            expect(grandchild.classList.contains(PlaybackCssClass.PAUSE)).to.be
              .false;
            expect(page1).to.not.have.property(GOTO_COUNTER_PROP);
            expect(grandchild).to.not.have.property(GOTO_COUNTER_PROP);
            expect(page1.hasAttribute(CURRENT_LABEL_ANIMATION_ATTR)).to.be
              .false;
            expect(grandchild.hasAttribute(CURRENT_LABEL_ANIMATION_ATTR)).to.be
              .false;
          });

          it('should disable and re-enable', () => {
            runtime.setEnabled(true);
            expect(doc.body.classList.contains(ANIMATIONS_DISABLED_CLASS)).to.be
              .false;

            runtime.setEnabled(false);
            expect(doc.body.classList.contains(ANIMATIONS_DISABLED_CLASS)).to.be
              .true;
          });

          it('should execute play', () => {
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
            expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE)).to.be
              .false;

            // Repeated play invocations should have no change.
            impl.executeAction(playInvocation);
            expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE)).to.be
              .false;

            // Test handling missing arguments.
            invokeWithSomeArgsUndefined(impl, playInvocation);
          });

          it('should execute pause', () => {
            const invocation = {
              method: 'pause',
              args: {id: 'page1'},
              satisfiesTrust: () => true,
            };

            impl.executeAction(invocation);
            expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE)).to.be
              .true;

            // Repeated pause invocations should have no change.
            impl.executeAction(invocation);
            expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE)).to.be
              .true;

            // Test handling missing arguments.
            invokeWithSomeArgsUndefined(impl, invocation);
          });

          it('should execute togglePlay', () => {
            const invocation = {
              method: 'togglePlay',
              args: {id: 'page1'},
              satisfiesTrust: () => true,
            };

            impl.executeAction(invocation);
            expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE)).to.be
              .true;

            impl.executeAction(invocation);
            expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE)).to.be
              .false;

            // Test handling missing arguments.
            invokeWithSomeArgsUndefined(impl, invocation);
          });

          it('should execute gotoAndPlay', () => {
            const invocation = {
              method: 'gotoAndPlay',
              args: {id: 'page1', label: 'foo'},
              satisfiesTrust: () => true,
            };
            impl.executeAction(invocation);
            expect(page1Elem.classList.contains('foo')).to.be.true;
            expect(
              page1Elem.getAttribute(CURRENT_LABEL_ANIMATION_ATTR)
            ).to.equal('foo');

            // Repeated invocations should have no effect (animation will be
            // restarted, however).
            impl.executeAction(invocation);
            expect(page1Elem.classList.contains('foo')).to.be.true;
            expect(
              page1Elem.getAttribute(CURRENT_LABEL_ANIMATION_ATTR)
            ).to.equal('foo');

            // Change to a different label.
            invocation.args.label = 'bar';
            impl.executeAction(invocation);
            expect(page1Elem.classList.contains('foo')).to.be.false;
            expect(page1Elem.classList.contains('bar')).to.be.true;
            expect(
              page1Elem.getAttribute(CURRENT_LABEL_ANIMATION_ATTR)
            ).to.equal('bar');

            // Test handling missing arguments.
            invokeWithSomeArgsUndefined(impl, invocation);
          });

          it('should execute gotoAndPause', () => {
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
            const origSetTimeout = win.setTimeout;
            win.setTimeout = (func) => func();

            // Test a valid gotoAndPause invocation. Verify animation was
            // switched to the label and has been paused.
            impl.executeAction(invocation);
            expect(page1Elem.classList.contains('foo')).to.be.true;
            expect(page1Elem.classList.contains(PlaybackCssClass.PAUSE)).to.be
              .true;

            win.setTimeout = origSetTimeout;
          });

          it('should execute gotoAndPlayNTimes', () => {
            const testEvent = createCustomEvent(win, GWD_TIMELINE_EVENT, {
              'eventName': 'event-1',
            });

            // Invoking gotoAndPlayNTimes with a negative N value is a no-op.
            const invocationWithBadNValue = {
              method: 'gotoAndPlayNTimes',
              args: {id: 'page1', label: 'foo', N: -5},
              event: testEvent,
              satisfiesTrust: () => true,
            };

            allowConsoleError(() => {
              impl.executeAction(invocationWithBadNValue);
            });
            expect(page1Elem.classList.contains('foo')).to.be.false;

            // Initialize a valid gotoAndPlayNTimes invocation from some event.
            const invocation = {
              method: 'gotoAndPlayNTimes',
              args: {id: 'page1', label: 'foo', N: 2},
              event: testEvent,
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
            const testEvent2 = createCustomEvent(
              ampdoc.win,
              GWD_TIMELINE_EVENT,
              {'eventName': 'event-2'}
            );
            const invocationFromEvent2 = {
              method: 'gotoAndPlayNTimes',
              args: {id: 'page1', label: 'foo', N: 1},
              event: testEvent2,
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

          it('should trigger timeline events', () => {
            const triggeredAmpEventNames = [];
            const triggeredEvents = [];

            const actionService = Services.actionServiceForDoc(element);
            env.sandbox
              .stub(actionService, 'trigger')
              .callsFake((target, name, event) => {
                triggeredAmpEventNames.push(name);
                triggeredEvents.push(event);
              });

            const animationendEvent = new AnimationEvent('animationend', {
              bubbles: true,
            });

            // Dispatch `animationend` events on GWD event elements and on a
            // non-event element (to test it is ignored).
            doc.getElementById('event1').dispatchEvent(animationendEvent);
            doc.getElementById('event2').dispatchEvent(animationendEvent);
            doc.getElementById('not-an-event').dispatchEvent(animationendEvent);

            expect(triggeredAmpEventNames).to.deep.equal([
              'tl_event-1',
              'tl_event-2',
            ]);
            expect(
              triggeredEvents.map((event) => event.detail.eventName)
            ).to.deep.equal(['event-1', 'event-2']);
          });

          it('should get the receiver element by id if it exists', () => {
            expect(runtime.getReceiver('document.body')).to.equal(doc.body);
            expect(runtime.getReceiver('page1')).to.equal(page1Elem);

            allowConsoleError(() => {
              expect(runtime.getReceiver('nonexistentElement')).to.be.null;
            });
          });
        }
      );
    }
  );

  describe('addAction', () => {
    let element;
    let actionService;

    beforeEach(() => {
      actionService = {setActions: env.sandbox.stub()};
      element = document.createElement('div');
      env.sandbox
        .stub(Services, 'actionServiceForDoc')
        .withArgs(element)
        .returns(actionService);
    });

    it('should insert when no existing actions', () => {
      const target = document.createElement('div');
      addAction(element, target, 'event1', 'node1.foo()');
      expect(actionService.setActions).calledWith(target, 'event1:node1.foo()');
    });

    it('should insert when actions defined for this event', () => {
      const target = document.createElement('div');
      target.setAttribute('on', 'event1:node2.hide;event2:node2.show');
      addAction(element, target, 'event1', 'node1.foo()');
      expect(actionService.setActions).calledWith(
        target,
        'event1:node1.foo(),node2.hide;event2:node2.show'
      );
    });

    it('should insert when actions defined for other events only', () => {
      const target = document.createElement('div');
      target.setAttribute('on', 'event2:node2.hide');
      addAction(element, target, 'event1', 'node1.foo()');
      expect(actionService.setActions).calledWith(
        target,
        'event2:node2.hide;event1:node1.foo()'
      );
    });

    it('should insert in FIE', () => {
      const target = document.createElement('div');
      target.setAttribute('on', 'event2:node2.hide');
      // FIE should have its own ActionService.
      const fieActionService = {setActions: env.sandbox.stub()};
      Services.actionServiceForDoc.withArgs(target).returns(fieActionService);
      // Provide `target` as the service context to simulate FIE case.
      addAction(target, target, 'event1', 'node1.foo()');
      // Only the FIE's ActionService should be called.
      expect(actionService.setActions).to.not.be.called;
      expect(fieActionService.setActions).calledWith(
        target,
        'event2:node2.hide;event1:node1.foo()'
      );
    });
  });
});
