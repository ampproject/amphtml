/**
 * See `worker-dom` for the iframe proxy contract.
 */ 
const MESSAGE_TYPES = {
  ready: 'iframe-ready',
  init: 'init-worker',
  onmessage: 'onmessage',
  onerror: 'onerror',
  onmessageerror: 'onmessageerror',
  postMessage: 'postMessage',
};

let parentOrigin = '*';

function send(type, message) {
  if (type !== MESSAGE_TYPES.ready && parentOrigin === '*') {
    throw new Error('Broadcast banned except for iframe-ready message.');
  }
  parent.postMessage({type, message}, parentOrigin);
}

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
send(MESSAGE_TYPES.ready);

let worker = null;
// Listen for Worker Init.
listen(MESSAGE_TYPES.init, ({code}) => {
  if (worker) {
    return;
  }
  worker = new Worker(URL.createObjectURL(new Blob([code])));

  // Proxy messages Worker to parent Window.
  worker.onmessage = (e) => send(MESSAGE_TYPES.onmessage, e.data);
  worker.onmessageerror = (e) => send(MESSAGE_TYPES.onmessageerror, e.data);
  worker.onerror = (e) =>
    send(MESSAGE_TYPES.onerror, {
      lineno: e.lineno,
      colno: e.colno,
      message: e.message,
      filename: e.filename,
    });

  // Proxy message from parent Window to Worker.
  listen(MESSAGE_TYPES.postMessage, ({message}) => worker.postMessage(message));
});
