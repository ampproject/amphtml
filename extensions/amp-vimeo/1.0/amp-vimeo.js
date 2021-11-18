import {isExperimentOn} from '#experiments';

import {
  AmpPreactBaseElement,
  setSuperClass,
} from '#preact/amp-preact-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-vimeo-1.0.css';

/** @const {string} */
const TAG = 'amp-vimeo';

class AmpVimeo extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-vimeo'),
      'expected global "bento" or specific "bento-vimeo" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVimeo, CSS);
});
