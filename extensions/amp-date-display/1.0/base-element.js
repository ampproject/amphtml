import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';

import {PreactBaseElement} from '#preact/base-element';
import {createParseAttrsWithPrefix} from '#preact/parse-props';

// this should come from including bento-mustache-1.0.js
import {AmpMustache} from 'extensions/amp-mustache/1.0/amp-mustache';

import {BentoDateDisplay} from './component';

export class BaseElement extends PreactBaseElement {
  /**
   * @param element
   */
  constructor(element) {
    super(element);

    this.templateService_ = null;

    element.addEventListener('templateServiceLoaded', (event) => {
      const {mustache} = event;
      if (mustache) {
        this.templateService_ = Promise.resolve(event.mustache);
      }
    });
  }

  /** @override */
  checkPropsPostMutations() {
    const template = this.element.querySelector('template')./*OK*/ innerHTML;
    if (!template) {
      // show error
      return;
    }

    this.templateService_ = this.templateService_ ?? AmpMustache.getService();
    if (!this.templateService_) {
      return;
    }

    this.templateService_.then((mustache) => {
      this.mutateProps({
        'render': (data) => {
          console.log(data);
          const output = mustache.render(template, data);
          return {'__html': output};
        },
      });
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
