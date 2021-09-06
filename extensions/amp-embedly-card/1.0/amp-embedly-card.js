import {Layout} from '#core/dom/layout';
import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {AmpEmbedlyKey, TAG as KEY_TAG} from './amp-embedly-key';
import {BaseElement} from './base-element';

import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-embedly-card';

class AmpEmbedlyCard extends BaseElement {
  /** @override */
  init() {
    return dict({
      'requestResize': (height) => this.attemptChangeHeight(height),
    });
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
    return layout == Layout.RESPONSIVE;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpEmbedlyCard);
  AMP.registerElement(KEY_TAG, AmpEmbedlyKey);
});
