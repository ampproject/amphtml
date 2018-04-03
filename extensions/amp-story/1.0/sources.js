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

import {ampMediaElementFor} from './utils';
import {removeElement} from '../../../src/dom';



export class Sources {
  /**
   * @param {?string=} opt_srcAttr The 'src' attribute of the media element.
   * @param {?IArrayLike<!Element>=} opt_srcEls Any child <source> tags of the
   *     media element.
   * @param {?IArrayLike<!Element>=} opt_trackEls Any child <track> tags of the
   *     media element.
   */
  constructor(opt_srcAttr, opt_srcEls, opt_trackEls) {
    /** @private @const {?string} */
    this.srcAttr_ = opt_srcAttr && opt_srcAttr.length ? opt_srcAttr : null;

    /** @private @const {!IArrayLike<!Element>} */
    this.srcEls_ = opt_srcEls || [];

    /** @private @const {!IArrayLike<!Element>} */
    this.trackEls_ = opt_trackEls || [];
  }


  /**
   * Applies track tags to a specified element. This is done in a separate
   * method from the source tags, because we must wait for "loadedmetadata"
   * video event before doing this.
   * @param {!HTMLMediaElement} element The element to adopt the text tracks
   *     represented by this object.
   * @private
   */
  applyTracksToElement_(element) {
    Array.prototype.forEach.call(this.trackEls_, trackEl => {
      const track = document.createElement('track');
      track.id = trackEl.id;
      track.kind = trackEl.kind;
      track.label = trackEl.label;
      track.srclang = trackEl.srclang;
      track.default = trackEl.default;
      track.src = trackEl.src;
      track.addEventListener('load', () => {
        track.mode = 'showing';
        element.textTracks[0].mode = 'showing';
      });
      element.appendChild(track);
    });
  }


  /**
   * Applies the src attribute and source tags to a specified element.
   * @param {!HTMLMediaElement} element The element to adopt the sources
   *     represented by this object.
   */
  applyToElement(element) {
    Sources.removeFrom(element);

    if (!this.srcAttr_) {
      element.removeAttribute('src');
    } else {
      element.setAttribute('src', this.srcAttr_);
    }

    Array.prototype.forEach.call(this.srcEls_,
        srcEl => element.appendChild(srcEl));

    if (this.trackEls_.length > 0) {
      // Wait for "loadedmetadata" before adding tracks.
      // Firefox adds tracks, but does not toggle them on unless video metadata
      // is loaded first.
      if (element.readyState >= 1 /* HAVE_METADATA */) {
        this.applyTracksToElement_(element);
      } else {
        const addTracksHandler = () => {
          element.removeEventListener('loadedmetadata', addTracksHandler);
          this.applyTracksToElement_(element);
        };

        element.addEventListener('loadedmetadata', addTracksHandler);
      }
    }
  }


  /**
   * Removes and returns the sources from a specified element.
   * @param {!Element} element The element whose sources should be removed and
   *     returned.
   * @return {!Sources} An object representing the sources of the specified
   *     element.
   */
  static removeFrom(element) {
    const elementToUse = ampMediaElementFor(element) || element;
    const srcAttr = elementToUse.getAttribute('src');
    elementToUse.removeAttribute('src');

    const srcEls = elementToUse.querySelectorAll('source');
    Array.prototype.forEach.call(srcEls, srcEl => removeElement(srcEl));

    const trackEls = elementToUse.querySelectorAll('track');
    Array.prototype.forEach.call(trackEls, trackEl => removeElement(trackEl));

    return new Sources(srcAttr, srcEls, trackEls);
  }
}
