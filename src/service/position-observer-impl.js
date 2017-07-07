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
import {viewportForDoc, vsyncFor} from '../services';
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

class AbstractPositionObserver {

  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Array<!Object>} */
    this.entries_ = [];

    /** @private {!./vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(ampdoc.win);

    /** @private {!./viewport-impl.Viewport} */
    this.viewport_ = viewportForDoc(ampdoc);

  }

  /**
   * @param {!Element} element
   * @param {PositionObserverFidelity} fidelity
   * @param {function(PositionInViewportEntryDef)} handler
   */
  observe(element, fidelity, handler) {
    // TODO(@zhouyx, #9208) make entry into a class
    const entry = {
      element,
      handler,
      fidelity,
      position: null,
      turn: (fidelity == PositionObserverFidelity.LOW) ?
          Math.floor(Math.random() * LOW_FIDELITY_FRAME_COUNT) : 0,
      trigger(position) {
        const prePos = entry.position;

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
          entry.position = position;
          // Only call handler if entry element overlap with viewport.
          try {
            entry.handler(position);
          } catch (err) {
            // TODO(@zhouyx, #9208) Throw error.
          }
        } else if (entry.position) {
          // Need to notify that element gets outside viewport
          // NOTE: This is required for inabox position observer.
          entry.position = null;
          position.positionRect = null;
          try {
            entry.handler(position);
          } catch (err) {
            // TODO(@zhouyx, #9208) Throw error.
          }
        }
      },
    };

    this.entries_.push(entry);

    if (this.entries_.length == 1) {
      this.startCallback();
    }

    this.vsync_.measure(() => {
      this.updateEntryPosition(entry);
    });
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

  /** @param {!Object} unusedEntry */
  updateEntryPosition(unusedEntry) {}

  /**
   * Callback function that gets called when start to observe the first element.
   * Should be override by sub class.
   */
  startCallback() {}

  /**
   * Callback function that gets called when unobserve last observed element.
   * Should be override by sub class.
   */
  stopCallback() {}
}

/** The implementation of the positionObserver for an ampdoc */
export class AmpDocPositionObserver extends AbstractPositionObserver {

  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {

    super(ampdoc);

    /** @private {boolean} */
    this.inScroll_ = false;

    /** @private {boolean} */
    this.measure_ = false;

    /** @private {number} */
    this.scrollTimer_ = Date.now();

    /** @private {Array<function()>} */
    this.unlisteners_ = [];
  }

  /* @override */
  startCallback() {
    // listen to viewport scroll event to help pass determine if need to
    const stopScroll = () => {
      const timeDiff = Date.now() - this.scrollTimer_;
      if (timeDiff < 500) {
        // viewport scroll in the last 500 ms, wait
        return;
      }
      // assume scroll stops, if no scroll event in the last 500,
      this.inScroll_ = false;
    };
    let timeout = null;
    this.unlisteners_.push(this.viewport_.onScroll(() => {
      this.inScroll_ = true;
      this.scrollTimer_ = Date.now();
      this.schedulePass_();
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(stopScroll.bind(this), 500);
    }));
    this.unlisteners_.push(this.viewport_.onChanged(() => {
      // TODO (@zhouyx, #9208): Consider doing this only when event.relayoutAll
      // is true.
      this.vsync_.measure(() => {
        this.pass_(true);
      });
    }));
  }

  /* @override */
  stopCallback() {
    while (this.unlisteners_.length) {
      const unlisten = this.unlisteners_.pop();
      unlisten();
    }
  }

  /** @param {boolean=} recursive */
  schedulePass_(recursive) {
    // TODO (@zhouyx, #9208): remove the duplicate recursive and this.measure_
    // P1: account for effective fidelity using this.effectiveFidelity
    // P2: do passes on onDomMutation (if available using MutationObserver
    // mostly for in-a-box host, since most DOM mutations are constraint to the
    // AMP elements).
    if (!recursive && this.measure_) {
      // call of schedulePass_ from viewport onScroll
      // Do nothing if currently measure with calling schedulePass recursively
      return;
    }
    this.measure_ = true;
    if (!this.inScroll_) {
      // not in scroll, do not need to measure
      this.measure_ = false;
      return;
    }
    this.vsync_.measure(() => {
      this.pass_();
      this.schedulePass_(true);
    });
  }

