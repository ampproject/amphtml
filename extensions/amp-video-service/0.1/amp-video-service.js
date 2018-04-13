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

/**
 * @fileoverview
 * Extension gets loaded dynamically and manages video components.
 * It's invalid to include this extension in a document as a `<script>` tag, as
 * it gets automatically inserted by the runtime when required.
 */

import {ActionTrust} from '../../../src/action-trust';
import {CommonSignals} from '../../../src/common-signals';
import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isFiniteNumber} from '../../../src/types';
import {listen} from '../../../src/event-helper';


/** @private @const {string} */
const TAG = 'amp-video-service';


/** @enum {number} */
export const VideoFeatures = {
  ACTIONS: 0,
  MEDIA_SESSION: 1,
};


/** @private @const {string} */
const ENTRY_PROP = '__AMP_VIDEO_ENTRY__';


/** @private @const {string} */
const DISABLED_FEATURES = '__AMP_VIDEO_DISABLED__';


/**
 * Manages all AMP video players that implement the common Video API
 * {@see ../src/video-interface.VideoInterface}.
 *
 * Provides unified behavior for all videos regardless of implementation.
 *
 *
 * __          __              _
 * \ \        / /             (_)
 *  \ \  /\  / /_ _ _ __ _ __  _ _ __   __ _
 *   \ \/  \/ / _` | '__| '_ \| | '_ \/ _` |
 *    \  /\  / (_| | |  | | | | | | | | (_| |_
 *     \/  \/ \__,_|_|  |_| |_|_|_| |_|\__, (_)
 *                                      __/ |
 *                                     |___/
 *
 * This service is instantiated asynchronously by
 * {@see ../../../src/service/video-service-sync-impl.VideoServiceSync}. That
 * service should be used by consumers of the APIs exposed here.
 *
 * If you need to add methods to this class that are public to components,
 * it's most likely that you'll want to implement them here and set wrappers for
 * them in the runtime-level service class.
 */
export class VideoService {

  /** @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    const {win} = ampdoc;

    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private {?../../../src/observable.Observable<void>} */
    this.tick_ = null;

    /** @private @const {function()} */
    this.boundTick_ = () => this.startTicking_();
  }

  /** @private */
  startTicking_() {
    this.tick_.fire();
    this.timer_.delay(this.boundTick_, 1000);
  }

  /** @param {!../../../src/video-interface.VideoInterface} video */
  register(video) {
    const {element} = video;

    if (this.getEntryOrNull(element)) {
      return dev().assert(this.getEntryOrNull(element));
    }

    if (!video.supportsPlatform()) {
      return null;
    }

    const entry = VideoEntry.create(this.ampdoc_, this, video);

    this.setEntry_(element, entry);

    return entry;
  }

  /**
   * @param {!Element} element
   * @return {?VideoEntry}
   */
  getEntryOrNull(element) {
    return element[ENTRY_PROP];
  }

  /** @param {function()} handler */
  onTick(handler) {
    this.tick_ = this.tick_ || new Observable();
    this.tick_.add(handler);

    if (this.tick_.getHandlerCount() == 1) {
      this.startTicking_();
    }
  }

  /**
   * @param {!Element} element
   * @param {!VideoEntry} entry
   * @private
   */
  setEntry_(element, entry) {
    element[ENTRY_PROP] = entry;
  }

  /**
   * @param {!Element} unusedVideo
   * @return {!Promise}
   */
  getAnalyticsDetails(unusedVideo) {
    warnUnimplemented('Video analytics');
    return Promise.resolve();
  }

  /**
   * @param {!AmpElement} video
   * @param {!Observable<boolean>} observable
   */
  delegateAutoplay(video, observable) {
    this.whenRegistered_(video).then(() => {
      const entry = dev().assert(this.getEntryOrNull());
      entry.delegateAutoplay(observable);
    });
  }
}


/**
 * Handler for a registered video component.
 * @visibleForTesting
 */
