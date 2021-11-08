import {Layout, applyFillContent} from '#core/dom/layout';
import {once} from '#core/types/function';

import {listenOncePromise} from '#utils/event-helper';

const TAG = 'amp-story-shopping-attachment';

const KEY = '__AMP_STORY_PAGE_ATTACHMENT';

export class AmpStoryShoppingAttachment extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.myText_ = TAG;

    /** @private {?Element} */
    this.container_ = null;

    /**
     * @private
     * @return {Promise<extensions/amp-story/1.0/amp-story-page-attachment.AmpStoryPageAttachment>}
     */
    this.getImpl_ = once(() => {
      const wait = self[KEY]
        ? Promise.resolve()
        : listenOncePromise(this.win, 'amp:amp-story-page-attachment-ready');
      return wait.then(() => new self[KEY](this.element));
    });
  }

  /** @override */
  buildCallback() {
    this.getImpl_().then((impl) => {
      impl.buildCallback();
      this.container_ = this.element.ownerDocument.createElement('div');
      this.container_.textContent = this.myText_;
      applyFillContent(this.container_);
      this.element.appendChild(this.container_);
    });
  }

  /** @override */
  layoutCallback() {
    return this.getImpl_().then((impl) => {
      return impl.layoutCallback();
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }
}
