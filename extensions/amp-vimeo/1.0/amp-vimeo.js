import {setSuperClass} from '#preact/amp-base-element';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-vimeo-1.0.css';
import {AmpVideoBaseElement} from '../../amp-video/1.0/video-base-element';

/** @const {string} */
const TAG = 'amp-vimeo';

class AmpVimeo extends setSuperClass(BaseElement, AmpVideoBaseElement) {}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVimeo, CSS);
});
