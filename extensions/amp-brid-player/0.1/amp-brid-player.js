import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {Deferred} from '#core/data-structures/promise';
import {
  dispatchCustomEvent,
  getChildJsonConfig,
  removeElement,
} from '#core/dom';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '#core/dom/fullscreen';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {htmlFor} from '#core/dom/static-template';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {dev, userAssert} from '#utils/log';

import {
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../src/consent';
import {
  createFrameFor,
  mutedOrUnmutedEvent,
  originMatches,
  redispatch,
} from '../../../src/iframe-video';
import {assertAbsoluteHttpOrHttpsUrl} from '../../../src/url';
import {VideoEvents_Enum} from '../../../src/video-interface';

const TAG = 'amp-brid-player';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpBridPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.partnerID_ = '';

    /** @private {string} */
    this.feedID_ = '';

    /** @private {string} */
    this.playerID_ = '';

    /** @private {?number}  */
    this.currentTime_ = 0;

    /** @private {?number}  */
    this.duration_ = 0;

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?string} */
    this.videoIframeSrc_ = null;

    /** @private {?number} */
    this.volume_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

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
      'https://services.brid.tv',
      opt_onLayout
    );
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://cdn.brid.tv',
      opt_onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Gets the source of video
   *
   * @return {string}
   */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    let feedType = '';
    const itemsNum = this.element.hasAttribute('data-dynamic') ? '10' : '1';

    if (this.element.hasAttribute('data-video')) {
      feedType = 'video';
    } else if (this.element.hasAttribute('data-dynamic')) {
      feedType = this.element.getAttribute('data-dynamic');
    } else if (this.element.hasAttribute('data-playlist')) {
      feedType = 'playlist';
    } else if (this.element.hasAttribute('data-carousel')) {
      feedType = 'carousel';
    } else if (this.element.hasAttribute('data-outstream')) {
      feedType = 'outstream';
    }

    // Create iframe
    let src =
      'https://services.brid.tv/services/iframe/' +
      encodeURIComponent(feedType) +
      '/' +
      encodeURIComponent(this.feedID_) +
      '/' +
      encodeURIComponent(this.partnerID_) +
      '/' +
      encodeURIComponent(this.playerID_) +
      '/0/' +
      itemsNum +
      '/?amp=1';

    // Append child JSON config if supplied
    try {
      const customConfig = getChildJsonConfig(this.element);
      src += '&cust_config=' + JSON.stringify(customConfig);
    } catch (e) {}

    this.videoIframeSrc_ = assertAbsoluteHttpOrHttpsUrl(src);

    return this.videoIframeSrc_;
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    this.partnerID_ = userAssert(
      element.getAttribute('data-partner'),
      'The data-partner attribute is required for <amp-brid-player> %s',
      element
    );

    this.playerID_ = userAssert(
      element.getAttribute('data-player'),
      'The data-player attribute is required for <amp-brid-player> %s',
      element
    );

    this.feedID_ = userAssert(
      element.getAttribute('data-video') ||
        element.getAttribute('data-playlist') ||
        element.getAttribute('data-carousel') ||
        element.getAttribute('data-outstream'),
      'Either the data-video, data-playlist, data-carousel or data-outstream ' +
        'attributes must be specified for <amp-brid-player> %s',
      element
    );

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(element);
    Services.videoManagerForDoc(element).register(this);
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getVideoIframeSrc_());

    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleBridMessage_.bind(this)
    );

    return this.loadPromise(iframe).then(() => this.playerReadyPromise_);
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

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    this.pauseHelper_.updatePlaying(false);

    return true; // Call layoutCallback again.
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /** @override */
  createPlaceholderCallback() {
    const {element} = this;

    if (
      !element.hasAttribute('data-video') &&
      !element.hasAttribute('data-playlist')
    ) {
      return;
    }

    const {feedID_: feedID, partnerID_: partnerID} = this;

    const html = htmlFor(element);
    const placeholder = html`
      <img placeholder referrerpolicy="origin" loading="lazy" />
    `;

    propagateAttributes(['aria-label'], this.element, placeholder);
    applyFillContent(placeholder);

    const altText = placeholder.hasAttribute('aria-label')
      ? 'Loading video - ' + placeholder.getAttribute('aria-label')
      : 'Loading video';

    placeholder.setAttribute('alt', altText);

    placeholder.setAttribute(
      'src',
      `https://cdn.brid.tv/live/partners/${encodeURIComponent(partnerID)}` +
        `/snapshot/${encodeURIComponent(feedID)}.jpg`
    );

    this.loadPromise(placeholder).catch(() => {
      placeholder.src = 'https://cdn.brid.tv/live/default/defaultSnapshot.png';
    });

    return placeholder;
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {*=} opt_arg
   * @private
   * */
  sendCommand_(command, opt_arg) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        const args = opt_arg === undefined ? '' : '|' + opt_arg;
        const message = 'Brid|' + command + args;
        this.iframe_.contentWindow./*OK*/ postMessage(message, '*');
      }
    });
  }

  /**
   * Requests consent data from consent module
   * and forwards information to player
   * @private
   */
  getConsentData_() {
    const consentPolicy = this.getConsentPolicy() || 'default';
    const consentStatePromise = getConsentPolicyState(
      this.element,
      consentPolicy
    );
    const consentStringPromise = getConsentPolicyInfo(
      this.element,
      consentPolicy
    );

    return Promise.all([consentStatePromise, consentStringPromise]).then(
      (consents) => {
        let consentData;
        switch (consents[0]) {
          case CONSENT_POLICY_STATE.SUFFICIENT:
            consentData = {
              'gdprApplies': true,
              'userConsent': 1,
              'gdprString': consents[1],
            };
            break;
          case CONSENT_POLICY_STATE.INSUFFICIENT:
          case CONSENT_POLICY_STATE.UNKNOWN:
            consentData = {
              'gdprApplies': true,
              'userConsent': 0,
              'gdprString': consents[1],
            };
            break;
          case CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED:
          default:
            consentData = {
              'gdprApplies': false,
            };
        }
        this.sendCommand_('setAMPGDPR', JSON.stringify(consentData));
      }
    );
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleBridMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://services.brid.tv')) {
      return;
    }

    const eventData = /** @type {?string|undefined} */ (getData(event));
    if (typeof eventData !== 'string' || eventData.indexOf('Brid') !== 0) {
      return;
    }

    const {element} = this;
    const params = eventData.split('|');

    if (params[2] == 'trigger') {
      switch (params[3]) {
        case 'ready':
          this.playerReadyResolver_(this.iframe_);
          break;
        case 'requestAMPGDPR':
          this.getConsentData_();
          break;
        case 'play':
          this.pauseHelper_.updatePlaying(true);
          break;
        case 'pause':
        case 'ended':
          this.pauseHelper_.updatePlaying(false);
          break;
      }
      redispatch(element, params[3], {
        'ready': VideoEvents_Enum.LOAD,
        'play': VideoEvents_Enum.PLAYING,
        'pause': VideoEvents_Enum.PAUSE,
        'ended': VideoEvents_Enum.ENDED,
        'adStart': VideoEvents_Enum.AD_START,
        'adEnd': VideoEvents_Enum.AD_END,
        'loadedmetadata': VideoEvents_Enum.LOADEDMETADATA,
      });
    }

    if (params[2] == 'volume') {
      this.volume_ = parseFloat(params[3]);
      dispatchCustomEvent(element, mutedOrUnmutedEvent(this.volume_ <= 0));
    }

    if (params[2] == 'currentTime') {
      this.currentTime_ = parseFloat(params[3]);
    }

    if (params[2] == 'duration') {
      this.duration_ = parseFloat(params[3]);
    }
  }

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  play(isAutoplay) {
    this.sendCommand_('play', isAutoplay ? 'auto' : '');
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */
  mute() {
    this.sendCommand_('muted', 1);
    this.sendCommand_('volume', 0);
  }

  /** @override */
  unmute() {
    this.sendCommand_('muted', 0);
    this.sendCommand_('volume', 1);
  }

  /** @override */
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
  }

  /**
   * @override
   */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    fullscreenEnter(dev().assertElement(this.iframe_));
  }

  /**
   * @override
   */
  fullscreenExit() {
    if (!this.iframe_) {
      return;
    }
    fullscreenExit(dev().assertElement(this.iframe_));
  }

  /** @override */
  isFullscreen() {
    if (!this.iframe_) {
      return false;
    }
    return isFullscreenElement(dev().assertElement(this.iframe_));
  }

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  getCurrentTime() {
    return /** @type {number} */ (this.currentTime_);
  }

  /** @override */
  getDuration() {
    return /** @type {number} */ (this.duration_);
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpBridPlayer);
});
