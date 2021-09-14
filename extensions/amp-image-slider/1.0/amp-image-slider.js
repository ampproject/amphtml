import {isExperimentOn} from '#experiments';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-image-slider-1.0.css';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-image-slider';

class AmpImageSlider extends BaseElement {
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
