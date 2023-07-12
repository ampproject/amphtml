import {isIframed} from '#core/dom';

import {Services} from '#service';
import {FixedLayer} from '#service/fixed-layer';

import {getData, listen, listenOnce} from '#utils/event-helper';
import {dev} from '#utils/log';

import {FocusHandler} from './focus-handler';
import {
  HighlightHandler,
  HighlightInfoDef,
  getHighlightParam,
} from './highlight-handler';
import {KeyboardHandler} from './keyboard-handler';
import {
  Messaging,
  WindowPortEmulator,
  parseMessage,
} from './messaging/messaging';
import {TouchHandler} from './touch-handler';

import {getAmpdoc} from '../../../src/service-helpers';
import {getSourceUrl} from '../../../src/url';

const TAG = 'amp-viewer-integration';
const APP = '__AMPHTML__';

/**
 * @enum {string}
 */
const RequestNames = {
  CHANNEL_OPEN: 'channelOpen',
  UNLOADED: 'unloaded',
};

/**
 * @fileoverview This is the communication protocol between AMP and the viewer.
 * This should be included in an AMP html file to communicate with the viewer.
 */
export class AmpViewerIntegration {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} win */
    this.win = win;

    /** @private {boolean} */
    this.isWebView_ = false;

    /** @private {boolean} */
    this.isHandShakePoll_ = false;

    /**
     * @private {?HighlightHandler}
     */
    this.highlightHandler_ = null;
  }

  /**
   * Initiate the handshake. If handshake confirmed, start listening for
   * messages. The service is disabled if the viewerorigin parameter is
   * absent.
   * @return {!Promise<undefined>}
   */
  init() {
    dev().fine(TAG, 'handshake init()');
    const ampdoc = getAmpdoc(this.win.document);
    const viewer = Services.viewerForDoc(ampdoc);
    this.isWebView_ = viewer.getParam('webview') == '1';
    this.isHandShakePoll_ = viewer.hasCapability('handshakepoll');
    const messagingToken = viewer.getParam('messagingToken');
    const origin = viewer.getParam('origin') || '';

    if (!this.isWebView_ && !origin) {
      return Promise.resolve();
    }

    const viewport = Services.viewportForDoc(ampdoc);
    viewport.createFixedLayer(FixedLayer);

    if (this.isWebView_ || this.isHandShakePoll_) {
      const source = isIframed(this.win) ? this.win.parent : null;
      return this.webviewPreHandshakePromise_(source, origin).then(
        (receivedPort) => {
          return this.openChannelAndStart_(
            viewer,
            ampdoc,
            origin,
            new Messaging(
              this.win,
              receivedPort,
              this.isWebView_,
              messagingToken
            )
          );
        }
      );
    }
    /** @type {?HighlightInfoDef} */
    const highlightInfo = getHighlightParam(ampdoc);
    if (highlightInfo) {
      this.highlightHandler_ = new HighlightHandler(ampdoc, highlightInfo);
    }

    const port = new WindowPortEmulator(
      this.win,
      origin,
      this.win.parent /* target */
    );
    return this.openChannelAndStart_(
      viewer,
      ampdoc,
      origin,
      new Messaging(this.win, port, this.isWebView_, messagingToken)
    );
  }

  /**
   * @param {?Window} source
   * @param {string} origin
   * @return {!Promise}
   * @private
   */
  webviewPreHandshakePromise_(source, origin) {
    return new Promise((resolve) => {
      const unlisten = listen(this.win, 'message', (e) => {
        dev().fine(
          TAG,
          'AMPDOC got a pre-handshake message:',
          e.type,
          getData(e)
        );
        const data = parseMessage(getData(e));
        if (!data) {
          return;
        }
        // Viewer says: "I'm ready for you"
        if (
          e.origin === origin &&
          e.source === source &&
          data.app == APP &&
          data.name == 'handshake-poll'
        ) {
          if (this.isWebView_ && (!e.ports || !e.ports.length)) {
            throw new Error(
              'Did not receive communication port from the Viewer!'
            );
          }
          const port =
            e.ports && e.ports.length > 0
              ? e.ports[0]
              : new WindowPortEmulator(this.win, origin, this.win.parent);
          resolve(port);
          unlisten();
        }
      });
    });
  }

  /**
   * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} origin
   * @param {!Messaging} messaging
   * @return {!Promise<undefined>}
   * @private
   */
  openChannelAndStart_(viewer, ampdoc, origin, messaging) {
    dev().fine(TAG, 'Send a handshake request');
    const ampdocUrl = ampdoc.getUrl();
    const srcUrl = getSourceUrl(ampdocUrl);
    return messaging
      .sendRequest(
        RequestNames.CHANNEL_OPEN,
        {
          'url': ampdocUrl,
          'sourceUrl': srcUrl,
        },
        true /* awaitResponse */
      )
      .then(() => {
        dev().fine(TAG, 'Channel has been opened!');
        this.setup_(messaging, viewer, origin);
      });
  }

  /**
   * @param {!Messaging} messaging
   * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
   * @param {string} origin
   * @return {Promise<*>|undefined}
   * @private
   */
  setup_(messaging, viewer, origin) {
    messaging.setDefaultHandler((type, payload, awaitResponse) => {
      return viewer.receiveMessage(
        type,
        /** @type {!JsonObject} */ (payload),
        awaitResponse
      );
    });

    viewer.setMessageDeliverer(messaging.sendRequest.bind(messaging), origin);

    // Unloading inside a viewer is considered an error so the viewer must be notified
    // in order to display an error message.
    // Note: This does not affect the BFCache since it is only installed for pages running
    // within a viewer (which do no support B/F anyway).
    listenOnce(
      this.win,
      /*OK*/ 'unload',
      this.handleUnload_.bind(this, messaging)
    );

    if (viewer.hasCapability('swipe') || viewer.hasCapability('touch')) {
      this.initTouchHandler_(messaging);
    }
    if (viewer.hasCapability('keyboard')) {
      this.initKeyboardHandler_(messaging);
    }
    if (viewer.hasCapability('focus-rect')) {
      this.initFocusHandler_(messaging);
    }
    if (this.highlightHandler_ != null) {
      this.highlightHandler_.setupMessaging(messaging);
    }
  }

  /**
   * Notifies the viewer when this document is unloaded.
   * @param {!Messaging} messaging
   * @return {Promise<*>|undefined}
   * @private
   */
  handleUnload_(messaging) {
    return messaging.sendRequest(RequestNames.UNLOADED, {}, true);
  }

  /**
   * @param {!Messaging} messaging
   * @private
   */
  initFocusHandler_(messaging) {
    new FocusHandler(this.win, messaging);
  }

  /**
   * @param {!Messaging} messaging
   * @private
   */
  initTouchHandler_(messaging) {
    new TouchHandler(this.win, messaging);
  }

  /**
   * @param {!Messaging} messaging
   * @private
   */
  initKeyboardHandler_(messaging) {
    new KeyboardHandler(this.win, messaging);
  }
}

AMP.extension(TAG, '0.1', function (AMP) {
  new AmpViewerIntegration(AMP.win).init();
});