  /**
   * This should always be called in vsync.
   * @param {boolean=} force
   * @private
  */
  pass_(force) {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
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

      this.updateEntryPosition(entry);
    }
  }

  /**
   * Should always be called in vsync.
   * @override
   */
  updateEntryPosition(entry) {
    // get layoutBoxes relative to doc.
    const elementBox = layoutRectFromDomRect(
        entry.element./*OK*/getBoundingClientRect());

    const viewportSize = this.viewport_.getSize();
    const viewportBox =
        layoutRectLtwh(0, 0, viewportSize.width, viewportSize.height);

    // Return { positionRect: <LayoutRectDef>, viewportRect: <LayoutRectDef>}
    entry.trigger(/** @type {PositionInViewportEntryDef}*/ ({
      positionRect: elementBox,
      viewportRect: viewportBox,
    }));
  }
}

/** The implementation of the positionObserver for inabox */
export class InaboxAmpDocPositionObserver extends AbstractPositionObserver {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    super(ampdoc);

    /** @private {!AmpDocPositionObserver} */
    this.positionObserver_ = new AmpDocPositionObserver(ampdoc);

    // TODO(@zhouyx, #9208) support fidelity
    this.effectiveFidelity_ = PositionObserverFidelity.LOW;

    /** @private {?PositionInViewportEntryDef} */
    this.iframePosition_ = null;

    /** @private {?function()} */
    this.unlistenHost_ = null;
  }

  /** @override */
  observe(element, fidelity, handler) {
    super.observe(element, fidelity, handler);
    this.positionObserver_.observe(element, fidelity, position => {
      element.inIframePositionRect = position.positionRect;
    });
  }

  /** @override */
  unobserve(element) {
    super.unobserve(element);
    this.positionObserver_.unobserve(element);
  }

  /** @override */
  startCallback() {
    // TODO(@zhouyx, #9208) Remove all of them
    const object = {};
    const dataObject = tryParseJson(this.ampdoc_.win.name);
    let sentinel = null;
    if (dataObject) {
      sentinel = dataObject['_context']['sentinel'];
    }
    const win = this.ampdoc_.win;
    object.type = SEND_POSITIONS_HIGH_FIDELITY;
    this.ampdoc_.win.parent./*OK*/postMessage(serializeMessage(
        SEND_POSITIONS_HIGH_FIDELITY, sentinel),
        '*'
    );

    this.ampdoc_.win.addEventListener('message', event => {
    // Cheap operations first, so we don't parse JSON unless we have to.
      if (event.source != win.parent || typeof getData(event) != 'string' ||
          dev().assertString(getData(event)).indexOf('amp-') != 0) {
        return;
      }
      // Parse JSON only once per message.
      const data = parseJson(
          dev().assertString(getData(event)).substr(4));
      if (data['sentinel'] != sentinel) {
        return;
      }

      if (data['type'] != POSITION_HIGH_FIDELITY) {
        return;
      }

      this.onMessageReceivedHandler_(
      /** @type {PositionInViewportEntryDef} */ (data));
    });
  }

  /** @override */
  stopCallback() {
    if (this.unlistenHost_) {
      this.unlistenHost_();
      this.unlistenHost_ = null;
    }
  }

  /**
   * @param {!PositionInViewportEntryDef} iframePosition
   * @private
   */
  onMessageReceivedHandler_(iframePosition) {
    // iframe position change. recalculate element position.
    // Cache iframe position for later usage.
    this.iframePosition_ = iframePosition;

    // do this in vsyn.measure
    this.vsync_.measure(() => {
      this.pass_();
    });
  }

  /** @private */
  pass_() {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      this.updateEntryPosition(entry);
    }
  }

  /** @override */
  updateEntryPosition(entry) {
    if (!this.iframePosition_ || !this.iframePosition_.positionRect) {
      // If not receive iframe position from host, or if iframe is outside vp
      return;
    }
    if (!entry.element.inIframePositionRect) {
      // Not receive element position in iframe from ampDocPositionObserver
      return;
    }
    const iframeBox = this.iframePosition_.positionRect;
    const viewportBox = this.iframePosition_.viewportRect;
    // Adjust element rect relative to viewportBox
    let elementBox = entry.element.inIframePositionRect;
    elementBox = moveLayoutRect(elementBox, iframeBox.left, iframeBox.top);
    entry.trigger(/** @type {PositionInViewportEntryDef}*/ ({
      positionRect: elementBox,
      viewportRect: viewportBox,
    }));
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installPositionObserverServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'position-observer', () => {
    if (getMode(ampdoc.win).runtime == 'inabox') {
      return new InaboxAmpDocPositionObserver(ampdoc);
    } else {
      return new AmpDocPositionObserver(ampdoc);
    }
  });
}
