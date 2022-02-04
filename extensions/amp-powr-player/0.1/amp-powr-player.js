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
import {dev, userAssert} from '#utils/log';

import {
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {addParamsToUrl} from '../../../src/url';
import {VideoEvents_Enum} from '../../../src/video-interface';

/** @private @const {string} */
const TAG = 'amp-powr-player';

/** @private @const {!Object.<string,string>} */
const PLAYER_EVENT_MAP = {
  'ready': VideoEvents_Enum.LOAD,
  'playing': VideoEvents_Enum.PLAYING,
  'pause': VideoEvents_Enum.PAUSE,
  'ended': VideoEvents_Enum.ENDED,
  'ads-ad-started': VideoEvents_Enum.AD_START,
  'ads-ad-ended': VideoEvents_Enum.AD_END,
};

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpPowrPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?boolean} */
    this.playing_ = false;

    /** @private {?boolean}  */
    this.muted_ = false;

    /** @private {?boolean}  */
    this.frameHasAmpSupport_ = false;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /**@private {?string} */
    this.playerId_ = null;

    /** @private {?../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacements_ = null;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /** @override */
  preconnectCallback() {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://player.powr.com'
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
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getIframeSrc_());

    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(this.win, 'message', (e) =>
      this.handlePlayerMessage_(e)
    );

    this.pauseHelper_.updatePlaying(true);

    return this.loadPromise(iframe).then(() => this.playerReadyPromise_);
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
          'https://player.powr.com'
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

    if (eventType === 'ready') {
      this.onReady_(data);
    }

    if (eventType === 'playing') {
      this.playing_ = true;
    }
    if (eventType === 'pause') {
      this.playing_ = false;
    }

    if (redispatch(element, eventType, PLAYER_EVENT_MAP)) {
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
    this.frameHasAmpSupport_ = true;

    const {element} = this;

    installVideoManagerForDoc(element);
    Services.videoManagerForDoc(element).register(this);

    this.playerReadyResolver_(this.iframe_);

    dev().info(
      TAG,
      'Player %s ready. ' +
        'Powr Player version: %s IFrame Support version: %s',
      this.playerId_,
      data['powrVersion'],
      data['iframeVersion']
    );
  }

  /**
   * @return {string}
   * @private
   */
  getIframeSrc_() {
    const {element: el} = this;
    const account = userAssert(
      el.getAttribute('data-account'),
      'The data-account attribute is required for <amp-powr-player> %s',
      el
    );

    this.playerId_ = userAssert(
      el.getAttribute('data-player'),
      'The data-player attribute is required for <amp-powr-player> %s',
      el
    );

    const video = el.getAttribute('data-video');
    const terms = el.getAttribute('data-terms');

    userAssert(
      video || terms,
      'The data-video or data-terms attribute is required for ' +
        '<amp-powr-player> %s',
      el
    );

    const srcPrefix = 'https://player.powr.com/iframe.html';

    const srcParams = {
      'account': account,
      'player': this.playerId_,
    };

    if (video) {
      srcParams['video'] = video;
    }
    if (terms) {
      srcParams['terms'] = terms;
    }

    const src = addParamsToUrl(srcPrefix, srcParams);

    const customReferrer = el.getAttribute('data-referrer');

    if (customReferrer) {
      el.setAttribute(
        'data-param-referrer',
        this.urlReplacements_.expandUrlSync(customReferrer)
      );
    }

    el.setAttribute('data-param-playsinline', 'true');

    // Pass through data-param-* attributes as params for plugin use
    return addParamsToUrl(src, getDataParamsFromAttributes(el));
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const account = mutations['data-account'];
    const playerId = mutations['data-player'] || mutations['data-player-id'];
    const video = mutations['data-video'];
    if (
      account !== undefined ||
      playerId !== undefined ||
      video !== undefined
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
      this.frameHasAmpSupport_ &&
      this.playing_
    ) {
      this.pause();
    }
  }

  /** @override */
  unlayoutOnPause() {
    if (!this.frameHasAmpSupport_) {
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
  play(unusedIsAutoplay) {
    this.sendCommand_('play');
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
    // Not supported.
    return 0;
  }

  /** @override */
  getDuration() {
    // Not supported.
    return 1;
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
  AMP.registerElement(TAG, AmpPowrPlayer);
});
