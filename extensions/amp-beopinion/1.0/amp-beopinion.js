import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {getBootstrapBaseUrl, getBootstrapUrl} from '../../../src/3p-frame';

/** @const {string} */
const TAG = 'amp-beopinion';
const TYPE = 'beopinion';

class AmpBeopinion extends BaseElement {
  /** @override @nocollapse */
  static getPreconnects(element) {
    const ampdoc = element.getAmpDoc();
    const {win} = ampdoc;
    return [
      // Base URL for 3p bootstrap iframes
      getBootstrapBaseUrl(win, ampdoc),
      // Script URL for iframe
      getBootstrapUrl(TYPE),
      // Hosts the script that renders widgets.
      'https://widget.beop.io/sdk.js',

      'https://s.beop.io',
      'https://t.beop.io',
      'https://data.beop.io',
    ];
  }

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
