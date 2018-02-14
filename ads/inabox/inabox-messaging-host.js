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

import {FrameOverlayManager} from './frame-overlay-manager';
import {
  MessageType,
  deserializeMessage,
  serializeMessage,
} from '../../src/3p-frame-messaging';
import {PositionObserver} from './position-observer';
import {dev} from '../../src/log';
import {dict} from '../../src/utils/object';
import {getData} from '../../src/event-helper';
import {layoutRectFromDomRect} from '../../src/layout-rect';
/** @const */
const TAG = 'InaboxMessagingHost';


/** Simple helper for named callbacks. */
class NamedObservable {

  constructor() {
    this.map_ = {};
  }

  /**
   * @param {string} key
   * @param {!Function} callback
   */
  listen(key, callback) {
    if (key in this.map_) {
      dev().fine(TAG, `Overriding message callback [${key}]`);
    }
    this.map_[key] = callback;
  }

  /**
   * @param {string} key
   * @param {*} thisArg
   * @param {!Array} args
   * @return {boolean} True when a callback was found and successfully executed.
   */
  fire(key, thisArg, args) {
    if (key in this.map_) {
      return this.map_[key].apply(thisArg, args);
    }
    return false;
  }
}


export class InaboxMessagingHost {

  constructor(win, iframes) {
    this.win_ = win;
    this.iframes_ = iframes;
    this.iframeMap_ = Object.create(null);
    this.registeredIframeSentinels_ = Object.create(null);
    this.positionObserver_ = new PositionObserver(win);
    this.msgObservable_ = new NamedObservable();
    this.frameOverlayManager_ = new FrameOverlayManager(win);

    this.msgObservable_.listen(
        MessageType.SEND_POSITIONS, this.handleSendPositions_);

    this.msgObservable_.listen(
        MessageType.FULL_OVERLAY_FRAME, this.handleEnterFullOverlay_);

    this.msgObservable_.listen(
        MessageType.CANCEL_FULL_OVERLAY_FRAME, this.handleCancelFullOverlay_);
  }

  /**
   * Process a single post message.
   *
   * A valid message has to be formatted as a string starting with "amp-". The
   * rest part should be a stringified JSON object of
   * {type: string, sentinel: string}. The allowed types are listed in the
   * REQUEST_TYPE enum.
   *
   * @param {!MessageEvent} message
   * @return {boolean} true if message get successfully processed
   */
  processMessage(message) {
    try {
      const request = deserializeMessage(getData(message));
      if (!request || !request['sentinel']) {
        dev().fine(TAG, 'Ignored non-AMP message:', message);
        return false;
      }

      const iframe =
            this.getFrameElement_(message.source, request['sentinel']);
      if (!iframe) {
        dev().info(TAG, 'Ignored message from untrusted iframe:', message);
        return false;
      }

      if (!this.msgObservable_.fire(request['type'], this,
          [iframe, request, message.source, message.origin])) {
        dev().warn(TAG, 'Unprocessed AMP message:', message);
        return false;
      }

      return true;
    } catch (unused) {}
  }

  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {!Object} request
   * @param {!Window} source
   * @param {string} origin
   * @return {boolean}
   */
  handleSendPositions_(iframe, request, source, origin) {
    const viewportRect = this.positionObserver_.getViewportRect();
    const targetRect =
          layoutRectFromDomRect(iframe./*OK*/getBoundingClientRect());
    this.sendPosition_(request, source, origin, dict({
      'viewportRect': viewportRect,
      'targetRect': targetRect,
    }));

    // To prevent double tracking for the same requester.
    if (this.registeredIframeSentinels_[request.sentinel]) {
      return true;
    }

    this.registeredIframeSentinels_[request.sentinel] = true;
    this.positionObserver_.observe(iframe, data => {
      this.sendPosition_(request, source, origin, data);
    });
    return true;
  }

  /**
   *
   * @param {!Object} request
   * @param {!Window} source
   * @param {string} origin
   * @param {JsonObject} data
   */
  sendPosition_(request, source, origin, data) {
    dev().fine(TAG, `Sent position data to [${request.sentinel}]`, data);
    source./*OK*/postMessage(
        serializeMessage(MessageType.POSITION, request.sentinel, data),
        origin);
  }

  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {!Object} request
   * @param {!Window} source
   * @param {string} origin
   * @return {boolean}
   */
  // TODO(alanorozco):
  // 1. Reject request if frame is out of focus
  // 2. Disable zoom and scroll on parent doc
  handleEnterFullOverlay_(iframe, request, source, origin) {
    this.frameOverlayManager_.expandFrame(iframe, boxRect => {
      source./*OK*/postMessage(
          serializeMessage(
              MessageType.FULL_OVERLAY_FRAME_RESPONSE,
              request.sentinel,
              dict({
                'success': true,
                'boxRect': boxRect,
              })),
          origin);
    });

    return true;
  }

  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {!Object} request
   * @param {!Window} source
   * @param {string} origin
   * @return {boolean}
   */
  handleCancelFullOverlay_(iframe, request, source, origin) {
    this.frameOverlayManager_.collapseFrame(iframe, boxRect => {
      source./*OK*/postMessage(
          serializeMessage(
              MessageType.CANCEL_FULL_OVERLAY_FRAME_RESPONSE,
              request.sentinel,
              dict({
                'success': true,
                'boxRect': boxRect,
              })),
          origin);
    });

    return true;
  }

