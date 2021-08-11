function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
import { deserializeMessage, isAmpMessage } from "./3p-frame-messaging";
import { addAttributesToElement } from "./core/dom";
import { closestAncestorElementBySelector } from "./core/dom/query";
import { setStyle } from "./core/dom/style";
import { remove } from "./core/types/array";
import { dict } from "./core/types/object";
import { tryParseJson } from "./core/types/object/json";
import { getData } from "./event-helper";
import { dev, devAssert } from "./log";
import { parseUrlDeprecated } from "./url";

/**
 * Sentinel used to force unlistening after a iframe is detached.
 * @type {string}
 */
var UNLISTEN_SENTINEL = 'unlisten';

/**
 * @typedef {{
 *   frame: !Element,
 *   events: !Object<string, !Array<function(!JsonObject)>>
 * }}
 */
var WindowEventsDef;

/**
 * Returns a mapping from a URL's origin to an array of windows and their
 * listenFor listeners.
 * @param {?Window} parentWin the window that created the iframe
 * @param {boolean=} opt_create create the mapping if it does not exist
 * @return {?Object<string, !Array<!WindowEventsDef>>}
 */
function getListenFors(parentWin, opt_create) {
  var listeningFors = parentWin.listeningFors;

  if (!listeningFors && opt_create) {
    listeningFors = parentWin.listeningFors = Object.create(null);
  }

  return listeningFors || null;
}

/**
 * Returns an array of WindowEventsDef that have had any listenFor listeners
 * registered for this sentinel.
 * @param {?Window} parentWin the window that created the iframe
 * @param {string} sentinel the sentinel of the message
 * @param {boolean=} opt_create create the array if it does not exist
 * @return {?Array<!WindowEventsDef>}
 */
function getListenForSentinel(parentWin, sentinel, opt_create) {
  var listeningFors = getListenFors(parentWin, opt_create);

  if (!listeningFors) {
    return listeningFors;
  }

  var listenSentinel = listeningFors[sentinel];

  if (!listenSentinel && opt_create) {
    listenSentinel = listeningFors[sentinel] = [];
  }

  return listenSentinel || null;
}

/**
 * Returns an mapping of event names to listenFor listeners.
 * @param {?Window} parentWin the window that created the iframe
 * @param {!Element} iframe the iframe element who's context will trigger the
 *     event
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @return {?Object<string, !Array<function(!JsonObject, !Window, string, !MessageEvent)>>}
 */
function getOrCreateListenForEvents(parentWin, iframe, opt_is3P) {
  var sentinel = getSentinel_(iframe, opt_is3P);
  var listenSentinel = getListenForSentinel(parentWin, sentinel, true);
  var windowEvents;

  for (var i = 0; i < listenSentinel.length; i++) {
    var we = listenSentinel[i];

    if (we.frame === iframe) {
      windowEvents = we;
      break;
    }
  }

  if (!windowEvents) {
    windowEvents = {
      frame: iframe,
      events: Object.create(null)
    };
    listenSentinel.push(windowEvents);
  }

  return windowEvents.events;
}

/**
 * Returns an mapping of event names to listenFor listeners.
 * @param {?Window} parentWin the window that created the iframe
 * @param {string} sentinel the sentinel of the message
 * @param {string} origin the source window's origin
 * @param {?Window} triggerWin the window that triggered the event
 * @return {?Object<string, !Array<function(!JsonObject, !Window, string, !MessageEvent)>>}
 */
function getListenForEvents(parentWin, sentinel, origin, triggerWin) {
  var listenSentinel = getListenForSentinel(parentWin, sentinel);

  if (!listenSentinel) {
    return listenSentinel;
  }

  // Find the entry for the frame.
  // TODO(@nekodo): Add a WeakMap<Window, WindowEventsDef> cache to
  //     speed up this process.
  var windowEvents;

  for (var i = 0; i < listenSentinel.length; i++) {
    var we = listenSentinel[i];
    var contentWindow = we.frame.contentWindow;

    if (!contentWindow) {
      setTimeout(dropListenSentinel, 0, listenSentinel);
    } else if (triggerWin == contentWindow || isDescendantWindow(contentWindow, triggerWin)) {
      // 3p code path, we may accept messages from nested frames.
      windowEvents = we;
      break;
    }
  }

  return windowEvents ? windowEvents.events : null;
}

/**
 * Checks whether one window is a descendant of another by climbing
 * the parent chain.
 * @param {?Window} ancestor potential ancestor window
 * @param {?Window} descendant potential descendant window
 * @return {boolean}
 */
function isDescendantWindow(ancestor, descendant) {
  for (var win = descendant; win && win != win.parent; win = win.parent) {
    if (win == ancestor) {
      return true;
    }
  }

  return false;
}

/**
 * Removes any listenFors registed on listenSentinel that do not have
 * a contentWindow (the frame was removed from the DOM tree).
 * @param {!Array<!WindowEventsDef>} listenSentinel
 */
function dropListenSentinel(listenSentinel) {
  var noopData = dict({
    'sentinel': UNLISTEN_SENTINEL
  });

  for (var i = listenSentinel.length - 1; i >= 0; i--) {
    var windowEvents = listenSentinel[i];

    if (!windowEvents.frame.contentWindow) {
      listenSentinel.splice(i, 1);
      var events = windowEvents.events;

      for (var name in events) {
        // Splice here, so that each unlisten does not shift the array
        events[name].splice(0, Infinity).forEach(function (event) {
          event(noopData);
        });
      }
    }
  }
}

/**
 * Registers the global listenFor event listener if it has yet to be.
 * @param {?Window} parentWin
 */
function registerGlobalListenerIfNeeded(parentWin) {
  if (parentWin.listeningFors) {
    return;
  }

  var listenForListener = function listenForListener(event) {
    if (!getData(event)) {
      return;
    }

    var data = parseIfNeeded(getData(event));

    if (!data || !data['sentinel']) {
      return;
    }

    var listenForEvents = getListenForEvents(parentWin, data['sentinel'], event.origin, event.source);

    if (!listenForEvents) {
      return;
    }

    var listeners = listenForEvents[data['type']];

    if (!listeners) {
      return;
    }

    // We slice to avoid issues with adding another listener or unlistening
    // during iteration. We could move to a Doubly Linked List with
    // backtracking, but that's overly complicated.
    listeners = listeners.slice();

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener(data, event.source, event.origin, event);
    }
  };

  parentWin.addEventListener('message', listenForListener);
}

/**
 * Allows listening for message from the iframe. Returns an unlisten
 * function to remove the listener.
 *
 * @param {?Element} iframe
 * @param {string} typeOfMessage
 * @param {?function(!JsonObject, !Window, string, !MessageEvent)} callback Called when a
 *     message of this type arrives for this iframe.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @param {boolean=} opt_includingNestedWindows set to true if messages from
 *     nested frames should also be accepted.
 * @param {boolean=} opt_allowOpaqueOrigin set to true if messages from
       opaque origins (origin == null) are allowed.
 * @return {!UnlistenDef}
 */
export function listenFor(iframe, typeOfMessage, callback, opt_is3P, opt_includingNestedWindows, opt_allowOpaqueOrigin) {
  devAssert(iframe.src, 'only iframes with src supported');
  devAssert(!iframe.parentNode, 'cannot register events on an attached ' + 'iframe. It will cause hair-pulling bugs like #2942');
  devAssert(callback);
  var parentWin = iframe.ownerDocument.defaultView;
  registerGlobalListenerIfNeeded(parentWin);
  var listenForEvents = getOrCreateListenForEvents(parentWin, iframe, opt_is3P);
  var iframeOrigin = parseUrlDeprecated(iframe.src).origin;
  var events = listenForEvents[typeOfMessage] || (listenForEvents[typeOfMessage] = []);
  var unlisten;

  var listener = function listener(data, source, origin, event) {
    var sentinel = data['sentinel'];

    // Exclude messages that don't satisfy amp sentinel rules.
    if (sentinel == 'amp') {
      // For `amp` sentinel, nested windows are not allowed
      if (source != iframe.contentWindow) {
        return;
      }

      // For `amp` sentinel origin must match unless opaque origin is allowed
      var isOpaqueAndAllowed = origin == 'null' && opt_allowOpaqueOrigin;

      if (iframeOrigin != origin && !isOpaqueAndAllowed) {
        return;
      }
    }

    // Exclude nested frames if necessary.
    // Note that the source was already verified to be either the contentWindow
    // of the iframe itself or a descendant window within it.
    if (!opt_includingNestedWindows && source != iframe.contentWindow) {
      return;
    }

    if (data.sentinel == UNLISTEN_SENTINEL) {
      unlisten();
      return;
    }

    callback(data, source, origin, event);
  };

  events.push(listener);
  return unlisten = function unlisten() {
    if (listener) {
      var index = events.indexOf(listener);

      if (index > -1) {
        events.splice(index, 1);
      }

      // Make sure references to the unlisten function do not keep
      // alive too much.
      listener = null;
      events = null;
      callback = null;
    }
  };
}

