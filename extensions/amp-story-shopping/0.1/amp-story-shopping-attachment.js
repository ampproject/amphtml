import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {once} from '#core/types/function';

export class AmpStoryShoppingAttachment extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @return {extensions/amp-story/1.0/amp-story-page-attachment.js.AmpStoryPageAttachment} */
    this.attachmentEl_ = null;

    /**
     * Caches a reference to the attachmnet's impl.
     * @private @return {extensions/amp-story/1.0/amp-story-page-attachment.js.AmpStoryPageAttachment}
     * */
    this.getAttachmentImpl_ = once(() =>
      customElements
        .whenDefined('amp-story-page-attachment')
        .then(() => this.attachmentEl_.getImpl())
    );
  }

  /** @override */
  buildCallback() {
    this.attachmentEl_ = (
      <amp-story-page-attachment layout="nodisplay"></amp-story-page-attachment>
    );
    this.element.appendChild(this.attachmentEl_);
  }

  /**
   * @param {boolean=} shouldAnimate
   */
  open(shouldAnimate = true) {
    this.getAttachmentImpl_().then((impl) => impl.open(shouldAnimate));
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.FILL;
  }
}
