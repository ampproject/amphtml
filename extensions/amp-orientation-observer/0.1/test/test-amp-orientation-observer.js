import {AmpOrientationObserver} from '../amp-orientation-observer';

describes.realWin(
  'Creates the relevant fx presets correctly',
  {
    amp: {
      ampdoc: 'single',
      extensions: ['amp-orientation-observer'],
    },
  },
  (env) => {
    let impl;
    let triggerEventSpy;

    function init() {
      const elem = {
        getAttribute(attr) {
          if (attr == 'alpha-range') {
            return '0 360';
          }
          if (attr == 'beta-range') {
            return '-180 180';
          }
          if (attr == 'gamma-range') {
            return '-90 90';
          }
        },
        hasAttribute(attr) {
          if (attr == 'smoothing') {
            return false;
          }
        },
      };
      elem.ownerDocument = {
        defaultView: env.win,
      };

      impl = new AmpOrientationObserver(elem);
      impl.init_();
      triggerEventSpy = env.sandbox.stub(impl, 'triggerEvent_');
    }

    function setOrientation(alpha = 180, beta = 0, gamma = 0) {
      const event = new DeviceOrientationEvent('deviceorientationevent', {
        alpha,
        beta,
        gamma,
      });
      impl.deviceOrientationHandler_(event);
    }

    describe('no changes in device orientation', () => {
      it('should not trigger `alpha` event', () => {
        init();
        expect(triggerEventSpy).not.to.be.called;

        setOrientation(180);
        expect(triggerEventSpy).not.to.be.called;
      });

      it('should not trigger `beta` event', () => {
        init();
        expect(triggerEventSpy).not.to.be.called;

        setOrientation(180, 0);
        expect(triggerEventSpy).not.to.be.called;
      });

      it('should not trigger `gamma` event', () => {
        init();
        expect(triggerEventSpy).not.to.be.called;

        setOrientation(180, 0, 0);
        expect(triggerEventSpy).not.to.be.called;
      });
    });

    describe('changes in device orientation', () => {
      it('should trigger `alpha` event', () => {
        init();
        expect(triggerEventSpy).not.to.be.called;

        setOrientation(170);
        expect(triggerEventSpy).to.be.called;
        expect(triggerEventSpy).to.be.calledWith('alpha');
      });

      it('should trigger `beta` event', () => {
        init();
        expect(triggerEventSpy).not.to.be.called;

        setOrientation(180, 10);
        expect(triggerEventSpy).to.be.called;
        expect(triggerEventSpy).to.be.calledWith('beta');
      });

      it('should trigger `gamma` event', () => {
        init();
        expect(triggerEventSpy).not.to.be.called;

        setOrientation(180, 0, 10);
        expect(triggerEventSpy).to.be.called;
        expect(triggerEventSpy).to.be.calledWith('gamma');
      });
    });

    describe('combined changes in device orientation', () => {
      it('should trigger `alpha` & `beta` event', () => {
        init();
        expect(triggerEventSpy).not.to.be.called;

        setOrientation(170, 10);
        expect(triggerEventSpy).to.be.calledTwice;
      });

      it('should trigger `beta` & `gamma` event', () => {
        init();
        expect(triggerEventSpy).not.to.be.called;

        setOrientation(180, 10, 10);
        expect(triggerEventSpy).to.be.calledTwice;
      });

      it('should trigger `alpha` & `gamma` event', () => {
        init();
        expect(triggerEventSpy).not.to.be.called;

        setOrientation(170, 0, 10);
        expect(triggerEventSpy).to.be.calledTwice;
      });
    });
  }
);
