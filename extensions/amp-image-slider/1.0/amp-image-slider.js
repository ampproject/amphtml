import {ActionTrust} from '#core/constants/action-constants';

import {isExperimentOn} from '#experiments';

import {BaseElement} from './base-element';

import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-image-slider';

class AmpImageSlider extends BaseElement {
  /** @override */
  init() {
    this.registerApiAction('seekTo', (api, invocation) => {
      const {args} = invocation;
      api.seekTo(args['percent']);
    });

    return super.init();
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-image-slider'),
      'expected global "bento" or specific "bento-image-slider" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpImageSlider);
});
