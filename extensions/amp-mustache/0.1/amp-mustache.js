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

import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {isExperimentOn} from '../../../src/experiments';
import {iterateCursor, templateContentClone} from '../../../src/dom';
import {
  sanitizeHtml,
  sanitizeTagsForTripleMustache,
} from '../../../src/sanitizer';
import {user} from '../../../src/log';
import mustache from '../../../third_party/mustache/mustache';

const TAG = 'amp-mustache';

/**
 * @typedef {BaseTemplate$$module$src$service$template_impl}
 */
AMP.BaseTemplate;

/**
 * Implements an AMP template for Mustache.js.
 * See {@link https://github.com/janl/mustache.js/}.
 *
 * @private Visible for testing.
 * @extends {AMP.BaseTemplate}
 * @suppress {checkTypes}
 */
export class AmpMustache extends AMP.BaseTemplate {
  /**
   * @param {!Element} element
   * @param {!Window} win
   */
  constructor(element, win) {
    super(element, win);

    // Unescaped templating (triple mustache) has a special, strict sanitizer.
    mustache.setUnescapedSanitizer(sanitizeTagsForTripleMustache);

    user().warn(
      TAG,
      'The extension "amp-mustache-0.1.js" is deprecated. ' +
        'Please use a more recent version of this extension.'
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
    iterateCursor(templates, (nestedTemplate, index) => {
      const nestedTemplateKey = `__AMP_NESTED_TEMPLATE_${index}`;
      this.nestedTemplates_[nestedTemplateKey] =
        nestedTemplate./*OK*/ outerHTML;
      const nestedTemplateAsVariable = this.element.ownerDocument.createTextNode(
        `{{{${nestedTemplateKey}}}}`
      );
      nestedTemplate.parentNode.replaceChild(
        nestedTemplateAsVariable,
        nestedTemplate
      );
    });
  }

  /** @override */
  setHtml(html) {
    return this.serializeHtml_(html);
  }

  /** @override */
  render(data) {
    let mustacheData = data;
    if (typeof data === 'object') {
      mustacheData = Object.assign({}, data, this.nestedTemplates_);
    }
    const html = mustache.render(
      this.template_,
      mustacheData,
      /* partials */ undefined
    );
    return this.serializeHtml_(html);
  }

  /**
   * Sanitizes the html and inserts it in the DOM.
   * @param {string} html
   * @return {!Element}
   * @private
   */
  serializeHtml_(html) {
    const doc = this.win.document;
    const root = doc.createElement('div');
    const diffing = isExperimentOn(self, 'amp-list-diffing');
    const sanitized = sanitizeHtml(html, doc, diffing);
    root./*OK*/ innerHTML = sanitized;
    return this.unwrap(root);
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  // First, unregister template to avoid "Duplicate template type"
  // error due to multiple versions of amp-mustache in the same unit test run.
  // This is due to transpilation of test code to ES5 which uses require() and,
  // unlike import, causes side effects (AMP.registerTemplate) to be run.
  // For unit tests, it doesn't actually matter which version of amp-mustache is
  // registered. Integration tests should only have one script version included.
  if (getMode().test) {
    Services.templatesFor(window).unregisterTemplate(TAG);
  }
  AMP.registerTemplate(TAG, AmpMustache);
});
