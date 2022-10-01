import {endsWith} from '#core/types/string';

import * as urls from '../../../src/config/urls';

export class ExternalReorderHeadTransformer {
  /** constructor */
  constructor() {
    /** @private {!Object} */
    this.headComponents_ = {
      metaOther: [],
      scriptNonRenderDelayingExtensions: [],
      scriptRenderDelayingExtensions: [],
      linkIcons: [],
      linkResourceHints: [],
      linkStylesheetBeforeAmpCustom: [],
      other: [],
      otherScripts: [],
      styleAmpRuntime: null,
      metaCharset: null,
      scriptAmpEngine: null,
      scriptAmpViewer: null,
      scriptGmailAmpViewer: null,
      styleAmpCustom: null,
      linkStylesheetRuntimeCss: null,
      styleAmpBoilerplate: null,
      noscript: null,
    };
  }

  /**
   * Appends child to parent, if child is not null
   * @param {Element} parent
   * @param {Element} element
   */
  appendIfNotNull_(parent, element) {
    if (element != null) {
      parent.appendChild(element);
    }
  }

  /**
   * Appends all children to parent
   * @param {Element} parent
   * @param {Array<Element>} element
   */
  appendAll_(parent, element) {
    for (let i = 0; i < element.length; i++) {
      const child = element[i];
      parent.appendChild(child);
    }
  }

  /**
   * Reorders head like so:
   * (0) <meta charset> tag
   * (1) <style amp-runtime>
   * (2) remaining <meta> tags (those other than <meta charset>)
   * (3) AMP runtime .js <script> tag
   * (4) AMP viewer runtime .js <script> tag
   * (5) Gmail AMP viewer runtime .js <script> tag
   * (6) <script> tags for render delaying extensions
   * (7) <script> tags for remaining extensions
   * (8) <link> tag for favicon
   * (9) <link> tag for resource hints
   * (10) <link rel=stylesheet> tags before <style amp-custom>
   * (11) <style amp-custom>
   * (12) any other tags allowed in <head>
   * (13) amp boilerplate (first style amp-boilerplate, then noscript)
   *
   * http://g3doc/search/amphtml/transformers/g3doc/t/ExternalReorderHead.md
   * @param {Element} head
   * @return {Element}
   */
  reorderHead(head) {
    if (head != null) {
      for (let i = 0; i < head.children.length; i++) {
        const child = head.children.item(i);
        switch (child.tagName) {
          case 'META':
            this.registerMeta_(child);
            break;
          case 'SCRIPT':
            this.registerScript_(child);
            break;
          case 'STYLE':
            this.registerStyle_(child);
            break;
          case 'LINK':
            this.registerLink_(child);
            break;
          case 'NOSCRIPT':
            this.headComponents_.noscript = child;
            break;
          default:
            if (this.headComponents_.other.indexOf(child) == -1) {
              this.headComponents_.other.push(child);
            }
        }
      }
      for (let i = 0; i < head.childNodes.length; i++) {
        head.removeChild(head.childNodes.item(i));
      }
      this.repopulate_(head);
    }

    return head;
  }

  /**
   * Classifies all elements with meta tags
   * @param {Element} element
   *
   */
  registerMeta_(element) {
    if (element.hasAttribute('charset')) {
      this.headComponents_.metaCharset = element;
      return;
    }
    if (this.headComponents_.metaOther.indexOf(element) == -1) {
      this.headComponents_.metaOther.push(element);
      return;
    }
  }

