function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
      events: Object.create(null) };

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
    } else if (
    triggerWin == contentWindow ||
    isDescendantWindow(contentWindow, triggerWin))
    {
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
  var noopData = dict({ 'sentinel': UNLISTEN_SENTINEL });

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

    var listenForEvents = getListenForEvents(
    parentWin,
    data['sentinel'],
    event.origin,
    event.source);

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
export function listenFor(
iframe,
typeOfMessage,
callback,
opt_is3P,
opt_includingNestedWindows,
opt_allowOpaqueOrigin)
{
  devAssert(iframe.src);
  devAssert(
  !iframe.parentNode);



  devAssert(callback);
  var parentWin = iframe.ownerDocument.defaultView;

  registerGlobalListenerIfNeeded(parentWin);

  var listenForEvents = getOrCreateListenForEvents(
  parentWin,
  iframe,
  opt_is3P);


  var iframeOrigin = parseUrlDeprecated(iframe.src).origin;
  var events =
  listenForEvents[typeOfMessage] || (listenForEvents[typeOfMessage] = []);

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

  return (unlisten = function unlisten() {
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
  });
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
      var unlisten = listenFor(
      iframe,
      message,
      function (data, source, origin, event) {
        for (var _i = 0; _i < unlistenList.length; _i++) {
          unlistenList[_i]();
        }
        resolve({ data: data, source: source, origin: origin, event: event });
      },
      opt_is3P);

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
  postMessageToWindows(
  iframe,
  [{ win: iframe.contentWindow, origin: targetOrigin }],
  type,
  object,
  opt_is3P);

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
    target.win. /*OK*/postMessage(payload, target.origin);
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
      data =
      tryParseJson(data, function (e) {
        dev().warn(
        'IFRAME-HELPER',
        'Postmessage could not be parsed. ' +
        'Is it in a valid JSON format?',
        e);

      }) || null;
    } else if (isAmpMessage(data)) {
      data = deserializeMessage(data);
    } else {
      data = null;
    }
  }
  return (/** @type {?JsonObject} */(data));
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
  function SubscriptionApi(iframe, type, is3p, requestCallback) {var _this = this;_classCallCheck(this, SubscriptionApi);
    /** @private @const {!Element} */
    this.iframe_ = iframe;
    /** @private @const {boolean} */
    this.is3p_ = is3p;
    /** @private @const {!Array<{win: !Window, origin: string}>} */
    this.clientWindows_ = [];

    /** @private @const {!UnlistenDef} */
    this.unlisten_ = listenFor(
    this.iframe_,
    type,
    function (data, source, origin) {
      // This message might be from any window within the iframe, we need
      // to keep track of which windows want to be sent updates.
      if (!_this.clientWindows_.some(function (entry) {return entry.win == source;})) {
        _this.clientWindows_.push({ win: source, origin: origin });
      }
      requestCallback(data, source, origin);
    },
    this.is3p_,
    // For 3P frames we also allow nested frames within them to subscribe..
    this.is3p_ /* opt_includingNestedWindows */);

  }

  /**
   * Sends a message to all subscribed windows.
   * @param {string} type Type of the message.
   * @param {!JsonObject} data Message payload.
   */_createClass(SubscriptionApi, [{ key: "send", value:
    function send(type, data) {
      // Remove clients that have been removed from the DOM.
      remove(this.clientWindows_, function (client) {return !client.win.parent;});
      postMessageToWindows(
      this.iframe_,
      this.clientWindows_,
      type,
      data,
      this.is3p_);

    }

    /**
     * Destroys iframe.
     */ }, { key: "destroy", value:
    function destroy() {
      this.unlisten_();
      this.clientWindows_.length = 0;
    } }]);return SubscriptionApi;}();


/**
 * @param {!Element} element
 * @return {boolean}
 */
export function looksLikeTrackingIframe(element) {
  var _element$getLayoutSiz = element.getLayoutSize(),height = _element$getLayoutSiz.height,width = _element$getLayoutSiz.width;
  // This heuristic is subject to change.
  if (width > 10 || height > 10) {
    return false;
  }
  // Iframe is not tracking iframe if open with user interaction
  return !closestAncestorElementBySelector(element, '.i-amphtml-overlay');
}

// Most common ad sizes
// Array of [width, height] pairs.
var adSizes = [
[300, 250],
[320, 50],
[300, 50],
[320, 100]];


/**
 * Guess whether this element might be an ad.
 * @param {!Element} element An amp-iframe element.
 * @return {boolean}
 * @visibleForTesting
 */
export function isAdLike(element) {
  var _element$getLayoutSiz2 = element.getLayoutSize(),height = _element$getLayoutSiz2.height,width = _element$getLayoutSiz2.width;
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
  addAttributesToElement(iframe, dict({ 'scrolling': 'no' }));

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
  return (/** @type {?./friendly-iframe-embed.FriendlyIframeEmbed} */(
    iframe[FIE_EMBED_PROP]));

}

/**
 * @param {!Element} element
 * @return {boolean}
 */
export function isInFie(element) {
  return (
  element.classList.contains('i-amphtml-fie') ||
  !!closestAncestorElementBySelector(element, '.i-amphtml-fie'));

}
// /Users/mszylkowski/src/amphtml/src/iframe-helper.js