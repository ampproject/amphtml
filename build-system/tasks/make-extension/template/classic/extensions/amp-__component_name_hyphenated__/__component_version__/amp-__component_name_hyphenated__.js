__css_import__;
import {Layout_Enum, applyFillContent} from '#core/dom/layout';

const TAG = 'amp-__component_name_hyphenated__';

export class Amp__component_name_pascalcase__ extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    // __do_not_submit__: This is example code only.
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

AMP.extension(TAG, '__component_version__', AMP => {
  AMP.registerElement(__register_element_args__);
});
