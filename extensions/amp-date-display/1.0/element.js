import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';

import {createParseAttrsWithPrefix} from '#preact/parse-props';

export {BentoDateDisplay as Component} from './component';

export const props = {
  'datetime': {
    attrs: ['datetime', 'timestamp-ms', 'timestamp-seconds', 'offset-seconds'],
    parseAttrs: parseDateAttrs,
  },
  'displayIn': {attr: 'display-in'},
  'locale': {attr: 'locale'},
  'localeOptions': createParseAttrsWithPrefix('data-options-'),
};

export const layoutSizeDefined = true;

export const lightDomTag = 'div';

export const usesTemplate = true;

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
