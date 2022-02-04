import {removeElement} from '#core/dom';
import {Layout_Enum, applyFillContent} from '#core/dom/layout';
import {isEnumValue} from '#core/types';

import {Services} from '#service';

import {getData, listen} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {addParamsToUrl, appendEncodedParamStringToUrl} from '../../../src/url';

/**
 * @enum {string}
 */
const EmbedType = {
  POST: 'post',
  POLL: 'poll',
};

export class AmpVk extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?number} */
    this.widgetHeight_ = 0;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?string} */
    this.embedType_ = null;

    /** @private {?string} */
    this.ownerId_ = null;

    /** @private {?string} */
    this.postId_ = null;

    /** @private {?string} */
    this.hash_ = null;

    /** @private {?string} */
    this.apiId_ = null;

    /** @private {?string} */
    this.pollId_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://vk.com',
      opt_onLayout
    );
  }

  /**
   * @return {Promise}
   * @private
   */
  getIFrameSrc_() {
    // cachebusting query parameter
    const createdTime = Date.now().toString(16);
    let iframeSrcPromise;

    if (this.embedType_ === EmbedType.POST) {
      iframeSrcPromise = this.getVkPostIFrameSrc_();
    } else if (this.embedType_ === EmbedType.POLL) {
      iframeSrcPromise = this.getVkPollIFrameSrc_();
    }

    return iframeSrcPromise.then((iframeSrc) => {
      return appendEncodedParamStringToUrl(iframeSrc, createdTime);
    });
  }

  /**
   * @return {Promise}
   * @private
   */
  getVkPostIFrameSrc_() {
    return Services.viewerForDoc(this.element)
      .getReferrerUrl()
      .then((ref) => {
        const startWidth = this.element./*OK*/ offsetWidth;
        const pageUrl = this.getAmpDoc().getUrl();
        const iframeUrl = 'https://vk.com/widget_post.php';
        const queryParams = {
          'app': '0',
          'width': '100%',
          '_ver': '1',
          'owner_id': this.ownerId_,
          'post_id': this.postId_,
          'hash': this.hash_,
          'amp': '1',
          'startWidth': startWidth,
          'url': pageUrl,
          'referrer': ref,
          'title': 'AMP Post',
        };

        return addParamsToUrl(iframeUrl, queryParams);
      });
  }

  /**
   * @return {Promise}
   * @private
   */
  getVkPollIFrameSrc_() {
    return Services.viewerForDoc(this.element)
      .getReferrerUrl()
      .then((ref) => {
        const pageUrl = this.getAmpDoc().getUrl();
        const iframeUrl = 'https://vk.com/al_widget_poll.php';
        const queryParams = {
          'app': this.apiId_,
          'width': '100%',
          '_ver': '1',
          'poll_id': this.pollId_,
          'amp': '1',
          'url': pageUrl,
          'title': 'AMP Poll',
          'description': '',
          'referrer': ref,
        };

        return addParamsToUrl(iframeUrl, queryParams);
      });
  }

  /** @override */
  buildCallback() {
    this.embedType_ = userAssert(
      this.element.getAttribute('data-embedtype'),
      'The data-embedtype attribute is required for <amp-vk> %s',
      this.element
    );

    userAssert(
      isEnumValue(EmbedType, this.embedType_),
      `Unknown data-embedtype: ${this.embedType_}`
    );

    if (this.embedType_ === EmbedType.POST) {
      this.postBuildCallback_();
    } else if (this.embedType_ === EmbedType.POLL) {
      this.pollBuildCallback_();
    }
  }

  /** @private */
  postBuildCallback_() {
    this.ownerId_ = userAssert(
      this.element.getAttribute('data-owner-id'),
      'The data-owner-id attribute is required for <amp-vk> Post %s',
      this.element
    );

    this.postId_ = userAssert(
      this.element.getAttribute('data-post-id'),
      'The data-post-id attribute is required for <amp-vk> Post %s',
      this.element
    );

    this.hash_ = userAssert(
      this.element.getAttribute('data-hash'),
      'The data-hash attribute is required for <amp-vk> Post %s',
      this.element
    );
  }

  /** @private */
  pollBuildCallback_() {
    this.apiId_ = userAssert(
      this.element.getAttribute('data-api-id'),
      'The data-api-id attribute is required for <amp-vk> Poll %s',
      this.element
    );

    this.pollId_ = userAssert(
      this.element.getAttribute('data-poll-id'),
      'The data-poll-id attribute is required for <amp-vk> Poll %s',
      this.element
    );
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleVkIframeMessage_.bind(this)
    );

    return this.getIFrameSrc_().then((src) => {
      iframe.src = src;
      iframe.setAttribute('name', 'fXD');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');

      applyFillContent(iframe);
      this.element.appendChild(iframe);

      return this.loadPromise(iframe);
    });
  }

  /**
   * @param {!Event} e
   * @private
   */
  handleVkIframeMessage_(e) {
    if (
      e.origin !== 'https://vk.com' ||
      e.source !== this.iframe_.contentWindow
    ) {
      return;
    }
    const eventData = getData(e);
    if (eventData) {
      const regExp = /\[\"resize",\[(\d+)\]]/;
      const matches = regExp.exec(eventData);
      if (matches && matches[1]) {
        const newHeight = parseInt(matches[1], 10);
        if (this.widgetHeight_ !== newHeight) {
          this.widgetHeight_ = newHeight;
          this.forceChangeHeight(newHeight);
        }
      }
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return (
      layout === Layout_Enum.RESPONSIVE ||
      layout === Layout_Enum.FLEX_ITEM ||
      layout === Layout_Enum.FIXED
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
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }
    return true; // Call layoutCallback again.
  }
}

AMP.extension('amp-vk', '0.1', (AMP) => {
  AMP.registerElement('amp-vk', AmpVk);
});
