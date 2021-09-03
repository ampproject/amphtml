import {isExperimentOn} from '#experiments';

import {BaseElement} from './base-element';

import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-soundcloud';

class AmpSoundcloud extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-soundcloud'),
      'expected global "bento" or specific "bento-soundcloud" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSoundcloud);
});
