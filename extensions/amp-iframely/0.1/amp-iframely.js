import {createElementWithAttributes, removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {measureIntersection} from '#core/dom/layout/intersection';
import {setStyle} from '#core/dom/style';
import {omit} from '#core/types/object';
import {tryParseJson} from '#core/types/object/json';

import {getData, listen} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {addParamsToUrl} from '../../../src/url';

/** @const {string} */
export const TAG = 'amp-iframely';

/**
 * Implementation of the amp-iframely component.
 *
 * See {@link ../amp-iframely.md} for the spec.
 */
export class AmpIframely extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * Address of Iframely media (3rd party rich media or a summary card for the URL).
     * @private {string}
     */
    this.src_ = null;

    /**
     * The main iFrame element that loads Iframely media.
     * @private {?Element}
     */
    this.iframe_ = null;

    /**
     * ID of Iframely content, if available
     * @private {?string}
     */
    this.widgetId_ = null;

    /**
     * Domain of Iframely CDN
     * @private {?string}
     */
    this.base_ = null;

    /**
     * Alternatively, identify with Iframely CDN via `url` and `key` hash params
     * @private {?string}
     */
    this.url_ = null;
    /** @private {?string} */
    this.key_ = null;

    /**
     * other data- options that will be passed into iFrame src
     * @private {?Object}
     * */
    this.options_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    /** Populating parameters once */
    this.widgetId_ = this.element.getAttribute('data-id');
    this.url_ = this.element.getAttribute('data-url');
    this.key_ = this.element.getAttribute('data-key');
    this.options_ = this.parseOptions_();
    let domain = 'cdn.iframe.ly';
    const requestedDomain = this.element.getAttribute('data-domain');
    if (requestedDomain && this.isValidDomain_(requestedDomain)) {
      domain = requestedDomain;
    }
    this.base_ = `https://${domain}/`;
    this.parseAttributes_();
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    if (this.preconnect && this.preconnect.url_) {
      this.preconnect.url(this.base_, opt_onLayout);
    }
  }

  /** @override */
  createPlaceholderCallback() {
    /**
     * Building placeholder for responsive layout without resizing
     * or when requested via `data-img` attribute
     */
    const layout = this.getLayout();
    if (
      this.element.hasAttribute('data-img') ||
      (layout === 'responsive' && !this.element.hasAttribute('resizable'))
    ) {
      /** using Iframely placeholder image */
      const src = addParamsToUrl(
        this.constructSrc_('/thumbnail'),
        this.options_
      );
      const element = createElementWithAttributes(
        this.element.ownerDocument,
        'img',
        {
          'src': src,
          'loading': 'lazy',
          'placeholder': '',
        }
      );
      applyFillContent(element);
      return element;
    }
    return null;
  }

  /** @override */
  layoutCallback() {
    /** attach iFrame */
    this.iframe_ = this.element.ownerDocument.createElement('iframe');
    setStyle(this.iframe_, 'border', '0px');
    this.iframe_.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-popups allow-forms allow-presentation'
    );
    this.src_ = addParamsToUrl(this.src_, this.options_);
    this.iframe_.src = this.src_;
    applyFillContent(this.iframe_);
    this.element.appendChild(this.iframe_);

    this.unlistener_ = listen(this.win, 'message', (event) => {
      if (event.source === this.iframe_.contentWindow) {
        this.handleEvent_(event);
      }
    });
    return this.loadPromise(this.iframe_);
  }

  /**
   * Handles Iframely events: widget sizing, cancel, decorate cards
   * @param {window.event} event - Iframely message with a method to apply
   * */
  handleEvent_(event) {
    const data = tryParseJson(getData(event));
    if (!data) {
      return;
    }
    if (data.method === 'resize' && data.height > 50) {
      /** Set the size of the card according to the message from Iframely */
      this.attemptChangeHeight(data['height']).catch(() => {});
    } else if (data.method === 'setIframelyEmbedData') {
      /** apply Iframely card styles if present */
      const media = data['data']['media'] || null;
      if (media && media['aspect-ratio']) {
        const intersection = measureIntersection(this.element);
        intersection.then((box) => {
          if (media['padding-bottom']) {
            /** Apply height for media with updated "aspect-ratio" and "padding-bottom". */
            const height =
              box.boundingClientRect.width / media['aspect-ratio'] +
              media['padding-bottom'];
            this.attemptChangeHeight(Math.round(height)).catch(() => {});
          } else {
            const height = box.boundingClientRect.width / media['aspect-ratio'];
            if (Math.abs(box.boundingClientRect.height - height) > 1) {
              /** Apply new height for updated "aspect-ratio". */
              this.attemptChangeHeight(Math.round(height)).catch(() => {});
            }
          }
        });
      }
    }
    if (data.method === 'cancelWidget') {
      this.attemptCollapse().catch(() => {});
    }
  }

  /**
   * Constructing url SRC for api calls
   * @param {string} slug src or iframe src in case false
   * @return {string} url of the placeholder
   * @private
   * */
  constructSrc_(slug) {
    if (this.widgetId_) {
      return `${this.base_}${this.widgetId_}${
        slug !== '/iframe' ? slug : ''
      }?amp=1`;
    } else {
      return addParamsToUrl(`${this.base_}api${slug}`, {
        'url': this.url_,
        'key': this.key_,
        'amp': '1',
      });
    }
  }

  /**
   * Test component call for required params
   * @return {null}
   * @private
   * */
  parseAttributes_() {
    userAssert(
      this.element.getAttribute('data-id') ||
        this.element.getAttribute('data-url'),
      '<%s> requires either "data-id" or a pair of "data-url" and "data-key" attributes for %s',
      TAG,
      this.element
    );
    if (!this.widgetId_) {
      if (this.url_) {
        userAssert(
          this.key_,
          'Iframely data-key must also be set when you specify data-url parameter at <%s> %s',
          TAG,
          this.element
        );
      }
      if (this.key_) {
        userAssert(
          this.url_,
          'Iframely data-url must also be set when you specify data-key parameter at <%s> %s',
          TAG,
          this.element
        );
      }
      if (this.key_ || this.url_) {
        userAssert(
          !this.widgetId_,
          'Iframely data-id should not be set when there is already a pair of data-url and data-key for <%s> %s',
          TAG,
          this.element
        );
      }
    }
    if ((this.widgetId_ && this.url_) || (this.widgetId_ && this.key_)) {
      userAssert(
        !this.widgetId_,
        'Only one way of setting either data-id or data-url and data-key supported for <%s> %s',
        TAG,
        this.element
      );
    }
    this.src_ = this.constructSrc_('/iframe');
  }

  /**
   * Parse other data-* attributes and append them to API query url
   * @return {object} of Iframely options
   * @private
   * */
  parseOptions_() {
    return omit(this.element.dataset, ['id', 'domain', 'key', 'url', 'img']);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.unlisten_) {
      this.unlisten_();
      this.unlisten_ = null;
    }
    return true; // Request layoutCallback again.
  }

  /**
   * Validates that requested domain is a valid Iframely domain
   * @param {string} domainName - optional CDN alias, if different from the default Iframely host and is allowed.
   * @return {boolean} if domain is valid
   * @private
   * */
  isValidDomain_(domainName) {
    const allowedDomains = [
      /^(?:[^\.\/]+\.)?iframe\.ly$/i,
      /^if\-cdn\.com$/i,
      /^iframely\.net$/i,
      /^oembed\.vice\.com$/i,
      /^iframe\.nbcnews\.com$/i,
    ];
    return allowedDomains.reduce(
      (allowed, re) => allowed || re.test(domainName),
      false
    );
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpIframely);
});
