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

import {dev} from './log';
import {parseUrl} from './url';

/**
 * Sentinel used to force unlistening after a iframe is detached.
 * @type {string}
 */
const UNLISTEN_SENTINEL = 'unlisten';

/**
 * @typedef {{
 *   frame: !Element,
 *   events: !Object<string, !Array<function(!Object)>>
 * }}
 */
let WindowEventsDef;

/**
 * Returns a mapping from a URL's origin to an array of windows and their listenFor listeners.
 * @param {!Window} parentWin the window that created the iframe
 * @param {boolean} opt_create create the mapping if it does not exist
 * @return {?Object<string, !Array<!WindowEventsDef>>}
 */
function getListenFors(parentWin, opt_create) {
  let listeningFors = parentWin.listeningFors;

  if (!listeningFors && opt_create) {
    listeningFors = parentWin.listeningFors = Object.create(null);
  }
  return listeningFors || null;
}

/**
 * Returns an array of WindowEventsDef that have had any listenFor listeners registered for this origin.
 * @param {!Window} parentWin the window that created the iframe
 * @param {string} sentinel
 * @param {boolean} opt_create create the array if it does not exist
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
 * @param {!Window} parentWin the window that created the iframe
 * @param {!Element} iframe the iframe element who's context will trigger the
 *     event
 * @param {string=} opt_is3p
 * @return {?Object<string, !Array<function(!object)>>}
 */
function getOrCreateListenForEvents(parentWin, iframe, opt_is3p) {
  const origin = parseUrl(iframe.src).origin;
  const sentinel = getSentinel_(iframe, opt_is3p);
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
      origin: origin,
      events: Object.create(null),
    };
    listenSentinel.push(windowEvents);
  }

  return windowEvents.events;
}

/**
 * Returns an mapping of event names to listenFor listeners.
 * @param {!Window} parentWin the window that created the iframe
 * @param {string} sentinel
 * @param {string} origin the source window's origin
 * @param {!Window} triggerWin the window that triggered the event
 * @return {?Object<string, !Array<function(!object)>>}
 */
function getListenForEvents(parentWin, sentinel, origin, triggerWin) {
  const listenSentinel = getListenForSentinel(parentWin, sentinel);

  if (!listenSentinel) {
    return listenSentinel;
  }

  let windowEvents;
  for (let i = 0; i < listenSentinel.length; i++) {
    const we = listenSentinel[i];
    const contentWindow = we.frame.contentWindow;
    if (!contentWindow) {
      setTimeout(dropListenSentinel, 0, listenSentinel);
    } else if (sentinel == 'amp') {
      if (we.origin === origin && contentWindow === triggerWin) {
        windowEvents = we;
        break;
      }
    } else if (contentWindow === triggerWin || isDescendantWindow_(contentWindow, triggerWin)) {
      windowEvents = we;
      break;
    }
  }

  return windowEvents ? windowEvents.events : null;
}

function isDescendantWindow_(parent, descendant) {
  let win = descendant.parent;
  while (win != window.top) {
    if (win == parent) {
      return true;
    }
  }
  return false;
}

/**
 * Removes any listenFors registed on listenOrigin that do not have
 * a contentWindow (the frame was removed from the DOM tree).
 * @param {!Array<!WindowEventsDef>} listenSentinel
 */
function dropListenSentinel(listenSentinel) {
  const noopData = {sentinel: UNLISTEN_SENTINEL};

  for (let i = listenSentinel.length - 1; i >= 0; i--) {
    const windowEvents = listenSentinel[i];

    if (!windowEvents.frame.contentWindow) {
      listenSentinel.splice(i, 1);

      const events = windowEvents.events;
      for (const name in events) {
        // Splice here, so that each unlisten does not shift the array
        events[name].splice(0, Infinity).forEach(event => {
          event(noopData);
        });
      }
    }
  }
}

/**
 * Registers the global listenFor event listener if it has yet to be.
 * @param {!Window} parentWin
 */
