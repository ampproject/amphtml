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

import {registerServiceBuilderForDoc} from '../service';
import {Services} from '../services';
import {getMode} from '../mode';
import {dev} from '../log';
import {
  moveLayoutRect,
  layoutRectEquals,
  layoutRectsOverlap,
  layoutRectFromDomRect,
  layoutRectLtwh,
  layoutRectsRelativePos,
} from '../layout-rect';
import {serializeMessage} from '../../src/3p-frame-messaging';
import {parseJson, tryParseJson} from '../../src/json.js';
import {getData} from '../../src/event-helper';
import {Observable} from '../../src/observable';
import {debounce} from '../../src/utils/rate-limit';

/** @const @private */
const TAG = 'POSITION_OBSERVER';

/** @const */
export const SEND_POSITIONS_HIGH_FIDELITY = 'send-positions-high-fidelity';

/** @const */
export const POSITION_HIGH_FIDELITY = 'position-high-fidelity';

/**
 * The positionObserver returned position value which includes the position rect
 * relative to viewport. And viewport rect which always has top 0, left 0, and
 * viewport width and height.
 * @typedef {{
 *  positionRect: ?../layout-rect.LayoutRectDef,
 *  viewportRect: !../layout-rect.LayoutRectDef,
 *  relativePos: string,
 * }}
 */
export let PositionInViewportEntryDef;

/** @enum {number} */
export const PositionObserverFidelity = {
  HIGH: 1,
  LOW: 0,
};

/** @const @private */
const LOW_FIDELITY_FRAME_COUNT = 4;

export class PositionObserver {

