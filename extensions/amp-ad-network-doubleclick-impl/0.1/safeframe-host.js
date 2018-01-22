import {tryParseJson} from '../../../src/json';
import {getData} from '../../../src/event-helper';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {IntersectionObserver} from '../../../src/intersection-observer';

/**
 * Used to manage messages for different fluid ad slots.
 *
 * Maps a sentinel value to an object consisting of the impl to which that
 * sentinel value belongs and the corresponding message handler for that impl.
 * @type{!Object<string, !{instance: !AmpAdNetworkDoubleclickImpl, connectionEstablished: boolean}>}
 */
const safeframeListeners = {};

const TAG = "AMP DOUBLECLICK SAFEFRAME";

/** @const {string} */
export const SAFEFRAME_ORIGIN = 'https://tpc.googlesyndication.com';

/** JSDOC */
function safeframeListener() {
  const data = tryParseJson(getData(event));
  if (event.origin != SAFEFRAME_ORIGIN || !data) {
    return;
  }
  if (data['e']) {
    // This is a request to establish a postmessaging connection.
    const listener = safeframeListeners[data['e']];
    if (!listener) {
      dev().warn(TAG, `Listener for sentinel ${data['e']} not found.`);
      return;
    }
    if (!listener.connectionEstablished) {
      listener.instance.connectMessagingChannel(data);
      listener.connectionEstablished = true;
    }
    return;
  }
  const payload = tryParseJson(data['p']);
  if (!payload /**|| !payload['sentinel']*/) {
    return;
  }
  const listener = safeframeListeners[Object.keys(safeframeListeners)[0]/**payload['sentinel']*/];
  if (!listener) {
    dev().warn(TAG, `Listener for sentinel ${payload['sentinel']} not found.`);
    return;
  }
  listener.instance.processMessage_(payload, data['s']);

}

export class SafeframeApi {

  constructor(baseInstance, win, sentinel) {
    this.baseInstance = baseInstance;
    this.win = win;
    this.sentinel = sentinel;
    this.IntersectionObserver = null;
  }

  registerSafeframeListener() {
    safeframeListeners[this.sentinel] = safeframeListeners[this.sentinel] || {
      instance: this,
      connectionEstablished: false,
    };
    if (Object.keys(safeframeListeners).length == 1) {
      this.win.addEventListener('message', safeframeListener, false);
    }
  }

  connectMessagingChannel(data) {
    dev().assert(this.baseInstance.iframe.contentWindow,
                 'Frame contentWindow unavailable.');
    this.setupSafeframeApi();
    this.sendMessage(JSON.stringify(dict({'message': 'connect', 'c': data.c})));
    this.startSendingGeom();
  }

  setupSafeframeApi() {
    this.IntersectionObserver = new IntersectionObserver(
        this.baseInstance, this.baseInstance.iframe, false, this);
    this.IntersectionObserver.startSendingIntersectionChanges_();

  }

  send(unused_trash, changes) {
    console.log("Overwrote send");
    console.log(JSON.stringify(changes));
  }

  startSendingGeom() {

  }

  formatGeom() {
    const message =   {
      'windowCoords_t': this.windowCoords.top,
      'windowCoords_r': this.windowCoords.right,
      'windowCoords_b': this.windowCoords.bottom,
      'windowCoords_l': this.windowCoords.left,
      'frameCoords_t': this.frameCoords.top,
      'frameCoords_r': this.frameCoords.right,
      'frameCoords_b': this.frameCoords.bottom,
      'frameCoords_l': this.frameCoords.left,
      'styleZIndex': this.styleZIndex,
      'allowedExpansion_t': this.allowedExpansion.top,
      'allowedExpansion_r': this.allowedExpansion.right,
      'allowedExpansion_b': this.allowedExpansion.bottom,
      'allowedExpansion_l': this.allowedExpansion.left,
      'xInView': this.xInView,
      'yInView': this.yInView
    };
    return message;
  }

  sendMessage(message) {
    this.baseInstance.iframe.contentWindow./*OK*/postMessage(
        message,
        SAFEFRAME_ORIGIN
    );
  }

  processMessage_(payload, messageType) {
    switch (messageType) {
      case 'creative_geometry_update':
        this.handleFluidMessage_(payload);
        break;
      case 'expand_request':
        this.handleExpandRequest_(payload);
    }
    return;
  }

  handleExpandRequest_(payload) {
    console.log("Handling expand request");
  }

  /**
   * Handles Fluid-related messages dispatched from SafeFrame.
   * @param {!JsonObject} payload
   * @private
   */
  handleFluidMessage_(payload) {
    let newHeight;
    if (!payload || !(newHeight = parseInt(payload['height'], 10))) {
      // TODO(levitzky) Add actual error handling here.
      this.baseInstance.forceCollapse();
      return;
    }
    this.baseInstance.attemptChangeHeight(newHeight)
        .then(() => this.baseInstance.onFluidResize_())
        .catch(() => {
          // TODO(levitzky) Add more error handling here
          this.baseInstance.forceCollapse();
        });
  }
};
