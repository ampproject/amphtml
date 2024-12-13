import {Deferred} from '#core/data-structures/promise';
import {
  dispatchCustomEvent,
  getDataParamsFromAttributes,
  removeElement,
} from '#core/dom';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '#core/dom/fullscreen';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {PauseHelper} from '#core/dom/video/pause-helper';
import {once} from '#core/types/function';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {dev, userAssert} from '#utils/log';

import {
  getConsentMetadata,
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../src/consent';
import {disableScrollingOnIframe} from '../../../src/iframe-helper';
import {
  addUnsafeAllowAutoplay,
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {getMode} from '../../../src/mode';
import {addParamsToUrl} from '../../../src/url';
import {VideoEvents_Enum} from '../../../src/video-interface';

const JWPLAYER_EVENTS = {
  'ready': VideoEvents_Enum.LOAD,
  'play': VideoEvents_Enum.PLAYING,
  'pause': VideoEvents_Enum.PAUSE,
  'complete': VideoEvents_Enum.ENDED,
  'visible': VideoEvents_Enum.VISIBILITY,
  'adImpression': VideoEvents_Enum.AD_START,
  'adComplete': VideoEvents_Enum.AD_END,
};

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpJWPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.contentid_ = '';

    /** @private {string} */
    this.playerid_ = '';

    /** @private {string} */
    this.contentSearch_ = '';

    /** @private {string} */
    this.contentRecency_ = '';

    /** @private {string} */
    this.contentBackfill_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?function(Element)} */
    this.playerReadyResolver_ = null;

    /** @private {function()} */
    this.onSetupOnce_ = once(() => this.onSetup_());

    /** @private {function(Object)} */
    this.onReadyOnce_ = once((detail) => this.onReady_(detail));

    /** @private {function()} */
    this.onMessage_ = this.onMessage_.bind(this);

    /** @private {Object} */
    this.playlistItem_ = null;

    /** @private {number} */
    this.duration_ = 0;

    /** @private {number} */
    this.currentTime_ = 0;

    /** @private {Array<?Array<number>>} */
    this.playedRanges_ = [];

    /** @private {?function()} */
    this.unlistenFrame_ = null;

    /** @private {?function()} */
    this.unlistenFullscreen_ = null;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);

    /**@private {?number} */
    this.consentState_ = null;

    /**@private {?string} */
    this.consentString_ = null;

    /**@private {?object} */
    this.consentMetadata_ = null;
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
  getCurrentTime() {
    return this.currentTime_;
  }

  /** @override */
  getDuration() {
    return this.duration_ || this.playlistItem_['duration'] || 0;
  }

  /**
   * @override
   */
  getPlayedRanges() {
    return this.playedRanges_ || [];
  }

  /** @override */
  play(isAutoplay) {
    let reason;

    if (isAutoplay) {
      reason = 'auto';
    }

    this.sendCommand_('play', {reason});
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */
  mute() {
    this.sendCommand_('setMute', true);
  }

  /** @override */
  unmute() {
    this.sendCommand_('setMute', false);
  }

  /** @override */
  showControls() {
    this.sendCommand_('setControls', true);
  }

  /** @override */
  hideControls() {
    this.sendCommand_('setControls', false);
  }

  /** @override */
  getMetadata() {
    const {playlistItem_, win} = this;
    if (win.MediaMetadata && playlistItem_['meta']) {
      try {
        return new win.MediaMetadata(playlistItem_['meta']);
      } catch (error) {
        // catch error that occurs when mediaSession fails to setup
      }
    }
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    if (this.isSafariOrIos_()) {
      this.sendCommand_('setFullscreen', true);
    } else {
      fullscreenEnter(dev().assertElement(this.iframe_));
    }
  }

  /** @override */
  fullscreenExit() {
    if (!this.iframe_) {
      return;
    }
    if (this.isSafariOrIos_()) {
      this.sendCommand_('setFullscreen', false);
    } else {
      fullscreenExit(dev().assertElement(this.iframe_));
    }
  }

  /** @override */
  isFullscreen() {
    if (this.iframe_) {
      return isFullscreenElement(this.iframe_);
    }

    return false;
  }

  /**
   * @param {number} timeSeconds
   * @override
   */
  seekTo(timeSeconds) {
    this.sendCommand_('seek', timeSeconds);
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    const ampDoc = this.getAmpDoc();
    const preconnectUrl = (url) =>
      Services.preconnectFor(this.win).url(ampDoc, url, onLayout);
    // Host that serves player configuration and content redirects
    preconnectUrl('https://content.jwplatform.com');
    // CDN which hosts jwplayer assets
    preconnectUrl('https://ssl.p.jwpcdn.com');
    // Embed
    preconnectUrl(this.getSingleLineEmbed_());
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const {element} = this;
    const deferred = new Deferred();

    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    this.contentid_ = userAssert(
      element.getAttribute('data-playlist-id') ||
        element.getAttribute('data-media-id'),
      'Either the data-media-id or the data-playlist-id ' +
        'attributes must be specified for <amp-jwplayer> %s',
      element
    );
    this.playerid_ = userAssert(
      element.getAttribute('data-player-id'),
      'The data-player-id attribute is required for <amp-jwplayer> %s',
      element
    );

    this.contentSearch_ = element.getAttribute('data-content-search') || '';
    this.contentBackfill_ = element.getAttribute('data-content-backfill') || '';
    this.contentRecency_ = element.getAttribute('data-content-recency') || '';
    this.queryString_ = element.getAttribute('data-player-querystring') || '';

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  layoutCallback() {
    return this.getConsentData_().then(() => {
      const queryParams = {
        'search': this.getContextualVal_() || undefined,
        'recency': this.contentRecency_ || undefined,
        'backfill': this.contentBackfill_ || undefined,
        'isAMP': true,
        'consentState': this.consentState_ || undefined,
        'consentValue': this.consentString_ || undefined,
        'consentGdpr': this.consentMetadata_?.gdprApplies || undefined,
      };

      const url = this.getSingleLineEmbed_();
      let src = addParamsToUrl(url, queryParams);
      src = addParamsToUrl(
        src,
        getDataParamsFromAttributes(this.element, null, /^playerParam(.+)/)
      );
      // TODO: If no query parameters are added to the src, an arbitrary & may be appended.
      if (this.queryString_) {
        src += `&${this.queryString_}`;
      }

      const frame = disableScrollingOnIframe(
        createFrameFor(this, src, this.element.id)
      );

      addUnsafeAllowAutoplay(frame);
      disableScrollingOnIframe(frame);
      // Subscribe to messages from player
      this.unlistenFrame_ = listen(this.win, 'message', this.onMessage_);
      // Forward fullscreen changes to player to update ui
      this.unlistenFullscreen_ = listen(frame, 'fullscreenchange', () => {
        const isFullscreen = this.isFullscreen();
        this.sendCommand_('setFullscreen', isFullscreen);
      });
      this.iframe_ = /** @type {HTMLIFrameElement} */ (frame);

      return this.loadPromise(this.iframe_);
    });
  }

  /** @override */
  unlayoutCallback() {
    if (this.unlistenFrame_) {
      this.unlistenFrame_();
    }
    if (this.unlistenFullscreen_) {
      this.unlistenFullscreen_();
    }
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }

    this.pauseHelper_.updatePlaying(false);

    return true; // Call layoutCallback again.
  }

  /** @override */
  createPlaceholderCallback() {
    if (!this.element.hasAttribute('data-media-id')) {
      return;
    }
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
    placeholder.setAttribute('loading', 'lazy');
    placeholder.setAttribute(
      'src',
      'https://content.jwplatform.com/thumbs/' +
        encodeURIComponent(this.contentid_) +
        '-720.jpg'
    );
    return placeholder;
  }

  /**
   * @private
   */
  onSetup_() {
    const {element} = this;
    const configAttributes = getDataParamsFromAttributes(
      element,
      null,
      /^config(.+)/
    );
    const configJSON = element.getAttribute('data-config-json');
    const config = tryParseJson(configJSON) || {};

    Object.keys(configAttributes).forEach((attr) => {
      if (attr.indexOf('json') !== -1) {
        return;
      }
      config[attr] = configAttributes[attr];
    });

    // Add custom ad params to config
    const adCustParamsJSON = element.getAttribute('data-ad-cust-params');
    if (adCustParamsJSON) {
      config.adCustParams = tryParseJson(adCustParamsJSON);
    }

    // Add custom ad macros to config
    const adMacros = getDataParamsFromAttributes(element, null, /^adMacro(.+)/);
    if (Object.keys(adMacros).length !== 0) {
      config.adMacros = adMacros;
    }

    this.postCommandMessage_('setupConfig', config);
  }

  /**
   * @param {{playlistItem: Object, muted: boolean}} detail
   * @private
   */
  onReady_(detail) {
    const {element} = this;

    this.playlistItem_ = {...detail.playlistItem};
    this.playerReadyResolver_(this.iframe_);

    // Inform Video Manager that the video is pre-muted from persisted options.
    if (detail.muted) {
      dispatchCustomEvent(element, VideoEvents_Enum.MUTED);
    }

    dispatchCustomEvent(element, VideoEvents_Enum.LOAD);
  }

  /**
   * @param {Event} messageEvent
   * @private
   */
  onMessage_(messageEvent) {
    if (
      !this.iframe_ ||
      !messageEvent ||
      messageEvent.source != this.iframe_.contentWindow
    ) {
      return;
    }

    const messageData = getData(messageEvent);

    if (!isJsonOrObj(messageData)) {
      return;
    }

    const data = objOrParseJson(messageData);
    const event = data['event'];
    const detail = data['detail'];

    // Log any valid events
    dev().info('JWPLAYER', 'EVENT:', event || 'anon event', detail || data);

    if (event === 'setup') {
      this.onSetupOnce_();
      return;
    }

    if (event === 'ready') {
      detail && this.onReadyOnce_(detail);
      return;
    }

    switch (event) {
      case 'play':
      case 'adPlay':
        this.pauseHelper_.updatePlaying(true);
        break;
      case 'pause':
      case 'complete':
        this.pauseHelper_.updatePlaying(false);
        break;
    }

    const {element} = this;

    if (redispatch(element, event, JWPLAYER_EVENTS)) {
      return;
    }

    if (detail && event) {
      switch (event) {
        case 'fullscreen':
          const {fullscreen} = detail;
          if (fullscreen !== this.isFullscreen()) {
            fullscreen ? this.fullscreenEnter() : this.fullscreenExit();
          }
          break;
        case 'meta':
          const {duration, metadataType} = detail;
          if (metadataType === 'media') {
            this.duration_ = duration;
          }
          break;
        case 'mute':
          const {mute} = detail;
          const {element} = this;
          dispatchCustomEvent(element, mutedOrUnmutedEvent(mute));
          break;
        case 'playedRanges':
          const {ranges} = detail;
          this.playedRanges_ = ranges;
          break;
        case 'playlistItem':
          const playlistItem = {...detail};
          this.playlistItem_ = playlistItem;
          this.sendCommand_('getPlayedRanges');
          break;
        case 'time':
          const {currentTime} = detail;
          this.currentTime_ = currentTime;
          this.sendCommand_('getPlayedRanges');
          break;
        case 'adTime':
          const {position} = detail;
          this.currentTime_ = position;
        default:
          break;
      }
    }
  }

  /**
   * @param {string} method
   * @param {number|boolean|string|Object|undefined} [optParams]
   * @private
   */
  sendCommand_(method, optParams) {
    this.playerReadyPromise_.then(() =>
      this.postCommandMessage_(method, optParams)
    );
  }

  /**
   * @param {string} method
   * @param {number|boolean|string|Object|undefined} [optParams]
   * @private
   */
  postCommandMessage_(method, optParams) {
    if (!this.iframe_ || !this.iframe_.contentWindow) {
      return;
    }

    dev().info('JWPLAYER', 'COMMAND:', method, optParams);

    this.iframe_.contentWindow./*OK*/ postMessage(
      JSON.stringify({
        'method': method,
        'optParams': optParams,
      }),
      '*'
    );
  }

  /**
   * @private
   * @return {boolean}
   */
  isSafariOrIos_() {
    const platform = Services.platformFor(this.win);

    return platform.isSafari() || platform.isIos();
  }

  /**
   * @private
   * @return {string}
   */
  getSingleLineEmbed_() {
    const isDev = getMode(this.win).localDev;
    const pid = encodeURIComponent(this.playerid_);
    let cid = encodeURIComponent(this.contentid_);

    if (cid === 'outstream') {
      cid = 'oi7pAMI1';
    }

    let baseUrl = `https://content.jwplatform.com/players/${cid}-${pid}.html`;

    if (isDev) {
      const testPage = new URLSearchParams(document.location.search).get(
        'test_page'
      );
      if (testPage) {
        baseUrl = `${testPage}?cid=${cid}&pid=${pid}`;
      }
    }
    return baseUrl;
  }

  /**
   * @private
   * @return {?string}
   */
  getContextualVal_() {
    if (this.contentSearch_ === '__CONTEXTUAL__') {
      const context = this.getAmpDoc().getHeadNode();
      const ogTitleElement = context.querySelector('meta[property="og:title"]');
      const ogTitle = ogTitleElement
        ? ogTitleElement.getAttribute('content')
        : null;
      const title = (context.querySelector('title') || {}).textContent;
      return ogTitle || title || '';
    }
    return this.contentSearch_;
  }

  /**
   * @private
   * @return {Promise}
   */
  getConsentData_() {
    const consentPolicy = super.getConsentPolicy();
    const consentStatePromise = consentPolicy
      ? getConsentPolicyState(this.element, consentPolicy)
      : Promise.resolve(null);
    const consentStringPromise = consentPolicy
      ? getConsentPolicyInfo(this.element, consentPolicy)
      : Promise.resolve(null);
    const consentMetadataPromise = consentPolicy
      ? getConsentMetadata(this.element, consentPolicy)
      : Promise.resolve(null);

    return Promise.all([
      consentStatePromise,
      consentStringPromise,
      consentMetadataPromise,
    ]).then((consents) => {
      this.consentState_ = consents[0];
      this.consentString_ = consents[1];
      this.consentMetadata_ = consents[2];
    });
  }
}

AMP.extension('amp-jwplayer', '0.1', (AMP) => {
  AMP.registerElement('amp-jwplayer', AmpJWPlayer);
});
