import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {Component, layoutSizeDefined, props, usesShadowDom} from './element';

/** @const {string} */
const TAG = 'amp-wordpress-embed';

class AmpWordPressEmbed extends AmpPreactBaseElement {
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

/** @override */
AmpWordPressEmbed['Component'] = Component;

/** @override */
AmpWordPressEmbed['props'] = props;

/** @override */
AmpWordPressEmbed['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
AmpWordPressEmbed['usesShadowDom'] = usesShadowDom;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpWordPressEmbed);
});
