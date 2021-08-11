function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import { IframeTransportMessageQueue } from "./iframe-transport-message-queue";
import { createElementWithAttributes } from "../../../src/core/dom";
import { devAssert, user } from "../../../src/log";
import { getMode } from "../../../src/mode";
import { hasOwn } from "../../../src/core/types/object";
import { internalRuntimeVersion } from "../../../src/internal-version";
import { toggle } from "../../../src/core/dom/style";
import { urls } from "../../../src/config";

/** @private @const {string} */
var TAG_ = 'amp-analytics/iframe-transport';

/** @private @const {number} */
var LONG_TASK_REPORTING_THRESHOLD = 5;

/** @typedef {{
 *    frame: Element,
 *    sentinel: string,
 *    usageCount: number,
 *    queue: IframeTransportMessageQueue,
 *  }} */
export var FrameData;

/**
 * @param {!Window} ampWin
 * @param {boolean=} opt_forceProdUrl
 * @return {string}
 * @visibleForTesting
 */
export function getIframeTransportScriptUrlForTesting(
ampWin,
opt_forceProdUrl)
{
  return getIframeTransportScriptUrl(ampWin, opt_forceProdUrl);
}

/**
 * Get the URL of the client lib
 * @param {!Window} ampWin The window object of the AMP document
 * @param {boolean=} opt_forceProdUrl If true, prod URL will be returned even
 *     in local/test modes.
 * @return {string}
 */
function getIframeTransportScriptUrl(ampWin, opt_forceProdUrl) {
  if (
  (false || false) &&
  !opt_forceProdUrl &&
  ampWin.parent &&
  ampWin.parent.location)
  {
    var loc = ampWin.parent.location;
    return "".concat(loc.protocol, "//").concat(loc.host, "/dist/iframe-transport-client-lib.js");
  }
  return (
  urls.thirdParty + "/".concat(
  internalRuntimeVersion(), "/iframe-transport-client-v0.js"));

}

/**
 * @visibleForTesting
 */
