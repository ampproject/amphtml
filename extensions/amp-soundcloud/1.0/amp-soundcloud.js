import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

/** @const {string} */
const TAG = 'amp-soundcloud';

class AmpSoundcloud extends setSuperClass(BaseElement, AmpPreactBaseElement) {
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
