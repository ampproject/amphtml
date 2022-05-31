import {templateContentClone} from '#core/dom';

import {Purifier} from '#purifier';

import {user} from '#utils/log';

import mustache from '#third_party/mustache/mustache';

import {BaseTemplate} from '../../../src/base-template';
import {getService, registerServiceBuilder} from '../../../src/service-helpers';
import {rewriteAttributeValue} from '../../../src/url-rewrite';

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

    registerServiceBuilder(win, 'purifier', function () {
      return new Purifier(win.document, {}, rewriteAttributeValue);
    });
    /** @private @const {!Purifier} */
    this.purifier_ = getService(win, 'purifier');

    // Unescaped templating (triple mustache) has a special, strict sanitizer.
    mustache.setUnescapedSanitizer((value) =>
      this.purifier_.purifyTagsForTripleMustache(value)
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

    try {
      mustache.parse(this.template_, /* tags */ undefined);
    } catch (err) {
      user().error(TAG, err.message, this.element);
    }
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
    templates.forEach((template, index) => {
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
    const wrapped = `<div>${html}</div>`;
    const purified = this.tryUnwrap(this.purifyAndSetHtml_(wrapped));
    return this.unwrapChildren(purified);
  }

  /** @override */
  render(data) {
    return this.tryUnwrap(this.render_(data));
  }

  /** @override */
  renderAsString(data) {
    return this.render_(data)./*OK*/ innerHTML;
  }

  /**
   * @param {!JsonObject|string} data
   * @return {!Element}
   * @private
   */
  render_(data) {
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
   * @param {string} html
   * @return {!Element}
   * @private
   */
  purifyAndSetHtml_(html) {
    const body = this.purifier_.purifyHtml(`<div>${html}</div>`);
    return body.firstElementChild;
  }
}

AMP.extension(TAG, '0.2', function (AMP) {
  AMP.registerTemplate(TAG, AmpMustache);
});
