import {Layout, applyFillContent} from '#core/dom/layout';

import {CSS} from '../../../build/amp-story-shopping-tag-0.1.css';

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
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.setAttribute('layout', Layout.NODISPLAY);
    this.container_.textContent = this.myText_;
    this.element.appendChild(this.container_);
    applyFillContent(this.container_, /* replacedContent */ true);
    return super.buildCallback(CSS);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }
}
