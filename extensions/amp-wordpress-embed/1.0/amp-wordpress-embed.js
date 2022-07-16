import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {BaseElement} from './base-element';

/** @const {string} */
const TAG = 'amp-wordpress-embed';

class AmpWordPressEmbed extends setSuperClass(
  BaseElement,
  AmpPreactBaseElement
) {
  /** @override */
  isLayoutSupported(layout) {
    return super.isLayoutSupported(layout);
  }

  /** @override */
  init() {
    return {
      'requestResize': (height) =>
        this.attemptChangeHeight(height).catch(() => {
          /* ignore failures */
        }),
    };
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpWordPressEmbed);
});
