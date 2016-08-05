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


let debugLog = false;
let logElement = null;


/**
 * @param {boolean debug}
 */
export function initLog(debug) {
  debugLog = debug;
  logElement = document.getElementById('log');

  window.addEventListener('error', logError);
  window.addEventListener('unhandledrejection', logError);
}


function logError(event) {
  console.error('[ERROR]', event);
  log('[ERROR] ' + (event.message || event.reason || event));
}


export function log(message) {
  if (!debugLog) {
    return;
  }
  console.log('LOG: ' + message);
  if (logElement) {
    logElement.textContent = message + '\n' + logElement.textContent;
  }
}
