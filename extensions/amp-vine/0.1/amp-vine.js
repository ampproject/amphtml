import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';

import {userAssert} from '#utils/log';

class AmpVine extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {?Element} */
    this.iframe_ = null;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // the Vine iframe
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://vine.co',
      onLayout
    );
    // Vine assets loaded in the iframe
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://v.cdn.vine.co',
      onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const vineid = userAssert(
      this.element.getAttribute('data-vineid'),
      'The data-vineid attribute is required for <amp-vine> %s',
      this.element
    );

    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.src =
      'https://vine.co/v/' + encodeURIComponent(vineid) + '/embed/simple';

    applyFillContent(iframe);
    this.element.appendChild(iframe);

    this.iframe_ = iframe;

    this.pauseHelper_.updatePlaying(true);

    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    const iframe = this.iframe_;
    if (iframe) {
      this.element.removeChild(iframe);
      this.iframe_ = null;
    }
    this.pauseHelper_.updatePlaying(false);
    return true;
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage('pause', '*');
    }
  }
}

AMP.extension('amp-vine', '0.1', (AMP) => {
  AMP.registerElement('amp-vine', AmpVine);
});
