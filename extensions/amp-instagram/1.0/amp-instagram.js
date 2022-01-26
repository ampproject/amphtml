import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-instagram-1.0.css';

/** @const {string} */
const TAG = 'amp-instagram';

class AmpInstagram extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  init() {
    return {
      'requestResize': (height) => this.attemptChangeHeight(height),
    };
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpInstagram, CSS);
});
