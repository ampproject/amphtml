import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

/** @const {string} */
const TAG = 'amp-beopinion';

class AmpBeopinion extends BaseElement {
  /** @override */
  init() {
    return dict({
      'requestResize': (height) => this.attemptChangeHeight(height),
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-beopinion'),
      'expected global "bento" or specific "bento-beopinion" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpBeopinion, CSS);
});
