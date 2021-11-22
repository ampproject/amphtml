import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

export class AmpStoryShoppingAttachment extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * Caches a reference to the attachmnet's impl.
     * @private @return {extensions/amp-story/1.0/amp-story-page-attachment.js.AmpStoryPageAttachment}
     * */
    this.attachmentImpl_ = null;
  }

  /** @override */
  buildCallback() {
    const attachmentEl = (
      <amp-story-page-attachment layout="nodisplay"></amp-story-page-attachment>
    );
    this.element.appendChild(attachmentEl);
    return customElements
      .whenDefined('amp-story-page-attachment')
      .then(() => attachmentEl.getImpl())
      .then((impl) => (this.attachmentImpl_ = impl));
  }

  /**
   * @param {boolean=} shouldAnimate
   */
  open(shouldAnimate = true) {
    this.attachmentImpl_.open(shouldAnimate);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}
