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

import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../src/service';
import {
  triggerAnalyticsEvent,
  insertAnalyticsElement,
} from '../../src/analytics';
import {timerFor} from '../../src/services';
import {BaseElement} from '../../src/base-element';
import * as sinon from 'sinon';

describes.realWin('analytics', {amp: true}, env => {
  let sandbox;
  let timer;
  let ampdoc;
  let win;
  describe('triggerAnalyticsEvent', () => {
    let triggerEventSpy;

    class MockInstrumentation {
      triggerEvent(eventType, opt_vars) {
        triggerEventSpy(eventType, opt_vars);
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      timer = timerFor(env.win);
      ampdoc = env.ampdoc;
      triggerEventSpy = sandbox.spy();
      resetServiceForTesting(window, 'amp-analytics-instrumentation');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should not do anything if analytics is not installed', () => {
      triggerAnalyticsEvent(ampdoc, 'hello');
      return timer.promise(50).then(() => {
        expect(triggerEventSpy).to.have.not.been.called;
      });
    });

    it('should trigger analytics event if analytics is installed', () => {
      registerServiceBuilderForDoc(
        ampdoc, 'amp-analytics-instrumentation', MockInstrumentation);
      // Force instantiation
      getServiceForDoc(ampdoc, 'amp-analytics-instrumentation');
      triggerAnalyticsEvent(ampdoc, 'hello');
      return timer.promise(50).then(() => {
        expect(triggerEventSpy).to.have.been.called;
        expect(triggerEventSpy).to.have.been.calledWith('hello');
      });
    });
  });

  describe('insertAnalyticsElement', () => {
    class MockInstrumentation {
    };

    beforeEach(() => {
      timer = timerFor(env.win);
      ampdoc = env.ampdoc;
      win = env.win;
    });

    it('should create analytics element if analytics is installed', () => {
      const ele = win.document.createElement('div');
      win.document.body.appendChild(ele);
      const baseEle = new BaseElement(ele);
      registerServiceBuilderForDoc(
          ampdoc, 'amp-analytics-instrumentation', MockInstrumentation);
      // Force instantiation
      getServiceForDoc(ampdoc, 'amp-analytics-instrumentation');
      const config = {
        'requests': {
          'pageview': 'https://example.com/analytics',
        },
        'triggers': {
          'trackPageview': {
            'on': 'visible',
            'request': 'pageview',
          },
        },
      };
      expect(baseEle.element.querySelector('amp-analytics')).to.be.null;
      expect(insertAnalyticsElement(baseEle.element, config, true)).to.be.ok;
      return timer.promise(50).then(() => {
        const analyticsEle = baseEle.element.querySelector('amp-analytics');
        expect(analyticsEle).to.not.be.null;
        expect(analyticsEle.getAttribute('sandbox')).to.equal('true');
        expect(analyticsEle.getAttribute('trigger')).to.equal('immediate');
        const script = (analyticsEle).querySelector('script');
        expect(script.textContent).to.jsonEqual(JSON.stringify(config));
        expect(analyticsEle.CONFIG).to.jsonEqual(config);
        expect(analyticsEle.getAttribute('sandbox')).to.equal('true');
      });
    });
  });
});
