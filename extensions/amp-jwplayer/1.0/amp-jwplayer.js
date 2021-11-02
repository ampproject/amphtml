import {BaseElement} from '#bento/components/amp-jwplayer/1.0/base-element';

import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

/** @const {string} */
const TAG = 'amp-jwplayer';

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpJwplayer extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-jwplayer'),
      'expected global "bento" or specific "bento-jwplayer" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpJwplayer);
});
