import {removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {isObject} from '#core/types';
import {tryParseJson} from '#core/types/object/json';
import {dashToUnderline} from '#core/types/string';

import {Services} from '#service';

import {getData, listen} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {createLoaderLogo} from './facebook-loader';

import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';
import {getMode} from '../../../src/mode';

const TYPE = 'facebook';

class AmpFacebook extends AMP.BaseElement {
  /** @override  */
  static createLoaderLogoCallback(element) {
    return createLoaderLogo(element);
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private @const {string} */
    this.dataLocale_ = element.hasAttribute('data-locale')
      ? element.getAttribute('data-locale')
      : dashToUnderline(window.navigator.language);

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {number} */
    this.toggleLoadingCounter_ = 0;
  }

  /** @override */
  renderOutsideViewport() {
    // We are conservative about loading heavy embeds.
    // This will still start loading before they become visible, but it
    // won't typically load a large number of embeds.
    return 0.75;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const preconnect = Services.preconnectFor(this.win);
    preconnect.url(this.getAmpDoc(), 'https://facebook.com', opt_onLayout);
    // Hosts the facebook SDK.
    preconnect.preload(
      this.getAmpDoc(),
      'https://connect.facebook.net/' + this.dataLocale_ + '/sdk.js',
      'script'
    );
    preloadBootstrap(this.win, TYPE, this.getAmpDoc(), preconnect);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const embedAs = this.element.getAttribute('data-embed-as');
    if (embedAs === 'comment') {
      this.user().warn(
        'AMP-FACEBOOK',
        'Embedded Comments have been deprecated: https://developers.facebook.com/docs/plugins/embedded-comments'
      );
      return;
    }
    userAssert(
      !embedAs || ['post', 'video'].indexOf(embedAs) !== -1,
      'Attribute data-embed-as for <amp-facebook> value is wrong, should be' +
        ' "post" or "video" but was: %s',
      embedAs
    );
    const iframe = getIframe(this.win, this.element, TYPE);
    iframe.title = this.element.title || 'Facebook';
    applyFillContent(iframe);
    if (this.element.hasAttribute('data-allowfullscreen')) {
      iframe.setAttribute('allowfullscreen', 'true');
    }
    // Triggered by context.updateDimensions() inside the iframe.
    listenFor(
      iframe,
      'embed-size',
      (data) => {
        this.forceChangeHeight(data['height']);
      },
      /* opt_is3P */ true
    );
    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleFacebookMessages_.bind(this)
    );
    this.toggleLoading(true);
    if (getMode().test) {
      this.toggleLoadingCounter_++;
    }
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleFacebookMessages_(event) {
    if (this.iframe_ && event.source != this.iframe_.contentWindow) {
      return;
    }
    const eventData = getData(event);
    if (!eventData) {
      return;
    }

    const parsedEventData = isObject(eventData)
      ? eventData
      : tryParseJson(eventData);
    if (!parsedEventData) {
      return;
    }
    if (eventData['action'] == 'ready') {
      this.toggleLoading(false);
      if (getMode().test) {
        this.toggleLoadingCounter_++;
      }
    }
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
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }
    return true;
  }
}

AMP.extension('amp-facebook', '0.1', (AMP) => {
  AMP.registerElement('amp-facebook', AmpFacebook);
});
