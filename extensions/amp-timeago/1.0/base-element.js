import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';

import {PreactBaseElement} from '#preact/base-element';

import {BentoTimeago} from './component';

export class BaseElement extends PreactBaseElement {
  /** @override */
  updatePropsForRendering(props) {
    props['placeholder'] = props['children'];
  }
}

/** @override */
BaseElement['Component'] = BentoTimeago;

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['props'] = {
  'children': {passthroughNonEmpty: true},
  'cutoff': {attr: 'cutoff', type: 'number'},
  'datetime': {
    attrs: ['datetime', 'timestamp-ms', 'timestamp-seconds', 'offset-seconds'],
    parseAttrs: parseDateAttrs,
  },
  'locale': {attr: 'locale'},
};

/** @override */
BaseElement['usesShadowDom'] = true;

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
