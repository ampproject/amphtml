import * as Preact from '#core/dom/jsx';
import {Layout, applyFillContent} from '#core/dom/layout';

const TAG = 'amp-story-shopping-config';

export class AmpStoryShoppingConfig extends AMP.BaseElement {
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
    this.container_ = <div>{this.myText_}</div>;
    applyFillContent(this.container_, /* replacedContent */ true);
    this.element.appendChild(this.container_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }
}
