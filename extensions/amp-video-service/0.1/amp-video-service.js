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

import {dev} from '../../../src/log';


/** @private @const {string} */
const TAG = 'amp-video-service';


/** @private @const {string} */
const ENTRY_PROP = '__AMP_VIDEO_ENTRY__';


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
 * {@see ../../../src/service/video-service-impl.VideoService}. That should be
 * used by consumers of the APIs exposed here.
 *
 * If you need to add methods to this class that are public to components,
 * it's most likely that you'll want to implement them here and set wrappers for
 * them in the runtime-level service class.
 */
export class VideoService {

  /** @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
  }

  /** @param {!../../../src/video-interface.VideoInterface} video */
  register(video) {
    const {element} = video;

    if (this.getEntryOrNull(element)) {
      return dev().assert(this.getEntryOrNull_(element));
    }

    if (!impl.supportsPlatform()) {
      return null;
    }

    const entry = VideoEntry.create(this.ampdoc_, video, this);

    entry.install();
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

  /**
   * @param {!Element} element
   * @param {!VideoEntry} entry
   * @private
   */
  setEntry_(element, entry) {
    element[ENTRY_PROP] = entry;
  }

  /**
   * @param {!Element} video
   * @return {!Promise}
   */
  getAnalyticsDetails(video) {
    if (!this.getEntryOrNull(video)) {
      dev().warn(TAG, 'Analytics requested, but no video entry found.');
      return Promise.resolve();
    }
    return dev().assert(this.getEntryOrNull(video)).getAnalyticsDetails();
  }

  /**
   * @param {!AmpElement} video
   * @param {!../../../src/observable.Observable<boolean>} unusedObservable
   */
  delegateAutoplay(video, unusedObservable) {
    warnUnimplemented('Autoplay delegation');
  }
}


/** @visibleForTesting */
export class VideoEntry {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../../src/video-interface.VideoInterface} video
   * @param {!../../../src/observable.ObservableInterface} scrollObservable
   */
  constructor(ampdoc, video, scrollObservable) {

    /** @private @const{!../../../src/service/ampdoc-impl.AmpDoc} */
    // TODO(alanorozco): Type
    this.ampdoc_ = ampdoc;

    /** @private @const{!../../../src/video-interface.VideoInterface} */
    // TODO(alanorozco): Type
    this.video_ = video;

    /** @private @const {!../../../src/observable.ObservableInterface} */
    // TODO(alanorozco): Type
    this.scrollObservable_ = scrollObservable;

    /** @private @const {!LazyObservable<boolean>} */
    this.autoplayObservable_ =
        new LazyObservable(() => this.installVisibilityListener_());

    /** @private @const {!<./video-behaviors.VideoBehavior>} */
    this.autoplay_ = null;

    /** @private @const {!<./video-behaviors.VideoBehavior>} */
    this.behaviors_ = [];
  }

  install() {
    this.video_.element.whenBuilt().then(() => {
      this.onBuilt_();
    });
  }

  /**
   * @return {!Promise<!../../..src/video-interface.VideoAnalyticsDetailsDef>}
   */
  getAnalyticsDetails() {
    return Promise.all(this.behaviors_.map(b => b.getAnalyticsDetails()))
      .then(result =>
        Object.assign.apply(null, [{
          'currentTime': video.getCurrentTime(),
          'duration': video.getDuration(),
          // TODO(cvializ): add fullscreen
          'height': height,
          'id': video.element.id,
          'muted': this.muted_,
          'playedTotal': playedTotal,
          'playedRangesJson': JSON.stringify(playedRanges),
          'state': this.getPlayingState(),
          'width': width,
          // To be overriden, setting a default value for interface conformance.
          'autoplay': false,
        };
      }].concat(result)));
  }

  getAutoplayObservable() {
    return this.autoplayObservable_;
  }

  delegateAutoplay(observable) {
    if (this.autoplay_) {
      this.autoplay_.delegate(observable);
    }
    this.autoplayObservable_ = observable;
  }

  /**
   * Register common actions such as play, pause, etc... so they can be called
   * using AMP Actions, e.g.: `<button on="tap:myVideo.play">`.
   * @private
   */
  registerCommonActions_() {
    warnUnimplemented('Common actions');
  }

  /** @private */
  onBuilt_() {
    const {element} = this.video;

    video.loadPromise(element)
        .then(() => this.onLoaded_());

    this.registerCommonActions_();

    this.installBehaviors_();

    element.classList.add('i-amphtml-video-interface');

    this.unlisteners_.push(
        listen(element, VideoEvents.RELOAD, () => this.onLoaded_()),
        listen(element, VideoEvents.PAUSE, () => {
          this.isPlaying_ = false;
        }),
        listen(element, VideoEvents.PLAYING, () => {
          this.isPlaying_ = true;
        }));
  }

  installBehaviors_() {
    const {win} = this.ampdoc_;

    if (Autoplay.shouldBeEnabledFor(this.video_)) {
      this.autoplay_ = Autoplay.create(win, this.impl_, this);
      this.behaviors_.push(this.autoplay_);
    }
  }

  /** @private */
  onLoaded_() {
    this.isLoaded_ = true;

    this.loadObservable_.fire();

    this.maybeUpdateVisibility_();

    if (this.isVisible_) {
      this.onVisibilityChanged_();
    }
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
