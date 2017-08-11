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
import {parseJson} from '../../json.js';
import {getData} from '../../event-helper';
import {debounce} from '../../utils/rate-limit';
import {MessageType} from '../../3p-frame-messaging';
import {PositionObserverEntry} from './position-observer-entry';
import {
  PosObAmpdocHostInterface,
} from './position-observer-host-interface';
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
   * @param {!Window} win
   * @param {!../vsync-impl.Vsync} vsync
   * @param {!./position-observer-host-interface.PosObHostInterfaceDef} host
   */
  constructor(win, vsync, host) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Array<!PositionObserverEntry>} */
    this.entries_ = [];

    /** @private {!../vsync-impl.Vsync} */
    this.vsync_ = vsync;

    /** @private {!./position-observer-host-interface.PosObHostInterfaceDef} */
    this.host_ = host;

    /** @private {Array<function()>} */
    this.unlisteners_ = [];

    /** @private {boolean} */
    this.inScroll_ = false;

    /** @private {boolean} */
    this.measure_ = false;

    /** @private {function()} */
    this.boundStopScroll_ = debounce(this.win_, () => {
      this.inScroll_ = false;
    }, SCROLL_TIMEOUT);

    /** @private {boolean} */
    this.needRefreshInIframePos_ = false;
  }

  /**
   * @param {!Element} element
   * @param {PositionObserverFidelity} fidelity
   * @param {function(?./position-observer-entry.PositionInViewportEntryDef)} handler
   */
  observe(element, fidelity, handler) {
    const entry = new PositionObserverEntry(element, fidelity, handler);

    this.entries_.push(entry);

    if (this.entries_.length == 1) {
      this.startCallback_();
    }

    this.vsync_.measure(() => {
      this.updateSingleEntry_(entry);
    });
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
    this.host_.connect();
    // listen to viewport scroll event to help pass determine if need to
    this.unlisteners_.push(this.host_.onScroll(() => {
      this.onScrollHandler_();
    }));
    this.unlisteners_.push(this.host_.onResize(() => {
      this.onResizeHandler_();
    }));
    this.unlisteners_.push(this.host_.onHostMessage(event => {
      this.onHostMessageHandler_(event);
    }));
  }

  /**
   * Callback function that gets called when unobserve last observed element.
   * @private
   */
  stopCallback_() {
    this.host_.disconnect();
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
      if (this.needRefreshInIframePos_) {
        entry.inIframePositionRect = null;
      }

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
    this.needRefreshInIframePos_ = false;
  }

  /**
   * To update the position of single element.
   * Called when updateAllEntries, or when first observe an element.
   * @param {!./position-observer-entry.PositionObserverEntry} entry
   * @private
   */
  updateSingleEntry_(entry) {
    const elementBox =
        this.host_.getLayoutRect(entry);

    const viewportSize = this.host_.getSize();
    if (!elementBox || !viewportSize) {
      // Viewport is not ready yet.
      return;
    }
    const viewportBox =
        layoutRectLtwh(0, 0, viewportSize.width, viewportSize.height);

    // Return { positionRect: <LayoutRectDef>, viewportRect: <LayoutRectDef>}
    entry.trigger(
      /** @type {./position-observer-entry.PositionInViewportEntryDef}*/ ({
        positionRect: elementBox,
        viewportRect: viewportBox,
        relativePos: '',
      }));
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
    this.needRefreshInIframePos_ = true;
    this.vsync_.measure(() => {
      this.updateAllEntries(true);
    });
  }

  /**
   * Handle position info message from host window
   * @param {!Event} event
   * @private
   */
  onHostMessageHandler_(event) {
    if (event.source != this.win_.parent || typeof getData(event) != 'string' ||
        dev().assertString(getData(event)).indexOf('amp-') != 0) {
      return;
    }
    // Parse JSON only once per message.
    const data = parseJson(
        dev().assertString(getData(event)).substr(4));
    if (data['sentinel'] != this.host_.getSentinel()) {
      return;
    }

    if (data['type'] != MessageType.POSITION_HIGH_FIDELITY) {
      return;
    }

    const iframePosition = data;

    this.host_.storeIframePosition(iframePosition);

    // do this in vsyn.measure
    this.vsync_.measure(() => {
      this.updateAllEntries(true);
    });
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
    this.measure_ = true;
    if (!this.inScroll_) {
      // Stop measure if viewport is no longer scrolling
      this.measure_ = false;
      return;
    }
    this.needRefreshInIframePos_ = true;
    this.vsync_.measure(() => {
      this.updateAllEntries();
      this.schedulePass_();
    });
  }
}

/**
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installPositionObserverServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'position-observer', () => {
    const vsync = Services.vsyncFor(ampdoc.win);
    const host = new PosObAmpdocHostInterface(ampdoc);
    return new PositionObserver(ampdoc.win, vsync, host);
  });
}
