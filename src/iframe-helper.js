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

import {addAttributesToElement, closestAncestorElementBySelector} from './dom';
import {deserializeMessage, isAmpMessage} from './3p-frame-messaging';
import {dev, devAssert} from './log';
import {dict} from './utils/object';
import {getData} from './event-helper';
import {parseUrlDeprecated} from './url';
import {remove} from './utils/array';
import {setStyle} from './style';
import {tryParseJson} from './json';

/**
 * Sentinel used to force unlistening after a iframe is detached.
 * @type {string}
 */
const UNLISTEN_SENTINEL = 'unlisten';

/**
 * @typedef {{
 *   frame: !Element,
 *   events: !Object<string, !Array<function(!JsonObject)>>
 * }}
 */
let WindowEventsDef;

/**
 * Returns a mapping from a URL's origin to an array of windows and their
 * listenFor listeners.
 * @param {?Window} parentWin the window that created the iframe
 * @param {boolean=} opt_create create the mapping if it does not exist
 * @return {?Object<string, !Array<!WindowEventsDef>>}
 */
function getListenFors(parentWin, opt_create) {
  let {listeningFors} = parentWin;

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
  const listeningFors = getListenFors(parentWin, opt_create);
  if (!listeningFors) {
    return listeningFors;
  }

  let listenSentinel = listeningFors[sentinel];
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
  const sentinel = getSentinel_(iframe, opt_is3P);
  const listenSentinel = getListenForSentinel(parentWin, sentinel, true);

  let windowEvents;
  for (let i = 0; i < listenSentinel.length; i++) {
    const we = listenSentinel[i];
    if (we.frame === iframe) {
      windowEvents = we;
      break;
    }
  }

  if (!windowEvents) {
    windowEvents = {
      frame: iframe,
      events: Object.create(null),
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
  const listenSentinel = getListenForSentinel(parentWin, sentinel);

  if (!listenSentinel) {
    return listenSentinel;
  }

  // Find the entry for the frame.
  // TODO(@nekodo): Add a WeakMap<Window, WindowEventsDef> cache to
  //     speed up this process.
  let windowEvents;
  for (let i = 0; i < listenSentinel.length; i++) {
    const we = listenSentinel[i];
    const {contentWindow} = we.frame;
    if (!contentWindow) {
      setTimeout(dropListenSentinel, 0, listenSentinel);
    } else if (
      triggerWin == contentWindow ||
      isDescendantWindow(contentWindow, triggerWin)
    ) {
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
  for (let win = descendant; win && win != win.parent; win = win.parent) {
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
  const noopData = dict({'sentinel': UNLISTEN_SENTINEL});

  for (let i = listenSentinel.length - 1; i >= 0; i--) {
    const windowEvents = listenSentinel[i];

    if (!windowEvents.frame.contentWindow) {
      listenSentinel.splice(i, 1);

      const {events} = windowEvents;
      for (const name in events) {
        // Splice here, so that each unlisten does not shift the array
        events[name].splice(0, Infinity).forEach((event) => {
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
  const listenForListener = function (event) {
    if (!getData(event)) {
      return;
    }
    const data = parseIfNeeded(getData(event));

    if (!data || !data['sentinel']) {
      return;
    }

    const listenForEvents = getListenForEvents(
      parentWin,
      data['sentinel'],
      event.origin,
      event.source
    );
    if (!listenForEvents) {
      return;
    }

    let listeners = listenForEvents[data['type']];
    if (!listeners) {
      return;
    }

    // We slice to avoid issues with adding another listener or unlistening
    // during iteration. We could move to a Doubly Linked List with
    // backtracking, but that's overly complicated.
    listeners = listeners.slice();
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
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
  opt_allowOpaqueOrigin
) {
  devAssert(iframe.src, 'only iframes with src supported');
  devAssert(
    !iframe.parentNode,
    'cannot register events on an attached ' +
      'iframe. It will cause hair-pulling bugs like #2942'
  );
  devAssert(callback);
  const parentWin = iframe.ownerDocument.defaultView;

  registerGlobalListenerIfNeeded(parentWin);

  const listenForEvents = getOrCreateListenForEvents(
    parentWin,
    iframe,
    opt_is3P
  );

  const iframeOrigin = parseUrlDeprecated(iframe.src).origin;
  let events =
    listenForEvents[typeOfMessage] || (listenForEvents[typeOfMessage] = []);

  let unlisten;
  let listener = function (data, source, origin, event) {
    const sentinel = data['sentinel'];

    // Exclude messages that don't satisfy amp sentinel rules.
    if (sentinel == 'amp') {
      // For `amp` sentinel, nested windows are not allowed
      if (source != iframe.contentWindow) {
        return;
      }

      // For `amp` sentinel origin must match unless opaque origin is allowed
      const isOpaqueAndAllowed = origin == 'null' && opt_allowOpaqueOrigin;
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

  return (unlisten = function () {
    if (listener) {
      const index = events.indexOf(listener);
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
  const unlistenList = [];
  if (typeof typeOfMessages == 'string') {
    typeOfMessages = [typeOfMessages];
  }
  return new Promise((resolve) => {
    for (let i = 0; i < typeOfMessages.length; i++) {
      const message = typeOfMessages[i];
      const unlisten = listenFor(
        iframe,
        message,
        (data, source, origin, event) => {
          for (let i = 0; i < unlistenList.length; i++) {
            unlistenList[i]();
          }
          resolve({data, source, origin, event});
        },
        opt_is3P
      );
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
    [{win: iframe.contentWindow, origin: targetOrigin}],
    type,
    object,
    opt_is3P
  );
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
  let payload = object;
  if (opt_is3P) {
    // Serialize ourselves because that is much faster in Chrome.
    payload = 'amp-' + JSON.stringify(object);
  }
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    target.win./*OK*/ postMessage(payload, target.origin);
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
        tryParseJson(data, (e) => {
          dev().warn(
            'IFRAME-HELPER',
            'Postmessage could not be parsed. ' +
              'Is it in a valid JSON format?',
            e
          );
        }) || null;
    } else if (isAmpMessage(data)) {
      data = deserializeMessage(data);
    } else {
      data = null;
    }
  }
  return /** @type {?JsonObject} */ (data);
}

/**
 * Manages a postMessage API for an iframe with a subscription message and
 * a way to broadcast messages to all subscribed windows, which
 * in turn must all be descendants of the contentWindow of the iframe.
 */
export class SubscriptionApi {
  /**
   * @param {!Element} iframe The iframe.
   * @param {string} type Type of the subscription message.
   * @param {boolean} is3p set to true if the iframe is 3p.
   * @param {function(!JsonObject, !Window, string)} requestCallback Callback
   *     invoked whenever a new window subscribes.
   */
  constructor(iframe, type, is3p, requestCallback) {
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
      (data, source, origin) => {
        // This message might be from any window within the iframe, we need
        // to keep track of which windows want to be sent updates.
        if (!this.clientWindows_.some((entry) => entry.win == source)) {
          this.clientWindows_.push({win: source, origin});
        }
        requestCallback(data, source, origin);
      },
      this.is3p_,
      // For 3P frames we also allow nested frames within them to subscribe..
      this.is3p_ /* opt_includingNestedWindows */
    );
  }

  /**
   * Sends a message to all subscribed windows.
   * @param {string} type Type of the message.
   * @param {!JsonObject} data Message payload.
   */
  send(type, data) {
    // Remove clients that have been removed from the DOM.
    remove(this.clientWindows_, (client) => !client.win.parent);
    postMessageToWindows(
      this.iframe_,
      this.clientWindows_,
      type,
      data,
      this.is3p_
    );
  }

  /**
   * Destroys iframe.
   */
  destroy() {
    this.unlisten_();
    this.clientWindows_.length = 0;
  }
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
export function looksLikeTrackingIframe(element) {
  const {width, height} = element.getLayoutSize();
  // This heuristic is subject to change.
  if (width > 10 || height > 10) {
    return false;
  }
  // Iframe is not tracking iframe if open with user interaction
  return !closestAncestorElementBySelector(element, '.i-amphtml-overlay');
}

// Most common ad sizes
// Array of [width, height] pairs.
const adSizes = [
  [300, 250],
  [320, 50],
  [300, 50],
  [320, 100],
];

/**
 * Guess whether this element might be an ad.
 * @param {!Element} element An amp-iframe element.
 * @return {boolean}
 * @visibleForTesting
 */
export function isAdLike(element) {
  const {width, height} = element.getLayoutSize();
  for (let i = 0; i < adSizes.length; i++) {
    const refWidth = adSizes[i][0];
    const refHeight = adSizes[i][1];
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
  addAttributesToElement(iframe, dict({'scrolling': 'no'}));

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
export const FIE_EMBED_PROP = '__AMP_EMBED__';

/**
 * Returns the embed created using `installFriendlyIframeEmbed` or `null`.
 * Caution: This will only return the FIE after the iframe has 'loaded'. If you
 * are checking before this signal you may be in a race condition that returns
 * null.
 * @param {!HTMLIFrameElement} iframe
 * @return {?./friendly-iframe-embed.FriendlyIframeEmbed}
 */
export function getFriendlyIframeEmbedOptional(iframe) {
  return /** @type {?./friendly-iframe-embed.FriendlyIframeEmbed} */ (iframe[
    FIE_EMBED_PROP
  ]);
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
export function isInFie(element) {
  return (
    element.classList.contains('i-amphtml-fie') ||
    !!closestAncestorElementBySelector(element, '.i-amphtml-fie')
  );
}