/**
 * Returns a promise that resolves when one of given messages has been observed
 * for the first time. And remove listener for all other messages.
 * @param {!Element} iframe
 * @param {string|!Array<string>} typeOfMessages
 * @param {boolean=} opt_is3P
 * @return {!Promise<!{data: !JsonObject, source: !Window, origin: string, event: !MessageEvent}>}
 */
export function listenForOncePromise(iframe, typeOfMessages, opt_is3P) {
  var unlistenList = [];

  if (typeof typeOfMessages == 'string') {
    typeOfMessages = [typeOfMessages];
  }

  return new Promise(function (resolve) {
    for (var i = 0; i < typeOfMessages.length; i++) {
      var message = typeOfMessages[i];
      var unlisten = listenFor(iframe, message, function (data, source, origin, event) {
        for (var _i = 0; _i < unlistenList.length; _i++) {
          unlistenList[_i]();
        }

        resolve({
          data: data,
          source: source,
          origin: origin,
          event: event
        });
      }, opt_is3P);
      unlistenList.push(unlisten);
    }
  });
}

/**
 * Posts a message to the iframe.
 * @param {!Element} iframe The iframe.
 * @param {string} type Type of the message.
 * @param {!JsonObject} object Message payload.
 * @param {string} targetOrigin origin of the target.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 */
export function postMessage(iframe, type, object, targetOrigin, opt_is3P) {
  postMessageToWindows(iframe, [{
    win: iframe.contentWindow,
    origin: targetOrigin
  }], type, object, opt_is3P);
}

/**
 * Posts an identical message to multiple target windows with the same
 * sentinel.
 * The message is serialized only once.
 * @param {!Element} iframe The iframe.
 * @param {!Array<{win: !Window, origin: string}>} targets to send the message
 *     to, pairs of window and its origin.
 * @param {string} type Type of the message.
 * @param {!JsonObject} object Message payload.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 */
export function postMessageToWindows(iframe, targets, type, object, opt_is3P) {
  if (!iframe.contentWindow) {
    return;
  }

  object['type'] = type;
  object['sentinel'] = getSentinel_(iframe, opt_is3P);
  var payload = object;

  if (opt_is3P) {
    // Serialize ourselves because that is much faster in Chrome.
    payload = 'amp-' + JSON.stringify(object);
  }

  for (var i = 0; i < targets.length; i++) {
    var target = targets[i];
    target.win.
    /*OK*/
    postMessage(payload, target.origin);
  }
}

/**
 * Gets the sentinel string.
 * @param {!Element} iframe The iframe.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @return {string} Sentinel string.
 * @private
 */
function getSentinel_(iframe, opt_is3P) {
  return opt_is3P ? iframe.getAttribute('data-amp-3p-sentinel') : 'amp';
}

/**
 * JSON parses event.data if it needs to be
 * @param {*} data
 * @return {?JsonObject} object message
 * @private
 * @visibleForTesting
 */
export function parseIfNeeded(data) {
  if (typeof data == 'string') {
    if (data.charAt(0) == '{') {
      data = tryParseJson(data, function (e) {
        dev().warn('IFRAME-HELPER', 'Postmessage could not be parsed. ' + 'Is it in a valid JSON format?', e);
      }) || null;
    } else if (isAmpMessage(data)) {
      data = deserializeMessage(data);
    } else {
      data = null;
    }
  }

  return (
    /** @type {?JsonObject} */
    data
  );
}

/**
 * Manages a postMessage API for an iframe with a subscription message and
 * a way to broadcast messages to all subscribed windows, which
 * in turn must all be descendants of the contentWindow of the iframe.
 */
