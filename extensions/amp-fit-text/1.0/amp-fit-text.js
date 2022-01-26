import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-fit-text-1.0.css';

/** @const {string} */
const TAG = 'amp-fit-text';

class AmpFitText extends setSuperClass(BaseElement, AmpPreactBaseElement) {}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpFitText, CSS);
});
