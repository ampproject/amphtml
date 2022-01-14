import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-list-1.0.css';

/** @const {string} */
const TAG = 'amp-list';

class AmpList extends BaseElement {
  /** @override */
  init() {
    this.registerApiAction('refresh', (api) => api./*OK*/ refresh());

    // TODO: Handle templates, pass in fetchJson
    return super.init();
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-list'),
      'expected global "bento" or specific "bento-list" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpList, CSS);
});