function registerGlobalListenerIfNeeded(parentWin) {
  if (parentWin.listeningFors) {
    return;
  }
  const listenForListener = function(event) {
    if (!event.data) {
      return;
    }
    const data = parseIfNeeded(event.data);
    if (!data.sentinel) {
      return;
    }

    const listenForEvents = getListenForEvents(
      parentWin,
      data.sentinel,
      event.origin,
      event.source
    );
    if (!listenForEvents) {
      return;
    }

    let listeners = listenForEvents[data.type];
    if (!listeners) {
      return;
    }

    // We slice to avoid issues with adding another listener or unlistening
    // during iteration. We could move to a Doubly Linked List with
    // backtracking, but that's overly complicated.
    listeners = listeners.slice();
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener(data, event.source, event.origin);
    }
  };

  parentWin.addEventListener('message', listenForListener);
}

/**
 * Allows listening for message from the iframe. Returns an unlisten
 * function to remove the listener.
 *
 * @param {!Element} iframe.
 * @param {string} typeOfMessage.
 * @param {function(!Object, !Window, string)} callback Called when a message of this type
 *     arrives for this iframe.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @param {boolean=} opt_includingNestedWindows
 * @return {!Unlisten}
 */
export function listenFor(iframe, typeOfMessage, callback, opt_is3P, opt_includingNestedWindows) {
  dev.assert(iframe.src, 'only iframes with src supported');
  dev.assert(!iframe.parentNode, 'cannot register events on an attached ' +
      'iframe. It will cause hair-pulling bugs like #2942');
  const parentWin = iframe.ownerDocument.defaultView;

  registerGlobalListenerIfNeeded(parentWin);

  const listenForEvents = getOrCreateListenForEvents(
    parentWin,
    iframe,
    opt_is3P
  );


  let events = listenForEvents[typeOfMessage] ||
    (listenForEvents[typeOfMessage] = []);

  let unlisten;
  let listener = function(data, source, origin) {
    if (!opt_includingNestedWindows && source != iframe.contentWindow) {
      return;
    }

    if (data.sentinel == UNLISTEN_SENTINEL) {
      unlisten();
      return;
    }
    callback(data, source, origin);
  };

  events.push(listener);

  return unlisten = function() {
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
  };
}

/**
 * Allows listening for a message from the iframe and then removes the listener
 *
 * @param {!Element} iframe.
 * @param {string} typeOfMessage.
 * @param {function(!Object, !Window, string)} callback Called when a message of this type
 *     arrives for this iframe.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @return {!Unlisten}
 */
export function listenForOnce(iframe, typeOfMessage, callback, opt_is3P) {
  const unlisten = listenFor(iframe, typeOfMessage, (data, source, origin) => {
    unlisten();
    return callback(data, source, origin);
  }, opt_is3P);
  return unlisten;
}

/**
 * Posts a message to the iframe.
 * @param {!Element} element The iframe.
 * @param {string} type Type of the message.
 * @param {!Object} object Message payload.
 * @param {string} targetOrigin origin of the target.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 */
export function postMessage(iframe, type, object, targetOrigin, opt_is3P) {
  postMessageToWindows(iframe,
      [{win: iframe.contentWindow, origin: targetOrigin}], type, object,
      opt_is3P);
}

/**
 * Posts a message to the iframe.
 * @param {!Element} iframe The iframe.
 * @param {!Array<{win: !Window, origin: string}>} targets
 * @param {string} type Type of the message.
 * @param {!Object} object Message payload.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 */
export function postMessageToWindows(iframe, targets, type, object, opt_is3P) {
  if (!iframe.contentWindow) {
    return;
  }
  object.type = type;
  object.sentinel = getSentinel_(iframe, opt_is3P);
  if (opt_is3P) {
    // Serialize ourselves because that is much faster in Chrome.
    object = 'amp-' + JSON.stringify(object);
  }
  for (const target of targets) {
    target.win./*OK*/postMessage(object, target.origin);
  }
}

/**
 * Gets the sentinel string.
 * @param {!Element} iframe
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @returns {string} Sentinel string.
 * @private
 */
function getSentinel_(iframe, opt_is3P) {
  return opt_is3P ? iframe.getAttribute('data-amp-3p-sentinel') : 'amp';
}

/**
 * Json parses event.data if it needs to be
 * @returns {!Object} object message
 * @private
 */
function parseIfNeeded(data) {
  const shouldBeParsed = typeof data === 'string'
      && data.charAt(0) === '{';
  if (shouldBeParsed) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      log.warn('Postmessage could not be parsed. ' +
          'Is it in a valid JSON format?', e);
    }
  }
  return data;
}
