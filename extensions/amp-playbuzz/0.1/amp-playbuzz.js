/**
 * @fileoverview Embeds an playbuzz item.
 * The src attribute can be easily copied from a normal playbuzz URL.
 * data-item supports item id which can be taken from the item's embed code
 * in case both are present data-item will be used
 * Example:
 * <code>
    <amp-playbuzz
        src="http://www.playbuzz.com/perezhilton/poll-which-presidential-candidate-did-ken-bone-vote-for"
        data-item="a6aa5a14-8888-4618-b2e3-fe6a30d8c51b"
        layout="responsive"
        height="300"
        width="300"
        data-item-info="true"
        data-share-buttons="true"
        data-comments="true">
    </amp-playbuzz>
 * </code>
 *
 * For responsive embedding the width and height can be left unchanged from
 * the example above and will produce the correct aspect ratio.
 */

import {CSS} from '#build/amp-playbuzz-0.1.css';

import {removeElement} from '#core/dom';
import {Layout_Enum, applyFillContent} from '#core/dom/layout';
import {observeIntersections} from '#core/dom/layout/viewport-observer';

import {Services} from '#service';

import * as events from '#utils/event-helper';
import {dev, userAssert} from '#utils/log';

import {logo, showMoreArrow} from './images';
import * as utils from './utils';

import {
  assertAbsoluteHttpOrHttpsUrl,
  parseUrlDeprecated,
  removeFragment,
} from '../../../src/url';

