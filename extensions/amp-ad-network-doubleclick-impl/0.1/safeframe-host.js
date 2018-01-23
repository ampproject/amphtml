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

const MESSAGE_FIELDS = {
  CHANNEL_NAME: 'c',
  SENTINEL: 'e',
}

const TAG = "AMP DOUBLECLICK SAFEFRAME";

/** @const {string} */
export const SAFEFRAME_ORIGIN = 'https://tpc.googlesyndication.com';

/** JSDOC */
function safeframeListener() {
  const data = tryParseJson(getData(event));
  if (event.origin != SAFEFRAME_ORIGIN || !data) {
    return;
  }
  if (data[MESSAGE_FIELDS.SENTINEL]) {
    // This is a request to establish a postmessaging connection.
    const listener = safeframeListeners[data[MESSAGE_FIELDS.SENTINEL]];
    if (!listener) {
      dev().warn(TAG, `Listener for sentinel ${data[MESSAGE_FIELDS.SENTINEL]} not found.`);
      return;
    }
    if (!listener.connectionEstablished) {
      listener.instance.connectMessagingChannel(data);
      listener.connectionEstablished = true;
      listener.instance.channel = data[MESSAGE_FIELDS.CHANNEL_NAME];
    }
    return;
  }
  const payload = tryParseJson(data['p']);
  if (!payload || !payload['sentinel']) {
    return;
  }
  const listener = safeframeListeners[payload['sentinel']];
  if (!listener) {
    dev().warn(TAG, `Listener for sentinel ${payload['sentinel']} not found.`);
    return;
  }
  listener.instance.processMessage_(payload, data['s']);

}

export class SafeframeApi {

  constructor(baseInstance, win, sentinel) {
    this.baseInstance = baseInstance;
    this.uiHandler = baseInstance.uiHandler;
    this.win = win;
    this.sentinel = sentinel;
    this.IntersectionObserver = null;
    this.channel = null;
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
    this.sendMessage(JSON.stringify(dict({
      'message': 'connect',
      c: data[MESSAGE_FIELDS.CHANNEL_NAME]
    })));
  }

  setupSafeframeApi() {
    this.IntersectionObserver = new IntersectionObserver(
        this.baseInstance, this.baseInstance.iframe, false, this);
    this.IntersectionObserver.startSendingIntersectionChanges_();

  }

  /**
   *  Do not change name. This is named as 'send' as a hack to allow us to use
   *  IntersectionObserver without needing to do any major refactoring of it.
   */
  send(unused_trash, changes) {
    this.sendGeom(changes);
  }

  sendGeom(changes) {
    const geomChanges = this.formatGeom(changes['changes'][0]);
    newGeometry = JSON.stringify(geomChanges);
    const geomMessage = JSON.stringify({
      s: "geometry_update",
      p: JSON.stringify({
        newGeometry,
        uid: 1,
      }),
      c: this.channel,
    });

    this.sendMessage(geomMessage);
  }

  formatGeom(changes) {
    const percInView = (a1, b1, a2, b2) => {
      const lengthInView = (b2 >= b1) ? b1 - a2 : b2;
      const percInView = lengthInView / (b2 - a2);
      if (percInView < 0) {
        return 0;
      } else if (percInView > 1) {
        return 1;
      } else {
        return percInView;
      }
    };
    const message =   {
      'windowCoords_t': changes.rootBounds.top,
      'windowCoords_r': changes.rootBounds.right,
      'windowCoords_b': changes.rootBounds.bottom,
      'windowCoords_l': changes.rootBounds.left,
      'frameCoords_t': changes.boundingClientRect.top,
      'frameCoords_r': changes.boundingClientRect.right,
      'frameCoords_b': changes.boundingClientRect.bottom,
      'frameCoords_l': changes.boundingClientRect.left,
      'styleZIndex': '1',
      'allowedExpansion_t': 0,
      'allowedExpansion_r': 0,
      'allowedExpansion_b': 0,
      'allowedExpansion_l': 0,
      'xInView': percInView(changes.rootBounds.top,
                            changes.rootBounds.bottom,
                            changes.boundingClientRect.top,
                            changes.boundingClientRect.bottom),
      'yInView': percInView(changes.rootBounds.left,
                            changes.rootBounds.right,
                            changes.boundingClientRect.left,
                            changes.boundingClientRect.right),
    };
    console.log(JSON.stringify(message));
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
      case 'register_done':
        this.handleRegisterDone_(payload);
    }
    return;
  }

  handleRegisterDone_(payload) {
    this.initialHeight = payload.initialHeight;
    this.initialWidth = payload.initialWidth;
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
