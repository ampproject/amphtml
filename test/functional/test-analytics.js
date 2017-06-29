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
  CustomEventReporterBuilder,
} from '../../src/analytics';
import {createAmpElementProto} from '../../src/custom-element';
import {timerFor} from '../../src/services';
import {BaseElement} from '../../src/base-element';
import {macroTask} from '../../testing/yield';
import * as sinon from 'sinon';

describes.realWin('analytics', {amp: true}, env => {
  let sandbox;
  let timer;
  let ampdoc;
  let win;
  describe('triggerAnalyticsEvent', () => {
    let triggerEventSpy;

    class MockInstrumentation {
      triggerEventForTarget(nodeOrDoc, eventType, opt_vars) {
        triggerEventSpy(nodeOrDoc, eventType, opt_vars);
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
      triggerAnalyticsEvent(ampdoc.win.document, 'hello');
      return timer.promise(50).then(() => {
        expect(triggerEventSpy).to.have.not.been.called;
      });
    });

    it('should trigger analytics event if analytics is installed', () => {
      registerServiceBuilderForDoc(
          ampdoc, 'amp-analytics-instrumentation', MockInstrumentation);
      // Force instantiation
      getServiceForDoc(ampdoc, 'amp-analytics-instrumentation');
      triggerAnalyticsEvent(ampdoc.win.document, 'hello');
      return timer.promise(50).then(() => {
        expect(triggerEventSpy).to.have.been.called;
        expect(triggerEventSpy).to.have.been.calledWith(
            ampdoc.win.document, 'hello');
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


  describe('CustomEventReporterBuilder', () => {
    let builder;
    let parent;
    beforeEach(() => {
      parent = document.createElement('div');
      builder = new CustomEventReporterBuilder(parent);
    });

    it('track event with one request', () => {
      builder.track('test', 'fake.com');
      expect(builder.config_).to.jsonEqual({
        'requests': {
          'test-request-0': 'fake.com',
        },
        'triggers': {
          'test': {
            'on': 'test',
            'request': ['test-request-0'],
          },
        },
      });
    });

    it('track event with multiple request', () => {
      builder.track('test', ['fake.com', 'fake1.com']);
      expect(builder.config_).to.jsonEqual({
        'requests': {
          'test-request-0': 'fake.com',
          'test-request-1': 'fake1.com',
        },
        'triggers': {
          'test': {
            'on': 'test',
            'request': ['test-request-0', 'test-request-1'],
          },
        },
      });
    });

    it('track multi event', () => {
      builder.track('test', 'fake.com').track('test1', 'fake1.com');
      expect(builder.config_).to.jsonEqual({
        'requests': {
          'test-request-0': 'fake.com',
          'test1-request-0': 'fake1.com',
        },
        'triggers': {
          'test': {
            'on': 'test',
            'request': ['test-request-0'],
          },
          'test1': {
            'on': 'test1',
            'request': ['test1-request-0'],
          },
        },
      });
    });

    it('should not add already tracked event', () => {
      try {
        builder.track('test', 'fake.com').track('test', 'example.com');
      } catch (e) {
        expect(e.message).to.equal(
            'customEventReporterBuilder should not track same eventType twice');
      };
    });

    it('should return a customEventReporter instance', () => {
      parent.getResourceId = () => {return 1;};
      parent.signals = () => {return {
        whenSignal: () => {return Promise.resolve();},
      };};
      const reporter = builder.track('test', 'fake.com').build();
      expect(reporter.trigger).to.be.defined;
    });
  });

  describe('CustomEventReporter test', () => {
    let builder;
    let parentEle;
    let reporter;
    let sandbox;
    let ampdoc;
    let triggerEventSpy;

    class MockInstrumentation {
      triggerEventForTarget(nodeOrDoc, eventType, opt_vars) {
        triggerEventSpy(nodeOrDoc, eventType, opt_vars);
      }
    }
    beforeEach(() => {
      ampdoc = env.ampdoc;
      sandbox = sinon.sandbox.create();
      triggerEventSpy = sandbox.spy();
      resetServiceForTesting(env.win, 'amp-analytics-instrumentation');
      registerServiceBuilderForDoc(
          ampdoc, 'amp-analytics-instrumentation', MockInstrumentation);
      // Force instantiation
      getServiceForDoc(ampdoc, 'amp-analytics-instrumentation');

      env.win.document.registerElement('amp-test', {
        prototype: createAmpElementProto(env.win, 'amp-test', BaseElement),
      });
      parentEle = env.win.document.createElement('amp-test');
      parentEle.setAttribute('layout', 'nodisplay');
      env.win.document.body.appendChild(parentEle);
      parentEle.build();
      builder = new CustomEventReporterBuilder(parentEle);
      reporter = builder.track('test', 'fake.com').build();
    });

    it('replace eventType with new name', function* () {
      parentEle.layoutCallback();
      yield macroTask();
      const element = parentEle.querySelector('amp-analytics');
      expect(element).to.not.be.null;
      const script = element.querySelector('script');
      const id = parentEle.getResourceId();
      expect(script.textContent).to.jsonEqual(JSON.stringify({
        'requests': {
          'test-request-0': 'fake.com',
        },
        'triggers': {
          'test': {
            'on': `sandbox-${id}-test`,
            'request': ['test-request-0'],
          },
        },
      }));
    });

    it('trigger event with new name', function* () {
      const id = parentEle.getResourceId();
      reporter.trigger('test');
      yield macroTask();
      expect(triggerEventSpy).to.be.calledWith(parentEle, `sandbox-${id}-test`);
    });

    it('should not trigger not added event', function* () {
      try {
        reporter.trigger('fake');
      } catch (e) {
        expect(e.message).to.equal('Cannot trigger non initiated eventType');
      }
    });
  });
});
