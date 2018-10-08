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
import {parse as mustacheParse, render as mustacheRender,
  setUnescapedSanitizer} from '../../../third_party/mustache/mustache';
import {purifyHtml, purifyTagsForTripleMustache} from '../../../src/purifier';

/**
 * Implements an AMP template for Mustache.js.
 * See {@link https://github.com/janl/mustache.js/}.
 *
 * @private Visible for testing.
 * @extends {BaseTemplate$$module$src$service$template_impl}
 */
export class AmpMustache extends AMP.BaseTemplate {
  /**
   * @param {!Element} element
   * @param {!Window} win
   */
  constructor(element, win) {
    super(element, win);

    // Unescaped templating (triple mustache) has a special, strict sanitizer.
    setUnescapedSanitizer(value =>
      purifyTagsForTripleMustache(value, this.win.document));
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

    const content = templateContentClone(this.element);
    this.processNestedTemplates_(content);
    const container = this.element.ownerDocument.createElement('div');
    container.appendChild(content);

    /** @private @const {string} */
    this.template_ = container./*OK*/innerHTML;
    mustacheParse(this.template_);
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
      this.nestedTemplates_[key] = template./*OK*/outerHTML;

      // Replace the markup with a pointer.
      const pointer = this.element.ownerDocument.createTextNode(`{{{${key}}}}`);
      template.parentNode.replaceChild(pointer, template);
    });
  }

  /** @override */
  render(data) {
    let html = data;
    if (!this.viewerCanRenderTemplates()) {
      let mustacheData = data;
      // Also render any nested templates.
      if (typeof data === 'object') {
        mustacheData = Object.assign({}, data, this.nestedTemplates_);
      }
      html = mustacheRender(this.template_, mustacheData);
    }
    const diffing = isExperimentOn(self, 'amp-list-diffing');
    const body = purifyHtml(html, diffing);
    // TODO(choumx): Remove innerHTML usage once DOMPurify bug is fixed.
    // https://github.com/cure53/DOMPurify/pull/295
    const root = this.win.document.createElement('div');
    root./*OK*/innerHTML = body./*OK*/innerHTML;
    return this.unwrap(root);
  }
}

// First, unregister template with same type to avoid "Duplicate template type"
// error due to multiple versions of amp-mustache in the same unit test run.
// This is due to transpilation of test code to ES5 which uses require() and,
// unlike import, causes side effects (AMP.registerTemplate) to be run.
// For unit tests, it doesn't actually matter which version of amp-mustache is
// registered. Integration tests should only have one script version included.
if (getMode().test) {
  Services.templatesFor(window).unregisterTemplate('amp-mustache');
}
AMP.registerTemplate('amp-mustache', AmpMustache);
