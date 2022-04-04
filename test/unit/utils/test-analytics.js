import {Services} from '#service';

import {triggerAnalyticsEvent} from '#utils/analytics';

import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../../src/service-helpers';

describes.realWin(
  'analytics',
  {
    amp: true,
  },
  (env) => {
    let timer;
    let ampdoc;

    describe('triggerAnalyticsEvent', () => {
      let triggerEventSpy;

      class MockInstrumentation {
        triggerEventForTarget(nodeOrDoc, eventType, opt_vars) {
          triggerEventSpy(nodeOrDoc, eventType, opt_vars);
        }
      }

      beforeEach(() => {
        timer = Services.timerFor(env.win);
        ampdoc = env.ampdoc;
        triggerEventSpy = env.sandbox.spy();
        resetServiceForTesting(window, 'amp-analytics-instrumentation');
      });

      it('should not do anything if analytics is not installed', () => {
        triggerAnalyticsEvent(ampdoc.win.document, 'hello');
        return timer.promise(50).then(() => {
          expect(triggerEventSpy).to.have.not.been.called;
        });
      });

      it('should trigger analytics event if analytics is installed', () => {
        registerServiceBuilderForDoc(
          ampdoc,
          'amp-analytics-instrumentation',
          MockInstrumentation
        );
        // Force instantiation
        getServiceForDoc(ampdoc, 'amp-analytics-instrumentation');
        triggerAnalyticsEvent(ampdoc.win.document, 'hello');
        return timer.promise(50).then(() => {
          expect(triggerEventSpy).to.have.been.called;
          expect(triggerEventSpy).to.have.been.calledWith(
            ampdoc.win.document,
            'hello'
          );
        });
      });
    });
  }
);