export class VideoEntry {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!VideoService} videoService
   * @param {!../../../src/video-interface.VideoInterface} video
   */
  constructor(ampdoc, videoService, video) {

    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!VideoService} */
    this.service_ = videoService;

    /** @private @const {!../../../src/video-interface.VideoInterface} */
    this.video_ = video;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private @const {!Object<!VideoFeatures, boolean>} */
    this.disabledFeatures_ = {};
    this.setDisabledFeatures_();
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!VideoService} videoService
   * @param {!../../../src/video-interface.VideoInterface} video
   */
  static create(ampdoc, videoService, video) {
    const entry = new VideoEntry(ampdoc, videoService, video);
    // Called here as opposed to constructor so that tests can stub VideoEntry
    // methods before install.
    entry.install();
    return entry;
  }

  /** @private */
  setDisabledFeatures_() {
    this.video_.element[DISABLED_FEATURES].forEach(feature => {
      dev().assert(feature in VideoFeatures);
      this.disabledFeatures_[feature] = true;
    });
  }

  /**
   * @param {!VideoFeatures} feature
   * @return {boolean}
   * @private
   */
  isDisabled_(feature) {
    return feature in this.disabledFeatures_;
  }

  /** @param {function()} handler */
  onPlaybackTick(handler) {
    this.service_.onTick(() => {
      if (!this.isPlaying_) {
        return;
      }
      handler();
    });
  }

  /** */
  install() {
    const {element} = this.video_;
    const signals = element.signals();

    element.dispatchCustomEvent(VideoEvents.REGISTERED);

    // Unlike events, signals are permanent. We can wait for `REGISTERED` at any
    // moment in the element's lifecycle and the promise will resolve
    // appropriately each time.
    signals.signal(VideoEvents.REGISTERED);

    element.whenBuilt()
        .then(() => this.onBuilt_());

    signals.whenSignal(CommonSignals.LOAD_START)
        .then(() => this.onLoadStart_());
  }

  /**
   * @param {!Observable<boolean>} unusedToObservable
   */
  delegateAutoplay(unusedToObservable) {}

  /** @private */
  onBuilt_() {
    const {element} = this.video_;

    this.registerCommonActions_();
    this.addEventHandlers_();

    element.classList.add('i-amphtml-video-interface');
  }

  /** @private */
  onLoadStart_() {
    this.triggerTimeUpdate_();
  }

  /** @private */
  addEventHandlers_() {
    const {element} = this.video_;

    listen(element, VideoEvents.PAUSE, () => {
      this.isPlaying_ = false;
    });

    listen(element, VideoEvents.PLAYING, () => {
      this.isPlaying_ = true;
    });
  }

  /**
   * Register common actions such as play, pause, etc... so they can be called
   * using AMP Actions, e.g.: `<button on="tap:myVideo.play">`.
   * @private
   */
  registerCommonActions_() {
    const video = this.video_;
    this.registerCommonAction_('play', () => video.play(/* isAuto */ false));
    this.registerCommonAction_('pause', () => video.pause());
    this.registerCommonAction_('mute', () => video.mute());
    this.registerCommonAction_('unmute', () => video.unmute());
    this.registerCommonAction_('fullscreen', () => video.fullscreenEnter());
  }

  /** @private */
  registerCommonAction_(name, callback) {
    const video = this.video_;

    // Only require ActionTrust.LOW for video actions to defer to platform
    // specific handling (e.g. user gesture requirement for unmuted playback).
    const trust = ActionTrust.LOW;

    video.registerAction(name, () => {
      if (!this.isDisabled_(VideoFeatures.ACTIONS)) {
        callback();
        return;
      }
      if (getMode().development) {
        user().warn(TAG, `Action '${name}' is disabled for this element:`,
            this.getElementStr_());
      }
    }, trust);
  }

  /**
   * Triggers a LOW-TRUST timeupdate event consumable by AMP actions if
   * required.
   * Frequency of this event is controlled by VideoService.onTick() and is
   * every second for now.
   * @private
   */
  triggerTimeUpdate_() {
    if (this.isDisabled_(VideoFeatures.ACTIONS)) {
      return;
    }
    this.onPlaybackTick(() => {
      const video = this.video_;
      const time = video.getCurrentTime();
      const duration = video.getDuration();

      if (!isFiniteNumber(time) ||
          !isFiniteNumber(duration) ||
          duration <= 0) {
        return;
      }

      const {win} = this.ampdoc_;
      const {element} = this.video_;
      const actions = Services.actionServiceForDoc(this.ampdoc_);
      const name = 'timeUpdate';
      const percent = time / duration;
      const event = createCustomEvent(win, `${TAG}.${name}`, {time, percent});
      actions.trigger(element, name, event, ActionTrust.LOW);
    });
  }

  /**
   * @return {string}
   * @private
   */
  getElementStr_() {
    const {element} = this.video_;
    const {id} = element;
    return element.tagName.toLowerCase() + (id ? `#${id}` : '');
  }
}


/**
 * @param {string} feature
 * @private
 */
function warnUnimplemented(feature) {
  dev().warn(TAG, `${feature} unimplemented.`);
}


AMP.extension(TAG, 0.1, function(AMP) {
  AMP.registerServiceForDoc('video-service', VideoService);
});
