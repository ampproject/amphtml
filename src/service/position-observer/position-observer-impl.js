/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use baseInstance file except in compliance with the License.
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

import {registerServiceBuilderForDoc} from '../../service';
import {Services} from '../../services';
import {dev} from '../../log';
import {layoutRectLtwh} from '../../layout-rect';
import {debounce} from '../../utils/rate-limit';
import {PositionObserverEntry} from './position-observer-entry';
import {
  PositionObserverFidelity,
  LOW_FIDELITY_FRAME_COUNT,
} from './position-observer-fidelity';

/** @const @private */
const TAG = 'POSITION_OBSERVER';

/** @const @private */
const SCROLL_TIMEOUT = 500;


export class PositionObserver {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!Window} */
    this.win_ = ampdoc.win;

    /** @private {!Array<!PositionObserverEntry>} */
    this.entries_ = [];

    /** @private {!../vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @private {!../viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {Array<function()>} */
    this.unlisteners_ = [];

    /** @private {boolean} */
    this.inScroll_ = false;

    /** @private {boolean} */
    this.measure_ = false;

    /** @private {boolean} */
    this.callbackStarted_ = false;

    /** @private {function()} */
    this.boundStopScroll_ = debounce(this.win_, () => {
      this.inScroll_ = false;
    }, SCROLL_TIMEOUT);
  }

  /**
   * @param {!Element} element
   * @param {PositionObserverFidelity} fidelity
   * @param {function(?./position-observer-entry.PositionInViewportEntryDef)} handler
   */
  observe(element, fidelity, handler) {
    const entry = new PositionObserverEntry(element, fidelity, handler);

    this.entries_.push(entry);

    if (!this.callbackStarted_) {
      this.startCallback_();
    }

    this.callbackStarted_ = true;

    this.updateSingleEntry_(entry);
  }

  /**
   * @param {!Element} element
   */
  unobserve(element) {
    for (let i = 0; i < this.entries_.length; i++) {
      if (this.entries_[i].element == element) {
        this.entries_.splice(i, 1);
        if (this.entries_.length == 0) {
          this.stopCallback_();
          this.callbackStarted_ = false;
        }
        return;
      }
    }
    dev().error(TAG, 'cannot unobserve unobserved element');
  }

  /**
   * Callback function that gets called when start to observe the first element.
   * @private
   */
  startCallback_() {
    // listen to viewport scroll event to help pass determine if need to
    this.unlisteners_.push(this.viewport_.onScroll(() => {
      this.onScrollHandler_();
    }));
    this.unlisteners_.push(this.viewport_.onResize(() => {
      this.onResizeHandler_();
    }));
  }

  /**
   * Callback function that gets called when unobserve last observed element.
   * @private
   */
  stopCallback_() {
    while (this.unlisteners_.length) {
      const unlisten = this.unlisteners_.pop();
      unlisten();
    }
  }

  /**
   * @param {!Element} element
   * @param {PositionObserverFidelity} fidelity
   */
  changeFidelity(element, fidelity) {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      if (entry.element == element) {
        entry.fidelity = fidelity;
        if (fidelity == PositionObserverFidelity.HIGH) {
          entry.turn = 0;
        }
        return;
      }
    }
    dev().error(TAG, 'cannot change fidelity on unobserved element');
  }

  /**
   * This should always be called in vsync.
   * @param {boolean=} opt_force
   * @visibleForTesting
  */
  updateAllEntries(opt_force) {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];

      if (opt_force) {
        this.updateSingleEntry_(entry);
        continue;
      }

      if (entry.turn == 0) {
        this.updateSingleEntry_(entry);
        entry.turn = (entry.fidelity == PositionObserverFidelity.LOW) ?
            LOW_FIDELITY_FRAME_COUNT : 0;
      } else {
        entry.turn--;
      }
    }
  }

  /**
   * To update the position of single element when it is ready.
   * Called when updateAllEntries, or when first observe an element.
   * @param {!./position-observer-entry.PositionObserverEntry} entry
   * @private
   */
  updateSingleEntry_(entry) {
    const viewportSize = this.viewport_.getSize();
    const viewportBox =
        layoutRectLtwh(0, 0, viewportSize.width, viewportSize.height);
    this.viewport_.getBoundingRectAsync(entry.element).then(elementBox => {
      entry.trigger(
      /** @type {./position-observer-entry.PositionInViewportEntryDef}*/ ({
        positionRect: elementBox,
        viewportRect: viewportBox,
        relativePos: '',
      }));
    });
  }

  /**
   * Handle viewport scroll event
   * @private
   */
  onScrollHandler_() {
    this.boundStopScroll_();
    this.inScroll_ = true;
    if (!this.measure_) {
      this.schedulePass_();
    }
  }

  /**
   * Handle viewport resize event
   * @private
   */
  onResizeHandler_() {
    this.updateAllEntries(true);
  }

  /**
   * Update all entries during scroll
   * @private
   */
  schedulePass_() {
    // TODO (@zhouyx, #9208):
    // P1: account for effective fidelity using this.effectiveFidelity
    // P2: do passes on onDomMutation (if available using MutationObserver
    // mostly for in-a-box host, since most DOM mutations are constraint to the
    // AMP elements).
    this.updateAllEntries();
    this.measure_ = true;
    if (!this.inScroll_) {
      // Stop measure if viewport is no longer scrolling
      this.measure_ = false;
      return;
    }
    this.vsync_.measure(() => {
      this.schedulePass_();
    });
  }
}

/**
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installPositionObserverServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'position-observer', () => {
    return new PositionObserver(ampdoc);
  });
}
