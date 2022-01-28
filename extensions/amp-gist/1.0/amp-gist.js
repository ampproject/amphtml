import {Layout_Enum} from '#core/dom/layout';

import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-gist-1.0.css';

/** @const {string} */
const TAG = 'amp-gist';

class AmpGist extends BaseElement {
  /** @override */
  init() {
    return {
      'requestResize': (height) => this.attemptChangeHeight(height),
    };
  }

  /** @override @nocollapse */
  static getPreconnects() {
    return ['https://gist.github.com'];
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-gist'),
      'expected global "bento" or specific "bento-gist" experiment to be enabled'
    );
    return layout == Layout_Enum.FIXED_HEIGHT;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpGist, CSS);
});
