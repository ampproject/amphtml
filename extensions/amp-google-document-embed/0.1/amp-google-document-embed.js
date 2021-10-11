/**
 * @fileoverview Embeds the Google Docs viewer
 *
 * Example:
 * <code>
 * <amp-google-document-embed
 *   layout="fixed-height"
 *   src="https://www.example.com/my-document.pdf"
 *   height="600">
 * </amp-google-document-embed>
 * </code>
 */

import {removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';

import {Services} from '#service';

import {dev, userAssert} from '#utils/log';

import {addParamToUrl} from '../../../src/url';

export const TAG = 'amp-google-document-embed';

const ATTRIBUTES_TO_PROPAGATE = ['title'];

const GOOGLE_DOCS_EMBED_RE = /^https?:\/\/docs\.google\.com.+\/pub.*\??/;

export class AmpDriveViewer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;
  }

  /**
   * Prefetches and preconnects URLs related to the viewer.
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://docs.google.com',
      opt_onLayout
    );
  }

  /** @override */
  renderOutsideViewport() {
    // We are conservative about loading heavy embeds outside the viewport.
    // This will still start loading before it becomes visible, but it
    // won't typically load a large number of embeds.
    return 0.75;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.getAttribute('src'),
      'The src attribute is required for <amp-google-document-embed> %s',
      this.element
    );
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    propagateAttributes(ATTRIBUTES_TO_PROPAGATE, this.element, iframe);

    iframe.src = this.getSrc_(this.element.getAttribute('src'));

    applyFillContent(iframe);
    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const attrs = ATTRIBUTES_TO_PROPAGATE.filter(
      (value) => mutations[value] !== undefined
    );
    const iframe = dev().assertElement(this.iframe_);
    propagateAttributes(
      attrs,
      this.element,
      iframe,
      /* opt_removeMissingAttrs */ true
    );
    const src = mutations['src'];
    if (src) {
      iframe.src = this.getSrc_(src);
    }
  }

  /**
   * Get the iframe source. Google Docs are special cased since they display
   * using their own embed URL.
   * @param {string} src
   * @return {string} A URL to display a document using the Google Drive viewer.
   */
  getSrc_(src) {
    if (src.match(GOOGLE_DOCS_EMBED_RE)) {
      return src;
    }
    return addParamToUrl(
      'https://docs.google.com/gview?embedded=true',
      'url',
      src
    );
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }
}

AMP.extension('amp-google-document-embed', '0.1', (AMP) => {
  AMP.registerElement('amp-google-document-embed', AmpDriveViewer);
});