  /**
   * @param {!Window} win
   * @param {!./vsync-impl.Vsync} vsync
   * @param {!PosObViewportInfoDef} posObViewportInfo
   */
  constructor(win, vsync, posObViewportInfo) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Array<!Object>} */
    this.entries_ = [];

    /** @private {!./vsync-impl.Vsync} */
    this.vsync_ = vsync;

    /** @private {!./viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {Array<function()>} */
    this.unlisteners_ = [];

    /** @private {boolean} */
    this.inScroll_ = false;

    /** @private {boolean} */
    this.measure_ = false;

    /** @private {function()} */
    this.boundStopScroll_ = debounce(this.win_, () => {
      this.inScroll_ = false;
    }, 500);

    /** @private {boolean} */
    this.needRefreshOnMessage_ = false;
  }

  /**
   * @param {!Element} element
   * @param {PositionObserverFidelity} fidelity
   * @param {function(PositionInViewportEntryDef)} handler
   */
  observe(element, fidelity, handler) {
    const entry = new PositionObserverEntry(element, fidelity, handler);

    this.entries_.push(entry);

    if (this.entries_.length == 1) {
      this.startCallback();
    }

    this.vsync_.measure(() => {
      this.updateSingleEntry(entry);
    });
  }

  /**
   * @param {!Element} element
   */
  unobserve(element) {
    for (let i = 0; i < this.entries_.length; i++) {
      if (this.entries_[i].element == element) {
        this.entries_[i].handler = null;
        this.entries_.splice(i, 1);
        if (this.entries_.length == 0) {
          this.stopCallback();
        }
        return;
      }
    }
    dev().error(TAG, 'cannot unobserve unobserved element');
  }

  /**
   * Callback function that gets called when start to observe the first element.
   * Should be override by sub class.
   */
  startCallback() {
    this.viewport_.connect();
    // listen to viewport scroll event to help pass determine if need to
    this.unlisteners_.push(this.viewport_.onScroll(() => {
      this.onScrollHandler();
    }));
    this.unlisteners_.push(this.viewport_.onResize(() => {
      this.onResizeHandler();
    }));
    this.unlisteners_.push(this.viewport_.onHostMessage(event => {
      this.onHostMessageHandler(event);
    }));
  }

  /**
   * Callback function that gets called when unobserve last observed element.
   * Should be override by sub class.
   */
    /* @override */
  stopCallback() {
    this.viewport_.disconnect();
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
   * @param {boolean=} force
   * @param {boolean=} opt_remeasure
   * @visibleForTesting
  */
  updateAllEntries(force, opt_remeasure) {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      if (opt_remeasure) {
        entry.element.inIframePositionRect = null;
      }
      if (!force && entry.turn != 0) {
        // Not ready for their turn yet.
        entry.turn--;
        continue;
      }
      // Reset entry.turn value.
      if (!force) {
        if (entry.fidelity == PositionObserverFidelity.LOW) {
          entry.turn = LOW_FIDELITY_FRAME_COUNT;
        }
      }
      this.updateSingleEntry(entry);
    }
  }

  /** @param {!Object} entry */
  updateSingleEntry(entry) {
    if (this.needRefreshOnMessage_) {
      entry.element.inIframePositionRect = null;
    }

    const elementBox =
        this.viewport_.getLayoutRect(entry.element);

    const viewportSize = this.viewport_.getSize();
    if (!elementBox || !viewportSize) {
      // Viewport is not ready yet.
      return;
    }
    const viewportBox =
        layoutRectLtwh(0, 0, viewportSize.width, viewportSize.height);

    // Return { positionRect: <LayoutRectDef>, viewportRect: <LayoutRectDef>}
    entry.trigger(/** @type {PositionInViewportEntryDef}*/ ({
      positionRect: elementBox,
      viewportRect: viewportBox,
    }));
  }

  /**
   * Handle viewport scroll event
   */
  onScrollHandler() {
    this.needRefreshOnMessage_ = true;
    this.boundStopScroll_();
    this.inScroll_ = true;
    if (!this.measure_) {
      this.schedulePass_();
    }
  }

  /**
   * Handle viewport resize event
   */
  onResizeHandler() {
    this.needRefreshOnMessage_ = true;
    this.vsync_.measure(() => {
      this.updateAllEntries(true);
    });
  }

  /**
   * Handle position info message from host window
   * @param {!Event} event
   */
  onHostMessageHandler(event) {
    if (event.source != this.win_.parent || typeof getData(event) != 'string' ||
        dev().assertString(getData(event)).indexOf('amp-') != 0) {
      return;
    }
    // Parse JSON only once per message.
    const data = parseJson(
        dev().assertString(getData(event)).substr(4));
    if (data['sentinel'] != this.viewport_.getSentinel()) {
      return;
    }

    if (data['type'] != POSITION_HIGH_FIDELITY) {
      return;
    }
    const iframePosition = data;

    this.viewport_.storeIframePosition(iframePosition);

    // do this in vsyn.measure
    this.vsync_.measure(() => {
      this.updateAllEntries();
    });
  }

  /**
   * Update all entries during scroll
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
    this.vsync_.measure(() => {
      this.updateAllEntries();
      this.schedulePass_();
    });
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installPositionObserverServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'position-observer', () => {
    let viewportInfo;
    const vsync = Services.vsyncFor(ampdoc.win);
    if (getMode(ampdoc.win).runtime == 'inabox') {
      viewportInfo = new PosObViewportInfoInabox(ampdoc);
    } else {
      viewportInfo = new PosObViewportInfoAmpDoc(ampdoc);
    }
    return new PositionObserver(ampdoc.win, vsync, viewportInfo);
  });
}


/**
 * @interface
 */
export class PosObViewportInfoDef {
  connect() {}

  disconnect() {}

  /**
   * @param {function()} unusedCallback
   * @return {function()}
   */
  onScroll(unusedCallback) {}

  /**
   * @param {function()} unusedCallback
   * @return {function()}
   */
  onResize(unusedCallback) {}

  /**
   * @param {function(?)} unusedCallback
   * @return {function()}
   */
  onHostMessage(unusedCallback) {

  }

  /**
   * Returns the size of top window viewport.
   * @return {?{width: number, height: number}}
   */
  getSize() {}

  /**
   * Returns the rect of the element to the top window viewport.
   * @param {!Element} unusedElement
   * @return {?../layout-rect.LayoutRectDef}
   */
  getLayoutRect(unusedElement) {}

  /**
   * TODO: Use iframeClient to make request. remove
   * @return {string}
   */
  getSentinel() {}


  storeIframePosition(unusedPosition) {}
}

/**
 * @implements {PosObViewportInfoDef}
 * @visibleForTesting
 */
export class PosObViewportInfoAmpDoc {
  constructor(ampdoc) {
    this.ampdoc = ampdoc;
    this.viewport_ = Services.viewportForDoc(ampdoc);
  }

  connect() {}

  disconnect() {}

  /**
   * @param {function()} callback
   * @return {function()}
   */
  onScroll(callback) {
    return this.viewport_.onScroll(callback);
  }

  /**
   * @param {function()} callback
   * @return {function()}
   */
  onResize(callback) {
    return this.viewport_.onResize(callback);
  }

