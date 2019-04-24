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
import {canInspectWindow} from '../../src/iframe-helper';
import {dev, devAssert} from '../../src/log';
import {dict} from '../../src/utils/object';
import {getData} from '../../src/event-helper';

/** @const */
const TAG = 'InaboxMessagingHost';

/** @const */
const READ_ONLY_MESSAGES = [MessageType.SEND_POSITIONS];

/** Simple helper for named callbacks. */
class NamedObservable {

  /**
   * Creates an instance of NamedObservable.
   */
  constructor() {
    /** @private {!Object<string, !Function>} */
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

/** @typedef {{
      iframe: !HTMLIFrameElement,
      measurableFrame: !HTMLIFrameElement,
      observeUnregisterFn: (!UnlistenDef|undefined),
  }} */
let AdFrameDef;

export class InaboxMessagingHost {

  /**
   * @param {!Window} win
   * @param {!Array<!HTMLIFrameElement>} iframes
   */
  constructor(win, iframes) {
    /** @private {!Array<!HTMLIFrameElement>} */
    this.iframes_ = iframes;

    /** @private {!Object<string,!AdFrameDef>} */
    this.iframeMap_ = Object.create(null);

    /** @private {!PositionObserver} */
    this.positionObserver_ = new PositionObserver(win);

    /** @private {!NamedObservable} */
    this.msgObservable_ = new NamedObservable();

    /** @private {!FrameOverlayManager} */
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
    const request = deserializeMessage(getData(message));
    if (!request || !request['sentinel']) {
      dev().fine(TAG, 'Ignored non-AMP message:', message);
      return false;
    }

    const adFrame =
        this.getFrameElement_(message.source, request['sentinel']);
    if (!adFrame) {
      dev().info(TAG, 'Ignored message from untrusted iframe:', message);
      return false;
    }

    const allowedTypes = adFrame.iframe.dataset['ampAllowed'];
    const allowedTypesList = allowedTypes ?
      allowedTypes.split(/\s*,\s*/) :
      READ_ONLY_MESSAGES;
    if (allowedTypesList.indexOf(request['type']) === -1) {
      dev().info(TAG, 'Ignored non-whitelisted message type:', message);
      return false;
    }

    if (!this.msgObservable_.fire(request['type'], this,
        [adFrame.measurableFrame, request, message.source, message.origin])) {
      dev().warn(TAG, 'Unprocessed AMP message:', message);
      return false;
    }

    return true;
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
    const targetRect = this.positionObserver_.getTargetRect(iframe);
    this.sendPosition_(request, source, origin, dict({
      'viewportRect': viewportRect,
      'targetRect': targetRect,
    }));

    devAssert(this.iframeMap_[request.sentinel]);
    this.iframeMap_[request.sentinel].observeUnregisterFn =
        this.iframeMap_[request.sentinel].observeUnregisterFn ||
        this.positionObserver_.observe(iframe, data =>
          this.sendPosition_(request, source, origin, /** @type ?JsonObject */(data)));
    return true;
  }

  /**
   *
   * @param {!Object} request
   * @param {!Window} source
   * @param {string} origin
   * @param {?JsonObject} data
   */
  sendPosition_(request, source, origin, data) {
    dev().fine(TAG, 'Sent position data to [%s] %s', request.sentinel, data);
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
   * TODO(alanorozco):
   * 1. Reject request if frame is out of focus
   * 2. Disable zoom and scroll on parent doc
   */
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
   * @param {?Window} source
   * @param {string} sentinel
   * @return {?AdFrameDef}
   * @private
   */
  getFrameElement_(source, sentinel) {
    if (this.iframeMap_[sentinel]) {
      return this.iframeMap_[sentinel];
    }
    const measurableFrame = this.getMeasureableFrame(source);
    if (!measurableFrame) {
      return null;
    }
    const measurableWin = measurableFrame.contentWindow;
    for (let i = 0; i < this.iframes_.length; i++) {
      const iframe = this.iframes_[i];
      for (let j = 0, tempWin = measurableWin;
        j < 10; j++, tempWin = tempWin.parent) {
        if (iframe.contentWindow == tempWin) {
          this.iframeMap_[sentinel] = {iframe, measurableFrame};
          return this.iframeMap_[sentinel];
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
   * @param {?Window} win
   * @return {?HTMLIFrameElement}
   * @visibleForTesting
   */
  getMeasureableFrame(win) {
    if (!win) {
      return null;
    }
    // First, we try to find the top-most x-domain window in win's parent
    // hierarchy. If win is not nested within x-domain framing, then
    // this loop breaks immediately.
    let topXDomainWin;
    for (let j = 0, tempWin = win;
      j < 10 && tempWin != tempWin.top && !canInspectWindow(tempWin);
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
          return /** @type {!HTMLIFrameElement} */(frame);
        }
      }
    }
    // If topXDomainWin does not exist, then win is friendly, and we can
    // just return its frameElement directly.
    return /** @type {!HTMLIFrameElement} */(win.frameElement);
  }

  /**
   * Removes an iframe from the set of iframes we watch, along with executing
   * any necessary cleanup.  Available at win.AMP.inaboxUnregisterIframe().
   *
   * @param {!HTMLIFrameElement} iframe
   */
  unregisterIframe(iframe) {
    // Remove iframe from the list of iframes we're watching.
    const iframeIndex = this.iframes_.indexOf(iframe);
    if (iframeIndex != -1) {
      this.iframes_.splice(iframeIndex, 1);
    }
    // Also remove it and all of its descendents from our sentinel cache.
    // TODO(jeffkaufman): save more info so we don't have to walk the dom here.
    for (const sentinel in this.iframeMap_) {
      if (this.iframeMap_[sentinel].iframe == iframe) {
        if (this.iframeMap_[sentinel].observeUnregisterFn) {
          this.iframeMap_[sentinel].observeUnregisterFn();
        }
        delete this.iframeMap_[sentinel];
      }
    }
  }
}