  /** This method is doing two things.
   *    1. It checks that the source of the message is valid.
   *       Validity means that the message comes from a frame that
   *       is either directly registered in this.iframes_, or is a
   *       child of one of those frames.
   *    2. It returns whichever iframe is the deepest frame in the source's
   *       hierarchy that the outer host window can still measure, which is
   *       the top most cross domained frame, or the creative frame.
   * EXAMPLE:
   *   If we have a frame hierarchy:
   *     Host -> Friendly Frame -> X Domain Frame 1 -> Message Source Frame
   *     and "Friendly Frame" is registered in this.iframes_, then
   *     "Message Source Frame" is valid, because one of its parent frames
   *     is registered in this.iframes_, and the result of the call to
   *     getFrameElement_ would be the iframe "X Domain Frame 1" as it is
   *     the deepest frame that the host doc can accurately measure.
   * Note: The sentinel should be unique to the source window, and the result
   * is cached using the sentinel as the key.
   *
   * @param source {!Window}
   * @param sentinel {string}
   * @return {?HTMLIFrameElement}
   * @private
   */
  getFrameElement_(source, sentinel) {
    if (this.iframeMap_[sentinel]) {
      return this.iframeMap_[sentinel];
    }
    const measureableFrame =
        /** @type {HTMLIFrameElement} */(this.getMeasureableFrame(source));
    const measureableWin = measureableFrame.contentWindow;
    for (let i = 0; i < this.iframes_.length; i++) {
      const iframe = this.iframes_[i];
      for (let j = 0, tempWin = measureableWin;
        j < 10; j++, tempWin = tempWin.parent) {
        if (iframe.contentWindow == tempWin) {
          this.iframeMap_[sentinel] = measureableFrame;
          return measureableFrame;
        }
        if (tempWin == window.top) {
          break;
        }
      }
    }
    return null;
  }

  /**
   * Returns whichever window in win's parent hierarchy is the deepest window
   * that is measurable from the perspective of the current window.
   * For when win is nested within a x-domain frame, walks up the window's
   * parent hierarchy until the top-most x-domain frame in the hierarchy
   * is found. Then, it returns the frame element for that window.
   * For when win is friendly framed, returns the frame element for win.
   * @param {!Window} win
   * @return {?Element}
   * @visibleForTesting
   */
  getMeasureableFrame(win) {
    // First, we try to find the top-most x-domain window in win's parent
    // hierarchy. If win is not nested within x-domain framing, then
    // this loop breaks immediately.
    let topXDomainWin;
    for (let j = 0, tempWin = win;
      j < 10 && tempWin != tempWin.top && !canInspectWindow_(tempWin);
      j++, topXDomainWin = tempWin, tempWin = tempWin.parent) {}
    // If topXDomainWin exists, we know that the frame we want to measure
    // is a x-domain frame. Unfortunately, you can not access properties
    // on a x-domain window, so we can not do window.frameElement, and
    // instead must instead get topXDomainWin's parent, and then iterate
    // over that parent's child iframes until we find the frame element
    // that corresponds to topXDomainWin.
    if (!!topXDomainWin) {
      const iframes =
            topXDomainWin.parent.document.querySelectorAll('iframe');
      for (let k = 0, frame = iframes[k]; k < iframes.length;
        k++, frame = iframes[k]) {
        if (frame.contentWindow == topXDomainWin) {
          return frame;
        }
      }
    }
    // If topXDomainWin does not exist, then win is friendly, and we can
    // just return its frameElement directly.
    return win.frameElement;
  }
}

/**
 * Returns true if win's properties can be accessed and win is defined.
 * This functioned is used to determine if a window is cross-domained
 * from the perspective of the current window.
 * @param {!Window} win
 * @return {boolean}
 * @private
 */
function canInspectWindow_(win) {
  try {
    const unused = !!win.location.href && win['test']; // eslint-disable-line no-unused-vars
    return true;
  } catch (unusedErr) { // eslint-disable-line no-unused-vars
    return false;
  }
}
