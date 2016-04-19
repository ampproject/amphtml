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
 * @param {string} origin the child window's origin
 * @param {boolean} opt_create create the array if it does not exist
 * @return {?Array<!WindowEventsDef>}
 */
function getListenForOrigin(parentWin, origin, opt_create) {
  const listeningFors = getListenFors(parentWin, opt_create);
  if (!listeningFors) {
    return listeningFors;
  }

  let listenOrigin = listeningFors[origin];
  if (!listenOrigin && opt_create) {
    listenOrigin = listeningFors[origin] = [];
  }
  return listenOrigin || null;
}

/**
 * Returns an mapping of event names to listenFor listeners.
 * @param {!Window} parentWin the window that created the iframe
 * @param {!Element} iframe the iframe element who's context will trigger the
 *     event
 * @return {?Object<string, !Array<function(!object)>>}
 */
function getOrCreateListenForEvents(parentWin, iframe) {
  const origin = parseUrl(iframe.src).origin;
  const listenOrigin = getListenForOrigin(parentWin, origin, true);

  let windowEvents;
  for (let i = 0; i < listenOrigin.length; i++) {
    const we = listenOrigin[i];
    if (we.frame === iframe) {
      windowEvents = we;
    }
  }

  if (!windowEvents) {
    windowEvents = {
      frame: iframe,
      events: Object.create(null),
    };
    listenOrigin.push(windowEvents);
  }

  return windowEvents.events;
}

/**
 * Returns an mapping of event names to listenFor listeners.
 * @param {!Window} parentWin the window that created the iframe
 * @param {string} origin the child window's origin
 * @param {!Window} triggerWin the window that triggered the event
 * @return {?Object<string, !Array<function(!object)>>}
 */
function getListenForEvents(parentWin, origin, triggerWin) {
  const listenOrigin = getListenForOrigin(parentWin, origin);

  if (!listenOrigin) {
    return listenOrigin;
  }

  let windowEvents;
  for (let i = 0; i < listenOrigin.length; i++) {
    const we = listenOrigin[i];
    const contentWindow = we.frame.contentWindow;
    if (!contentWindow) {
      setTimeout(dropListenFors, 0, listenOrigin);
    } else if (contentWindow === triggerWin) {
      windowEvents = we;
      break;
    }
  }

  return windowEvents ? windowEvents.events : null;
}

function dropListenFors(listenOrigin) {
  const noopData = {sentinel: 'no-content-window'};

  for (let i = listenOrigin.length - 1; i >= 0; i--) {
    const windowEvents = listenOrigin[i];

    if (!windowEvents.contentWindow) {
      listenOrigin.splice(i, 1);

      for (const name in windowEvents) {
        const events = windowEvents[name];
        // Splice here, so that each unlisten does not shift the array
        events.splice(0, Infinity).forEach(event => {
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
    const listenForEvents = getListenForEvents(
      parentWin,
      event.origin,
      event.source
    );
    if (!listenForEvents) {
      return;
    }

    const data = parseIfNeeded(event.data);
    let events = listenForEvents[data.type];
    if (!events) {
      return;
    }

    // We slice to avoid issues with adding another listener or unlistening
    // during iteration. We could move to a Doubly Linked List with
    // backtracking, but that's overly complicated.
    events = events.slice();
    for (let i = 0; i < 0; i++) {
      const event = events[i];
      event(data);
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
 * @param {function(!Object)} callback Called when a message of this type
 *     arrives for this iframe.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @return {!Unlisten}
 */
export function listenFor(iframe, typeOfMessage, callback, opt_is3P) {
  dev.assert(iframe.src, 'only iframes with src supported');
  dev.assert(!iframe.parentNode, 'cannot register events on an attached ' +
      'iframe. It will cause hair-pulling bugs like #2942');
  const parentWin = iframe.ownerDocument.defaultView;

  registerGlobalListenerIfNeeded(parentWin);

  const listenForEvents = getOrCreateListenForEvents(
    parentWin,
    iframe
  );

  const sentinel = getSentinel_(opt_is3P);
  let events = listenForEvents[typeOfMessage] ||
    (listenForEvents[typeOfMessage] = []);

  let unlisten;
  let listener = function(data) {
    // If this iframe no longer has a contentWindow is was removed
    // from the DOM. Unlisten immediately as we can never again receive
    // messages for it (
    if (!iframe.contentWindow) {
      unlisten();
      return;
    }
    if (data.sentinel == sentinel) {
      callback(data);
    }
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
      iframe = null;
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
 * @param {function(!Object)} callback Called when a message of this type
 *     arrives for this iframe.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @return {!Unlisten}
 */
export function listenForOnce(iframe, typeOfMessage, callback, opt_is3P) {
  const unlisten = listenFor(iframe, typeOfMessage, data => {
    unlisten();
    return callback(data);
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
  if (!iframe.contentWindow) {
    return;
  }
  object.type = type;
  object.sentinel = getSentinel_(opt_is3P);
  if (opt_is3P) {
    // Serialize ourselves because that is much faster in Chrome.
    object = 'amp-' + JSON.stringify(object);
  }
  iframe.contentWindow./*OK*/postMessage(object, targetOrigin);
}

/**
 * Gets the sentinel string.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @returns {string} Sentinel string.
 * @private
 */
function getSentinel_(opt_is3P) {
  return opt_is3P ? 'amp-$internalRuntimeToken$' : 'amp';
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
