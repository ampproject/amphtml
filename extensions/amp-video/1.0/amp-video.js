import {CSS} from '../../../build/amp-video-1.0.css';
import {VideoBaseElement} from './video-base-element';
import {isExperimentOn} from '#experiments';
import {userAssert} from '#utils/log';

import {
  AmpPreactBaseElement,
  setSuperClass,
} from '#preact/amp-preact-base-element';

/** @const {string} */
const TAG = 'amp-video';

class AmpVideo extends setSuperClass(VideoBaseElement, AmpPreactBaseElement) {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-video'),
      'expected global "bento" or specific "bento-video" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVideo, CSS);
});
