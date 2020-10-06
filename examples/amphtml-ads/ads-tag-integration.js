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

/**
 * @fileoverview This is a sample bootstrap script for AMP in-a-box host.
 */

const win = window;
initInaboxHost(win);

// Enable amp-inabox APIs for all iframes. Normally, the actualy bootstrap
// script would be more specific about which iframes to support.
Array.prototype.push.apply(
    win.ampInaboxIframes, document.querySelectorAll('iframe'));

/**
 * A sample bootstrap script that is to be run in ads tag.
 *
 * @param {!Window} win
 */
function initInaboxHost(win) {
  const hostScriptUrl = '/dist/amp-inabox-host.js';
  preloadScript(win, hostScriptUrl);
  // Optional: preload a4a-v0.js as well.

  // Keep all iframes that potentially can render AMP content in this array
  win.ampInaboxIframes = win.ampInaboxIframes || [];
  // Keep all amp-inabox post-messages in this array.
  win.ampInaboxPendingMessages = win.ampInaboxPendingMessages || [];

  let hostScriptRequested = false;

  const listener = function(event) {
    if (!isInaboxMessage(event.data)) {
      return;
    }
    win.ampInaboxPendingMessages.push(event);

    // Load and execute host script once.
    if (hostScriptRequested) {
      return;
    }
    hostScriptRequested = true;
    // Load inabox-host.js when the 1st inabox message is received.
    loadScript(win, hostScriptUrl, function() {
      win.removeEventListener('message', listener);
      console.log('a4a-host.js loaded.');
    });
  };
  win.addEventListener('message', listener);
  console.log('A4A host bootstrapped.');
}

/**
 * @param {*} message
 * @return {boolean}
 */
function isInaboxMessage(message) {
  return typeof message === 'string' && message.indexOf('amp-') == 0;
}

/**
 * @param {!Window} win
 * @param {string} url
 */
function preloadScript(win, url) {
  const link = win.document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = 'script';
  win.document.head.appendChild(link);
}

/**
 * @param {!Window} win
 * @param {string} url
 * @param {function()} callback
 */
function loadScript(win, url, callback) {
  const script = win.document.createElement('script');
  script.src = url;
  script.onload = callback;
  win.document.body.appendChild(script);
}
