import {Layout_Enum} from '#core/dom/layout';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {EmbedlyKeyBaseElement} from './key-base-element';

/** @const {string} */
export const TAG = 'amp-embedly-key';

export class AmpEmbedlyKey extends setSuperClass(
  EmbedlyKeyBaseElement,
  AmpPreactBaseElement
) {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-embedly-card'),
      'expected global "bento" or specific "bento-embedly-card" experiment to be enabled'
    );
    return layout === Layout_Enum.NODISPLAY;
  }
}
