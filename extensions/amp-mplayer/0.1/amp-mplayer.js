/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {addParamsToUrl} from '../../../src/url';
import {createFrameFor, isJsonOrObj, objOrParseJson, originMatches, redispatch} from '../../../src/iframe-video';
import {dev, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {installVideoManagerForDoc}
  from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';

/** @const */
const TAG = 'amp-mplayer';

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpMPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    // Declare instance variables with type annotations.
    /** @private {Element} */
    this.iframe_ = null;

    /** @private {string} */
    this.contentType_ = null;

    /** @private {?string} */
    this.playerId_ = null;

    /** @private {?string} */
    this.contentId_ = '';

    /** @private {?string} */
    this.scannedElement_ = '';

    /** @private {?string} */
    this.tags_ = '';

    /** @private {?string} */
    this.minimumDateFactor_ = '';

    /** @private {?string} */
    this.scannedElementType_ = '';

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?number} */
    this.readyTimeout_ = null;
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {

    // Host that serves player configuration and content redirects
    this.preconnect.url('https://www.oo-syringe.com', onLayout);
  }

  /** @override */
  buildCallback() {
    // Get attributes, assertions of values, assign instance variables.
    // Build lightweight DOM and append to this.element.

    const {element} = this;

    this.contentType_ = userAssert(element.getAttribute('data-content-type'),
        'The data-content-type must be specified for <amp-mplayer> %s',
        element);

    this.contentId_ =
      (this.contentType_ != 'semantic') ?
        (userAssert(element.getAttribute('data-content-id'),
            'The data-content-id must be specified for %s ' +
            'data-content-type in <amp-mplayer> %s',
            this.contentType_, element)) : '';

    this.initSemanticFields_();

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;


    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);

    // Warn if the player does not have video interface support
    this.readyTimeout_ = /** @type {number} */ (/******************************* NECESSARY?? *******************************/
      Services.timerFor(window).delay(function() {
        user().warn(TAG,
            'Did not receive ready callback from player, ' +
          'ensure it has the videojs-amp-support plugin.');
      }, 3000));
  }

  /** @override */
  isLayoutSupported(layout) {
    //Define which layouts our element support

    //Size-defined layouts: fixed, fixed height, responsive and fill
    return isLayoutSizeDefined(layout);
    //return layout == Layout.RESPONSIVE;
  }

  /**
   * Init Semantic params
   * @private
   */
  initSemanticFields_() {
    const {element} = this;
    this.scannedElement_ = (element.getAttribute('data-scanned-element') || '');
    this.tags_ = (element.getAttribute('data-tags') || '');
    this.minimumDateFactor_ =
      (element.getAttribute('data-minimum-date-factor') || '');
    //console.log(element.getAttribute('data-scanned-element-type'));
    this.scannedElementType_ =
      (element.getAttribute('data-scanned-element-type') || '');
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleMPlayerMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://syringe.s3-us-west-2.amazonaws.com')) {
      return;
    }
    const eventData = getData(event);
    if (!isJsonOrObj(eventData)) {
      return;
    }
    const data = objOrParseJson(eventData);
    //console.log(data); DONT GET HERE
    if (data === undefined) {
      return; // We only process valid JSON.
    }

    const eventType = data['event'];
    //console.log(eventType);
    if (eventType == 'ready') { /******************************* NECESSARY?? *******************************/
      Services.timerFor(this.win).cancel(this.readyTimeout_);
    }
    redispatch(this.element, eventType, {
      'playing': VideoEvents.PLAYING,
      'paused': VideoEvents.PAUSE,
      'muted': VideoEvents.MUTED,
      'unmuted': VideoEvents.UNMUTED,
      'ended': [VideoEvents.ENDED, VideoEvents.PAUSE],
      'ads-ad-started': VideoEvents.AD_START,
      'ads-ad-ended': VideoEvents.AD_END,
    });
  }

  /**
   * Build Iframe source
   * @return {string}
   * @private
   */
  iframeSource_() {
    const {element} = this;
    const source = 'https://syringe.s3-us-west-2.amazonaws.com/dev/amp/mplayer.html' +
      `?content_type=${encodeURIComponent(this.contentType_)}` +
      ((this.contentId_ !== '') ?
        '&content_id=' +
        `${encodeURIComponent(this.contentId_)}` :
        (((this.scannedElement_ != '') ?
          '&scanned_element=' +
          `${encodeURIComponent(this.scannedElement_)}` : '') +
          ((this.tags_ != '') ?
            '&tags=' +
          `${encodeURIComponent(this.tags_)}` : '') +
          ((this.minimumDateFactor_ != '') ?
            '&minimum_date_factor=' +
          `${encodeURIComponent(this.minimumDateFactor_)}` : '') +
          ((this.scannedElementType_) ?
            '&scanned_element_type=' +
          `${encodeURIComponent(this.scannedElementType_)}` : '')));

    const moreQueryParams = dict({
      'player_id': (element.getAttribute('data-player-id') || undefined),
    });

    return addParamsToUrl(source, moreQueryParams);
  }

  /** @override */
  layoutCallback() {
    console.log('THE IFRAME SOURCE IS ------------------->');
    console.log(this.iframeSource_() + '\n');

    const iframe = createFrameFor(this, this.iframeSource_());
    this.iframe_ = iframe;

    //Services.videoManagerForDoc(this.element).register(this);
    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handleMPlayerMessage_.bind(this)
    );
    return this.loadPromise(iframe)
        .then(() => this.playerReadyPromise_);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
    return true; // Call layoutCallback again.
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} message
   * @private
   */
  sendCommand_(message) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/postMessage(message, '*');
      }
    });
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /**
   * Whether the component supports video playback in the current platform.
   * If false, component will be not treated as a video component.
   * @return {boolean}
   */
  /** @override */
  supportsPlatform() {
    return true;
  }

  /**
   * Whether users can interact with the video such as pausing it.
   * Example of non-interactive videos include design background videos where
   * all controls are hidden from the user.
   *
   * @return {boolean}
   */
  /** @override */
  isInteractive() {
    return true;
  }

  /**
   * Current playback time in seconds at time of trigger
   * @return {number}
   */
  /** @override */
  getCurrentTime() {
    if (this.info_) {
      return this.info_.currentTime;
    }
    return NaN;
  }

  /**
   * Total duration of the video in seconds
   * @return {number}
   */
  /** @override */
  getDuration() {
    if (this.info_) {
      return this.info_.duration;
    }
    // Not supported.
    return NaN;
  }

  /**
   * Get a 2d array of start and stop times that the user has watched.
   * @return {!Array<Array<number>>}
   */
  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

  /**
   * Plays the video..
   *
   * @param {boolean} unusedIsAutoplay Whether the call to the `play` method is
   * triggered by the autoplay functionality. Video players can use this hint
   * to make decisions such as not playing pre-roll video ads.
   */
  /** @override */
  play(unusedIsAutoplay) {
    this.sendCommand_('play');
  }

  /**
   * Pauses the video.
   */
  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /**
   * Mutes the video.
   */
  /** @override */
  mute() {
    this.sendCommand_('mute'); // setMute?????
  }

  /**
   * Unmutes the video.
   */
  /** @override */
  unmute() {
    this.sendCommand_('unMute'); // setMute?????
  }

  /**
   * Makes the video UI controls visible.
   *
   * AMP will not call this method if `controls` attribute is not set.
   */
  /** @override */
  showControls() {} // Not supported.

  /**
   * Hides the video UI controls.
   *
   * AMP will not call this method if `controls` attribute is not set.
   */
  /** @override */
  hideControls() {} // Not supported.

  /**
   * Returns video's meta data (artwork, title, artist, album, etc.) for use
   * with the Media Session API
   * artwork (Array): URL to the poster image (preferably a 512x512 PNG)
   * title (string): Name of the video
   * artist (string): Name of the video's author/artist
   * album (string): Name of the video's album if it exists
   * @return {!./mediasession-helper.MetadataDef|undefined} metadata
   */
  /** @override */
  getMetadata() {} // Not supported.

  /**
   * If this returns true then it will be assumed that the player implements
   * a feature to enter fullscreen on device rotation internally, so that the
   * video manager does not override it. If not, the video manager will
   * implement this feature automatically for videos with the attribute
   * `rotate-to-fullscreen`.
   *
   * @return {boolean}
   */
  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /**
   * If this returns true then it will be assumed that the player implements
   * the MediaSession API internally so that the video manager does not override
   * it. If not, the video manager will use the metadata variable as well as
   * inferred meta-data to update the video's Media Session notification.
   *
   * @return {boolean}
   */
  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /**
   * Enables fullscreen on the internal video element
   * NOTE: While implementing, keep in mind that Safari/iOS do not allow taking
   * any element other than <video> to fullscreen, if the player has an internal
   * implementation of fullscreen (flash for example) then check
   * if Services.platformFor(this.win).isSafari is true and use the internal
   * implementation instead. If not, it is recommended to take the iframe
   * to fullscreen using fullscreenEnter from dom.js
   */
  /** @override */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    fullscreenEnter(dev().assertElement(this.iframe_));
  }

  /**
   * Quits fullscreen mode
   */
  /** @override */
  fullscreenExit() {
    if (!this.iframe_) {
      return;
    }
    fullscreenExit(dev().assertElement(this.iframe_));
  }

  /**
   * Returns whether the video is currently in fullscreen mode or not
   * @return {boolean}
   */
  /** @override */
  isFullscreen() {
    if (!this.iframe_) {
      return false;
    }
    return isFullscreenElement(dev().assertElement(this.iframe_));
  }

  /**
   * Seeks the video to a specified time.
   * @param {number} unusedTimeSeconds
   */
  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }

}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpMPlayer);
});
