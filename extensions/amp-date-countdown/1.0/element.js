import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';
export {BentoDateCountdown as Component} from './component';

export const layoutSizeDefined = true;

export const lightDomTag = 'div';

export const usesTemplate = true;

export const props = {
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
  'whenEnded': {attr: 'when-ended'},
  'locale': {attr: 'locale'},
  'biggestUnit': {attr: 'biggest-unit'},
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
