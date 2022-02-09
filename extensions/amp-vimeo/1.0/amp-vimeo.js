import {isExperimentOn} from '#experiments';

import {setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-vimeo-1.0.css';
import {AmpVideoBaseElement} from '../../amp-video/1.0/video-base-element';

/** @const {string} */
const TAG = 'amp-vimeo';

class AmpVimeo extends setSuperClass(BaseElement, AmpVideoBaseElement) {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-vimeo'),
      'expected global "bento" or specific "bento-vimeo" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVimeo, CSS);
});
