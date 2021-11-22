import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

export class AmpStoryShoppingAttachment extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @return {!Element} */
    this.attachmentEl = null;
  }

  /** @override */
  buildCallback() {
    this.attachmentEl = (
      <amp-story-page-attachment layout="nodisplay"></amp-story-page-attachment>
    );
    this.element.appendChild(this.attachmentEl);
  }

  /**
   * @param {boolean=} shouldAnimate
   * @return {Promise}
   */
  open(shouldAnimate = true) {
    return this.attachmentEl.getImpl().then((impl) => impl.open(shouldAnimate));
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}
