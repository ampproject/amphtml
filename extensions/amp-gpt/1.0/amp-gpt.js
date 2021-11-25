import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-gpt-1.0.css';
/** @const {string} */
const TAG = 'amp-gpt';

class AmpGpt extends BaseElement {
  /** @override */
  init() {
    this.registerApiAction('display', (api) => api.display());
    this.registerApiAction('refresh', (api) => api.refresh());
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-gpt'),
      'expected global "bento" or specific "bento-gpt" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpGpt, CSS);
});
