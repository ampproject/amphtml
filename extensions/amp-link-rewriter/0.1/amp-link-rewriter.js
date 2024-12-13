import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';
import {Priority_Enum} from '#service/navigation';

import {LinkRewriter} from './link-rewriter';

export class AmpLinkRewriter extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?./link-rewriter.LinkRewriter} */
    this.rewriter_ = null;

    /** @private {string} */
    this.referrer_ = '';
  }

  /** @override */
  buildCallback() {
    const viewer = Services.viewerForDoc(this.getAmpDoc());

    /**
     * We had to get referrerUrl here because when we use expandUrlSync()
     * inside LinkRewriter it doesn't retrieve the referrerUrl
     */
    return this.getAmpDoc()
      .whenReady()
      .then(() => viewer.getReferrerUrl())
      .then((referrer) => (this.referrer_ = referrer))
      .then(this.letsRockIt_.bind(this));
  }

  /**
   * @private
   */
  letsRockIt_() {
    this.rewriter_ = new LinkRewriter(
      this.referrer_,
      this.element,
      this.getAmpDoc()
    );

    this.attachClickEvent_();
  }

  /**
   * @private
   * @return {*} TODO(#23582): Specify return type
   */
  attachClickEvent_() {
    const nav = Services.navigationForDoc(this.getAmpDoc());
    nav.registerAnchorMutator((anchor) => {
      this.rewriter_.handleClick(anchor);
    }, Priority_Enum.LINK_REWRITER_MANAGER);

    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.NODISPLAY;
  }
}

AMP.extension('amp-link-rewriter', '0.1', (AMP) => {
  AMP.registerElement('amp-link-rewriter', AmpLinkRewriter);
});
