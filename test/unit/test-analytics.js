/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../src/services';
import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../src/service';
import {triggerAnalyticsEvent} from '../../src/analytics';

describes.realWin(
  'analytics',
  {
    amp: true,
  },
  env => {
    let sandbox;
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
        sandbox = sinon.sandbox;
        timer = Services.timerFor(env.win);
        ampdoc = env.ampdoc;
        triggerEventSpy = sandbox.spy();
        resetServiceForTesting(window, 'amp-analytics-instrumentation');
      });

      afterEach(() => {
        sandbox.restore();
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
