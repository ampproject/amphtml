import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {BaseElement} from './base-element';

import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-wordpress-embed';

class AmpWordPressEmbed extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-wordpress-embed'),
      'expected global "bento" or specific "bento-wordpress-embed" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  init() {
    return dict({
      'requestResize': (height) =>
        this.attemptChangeHeight(height).catch(() => {
          /* ignore failures */
        }),
    });
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpWordPressEmbed);
});
