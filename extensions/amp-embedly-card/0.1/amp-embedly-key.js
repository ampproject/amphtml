import {Layout_Enum} from '#core/dom/layout';

import {userAssert} from '#utils/log';

/** @const {string} */
export const TAG = 'amp-embedly-key';

/**
 * Implementation of the amp-embedly-key component.
 *
 * Gets api key from user input to be used by other embedly components.
 *
 * See {@link ../amp-embedly-card.md} for the spec.
 */
export class AmpEmbedlyKey extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.getAttribute('value'),
      'The value attribute is required for <%s>',
      TAG,
      this.element
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.NODISPLAY;
  }
}
