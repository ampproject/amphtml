import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {BaseElement} from './base-element';

/** @const {string} */
const TAG = 'amp-soundcloud';

class AmpSoundcloud extends setSuperClass(BaseElement, AmpPreactBaseElement) {}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSoundcloud);
});
