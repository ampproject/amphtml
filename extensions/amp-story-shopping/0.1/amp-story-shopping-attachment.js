import * as Preact from '#core/dom/jsx';
import {Layout} from '#core/dom/layout';
import {CommonSignals} from '#core/constants/common-signals';

export class AmpStoryShoppingAttachment extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    this.attachmentEl = null;
    this.attachmentImpl = null;
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.templateWrapper = <div>test</div>;
    this.attachmentEl = (
      <amp-story-page-attachment layout="nodisplay">
        {this.templateWrapper}
      </amp-story-page-attachment>
    );
    this.element.appendChild(this.attachmentEl);
  }

  /** @override */
  layoutCallback() {
    // Get reference to impl.
    return this.attachmentEl
      .signals()
      .whenSignal(CommonSignals.LOAD_END)
      .then(() => this.attachmentEl.getImpl())
      .then((attachmentImpl) => (this.attachmentImpl = attachmentImpl));
  }

  open() {
    this.setTemplate_();
    this.attachmentImpl.open();
  }

  // Set template when opening
  setTemplate_() {
    this.templateWrapper.innerHTML = 'PLP template';
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FILL;
  }
}
