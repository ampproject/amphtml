/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {AmpOrientationObserver} from '../amp-orientation-observer';

describes.realWin(
  'Creates the relevant fx presets correctly',
  {
    amp: {
      ampdoc: 'single',
      extensions: ['amp-orientation-observer'],
    },
  },
  env => {
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
