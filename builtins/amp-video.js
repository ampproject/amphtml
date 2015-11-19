/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {BaseElement} from '../src/base-element';
import {assertHttpsUrl} from '../src/url';
import {getLengthNumeral, isLayoutSizeDefined} from '../src/layout';
import {loadPromise} from '../src/event-helper';
import {registerElement} from '../src/custom-element';
import {setStyles} from '../src/style';


/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export function installVideo(win) {
  class AmpVideo extends BaseElement {

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    layoutCallback() {
      const width = this.element.getAttribute('width');
      const height = this.element.getAttribute('height');
      const video = document.createElement('video');
      if (!video.play) {
        this.toggleFallback(true);
        return Promise.resolve();
      }

      if (this.element.getAttribute('src')) {
        assertHttpsUrl(this.element.getAttribute('src'), this.element);
      }
      this.propagateAttributes(
          ['src', 'controls', 'autoplay', 'muted', 'loop', 'poster'],
          video);
      video.width = getLengthNumeral(width);
      video.height = getLengthNumeral(height);
      this.applyFillContent(video, true);
      this.getRealChildNodes().forEach(child => {
        if (child.getAttribute && child.getAttribute('src')) {
          assertHttpsUrl(child.getAttribute('src'), child);
        }
        video.appendChild(child);
      });
      this.element.appendChild(video);

      /** @private {?HTMLVideoElement} */
      this.video_ = video;
      setStyles(video, {visibility: 'hidden'});
      return loadPromise(video).then(() => {
        setStyles(video, {visibility: ''});
      });
    }

    /** @override */
    documentInactiveCallback() {
      if (this.video_) {
        this.video_.pause();
      }
      // No need to do layout later - user action will be expect to resume
      // the playback.
      return false;
    }
  }

  registerElement(win, 'amp-video', AmpVideo);
}
