import {removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {isFiniteNumber, isObject} from '#core/types';

import {getData, listen} from '#utils/event-helper';
import {userAssert} from '#utils/log';

export class AmpRiddleQuiz extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?number} */
    this.itemHeight_ = 400; //default

    /** @private {string} */
    this.riddleId_ = '';

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }

  /**
   * Handles message.
   *
   * @param {!Event} event
   */
  handleMessage_(event) {
    if (
      !this.iframe_ ||
      event.origin != 'https://www.riddle.com' ||
      event.source != this.iframe_.contentWindow
    ) {
      return;
    }

    const data = getData(event);

    if (!isObject(data)) {
      return;
    }

    if (data['riddleId'] != undefined && data['riddleId'] == this.riddleId_) {
      this.riddleHeightChanged_(data['riddleHeight']);
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    this.riddleId_ = userAssert(
      this.element.getAttribute('data-riddle-id'),
      'The data-riddle-id attribute is required for <amp-riddle-quiz> %s',
      this.element
    );
    // listen for resize events coming from riddles
    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleMessage_.bind(this)
    );

    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src =
      'https://www.riddle.com/a/iframe/' + encodeURIComponent(this.riddleId_);

    applyFillContent(iframe);
    this.element.appendChild(iframe);

    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }

    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }

    return true; // Call layoutCallback again.
  }

  /**
   * @param {number} height
   */
  riddleHeightChanged_(height) {
    if (!isFiniteNumber(height) || height === this.itemHeight_) {
      return;
    }

    this.itemHeight_ = height; //Save new height

    this.attemptChangeHeight(this.itemHeight_).catch(() => {
      /* die */
    });
  }
}

AMP.extension('amp-riddle-quiz', '0.1', (AMP) => {
  AMP.registerElement('amp-riddle-quiz', AmpRiddleQuiz, false);
});
