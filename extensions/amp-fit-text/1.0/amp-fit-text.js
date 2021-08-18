

import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-fit-text-1.0.css';
import {isExperimentOn} from '#experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-fit-text';

class AmpFitText extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-fit-text'),
      'expected global "bento" or specific "bento-fit-text" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpFitText, CSS);
});
