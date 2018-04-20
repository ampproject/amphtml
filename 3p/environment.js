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

import {listenParent} from './messaging';

/**
 * Info about the current document/iframe.
 * @type {boolean}
 */
let inViewport = true;

/**
 * @param {boolean} inV
 */
export function setInViewportForTesting(inV) {
  inViewport = inV;
}

// Active intervals. Must be global, because people clear intervals
// with clearInterval from a different window.
const intervals = {};
let intervalId = 0;

/**
 * Add instrumentation to a window and all child iframes.
 * @param {!Window} win
 */
export function manageWin(win) {
  try {
    manageWin_(win);
  } catch (e) {
    // We use a try block, because the ad integrations often swallow errors.
    console./*OK*/error(e.message, e.stack);
  }
}

/**
 * @param {!Window} win
 */
function manageWin_(win) {
  if (win.ampSeen) {
    return;
  }
  win.ampSeen = true;
  // Instrument window.
  instrumentEntryPoints(win);

  // Watch for new iframes.
  installObserver(win);
  // Existing iframes.
  maybeInstrumentsNodes(win, win.document.querySelectorAll('iframe'));
  blockSyncPopups(win);
}


/**
 * Add instrumentation code to doc.write.
 * @param {!Window} parent
 * @param {!Window} win
 */
function instrumentDocWrite(parent, win) {
  const doc = win.document;
  const close = doc.close;
  doc.close = function() {
    parent.ampManageWin = function(win) {
      manageWin(win);
    };
    if (!parent.ampSeen) {
      // .call does not work in Safari with document.write.
      doc.write('<script>window.parent.ampManageWin(window)</script>');
    }
    doc._close = close;
    return doc._close();
  };
}

/**
 * Add instrumentation code to iframe's srcdoc.
 * @param {!Window} parent
 * @param {!Element} iframe
 */
function instrumentSrcdoc(parent, iframe) {
  let srcdoc = iframe.getAttribute('srcdoc');
  parent.ampManageWin = function(win) {
    manageWin(win);
  };
  srcdoc += '<script>window.parent.ampManageWin(window)</script>';
  iframe.setAttribute('srcdoc', srcdoc);
}

/**
 * Instrument added nodes if they are instrumentable iframes.
 * @param {!Window} win
 * @param {!Array<!Node>|NodeList<!Node>|NodeList<!Element>|null} addedNodes
 */
function maybeInstrumentsNodes(win, addedNodes) {
  for (let n = 0; n < addedNodes.length; n++) {
    const node = addedNodes[n];
    try {
      if (node.tagName != 'IFRAME') {
        continue;
      }
      const src = node.getAttribute('src');
      const srcdoc = node.getAttribute('srcdoc');
      if (src == null || /^(about:|javascript:)/i.test(src.trim()) ||
          srcdoc) {
        if (node.contentWindow) {
          instrumentIframeWindow(node, win, node.contentWindow);
          node.addEventListener('load', () => {
            try {
              instrumentIframeWindow(node, win, node.contentWindow);
            } catch (e) {
              console./*OK*/error(e.message, e.stack);
            }
          });
        } else if (srcdoc) {
          instrumentSrcdoc(parent, node);
        }
      }
    } catch (e) {
      console./*OK*/error(e.message, e.stack);
    }
  }
}

/**
 * Installs a mutation observer in a window to look for iframes.
 * @param {!Element} node
 * @param {!Window} parent
 * @param {!Window} win
 */
function instrumentIframeWindow(node, parent, win) {
  if (win.ampSeen) {
    return;
  }
  const doc = win.document;
  instrumentDocWrite(parent, win);
  if (doc.body && doc.body.childNodes.length) {
    manageWin(win);
  }
}

/**
 * Installs a mutation observer in a window to look for iframes.
 * @param {!Window} win
 */
function installObserver(win) {
  if (!window.MutationObserver) {
    return;
  }
  const observer = new MutationObserver(function(mutations) {
    for (let i = 0; i < mutations.length; i++) {
      maybeInstrumentsNodes(win, mutations[i].addedNodes);
    }
  });
  observer.observe(win.document.documentElement, {
    subtree: true,
    childList: true,
  });
}

/**
 * Replace timers with variants that can be throttled.
 * @param {!Window} win
 */
function instrumentEntryPoints(win) {
  // Change setTimeout to respect a minimum timeout.
  const setTimeout = win.setTimeout;
  win.setTimeout = function(fn, time) {
    time = minTime(time);
    arguments[1] = time;
    return setTimeout.apply(this, arguments);
  };
  // Implement setInterval in terms of setTimeout to make
  // it respect the same rules
  win.setInterval = function(fn) {
    const id = intervalId++;
    const args = Array.prototype.slice.call(arguments);
    function wrapper() {
      next();
      if (typeof fn == 'string') {
        // Handle rare and dangerous string arg case.
        return (0, win.eval/*NOT OK but whatcha gonna do.*/).call(win, fn); // lgtm [js/useless-expression]
      } else {
        return fn.apply(this, arguments);
      }
    }
    args[0] = wrapper;
    function next() {
      intervals[id] = win.setTimeout.apply(win, args);
    }
    next();
    return id;
  };
  const clearInterval = win.clearInterval;
  win.clearInterval = function(id) {
    clearInterval(id);
    win.clearTimeout(intervals[id]);
    delete intervals[id];
  };
}

/**
 * Blackhole the legacy popups since they should never be used for anything.
 * @param {!Window} win
 */
function blockSyncPopups(win) {
  let count = 0;
  function maybeThrow() {
    // Prevent deep recursion.
    if (count++ > 2) {
      throw new Error('security error');
    }
  }
  try {
    win.alert = maybeThrow;
    win.prompt = function() {
      maybeThrow();
      return '';
    };
    win.confirm = function() {
      maybeThrow();
      return false;
    };
  } catch (e) {
    console./*OK*/error(e.message, e.stack);
  }
}

/**
 * Calculates the minimum time that a timeout should have right now.
 * @param {number|undefined} time
 * @return {number|undefined}
 */
function minTime(time) {
  if (!inViewport) {
    time += 1000;
  }
  // Eventually this should throttle like this:
  // - for timeouts in the order of a frame use requestAnimationFrame
  //   instead.
  // - only allow about 2-4 short timeouts (< 16ms) in a 16ms time frame.
  //   Throttle further timeouts to requestAnimationFrame.
  return time;
}

export function installEmbedStateListener() {
  listenParent(window, 'embed-state', function(data) {
    inViewport = data.inViewport;
  });
}
