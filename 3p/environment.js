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

let rafId = 0;
let rafQueue = {};
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
    doc.write('<script>window.parent.ampManageWin(window)</script>');
    // .call does not work in Safari with document.write.
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
 * @param {!Array<!Node>} addedNodes
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
    return setTimeout(fn, time);
  };
  // Implement setInterval in terms of setTimeout to make
  // it respect the same rules
  win.setInterval = function(fn, time) {
    const id = intervalId++;
    function next() {
      intervals[id] = win.setTimeout(function() {
        next();
        if (typeof fn == 'string') {
          // Handle rare and dangerous string arg case.
          return (0, win.eval/*NOT OK but whatcha gonna do.*/).call(win, fn);
        } else {
          return fn.apply(this, arguments);
        }
      }, time);
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
  // Throttle requestAnimationFrame.
  const requestAnimationFrame = win.requestAnimationFrame ||
      win.webkitRequestAnimationFrame;
  win.requestAnimationFrame = function(cb) {
    if (!inViewport) {
      // If the doc is not visible, queue up the frames until we become
      // visible again.
      const id = rafId++;
      rafQueue[id] = [win, cb];
      // Only queue 20 frame requests to avoid mem leaks.
      delete rafQueue[id - 20];
      return id;
    }
    return requestAnimationFrame.call(this, cb);
  };
  const cancelAnimationFrame = win.cancelAnimationFrame;
  win.cancelAnimationFrame = function(id) {
    cancelAnimationFrame.call(this, id);
    delete rafQueue[id];
  };
  if (win.webkitRequestAnimationFrame) {
    win.webkitRequestAnimationFrame = win.requestAnimationFrame;
    win.webkitCancelAnimationFrame = win.webkitCancelRequestAnimationFrame =
        win.cancelAnimationFrame;
  }
}

/**
 * Run when we just became visible again. Runs all the queued up rafs.
 * @visibleForTesting
 */
export function becomeVisible() {
  for (const id in rafQueue) {
    if (rafQueue.hasOwnProperty(id)) {
      const f = rafQueue[id];
      f[0].requestAnimationFrame(f[1]);
    }
  }
  rafQueue = {};
}

/**
 * Calculates the minimum time that a timeout should have right now.
 * @param {number} time
 * @return {number}
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
    if (inViewport) {
      becomeVisible();
    }
  });
};
