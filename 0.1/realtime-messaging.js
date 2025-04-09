import {
  AppInitMessage,
  AppStatusMessage,
  HandshakeMessage,
  MessageHandler,
  UnitInitMessage,
  UnitSnapshotMessage,
} from './messages';
import {RealtimeManager} from './realtime-manager';

/**
 * Integration with the RealtimeManager
 */
export class RealtimeMessaging {
  /**
   * @param {Object=} handlers - Message handlers
   */
  constructor(handlers = {}) {
    /** @private {!RealtimeManager} */
    this.realtimeManager_ = RealtimeManager.start();

    // Set up connection
    this.setupRealtimeConnection_();

    /** @private {!MessageHandler} */
    this.messageHandler_ = new MessageHandler(handlers);
  }

  /**
   * Sets up the realtime connection and event handlers
   * @private
   */
  setupRealtimeConnection_() {
    const ws = this.realtimeManager_.getWebSocket();

    if (ws) {
      // Listen for messages
      ws.addEventListener('message', (event) => {
        this.messageHandler_.processMessage(event.data);
      });
    }
  }

  /**
   * Sends a handshake message
   */
  sendHandshake() {
    // if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
    //   console /*OK*/
    //     .error('WebSocket not connected');
    //   setTimeout(() => {
    //     this.sendHandshake();
    //   }, 100);
    //   return;
    // }

    const handshake = new HandshakeMessage();
    this.realtimeManager_.sendHandshake(handshake.serialize());
  }

  /**
   * Sends an app initialization message
   * @param {string} lockedId - Locked ID data
   * @param {boolean} newVisitor - New visitor flag
   * @param {boolean} extension - Extension status
   * @param {string=} url - Page URL
   */
  sendAppInit(lockedId, newVisitor, extension, url) {
    const appInit = new AppInitMessage(lockedId, newVisitor, extension, url);
    this.realtimeManager_.send(appInit.serialize());
  }

  /**
   * Sends an ad unit initialization message
   * @param {string} code - Ad unit code
   * @param {string} path - Ad unit path
   * @param {string} lineItemId - Line item ID
   * @param {string} creativeId - Creative ID
   * @param {string} servedSize - Served size
   * @param {Array<string>} sizes - Available sizes
   * @param {Array<Object>} keyValues - Key-value targeting
   * @param {string} provider - Ad provider
   */
  sendUnitInit(
    code,
    path,
    lineItemId,
    creativeId,
    servedSize,
    sizes,
    keyValues,
    provider
  ) {
    const unitInit = new UnitInitMessage(
      code,
      path,
      lineItemId,
      creativeId,
      servedSize,
      sizes,
      keyValues,
      provider
    );
    this.realtimeManager_.send(unitInit.serialize());
  }

  /**
   * Sends an ad unit visibility snapshot
   * @param {string} code - Ad unit code
   * @param {number} visible - Visibility percentage (0-1)
   */
  sendUnitVisibility(code, visible) {
    const snapshot = new UnitSnapshotMessage(code, visible);
    this.realtimeManager_.send(snapshot.serialize());
  }

  /**
   * Sends a page status update
   * @param {boolean} isEngaged - Whether user is engaged
   * @param {Object=} metrics - Performance metrics
   */
  sendPageStatus(isEngaged, metrics = {}) {
    const status = new AppStatusMessage(isEngaged, metrics);
    this.realtimeManager_.send(status.serialize());
  }

  /**
   * Registers a handler for a specific incoming message type
   * @param {string} type - Message type
   * @param {Function} handler - Message handler
   */
  registerHandler(type, handler) {
    this.messageHandler_.registerHandler(type, handler);
  }
}
