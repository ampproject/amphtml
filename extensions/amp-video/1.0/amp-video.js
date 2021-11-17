import {CSS} from '../../../build/amp-video-1.0.css';
import {BaseElement} from './base-element';
import {registerVideoActions} from '#preact/video';
import {isExperimentOn} from '#experiments';
import {userAssert} from '#utils/log';

/** @const {string} */
const TAG = 'amp-video';

class AmpVideo extends BaseElement {
  /** @override */
  init() {
    registerVideoActions(this);
  }

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
