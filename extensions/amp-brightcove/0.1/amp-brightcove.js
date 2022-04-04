import {
  BRIGHTCOVE_EVENTS,
  getBrightcoveIframeSrc,
} from '#bento/apis/brightcove-api';

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
import {isLayoutSizeDefined} from '#core/dom/layout';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {dev, user, userAssert} from '#utils/log';

import {
  getConsentPolicyInfo,
  getConsentPolicySharedData,
  getConsentPolicyState,
} from '../../../src/consent';
import {
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {VideoEvents_Enum} from '../../../src/video-interface';

/** @private @const {string} */
const TAG = 'amp-brightcove';

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpBrightcove extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?boolean} */
    this.playing_ = false;

    /** @private {?boolean}  */
    this.muted_ = false;

    /** @private {?number}  */
    this.currentTime_ = null;

    /** @private {?number}  */
    this.duration_ = null;

    /** @private {Array}  */
    this.playedRanges_ = [];

    /** @private {?boolean}  */
    this.hasAmpSupport_ = false;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?number} */
    this.readyTimeout_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /**@private {?string} */
    this.playerId_ = null;

    /** @private {?../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacements_ = null;

    /**@private {?number} */
    this.consentState_ = null;

    /**@private {?object} */
    this.consentSharedData_ = null;

    /**@private {?string} */
    this.consentString_ = null;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /** @override */
  preconnectCallback() {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://players.brightcove.net'
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.urlReplacements_ = Services.urlReplacementsForDoc(this.element);

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    // Warn if the player does not have video interface support
    this.readyTimeout_ = /** @type {number} */ (
      Services.timerFor(window).delay(() => {
        user().warn(
          TAG,
          'Did not receive ready callback from player %s.' +
            ' Ensure it has the videojs-amp-support plugin.',
          this.playerId_
        );
      }, 3000)
    );
  }

  /**
   * @return {Promise}
   */
  getConsents_() {
    const consentPolicy = super.getConsentPolicy();
    const consentPromise = consentPolicy
      ? getConsentPolicyState(this.element, consentPolicy)
      : Promise.resolve(null);
    const consentStringPromise = consentPolicy
      ? getConsentPolicyInfo(this.element, consentPolicy)
      : Promise.resolve(null);
    const sharedDataPromise = consentPolicy
      ? getConsentPolicySharedData(this.element, consentPolicy)
      : Promise.resolve(null);
    return Promise.all([
      consentPromise,
      sharedDataPromise,
      consentStringPromise,
    ]).then((arr) => {
      this.consentState_ = arr[0];
      this.consentSharedData_ = arr[1];
      this.consentString_ = arr[2];
    });
  }

  /**
   * @override
   * @return {!Promise}
   */
  layoutCallback() {
    return this.getConsents_().then(() => {
      this.iframe_ = createFrameFor(this, this.getIframeSrc_());
      this.unlistenMessage_ = listen(this.win, 'message', (e) =>
        this.handlePlayerMessage_(e)
      );
      return this.loadPromise(this.iframe_).then(
        () => this.playerReadyPromise_
      );
    });
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {*=} arg
   * @private
   * */
  sendCommand_(command, arg) {
    this.playerReadyPromise_.then(() => {
      // We still need to check this.iframe_ as the component may have
      // been unlaid out by now.
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/ postMessage(
          JSON.stringify({
            'command': command,
            'args': arg,
          }),
          'https://players.brightcove.net'
        );
      }
    });
  }

  /**
   * @param {!Event} event
   * @private
   */
  handlePlayerMessage_(event) {
    const {element} = this;

    if (event.source != this.iframe_.contentWindow) {
      return;
    }

    const eventData = getData(event);
    if (!isJsonOrObj(eventData)) {
      return;
    }

    const data = objOrParseJson(eventData);
    if (data == null) {
      return; // We only process valid JSON.
    }

    const eventType = data['event'];
    if (!eventType) {
      return;
    }

    switch (eventType) {
      case 'ready':
        this.onReady_(data);
        break;
      case 'playing':
        this.playing_ = true;
        this.pauseHelper_.updatePlaying(true);
        break;
      case 'pause':
      case 'ended':
        this.playing_ = false;
        this.pauseHelper_.updatePlaying(false);
        break;
    }

    if (data['ct']) {
      this.currentTime_ = data['ct'];
    }
    if (data['pr']) {
      this.playedRanges_ = data['pr'];
    }
    if (data['dur']) {
      this.duration_ = data['dur'];
    }

    if (
      redispatch(element, eventType, {
        'ready': VideoEvents_Enum.LOAD,
        ...BRIGHTCOVE_EVENTS,
      })
    ) {
      return;
    }

    if (eventType === 'volumechange') {
      const muted = data['muted'];
      if (muted == null || this.muted_ == muted) {
        return;
      }
      this.muted_ = muted;
      dispatchCustomEvent(element, mutedOrUnmutedEvent(this.muted_));
      return;
    }
  }

  /**
   * @param {!JsonObject} data
   * @private
   */
  onReady_(data) {
    this.hasAmpSupport_ = true;

    Services.timerFor(this.win).cancel(this.readyTimeout_);

    const {element} = this;

    installVideoManagerForDoc(element);
    Services.videoManagerForDoc(element).register(this);

    this.playerReadyResolver_(this.iframe_);

    dev().info(
      TAG,
      'Player %s ready. ' +
        'Brightcove Player version: %s AMP Support version: %s',
      this.playerId_,
      data['bcVersion'],
      data['ampSupportVersion']
    );
  }

  /**
   * @return {string} iframe source url
   * @private
   */
  getIframeSrc_() {
    const {element: el} = this;
    const account = userAssert(
      el.getAttribute('data-account'),
      'The data-account attribute is required for <amp-brightcove> %s',
      el
    );
    this.playerId_ =
      el.getAttribute('data-player') ||
      el.getAttribute('data-player-id') ||
      'default';

    const urlParams = {};
    if (this.consentState_) {
      urlParams['ampInitialConsentState'] = this.consentState_;
    }
    if (this.consentSharedData_) {
      urlParams['ampConsentSharedData'] = JSON.stringify(
        this.consentSharedData_
      );
    }
    if (this.consentString_) {
      urlParams['ampInitialConsentValue'] = this.consentString_;
    }

    el.setAttribute('data-param-playsinline', 'true');
    el.removeAttribute('data-param-autoplay');

    const {
      'embed': embed = 'default',
      'playlistId': playlistId,
      'referrer': referrer,
      'videoId': videoId,
    } = el.dataset;
    return getBrightcoveIframeSrc(
      account,
      this.playerId_,
      embed,
      playlistId,
      videoId,
      referrer != null
        ? this.urlReplacements_.expandUrlSync(referrer)
        : referrer,
      {...urlParams, ...getDataParamsFromAttributes(el)}
    );
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const account = mutations['data-account'];
    const playerId = mutations['data-player'] || mutations['data-player-id'];
    const embed = mutations['data-embed'];
    const playlistId = mutations['data-playlist-id'];
    const videoId = mutations['data-video-id'];
    if (
      account !== undefined ||
      playerId !== undefined ||
      playlistId !== undefined ||
      embed !== undefined ||
      videoId !== undefined
    ) {
      if (this.iframe_) {
        this.iframe_.src = this.getIframeSrc_();
      }
    }
  }

  /** @override */
  pauseCallback() {
    if (
      this.iframe_ &&
      this.iframe_.contentWindow &&
      this.hasAmpSupport_ &&
      this.playing_
    ) {
      this.pause();
    }
  }

  /** @override */
  unlayoutOnPause() {
    if (!this.hasAmpSupport_) {
      return true;
    }
    return false;
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
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  play(isAutoplay) {
    this.sendCommand_('play', isAutoplay);
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */
  mute() {
    this.sendCommand_('muted', true);
  }

  /** @override */
  unmute() {
    this.sendCommand_('muted', false);
  }

  /** @override */
  showControls() {
    this.sendCommand_('controls', true);
  }

  /** @override */
  hideControls() {
    this.sendCommand_('controls', false);
  }

  /** @override */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    fullscreenEnter(dev().assertElement(this.iframe_));
  }

  /** @override */
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
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return true;
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
    return /** @type {!Array<!Array<number>>} */ (this.playedRanges_);
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpBrightcove);
});
