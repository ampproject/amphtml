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

import {fromClassForDoc} from '../../src/service';
import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../src/service';
import {
  triggerAnalyticsEvent,
  ExtensionAnalytics,
} from '../../src/analytics';
import {timerFor} from '../../src/timer';
import {BaseElement} from '../../src/base-element';
import * as sinon from 'sinon';

describes.realWin('analytics', {
  amp: {
    extensions: ['amp-analytics'],
  },
}, env => {
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
      win = env.win;
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

  describe('ExtensionAnalytics Class', () => {
    let sandbox;
    let ele;
    let baseEle;
    let config;
    let testClass;
    let triggerEventForTargetSpy;

    class MockInstrumentation {
      triggerEventForTarget(target, eventType, opt_vars) {
        triggerEventForTargetSpy(target, eventType, opt_vars);
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      timer = timerFor(env.win);
      ampdoc = env.ampdoc;
      win = env.win;
      ele = win.document.createElement('div');
      win.document.body.appendChild(ele);
      baseEle = new BaseElement(ele);
      config = {
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
      fromClassForDoc(
          ampdoc, 'amp-analytics-instrumentation', MockInstrumentation);
      expect(baseEle.element.querySelector('amp-analytics')).to.be.null;
      testClass = new ExtensionAnalytics(baseEle.element, config);
      triggerEventForTargetSpy = sandbox.spy();
    });

    it('should create analytics element if analytics is installed', () => {
      return timer.promise(50).then(() => {
        const analyticsEle = baseEle.element.querySelector('amp-analytics');
        expect(analyticsEle).to.not.be.null;
        const script = analyticsEle.querySelector('script');
        expect(script.textContent).to.jsonEqual(JSON.stringify(config));
        expect(analyticsEle.CONFIG).to.jsonEqual(config);
        expect(analyticsEle.getAttribute('sandbox')).to.equal('true');
        expect(testClass.analyticsElements_).to.have.length(1);
      });
    });

    it('should trigger events for contained analyticsElements', () => {
      testClass = new ExtensionAnalytics(baseEle.element, [config, config]);
      testClass.triggerAnalyticsEvent('test');
      return timer.promise(50).then(() => {
        expect(testClass.analyticsElements_).to.have.length(2);
        expect(triggerEventForTargetSpy).to.be.calledTwice;
      });
    });
  });
});
