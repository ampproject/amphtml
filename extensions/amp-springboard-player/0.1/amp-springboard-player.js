import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {setIsMediaComponent} from '../../../src/video-interface';

class AmpSpringboardPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.mode_ = '';

    /** @private {string} */
    this.contentId_ = '';

    /** @private {string} */
    this.domain_ = '';

    /** @private {string} */
    this.siteId_ = '';

    /** @private {string} */
    this.playerId_ = '';

    /** @private {?HTMLIFrameElement} */
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
      'https://cms.springboardplatform.com',
      opt_onLayout
    );
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://www.springboardplatform.com',
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

    this.mode_ = userAssert(
      this.element.getAttribute('data-mode'),
      'The data-mode attribute is required for <amp-springboard-player> %s',
      this.element
    );
    this.contentId_ = userAssert(
      this.element.getAttribute('data-content-id'),
      'The data-content-id attribute is required for' +
        '<amp-springboard-player> %s',
      this.element
    );
    this.domain_ = userAssert(
      this.element.getAttribute('data-domain'),
      'The data-domain attribute is required for <amp-springboard-player> %s',
      this.element
    );
    this.siteId_ = userAssert(
      this.element.getAttribute('data-site-id'),
      'The data-site-id attribute is required for' +
        '<amp-springboard-player> %s',
      this.element
    );
    this.playerId_ = userAssert(
      this.element.getAttribute('data-player-id'),
      'The data-player-id attribute is required for' +
        '<amp-springboard-player> %s',
      this.element
    );
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    const items = this.element.getAttribute('data-items') || '10';

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.id = this.playerId_ + '_' + this.contentId_;
    iframe.src =
      'https://cms.springboardplatform.com/embed_iframe/' +
      encodeURIComponent(this.siteId_) +
      '/' +
      encodeURIComponent(this.mode_) +
      '/' +
      encodeURIComponent(this.contentId_) +
      '/' +
      encodeURIComponent(this.playerId_) +
      '/' +
      encodeURIComponent(this.domain_) +
      '/' +
      encodeURIComponent(items);
    applyFillContent(iframe);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);
    this.element.appendChild(iframe);

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
      this.iframe_.contentWindow./*OK*/ postMessage('ampPause', '*');
    }
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('img');
    propagateAttributes(['aria-label'], this.element, placeholder);
    applyFillContent(placeholder);
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
    placeholder.setAttribute(
      'src',
      'https://www.springboardplatform.com/storage/' +
        (this.mode_ == 'playlist'
          ? 'default/snapshots/default_snapshot.png'
          : `${encodeURIComponent(this.domain_)}/snapshots/${encodeURIComponent(
              this.contentId_
            )}.jpg`)
    );
    return placeholder;
  }
}

AMP.extension('amp-springboard-player', '0.1', (AMP) => {
  AMP.registerElement('amp-springboard-player', AmpSpringboardPlayer);
});
