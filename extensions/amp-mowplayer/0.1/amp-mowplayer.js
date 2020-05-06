/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  originMatches,
  redispatch,
} from '../../../src/iframe-video';
import {dev, userAssert} from '../../../src/log';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {getStyle, px, setStyle, setStyles, toggle} from '../../../src/style';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';

const TAG = 'amp-mowplayer';

/**
 * @enum {number}
 * @private
 */
const PlayerStates = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
};

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpMowplayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string}  */
    this.mediaid_ = '';

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?string} */
    this.videoIframeSrc_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Function} */
    this.stickyDisableWorker_ = null;

    /** @private {?boolean}  */
    this.mofileFullApplied_ = false;

    /** @private {?float}  */
    this.originalHeight_ = null;

    /** @private {?boolean}  */
    this.paused_ = true;

    /** @global {?boolean}  */
    window.mowStickyEnabled = false;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const preconnect = Services.preconnectFor(this.win);
    preconnect.url(this.getAmpDoc(), this.getVideoIframeSrc_());
    // Host that mowplayer uses to serve JS needed by player.
    preconnect.url(
      this.getAmpDoc(),
      '//mowplayer.g2.gopanear.com',
      opt_onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  viewportCallback(visible) {
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
  }

  /** @override */
  buildCallback() {
    this.mediaid_ = userAssert(
      this.element.getAttribute('data-mediaid'),
      '/The data-mediaid attribute is required for <amp-mowplayer> %s',
      this.element
    );

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);

    const event = new CustomEvent('mowapiready', {
      bubbles: true,
      detail: {
        api: this,
      },
    });

    document.dispatchEvent(event);
  }

  /**
   * Get iframe src url
   * @return {string}
   * @private
   */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    return (this.videoIframeSrc_ =
      'https://mowplayer.com/watch/' + this.mediaid_ + '?script=1');
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getVideoIframeSrc_());
    this.iframe_ = iframe;
    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleMowMessage_.bind(this)
    );
    const loaded = this.loadPromise(this.iframe_).then(() => {
      // Tell mowplayer that we want to receive messages
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    });
    this.playerReadyResolver_(loaded);
    return loaded;
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
    return true; // Call layoutCallback again.
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.pause();
    }
  }

  /**
   * Sends a message to the player through postMessage.
   * @param {string} type
   * @param {Array=} data
   * @private
   */
  sendMessage_(type, data = {}) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/ postMessage(
          {
            mowplayer: {
              type,
              data,
            },
          },
          'https://mowplayer.com'
        );
      }
    });
  }

  /**
   * Receive messages from player
   * @param {!Event} event
   * @private
   */
  handleMowMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://mowplayer.com')) {
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

    if (data.mowplayer === undefined) {
      return;
    }

    const eventType = data.mowplayer.type;
    const info = data.mowplayer.data || {};

    const {element} = this;

    if (eventType === 'handshake') {
      this.sendMessage_('handshake_done');
    } else if (eventType === 'ready') {
      this.onReady_(info);
    } else if (eventType === 'visibility_observer') {
      this.onVisibilityObserver_(info);
    } else if (eventType === 'resize') {
      this.onResize_(info);
    } else if (eventType === 'stick_player') {
      this.onStickPlayer_(info);
    } else if (eventType === 'sticky_disable') {
      this.onStickyDisable_();
    } else if (eventType === 'pause') {
      this.pause();
    } else if (eventType === 'play') {
      this.play();
    }

    const {playerState} = info;
    if (eventType == 'infoDelivery' && playerState != null) {
      redispatch(element, playerState.toString(), {
        [PlayerStates.PLAYING]: VideoEvents.PLAYING,
        [PlayerStates.PAUSED]: VideoEvents.PAUSE,
        // mowplayer does not fire pause and ended together.
        [PlayerStates.ENDED]: [VideoEvents.ENDED, VideoEvents.PAUSE],
      });
      return;
    }

    const {muted} = info;
    if (eventType == 'infoDelivery' && info && muted != null) {
      if (this.muted_ == muted) {
        return;
      }
      this.muted_ = muted;
      element.dispatchCustomEvent(mutedOrUnmutedEvent(this.muted_));
      return;
    }
  }

  /**
   * Disable sticky player
   * @private
   */
  onStickyDisable_() {
    this.stickyDisableWorker_.call();
  }

  /**
   * Set player height on resize
   * @private
   * @param {Object} data
   */
  onResize_(data) {
    if (!window.mowStickyEnabled) {
      this.forceChangeHeight(data.state.dimensions.height + 10);
    }
  }

  /**
   * Set full width player on mobile when enabled from platform
   * @private
   * @param {Object} data
   */
  onReady_(data) {
    if (
      /(iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone)/gi.test(
        navigator.userAgent
      ) &&
      data.state.config.mobile_full_width &&
      !this.mofileFullApplied_
    ) {
      this.mofileFullApplied_ = true;
      const repaint = () => {
        const rect = this.element.getBoundingClientRect();
        if (rect.width < window.screen.availWidth) {
          const leftMargin = rect.left;
          const rightMargin = window.screen.availWidth - rect.right;
          setStyle(this.element, 'marginLeft', '-' + leftMargin + 'px');
          setStyle(this.element, 'marginRight', '-' + rightMargin + 'px');
        }
      };

      repaint();
      window.addEventListener('resize', repaint);
    }
  }

  /**
   * Initialize sticky feature
   * @private
   * @param {Object} data
   */
  onStickPlayer_(data) {
    let previousVisible = true;
    const {breakpoint, position, margin} = data;
    const marginStyle = `${margin}px`;
    const fakeWrapper = document.createElement('div');
    const fakeContainer = document.createElement('div');
    fakeWrapper.appendChild(fakeContainer);
    this.element.insertAdjacentElement('afterend', fakeWrapper);

    setStyles(fakeWrapper, {
      position: 'relative',
    });

    toggle(fakeWrapper, false);

    const previousStyles = {};
    const toggle_ = (enable) => {
      window.mowStickyEnabled = enable;
      const styles = {
        position: 'fixed',
        marginLeft: 0,
        marginRight: 0,
        zIndex: 1000000,
        width: '100%',
        maxWidth: '500px',
      };

      if (window.screen.availWidth <= 500) {
        styles.right = 0;
        styles.left = 0;

        switch (position) {
          case 'left_bottom':
          case 'bottom_right':
            styles.bottom = 0;
            break;
          case 'left_top':
          case 'top_right':
          default:
            styles.top = 0;
        }
      } else {
        switch (position) {
          case 'left_top':
            styles.top = marginStyle;
            styles.left = marginStyle;
            break;
          case 'left_bottom':
            styles.bottom = marginStyle;
            styles.left = marginStyle;
            break;
          case 'bottom_right':
            styles.bottom = marginStyle;
            styles.right = marginStyle;
            break;
          case 'top_right':
          default:
            styles.top = marginStyle;
            styles.right = marginStyle;
        }
      }

      previousStyles.height = getStyle(this.element, 'height');
      previousStyles.marginLeft = getStyle(this.element, 'marginLeft');
      previousStyles.marginRight = getStyle(this.element, 'marginRight');

      setStyles(fakeContainer, {
        height: previousStyles.height,
        marginLeft: previousStyles.marginLeft,
        marginRight: previousStyles.marginRight,
        background: '#000',
      });

      if (this.originalHeight_) {
        setStyle(fakeContainer, 'height', px(this.originalHeight_));
      }

      toggle(fakeWrapper, enable);

      if (enable) {
        setStyles(this.element, {
          marginLeft: 0,
          marginRight: 0,
          position: 'fixed',
          top: styles.top,
          bottom: styles.bottom,
          left: styles.left,
          right: styles.right,
          zIndex: styles.zIndex,
          width: '100%',
          maxWidth: '500px',
        });

        if (!this.originalHeight_) {
          this.originalHeight_ = parseInt(this.element.offsetHeight, 10);
        }

        this.forceChangeHeight(
          parseInt((parseInt(this.element.offsetWidth, 10) * 9) / 16, 10)
        );
      } else {
        setStyles(this.element, {
          marginLeft: previousStyles.marginLeft,
          marginRight: previousStyles.marginRight,
          position: 'relative',
          top: 'auto',
          bottom: 'auto',
          left: 'auto',
          right: 'auto',
          zIndex: 'auto',
          maxWidth: '100%',
        });

        this.forceChangeHeight(this.originalHeight_);
      }

      this.sendMessage_('sticky_state_update', {enabled: enable});
    };

    let enabled = false;
    const worker = () => {
      if (this.paused_ && !enabled) {
        return;
      }

      const rect = (enabled
        ? fakeContainer
        : this.element
      ).getBoundingClientRect();
      const height = rect.height * parseFloat(breakpoint);
      const visible =
        (rect.top > 0 && rect.top + height < window.innerHeight) ||
        (rect.top < 0 && rect.top + height > 0);

      if (window.mowStickyEnabled && !visible) {
        //another sticky activated
        return;
      }

      if (previousVisible !== visible) {
        enabled = !visible;
        toggle_(enabled);
        previousVisible = visible;
      }
    };
    window.addEventListener('scroll', worker);
    window.addEventListener('resize', worker);

    this.stickyDisableWorker_ = () => {
      toggle_(false);
      window.removeEventListener('scroll', worker);
      window.removeEventListener('resize', worker);
    };
  }

  /**
   * Check player is visible or not based on breakpoint and send message to player
   * @private
   * @param {Object} data
   */
  onVisibilityObserver_(data) {
    let previousVisible = null;
    const worker = () => {
      const rect = this.element.getBoundingClientRect();
      const height = rect.height * parseFloat(data.breakpoint);
      const visible =
        (rect.top > 0 && rect.top + height < window.innerHeight) ||
        (rect.top < 0 && rect.top + height > 0);

      if (previousVisible !== visible) {
        this.sendMessage_('visibility_observer_visibility', {
          visible,
        });
        previousVisible = visible;
      }
    };
    window.addEventListener('scroll', worker);
    window.addEventListener('resize', worker);
    worker();
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
    this.paused_ = false;
  }

  /** @override */
  pause() {
    this.paused_ = true;
  }

  /** @override */
  mute() {}

  /** @override */
  unmute() {}

  /** @override */
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
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
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return true;
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
  AMP.registerElement(TAG, AmpMowplayer);
});
