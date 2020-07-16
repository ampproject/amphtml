/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {childElement, childElementsByTag} from '../../../src/dom';
import {dev, devAssert} from '../../../src/log';
import {listen, listenOnce} from '../../../src/event-helper';
import {toArray} from '../../../src/types';

const TAG = 'amp-video';

/** @const {!Object<string, number>} */
const BITRATE_BY_EFFECTIVE_TYPE = {
  // We assign low values to 2G in general. None of these will likely be able
  // to stream any bitrates we see in the wild.
  'slow-2g': 50,
  '2g': 50,
  // Commonly found bitrates that should typically fit into the spectrum of
  // these connections. Further tuning may be needed.
  '3g': 1000,
  '4g': 2500,
  '5g': 5000,
};

/** @type {!BitrateManager|undefined} */
let instance;
/**
 * @param {!Window} win
 * @return {!BitrateManager}
 */
export function getBitrateManager(win) {
  if (instance) {
    return instance;
  }
  return (instance = new BitrateManager(win));
}

/**
 * Manages the sources of video elements by bitrate.
 *
 * Expects all sources to have a `data-bitrate` attribute with an integer
 * value in Kilobits/s.
 *
 * Initializes based on the effective connection type. See BITRATE_BY_EFFECTIVE_TYPE
 * for inferred bitrates. Lowers assumed bitrate when a video goes into `waiting`
 * state.
 *
 * Potentially desirable but unsupported features
 * - Does not ever increase the bitrate when things are going well.
 * - Does not persist information across page loads.
 * - Does not re-sort sources of non-playing videos that are already managed.
 */
export class BitrateManager {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const */
    this.win = win;
    /**
     * Init set as a side effect of the this.getAcceptableBitrate_() call
     * @private {string}
     */
    this.effectiveConnectionType_ = '';
    /** @private {number} */
    this.acceptableBitrate_ = this.getAcceptableBitrate_();
  }

  /**
   * Manages bitrate changes for the given video.
   *
   * Callers MUST call `video.changedSources()` synchronously whenever they
   * changed the sources of the video element.
   *
   * @param {!Element} video
   */
  manage(video) {
    onNontrivialWait(video, () => {
      const current = currentSource(video);
      this.acceptableBitrate_ = current.bitrate_ - 1;
      this.switchToLowerBitrate_(video, current.bitrate_);
    });
    video.changedSources = () => {
      this.sortSources_(video);
    };
  }

  /**
   * Returns the effective connection type as reported by the browser.
   * Defaults to `4g` if the browser (notably WebKit) does not report it.
   * @return {string}
   * @private
   */
  getCurrentEffectiveConnectionType_() {
    const {connection} = this.win.navigator;
    if (connection && connection.effectiveType) {
      return connection.effectiveType;
    }
    return '4g'; // Most common nowadays.
  }

  /**
   * Returns the currently known acceptable bitrate for the user.
   * If the effective connection type of the user has changed since we last
   * looked, then this will overrride the result. Otherwise
   * @return {number}
   * @private
   */
  getAcceptableBitrate_() {
    if (
      this.effectiveConnectionType_ != this.getCurrentEffectiveConnectionType_()
    ) {
      this.effectiveConnectionType_ = this.getCurrentEffectiveConnectionType_();
      this.acceptableBitrate_ =
        BITRATE_BY_EFFECTIVE_TYPE[this.effectiveConnectionType_] ||
        BITRATE_BY_EFFECTIVE_TYPE['4g'];
    }
    return this.acceptableBitrate_;
  }

  /**
   * Sorts the sources of the given video element by their bitrates such that
   * the sources closest matching the acceptable bitrate are in front.
   * @param {!Element} video
   */
  sortSources_(video) {
    const sources = toArray(childElementsByTag(video, 'source'));
    // Ensure each element has the bitrate_ property
    sources.forEach((source) => {
      if (source.bitrate_) {
        return;
      }
      const bitrate = source.getAttribute('data-bitrate');
      source.bitrate_ = bitrate
        ? parseInt(bitrate, 10)
        : Number.POSITIVE_INFINITY;
    });
    sources.sort((a, b) => {
      // Biggest first, bitrates above threshold to the back
      return (
        this.getBitrateForComparison_(b) - this.getBitrateForComparison_(a)
      );
    });
    sources.forEach((source) => {
      video.appendChild(source);
    });
  }

  /**
   * Returns the bitrate of a source in such a way that bitrates that are higher
   * than the current acceptable bitrate rank lowest.
   * @param {!Element} source
   * @return {number}
   * @private
   */
  getBitrateForComparison_(source) {
    let rate = source.bitrate_;
    if (rate > this.getAcceptableBitrate_()) {
      // We make bitrates higher than the acceptable rate negative. That means,
      // the higher they are, the further they go in the back.
      rate *= -1;
    }
    return rate;
  }

  /**
   * Returns true if any sources of the video have a lower bitrate than the given
   * bitrate.
   * @param {!Element} video
   * @param {number} bitrate
   * @return {boolean}
   * @private
   */
  hasLowerBitrate_(video, bitrate) {
    const lowerBitrateSource = sources(video, (source) => {
      return source.bitrate_ < bitrate;
    });
    return !!lowerBitrateSource;
  }

  /**
   * Switches the video to use a lower bitrate if available.
   * This should be called if the video is currently in waiting mode.
   * @param {!Element} video
   * @param {number} currentBitrate
   * @private
   */
  switchToLowerBitrate_(video, currentBitrate) {
    if (!this.hasLowerBitrate_(video, currentBitrate)) {
      dev().fine(TAG, 'No lower bitrate available');
      return;
    }
    const {currentTime} = video;
    video.pause();
    this.sortSources_(video);
    video.load();
    listenOnce(video, 'loadedmetadata', () => {
      // Restore currentTime after loading new source.
      video.currentTime = currentTime;
      video.play();
      dev().fine(TAG, 'Playing at lower bitrate %s', video.currentSrc);
    });
  }
}

/**
 * Calls the callback if the video goes into waiting state and does not
 * emerge from it within a short amount of time.
 * @param {!Element} video
 * @param {function()} callback
 */
function onNontrivialWait(video, callback) {
  listen(video, 'waiting', () => {
    let timer = null;
    const unlisten = listenOnce(video, 'playing', () => {
      clearTimeout(timer);
    });
    timer = setTimeout(() => {
      unlisten();
      callback();
    }, 100);
  });
}

/**
 * Returns the source element for which the callback returns true.
 * @param {!Element} video
 * @param {function(!HTMLSourceElement):boolean} fn
 * @return {?HTMLSourceElement}
 */
function sources(video, fn) {
  return /** @type {?HTMLSourceElement} */ (childElement(video, (source) => {
    if (source.tagName != 'SOURCE') {
      return false;
    }
    return fn(/** @type {!HTMLSourceElement} */ (source));
  }));
}

/**
 * Returns the currently active source element of the video.
 * @param {!Element} video
 * @return {!HTMLSourceElement}
 */
function currentSource(video) {
  return devAssert(
    sources(video, (source) => {
      return source.src == video.currentSrc;
    })
  );
}
