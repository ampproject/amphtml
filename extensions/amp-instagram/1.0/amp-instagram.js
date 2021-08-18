

import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-instagram-1.0.css';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-instagram';

class AmpInstagram extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-instagram'),
      'expected global "bento" or specific "bento-instagram" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  init() {
    return dict({
      'requestResize': (height) => this.attemptChangeHeight(height),
    });
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpInstagram, CSS);
});
