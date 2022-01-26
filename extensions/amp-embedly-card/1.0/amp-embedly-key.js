import {Layout_Enum} from '#core/dom/layout';

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
    return layout === Layout_Enum.NODISPLAY;
  }
}
