/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {expandFrame, collapseFrame} from './frame-overlay-helper';


/**
 * Inabox host manager for full overlay frames.
 */
export class FrameOverlayManager {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.isExpanded_ = false;

    /** @private {boolean} */
    this.viewportChangedSinceExpand_ = false;

    // TODO(alanorozco): type
    /** @private {?} */
    this.collapsedRect_ = null;

    this.listenToViewportChanges_();
  }

  /** @private */
  listenToViewportChanges_() {
    this.win_.addEventListener('resize', () => this.onWindowResize());
  }

  /** @visibleForTesting */
  onWindowResize() {
    if (this.isExpanded_) {
      this.viewportChangedSinceExpand_ = true;
    }
  }

  /**
   * Expands an iframe to full overlay.
   * @param {!HTMLIFrameElement} iframe
   * @param {!Function} callback Gets executed when expanded with the new box
   *  rect.
   */
  expandFrame(iframe, callback) {
    expandFrame(this.win_, iframe, (collapsedRect, expandedRect) => {
      this.isExpanded_ = true;
      this.viewportChangedSinceExpand_ = false;
      this.collapsedRect_ = collapsedRect;
      callback(expandedRect);
    });
  }

  /**
   * Collapses an iframe back from full overlay.
   * @param {!HTMLIFrameElement} iframe
   * @param {!Function} callback Gets executed when collapsed with the new box
   *  rect.
   */
  collapseFrame(iframe, callback) {
    // There is a delay of one animation frame between collapsing and measuring
    // the box rect. collapseFrame() takes a callback for each event.
    //
    // We know what the collapsed box was. If the viewport has not changed while
    // expanded, we can immediately notify the consumer of the collapsed
    // box rect since it should be the same. Otherwise, we wait for remeasure.
    collapseFrame(this.win_, iframe, () => {
      this.isExpanded_ = false;

      if (!this.viewportChangedSinceExpand_) {
        callback(this.collapsedRect_);
      }
    }, collapsedRect => {
      this.collapsedRect_ = collapsedRect;

      if (this.viewportChangedSinceExpand_) {
        callback(this.collapsedRect_);
      }
    });
  }
}
