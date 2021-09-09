import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';

import {PreactBaseElement} from '#preact/base-element';

import {BentoDateCountdown} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoDateCountdown;

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['lightDomTag'] = 'div';

/** @override */
BaseElement['usesTemplate'] = true;

/** @override */
BaseElement['props'] = {
  'datetime': {
    attrs: [
      'end-date',
      'timeleft-ms',
      'timestamp-ms',
      'timestamp-seconds',
      'offset-seconds',
    ],
    parseAttrs: parseDateAttrs,
  },
  'whenEnded': {attr: 'when-ended', type: 'string'},
  'locale': {attr: 'locale', type: 'string'},
  'biggestUnit': {attr: 'biggest-unit', type: 'string'},
  'countUp': {attr: 'count-up', type: 'boolean'},
};

/**
 * @param {!Element} element
 * @return {?number}
 * @throws {UserError} when attribute values are missing or invalid.
 * @visibleForTesting
 */
export function parseDateAttrs(element) {
  return parseDateAttrsBase(element, [
    'end-date',
    'timeleft-ms',
    'timestamp-ms',
    'timestamp-seconds',
  ]);
}
