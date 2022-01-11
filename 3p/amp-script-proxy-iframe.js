/**
 * See IframeWorker within `worker-dom` for the iframe proxy contract.
 */

/**
 * @enum {string}
 */
const MESSAGE_TYPE = {
  iframeReady: 'iframe-ready',
  workerReady: 'worker-ready',
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
  if (type !== MESSAGE_TYPE.iframeReady && parentOrigin === '*') {
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
send(MESSAGE_TYPE.iframeReady);

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

  send(MESSAGE_TYPE.workerReady);
});
