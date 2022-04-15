import {templateContentClone} from '#core/dom';

import {user} from '#utils/log';

import mustache from '#third_party/mustache/mustache';

import {BaseTemplate} from '../../../src/base-template';
import {
  sanitizeHtml,
  sanitizeTagsForTripleMustache,
} from '../../../src/sanitizer';

const TAG = 'amp-mustache';

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
    mustache.setUnescapedSanitizer((html) =>
      sanitizeTagsForTripleMustache(html, this.win.document)
    );

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
    this.nestedTemplates_ = {};

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
    }
    if (this.element.tagName == 'SCRIPT') {
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
    templates.forEach((nestedTemplate, index) => {
      const nestedTemplateKey = `__AMP_NESTED_TEMPLATE_${index}`;
      this.nestedTemplates_[nestedTemplateKey] =
        nestedTemplate./*OK*/ outerHTML;
      const nestedTemplateAsVariable =
        this.element.ownerDocument.createTextNode(`{{{${nestedTemplateKey}}}}`);
      nestedTemplate.parentNode.replaceChild(
        nestedTemplateAsVariable,
        nestedTemplate
      );
    });
  }

  /** @override */
  setHtml(html) {
    const wrapped = `<div>${html}</div>`;
    const serialized = this.serializeHtml_(wrapped);
    return this.unwrapChildren(serialized);
  }

  /** @override */
  render(data) {
    const html = this.render_(data);
    return this.serializeHtml_(html);
  }

  /** @override */
  renderAsString(data) {
    const html = this.render_(data);
    return sanitizeHtml(html, this.win.document);
  }

  /**
   * @param {!JsonObject|string} data
   * @return {string}
   * @private
   */
  render_(data) {
    let mustacheData = data;
    if (typeof data === 'object') {
      mustacheData = {...data, ...this.nestedTemplates_};
    }
    return mustache.render(
      this.template_,
      mustacheData,
      /* partials */ undefined
    );
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
    const sanitized = sanitizeHtml(html, doc);
    root./*OK*/ innerHTML = sanitized;
    return this.tryUnwrap(root);
  }
}

AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerTemplate(TAG, AmpMustache);
});
