/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * See IframeWorker within `worker-dom` for the iframe proxy contract.
 */

/**
 * @enum {string}
 */
const MESSAGE_TYPE = {
  ready: 'iframe-ready',
  init: 'init-worker',
  onmessage: 'onmessage',
  onerror: 'onerror',
  onmessageerror: 'onmessageerror',
  postMessage: 'postMessage',
};

let parentOrigin = '*';

/**
 * @param {MessageType} type
 * @param {*} message
 */
function send(type, message) {
  if (type !== MESSAGE_TYPE.ready && parentOrigin === '*') {
    throw new Error('Broadcast banned except for iframe-ready message.');
  }
  parent./*OK*/ postMessage({type, message}, parentOrigin);
}

/**
 *
 * @param {MessageType} type
 * @param {*} handler
 */
function listen(type, handler) {
  window.addEventListener('message', (event) => {
    if (event.source !== parent) {
      return;
    }
    parentOrigin = event.origin;

    if (event.data.type === type) {
      handler(event.data);
    }
  });
}

// Send initialization.
send(MESSAGE_TYPE.ready);

let worker = null;
// Listen for Worker Init.
listen(MESSAGE_TYPE.init, ({code}) => {
  if (worker) {
    return;
  }
  worker = new Worker(URL.createObjectURL(new Blob([code])));

  // Proxy messages Worker to parent Window.
  worker.onmessage = (e) => send(MESSAGE_TYPE.onmessage, e.data);
  worker.onmessageerror = (e) => send(MESSAGE_TYPE.onmessageerror, e.data);
  worker.onerror = (e) =>
    send(MESSAGE_TYPE.onerror, {
      lineno: e.lineno,
      colno: e.colno,
      message: e.message,
      filename: e.filename,
    });

  // Proxy message from parent Window to Worker.
  listen(MESSAGE_TYPE./*OK*/ postMessage, ({message}) =>
    worker./*OK*/ postMessage(message)
  );
});
