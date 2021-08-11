function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
export function getIframeTransportScriptUrlForTesting(ampWin, opt_forceProdUrl) {
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
  if ((getMode().localDev || getMode().test) && !opt_forceProdUrl && ampWin.parent && ampWin.parent.location) {
    var loc = ampWin.parent.location;
    return loc.protocol + "//" + loc.host + "/dist/iframe-transport-client-lib.js";
  }

  return urls.thirdParty + ("/" + internalRuntimeVersion() + "/iframe-transport-client-v0.js");
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
  function IframeTransport(ampWin, type, config, id) {
    _classCallCheck(this, IframeTransport);

    /** @private @const {!Window} */
    this.ampWin_ = ampWin;

    /** @private @const {string} */
    this.type_ = type;

    /** @private @const {string} */
    this.creativeId_ = id;
    devAssert(config && config['iframe'], 'Must supply iframe URL to constructor!');
    this.frameUrl_ = config['iframe'];

    /** @private {number} */
    this.numLongTasks_ = 0;
    this.processCrossDomainIframe();
  }

  /**
   * Called when a Transport instance is being removed from the DOM
   */
  _createClass(IframeTransport, [{
    key: "detach",
    value: function detach() {
      IframeTransport.markCrossDomainIframeAsDone(this.ampWin_.document, this.type_);
    }
    /**
     * If iframe is specified in config/transport, check whether third-party
     * iframe already exists, and if not, create it.
     */

  }, {
    key: "processCrossDomainIframe",
    value: function processCrossDomainIframe() {
      var frameData;

      if (IframeTransport.hasCrossDomainIframe(this.type_)) {
        frameData = IframeTransport.getFrameData(this.type_);
        ++frameData.usageCount;
      } else {
        frameData = this.createCrossDomainIframe();
        this.ampWin_.document.body.appendChild(frameData.frame);
        this.createPerformanceObserver_();
      }

      devAssert(frameData, 'Trying to use non-existent frame');
    }
    /**
     * Create a cross-domain iframe for third-party vendor analytics
     * @return {!FrameData}
     * @visibleForTesting
     */

  }, {
    key: "createCrossDomainIframe",
    value: function createCrossDomainIframe() {
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
      /** @type {JsonObject} */
      {
        scriptSrc: getIframeTransportScriptUrl(this.ampWin_),
        sentinel: sentinel,
        type: this.type_
      });
      var frame = createElementWithAttributes(this.ampWin_.document, 'iframe',
      /** @type {!JsonObject} */
      {
        sandbox: 'allow-scripts allow-same-origin',
        name: frameName,
        'data-amp-3p-sentinel': sentinel
      });
      frame.sentinel = sentinel;
      toggle(frame, false);
      frame.src = this.frameUrl_;
      var frameData =
      /** @type {FrameData} */
      {
        frame: frame,
        usageCount: 1,
        queue: new IframeTransportMessageQueue(this.ampWin_,
        /** @type {!HTMLIFrameElement} */
        frame)
      };
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
     */

  }, {
    key: "createPerformanceObserver_",
    value: function createPerformanceObserver_() {
      var _this = this;

      if (!isLongTaskApiSupported(this.ampWin_)) {
        return;
      }

      IframeTransport.performanceObservers_[this.type_] = new this.ampWin_.PerformanceObserver(function (entryList) {
        if (!entryList) {
          return;
        }

        entryList.getEntries().forEach(function (entry) {
          if (entry && entry['entryType'] == 'longtask' && entry['name'] == 'cross-origin-descendant' && entry.attribution) {
            /** @type {!Array} */
            entry.attribution.forEach(function (attrib) {
              if (_this.frameUrl_ == attrib['containerSrc'] && ++_this.numLongTasks_ % LONG_TASK_REPORTING_THRESHOLD == 0) {
                user().error(TAG_, "Long Task: Vendor: \"" + _this.type_ + "\"");
              }
            });
          }
        });
      });
      IframeTransport.performanceObservers_[this.type_].observe({
        entryTypes: ['longtask']
      });
    }
    /**
     * Called when a creative no longer needs its cross-domain iframe (for
     * instance, because the creative has been removed from the DOM).
     * Once all creatives using a frame are done with it, the frame can be
     * destroyed.
     * @param {!HTMLDocument} ampDoc The AMP document
     * @param {string} type The type attribute of the amp-analytics tag
     */

  }, {
    key: "sendRequest",
    value:
    /**
     * Sends an AMP Analytics trigger event to a vendor's cross-domain iframe,
     * or queues the message if the frame is not yet ready to receive messages.
     * @param {string} event A string describing the trigger event
     * @visibleForTesting
     */
    function sendRequest(event) {
      var frameData = IframeTransport.getFrameData(this.type_);
      devAssert(frameData, 'Trying to send message to non-existent frame');
      devAssert(frameData.queue, 'Event queue is missing for messages from ' + this.type_ + ' to creative ID ' + this.creativeId_);
      frameData.queue.enqueue(
      /**
       * @type {!../../../src/3p-frame-messaging.IframeTransportEvent}
       */
      {
        creativeId: this.creativeId_,
        message: event
      });
    }
    /**
     * Gets the FrameData associated with a particular cross-domain frame type.
     * @param {string} type The type attribute of the amp-analytics tag
     * @return {FrameData}
     * @visibleForTesting
     */

  }, {
    key: "getCreativeId",
    value:
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
     */

  }, {
    key: "getType",
    value: function getType() {
      return this.type_;
    }
  }], [{
    key: "markCrossDomainIframeAsDone",
    value: function markCrossDomainIframeAsDone(ampDoc, type) {
      var frameData = IframeTransport.getFrameData(type);
      devAssert(frameData && frameData.frame && frameData.usageCount, 'Marked the ' + type + ' frame as done, but there is no' + ' record of it existing.');

      if (--frameData.usageCount) {
        // Some other instance is still using it
        return;
      }

      ampDoc.body.removeChild(frameData.frame);
      delete IframeTransport.crossDomainIframes_[type];

      if (IframeTransport.performanceObservers_[type]) {
        IframeTransport.performanceObservers_[type].disconnect();
        IframeTransport.performanceObservers_[type] = null;
      }
    }
    /**
     * Returns whether this type of cross-domain frame is already known
     * @param {string} type The type attribute of the amp-analytics tag
     * @return {boolean}
     * @visibleForTesting
     */

  }, {
    key: "hasCrossDomainIframe",
    value: function hasCrossDomainIframe(type) {
      return hasOwn(IframeTransport.crossDomainIframes_, type);
    }
    /**
     * Create a unique value to differentiate messages from a particular
     * creative to the cross-domain iframe, or to identify the iframe itself.
     * @return {string}
     * @private
     */

  }, {
    key: "createUniqueId_",
    value: function createUniqueId_() {
      return String(++IframeTransport.nextId_);
    }
  }, {
    key: "getFrameData",
    value: function getFrameData(type) {
      return IframeTransport.crossDomainIframes_[type];
    }
    /**
     * Removes all knowledge of cross-domain iframes.
     * Does not actually remove them from the DOM.
     * @visibleForTesting
     */

  }, {
    key: "resetCrossDomainIframes",
    value: function resetCrossDomainIframes() {
      IframeTransport.crossDomainIframes_ = {};
    }
  }]);

  return IframeTransport;
}();

