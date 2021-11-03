/**
 * @fileoverview Embeds a Github gist
 *
 * Example:
 * <code>
 * <amp-gist
 *   layout="fixed-height"
 *   data-gistid="a19e811dcd7df10c4da0931641538497"
 *   height="1613">
 * </amp-gist>
 * </code>
 */

import {removeElement} from '#core/dom';
import {Layout_Enum, applyFillContent} from '#core/dom/layout';

import {Services} from '#service';

import {getIframe} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';

export class AmpGist extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://gist.github.com/',
      opt_onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.FIXED_HEIGHT;
  }

  /** @override */
  layoutCallback() {
    /* the third parameter 'github' ties it to the 3p/github.js */
    const iframe = getIframe(this.win, this.element, 'github');
    iframe.title = this.element.title || 'Github gist';
    applyFillContent(iframe);
    // Triggered by window.context.requestResize() inside the iframe.
    listenFor(
      iframe,
      'embed-size',
      (data) => {
        this.forceChangeHeight(data['height']);
      },
      /* opt_is3P */ true
    );

    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /**
   * @override
   */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }
}

AMP.extension('amp-gist', '0.1', (AMP) => {
  AMP.registerElement('amp-gist', AmpGist);
});
