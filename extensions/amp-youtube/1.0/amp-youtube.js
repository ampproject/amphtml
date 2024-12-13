import {AmpVideoBaseElement} from '#bento/components/bento-video/1.0/video-base-element';
import {BaseElement} from '#bento/components/bento-youtube/1.0/base-element';

import {isExperimentOn} from '#experiments';

import {setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-youtube-1.0.css';

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
