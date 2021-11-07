/**
 * @fileoverview Embeds a imgur
 * Example:
 * <code>
 * <amp-imgur
 *   layout="reponsive"
 *   width="540"
 *   height="663"
 *   data-imgur-id="f462IUj">
 * </amp-imgur>
 * </code>
 */

import {Deferred} from '#core/data-structures/promise';
import {createElementWithAttributes, removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {isObject} from '#core/types';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {getData, listen} from '#utils/event-helper';
import {user, userAssert} from '#utils/log';

const TAG = 'amp-imgur';

export class AmpImgur extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Function} */
    this.resolveReceivedMessage_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.dataset.imgurId,
      'The data-imgur-id attribute is required for <amp-imgur> %s',
      this.element
    );
  }

  /** @override */
  layoutCallback() {
    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleImgurMessages_.bind(this)
    );

    const sanitizedId = this.element.dataset.imgurId.replace(
      /^(a\/)?(.*)/,
      (unusedMatch, aSlash, rest) => (aSlash || '') + encodeURIComponent(rest)
    );

    return this.insertLoadIframe_(sanitizedId)
      .catch((e) => {
        // Unfortunately, from May 2020 to May 2021 we incorrectly interpreted
        // any post id as an album id.
        // To maintain compatibility with this period, we retry with by adding
        // the a/ prefix when failing to load.
        // https://go.amp.dev/issue/28049
        if (sanitizedId.startsWith('a/')) {
          throw e;
        }
        const idWithPrefix = `a/${sanitizedId}`;
        return this.insertLoadIframe_(idWithPrefix).then(() => {
          user().warn(
            TAG,
            `id should be prefixed with "a/", loaded album using data-imgur-id="${idWithPrefix}". This element should be updated to use "a/".`
          );
        });
      })
      .catch(() => {
        user().error(TAG, `Failed to load. Is "${sanitizedId}" a correct id?`);
      });
  }

  /**
   * @param {string} id
   * @return {!Promise<HTMLIFrameElement>}
   * @private
   */
  insertLoadIframe_(id) {
    const {element} = this;

    const iframe = createElementWithAttributes(
      element.ownerDocument,
      'iframe',
      {
        'scrolling': 'no',
        'frameborder': '0',
        'allowfullscreen': 'true',
        'title': element.title || 'imgur post',
      }
    );

    iframe.src = `https://imgur.com/${id}/embed?pub=true`;

    if (this.iframe_) {
      // reloading
      element.removeChild(this.iframe_);
    }
    this.iframe_ = iframe;
    element.appendChild(iframe);

    applyFillContent(iframe);

    // We're sure we've loaded when we receive the first message.
    const {promise, resolve} = new Deferred();
    this.resolveReceivedMessage_ = resolve;

    return this.loadPromise(this.iframe_).then(() =>
      Services.timerFor(this.win).timeoutPromise(500, promise)
    );
  }

  /**
   * @param {!Event} event
   * @private
   * */
  handleImgurMessages_(event) {
    if (
      event.origin != 'https://imgur.com' ||
      event.source != this.iframe_.contentWindow
    ) {
      return;
    }
    const eventData = getData(event);
    if (
      !eventData ||
      !(
        isObject(eventData) || /** @type {string} */ (eventData).startsWith('{')
      )
    ) {
      return;
    }

    this?.resolveReceivedMessage_();

    const data = isObject(eventData) ? eventData : tryParseJson(eventData);
    if (data['message'] == 'resize_imgur') {
      const height = data['height'];
      this.attemptChangeHeight(height).catch(() => {});
    }
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

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpImgur);
});
