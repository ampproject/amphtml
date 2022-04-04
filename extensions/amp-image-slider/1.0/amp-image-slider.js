import {isFiniteNumber} from '#core/types';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-image-slider-1.0.css';

/** @const {string} */
const TAG = 'amp-image-slider';

class AmpImageSlider extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  init() {
    this.registerApiAction('seekTo', (api, invocation) => {
      const {args} = invocation;
      const percent = parseFloat(args['percent']);
      if (isFiniteNumber(percent)) {
        api.seekTo(percent);
      }
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-image-slider'),
      'expected global "bento" or specific "bento-image-slider" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpImageSlider, CSS);
});
