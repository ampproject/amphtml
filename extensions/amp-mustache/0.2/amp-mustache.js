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
import {purifyHtml, purifyTagsForTripleMustache} from '../../../src/purifier';
import mustache from '../../../third_party/mustache/mustache';

const TAG = 'amp-mustache';

const BaseTemplate =
  /** @type {function(new:../../../src/service/template-impl.BaseTemplate)} */ (AMP.BaseTemplate);

/**
 * Implements an AMP template for Mustache.js.
 * See {@link https://github.com/janl/mustache.js/}.
 *
 * @visibleForTesting
 */
export class AmpMustache extends BaseTemplate {
  /**
   * @param {!Element} element
   * @param {!Window} win
   */
  constructor(element, win) {
    super(element, win);

    // Unescaped templating (triple mustache) has a special, strict sanitizer.
    mustache.setUnescapedSanitizer(value =>
      purifyTagsForTripleMustache(value, this.win.document)
    );
  }

  /** @override */
  compileCallback() {
    // If viewer is renderTemplate capable, skip the handling of the mustache
    // templates as its rendering is managed by the viewer. This template will
    // only be responsible for sanitizing and inserting it into the DOM.
    if (this.viewerCanRenderTemplates()) {
      return;
    }
    /** @private @const {!JsonObject} */
    this.nestedTemplates_ = dict();

    /** @private @const {string} */
    this.template_ = this.initTemplateString_();

    mustache.parse(this.template_, /* tags */ undefined);
  }

  /**
   * @private
   * @return {string}
   */
  initTemplateString_() {
    if (this.element.tagName == 'TEMPLATE') {
      const content = templateContentClone(this.element);
      this.processNestedTemplates_(content);
      const container = this.element.ownerDocument.createElement('div');
      container.appendChild(content);
      return container./*OK*/ innerHTML;
    } else if (this.element.tagName == 'SCRIPT') {
      return this.element.textContent;
    }

    return '';
  }

  /**
   * Stores and replaces nested templates with custom triple-mustache pointers.
   *
   * This prevents the outer-most template from replacing variables in nested
   * templates. Note that this constrains nested template markup to the more
   * restrictive sanitization rules of triple-mustache.
   *
   * @param {!DocumentFragment} content
   */
  processNestedTemplates_(content) {
    const templates = content.querySelectorAll('template');
    iterateCursor(templates, (template, index) => {
      const key = `__AMP_NESTED_TEMPLATE_${index}`;

      // Store the nested template markup, keyed by index.
      this.nestedTemplates_[key] = template./*OK*/ outerHTML;

      // Replace the markup with a pointer.
      const pointer = this.element.ownerDocument.createTextNode(`{{{${key}}}}`);
      template.parentNode.replaceChild(pointer, template);
    });
  }

  /** @override */
  setHtml(html) {
    return this.purifyAndSetHtml_(html);
  }

  /** @override */
  render(data) {
    let mustacheData = data;
    // Also render any nested templates.
    if (typeof data === 'object') {
      mustacheData = {...data, ...this.nestedTemplates_};
    }
    const html = mustache.render(
      this.template_,
      mustacheData,
      /* partials */ undefined
    );
    return this.purifyAndSetHtml_(html);
  }

  /**
   *
   * @param {string} html
   * @return {!Element}
   * @private
   */
  purifyAndSetHtml_(html) {
    const body = purifyHtml(html, this.win.document);
    // TODO(choumx): Remove innerHTML usage once DOMPurify bug is fixed.
    // https://github.com/cure53/DOMPurify/pull/295
    const root = this.win.document.createElement('div');
    root./*OK*/ innerHTML = body./*OK*/ innerHTML;
    return this.unwrap(root);
  }
}

AMP.extension(TAG, '0.2', function(AMP) {
  AMP.registerTemplate(TAG, AmpMustache);
});
