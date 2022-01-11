/**
 * @fileoverview Base layer from which other layers in a story page extend from.
 */

import {Layout_Enum} from '#core/dom/layout';

/**
 * Base layer template.
 */
export class AmpStoryBaseLayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.element.classList.add('i-amphtml-story-layer');
  }
}
