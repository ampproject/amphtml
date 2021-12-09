import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';
import {dict} from '#core/types/object';

import {PreactBaseElement} from '#preact/base-element';
import {createParseAttrsWithPrefix} from '#preact/parse-props';

import {BentoDateDisplay} from './component';

/**
 * @param {string} str
 * @return string with escaped backticks (`)
 */
function escapeBackticks(str) {
  return str.replaceAll('`', '\\`');
}

export class BaseElement extends PreactBaseElement {
  /** @override */
  checkPropsPostMutations() {
    const template = this.element.hasAttribute('template')
      ? this.element.ownerDocument.getElementById(
          this.element.getAttribute('template')
        )
      : this.element.querySelector('template');
    if (!template) {
      // show error
      return;
    }

    this.mutateProps(
      dict({
        'render': (data) => {
          let destructure = '';
          for (const [key, value] of Object.entries(data)) {
            destructure += `const ${key} = '${value}';`;
          }
          let templateStr = '';
          for (let i = 0; i < template.content.children.length; i++) {
            templateStr += template.content.children[i]./*REVIEW*/ outerHTML;
          }
          const templateFn = new Function(
            `${destructure} return \`${escapeBackticks(templateStr)}\`;`
          );
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
