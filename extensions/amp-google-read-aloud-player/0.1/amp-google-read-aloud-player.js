import {getDataParamsFromAttributes, removeElement} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {disableScrollingOnIframe} from '../../../src/iframe-helper';
import {SandboxOptions_Enum, createFrameFor} from '../../../src/iframe-video';
import {addParamsToUrl} from '../../../src/url';

/** @private @const */
const TAG = 'amp-google-read-aloud-player';

/** @private @const */
const DEFAULT_IFRAME_BASE_URL =
  'https://www.gstatic.com/readaloud/player/web/api/iframe/index.html';

/** @private @const */
const BASE_SRC_PARAM_NAME = 'src';

/** @private @const */
const SANDBOX = [
  SandboxOptions_Enum.ALLOW_SCRIPTS,
  SandboxOptions_Enum.ALLOW_SAME_ORIGIN,
  SandboxOptions_Enum.ALLOW_POPUPS,
];

/** @implements {../../../src/video-interface.VideoInterface} */
export class AmpGoogleReadAloudPlayer extends AMP.BaseElement {
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
      this.getIframeBaseSrc_(),
      opt_onLayout
    );
  }

  /** @override */
  buildCallback() {
    // Uses the video manager in order to support auto-pause of media.
    installVideoManagerForDoc(this.element);
  }

  /** @override */
  layoutCallback() {
    const name = JSON.stringify(this.getMetadata_());

    this.iframe_ = disableScrollingOnIframe(
      createFrameFor(this, this.getIframeSrc_(), name, SANDBOX)
    );

    Services.videoManagerForDoc(this.element).register(this);

    return this.loadPromise(this.iframe_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.FIXED || layout == Layout_Enum.FIXED_HEIGHT;
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
  pauseCallback() {
    this.pause();
  }

  /** @override */
  resumeCallback() {
    this.play(false /** unusedIsAutoplay */);
  }

  /** @return {string} */
  getIframeBaseSrc_() {
    const baseSrc = this.element.getAttribute(BASE_SRC_PARAM_NAME);
    return baseSrc ?? DEFAULT_IFRAME_BASE_URL;
  }

  /** @return {string} */
  getIframeSrc_() {
    const src = addParamsToUrl(
      this.getIframeBaseSrc_(),
      getDataParamsFromAttributes(
        this.element,
        /* opt_computeParamNameFunc = */ undefined,
        '^(.+)'
      )
    );

    return `${src}#ampGoogleReadAloudPlayer=1`;
  }

  /**
   * @return {!JsonObject}
   * @private
   */
  getMetadata_() {
    const {canonicalUrl, sourceUrl} = Services.documentInfoForDoc(this.element);
    const rootNode = this.getAmpDoc().getRootNode();

    return {
      'sourceUrl': sourceUrl,
      'canonicalUrl': canonicalUrl,
      'jsonLd': this.getJsonLd_(rootNode),
    };
  }

  /**
   * @param {!Node} root
   * @return {?JsonObject}
   */
  getJsonLd_(root) {
    const scriptTag = root.querySelector('script[type="application/ld+json"]');
    return scriptTag && tryParseJson(scriptTag.textContent);
  }

  /**
   * Posts a message to the iframe.
   * @param {string} action
   * @private
   */
  postMessage_(action) {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify(/** @type {JsonObject} */ ({action})),
        '*'
      );
    }
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  // TODO(mhalabi-google): report media events.

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  play(unusedIsAutoplay) {
    this.postMessage_('play');
  }

  /** @override */
  pause() {
    this.postMessage_('pause');
  }

  /** @override */
  mute() {
    this.postMessage_('mute');
  }

  /** @override */
  unmute() {
    this.postMessage_('unmute');
  }

  /** @override */
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
  }

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    // Read Aloud already updates the Media Session so no need for the video
    // manager to update it too.
    return true;
  }

  /** @override */
  fullscreenEnter() {
    // Not supported.
  }

  /** @override */
  fullscreenExit() {
    // Not supported.
  }

  /** @override */
  isFullscreen() {
    return false;
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpGoogleReadAloudPlayer);
});
