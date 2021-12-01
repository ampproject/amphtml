import {CSS} from '../../../build/amp-access-fewcents-0.1.css';
import {Layout_Enum, applyFillContent} from '#core/dom/layout';

const TAG = 'amp-access-fewcents';

export class AmpAccessFewcents extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    // DO NOT SUBMIT: This is example code only.
    super(element);

    /** @private {string} */
    this.myText_ = 'hello world';

    /** @private {?Element} */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.textContent = this.myText_;
    this.element.appendChild(this.container_);
    applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.RESPONSIVE;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAccessFewcents, CSS);
});