  /**
   * @param {function(?)} unusedCallback
   * @return {function()}
   */
  onHostMessage(unusedCallback) {
    // return unused unlisten function;
    return () => {};
  }

  getSize() {
    return this.viewport_.getSize();
  }

  getLayoutRect(element) {
    //return this.viewport_.getLayoutRect(element);
    return layoutRectFromDomRect(
        element./*OK*/getBoundingClientRect());
  }

  getSentinel() {}

  storeIframePosition(unusedPosition) {}
}

/**
 * @implements {PosObViewportInfoDef}
 */
class PosObViewportInfoInabox {
  constructor(ampdoc) {
    this.ampdoc = ampdoc;
    this.win_ = ampdoc.win;
    this.viewport_ = Services.viewportForDoc(ampdoc);
    this.onMessageReceivedObservers_ = new Observable();
    this.boundOnMessageEventListener_ =
        event => this.onMessageReceivedObservers_.fire(event);
    this.viewportBox_ = null;
    this.iframePosition_ = null;
    this.sentinel = null;
  }

  connect() {
    this.win_.addEventListener('message', this.boundOnMessageEventListener_);
    const object = {};
    const dataObject = tryParseJson(this.win_.name);
    if (dataObject) {
      this.sentinel = dataObject['_context']['sentinel'];
    }
    object.type = SEND_POSITIONS_HIGH_FIDELITY;
    this.win_.parent./*OK*/postMessage(serializeMessage(
        SEND_POSITIONS_HIGH_FIDELITY, this.sentinel),
        '*'
    );
  }

  disconnect() {
    this.win_.removeEventListener('message', this.boundOnMessageEventListener_);
  }

  /**
   * @param {function()} callback
   * @return {function()}
   */
  onScroll(callback) {
    return this.viewport_.onScroll(callback);
  }

  /**
   * @param {function(?)} callback
   * @return {function()}
   */
  onResize(callback) {
    return this.viewport_.onResize(callback);
  }

  /**
   * @param {function(?)} callback
   * @return {function()}
   */
  onHostMessage(callback) {
    return this.onMessageReceivedObservers_.add(callback);
  }

  getSize() {
    return this.viewportBox_;
  }

  getLayoutRect(element) {
    if (!this.iframePosition_) {
      // If not receive iframe position from host, or if iframe is outside vp
      return null;
    }
    if (!element.inIframePositionRect) {
      // Not receive element position in iframe from ampDocPositionObserver
      element.inIframePositionRect = element./*OK*/getBoundingClientRect();
    }

    const iframeBox = this.iframePosition_;
    const elementBox = element.inIframePositionRect;
    return moveLayoutRect(elementBox, iframeBox.left, iframeBox.top);
  }

  getSentinel() {
    return this.sentinel;
  }

  storeIframePosition(iframePosition) {
    this.iframePosition_ = iframePosition && iframePosition.positionRect;
    this.viewportBox_ = iframePosition && iframePosition.viewportRect;
  }
}


class PositionObserverEntry {
  constructor(element, fidelity, handler) {
    this.element = element;
    this.handler_ = handler;
    this.fidelity = fidelity;
    this.turn = (fidelity == PositionObserverFidelity.LOW) ?
        Math.floor(Math.random() * LOW_FIDELITY_FRAME_COUNT) : 0;
    this.position = null;
  }

  trigger(position) {
    const prePos = this.position;
    if (prePos
        && layoutRectEquals(prePos.positionRect, position.positionRect)
        && layoutRectEquals(prePos.viewportRect, position.viewportRect)) {
      // position doesn't change, do nothing.
      return;
    }

    // Add the relative position of the element to its viewport
    position.relativePos = layoutRectsRelativePos(
        position.positionRect, position.viewportRect
    );
    if (layoutRectsOverlap(position.positionRect, position.viewportRect)) {
      // Update position
      this.position = position;
      // Only call handler if entry element overlap with viewport.
      try {
        this.handler_(position);
      } catch (err) {
        // TODO(@zhouyx, #9208) Throw error.
      }
    } else if (this.position) {
      // Need to notify that element gets outside viewport
      // NOTE: This is required for inabox position observer.
      this.position = null;
      position.positionRect = null;
      try {
        this.handler_(position);
      } catch (err) {
        // TODO(@zhouyx, #9208) Throw error.
      }
    }
  }
}
