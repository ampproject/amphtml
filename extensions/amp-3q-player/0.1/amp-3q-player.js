import {Deferred} from '#core/data-structures/promise';
import {removeElement} from '#core/dom';
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
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {addParamToUrl} from '../../../src/url';
import {VideoEvents_Enum} from '../../../src/video-interface';

const TAG = 'amp-3q-player';

/** @implements {../../../src/video-interface.VideoInterface} */
class Amp3QPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    this.dataId = null;

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
      'https://playout.3qsdn.com',
      opt_onLayout
    );
  }

  /** @override */
  buildCallback() {
    const {element: el} = this;

    this.dataId = userAssert(
      el.getAttribute('data-id'),
      'The data-id attribute is required for <amp-3q-player> %s',
      el
    );

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(el);
    Services.videoManagerForDoc(el).register(this);
  }

  /** @private */
  generateIframeSrc_() {
    const explicitParamsAttributes = [
      'key',
      'timestamp',
      'controls',
      'userToken',
      'userGroup',
      'player',
    ];

    let iframeSrc = 'https://playout.3qsdn.com/';
    if (this.element.getAttribute(`data-datasource`)) {
      iframeSrc +=
        'config_by_metadata/' +
        this.element.getAttribute(`data-project`) +
        '/' +
        this.element.getAttribute(`data-datafield`) +
        '/';
    }

    iframeSrc +=
      dev().assertString(this.dataId) +
      // Autoplay is handled by VideoManager
      '?autoplay=false&amp=true';

    explicitParamsAttributes.forEach((explicitParam) => {
      const val = this.element.getAttribute(`data-${explicitParam}`);
      if (val) {
        iframeSrc = addParamToUrl(iframeSrc, explicitParam, val);
      }
    });

    return iframeSrc;
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.generateIframeSrc_());

    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.sdnBridge_.bind(this)
    );

    return this.loadPromise(this.iframe_).then(() => this.playerReadyPromise_);
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

    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /**
   *
   * @param {!Event} event
   * @private
   */
  sdnBridge_(event) {
    if (event.source) {
      if (event.source != this.iframe_.contentWindow) {
        return;
      }
    }

    const data = objOrParseJson(getData(event));
    if (data == null) {
      return; // we only process valid json
    }

    const eventType = data['data'];

    switch (eventType) {
      case 'ready':
        this.playerReadyResolver_();
        break;
      case 'playing':
        this.pauseHelper_.updatePlaying(true);
        break;
      case 'paused':
      case 'complete':
        this.pauseHelper_.updatePlaying(false);
        break;
    }

    redispatch(this.element, eventType, {
      'ready': VideoEvents_Enum.LOAD,
      'playing': VideoEvents_Enum.PLAYING,
      'paused': VideoEvents_Enum.PAUSE,
      'complete': VideoEvents_Enum.ENDED,
      'muted': VideoEvents_Enum.MUTED,
      'unmuted': VideoEvents_Enum.UNMUTED,
    });
  }

  /**
   *
   * @private
   * @param {string} message
   */
  sdnPostMessage_(message) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/ postMessage(message, '*');
      }
    });
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface
  /** @override */
  play() {
    this.sdnPostMessage_('play2');
  }

  /** @override */
  pause() {
    if (!this.iframe_) {
      return;
    }
    this.sdnPostMessage_('pause');
  }

  /** @override */
  mute() {
    this.sdnPostMessage_('mute');
  }

  /** @override */
  unmute() {
    this.sdnPostMessage_('unmute');
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
  showControls() {
    this.sdnPostMessage_('showControlbar');
  }

  /** @override */
  hideControls() {
    this.sdnPostMessage_('hideControlbar');
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
  AMP.registerElement(TAG, Amp3QPlayer);
});
