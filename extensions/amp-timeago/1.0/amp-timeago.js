import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

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
