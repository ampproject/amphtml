import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';
import {dict} from '#core/types/object';

import {PreactBaseElement} from '#preact/base-element';
import {createParseAttrsWithPrefix} from '#preact/parse-props';

import {getTemplateElement, getTemplateFunction} from '#utils/template-utils';

import {BentoDateDisplay} from './component';

export class BaseElement extends PreactBaseElement {
  /** @override */
  checkPropsPostMutations() {
    const template = getTemplateElement(this.element);
    if (!template) {
      return;
    }

    this.mutateProps(
      dict({
        'render': (data) => {
          const templateFn = getTemplateFunction(data, template);
          return dict({'__html': templateFn()});
        },
      })
    );
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
