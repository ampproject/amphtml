import {Layout_Enum} from '#core/dom/layout';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {AmpEmbedlyKey, TAG as KEY_TAG} from './amp-embedly-key';
import {BaseElement} from './base-element';

/** @const {string} */
const TAG = 'amp-embedly-card';

class AmpEmbedlyCard extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  init() {
    return {
      'requestResize': (height) => this.attemptChangeHeight(height),
    };
  }

  /** @override */
  static getPreconnects() {
    return ['https://cdn.embedly.com'];
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-embedly-card'),
      'expected global "bento" or specific "bento-embedly-card" experiment to be enabled'
    );
    return layout == Layout_Enum.RESPONSIVE;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpEmbedlyCard);
  AMP.registerElement(KEY_TAG, AmpEmbedlyKey);
});
