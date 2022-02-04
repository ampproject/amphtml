import {defineBentoElement} from '#preact/bento-ce';

import {BaseElement, TAG} from './base-element';

import {mustache} from '../../amp-mustache/1.0/bento-mustache';

export class BentoDateCountdown extends BaseElement {
  /** @override */
  checkPropsPostMutations() {
    const template = this.element.querySelector('template')./*OK*/ innerHTML;
    if (!template) {
      // show error?
      return;
    }

    this.mutateProps({
      'render': (data) => {
        const html = mustache.render(template, data);
        return {'__html': html};
      },
    });
  }
}

/**
 * Registers `<bento-date-countdown>` component to CustomElements registry
 */
export function defineElement() {
  defineBentoElement(TAG, BentoDateCountdown);
}
