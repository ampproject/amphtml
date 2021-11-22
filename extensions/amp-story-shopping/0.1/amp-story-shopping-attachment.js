import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

export class AmpStoryShoppingAttachment extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @return {!Element} */
    this.attachmentEl_ = null;
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
   * @return {Promise}
   */
  open(shouldAnimate = true) {
    return this.attachmentEl_
      .getImpl()
      .then((impl) => impl.open(shouldAnimate));
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}