/**
 * @param {!Window} win
 * @return {boolean}
 */
export function isLongTaskApiSupported(win) {
  return !!win.PerformanceObserver && !!win['TaskAttributionTiming'] && 'containerName' in win['TaskAttributionTiming'].prototype;
}

/** @private {Object<string, FrameData>} */
IframeTransport.crossDomainIframes_ = {};

/** @private {number} */
IframeTransport.nextId_ = 0;

/** @private {Object<string, PerformanceObserver>} */
IframeTransport.performanceObservers_ = {};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlmcmFtZS10cmFuc3BvcnQuanMiXSwibmFtZXMiOlsiSWZyYW1lVHJhbnNwb3J0TWVzc2FnZVF1ZXVlIiwiY3JlYXRlRWxlbWVudFdpdGhBdHRyaWJ1dGVzIiwiZGV2QXNzZXJ0IiwidXNlciIsImdldE1vZGUiLCJoYXNPd24iLCJpbnRlcm5hbFJ1bnRpbWVWZXJzaW9uIiwidG9nZ2xlIiwidXJscyIsIlRBR18iLCJMT05HX1RBU0tfUkVQT1JUSU5HX1RIUkVTSE9MRCIsIkZyYW1lRGF0YSIsImdldElmcmFtZVRyYW5zcG9ydFNjcmlwdFVybEZvclRlc3RpbmciLCJhbXBXaW4iLCJvcHRfZm9yY2VQcm9kVXJsIiwiZ2V0SWZyYW1lVHJhbnNwb3J0U2NyaXB0VXJsIiwibG9jYWxEZXYiLCJ0ZXN0IiwicGFyZW50IiwibG9jYXRpb24iLCJsb2MiLCJwcm90b2NvbCIsImhvc3QiLCJ0aGlyZFBhcnR5IiwiSWZyYW1lVHJhbnNwb3J0IiwidHlwZSIsImNvbmZpZyIsImlkIiwiYW1wV2luXyIsInR5cGVfIiwiY3JlYXRpdmVJZF8iLCJmcmFtZVVybF8iLCJudW1Mb25nVGFza3NfIiwicHJvY2Vzc0Nyb3NzRG9tYWluSWZyYW1lIiwibWFya0Nyb3NzRG9tYWluSWZyYW1lQXNEb25lIiwiZG9jdW1lbnQiLCJmcmFtZURhdGEiLCJoYXNDcm9zc0RvbWFpbklmcmFtZSIsImdldEZyYW1lRGF0YSIsInVzYWdlQ291bnQiLCJjcmVhdGVDcm9zc0RvbWFpbklmcmFtZSIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImZyYW1lIiwiY3JlYXRlUGVyZm9ybWFuY2VPYnNlcnZlcl8iLCJzZW50aW5lbCIsImNyZWF0ZVVuaXF1ZUlkXyIsImZyYW1lTmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJzY3JpcHRTcmMiLCJzYW5kYm94IiwibmFtZSIsInNyYyIsInF1ZXVlIiwiY3Jvc3NEb21haW5JZnJhbWVzXyIsImlzTG9uZ1Rhc2tBcGlTdXBwb3J0ZWQiLCJwZXJmb3JtYW5jZU9ic2VydmVyc18iLCJQZXJmb3JtYW5jZU9ic2VydmVyIiwiZW50cnlMaXN0IiwiZ2V0RW50cmllcyIsImZvckVhY2giLCJlbnRyeSIsImF0dHJpYnV0aW9uIiwiYXR0cmliIiwiZXJyb3IiLCJvYnNlcnZlIiwiZW50cnlUeXBlcyIsImV2ZW50IiwiZW5xdWV1ZSIsImNyZWF0aXZlSWQiLCJtZXNzYWdlIiwiYW1wRG9jIiwicmVtb3ZlQ2hpbGQiLCJkaXNjb25uZWN0IiwiU3RyaW5nIiwibmV4dElkXyIsIndpbiIsInByb3RvdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsMkJBQVI7QUFDQSxTQUFRQywyQkFBUjtBQUNBLFNBQVFDLFNBQVIsRUFBbUJDLElBQW5CO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLE1BQVI7QUFDQSxTQUFRQyxzQkFBUjtBQUNBLFNBQVFDLE1BQVI7QUFDQSxTQUFRQyxJQUFSOztBQUVBO0FBQ0EsSUFBTUMsSUFBSSxHQUFHLGdDQUFiOztBQUVBO0FBQ0EsSUFBTUMsNkJBQTZCLEdBQUcsQ0FBdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxTQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MscUNBQVQsQ0FDTEMsTUFESyxFQUVMQyxnQkFGSyxFQUdMO0FBQ0EsU0FBT0MsMkJBQTJCLENBQUNGLE1BQUQsRUFBU0MsZ0JBQVQsQ0FBbEM7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLDJCQUFULENBQXFDRixNQUFyQyxFQUE2Q0MsZ0JBQTdDLEVBQStEO0FBQzdELE1BQ0UsQ0FBQ1YsT0FBTyxHQUFHWSxRQUFWLElBQXNCWixPQUFPLEdBQUdhLElBQWpDLEtBQ0EsQ0FBQ0gsZ0JBREQsSUFFQUQsTUFB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QXNPRSxzQkFBb0JuRCxJQUFwQixFQUEwQjtBQUN4QixhQUFPRCxlQUFlLENBQUMrQixtQkFBaEIsQ0FBb0M5QixJQUFwQyxDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQTlPQTtBQUFBO0FBQUEsV0ErT0UsbUNBQWlDO0FBQy9CRCxNQUFBQSxlQUFlLENBQUMrQixtQkFBaEIsR0FBc0MsRUFBdEM7QUFDRDtBQWpQSDs7QUFBQTtBQUFBOztBQW9RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0Msc0JBQVQsQ0FBZ0NxQixHQUFoQyxFQUFxQztBQUMxQyxTQUNFLENBQUMsQ0FBQ0EsR0FBRyxDQUFDbkIsbUJBQU4sSUFDQSxDQUFDLENBQUNtQixHQUFHLENBQUMsdUJBQUQsQ0FETCxJQUVBLG1CQUFtQkEsR0FBRyxDQUFDLHVCQUFELENBQUgsQ0FBNkJDLFNBSGxEO0FBS0Q7O0FBRUQ7QUFDQXRELGVBQWUsQ0FBQytCLG1CQUFoQixHQUFzQyxFQUF0Qzs7QUFFQTtBQUNBL0IsZUFBZSxDQUFDb0QsT0FBaEIsR0FBMEIsQ0FBMUI7O0FBRUE7QUFDQXBELGVBQWUsQ0FBQ2lDLHFCQUFoQixHQUF3QyxFQUF4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0lmcmFtZVRyYW5zcG9ydE1lc3NhZ2VRdWV1ZX0gZnJvbSAnLi9pZnJhbWUtdHJhbnNwb3J0LW1lc3NhZ2UtcXVldWUnO1xuaW1wb3J0IHtjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXN9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2RldkFzc2VydCwgdXNlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4uLy4uLy4uL3NyYy9tb2RlJztcbmltcG9ydCB7aGFzT3dufSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtpbnRlcm5hbFJ1bnRpbWVWZXJzaW9ufSBmcm9tICcuLi8uLi8uLi9zcmMvaW50ZXJuYWwtdmVyc2lvbic7XG5pbXBvcnQge3RvZ2dsZX0gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7dXJsc30gZnJvbSAnLi4vLi4vLi4vc3JjL2NvbmZpZyc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBR18gPSAnYW1wLWFuYWx5dGljcy9pZnJhbWUtdHJhbnNwb3J0JztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgTE9OR19UQVNLX1JFUE9SVElOR19USFJFU0hPTEQgPSA1O1xuXG4vKiogQHR5cGVkZWYge3tcbiAqICAgIGZyYW1lOiBFbGVtZW50LFxuICogICAgc2VudGluZWw6IHN0cmluZyxcbiAqICAgIHVzYWdlQ291bnQ6IG51bWJlcixcbiAqICAgIHF1ZXVlOiBJZnJhbWVUcmFuc3BvcnRNZXNzYWdlUXVldWUsXG4gKiAgfX0gKi9cbmV4cG9ydCBsZXQgRnJhbWVEYXRhO1xuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gYW1wV2luXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfZm9yY2VQcm9kVXJsXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldElmcmFtZVRyYW5zcG9ydFNjcmlwdFVybEZvclRlc3RpbmcoXG4gIGFtcFdpbixcbiAgb3B0X2ZvcmNlUHJvZFVybFxuKSB7XG4gIHJldHVybiBnZXRJZnJhbWVUcmFuc3BvcnRTY3JpcHRVcmwoYW1wV2luLCBvcHRfZm9yY2VQcm9kVXJsKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIFVSTCBvZiB0aGUgY2xpZW50IGxpYlxuICogQHBhcmFtIHshV2luZG93fSBhbXBXaW4gVGhlIHdpbmRvdyBvYmplY3Qgb2YgdGhlIEFNUCBkb2N1bWVudFxuICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2ZvcmNlUHJvZFVybCBJZiB0cnVlLCBwcm9kIFVSTCB3aWxsIGJlIHJldHVybmVkIGV2ZW5cbiAqICAgICBpbiBsb2NhbC90ZXN0IG1vZGVzLlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRJZnJhbWVUcmFuc3BvcnRTY3JpcHRVcmwoYW1wV2luLCBvcHRfZm9yY2VQcm9kVXJsKSB7XG4gIGlmIChcbiAgICAoZ2V0TW9kZSgpLmxvY2FsRGV2IHx8IGdldE1vZGUoKS50ZXN0KSAmJlxuICAgICFvcHRfZm9yY2VQcm9kVXJsICYmXG4gICAgYW1wV2luLnBhcmVudCAmJlxuICAgIGFtcFdpbi5wYXJlbnQubG9jYXRpb25cbiAgKSB7XG4gICAgY29uc3QgbG9jID0gYW1wV2luLnBhcmVudC5sb2NhdGlvbjtcbiAgICByZXR1cm4gYCR7bG9jLnByb3RvY29sfS8vJHtsb2MuaG9zdH0vZGlzdC9pZnJhbWUtdHJhbnNwb3J0LWNsaWVudC1saWIuanNgO1xuICB9XG4gIHJldHVybiAoXG4gICAgdXJscy50aGlyZFBhcnR5ICtcbiAgICBgLyR7aW50ZXJuYWxSdW50aW1lVmVyc2lvbigpfS9pZnJhbWUtdHJhbnNwb3J0LWNsaWVudC12MC5qc2BcbiAgKTtcbn1cblxuLyoqXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIElmcmFtZVRyYW5zcG9ydCB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IGFtcFdpbiBUaGUgd2luZG93IG9iamVjdCBvZiB0aGUgQU1QIGRvY3VtZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSB2YWx1ZSBvZiB0aGUgYW1wLWFuYWx5dGljcyB0YWcncyB0eXBlIGF0dHJpYnV0ZVxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBjb25maWdcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkIElmIChwb3RlbnRpYWxseSkgdXNpbmcgc2VuZFJlc3BvbnNlVG9DcmVhdGl2ZSgpLCBpdFxuICAgKiAgICAgc2hvdWxkIGJlIHNvbWV0aGluZyB0aGF0IHRoZSByZWNpcGllbnQgY2FuIHVzZSB0byBpZGVudGlmeSB0aGVcbiAgICogICAgIGNvbnRleHQgb2YgdGhlIG1lc3NhZ2UsIGUuZy4gdGhlIHJlc291cmNlSUQgb2YgYSBET00gZWxlbWVudC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcFdpbiwgdHlwZSwgY29uZmlnLCBpZCkge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFXaW5kb3d9ICovXG4gICAgdGhpcy5hbXBXaW5fID0gYW1wV2luO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuICAgIHRoaXMudHlwZV8gPSB0eXBlO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuICAgIHRoaXMuY3JlYXRpdmVJZF8gPSBpZDtcblxuICAgIGRldkFzc2VydChcbiAgICAgIGNvbmZpZyAmJiBjb25maWdbJ2lmcmFtZSddLFxuICAgICAgJ011c3Qgc3VwcGx5IGlmcmFtZSBVUkwgdG8gY29uc3RydWN0b3IhJ1xuICAgICk7XG4gICAgdGhpcy5mcmFtZVVybF8gPSBjb25maWdbJ2lmcmFtZSddO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5udW1Mb25nVGFza3NfID0gMDtcblxuICAgIHRoaXMucHJvY2Vzc0Nyb3NzRG9tYWluSWZyYW1lKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBUcmFuc3BvcnQgaW5zdGFuY2UgaXMgYmVpbmcgcmVtb3ZlZCBmcm9tIHRoZSBET01cbiAgICovXG4gIGRldGFjaCgpIHtcbiAgICBJZnJhbWVUcmFuc3BvcnQubWFya0Nyb3NzRG9tYWluSWZyYW1lQXNEb25lKFxuICAgICAgdGhpcy5hbXBXaW5fLmRvY3VtZW50LFxuICAgICAgdGhpcy50eXBlX1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogSWYgaWZyYW1lIGlzIHNwZWNpZmllZCBpbiBjb25maWcvdHJhbnNwb3J0LCBjaGVjayB3aGV0aGVyIHRoaXJkLXBhcnR5XG4gICAqIGlmcmFtZSBhbHJlYWR5IGV4aXN0cywgYW5kIGlmIG5vdCwgY3JlYXRlIGl0LlxuICAgKi9cbiAgcHJvY2Vzc0Nyb3NzRG9tYWluSWZyYW1lKCkge1xuICAgIGxldCBmcmFtZURhdGE7XG4gICAgaWYgKElmcmFtZVRyYW5zcG9ydC5oYXNDcm9zc0RvbWFpbklmcmFtZSh0aGlzLnR5cGVfKSkge1xuICAgICAgZnJhbWVEYXRhID0gSWZyYW1lVHJhbnNwb3J0LmdldEZyYW1lRGF0YSh0aGlzLnR5cGVfKTtcbiAgICAgICsrZnJhbWVEYXRhLnVzYWdlQ291bnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZyYW1lRGF0YSA9IHRoaXMuY3JlYXRlQ3Jvc3NEb21haW5JZnJhbWUoKTtcbiAgICAgIHRoaXMuYW1wV2luXy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZyYW1lRGF0YS5mcmFtZSk7XG4gICAgICB0aGlzLmNyZWF0ZVBlcmZvcm1hbmNlT2JzZXJ2ZXJfKCk7XG4gICAgfVxuICAgIGRldkFzc2VydChmcmFtZURhdGEsICdUcnlpbmcgdG8gdXNlIG5vbi1leGlzdGVudCBmcmFtZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGNyb3NzLWRvbWFpbiBpZnJhbWUgZm9yIHRoaXJkLXBhcnR5IHZlbmRvciBhbmFseXRpY3NcbiAgICogQHJldHVybiB7IUZyYW1lRGF0YX1cbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBjcmVhdGVDcm9zc0RvbWFpbklmcmFtZSgpIHtcbiAgICAvLyBFeHBsYW5hdGlvbiBvZiBJRHM6XG4gICAgLy8gRWFjaCBpbnN0YW5jZSBvZiBJZnJhbWVUcmFuc3BvcnQgKG93bmVkIGJ5IGEgc3BlY2lmaWMgYW1wLWFuYWx5dGljc1xuICAgIC8vIHRhZywgaW4gdHVybiBvd25lZCBieSBhIHNwZWNpZmljIGNyZWF0aXZlKSBoYXMgYW4gSURcbiAgICAvLyAodGhpcy5nZXRDcmVhdGl2ZUlkKCkpLlxuICAgIC8vIEVhY2ggY3Jvc3MtZG9tYWluIGlmcmFtZSBhbHNvIGhhcyBhbiBJRCwgc3RvcmVkIGhlcmUgaW4gc2VudGluZWwuXG4gICAgLy8gVGhlc2UgdHdvIHR5cGVzIG9mIElEcyBoYXZlIGRpZmZlcmVudCBmb3JtYXRzLlxuICAgIC8vIFRoZXJlIGlzIGEgbWFueS10by1vbmUgcmVsYXRpb25zaGlwLCBpbiB0aGF0IHNldmVyYWwgY3JlYXRpdmVzIG1heVxuICAgIC8vIHV0aWxpemUgdGhlIHNhbWUgYW5hbHl0aWNzIHZlbmRvciwgc28gcGVyaGFwcyB0d28gY3JlYXRpdmVzIG1pZ2h0XG4gICAgLy8gYm90aCB1c2UgdGhlIHNhbWUgdmVuZG9yIGlmcmFtZS5cbiAgICAvLyBPZiBjb3Vyc2UsIGEgZ2l2ZW4gY3JlYXRpdmUgbWF5IHVzZSBtdWx0aXBsZSBhbmFseXRpY3MgdmVuZG9ycywgYnV0XG4gICAgLy8gaW4gdGhhdCBjYXNlIGl0IHdvdWxkIHVzZSBtdWx0aXBsZSBhbXAtYW5hbHl0aWNzIHRhZ3MsIHNvIHRoZVxuICAgIC8vIGlmcmFtZVRyYW5zcG9ydC5nZXRDcmVhdGl2ZUlkKCkgLT4gc2VudGluZWwgcmVsYXRpb25zaGlwIGlzICpub3QqXG4gICAgLy8gbWFueS10by1tYW55LlxuICAgIGNvbnN0IHNlbnRpbmVsID0gSWZyYW1lVHJhbnNwb3J0LmNyZWF0ZVVuaXF1ZUlkXygpO1xuICAgIGNvbnN0IGZyYW1lTmFtZSA9IEpTT04uc3RyaW5naWZ5KFxuICAgICAgLyoqIEB0eXBlIHtKc29uT2JqZWN0fSAqLyAoe1xuICAgICAgICBzY3JpcHRTcmM6IGdldElmcmFtZVRyYW5zcG9ydFNjcmlwdFVybCh0aGlzLmFtcFdpbl8pLFxuICAgICAgICBzZW50aW5lbCxcbiAgICAgICAgdHlwZTogdGhpcy50eXBlXyxcbiAgICAgIH0pXG4gICAgKTtcbiAgICBjb25zdCBmcmFtZSA9IGNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyhcbiAgICAgIHRoaXMuYW1wV2luXy5kb2N1bWVudCxcbiAgICAgICdpZnJhbWUnLFxuICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHtcbiAgICAgICAgc2FuZGJveDogJ2FsbG93LXNjcmlwdHMgYWxsb3ctc2FtZS1vcmlnaW4nLFxuICAgICAgICBuYW1lOiBmcmFtZU5hbWUsXG4gICAgICAgICdkYXRhLWFtcC0zcC1zZW50aW5lbCc6IHNlbnRpbmVsLFxuICAgICAgfSlcbiAgICApO1xuICAgIGZyYW1lLnNlbnRpbmVsID0gc2VudGluZWw7XG4gICAgdG9nZ2xlKGZyYW1lLCBmYWxzZSk7XG4gICAgZnJhbWUuc3JjID0gdGhpcy5mcmFtZVVybF87XG4gICAgY29uc3QgZnJhbWVEYXRhID0gLyoqIEB0eXBlIHtGcmFtZURhdGF9ICovICh7XG4gICAgICBmcmFtZSxcbiAgICAgIHVzYWdlQ291bnQ6IDEsXG4gICAgICBxdWV1ZTogbmV3IElmcmFtZVRyYW5zcG9ydE1lc3NhZ2VRdWV1ZShcbiAgICAgICAgdGhpcy5hbXBXaW5fLFxuICAgICAgICAvKiogQHR5cGUgeyFIVE1MSUZyYW1lRWxlbWVudH0gKi9cbiAgICAgICAgKGZyYW1lKVxuICAgICAgKSxcbiAgICB9KTtcbiAgICBJZnJhbWVUcmFuc3BvcnQuY3Jvc3NEb21haW5JZnJhbWVzX1t0aGlzLnR5cGVfXSA9IGZyYW1lRGF0YTtcbiAgICByZXR1cm4gZnJhbWVEYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZXMgdGhlIExvbmcgVGFzayBBUEkgdG8gY3JlYXRlIGFuIG9ic2VydmVyIGZvciB3aGVuIDNwIHZlbmRvciBmcmFtZXNcbiAgICogdGFrZSBtb3JlIHRoYW4gNTBtcyBvZiBjb250aW51b3VzIENQVSB0aW1lLlxuICAgKiBDdXJyZW50bHkgdGhlIG9ubHkgYWN0aW9uIGluIHJlc3BvbnNlIHRvIHRoYXQgaXMgdG8gbG9nLiBJdCB3aWxsIGxvZ1xuICAgKiBvbmNlIHBlciBMT05HX1RBU0tfUkVQT1JUSU5HX1RIUkVTSE9MRCB0aGF0IGEgbG9uZyB0YXNrIG9jY3Vycy4gKFRoaXNcbiAgICogaW1wbGllcyB0aGF0IHRoZXJlIGlzIGEgZ3JhY2UgcGVyaW9kIGZvciB0aGUgZmlyc3RcbiAgICogTE9OR19UQVNLX1JFUE9SVElOR19USFJFU0hPTEQtMSBvY2N1cnJlbmNlcy4pXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVQZXJmb3JtYW5jZU9ic2VydmVyXygpIHtcbiAgICBpZiAoIWlzTG9uZ1Rhc2tBcGlTdXBwb3J0ZWQodGhpcy5hbXBXaW5fKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBJZnJhbWVUcmFuc3BvcnQucGVyZm9ybWFuY2VPYnNlcnZlcnNfW3RoaXMudHlwZV9dID1cbiAgICAgIG5ldyB0aGlzLmFtcFdpbl8uUGVyZm9ybWFuY2VPYnNlcnZlcigoZW50cnlMaXN0KSA9PiB7XG4gICAgICAgIGlmICghZW50cnlMaXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVudHJ5TGlzdC5nZXRFbnRyaWVzKCkuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBlbnRyeSAmJlxuICAgICAgICAgICAgZW50cnlbJ2VudHJ5VHlwZSddID09ICdsb25ndGFzaycgJiZcbiAgICAgICAgICAgIGVudHJ5WyduYW1lJ10gPT0gJ2Nyb3NzLW9yaWdpbi1kZXNjZW5kYW50JyAmJlxuICAgICAgICAgICAgZW50cnkuYXR0cmlidXRpb25cbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7IUFycmF5fSAqLyAoZW50cnkuYXR0cmlidXRpb24pLmZvckVhY2goKGF0dHJpYikgPT4ge1xuICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZVVybF8gPT0gYXR0cmliWydjb250YWluZXJTcmMnXSAmJlxuICAgICAgICAgICAgICAgICsrdGhpcy5udW1Mb25nVGFza3NfICUgTE9OR19UQVNLX1JFUE9SVElOR19USFJFU0hPTEQgPT0gMFxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB1c2VyKCkuZXJyb3IoVEFHXywgYExvbmcgVGFzazogVmVuZG9yOiBcIiR7dGhpcy50eXBlX31cImApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgSWZyYW1lVHJhbnNwb3J0LnBlcmZvcm1hbmNlT2JzZXJ2ZXJzX1t0aGlzLnR5cGVfXS5vYnNlcnZlKHtcbiAgICAgIGVudHJ5VHlwZXM6IFsnbG9uZ3Rhc2snXSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGNyZWF0aXZlIG5vIGxvbmdlciBuZWVkcyBpdHMgY3Jvc3MtZG9tYWluIGlmcmFtZSAoZm9yXG4gICAqIGluc3RhbmNlLCBiZWNhdXNlIHRoZSBjcmVhdGl2ZSBoYXMgYmVlbiByZW1vdmVkIGZyb20gdGhlIERPTSkuXG4gICAqIE9uY2UgYWxsIGNyZWF0aXZlcyB1c2luZyBhIGZyYW1lIGFyZSBkb25lIHdpdGggaXQsIHRoZSBmcmFtZSBjYW4gYmVcbiAgICogZGVzdHJveWVkLlxuICAgKiBAcGFyYW0geyFIVE1MRG9jdW1lbnR9IGFtcERvYyBUaGUgQU1QIGRvY3VtZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSB0eXBlIGF0dHJpYnV0ZSBvZiB0aGUgYW1wLWFuYWx5dGljcyB0YWdcbiAgICovXG4gIHN0YXRpYyBtYXJrQ3Jvc3NEb21haW5JZnJhbWVBc0RvbmUoYW1wRG9jLCB0eXBlKSB7XG4gICAgY29uc3QgZnJhbWVEYXRhID0gSWZyYW1lVHJhbnNwb3J0LmdldEZyYW1lRGF0YSh0eXBlKTtcbiAgICBkZXZBc3NlcnQoXG4gICAgICBmcmFtZURhdGEgJiYgZnJhbWVEYXRhLmZyYW1lICYmIGZyYW1lRGF0YS51c2FnZUNvdW50LFxuICAgICAgJ01hcmtlZCB0aGUgJyArXG4gICAgICAgIHR5cGUgK1xuICAgICAgICAnIGZyYW1lIGFzIGRvbmUsIGJ1dCB0aGVyZSBpcyBubycgK1xuICAgICAgICAnIHJlY29yZCBvZiBpdCBleGlzdGluZy4nXG4gICAgKTtcbiAgICBpZiAoLS1mcmFtZURhdGEudXNhZ2VDb3VudCkge1xuICAgICAgLy8gU29tZSBvdGhlciBpbnN0YW5jZSBpcyBzdGlsbCB1c2luZyBpdFxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhbXBEb2MuYm9keS5yZW1vdmVDaGlsZChmcmFtZURhdGEuZnJhbWUpO1xuICAgIGRlbGV0ZSBJZnJhbWVUcmFuc3BvcnQuY3Jvc3NEb21haW5JZnJhbWVzX1t0eXBlXTtcbiAgICBpZiAoSWZyYW1lVHJhbnNwb3J0LnBlcmZvcm1hbmNlT2JzZXJ2ZXJzX1t0eXBlXSkge1xuICAgICAgSWZyYW1lVHJhbnNwb3J0LnBlcmZvcm1hbmNlT2JzZXJ2ZXJzX1t0eXBlXS5kaXNjb25uZWN0KCk7XG4gICAgICBJZnJhbWVUcmFuc3BvcnQucGVyZm9ybWFuY2VPYnNlcnZlcnNfW3R5cGVdID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgdHlwZSBvZiBjcm9zcy1kb21haW4gZnJhbWUgaXMgYWxyZWFkeSBrbm93blxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgdHlwZSBhdHRyaWJ1dGUgb2YgdGhlIGFtcC1hbmFseXRpY3MgdGFnXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgc3RhdGljIGhhc0Nyb3NzRG9tYWluSWZyYW1lKHR5cGUpIHtcbiAgICByZXR1cm4gaGFzT3duKElmcmFtZVRyYW5zcG9ydC5jcm9zc0RvbWFpbklmcmFtZXNfLCB0eXBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSB1bmlxdWUgdmFsdWUgdG8gZGlmZmVyZW50aWF0ZSBtZXNzYWdlcyBmcm9tIGEgcGFydGljdWxhclxuICAgKiBjcmVhdGl2ZSB0byB0aGUgY3Jvc3MtZG9tYWluIGlmcmFtZSwgb3IgdG8gaWRlbnRpZnkgdGhlIGlmcmFtZSBpdHNlbGYuXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXRpYyBjcmVhdGVVbmlxdWVJZF8oKSB7XG4gICAgcmV0dXJuIFN0cmluZygrK0lmcmFtZVRyYW5zcG9ydC5uZXh0SWRfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhbiBBTVAgQW5hbHl0aWNzIHRyaWdnZXIgZXZlbnQgdG8gYSB2ZW5kb3IncyBjcm9zcy1kb21haW4gaWZyYW1lLFxuICAgKiBvciBxdWV1ZXMgdGhlIG1lc3NhZ2UgaWYgdGhlIGZyYW1lIGlzIG5vdCB5ZXQgcmVhZHkgdG8gcmVjZWl2ZSBtZXNzYWdlcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IEEgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIHRyaWdnZXIgZXZlbnRcbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBzZW5kUmVxdWVzdChldmVudCkge1xuICAgIGNvbnN0IGZyYW1lRGF0YSA9IElmcmFtZVRyYW5zcG9ydC5nZXRGcmFtZURhdGEodGhpcy50eXBlXyk7XG4gICAgZGV2QXNzZXJ0KGZyYW1lRGF0YSwgJ1RyeWluZyB0byBzZW5kIG1lc3NhZ2UgdG8gbm9uLWV4aXN0ZW50IGZyYW1lJyk7XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgZnJhbWVEYXRhLnF1ZXVlLFxuICAgICAgJ0V2ZW50IHF1ZXVlIGlzIG1pc3NpbmcgZm9yIG1lc3NhZ2VzIGZyb20gJyArXG4gICAgICAgIHRoaXMudHlwZV8gK1xuICAgICAgICAnIHRvIGNyZWF0aXZlIElEICcgK1xuICAgICAgICB0aGlzLmNyZWF0aXZlSWRfXG4gICAgKTtcbiAgICBmcmFtZURhdGEucXVldWUuZW5xdWV1ZShcbiAgICAgIC8qKlxuICAgICAgICogQHR5cGUgeyEuLi8uLi8uLi9zcmMvM3AtZnJhbWUtbWVzc2FnaW5nLklmcmFtZVRyYW5zcG9ydEV2ZW50fVxuICAgICAgICovXG4gICAgICAoe2NyZWF0aXZlSWQ6IHRoaXMuY3JlYXRpdmVJZF8sIG1lc3NhZ2U6IGV2ZW50fSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIEZyYW1lRGF0YSBhc3NvY2lhdGVkIHdpdGggYSBwYXJ0aWN1bGFyIGNyb3NzLWRvbWFpbiBmcmFtZSB0eXBlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgdHlwZSBhdHRyaWJ1dGUgb2YgdGhlIGFtcC1hbmFseXRpY3MgdGFnXG4gICAqIEByZXR1cm4ge0ZyYW1lRGF0YX1cbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBzdGF0aWMgZ2V0RnJhbWVEYXRhKHR5cGUpIHtcbiAgICByZXR1cm4gSWZyYW1lVHJhbnNwb3J0LmNyb3NzRG9tYWluSWZyYW1lc19bdHlwZV07XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwga25vd2xlZGdlIG9mIGNyb3NzLWRvbWFpbiBpZnJhbWVzLlxuICAgKiBEb2VzIG5vdCBhY3R1YWxseSByZW1vdmUgdGhlbSBmcm9tIHRoZSBET00uXG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgc3RhdGljIHJlc2V0Q3Jvc3NEb21haW5JZnJhbWVzKCkge1xuICAgIElmcmFtZVRyYW5zcG9ydC5jcm9zc0RvbWFpbklmcmFtZXNfID0ge307XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSBVbmlxdWUgSUQgb2YgdGhpcyBpbnN0YW5jZSBvZiBJZnJhbWVUcmFuc3BvcnRcbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBnZXRDcmVhdGl2ZUlkKCkge1xuICAgIHJldHVybiB0aGlzLmNyZWF0aXZlSWRfO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVHlwZSBhdHRyaWJ1dGUgb2YgcGFyZW50IGFtcC1hbmFseXRpY3MgaW5zdGFuY2VcbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBnZXRUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLnR5cGVfO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0xvbmdUYXNrQXBpU3VwcG9ydGVkKHdpbikge1xuICByZXR1cm4gKFxuICAgICEhd2luLlBlcmZvcm1hbmNlT2JzZXJ2ZXIgJiZcbiAgICAhIXdpblsnVGFza0F0dHJpYnV0aW9uVGltaW5nJ10gJiZcbiAgICAnY29udGFpbmVyTmFtZScgaW4gd2luWydUYXNrQXR0cmlidXRpb25UaW1pbmcnXS5wcm90b3R5cGVcbiAgKTtcbn1cblxuLyoqIEBwcml2YXRlIHtPYmplY3Q8c3RyaW5nLCBGcmFtZURhdGE+fSAqL1xuSWZyYW1lVHJhbnNwb3J0LmNyb3NzRG9tYWluSWZyYW1lc18gPSB7fTtcblxuLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG5JZnJhbWVUcmFuc3BvcnQubmV4dElkXyA9IDA7XG5cbi8qKiBAcHJpdmF0ZSB7T2JqZWN0PHN0cmluZywgUGVyZm9ybWFuY2VPYnNlcnZlcj59ICovXG5JZnJhbWVUcmFuc3BvcnQucGVyZm9ybWFuY2VPYnNlcnZlcnNfID0ge307XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/iframe-transport.js