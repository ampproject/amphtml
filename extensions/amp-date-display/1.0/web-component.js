import mustache from '#bento/components/bento-mustache/1.0/bento-mustache';
import {getTemplate} from '#bento/util/template';

import {defineBentoElement} from '#preact/bento-ce';

import {BaseElement, TAG} from './base-element';

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
 * @param {typeof globalThis=} win
 */
export function defineElement(win) {
  defineBentoElement(TAG, BentoDateDisplay, win);
}
