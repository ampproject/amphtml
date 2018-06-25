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

describes.sandboxed('amp-orientation-observer', {}, () => {
  let impl;
  let alphaSpy;
  let betaSpy;
  let gammaSpy;

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
      defaultView: window,
    };

    impl = new AmpOrientationObserver(elem);
    impl.init_();
    alphaSpy = sandbox.stub(impl, 'triggerAlpha_');
    betaSpy = sandbox.stub(impl, 'triggerBeta_');
    gammaSpy = sandbox.stub(impl, 'triggerGamma_');
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
	    expect(alphaSpy).not.to.be.called;

	    setOrientation(180);
	    expect(alphaSpy).not.to.be.called;
	  });

	  it('should not trigger `beta` event', () => {
	    init();
	    expect(betaSpy).not.to.be.called;

	    setOrientation(180, 0);
	    expect(betaSpy).not.to.be.called;
	  });

	  it('should not trigger `gamma` event', () => {
	    init();
	    expect(gammaSpy).not.to.be.called;

	    setOrientation(180, 0, 0);
	    expect(gammaSpy).not.to.be.called;
	  });
  });

  describe('changes in device orientation', () => {
	  it('should trigger `alpha` event', () => {
	    init();
	    expect(alphaSpy).not.to.be.called;

      window.scrollTo(0, 0.5 * getViewportHeight(window));
	    setOrientation(170);
	    expect(alphaSpy).to.be.called;
	  });

	  it('should trigger `beta` event', () => {
	    init();
	    expect(betaSpy).not.to.be.called;

	    setOrientation(180, 10);
	    expect(betaSpy).to.be.called;
	  });

	  it('should trigger `gamma` event', () => {
	    init();
	    expect(gammaSpy).not.to.be.called;

	    setOrientation(180, 0, 10);
	    expect(gammaSpy).to.be.called;
	  });
  });

  describe('combined changes in device orientation', () => {
    it('should trigger `alpha` & `beta` event', () => {
      init();
      expect(alphaSpy).not.to.be.called;
      expect(betaSpy).not.to.be.called;

      window.scrollTo(0, 0.5 * getViewportHeight(window));
      setOrientation(170, 10);
      expect(alphaSpy).to.be.called;
      expect(betaSpy).to.be.called;
    });

    it('should trigger `beta` & `gamma` event', () => {
      init();
      expect(betaSpy).not.to.be.called;
      expect(gammaSpy).not.to.be.called;

      setOrientation(180, 10, 10);
      expect(betaSpy).to.be.called;
      expect(gammaSpy).to.be.called;
    });

    it('should trigger `alpha` & `gamma` event', () => {
      init();
      expect(alphaSpy).not.to.be.called;
      expect(gammaSpy).not.to.be.called;

      setOrientation(170, 0, 10);
      expect(alphaSpy).to.be.called;
      expect(gammaSpy).to.be.called;
    });
  });

});

function getViewportHeight(win) {
  return win.document.documentElement.offsetHeight;
}

