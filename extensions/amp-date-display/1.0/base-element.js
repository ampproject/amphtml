import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';

import {PreactBaseElement} from '#preact/base-element';
import {createParseAttrsWithPrefix} from '#preact/parse-props';

import {BentoDateDisplay} from './component';

import {mustache} from '../../amp-mustache/1.0/bento-mustache';

export class BaseElement extends PreactBaseElement {
  /** @override */
  checkPropsPostMutations() {
    const template = this.element.querySelector('template')./*OK*/ innerHTML;
    if (!template) {
      // show error
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

/** @override */
BaseElement['Component'] = BentoDateDisplay;

/** @override */
BaseElement['props'] = {
  'datetime': {
    attrs: ['datetime', 'timestamp-ms', 'timestamp-seconds', 'offset-seconds'],
    parseAttrs: parseDateAttrs,
  },
  'displayIn': {attr: 'display-in'},
  'locale': {attr: 'locale'},
  'localeOptions': createParseAttrsWithPrefix('data-options-'),
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['lightDomTag'] = 'div';

/** @override */
BaseElement['usesTemplate'] = true;

/**
 * @param {!Element} element
 * @return {?number}
 * @throws {UserError} when attribute values are missing or invalid.
 * @visibleForTesting
 */
export function parseDateAttrs(element) {
  return parseDateAttrsBase(element, [
    'datetime',
    'timestamp-ms',
    'timestamp-seconds',
  ]);
}