export var SubscriptionApi = /*#__PURE__*/function () {
  /**
   * @param {!Element} iframe The iframe.
   * @param {string} type Type of the subscription message.
   * @param {boolean} is3p set to true if the iframe is 3p.
   * @param {function(!JsonObject, !Window, string)} requestCallback Callback
   *     invoked whenever a new window subscribes.
   */
  function SubscriptionApi(iframe, type, is3p, requestCallback) {
    var _this = this;

    _classCallCheck(this, SubscriptionApi);

    /** @private @const {!Element} */
    this.iframe_ = iframe;

    /** @private @const {boolean} */
    this.is3p_ = is3p;

    /** @private @const {!Array<{win: !Window, origin: string}>} */
    this.clientWindows_ = [];

    /** @private @const {!UnlistenDef} */
    this.unlisten_ = listenFor(this.iframe_, type, function (data, source, origin) {
      // This message might be from any window within the iframe, we need
      // to keep track of which windows want to be sent updates.
      if (!_this.clientWindows_.some(function (entry) {
        return entry.win == source;
      })) {
        _this.clientWindows_.push({
          win: source,
          origin: origin
        });
      }

      requestCallback(data, source, origin);
    }, this.is3p_, // For 3P frames we also allow nested frames within them to subscribe..
    this.is3p_
    /* opt_includingNestedWindows */
    );
  }

  /**
   * Sends a message to all subscribed windows.
   * @param {string} type Type of the message.
   * @param {!JsonObject} data Message payload.
   */
  _createClass(SubscriptionApi, [{
    key: "send",
    value: function send(type, data) {
      // Remove clients that have been removed from the DOM.
      remove(this.clientWindows_, function (client) {
        return !client.win.parent;
      });
      postMessageToWindows(this.iframe_, this.clientWindows_, type, data, this.is3p_);
    }
    /**
     * Destroys iframe.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this.unlisten_();
      this.clientWindows_.length = 0;
    }
  }]);

  return SubscriptionApi;
}();

/**
 * @param {!Element} element
 * @return {boolean}
 */
export function looksLikeTrackingIframe(element) {
  var _element$getLayoutSiz = element.getLayoutSize(),
      height = _element$getLayoutSiz.height,
      width = _element$getLayoutSiz.width;

  // This heuristic is subject to change.
  if (width > 10 || height > 10) {
    return false;
  }

  // Iframe is not tracking iframe if open with user interaction
  return !closestAncestorElementBySelector(element, '.i-amphtml-overlay');
}
// Most common ad sizes
// Array of [width, height] pairs.
var adSizes = [[300, 250], [320, 50], [300, 50], [320, 100]];

/**
 * Guess whether this element might be an ad.
 * @param {!Element} element An amp-iframe element.
 * @return {boolean}
 * @visibleForTesting
 */
export function isAdLike(element) {
  var _element$getLayoutSiz2 = element.getLayoutSize(),
      height = _element$getLayoutSiz2.height,
      width = _element$getLayoutSiz2.width;

  for (var i = 0; i < adSizes.length; i++) {
    var refWidth = adSizes[i][0];
    var refHeight = adSizes[i][1];

    if (refHeight > height) {
      continue;
    }

    if (refWidth > width) {
      continue;
    }

    // Fuzzy matching to account for padding.
    if (height - refHeight <= 20 && width - refWidth <= 20) {
      return true;
    }
  }

  return false;
}

/**
 * @param {!Element} iframe
 * @return {!Element}
 */
export function disableScrollingOnIframe(iframe) {
  addAttributesToElement(iframe, dict({
    'scrolling': 'no'
  }));
  // This shouldn't work, but it does on Firefox.
  // https://stackoverflow.com/a/15494969
  setStyle(iframe, 'overflow', 'hidden');
  return iframe;
}

/**
 * Returns true if win's properties can be accessed and win is defined.
 * This functioned is used to determine if a window is cross-domained
 * from the perspective of the current window.
 * @param {!Window} win
 * @return {boolean}
 */
export function canInspectWindow(win) {
  // TODO: this is not reliable.  The compiler assumes that property reads are
  // side-effect free.  The recommended fix is to use goog.reflect.sinkValue
  // but since we're not using the closure library I'm not sure how to do this.
  // See https://github.com/google/closure-compiler/issues/3156
  try {
    // win['test'] could be truthy but not true the compiler shouldn't be able
    // to optimize this check away.
    return !!win.location.href && (win['test'] || true);
  } catch (unusedErr) {
    return false;
  }
}

/** @const {string} */
export var FIE_EMBED_PROP = '__AMP_EMBED__';

/**
 * Returns the embed created using `installFriendlyIframeEmbed` or `null`.
 * Caution: This will only return the FIE after the iframe has 'loaded'. If you
 * are checking before this signal you may be in a race condition that returns
 * null.
 * @param {!HTMLIFrameElement} iframe
 * @return {?./friendly-iframe-embed.FriendlyIframeEmbed}
 */
export function getFriendlyIframeEmbedOptional(iframe) {
  return (
    /** @type {?./friendly-iframe-embed.FriendlyIframeEmbed} */
    iframe[FIE_EMBED_PROP]
  );
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
export function isInFie(element) {
  return element.classList.contains('i-amphtml-fie') || !!closestAncestorElementBySelector(element, '.i-amphtml-fie');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlmcmFtZS1oZWxwZXIuanMiXSwibmFtZXMiOlsiZGVzZXJpYWxpemVNZXNzYWdlIiwiaXNBbXBNZXNzYWdlIiwiYWRkQXR0cmlidXRlc1RvRWxlbWVudCIsImNsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yIiwic2V0U3R5bGUiLCJyZW1vdmUiLCJkaWN0IiwidHJ5UGFyc2VKc29uIiwiZ2V0RGF0YSIsImRldiIsImRldkFzc2VydCIsInBhcnNlVXJsRGVwcmVjYXRlZCIsIlVOTElTVEVOX1NFTlRJTkVMIiwiV2luZG93RXZlbnRzRGVmIiwiZ2V0TGlzdGVuRm9ycyIsInBhcmVudFdpbiIsIm9wdF9jcmVhdGUiLCJsaXN0ZW5pbmdGb3JzIiwiT2JqZWN0IiwiY3JlYXRlIiwiZ2V0TGlzdGVuRm9yU2VudGluZWwiLCJzZW50aW5lbCIsImxpc3RlblNlbnRpbmVsIiwiZ2V0T3JDcmVhdGVMaXN0ZW5Gb3JFdmVudHMiLCJpZnJhbWUiLCJvcHRfaXMzUCIsImdldFNlbnRpbmVsXyIsIndpbmRvd0V2ZW50cyIsImkiLCJsZW5ndGgiLCJ3ZSIsImZyYW1lIiwiZXZlbnRzIiwicHVzaCIsImdldExpc3RlbkZvckV2ZW50cyIsIm9yaWdpbiIsInRyaWdnZXJXaW4iLCJjb250ZW50V2luZG93Iiwic2V0VGltZW91dCIsImRyb3BMaXN0ZW5TZW50aW5lbCIsImlzRGVzY2VuZGFudFdpbmRvdyIsImFuY2VzdG9yIiwiZGVzY2VuZGFudCIsIndpbiIsInBhcmVudCIsIm5vb3BEYXRhIiwic3BsaWNlIiwibmFtZSIsIkluZmluaXR5IiwiZm9yRWFjaCIsImV2ZW50IiwicmVnaXN0ZXJHbG9iYWxMaXN0ZW5lcklmTmVlZGVkIiwibGlzdGVuRm9yTGlzdGVuZXIiLCJkYXRhIiwicGFyc2VJZk5lZWRlZCIsImxpc3RlbkZvckV2ZW50cyIsInNvdXJjZSIsImxpc3RlbmVycyIsInNsaWNlIiwibGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwibGlzdGVuRm9yIiwidHlwZU9mTWVzc2FnZSIsImNhbGxiYWNrIiwib3B0X2luY2x1ZGluZ05lc3RlZFdpbmRvd3MiLCJvcHRfYWxsb3dPcGFxdWVPcmlnaW4iLCJzcmMiLCJwYXJlbnROb2RlIiwib3duZXJEb2N1bWVudCIsImRlZmF1bHRWaWV3IiwiaWZyYW1lT3JpZ2luIiwidW5saXN0ZW4iLCJpc09wYXF1ZUFuZEFsbG93ZWQiLCJpbmRleCIsImluZGV4T2YiLCJsaXN0ZW5Gb3JPbmNlUHJvbWlzZSIsInR5cGVPZk1lc3NhZ2VzIiwidW5saXN0ZW5MaXN0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJtZXNzYWdlIiwicG9zdE1lc3NhZ2UiLCJ0eXBlIiwib2JqZWN0IiwidGFyZ2V0T3JpZ2luIiwicG9zdE1lc3NhZ2VUb1dpbmRvd3MiLCJ0YXJnZXRzIiwicGF5bG9hZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0YXJnZXQiLCJnZXRBdHRyaWJ1dGUiLCJjaGFyQXQiLCJlIiwid2FybiIsIlN1YnNjcmlwdGlvbkFwaSIsImlzM3AiLCJyZXF1ZXN0Q2FsbGJhY2siLCJpZnJhbWVfIiwiaXMzcF8iLCJjbGllbnRXaW5kb3dzXyIsInVubGlzdGVuXyIsInNvbWUiLCJlbnRyeSIsImNsaWVudCIsImxvb2tzTGlrZVRyYWNraW5nSWZyYW1lIiwiZWxlbWVudCIsImdldExheW91dFNpemUiLCJoZWlnaHQiLCJ3aWR0aCIsImFkU2l6ZXMiLCJpc0FkTGlrZSIsInJlZldpZHRoIiwicmVmSGVpZ2h0IiwiZGlzYWJsZVNjcm9sbGluZ09uSWZyYW1lIiwiY2FuSW5zcGVjdFdpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsInVudXNlZEVyciIsIkZJRV9FTUJFRF9QUk9QIiwiZ2V0RnJpZW5kbHlJZnJhbWVFbWJlZE9wdGlvbmFsIiwiaXNJbkZpZSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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Q0E7QUFDQSxPQUFPLFNBQVNFLHdCQUFULENBQWtDMUYsTUFBbEMsRUFBMEM7QUFDL0N0QixFQUFBQSxzQkFBc0IsQ0FBQ3NCLE1BQUQsRUFBU2xCLElBQUksQ0FBQztBQUFDLGlCQUFhO0FBQWQsR0FBRCxDQUFiLENBQXRCO0FBRUE7QUFDQTtBQUNBRixFQUFBQSxRQUFRLENBQUNvQixNQUFELEVBQVMsVUFBVCxFQUFxQixRQUFyQixDQUFSO0FBRUEsU0FBT0EsTUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTMkYsZ0JBQVQsQ0FBMEJ4RSxHQUExQixFQUErQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUk7QUFDRjtBQUNBO0FBQ0EsV0FBTyxDQUFDLENBQUNBLEdBQUcsQ0FBQ3lFLFFBQUosQ0FBYUMsSUFBZixLQUF3QjFFLEdBQUcsQ0FBQyxNQUFELENBQUgsSUFBZSxJQUF2QyxDQUFQO0FBQ0QsR0FKRCxDQUlFLE9BQU8yRSxTQUFQLEVBQWtCO0FBQ2xCLFdBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQSxPQUFPLElBQU1DLGNBQWMsR0FBRyxlQUF2Qjs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyw4QkFBVCxDQUF3Q2hHLE1BQXhDLEVBQWdEO0FBQ3JEO0FBQU87QUFDTEEsSUFBQUEsTUFBTSxDQUFDK0YsY0FBRDtBQURSO0FBR0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNFLE9BQVQsQ0FBaUJmLE9BQWpCLEVBQTBCO0FBQy9CLFNBQ0VBLE9BQU8sQ0FBQ2dCLFNBQVIsQ0FBa0JDLFFBQWxCLENBQTJCLGVBQTNCLEtBQ0EsQ0FBQyxDQUFDeEgsZ0NBQWdDLENBQUN1RyxPQUFELEVBQVUsZ0JBQVYsQ0FGcEM7QUFJRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2Rlc2VyaWFsaXplTWVzc2FnZSwgaXNBbXBNZXNzYWdlfSBmcm9tICcuLzNwLWZyYW1lLW1lc3NhZ2luZyc7XG5pbXBvcnQge2FkZEF0dHJpYnV0ZXNUb0VsZW1lbnR9IGZyb20gJy4vY29yZS9kb20nO1xuaW1wb3J0IHtjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3Rvcn0gZnJvbSAnLi9jb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge3NldFN0eWxlfSBmcm9tICcuL2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7cmVtb3ZlfSBmcm9tICcuL2NvcmUvdHlwZXMvYXJyYXknO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcuL2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7dHJ5UGFyc2VKc29ufSBmcm9tICcuL2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuaW1wb3J0IHtnZXREYXRhfSBmcm9tICcuL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0fSBmcm9tICcuL2xvZyc7XG5pbXBvcnQge3BhcnNlVXJsRGVwcmVjYXRlZH0gZnJvbSAnLi91cmwnO1xuXG4vKipcbiAqIFNlbnRpbmVsIHVzZWQgdG8gZm9yY2UgdW5saXN0ZW5pbmcgYWZ0ZXIgYSBpZnJhbWUgaXMgZGV0YWNoZWQuXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5jb25zdCBVTkxJU1RFTl9TRU5USU5FTCA9ICd1bmxpc3Rlbic7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgZnJhbWU6ICFFbGVtZW50LFxuICogICBldmVudHM6ICFPYmplY3Q8c3RyaW5nLCAhQXJyYXk8ZnVuY3Rpb24oIUpzb25PYmplY3QpPj5cbiAqIH19XG4gKi9cbmxldCBXaW5kb3dFdmVudHNEZWY7XG5cbi8qKlxuICogUmV0dXJucyBhIG1hcHBpbmcgZnJvbSBhIFVSTCdzIG9yaWdpbiB0byBhbiBhcnJheSBvZiB3aW5kb3dzIGFuZCB0aGVpclxuICogbGlzdGVuRm9yIGxpc3RlbmVycy5cbiAqIEBwYXJhbSB7P1dpbmRvd30gcGFyZW50V2luIHRoZSB3aW5kb3cgdGhhdCBjcmVhdGVkIHRoZSBpZnJhbWVcbiAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9jcmVhdGUgY3JlYXRlIHRoZSBtYXBwaW5nIGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gKiBAcmV0dXJuIHs/T2JqZWN0PHN0cmluZywgIUFycmF5PCFXaW5kb3dFdmVudHNEZWY+Pn1cbiAqL1xuZnVuY3Rpb24gZ2V0TGlzdGVuRm9ycyhwYXJlbnRXaW4sIG9wdF9jcmVhdGUpIHtcbiAgbGV0IHtsaXN0ZW5pbmdGb3JzfSA9IHBhcmVudFdpbjtcblxuICBpZiAoIWxpc3RlbmluZ0ZvcnMgJiYgb3B0X2NyZWF0ZSkge1xuICAgIGxpc3RlbmluZ0ZvcnMgPSBwYXJlbnRXaW4ubGlzdGVuaW5nRm9ycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIH1cbiAgcmV0dXJuIGxpc3RlbmluZ0ZvcnMgfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIFdpbmRvd0V2ZW50c0RlZiB0aGF0IGhhdmUgaGFkIGFueSBsaXN0ZW5Gb3IgbGlzdGVuZXJzXG4gKiByZWdpc3RlcmVkIGZvciB0aGlzIHNlbnRpbmVsLlxuICogQHBhcmFtIHs/V2luZG93fSBwYXJlbnRXaW4gdGhlIHdpbmRvdyB0aGF0IGNyZWF0ZWQgdGhlIGlmcmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHNlbnRpbmVsIHRoZSBzZW50aW5lbCBvZiB0aGUgbWVzc2FnZVxuICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2NyZWF0ZSBjcmVhdGUgdGhlIGFycmF5IGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gKiBAcmV0dXJuIHs/QXJyYXk8IVdpbmRvd0V2ZW50c0RlZj59XG4gKi9cbmZ1bmN0aW9uIGdldExpc3RlbkZvclNlbnRpbmVsKHBhcmVudFdpbiwgc2VudGluZWwsIG9wdF9jcmVhdGUpIHtcbiAgY29uc3QgbGlzdGVuaW5nRm9ycyA9IGdldExpc3RlbkZvcnMocGFyZW50V2luLCBvcHRfY3JlYXRlKTtcbiAgaWYgKCFsaXN0ZW5pbmdGb3JzKSB7XG4gICAgcmV0dXJuIGxpc3RlbmluZ0ZvcnM7XG4gIH1cblxuICBsZXQgbGlzdGVuU2VudGluZWwgPSBsaXN0ZW5pbmdGb3JzW3NlbnRpbmVsXTtcbiAgaWYgKCFsaXN0ZW5TZW50aW5lbCAmJiBvcHRfY3JlYXRlKSB7XG4gICAgbGlzdGVuU2VudGluZWwgPSBsaXN0ZW5pbmdGb3JzW3NlbnRpbmVsXSA9IFtdO1xuICB9XG4gIHJldHVybiBsaXN0ZW5TZW50aW5lbCB8fCBudWxsO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gbWFwcGluZyBvZiBldmVudCBuYW1lcyB0byBsaXN0ZW5Gb3IgbGlzdGVuZXJzLlxuICogQHBhcmFtIHs/V2luZG93fSBwYXJlbnRXaW4gdGhlIHdpbmRvdyB0aGF0IGNyZWF0ZWQgdGhlIGlmcmFtZVxuICogQHBhcmFtIHshRWxlbWVudH0gaWZyYW1lIHRoZSBpZnJhbWUgZWxlbWVudCB3aG8ncyBjb250ZXh0IHdpbGwgdHJpZ2dlciB0aGVcbiAqICAgICBldmVudFxuICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2lzM1Agc2V0IHRvIHRydWUgaWYgdGhlIGlmcmFtZSBpcyAzcC5cbiAqIEByZXR1cm4gez9PYmplY3Q8c3RyaW5nLCAhQXJyYXk8ZnVuY3Rpb24oIUpzb25PYmplY3QsICFXaW5kb3csIHN0cmluZywgIU1lc3NhZ2VFdmVudCk+Pn1cbiAqL1xuZnVuY3Rpb24gZ2V0T3JDcmVhdGVMaXN0ZW5Gb3JFdmVudHMocGFyZW50V2luLCBpZnJhbWUsIG9wdF9pczNQKSB7XG4gIGNvbnN0IHNlbnRpbmVsID0gZ2V0U2VudGluZWxfKGlmcmFtZSwgb3B0X2lzM1ApO1xuICBjb25zdCBsaXN0ZW5TZW50aW5lbCA9IGdldExpc3RlbkZvclNlbnRpbmVsKHBhcmVudFdpbiwgc2VudGluZWwsIHRydWUpO1xuXG4gIGxldCB3aW5kb3dFdmVudHM7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdGVuU2VudGluZWwubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB3ZSA9IGxpc3RlblNlbnRpbmVsW2ldO1xuICAgIGlmICh3ZS5mcmFtZSA9PT0gaWZyYW1lKSB7XG4gICAgICB3aW5kb3dFdmVudHMgPSB3ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmICghd2luZG93RXZlbnRzKSB7XG4gICAgd2luZG93RXZlbnRzID0ge1xuICAgICAgZnJhbWU6IGlmcmFtZSxcbiAgICAgIGV2ZW50czogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICB9O1xuICAgIGxpc3RlblNlbnRpbmVsLnB1c2god2luZG93RXZlbnRzKTtcbiAgfVxuXG4gIHJldHVybiB3aW5kb3dFdmVudHMuZXZlbnRzO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gbWFwcGluZyBvZiBldmVudCBuYW1lcyB0byBsaXN0ZW5Gb3IgbGlzdGVuZXJzLlxuICogQHBhcmFtIHs/V2luZG93fSBwYXJlbnRXaW4gdGhlIHdpbmRvdyB0aGF0IGNyZWF0ZWQgdGhlIGlmcmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHNlbnRpbmVsIHRoZSBzZW50aW5lbCBvZiB0aGUgbWVzc2FnZVxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiB0aGUgc291cmNlIHdpbmRvdydzIG9yaWdpblxuICogQHBhcmFtIHs/V2luZG93fSB0cmlnZ2VyV2luIHRoZSB3aW5kb3cgdGhhdCB0cmlnZ2VyZWQgdGhlIGV2ZW50XG4gKiBAcmV0dXJuIHs/T2JqZWN0PHN0cmluZywgIUFycmF5PGZ1bmN0aW9uKCFKc29uT2JqZWN0LCAhV2luZG93LCBzdHJpbmcsICFNZXNzYWdlRXZlbnQpPj59XG4gKi9cbmZ1bmN0aW9uIGdldExpc3RlbkZvckV2ZW50cyhwYXJlbnRXaW4sIHNlbnRpbmVsLCBvcmlnaW4sIHRyaWdnZXJXaW4pIHtcbiAgY29uc3QgbGlzdGVuU2VudGluZWwgPSBnZXRMaXN0ZW5Gb3JTZW50aW5lbChwYXJlbnRXaW4sIHNlbnRpbmVsKTtcblxuICBpZiAoIWxpc3RlblNlbnRpbmVsKSB7XG4gICAgcmV0dXJuIGxpc3RlblNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRmluZCB0aGUgZW50cnkgZm9yIHRoZSBmcmFtZS5cbiAgLy8gVE9ETyhAbmVrb2RvKTogQWRkIGEgV2Vha01hcDxXaW5kb3csIFdpbmRvd0V2ZW50c0RlZj4gY2FjaGUgdG9cbiAgLy8gICAgIHNwZWVkIHVwIHRoaXMgcHJvY2Vzcy5cbiAgbGV0IHdpbmRvd0V2ZW50cztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0ZW5TZW50aW5lbC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHdlID0gbGlzdGVuU2VudGluZWxbaV07XG4gICAgY29uc3Qge2NvbnRlbnRXaW5kb3d9ID0gd2UuZnJhbWU7XG4gICAgaWYgKCFjb250ZW50V2luZG93KSB7XG4gICAgICBzZXRUaW1lb3V0KGRyb3BMaXN0ZW5TZW50aW5lbCwgMCwgbGlzdGVuU2VudGluZWwpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0cmlnZ2VyV2luID09IGNvbnRlbnRXaW5kb3cgfHxcbiAgICAgIGlzRGVzY2VuZGFudFdpbmRvdyhjb250ZW50V2luZG93LCB0cmlnZ2VyV2luKVxuICAgICkge1xuICAgICAgLy8gM3AgY29kZSBwYXRoLCB3ZSBtYXkgYWNjZXB0IG1lc3NhZ2VzIGZyb20gbmVzdGVkIGZyYW1lcy5cbiAgICAgIHdpbmRvd0V2ZW50cyA9IHdlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHdpbmRvd0V2ZW50cyA/IHdpbmRvd0V2ZW50cy5ldmVudHMgOiBudWxsO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIG9uZSB3aW5kb3cgaXMgYSBkZXNjZW5kYW50IG9mIGFub3RoZXIgYnkgY2xpbWJpbmdcbiAqIHRoZSBwYXJlbnQgY2hhaW4uXG4gKiBAcGFyYW0gez9XaW5kb3d9IGFuY2VzdG9yIHBvdGVudGlhbCBhbmNlc3RvciB3aW5kb3dcbiAqIEBwYXJhbSB7P1dpbmRvd30gZGVzY2VuZGFudCBwb3RlbnRpYWwgZGVzY2VuZGFudCB3aW5kb3dcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRGVzY2VuZGFudFdpbmRvdyhhbmNlc3RvciwgZGVzY2VuZGFudCkge1xuICBmb3IgKGxldCB3aW4gPSBkZXNjZW5kYW50OyB3aW4gJiYgd2luICE9IHdpbi5wYXJlbnQ7IHdpbiA9IHdpbi5wYXJlbnQpIHtcbiAgICBpZiAod2luID09IGFuY2VzdG9yKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYW55IGxpc3RlbkZvcnMgcmVnaXN0ZWQgb24gbGlzdGVuU2VudGluZWwgdGhhdCBkbyBub3QgaGF2ZVxuICogYSBjb250ZW50V2luZG93ICh0aGUgZnJhbWUgd2FzIHJlbW92ZWQgZnJvbSB0aGUgRE9NIHRyZWUpLlxuICogQHBhcmFtIHshQXJyYXk8IVdpbmRvd0V2ZW50c0RlZj59IGxpc3RlblNlbnRpbmVsXG4gKi9cbmZ1bmN0aW9uIGRyb3BMaXN0ZW5TZW50aW5lbChsaXN0ZW5TZW50aW5lbCkge1xuICBjb25zdCBub29wRGF0YSA9IGRpY3QoeydzZW50aW5lbCc6IFVOTElTVEVOX1NFTlRJTkVMfSk7XG5cbiAgZm9yIChsZXQgaSA9IGxpc3RlblNlbnRpbmVsLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3Qgd2luZG93RXZlbnRzID0gbGlzdGVuU2VudGluZWxbaV07XG5cbiAgICBpZiAoIXdpbmRvd0V2ZW50cy5mcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICBsaXN0ZW5TZW50aW5lbC5zcGxpY2UoaSwgMSk7XG5cbiAgICAgIGNvbnN0IHtldmVudHN9ID0gd2luZG93RXZlbnRzO1xuICAgICAgZm9yIChjb25zdCBuYW1lIGluIGV2ZW50cykge1xuICAgICAgICAvLyBTcGxpY2UgaGVyZSwgc28gdGhhdCBlYWNoIHVubGlzdGVuIGRvZXMgbm90IHNoaWZ0IHRoZSBhcnJheVxuICAgICAgICBldmVudHNbbmFtZV0uc3BsaWNlKDAsIEluZmluaXR5KS5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgICAgIGV2ZW50KG5vb3BEYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIHRoZSBnbG9iYWwgbGlzdGVuRm9yIGV2ZW50IGxpc3RlbmVyIGlmIGl0IGhhcyB5ZXQgdG8gYmUuXG4gKiBAcGFyYW0gez9XaW5kb3d9IHBhcmVudFdpblxuICovXG5mdW5jdGlvbiByZWdpc3Rlckdsb2JhbExpc3RlbmVySWZOZWVkZWQocGFyZW50V2luKSB7XG4gIGlmIChwYXJlbnRXaW4ubGlzdGVuaW5nRm9ycykge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBsaXN0ZW5Gb3JMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmICghZ2V0RGF0YShldmVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGF0YSA9IHBhcnNlSWZOZWVkZWQoZ2V0RGF0YShldmVudCkpO1xuXG4gICAgaWYgKCFkYXRhIHx8ICFkYXRhWydzZW50aW5lbCddKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGlzdGVuRm9yRXZlbnRzID0gZ2V0TGlzdGVuRm9yRXZlbnRzKFxuICAgICAgcGFyZW50V2luLFxuICAgICAgZGF0YVsnc2VudGluZWwnXSxcbiAgICAgIGV2ZW50Lm9yaWdpbixcbiAgICAgIGV2ZW50LnNvdXJjZVxuICAgICk7XG4gICAgaWYgKCFsaXN0ZW5Gb3JFdmVudHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGlzdGVuZXJzID0gbGlzdGVuRm9yRXZlbnRzW2RhdGFbJ3R5cGUnXV07XG4gICAgaWYgKCFsaXN0ZW5lcnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBXZSBzbGljZSB0byBhdm9pZCBpc3N1ZXMgd2l0aCBhZGRpbmcgYW5vdGhlciBsaXN0ZW5lciBvciB1bmxpc3RlbmluZ1xuICAgIC8vIGR1cmluZyBpdGVyYXRpb24uIFdlIGNvdWxkIG1vdmUgdG8gYSBEb3VibHkgTGlua2VkIExpc3Qgd2l0aFxuICAgIC8vIGJhY2t0cmFja2luZywgYnV0IHRoYXQncyBvdmVybHkgY29tcGxpY2F0ZWQuXG4gICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLnNsaWNlKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICAgICAgbGlzdGVuZXIoZGF0YSwgZXZlbnQuc291cmNlLCBldmVudC5vcmlnaW4sIGV2ZW50KTtcbiAgICB9XG4gIH07XG5cbiAgcGFyZW50V2luLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBsaXN0ZW5Gb3JMaXN0ZW5lcik7XG59XG5cbi8qKlxuICogQWxsb3dzIGxpc3RlbmluZyBmb3IgbWVzc2FnZSBmcm9tIHRoZSBpZnJhbWUuIFJldHVybnMgYW4gdW5saXN0ZW5cbiAqIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgbGlzdGVuZXIuXG4gKlxuICogQHBhcmFtIHs/RWxlbWVudH0gaWZyYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZU9mTWVzc2FnZVxuICogQHBhcmFtIHs/ZnVuY3Rpb24oIUpzb25PYmplY3QsICFXaW5kb3csIHN0cmluZywgIU1lc3NhZ2VFdmVudCl9IGNhbGxiYWNrIENhbGxlZCB3aGVuIGFcbiAqICAgICBtZXNzYWdlIG9mIHRoaXMgdHlwZSBhcnJpdmVzIGZvciB0aGlzIGlmcmFtZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9pczNQIHNldCB0byB0cnVlIGlmIHRoZSBpZnJhbWUgaXMgM3AuXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfaW5jbHVkaW5nTmVzdGVkV2luZG93cyBzZXQgdG8gdHJ1ZSBpZiBtZXNzYWdlcyBmcm9tXG4gKiAgICAgbmVzdGVkIGZyYW1lcyBzaG91bGQgYWxzbyBiZSBhY2NlcHRlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9hbGxvd09wYXF1ZU9yaWdpbiBzZXQgdG8gdHJ1ZSBpZiBtZXNzYWdlcyBmcm9tXG4gICAgICAgb3BhcXVlIG9yaWdpbnMgKG9yaWdpbiA9PSBudWxsKSBhcmUgYWxsb3dlZC5cbiAqIEByZXR1cm4geyFVbmxpc3RlbkRlZn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RlbkZvcihcbiAgaWZyYW1lLFxuICB0eXBlT2ZNZXNzYWdlLFxuICBjYWxsYmFjayxcbiAgb3B0X2lzM1AsXG4gIG9wdF9pbmNsdWRpbmdOZXN0ZWRXaW5kb3dzLFxuICBvcHRfYWxsb3dPcGFxdWVPcmlnaW5cbikge1xuICBkZXZBc3NlcnQoaWZyYW1lLnNyYywgJ29ubHkgaWZyYW1lcyB3aXRoIHNyYyBzdXBwb3J0ZWQnKTtcbiAgZGV2QXNzZXJ0KFxuICAgICFpZnJhbWUucGFyZW50Tm9kZSxcbiAgICAnY2Fubm90IHJlZ2lzdGVyIGV2ZW50cyBvbiBhbiBhdHRhY2hlZCAnICtcbiAgICAgICdpZnJhbWUuIEl0IHdpbGwgY2F1c2UgaGFpci1wdWxsaW5nIGJ1Z3MgbGlrZSAjMjk0MidcbiAgKTtcbiAgZGV2QXNzZXJ0KGNhbGxiYWNrKTtcbiAgY29uc3QgcGFyZW50V2luID0gaWZyYW1lLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXc7XG5cbiAgcmVnaXN0ZXJHbG9iYWxMaXN0ZW5lcklmTmVlZGVkKHBhcmVudFdpbik7XG5cbiAgY29uc3QgbGlzdGVuRm9yRXZlbnRzID0gZ2V0T3JDcmVhdGVMaXN0ZW5Gb3JFdmVudHMoXG4gICAgcGFyZW50V2luLFxuICAgIGlmcmFtZSxcbiAgICBvcHRfaXMzUFxuICApO1xuXG4gIGNvbnN0IGlmcmFtZU9yaWdpbiA9IHBhcnNlVXJsRGVwcmVjYXRlZChpZnJhbWUuc3JjKS5vcmlnaW47XG4gIGxldCBldmVudHMgPVxuICAgIGxpc3RlbkZvckV2ZW50c1t0eXBlT2ZNZXNzYWdlXSB8fCAobGlzdGVuRm9yRXZlbnRzW3R5cGVPZk1lc3NhZ2VdID0gW10pO1xuXG4gIGxldCB1bmxpc3RlbjtcbiAgbGV0IGxpc3RlbmVyID0gZnVuY3Rpb24gKGRhdGEsIHNvdXJjZSwgb3JpZ2luLCBldmVudCkge1xuICAgIGNvbnN0IHNlbnRpbmVsID0gZGF0YVsnc2VudGluZWwnXTtcblxuICAgIC8vIEV4Y2x1ZGUgbWVzc2FnZXMgdGhhdCBkb24ndCBzYXRpc2Z5IGFtcCBzZW50aW5lbCBydWxlcy5cbiAgICBpZiAoc2VudGluZWwgPT0gJ2FtcCcpIHtcbiAgICAgIC8vIEZvciBgYW1wYCBzZW50aW5lbCwgbmVzdGVkIHdpbmRvd3MgYXJlIG5vdCBhbGxvd2VkXG4gICAgICBpZiAoc291cmNlICE9IGlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIGBhbXBgIHNlbnRpbmVsIG9yaWdpbiBtdXN0IG1hdGNoIHVubGVzcyBvcGFxdWUgb3JpZ2luIGlzIGFsbG93ZWRcbiAgICAgIGNvbnN0IGlzT3BhcXVlQW5kQWxsb3dlZCA9IG9yaWdpbiA9PSAnbnVsbCcgJiYgb3B0X2FsbG93T3BhcXVlT3JpZ2luO1xuICAgICAgaWYgKGlmcmFtZU9yaWdpbiAhPSBvcmlnaW4gJiYgIWlzT3BhcXVlQW5kQWxsb3dlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXhjbHVkZSBuZXN0ZWQgZnJhbWVzIGlmIG5lY2Vzc2FyeS5cbiAgICAvLyBOb3RlIHRoYXQgdGhlIHNvdXJjZSB3YXMgYWxyZWFkeSB2ZXJpZmllZCB0byBiZSBlaXRoZXIgdGhlIGNvbnRlbnRXaW5kb3dcbiAgICAvLyBvZiB0aGUgaWZyYW1lIGl0c2VsZiBvciBhIGRlc2NlbmRhbnQgd2luZG93IHdpdGhpbiBpdC5cbiAgICBpZiAoIW9wdF9pbmNsdWRpbmdOZXN0ZWRXaW5kb3dzICYmIHNvdXJjZSAhPSBpZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChkYXRhLnNlbnRpbmVsID09IFVOTElTVEVOX1NFTlRJTkVMKSB7XG4gICAgICB1bmxpc3RlbigpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjYWxsYmFjayhkYXRhLCBzb3VyY2UsIG9yaWdpbiwgZXZlbnQpO1xuICB9O1xuXG4gIGV2ZW50cy5wdXNoKGxpc3RlbmVyKTtcblxuICByZXR1cm4gKHVubGlzdGVuID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChsaXN0ZW5lcikge1xuICAgICAgY29uc3QgaW5kZXggPSBldmVudHMuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBldmVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIC8vIE1ha2Ugc3VyZSByZWZlcmVuY2VzIHRvIHRoZSB1bmxpc3RlbiBmdW5jdGlvbiBkbyBub3Qga2VlcFxuICAgICAgLy8gYWxpdmUgdG9vIG11Y2guXG4gICAgICBsaXN0ZW5lciA9IG51bGw7XG4gICAgICBldmVudHMgPSBudWxsO1xuICAgICAgY2FsbGJhY2sgPSBudWxsO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIG9uZSBvZiBnaXZlbiBtZXNzYWdlcyBoYXMgYmVlbiBvYnNlcnZlZFxuICogZm9yIHRoZSBmaXJzdCB0aW1lLiBBbmQgcmVtb3ZlIGxpc3RlbmVyIGZvciBhbGwgb3RoZXIgbWVzc2FnZXMuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBpZnJhbWVcbiAqIEBwYXJhbSB7c3RyaW5nfCFBcnJheTxzdHJpbmc+fSB0eXBlT2ZNZXNzYWdlc1xuICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2lzM1BcbiAqIEByZXR1cm4geyFQcm9taXNlPCF7ZGF0YTogIUpzb25PYmplY3QsIHNvdXJjZTogIVdpbmRvdywgb3JpZ2luOiBzdHJpbmcsIGV2ZW50OiAhTWVzc2FnZUV2ZW50fT59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW5Gb3JPbmNlUHJvbWlzZShpZnJhbWUsIHR5cGVPZk1lc3NhZ2VzLCBvcHRfaXMzUCkge1xuICBjb25zdCB1bmxpc3Rlbkxpc3QgPSBbXTtcbiAgaWYgKHR5cGVvZiB0eXBlT2ZNZXNzYWdlcyA9PSAnc3RyaW5nJykge1xuICAgIHR5cGVPZk1lc3NhZ2VzID0gW3R5cGVPZk1lc3NhZ2VzXTtcbiAgfVxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHR5cGVPZk1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gdHlwZU9mTWVzc2FnZXNbaV07XG4gICAgICBjb25zdCB1bmxpc3RlbiA9IGxpc3RlbkZvcihcbiAgICAgICAgaWZyYW1lLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgICAoZGF0YSwgc291cmNlLCBvcmlnaW4sIGV2ZW50KSA9PiB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bmxpc3Rlbkxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHVubGlzdGVuTGlzdFtpXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvbHZlKHtkYXRhLCBzb3VyY2UsIG9yaWdpbiwgZXZlbnR9KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3B0X2lzM1BcbiAgICAgICk7XG4gICAgICB1bmxpc3Rlbkxpc3QucHVzaCh1bmxpc3Rlbik7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBQb3N0cyBhIG1lc3NhZ2UgdG8gdGhlIGlmcmFtZS5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGlmcmFtZSBUaGUgaWZyYW1lLlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVHlwZSBvZiB0aGUgbWVzc2FnZS5cbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IG9iamVjdCBNZXNzYWdlIHBheWxvYWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0T3JpZ2luIG9yaWdpbiBvZiB0aGUgdGFyZ2V0LlxuICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2lzM1Agc2V0IHRvIHRydWUgaWYgdGhlIGlmcmFtZSBpcyAzcC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvc3RNZXNzYWdlKGlmcmFtZSwgdHlwZSwgb2JqZWN0LCB0YXJnZXRPcmlnaW4sIG9wdF9pczNQKSB7XG4gIHBvc3RNZXNzYWdlVG9XaW5kb3dzKFxuICAgIGlmcmFtZSxcbiAgICBbe3dpbjogaWZyYW1lLmNvbnRlbnRXaW5kb3csIG9yaWdpbjogdGFyZ2V0T3JpZ2lufV0sXG4gICAgdHlwZSxcbiAgICBvYmplY3QsXG4gICAgb3B0X2lzM1BcbiAgKTtcbn1cblxuLyoqXG4gKiBQb3N0cyBhbiBpZGVudGljYWwgbWVzc2FnZSB0byBtdWx0aXBsZSB0YXJnZXQgd2luZG93cyB3aXRoIHRoZSBzYW1lXG4gKiBzZW50aW5lbC5cbiAqIFRoZSBtZXNzYWdlIGlzIHNlcmlhbGl6ZWQgb25seSBvbmNlLlxuICogQHBhcmFtIHshRWxlbWVudH0gaWZyYW1lIFRoZSBpZnJhbWUuXG4gKiBAcGFyYW0geyFBcnJheTx7d2luOiAhV2luZG93LCBvcmlnaW46IHN0cmluZ30+fSB0YXJnZXRzIHRvIHNlbmQgdGhlIG1lc3NhZ2VcbiAqICAgICB0bywgcGFpcnMgb2Ygd2luZG93IGFuZCBpdHMgb3JpZ2luLlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVHlwZSBvZiB0aGUgbWVzc2FnZS5cbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IG9iamVjdCBNZXNzYWdlIHBheWxvYWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfaXMzUCBzZXQgdG8gdHJ1ZSBpZiB0aGUgaWZyYW1lIGlzIDNwLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9zdE1lc3NhZ2VUb1dpbmRvd3MoaWZyYW1lLCB0YXJnZXRzLCB0eXBlLCBvYmplY3QsIG9wdF9pczNQKSB7XG4gIGlmICghaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgb2JqZWN0Wyd0eXBlJ10gPSB0eXBlO1xuICBvYmplY3RbJ3NlbnRpbmVsJ10gPSBnZXRTZW50aW5lbF8oaWZyYW1lLCBvcHRfaXMzUCk7XG4gIGxldCBwYXlsb2FkID0gb2JqZWN0O1xuICBpZiAob3B0X2lzM1ApIHtcbiAgICAvLyBTZXJpYWxpemUgb3Vyc2VsdmVzIGJlY2F1c2UgdGhhdCBpcyBtdWNoIGZhc3RlciBpbiBDaHJvbWUuXG4gICAgcGF5bG9hZCA9ICdhbXAtJyArIEpTT04uc3RyaW5naWZ5KG9iamVjdCk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGFyZ2V0c1tpXTtcbiAgICB0YXJnZXQud2luLi8qT0sqLyBwb3N0TWVzc2FnZShwYXlsb2FkLCB0YXJnZXQub3JpZ2luKTtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIHNlbnRpbmVsIHN0cmluZy5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGlmcmFtZSBUaGUgaWZyYW1lLlxuICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2lzM1Agc2V0IHRvIHRydWUgaWYgdGhlIGlmcmFtZSBpcyAzcC5cbiAqIEByZXR1cm4ge3N0cmluZ30gU2VudGluZWwgc3RyaW5nLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZ2V0U2VudGluZWxfKGlmcmFtZSwgb3B0X2lzM1ApIHtcbiAgcmV0dXJuIG9wdF9pczNQID8gaWZyYW1lLmdldEF0dHJpYnV0ZSgnZGF0YS1hbXAtM3Atc2VudGluZWwnKSA6ICdhbXAnO1xufVxuXG4vKipcbiAqIEpTT04gcGFyc2VzIGV2ZW50LmRhdGEgaWYgaXQgbmVlZHMgdG8gYmVcbiAqIEBwYXJhbSB7Kn0gZGF0YVxuICogQHJldHVybiB7P0pzb25PYmplY3R9IG9iamVjdCBtZXNzYWdlXG4gKiBAcHJpdmF0ZVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUlmTmVlZGVkKGRhdGEpIHtcbiAgaWYgKHR5cGVvZiBkYXRhID09ICdzdHJpbmcnKSB7XG4gICAgaWYgKGRhdGEuY2hhckF0KDApID09ICd7Jykge1xuICAgICAgZGF0YSA9XG4gICAgICAgIHRyeVBhcnNlSnNvbihkYXRhLCAoZSkgPT4ge1xuICAgICAgICAgIGRldigpLndhcm4oXG4gICAgICAgICAgICAnSUZSQU1FLUhFTFBFUicsXG4gICAgICAgICAgICAnUG9zdG1lc3NhZ2UgY291bGQgbm90IGJlIHBhcnNlZC4gJyArXG4gICAgICAgICAgICAgICdJcyBpdCBpbiBhIHZhbGlkIEpTT04gZm9ybWF0PycsXG4gICAgICAgICAgICBlXG4gICAgICAgICAgKTtcbiAgICAgICAgfSkgfHwgbnVsbDtcbiAgICB9IGVsc2UgaWYgKGlzQW1wTWVzc2FnZShkYXRhKSkge1xuICAgICAgZGF0YSA9IGRlc2VyaWFsaXplTWVzc2FnZShkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YSA9IG51bGw7XG4gICAgfVxuICB9XG4gIHJldHVybiAvKiogQHR5cGUgez9Kc29uT2JqZWN0fSAqLyAoZGF0YSk7XG59XG5cbi8qKlxuICogTWFuYWdlcyBhIHBvc3RNZXNzYWdlIEFQSSBmb3IgYW4gaWZyYW1lIHdpdGggYSBzdWJzY3JpcHRpb24gbWVzc2FnZSBhbmRcbiAqIGEgd2F5IHRvIGJyb2FkY2FzdCBtZXNzYWdlcyB0byBhbGwgc3Vic2NyaWJlZCB3aW5kb3dzLCB3aGljaFxuICogaW4gdHVybiBtdXN0IGFsbCBiZSBkZXNjZW5kYW50cyBvZiB0aGUgY29udGVudFdpbmRvdyBvZiB0aGUgaWZyYW1lLlxuICovXG5leHBvcnQgY2xhc3MgU3Vic2NyaXB0aW9uQXBpIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGlmcmFtZSBUaGUgaWZyYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUeXBlIG9mIHRoZSBzdWJzY3JpcHRpb24gbWVzc2FnZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBpczNwIHNldCB0byB0cnVlIGlmIHRoZSBpZnJhbWUgaXMgM3AuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUpzb25PYmplY3QsICFXaW5kb3csIHN0cmluZyl9IHJlcXVlc3RDYWxsYmFjayBDYWxsYmFja1xuICAgKiAgICAgaW52b2tlZCB3aGVuZXZlciBhIG5ldyB3aW5kb3cgc3Vic2NyaWJlcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGlmcmFtZSwgdHlwZSwgaXMzcCwgcmVxdWVzdENhbGxiYWNrKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5pZnJhbWVfID0gaWZyYW1lO1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pczNwXyA9IGlzM3A7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUFycmF5PHt3aW46ICFXaW5kb3csIG9yaWdpbjogc3RyaW5nfT59ICovXG4gICAgdGhpcy5jbGllbnRXaW5kb3dzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVVubGlzdGVuRGVmfSAqL1xuICAgIHRoaXMudW5saXN0ZW5fID0gbGlzdGVuRm9yKFxuICAgICAgdGhpcy5pZnJhbWVfLFxuICAgICAgdHlwZSxcbiAgICAgIChkYXRhLCBzb3VyY2UsIG9yaWdpbikgPT4ge1xuICAgICAgICAvLyBUaGlzIG1lc3NhZ2UgbWlnaHQgYmUgZnJvbSBhbnkgd2luZG93IHdpdGhpbiB0aGUgaWZyYW1lLCB3ZSBuZWVkXG4gICAgICAgIC8vIHRvIGtlZXAgdHJhY2sgb2Ygd2hpY2ggd2luZG93cyB3YW50IHRvIGJlIHNlbnQgdXBkYXRlcy5cbiAgICAgICAgaWYgKCF0aGlzLmNsaWVudFdpbmRvd3NfLnNvbWUoKGVudHJ5KSA9PiBlbnRyeS53aW4gPT0gc291cmNlKSkge1xuICAgICAgICAgIHRoaXMuY2xpZW50V2luZG93c18ucHVzaCh7d2luOiBzb3VyY2UsIG9yaWdpbn0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3RDYWxsYmFjayhkYXRhLCBzb3VyY2UsIG9yaWdpbik7XG4gICAgICB9LFxuICAgICAgdGhpcy5pczNwXyxcbiAgICAgIC8vIEZvciAzUCBmcmFtZXMgd2UgYWxzbyBhbGxvdyBuZXN0ZWQgZnJhbWVzIHdpdGhpbiB0aGVtIHRvIHN1YnNjcmliZS4uXG4gICAgICB0aGlzLmlzM3BfIC8qIG9wdF9pbmNsdWRpbmdOZXN0ZWRXaW5kb3dzICovXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1lc3NhZ2UgdG8gYWxsIHN1YnNjcmliZWQgd2luZG93cy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVHlwZSBvZiB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gZGF0YSBNZXNzYWdlIHBheWxvYWQuXG4gICAqL1xuICBzZW5kKHR5cGUsIGRhdGEpIHtcbiAgICAvLyBSZW1vdmUgY2xpZW50cyB0aGF0IGhhdmUgYmVlbiByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAgICByZW1vdmUodGhpcy5jbGllbnRXaW5kb3dzXywgKGNsaWVudCkgPT4gIWNsaWVudC53aW4ucGFyZW50KTtcbiAgICBwb3N0TWVzc2FnZVRvV2luZG93cyhcbiAgICAgIHRoaXMuaWZyYW1lXyxcbiAgICAgIHRoaXMuY2xpZW50V2luZG93c18sXG4gICAgICB0eXBlLFxuICAgICAgZGF0YSxcbiAgICAgIHRoaXMuaXMzcF9cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGlmcmFtZS5cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy51bmxpc3Rlbl8oKTtcbiAgICB0aGlzLmNsaWVudFdpbmRvd3NfLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9va3NMaWtlVHJhY2tpbmdJZnJhbWUoZWxlbWVudCkge1xuICBjb25zdCB7aGVpZ2h0LCB3aWR0aH0gPSBlbGVtZW50LmdldExheW91dFNpemUoKTtcbiAgLy8gVGhpcyBoZXVyaXN0aWMgaXMgc3ViamVjdCB0byBjaGFuZ2UuXG4gIGlmICh3aWR0aCA+IDEwIHx8IGhlaWdodCA+IDEwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIElmcmFtZSBpcyBub3QgdHJhY2tpbmcgaWZyYW1lIGlmIG9wZW4gd2l0aCB1c2VyIGludGVyYWN0aW9uXG4gIHJldHVybiAhY2xvc2VzdEFuY2VzdG9yRWxlbWVudEJ5U2VsZWN0b3IoZWxlbWVudCwgJy5pLWFtcGh0bWwtb3ZlcmxheScpO1xufVxuXG4vLyBNb3N0IGNvbW1vbiBhZCBzaXplc1xuLy8gQXJyYXkgb2YgW3dpZHRoLCBoZWlnaHRdIHBhaXJzLlxuY29uc3QgYWRTaXplcyA9IFtcbiAgWzMwMCwgMjUwXSxcbiAgWzMyMCwgNTBdLFxuICBbMzAwLCA1MF0sXG4gIFszMjAsIDEwMF0sXG5dO1xuXG4vKipcbiAqIEd1ZXNzIHdoZXRoZXIgdGhpcyBlbGVtZW50IG1pZ2h0IGJlIGFuIGFkLlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudCBBbiBhbXAtaWZyYW1lIGVsZW1lbnQuXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FkTGlrZShlbGVtZW50KSB7XG4gIGNvbnN0IHtoZWlnaHQsIHdpZHRofSA9IGVsZW1lbnQuZ2V0TGF5b3V0U2l6ZSgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFkU2l6ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZWZXaWR0aCA9IGFkU2l6ZXNbaV1bMF07XG4gICAgY29uc3QgcmVmSGVpZ2h0ID0gYWRTaXplc1tpXVsxXTtcbiAgICBpZiAocmVmSGVpZ2h0ID4gaGVpZ2h0KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHJlZldpZHRoID4gd2lkdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICAvLyBGdXp6eSBtYXRjaGluZyB0byBhY2NvdW50IGZvciBwYWRkaW5nLlxuICAgIGlmIChoZWlnaHQgLSByZWZIZWlnaHQgPD0gMjAgJiYgd2lkdGggLSByZWZXaWR0aCA8PSAyMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBpZnJhbWVcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZVNjcm9sbGluZ09uSWZyYW1lKGlmcmFtZSkge1xuICBhZGRBdHRyaWJ1dGVzVG9FbGVtZW50KGlmcmFtZSwgZGljdCh7J3Njcm9sbGluZyc6ICdubyd9KSk7XG5cbiAgLy8gVGhpcyBzaG91bGRuJ3Qgd29yaywgYnV0IGl0IGRvZXMgb24gRmlyZWZveC5cbiAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE1NDk0OTY5XG4gIHNldFN0eWxlKGlmcmFtZSwgJ292ZXJmbG93JywgJ2hpZGRlbicpO1xuXG4gIHJldHVybiBpZnJhbWU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHdpbidzIHByb3BlcnRpZXMgY2FuIGJlIGFjY2Vzc2VkIGFuZCB3aW4gaXMgZGVmaW5lZC5cbiAqIFRoaXMgZnVuY3Rpb25lZCBpcyB1c2VkIHRvIGRldGVybWluZSBpZiBhIHdpbmRvdyBpcyBjcm9zcy1kb21haW5lZFxuICogZnJvbSB0aGUgcGVyc3BlY3RpdmUgb2YgdGhlIGN1cnJlbnQgd2luZG93LlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5JbnNwZWN0V2luZG93KHdpbikge1xuICAvLyBUT0RPOiB0aGlzIGlzIG5vdCByZWxpYWJsZS4gIFRoZSBjb21waWxlciBhc3N1bWVzIHRoYXQgcHJvcGVydHkgcmVhZHMgYXJlXG4gIC8vIHNpZGUtZWZmZWN0IGZyZWUuICBUaGUgcmVjb21tZW5kZWQgZml4IGlzIHRvIHVzZSBnb29nLnJlZmxlY3Quc2lua1ZhbHVlXG4gIC8vIGJ1dCBzaW5jZSB3ZSdyZSBub3QgdXNpbmcgdGhlIGNsb3N1cmUgbGlicmFyeSBJJ20gbm90IHN1cmUgaG93IHRvIGRvIHRoaXMuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL2Nsb3N1cmUtY29tcGlsZXIvaXNzdWVzLzMxNTZcbiAgdHJ5IHtcbiAgICAvLyB3aW5bJ3Rlc3QnXSBjb3VsZCBiZSB0cnV0aHkgYnV0IG5vdCB0cnVlIHRoZSBjb21waWxlciBzaG91bGRuJ3QgYmUgYWJsZVxuICAgIC8vIHRvIG9wdGltaXplIHRoaXMgY2hlY2sgYXdheS5cbiAgICByZXR1cm4gISF3aW4ubG9jYXRpb24uaHJlZiAmJiAod2luWyd0ZXN0J10gfHwgdHJ1ZSk7XG4gIH0gY2F0Y2ggKHVudXNlZEVycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgRklFX0VNQkVEX1BST1AgPSAnX19BTVBfRU1CRURfXyc7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZW1iZWQgY3JlYXRlZCB1c2luZyBgaW5zdGFsbEZyaWVuZGx5SWZyYW1lRW1iZWRgIG9yIGBudWxsYC5cbiAqIENhdXRpb246IFRoaXMgd2lsbCBvbmx5IHJldHVybiB0aGUgRklFIGFmdGVyIHRoZSBpZnJhbWUgaGFzICdsb2FkZWQnLiBJZiB5b3VcbiAqIGFyZSBjaGVja2luZyBiZWZvcmUgdGhpcyBzaWduYWwgeW91IG1heSBiZSBpbiBhIHJhY2UgY29uZGl0aW9uIHRoYXQgcmV0dXJuc1xuICogbnVsbC5cbiAqIEBwYXJhbSB7IUhUTUxJRnJhbWVFbGVtZW50fSBpZnJhbWVcbiAqIEByZXR1cm4gez8uL2ZyaWVuZGx5LWlmcmFtZS1lbWJlZC5GcmllbmRseUlmcmFtZUVtYmVkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnJpZW5kbHlJZnJhbWVFbWJlZE9wdGlvbmFsKGlmcmFtZSkge1xuICByZXR1cm4gLyoqIEB0eXBlIHs/Li9mcmllbmRseS1pZnJhbWUtZW1iZWQuRnJpZW5kbHlJZnJhbWVFbWJlZH0gKi8gKFxuICAgIGlmcmFtZVtGSUVfRU1CRURfUFJPUF1cbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJbkZpZShlbGVtZW50KSB7XG4gIHJldHVybiAoXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ktYW1waHRtbC1maWUnKSB8fFxuICAgICEhY2xvc2VzdEFuY2VzdG9yRWxlbWVudEJ5U2VsZWN0b3IoZWxlbWVudCwgJy5pLWFtcGh0bWwtZmllJylcbiAgKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/iframe-helper.js