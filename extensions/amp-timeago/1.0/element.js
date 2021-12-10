import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';
export {BentoTimeago as Component} from './component';

export const layoutSizeDefined = true;

export const props = {
  'children': {passthroughNonEmpty: true},
  'cutoff': {attr: 'cutoff', type: 'number'},
  'datetime': {
    attrs: ['datetime', 'timestamp-ms', 'timestamp-seconds', 'offset-seconds'],
    parseAttrs: parseDateAttrs,
  },
  'locale': {attr: 'locale'},
};

export const usesShadowDom = true;

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

/**
 *
 * @param {!JsonObject} props
 */
export function updatePropsForRendering(props) {
  props['placeholder'] = props['children'];
}
