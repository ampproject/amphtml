import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';

import {setIsMediaComponent} from '../../../src/video-interface';

class AmpReachPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://player-cdn.beachfrontmedia.com',
      opt_onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    setIsMediaComponent(this.element);
  }

  /** @override */
  layoutCallback() {
    const embedId = this.element.getAttribute('data-embed-id') || 'default';
    const iframe = this.element.ownerDocument.createElement('iframe');

    iframe.setAttribute('frameborder', 'no');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src =
      'https://player-cdn.beachfrontmedia.com/playerapi/v1/frame/player/?embed_id=' +
      encodeURIComponent(embedId);
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
      this.iframe_.contentWindow./*OK*/ postMessage(
        'pause',
        'https://player-cdn.beachfrontmedia.com'
      );
    }
  }
}

AMP.extension('amp-reach-player', '0.1', (AMP) => {
  AMP.registerElement('amp-reach-player', AmpReachPlayer);
});
