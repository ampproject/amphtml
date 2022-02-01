import {toggleExperiment} from '#experiments';

import {macroTask} from '#testing/helpers';

import {AmpdocAnalyticsRoot} from '../analytics-root';
import {
  AnalyticsEvent,
  AnalyticsEventType,
  BrowserEventTracker,
} from '../events';

describes.realWin(
  'Events',
  {
    amp: 1,
  },
  (env) => {
    let win;
    let ampdoc;
    let root;
    let analyticsElement;
    let target;
    let inputField;
    let inputField2;

    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;
      root = new AmpdocAnalyticsRoot(ampdoc);

      analyticsElement = win.document.createElement('amp-analytics');
      win.document.body.appendChild(analyticsElement);

      target = win.document.createElement('div');
      target.classList.add('target');
      win.document.body.appendChild(target);

      inputField = win.document.createElement('input');
      inputField.setAttribute('id', 'inputField');
      inputField.setAttribute('type', 'text');
      target.appendChild(inputField);

      inputField2 = win.document.createElement('input');
      inputField2.setAttribute('id', 'inputField2');
      target.appendChild(inputField2);

      toggleExperiment(win, 'analytics-browser-events', true);
    });

    describe('BrowserEventTracker', () => {
      let tracker;
      let changeEventConfig,
        blurEventConfig,
        multiChangeConfig,
        multiBlurConfig;
      let selectors;

      beforeEach(() => {
        tracker = root.getTracker(
          AnalyticsEventType.BROWSER_EVENT,
          BrowserEventTracker
        );
        selectors = ['#inputField', '#inputField2'];

        blurEventConfig = {
          'on': 'blur',
          'selector': '#inputField',
        };

        multiBlurConfig = {
          'on': 'blur',
          'selector': selectors,
        };

        changeEventConfig = {
          'on': 'change',
          'selector': '#inputField',
        };

        multiChangeConfig = {
          'on': 'change',
          'selector': selectors,
        };
      });

      it('should initalize, add listeners and dispose', () => {
        expect(tracker.root).to.equal(root);
        expect(tracker.observables_.getHandlerCount()).to.equal(0);

        tracker.add(
          undefined,
          AnalyticsEventType.BROWSER_EVENT,
          changeEventConfig,
          () => {},
          false
        );

        expect(tracker.observables_.getHandlerCount()).to.equal(1);
        tracker.dispose();
        expect(tracker.observables_).to.be.null;
      });

      it('should require a selector', () => {
        allowConsoleError(() => {
          expect(() => {
            tracker.add(analyticsElement, AnalyticsEventType.BROWSER_EVENT, {
              selector: '',
            });
          }).to.throw(/Missing required selector on browser event trigger/);

          expect(() => {
            tracker.add(analyticsElement, AnalyticsEventType.VIDEO, {
              selector: [],
            });
          }).to.throw(/Missing required selector on browser event trigger/);
        });
      });

      it('should error on duplicate selectors', () => {
        const config = {
          selector: ['#inputField', '#inputField'],
        };

        expect(() => {
          tracker.add(analyticsElement, 'blur', config);
        }).to.throw(
          /Cannot have duplicate selectors in selectors list: #inputField,#inputField/
        );
        expect(() => {
          tracker.add(analyticsElement, 'change', config);
        }).to.throw(
          /Cannot have duplicate selectors in selectors list: #inputField,#inputField/
        );
      });

      it('fires on one selector with on change', async () => {
        const listenerStub = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(root, 'getElement');

        env.sandbox
          .stub(tracker, 'debouncedBoundOnSession_')
          .callsFake((e) => tracker.boundOnSession_(e));
        tracker.add(
          undefined,
          AnalyticsEventType.BROWSER_EVENT,
          changeEventConfig,
          listenerStub
        );

        inputField.dispatchEvent(new Event('change'));

        await macroTask();
        expect(listenerStub).to.have.calledOnce;
        expect(listenerStub).to.be.calledWith(
          new AnalyticsEvent(inputField, 'change', {})
        );
        expect(getElementSpy).to.be.calledOnce;
        expect(tracker.observables_.handlers_.length).to.equal(1);
      });

      it('fires on one selector with on blur', async () => {
        const listenerStub = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(root, 'getElement');

        env.sandbox
          .stub(tracker, 'debouncedBoundOnSession_')
          .callsFake((e) => tracker.boundOnSession_(e));

        tracker.add(
          undefined,
          AnalyticsEventType.BROWSER_EVENT,
          blurEventConfig,
          listenerStub
        );

        inputField.dispatchEvent(new Event('blur'));

        await macroTask();
        expect(listenerStub).to.have.calledOnce;
        expect(listenerStub).to.be.calledWith(
          new AnalyticsEvent(inputField, 'blur', {})
        );
        expect(getElementSpy).to.be.calledOnce;
        expect(tracker.observables_.handlers_.length).to.equal(1);
      });

      it('fires on multiple selectors with on blur', async () => {
        const listenerStub = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        env.sandbox
          .stub(tracker, 'debouncedBoundOnSession_')
          .callsFake((e) => tracker.boundOnSession_(e));
        tracker.add(
          undefined,
          AnalyticsEventType.BROWSER_EVENT,
          multiBlurConfig,
          listenerStub
        );

        inputField.dispatchEvent(new Event('blur'));
        await macroTask();
        inputField2.dispatchEvent(new Event('blur'));
        await macroTask();

        expect(listenerStub).to.have.calledTwice;
        expect(listenerStub.firstCall).to.be.calledWith(
          new AnalyticsEvent(inputField, 'blur', {})
        );
        expect(listenerStub.secondCall).to.be.calledWith(
          new AnalyticsEvent(inputField2, 'blur', {})
        );
        expect(getElementSpy).to.be.calledOnce;
        expect(tracker.observables_.handlers_.length).to.equal(1);
      });

      it('fires on multiple selectors with on change', async () => {
        const listenerStub = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        env.sandbox
          .stub(tracker, 'debouncedBoundOnSession_')
          .callsFake((e) => tracker.boundOnSession_(e));
        tracker.add(
          undefined,
          AnalyticsEventType.BROWSER_EVENT,
          multiChangeConfig,
          listenerStub
        );

        inputField.dispatchEvent(new Event('change'));
        await macroTask();
        inputField2.dispatchEvent(new Event('change'));
        await macroTask();

        expect(listenerStub).to.have.calledTwice;
        expect(listenerStub.firstCall).to.be.calledWith(
          new AnalyticsEvent(inputField, 'change', {})
        );
        expect(listenerStub.secondCall).to.be.calledWith(
          new AnalyticsEvent(inputField2, 'change', {})
        );
        expect(getElementSpy).to.be.calledOnce;
        expect(tracker.observables_.handlers_.length).to.equal(1);
      });

      it('fires with on change and on blur', async () => {
        const listenerStub = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        env.sandbox
          .stub(tracker, 'debouncedBoundOnSession_')
          .callsFake((e) => tracker.boundOnSession_(e));
        tracker.add(
          undefined,
          AnalyticsEventType.BROWSER_EVENT,
          multiBlurConfig,
          listenerStub
        );

        tracker.add(
          undefined,
          AnalyticsEventType.BROWSER_EVENT,
          multiChangeConfig,
          listenerStub
        );

        inputField.dispatchEvent(new Event('blur'));
        await macroTask();
        inputField2.dispatchEvent(new Event('blur'));
        inputField.dispatchEvent(new Event('change'));
        await macroTask();
        inputField2.dispatchEvent(new Event('change'));
        await macroTask();

        expect(listenerStub).to.have.callCount(4);
        expect(listenerStub.firstCall).to.be.calledWith(
          new AnalyticsEvent(inputField, 'blur', {})
        );
        expect(listenerStub.secondCall).to.be.calledWith(
          new AnalyticsEvent(inputField2, 'blur', {})
        );
        expect(listenerStub.thirdCall).to.be.calledWith(
          new AnalyticsEvent(inputField, 'change', {})
        );
        expect(listenerStub.lastCall).to.be.calledWith(
          new AnalyticsEvent(inputField2, 'change', {})
        );
        expect(getElementSpy).to.be.calledTwice;
        expect(tracker.observables_.handlers_.length).to.equal(2);
      });
    });
  }
);
