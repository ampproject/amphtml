import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-adblock-detector-1.0.css';

/** @const {string} */
const TAG = 'amp-adblock-detector';

class AmpAdblockDetector extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-adblock-detector'),
      'expected global "bento" or specific "bento-adblock-detector" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpAdblockDetector, CSS);
});
