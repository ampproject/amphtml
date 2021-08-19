import {isExperimentOn} from '#experiments';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-youtube-1.0.css';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-youtube';

class AmpYoutube extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-youtube'),
      'expected global "bento" or specific "bento-youtube" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpYoutube, CSS);
});