  /**
   * Classifies all elements with script tags
   * @param {Element} element
   *
   */
  registerScript_(element) {
    const src = element.getAttribute('src');
    const isAsync = element.hasAttribute('async');
    const isExtension =
      element.hasAttribute('custom-element') ||
      element.hasAttribute('custom-template') ||
      element.hasAttribute('host-service');
    if (isExtension) {
      const custom = element.getAttribute('custom-element');
      if (
        custom == 'amp-story' ||
        custom == 'amp-experiment' ||
        custom == 'amp-dynamic-css-classes'
      ) {
        this.headComponents_.scriptRenderDelayingExtensions.push(element);
        return;
      }
      this.headComponents_.scriptNonRenderDelayingExtensions.push(element);
      return;
    }
    if (
      isAsync &&
      ((src.startsWith(urls.cdn) &&
        (endsWith(src, '/v0.js') || endsWith(src, '/amp4ads-v0.js'))) ||
        endsWith(src, '/dist/amp.js') ||
        endsWith(src, '/dist/amp-inabox.js') ||
        endsWith(src, '/dist/v0.js') ||
        endsWith(src, '/dist/amp4ads-v0.js'))
    ) {
      this.headComponents_.scriptAmpEngine = element;
      return;
    }
    if (
      isAsync &&
      src.startsWith(urls.cdn + '/v0/amp-viewer-integration-gmail-') &&
      endsWith(src, '.js')
    ) {
      this.headComponents_.scriptGmailAmpViewer = element;
      return;
    }
    if (
      isAsync &&
      (src.startsWith(urls.cdn + '/v0/amp-viewer-integration-') ||
        (src.startsWith(urls.cdn + '/viewer/google/v') && endsWith(src, '.js')))
    ) {
      this.headComponents_.scriptAmpViewer = element;
      return;
    }
    if (this.headComponents_.other.indexOf(element) == -1) {
      this.headComponents_.other.push(element);
    }
  }

  /**
   * Classifies all elements with style tags
   * @param {Element} element
   *
   */
  registerStyle_(element) {
    if (element.hasAttribute('amp-runtime')) {
      this.headComponents_.styleAmpRuntime = element;
      return;
    }
    if (element.hasAttribute('amp-custom')) {
      this.headComponents_.styleAmpCustom = element;
      return;
    }
    if (
      element.hasAttribute('amp-boilerplate') ||
      element.hasAttribute('amp4ads-boilerplate')
    ) {
      this.headComponents_.styleAmpBoilerplate = element;
      return;
    }
    if (this.headComponents_.other.indexOf(element) == -1) {
      this.headComponents_.other.push(element);
    }
  }

  /**
   * Classifies all links
   * @param {Element} element
   *
   */
  registerLink_(element) {
    const rel = element.getAttribute('rel');
    if (rel == 'stylesheet') {
      if (
        element.getAttribute('href').startsWith(urls.cdn) &&
        endsWith(element.getAttribute('href'), '/v0.css')
      ) {
        this.headComponents_.linkStylesheetRuntimeCss = element;
        return;
      }
      if (this.headComponents_.styleAmpCustom == null) {
        this.headComponents_.linkStylesheetBeforeAmpCustom.push(element);
        return;
      }
      return;
    }
    if (rel == 'icon' || rel == 'icon shortcut' || rel == 'shortcut icon') {
      this.headComponents_.linkIcons.push(element);
      return;
    }
    if (rel == 'dns-prefetch preconnect') {
      this.headComponents_.linkResourceHints.push(element);
      return;
    }
    if (this.headComponents_.other.indexOf(element) == -1) {
      this.headComponents_.other.push(element);
    }
  }

  /**
   * Add components back to head in specified order
   * @param {Element} head
   * @return {Element}
   */
  repopulate_(head) {
    this.appendIfNotNull_(head, this.headComponents_.metaCharset);
    this.appendIfNotNull_(head, this.headComponents_.linkStylesheetRuntimeCss);
    this.appendIfNotNull_(head, this.headComponents_.styleAmpRuntime);
    this.appendAll_(head, this.headComponents_.metaOther);
    this.appendIfNotNull_(head, this.headComponents_.scriptAmpEngine);
    this.appendIfNotNull_(head, this.headComponents_.scriptAmpViewer);
    this.appendIfNotNull_(head, this.headComponents_.scriptGmailAmpViewer);
    this.appendAll_(head, this.headComponents_.scriptRenderDelayingExtensions);
    this.appendAll_(
      head,
      this.headComponents_.scriptNonRenderDelayingExtensions
    );
    this.appendAll_(head, this.headComponents_.otherScripts);
    this.appendAll_(head, this.headComponents_.linkIcons);
    this.appendAll_(head, this.headComponents_.linkResourceHints);
    this.appendAll_(head, this.headComponents_.linkStylesheetBeforeAmpCustom);
    this.appendIfNotNull_(head, this.headComponents_.styleAmpCustom);
    this.appendAll_(head, this.headComponents_.other);
    this.appendIfNotNull_(head, this.headComponents_.styleAmpBoilerplate);
    this.appendIfNotNull_(head, this.headComponents_.noscript);
    return head;
  }
}
