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

let safeframeListenerCreated = false;

const MESSAGE_FIELDS = {
  CHANNEL_NAME: 'c',
  SENTINEL: 'e',
};

const TAG = 'AMP DOUBLECLICK SAFEFRAME';

/** @const {string} */
export const SAFEFRAME_ORIGIN = 'https://tpc.googlesyndication.com';

/**
 * Event listener callback for message events. If message is a Safeframe message,
 * handles the message.
 * Registered within SafeframeApi
 *
 */
function safeframeListener() {
  const data = tryParseJson(getData(event));
  if (event.origin != SAFEFRAME_ORIGIN || !data) {
    return;
  }

  /**
   * If the sentinel is provided at the top level, this is a message simply
   * to setup the postMessage channel, so set it up.
   */
  if (data[MESSAGE_FIELDS.SENTINEL]) {
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

  /**
   * If sentinel not provided at top level, parse the payload and process the message.
   */
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

/**
 * This class is designed to setup the host for GPT Safeframe.
 */
export class SafeframeApi {

  /**
   * @param {AmpAdNetworkDoubleclickImpl} baseInstance
   *
   */
  constructor(baseInstance) {
    /** @private {AmpAdNetworkDoubleclickImpl} */
    this.baseInstance = baseInstance;

    /** {?AMP.AmpAdUIHandler} */
    this.uiHandler = baseInstance.uiHandler;

    /** {Window} */
    this.win = baseInstance.win;

    /** {string} */
    this.sentinel = baseInstance.sentinel;

    /** @private {?IntersectionObserver} */
    this.IntersectionObserver = null;

    /** {string} */
    this.channel = null;

    /** {number} */
    this.initialHeight = null;

    /** {number} */
    this.initialWidth = null;

    this.currentGeometry = null;
  }

  registerSafeframeListener() {
    safeframeListeners[this.sentinel] = safeframeListeners[this.sentinel] || {
      instance: this,
      connectionEstablished: false,
    };
    if (!safeframeListenerCreated) {
      safeframeListenerCreated = true;
      this.win.addEventListener('message', safeframeListener, false);
    }
  }

  connectMessagingChannel(data) {
    dev().assert(this.baseInstance.iframe.contentWindow,
        'Frame contentWindow unavailable.');
    this.setupSafeframeApi();
    this.sendMessage(JSON.stringify(dict({
      'message': 'connect',
      c: data[MESSAGE_FIELDS.CHANNEL_NAME],
    })));
  }

  /**
   * Creates IntersectionObserver instance for this SafeframeAPI instance.
   * We utilize the existing IntersectionObserver class, by passing in this
   * class for IO to use instead of SubscriptionApi for sending its update
   * messages. The method 'send' below is triggered by IO every time that
   * an update occurs.
   */
  setupSafeframeApi() {
    this.IntersectionObserver = new IntersectionObserver(
        this.baseInstance, this.baseInstance.iframe, false, this);
    this.IntersectionObserver.startSendingIntersectionChanges_();
  }

  /**
   * Do not change name. This is named as 'send' as a hack to allow us to use
   * IntersectionObserver without needing to do any major refactoring of it.
   * Every time that the IntersectionObserver instance sends an update, instead
   * of utilizing the SubscriptionApi, we have overridden its typical behavior
   * to instead call this method.
   */
  send(unused_trash, changes) {
    this.sendGeom(changes);
  }

  sendGeom(changes) {
    const geomChanges = this.formatGeom(changes['changes'][0]);
    let newGeometry = JSON.stringify(geomChanges);
    const geomMessage = JSON.stringify({
      s: 'geometry_update',
      p: JSON.stringify({
        newGeometry,
        uid: 1,
      }),
      c: this.channel,
    });

    this.sendMessage(geomMessage);
  }

  /**
   * Converts an IntersectionObserver-formatted change message to the
   * geometry update format expected by GPT Safeframe.
   */
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
    this.currentGeometry = {
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
      'allowedExpansion_r': 1000,
      'allowedExpansion_b': 1000,
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
    console.log(JSON.stringify(this.currentGeometry));
    return this.currentGeometry;
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
    const width = payload.expand_r - payload.expand_l;
    const height = payload.expand_b - payload.expand_t;
    this.baseInstance.attemptChangeSize(height, width).catch(() => {});
    //this.baseInstance.handleResize_(width, height);
    const p = JSON.stringify({
      uid: 1,
      success: true,
      newGeometry: JSON.stringify(this.currentGeometry),
      expand_t: this.currentGeometry.allowedExpansion_t,
      expand_b: this.currentGeometry.allowedExpansion_b,
      expand_r: this.currentGeometry.allowedExpansion_r,
      expand_l: this.currentGeometry.allowedExpansion_l,
      push: true,
    });
    const serviceName = 'expand_response';
    const endpointIdentity = 1;
    const message = {
      c: this.channel,
      p,
      s: serviceName,
      e: endpointIdentity,
    };
    this.baseInstance.iframe.contentWindow./*OK*/postMessage(
        JSON.stringify(message),
        SAFEFRAME_ORIGIN);
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
