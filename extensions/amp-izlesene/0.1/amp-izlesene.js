import {getDataParamsFromAttributes} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';

import {devAssert, userAssert} from '#utils/log';

import {addParamsToUrl} from '../../../src/url';
import {setIsMediaComponent} from '../../../src/video-interface';

class AmpIzlesene extends AMP.BaseElement {
  /**
   *Creates an instance of AmpIzlesene.
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);
    /** @private {?string}  */
    this.videoid_ = null;
    /** @private {?Element} */
    this.iframe_ = null;
    /** @private {?string} */
    this.videoIframeSrc_ = null;

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
      this.getVideoIframeSrc_()
    );
    // Host that Izlesene uses to serve poster frames needed by player.
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://i1.imgiz.com',
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

    this.videoid_ = userAssert(
      this.element.getAttribute('data-videoid'),
      'The data-videoid attribute is required for <amp-izlesene> %s',
      this.element
    );
  }

  /** @return {string} */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    devAssert(this.videoid_);
    let src =
      'https://www.izlesene.com/embedplayer/' +
      encodeURIComponent(this.videoid_ || '') +
      '/?';

    const params = getDataParamsFromAttributes(this.element);
    if ('autoplay' in params) {
      // Autoplay is managed by video manager, do not pass it.
      delete params['autoplay'];
    }

    src = addParamsToUrl(src, params);
    return (this.videoIframeSrc_ = src);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    const src = this.getVideoIframeSrc_();

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;

    this.pauseHelper_.updatePlaying(true);

    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      this.element.removeChild(this.iframe_);
      this.iframe_ = null;
    }
    this.pauseHelper_.updatePlaying(false);
    return true;
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage(
        {
          'command': 'pause',
        },
        '*'
      );
    }
  }
}

AMP.extension('amp-izlesene', '0.1', (AMP) => {
  AMP.registerElement('amp-izlesene', AmpIzlesene);
});
