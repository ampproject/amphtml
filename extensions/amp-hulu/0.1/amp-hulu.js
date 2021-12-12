import {removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';

import {Services} from '#service';

import {devAssert, userAssert} from '#utils/log';

import {setIsMediaComponent} from '../../../src/video-interface';

class AmpHulu extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?string} */
    this.eid_ = null;
  }

  /** @override */
  preconnectCallback() {
    Services.preconnectFor(this.win).preload(
      this.getAmpDoc(),
      this.getVideoIframeSrc_()
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = document.createElement('iframe');
    const src = this.getVideoIframeSrc_();
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;

    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  buildCallback() {
    setIsMediaComponent(this.element);

    this.eid_ = userAssert(
      this.element.getAttribute('data-eid'),
      'The data-eid attribute is required for <amp-hulu> %s',
      this.element
    );
  }

  /** @return {string} */
  getVideoIframeSrc_() {
    devAssert(this.eid_);
    return `https://player.hulu.com/site/dash/mobile_embed.html?amp=1&eid=${encodeURIComponent(
      this.eid_ || ''
    )}`;
  }
}

AMP.extension('amp-hulu', '0.1', (AMP) => {
  AMP.registerElement('amp-hulu', AmpHulu);
});
