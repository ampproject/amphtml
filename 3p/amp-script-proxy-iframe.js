/**
 * See IframeWorker within `worker-dom` for the iframe proxy contract.
 */

/**
 * @enum {string}
 */
const MessageType_Enum = {
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
  if (type !== MessageType_Enum.iframeReady && parentOrigin === '*') {
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
send(MessageType_Enum.iframeReady);

let worker = null;
// Listen for Worker Init.
listen(MessageType_Enum.init, ({code}) => {
  if (worker) {
    return;
  }
  worker = new Worker(URL.createObjectURL(new Blob([code])));

  // Proxy messages Worker to parent Window.
  worker.onmessage = (e) => send(MessageType_Enum.onmessage, e.data);
  worker.onmessageerror = (e) => send(MessageType_Enum.onmessageerror, e.data);
  worker.onerror = (e) =>
    send(MessageType_Enum.onerror, {
      lineno: e.lineno,
      colno: e.colno,
      message: e.message,
      filename: e.filename,
    });

  // Proxy message from parent Window to Worker.
  listen(MessageType_Enum./*OK*/ postMessage, ({message}) =>
    worker./*OK*/ postMessage(message)
  );

  send(MessageType_Enum.workerReady);
});
