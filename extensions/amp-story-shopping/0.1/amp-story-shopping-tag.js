import {Layout, applyFillContent} from '#core/dom/layout';

const TAG = 'amp-story-shopping-tag';

export class AmpStoryShoppingTag extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.myText_ = TAG;

    /** @private {?Element} */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.textContent = this.myText_;
    this.element.appendChild(this.container_);
    applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }
}
