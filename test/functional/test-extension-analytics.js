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

import * as sinon from 'sinon';
import {BaseElement} from '../../src/base-element';
import {
  CustomEventReporterBuilder,
  insertAnalyticsElement,
  useAnalyticsInSandbox,
} from '../../src/extension-analytics';
import {Services} from '../../src/services';
import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../src/service';
import {macroTask} from '../../testing/yield';
import {registerElement} from '../../src/service/custom-element-registry';


describes.realWin('extension-analytics', {
  amp: true,
}, env => {
  let timer;
  let ampdoc;
  let win;

  describe('insertAnalyticsElement', () => {
    let sandbox;
    class MockInstrumentation {
    };

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      timer = Services.timerFor(env.win);
      ampdoc = env.ampdoc;
      win = env.win;
    });

    afterEach(() => {
      sandbox.restore();
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
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      parent = document.createElement('div');
      builder = new CustomEventReporterBuilder(parent);
    });

    afterEach(() => {
      sandbox.restore();
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
      expect(reporter.trigger).to.exist;
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

      registerElement(env.win, 'amp-test', BaseElement);
      parentEle = env.win.document.createElement('amp-test');
      parentEle.setAttribute('layout', 'nodisplay');
      env.win.document.body.appendChild(parentEle);
      const buildPromise = parentEle.build();
      builder = new CustomEventReporterBuilder(parentEle);
      reporter = builder.track('test', 'fake.com').build();
      return buildPromise;
    });

    afterEach(() => {
      sandbox.restore();
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

  describe('useAnalyticsInSandbox', () => {
    let parentEle;
    let resolver;
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
    const config2 = {
      'requests': {
        'pageview': 'https://example.com/analytics2',
      },
      'triggers': {
        'trackPageview': {
          'on': 'visible',
          'request': 'pageview',
        },
      },
    };

    describe('parent does NOT relayout, call in buildCallback', () => {
      beforeEach(() => {
        const promise = new Promise(resolve => {resolver = resolve;});
        class TestElement extends BaseElement {
          buildCallback() {
            useAnalyticsInSandbox(this.element, promise);
          }
        }
        registerElement(env.win, 'amp-test', TestElement);
        parentEle = env.win.document.createElement('amp-test');
        parentEle.setAttribute('layout', 'nodisplay');
        env.win.document.body.appendChild(parentEle);
        return parentEle.build();
      });

      it('should insert analytics after LOAD_START', function* () {
        resolver(config);
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
        parentEle.layoutCallback();
        //parentEle.signals().signal(CommonSignals.LOAD_START);
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.not.be.null;
      });

      it('should insert analytics when config arrives late', function* () {
        parentEle.layoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
        resolver(config);
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.not.be.null;
      });

      it('should remove analytics after UNLOAD', function* () {
        resolver(config);
        parentEle.layoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.not.be.null;
        parentEle.unlayoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
      });

      it('should NOT insert analytics after UNLOAD', function* () {
        parentEle.layoutCallback();
        yield macroTask();
        parentEle.unlayoutCallback();
        yield macroTask();
        resolver(config);
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
      });
    });

    describe('parent does NOT relayout, call in layoutCallback', () => {
      beforeEach(() => {
        const promise = new Promise(resolve => {resolver = resolve;});
        class TestElement extends BaseElement {
          layoutCallback() {
            useAnalyticsInSandbox(this.element, promise);
            return super.layoutCallback();
          }
        }
        registerElement(env.win, 'amp-test', TestElement);
        parentEle = env.win.document.createElement('amp-test');
        parentEle.setAttribute('layout', 'nodisplay');
        env.win.document.body.appendChild(parentEle);
        return parentEle.build();
      });

      it('should insert and remove analytics', function* () {
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
        parentEle.layoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
        resolver(config);
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.not.be.null;
        parentEle.unlayoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
      });
    });

    describe('parent relayout, call in buildCallback', () => {
      beforeEach(() => {
        const promise = new Promise(resolve => {resolver = resolve;});
        class TestElement extends BaseElement {
          buildCallback() {
            useAnalyticsInSandbox(this.element, promise);
          }
          unlayoutCallback() {
            return true;
          }
        }
        registerElement(env.win, 'amp-test', TestElement);
        parentEle = env.win.document.createElement('amp-test');
        parentEle.setAttribute('layout', 'nodisplay');
        env.win.document.body.appendChild(parentEle);
        return parentEle.build();
      });

      it('should NOT insert analytics when relayout', function* () {
        resolver(config);
        parentEle.layoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.not.be.null;
        parentEle.unlayoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
        parentEle.layoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
      });

      it('should NOT insert when config arrives at relayout', function* () {
        parentEle.layoutCallback();
        parentEle.unlayoutCallback();
        yield macroTask();
        parentEle.layoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
        resolver(config);
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
      });
    });

    describe('parent relayout, call in layoutCallback', () => {
      beforeEach(() => {
        class TestElement extends BaseElement {
          layoutCallback() {
            const promise = new Promise(resolve => {
              resolver = resolve;
            });
            useAnalyticsInSandbox(this.element, promise);
            return super.layoutCallback();
          }
          unlayoutCallback() {
            return true;
          }
        }
        registerElement(env.win, 'amp-test', TestElement);
        parentEle = env.win.document.createElement('amp-test');
        parentEle.setAttribute('layout', 'nodisplay');
        env.win.document.body.appendChild(parentEle);
        return parentEle.build();
      });

      it('should insert analytics when relayout', function* () {
        parentEle.layoutCallback();
        resolver(config);
        yield macroTask();
        let element = parentEle.querySelector('amp-analytics');
        expect(element).to.not.be.null;
        let script = element.querySelector('script');
        expect(script.textContent).to.jsonEqual(JSON.stringify(config));
        parentEle.unlayoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
        parentEle.layoutCallback();
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.be.null;
        resolver(config2);
        yield macroTask();
        expect(parentEle.querySelector('amp-analytics')).to.not.be.null;
        element = parentEle.querySelector('amp-analytics');
        expect(element).to.not.be.null;
        script = element.querySelector('script');
        expect(script.textContent).to.jsonEqual(JSON.stringify(config2));
      });

      it('should only insert with latest config', function* () {
        parentEle.layoutCallback();
        yield macroTask();
        const resolver1 = resolver;
        parentEle.unlayoutCallback();
        parentEle.layoutCallback();
        yield macroTask();
        const resolver2 = resolver;
        resolver1(config);
        resolver2(config2);
        yield macroTask();
        const element = parentEle.querySelector('amp-analytics');
        expect(element).to.not.be.null;
        const script = element.querySelector('script');
        expect(script.textContent).to.jsonEqual(JSON.stringify(config2));
      });
    });
  });
});


