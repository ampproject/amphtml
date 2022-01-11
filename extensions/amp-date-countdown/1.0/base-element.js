import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';
import {dict} from '#core/types/object';

import {PreactBaseElement} from '#preact/base-element';

import {getTemplateElement, getTemplateFunction} from '#utils/template-utils';

import {BentoDateCountdown} from './component';

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
