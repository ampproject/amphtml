/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {devAssert, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {iterateCursor} from '../../../src/dom';
import {whenDocumentComplete} from '../../../src/document-ready';

export class AmpCssValidator extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    if (getMode().development) {
      const doc = devAssert(this.element.ownerDocument);
      whenDocumentComplete(doc).then(() => {
        const {styleSheets} = doc;
        if (!styleSheets) {
          return;
        }
        iterateCursor(styleSheets, styleSheet => {
          if (styleSheet.ownerNode.hasAttribute('amp-custom')) {
            this.findStyleRule_(styleSheet.rules);
          }
        });
      });
    }
  }

  /**
   * @private
   * @param {CSSRuleList} rules css rules
   */
  findStyleRule_(rules) {
    const fn = rule => {
      if (rule.type === CSSRule.STYLE_RULE) {
        const nodes = this.element.ownerDocument.querySelector(
          rule.selectorText
        );
        if (!nodes) {
          const size = rule.cssText.length;
          user().warn(
            'AMP-CSS-VALIDATOR',
            'Potentially unused selector found: ',
            rule.selectorText + '.\n',
            'Remove it to save ' + size + ' Bytes.'
          );
        }
      } else if (rule.cssRules) {
        fn(rule.cssRules);
      }
    };
    if (rules) {
      iterateCursor(rules, fn);
    }
  }
}

AMP.extension('amp-css-validator', '0.1', AMP => {
  AMP.registerElement('amp-css-validator', AmpCssValidator);
});
