/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {dict} from '../../../src/utils/object';
import {iterateCursor, templateContentClone} from '../../../src/dom';
import {parse as mustacheParse, render as mustacheRender,
  setUnescapedSanitizier} from '../../../third_party/mustache/mustache';
import {sanitizeFormattingHtml, sanitizeHtml} from '../../../src/sanitizer';

// Configure inline sanitizer for unescaped values.
setUnescapedSanitizier(sanitizeFormattingHtml);


/**
 * Implements an AMP template for Mustache.js.
 * See {@link https://github.com/janl/mustache.js/}.
 *
 * @private Visible for testing.
 * @extends {BaseTemplate$$module$src$service$template_impl}
 */
export class AmpMustache extends AMP.BaseTemplate {

  /** @override */
  compileCallback() {
    /** @private @const {!JsonObject} */
    this.nestedTemplates_ = dict();
    let index = 0;
    const content = templateContentClone(this.element);
    iterateCursor(content.querySelectorAll('template'), nestedTemplate => {
      const nestedTemplateKey = `__AMP_NESTED_TEMPLATE_${index}`;
      this.nestedTemplates_[nestedTemplateKey] = nestedTemplate./*OK*/outerHTML;

      const nestedTemplateAsVariable = this.element.ownerDocument
          .createTextNode(`{{{${nestedTemplateKey}}}}`);
      nestedTemplate.parentNode.replaceChild(nestedTemplateAsVariable,
          nestedTemplate);
      index++;
    });
    const container = this.element.ownerDocument.createElement('div');
    container.appendChild(content);
    /** @private @const {string} */
    this.template_ = container./*OK*/innerHTML;
    mustacheParse(this.template_);
  }

  /** @override */
  render(data) {
    let mustacheData = data;
    if (typeof data === 'object') {
      mustacheData = Object.assign({}, data, this.nestedTemplates_);
    }
    const html = mustacheRender(this.template_, mustacheData);
    const sanitized = sanitizeHtml(html);
    const root = this.win.document.createElement('div');
    root./*OK*/innerHTML = sanitized;
    return this.unwrap(root);
  }
}


AMP.registerTemplate('amp-mustache', AmpMustache);
