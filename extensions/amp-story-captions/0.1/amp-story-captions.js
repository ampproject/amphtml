/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-story-captions-0.1.css';
import {TrackRenderer} from './track-renderer';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listen} from '../../../src/event-helper';
import {toArray} from '../../../src/core/types/array';

export class AmpStoryCaptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?HTMLVideoElement} */
    this.video_ = null;

    /** @private {?UnlistenDef} */
    this.textTracksChangeUnlistener_ = null;

    /** @private {!Array<!TrackRenderer>} */
    this.trackRenderers_ = [];
  }

  /** @override */
  buildCallback() {
    this.container_ = this.element.ownerDocument.createElement('div');
    this.element.appendChild(this.container_);
    this.applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Attaches caption rendering to a video element. Called from amp-video.
   * @param {!HTMLVideoElement} video
   */
  setVideoElement(video) {
    if (this.textTracksChangeUnlistener_) {
      this.textTracksChangeUnlistener_();
    }

    this.video_ = video;

    this.updateTracks_();
    this.textTracksChangeUnlistener_ = listen(
      video.textTracks,
      'change',
      () => {
        this.updateTracks_();
      }
    );
  }

  /** Creates new track renderers for current textTracks. */
  updateTracks_() {
    while (this.trackRenderers_.length) {
      this.trackRenderers_.pop().dispose();
    }

    toArray(this.video_.textTracks).forEach((track) => {
      // Render both showing and hidden, because otherwise we would need to remember when we set it to hidden.
      // Disabled tracks are ignored.
      if (track.mode === 'showing' || track.mode === 'hidden') {
        track.mode = 'hidden';
        this.trackRenderers_.push(
          new TrackRenderer(this.video_, track, this.container_)
        );
      }
    });
  }
}

AMP.extension('amp-story-captions', '0.1', (AMP) => {
  AMP.registerElement('amp-story-captions', AmpStoryCaptions, CSS);
});
