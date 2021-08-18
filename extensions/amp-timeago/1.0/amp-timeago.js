

import {isExperimentOn} from '#experiments';

import {BaseElement} from './base-element';

import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-timeago';

class AmpTimeago extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-timeago'),
      'expected global "bento" or specific "bento-timeago" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpTimeago);
});
