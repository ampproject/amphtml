import {removeElement} from '#core/dom';
import {Layout_Enum, applyFillContent} from '#core/dom/layout';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {TAG as KEY_TAG} from './amp-embedly-key';

import {getIframe} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';

/**
 * Component tag identifier.
 * @const {string}
 */
export const TAG = 'amp-embedly-card';

/**
 * Attribute name used to set api key with name
 * expected by embedly.
 * @const {string}
 */
const API_KEY_ATTR_NAME = 'data-card-key';

/**
 * Implementation of the amp-embedly-card component.
 * See {@link ../amp-embedly-card.md} for the spec.
 */
export class AmpEmbedlyCard extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?string} */
    this.apiKey_ = null;
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.getAttribute('data-url'),
      'The data-url attribute is required for <%s> %s',
      TAG,
      this.element
    );

    const ampEmbedlyKeyElement = document.querySelector(KEY_TAG);
    if (ampEmbedlyKeyElement) {
      this.apiKey_ = ampEmbedlyKeyElement.getAttribute('value');
    }
  }

  /** @override */
  layoutCallback() {
    // Add optional paid api key attribute if provided
    // to remove embedly branding.
    if (this.apiKey_) {
      this.element.setAttribute(API_KEY_ATTR_NAME, this.apiKey_);
    }

    const iframe = getIframe(this.win, this.element, 'embedly');
    iframe.title = this.element.title || 'Embedly card';

    const opt_is3P = true;
    listenFor(
      iframe,
      'embed-size',
      (data) => {
        this.forceChangeHeight(data['height']);
      },
      opt_is3P
    );

    applyFillContent(iframe);
    this.getVsync().mutate(() => {
      this.element.appendChild(iframe);
    });

    this.iframe_ = iframe;

    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }

    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.RESPONSIVE;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://cdn.embedly.com',
      opt_onLayout
    );
  }
}
