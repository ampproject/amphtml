import {Layout, applyFillContent} from '#core/dom/layout';

import {CSS} from '../../../build/amp-story-shopping-attachment-0.1.css';

const TAG = 'amp-story-shopping-attachment';

export class AmpStoryShoppingAttachment extends AMP.BaseElement {
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
    this.container_.textContent = this.myText_;
    this.element.appendChild(this.container_);
    applyFillContent(this.container_, /* replacedContent */ true);
    return super.buildCallback(CSS);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }
}
