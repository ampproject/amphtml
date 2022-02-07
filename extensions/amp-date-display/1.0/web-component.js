import {defineBentoElement} from '#preact/bento-ce';

import {getTemplate} from '#utils/template-utils';

import {BaseElement, TAG} from './base-element';

import mustache from '#bento/components/bento-mustache/1.0/bento-mustache';

export class BentoDateDisplay extends BaseElement {
  /** @override */
  checkPropsPostMutations() {
    const template = getTemplate(this.element);
    if (!template) {
      // show error?
      return;
    }

    this.mutateProps({
      'render': (data) => {
        const html = mustache.render(template./*OK*/ innerHTML, data);
        return {'__html': html};
      },
    });
  }
}

/**
 * Registers `<bento-date-display>` component to CustomElements registry
 */
export function defineElement() {
  defineBentoElement(TAG, BentoDateDisplay);
}
