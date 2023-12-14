import {getDataParamsFromAttributes} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {addParamsToUrl} from '../../../src/url';
import {setIsMediaComponent} from '../../../src/video-interface';

class AmpKaltura extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {string} */
    this.serviceUrl_ = '';

    /** @private {string} */
    this.partnerId_ = '';

    /** @private {string} */
    this.entryId_ = '';

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
      `https://${encodeURIComponent(this.serviceUrl_)}${opt_onLayout}`
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.partnerId_ = userAssert(
      this.element.getAttribute('data-partner'),
      'The data-partner attribute is required for <amp-kaltura-player> %s',
      this.element
    );

    setIsMediaComponent(this.element);

    this.entryId_ = this.element.getAttribute('data-entryid') || 'default';

    this.serviceUrl_ =
      this.element.getAttribute('data-service-url') || 'cdnapisec.kaltura.com';
  }

  /** @override */
  layoutCallback() {
    const uiconfId =
      this.element.getAttribute('data-uiconf') ||
      this.element.getAttribute('data-uiconf-id') ||
      'default';
    const iframe = this.element.ownerDocument.createElement('iframe');
    let src = `https://${encodeURIComponent(
      this.serviceUrl_
    )}/p/${encodeURIComponent(this.partnerId_)}/sp/${encodeURIComponent(
      this.partnerId_
    )}00/embedIframeJs/uiconf_id/${encodeURIComponent(
      uiconfId
    )}/partner_id/${encodeURIComponent(
      this.partnerId_
    )}?iframeembed=true&playerId=kaltura_player_amp&entry_id=${encodeURIComponent(
      this.entryId_
    )}`;
    const params = getDataParamsFromAttributes(
      this.element,
      (key) => `flashvars[${key}]`
    );
    src = addParamsToUrl(src, params);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

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
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('img');
    propagateAttributes(['aria-label'], this.element, placeholder);
    applyFillContent(placeholder);
    placeholder.setAttribute('loading', 'lazy');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    if (placeholder.hasAttribute('aria-label')) {
      placeholder.setAttribute(
        'alt',
        'Loading video - ' + placeholder.getAttribute('aria-label')
      );
    } else {
      placeholder.setAttribute('alt', 'Loading video');
    }
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    let src = `https://${encodeURIComponent(
      this.serviceUrl_
    )}/p/${encodeURIComponent(
      this.partnerId_
    )}/thumbnail/entry_id/${encodeURIComponent(this.entryId_)}`;
    if (width) {
      src += `/width/${width}`;
    }
    if (height) {
      src += `/height/${height}`;
    }
    placeholder.setAttribute('src', src);
    return placeholder;
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify({
          'method': 'pause',
          'value': '',
        }),
        '*'
      );
    }
  }
}

AMP.extension('amp-kaltura-player', '0.1', (AMP) => {
  AMP.registerElement('amp-kaltura-player', AmpKaltura);
});
