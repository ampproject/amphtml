import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {
  AmpPreactBaseElement,
  setSuperClass,
} from '#preact/amp-preact-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

/** @const {string} */
const TAG = 'amp-wordpress-embed';

class AmpWordPressEmbed extends setSuperClass(
  BaseElement,
  AmpPreactBaseElement
) {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-wordpress-embed'),
      'expected global "bento" or specific "bento-wordpress-embed" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  init() {
    return dict({
      'requestResize': (height) =>
        this.attemptChangeHeight(height).catch(() => {
          /* ignore failures */
        }),
    });
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpWordPressEmbed);
});
