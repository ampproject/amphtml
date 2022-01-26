import {Layout_Enum} from '#core/dom/layout';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

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
    return layout == Layout_Enum.RESPONSIVE;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpEmbedlyCard);
  AMP.registerElement(KEY_TAG, AmpEmbedlyKey);
});