class AmpPlaybuzz extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @visibleForTesting {?Promise} */
    this.iframePromise_ = null;

    /** @private {?number} */
    this.itemHeight_ = 300; //default

    /** @private {?boolean} */
    this.displayItemInfo_ = false;

    /** @private {?boolean} */
    this.displayShareBar_ = false;

    /** @private {?boolean} */
    this.displayComments_ = false;

    /** @private {?boolean} */
    this.iframeLoaded_ = false;

    /** @private {?boolean} */
    this.inViewport_ = false;

    /** @private {Array<Function>} */
    this.unlisteners_ = [];

    /** @private {string}  */
    this.iframeSrcUrl_ = '';

    /** @private {?UnlistenDef} */
    this.unobserveIntersections_ = null;
  }
  /**
   * @override
   */
  preconnectCallback() {
    Services.preconnectFor(this.win).url(this.getAmpDoc(), this.iframeSrcUrl_);
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  buildCallback() {
    const e = this.element;
    const src = e.getAttribute('src');
    const itemId = e.getAttribute('data-item');

    userAssert(
      src || itemId,
      'Either src or data-item attribute is required for <amp-playbuzz> %s',
      this.element
    );

    if (src) {
      assertAbsoluteHttpOrHttpsUrl(src);
    }

    const parsedHeight = parseInt(e.getAttribute('height'), 10);

    this.iframeSrcUrl_ = utils.composeItemSrcUrl(src, itemId);
    this.itemHeight_ = isNaN(parsedHeight) ? this.itemHeight_ : parsedHeight;
    this.displayItemInfo_ = e.getAttribute('data-item-info') === 'true';
    this.displayShareBar_ = e.getAttribute('data-share-buttons') === 'true';
    this.displayComments_ = e.getAttribute('data-comments') === 'true';
  }

  /** @override */
  isLayoutSupported(layout) {
    return (
      layout === Layout_Enum.RESPONSIVE || layout === Layout_Enum.FIXED_HEIGHT
    );
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('div');
    if (this.element.hasAttribute('aria-label')) {
      placeholder.setAttribute(
        'aria-label',
        'Loading - ' + this.element.getAttribute('aria-label')
      );
    } else {
      placeholder.setAttribute('aria-label', 'Loading interactive element');
    }
    placeholder.setAttribute('placeholder', '');
    placeholder.appendChild(this.createPlaybuzzLoader_());
    return placeholder;
  }

  /** @param {!JsonObject} eventData */
  notifyIframe_(eventData) {
    const data = JSON.stringify(eventData);
    this.iframe_.contentWindow./*OK*/ postMessage(data, '*');
  }
  /**
   *
   * Returns the overflow element
   * @return {!Element} overflowElement
   *
   */
  getOverflowElement_() {
    const createElement = utils.getElementCreator(this.element.ownerDocument);

    const overflow = createElement('div', 'pb-overflow');
    overflow.setAttribute('overflow', '');

    const overflowButton = createElement('button');
    overflowButton.textContent = 'Show More';

    const arrow = createElement('img', 'pb-arrow-down');
    arrow.src = showMoreArrow;

    overflowButton.appendChild(arrow);
    overflow.appendChild(overflowButton);

    return overflow;
  }

  /** @override */
  layoutCallback() {
    this.unobserveIntersections_ = observeIntersections(
      this.element,
      ({isIntersecting}) => (this.inViewport_ = isIntersecting)
    );
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = this.generateEmbedSourceUrl_();

    this.listenToPlaybuzzItemMessage_(
      'resize_height',
      utils.debounce(this.itemHeightChanged_.bind(this), 100)
    );

    this.element.appendChild(this.getOverflowElement_());

    applyFillContent(iframe);
    this.element.appendChild(iframe);

    return (this.iframePromise_ = this.loadPromise(iframe).then(() => {
      this.iframeLoaded_ = true;
      this.attemptChangeHeight(dev().assertNumber(this.itemHeight_)).catch(
        () => {
          /* die */
        }
      );

      const unlisten = this.getViewport().onChanged(
        this.sendScrollDataToItem_.bind(this)
      );
      this.unlisteners_.push(unlisten);
    }));
  }

  /** @return {!Element} @private */
  createPlaybuzzLoader_() {
    const doc = this.element.ownerDocument;
    const createElement = utils.getElementCreator(doc);

    const loaderImage = createElement('img', 'pb_feed_anim_mask');
    loaderImage.src = logo;

    const loadingPlaceholder = createElement(
      'div',
      'pb_feed_placeholder_container',
      createElement(
        'div',
        'pb_feed_placeholder_inner',
        createElement(
          'div',
          'pb_feed_placeholder_content',
          createElement('div', 'pb_feed_placeholder_preloader', loaderImage)
        )
      )
    );

    return loadingPlaceholder;
  }

  /**
   * @param {number} height
   */
  itemHeightChanged_(height) {
    if (isNaN(height) || height === this.itemHeight_) {
      return;
    }

    this.itemHeight_ = height; //Save new height

    if (this.iframeLoaded_) {
      this.attemptChangeHeight(this.itemHeight_).catch(() => {
        /* die */
      });
    }
  }

  /**
   * @param {string} messageName
   * @param {Function} handler
   */
  listenToPlaybuzzItemMessage_(messageName, handler) {
    const unlisten = events.listen(this.win, 'message', (event) =>
      utils.handleMessageByName(this.iframe_, event, messageName, handler)
    );
    this.unlisteners_.push(unlisten);
  }

  /**
   *
   * Returns the composed embed source url
   * @return {string} url
   *
   */
  generateEmbedSourceUrl_() {
    const {canonicalUrl} = Services.documentInfoForDoc(this.element);
    const parsedPageUrl = parseUrlDeprecated(canonicalUrl);
    const params = {
      itemUrl: this.iframeSrcUrl_,
      relativeUrl: parseUrlDeprecated(this.iframeSrcUrl_).pathname,
      displayItemInfo: this.displayItemInfo_,
      displayShareBar: this.displayShareBar_,
      displayComments: this.displayComments_,
      parentUrl: removeFragment(parsedPageUrl.href),
      parentHost: parsedPageUrl.host,
    };

    const embedUrl = utils.composeEmbedUrl(params);
    return embedUrl;
  }

  /**
   * Relays scroll data to iframe.
   *
   * @param {{height: number, left: number, relayoutAll: boolean, top: number, velocity: number, width: number }} changeEvent
   */
  sendScrollDataToItem_(changeEvent) {
    if (!this.inViewport_) {
      return;
    }

    const scrollingData = {
      'event': 'scroll',
      'windowHeight': changeEvent.height,
      'scroll': changeEvent.top,
      'offsetTop': this.getLayoutBox().top,
    };

    this.notifyIframe_(scrollingData);
  }

  //User might have made some progress or had the results when going inactive
  //TODO: build a message telling the iframe to pause
  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    this.unobserveIntersections_?.();
    this.unobserveIntersections_ = null;
    this.unlisteners_.forEach((unlisten) => unlisten());
    this.unlisteners_.length = 0;

    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
      this.iframePromise_ = null;
    }
    return true; // Call layoutCallback again.
  }
}

AMP.extension('amp-playbuzz', '0.1', (AMP) => {
  AMP.registerElement('amp-playbuzz', AmpPlaybuzz, CSS);
});
