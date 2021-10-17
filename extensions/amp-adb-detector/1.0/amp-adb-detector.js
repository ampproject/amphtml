import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-adb-detector-1.0.css';

/** @const {string} */
const TAG = 'amp-adb-detector';

class AmpAdbDetector extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-adb-detector'),
      'expected global "bento" or specific "bento-adb-detector" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpAdbDetector, CSS);
});