export var IframeTransport = /*#__PURE__*/function () {
  /**
   * @param {!Window} ampWin The window object of the AMP document
   * @param {string} type The value of the amp-analytics tag's type attribute
   * @param {!JsonObject} config
   * @param {string} id If (potentially) using sendResponseToCreative(), it
   *     should be something that the recipient can use to identify the
   *     context of the message, e.g. the resourceID of a DOM element.
   */
  function IframeTransport(ampWin, type, config, id) {_classCallCheck(this, IframeTransport);
    /** @private @const {!Window} */
    this.ampWin_ = ampWin;

    /** @private @const {string} */
    this.type_ = type;

    /** @private @const {string} */
    this.creativeId_ = id;

    devAssert(
    config && config['iframe']);


    this.frameUrl_ = config['iframe'];

    /** @private {number} */
    this.numLongTasks_ = 0;

    this.processCrossDomainIframe();
  }

  /**
   * Called when a Transport instance is being removed from the DOM
   */_createClass(IframeTransport, [{ key: "detach", value:
    function detach() {
      IframeTransport.markCrossDomainIframeAsDone(
      this.ampWin_.document,
      this.type_);

    }

    /**
     * If iframe is specified in config/transport, check whether third-party
     * iframe already exists, and if not, create it.
     */ }, { key: "processCrossDomainIframe", value:
    function processCrossDomainIframe() {
      var frameData;
      if (IframeTransport.hasCrossDomainIframe(this.type_)) {
        frameData = IframeTransport.getFrameData(this.type_);
        ++frameData.usageCount;
      } else {
        frameData = this.createCrossDomainIframe();
        this.ampWin_.document.body.appendChild(frameData.frame);
        this.createPerformanceObserver_();
      }
      devAssert(frameData);
    }

    /**
     * Create a cross-domain iframe for third-party vendor analytics
     * @return {!FrameData}
     * @visibleForTesting
     */ }, { key: "createCrossDomainIframe", value:
    function createCrossDomainIframe() {
      // Explanation of IDs:
      // Each instance of IframeTransport (owned by a specific amp-analytics
      // tag, in turn owned by a specific creative) has an ID
      // (this.getCreativeId()).
      // Each cross-domain iframe also has an ID, stored here in sentinel.
      // These two types of IDs have different formats.
      // There is a many-to-one relationship, in that several creatives may
      // utilize the same analytics vendor, so perhaps two creatives might
      // both use the same vendor iframe.
      // Of course, a given creative may use multiple analytics vendors, but
      // in that case it would use multiple amp-analytics tags, so the
      // iframeTransport.getCreativeId() -> sentinel relationship is *not*
      // many-to-many.
      var sentinel = IframeTransport.createUniqueId_();
      var frameName = JSON.stringify(
      /** @type {JsonObject} */({
        scriptSrc: getIframeTransportScriptUrl(this.ampWin_),
        sentinel: sentinel,
        type: this.type_ }));


      var frame = createElementWithAttributes(
      this.ampWin_.document,
      'iframe',
      /** @type {!JsonObject} */({
        sandbox: 'allow-scripts allow-same-origin',
        name: frameName,
        'data-amp-3p-sentinel': sentinel }));


      frame.sentinel = sentinel;
      toggle(frame, false);
      frame.src = this.frameUrl_;
      var frameData = /** @type {FrameData} */({
        frame: frame,
        usageCount: 1,
        queue: new IframeTransportMessageQueue(
        this.ampWin_,
        /** @type {!HTMLIFrameElement} */(
        frame)) });


      IframeTransport.crossDomainIframes_[this.type_] = frameData;
      return frameData;
    }

    /**
     * Uses the Long Task API to create an observer for when 3p vendor frames
     * take more than 50ms of continuous CPU time.
     * Currently the only action in response to that is to log. It will log
     * once per LONG_TASK_REPORTING_THRESHOLD that a long task occurs. (This
     * implies that there is a grace period for the first
     * LONG_TASK_REPORTING_THRESHOLD-1 occurrences.)
     * @private
     */ }, { key: "createPerformanceObserver_", value:
    function createPerformanceObserver_() {var _this = this;
      if (!isLongTaskApiSupported(this.ampWin_)) {
        return;
      }
      IframeTransport.performanceObservers_[this.type_] =
      new this.ampWin_.PerformanceObserver(function (entryList) {
        if (!entryList) {
          return;
        }
        entryList.getEntries().forEach(function (entry) {
          if (
          entry &&
          entry['entryType'] == 'longtask' &&
          entry['name'] == 'cross-origin-descendant' &&
          entry.attribution)
          {
            /** @type {!Array} */(entry.attribution).forEach(function (attrib) {
              if (
              _this.frameUrl_ == attrib['containerSrc'] &&
              ++_this.numLongTasks_ % LONG_TASK_REPORTING_THRESHOLD == 0)
              {
                user().error(TAG_, "Long Task: Vendor: \"".concat(_this.type_, "\""));
              }
            });
          }
        });
      });
      IframeTransport.performanceObservers_[this.type_].observe({
        entryTypes: ['longtask'] });

    }

    /**
     * Called when a creative no longer needs its cross-domain iframe (for
     * instance, because the creative has been removed from the DOM).
     * Once all creatives using a frame are done with it, the frame can be
     * destroyed.
     * @param {!HTMLDocument} ampDoc The AMP document
     * @param {string} type The type attribute of the amp-analytics tag
     */ }, { key: "sendRequest", value:









































    /**
     * Sends an AMP Analytics trigger event to a vendor's cross-domain iframe,
     * or queues the message if the frame is not yet ready to receive messages.
     * @param {string} event A string describing the trigger event
     * @visibleForTesting
     */
    function sendRequest(event) {
      var frameData = IframeTransport.getFrameData(this.type_);
      devAssert(frameData);
      devAssert(
      frameData.queue);





      frameData.queue.enqueue(
      /**
       * @type {!../../../src/3p-frame-messaging.IframeTransportEvent}
       */(
      { creativeId: this.creativeId_, message: event }));

    }

    /**
     * Gets the FrameData associated with a particular cross-domain frame type.
     * @param {string} type The type attribute of the amp-analytics tag
     * @return {FrameData}
     * @visibleForTesting
     */ }, { key: "getCreativeId", value:













    /**
     * @return {string} Unique ID of this instance of IframeTransport
     * @visibleForTesting
     */
    function getCreativeId() {
      return this.creativeId_;
    }

    /**
     * @return {string} Type attribute of parent amp-analytics instance
     * @visibleForTesting
     */ }, { key: "getType", value:
    function getType() {
      return this.type_;
    } }], [{ key: "markCrossDomainIframeAsDone", value: function markCrossDomainIframeAsDone(ampDoc, type) {var frameData = IframeTransport.getFrameData(type);devAssert(frameData && frameData.frame && frameData.usageCount);if (--frameData.usageCount) {// Some other instance is still using it
        return;}ampDoc.body.removeChild(frameData.frame);delete IframeTransport.crossDomainIframes_[type];if (IframeTransport.performanceObservers_[type]) {IframeTransport.performanceObservers_[type].disconnect();IframeTransport.performanceObservers_[type] = null;}} /**
     * Returns whether this type of cross-domain frame is already known
     * @param {string} type The type attribute of the amp-analytics tag
     * @return {boolean}
     * @visibleForTesting
     */ }, { key: "hasCrossDomainIframe", value: function hasCrossDomainIframe(type) {return hasOwn(IframeTransport.crossDomainIframes_, type);} /**
     * Create a unique value to differentiate messages from a particular
     * creative to the cross-domain iframe, or to identify the iframe itself.
     * @return {string}
     * @private
     */ }, { key: "createUniqueId_", value: function createUniqueId_() {return String(++IframeTransport.nextId_);} }, { key: "getFrameData", value: function getFrameData(type) {return IframeTransport.crossDomainIframes_[type];} /**
     * Removes all knowledge of cross-domain iframes.
     * Does not actually remove them from the DOM.
     * @visibleForTesting
     */ }, { key: "resetCrossDomainIframes", value: function resetCrossDomainIframes() {IframeTransport.crossDomainIframes_ = {};} }]);return IframeTransport;}(); /**
 * @param {!Window} win
 * @return {boolean}
 */export function isLongTaskApiSupported(win) {return (!!win.PerformanceObserver && !!win['TaskAttributionTiming'] && 'containerName' in win['TaskAttributionTiming'].prototype);} /** @private {Object<string, FrameData>} */IframeTransport.crossDomainIframes_ = {}; /** @private {number} */
IframeTransport.nextId_ = 0;

/** @private {Object<string, PerformanceObserver>} */
IframeTransport.performanceObservers_ = {};
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/iframe-transport.js