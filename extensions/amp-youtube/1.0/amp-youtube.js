import {isExperimentOn} from '#experiments';

import {setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-youtube-1.0.css';
import {AmpVideoBaseElement} from '../../amp-video/1.0/video-base-element';

/** @const {string} */
const TAG = 'amp-youtube';

class AmpYoutube extends setSuperClass(BaseElement, AmpVideoBaseElement) {
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
