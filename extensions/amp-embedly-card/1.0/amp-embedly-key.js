import {LAYOUT_ENUM} from '#core/dom/layout';

import {isExperimentOn} from '#experiments';

import {PreactBaseElement} from '#preact/base-element';

import {userAssert} from '#utils/log';

/** @const {string} */
export const TAG = 'amp-embedly-key';

export class AmpEmbedlyKey extends PreactBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-embedly-card'),
      'expected global "bento" or specific "bento-embedly-card" experiment to be enabled'
    );
    return layout === LAYOUT_ENUM.NODISPLAY;
  }
}
