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
    /** @private {!MessageHandler} */
    this.messageHandler_ = new MessageHandler(handlers);

    /** @private {!RealtimeManager} */
    this.realtimeManager_ = RealtimeManager.start();

    // Set up connection
    this.setupRealtimeConnection_();
  }

  /**
   * Sets up the realtime connection and event handlers
   * @private
   */
  setupRealtimeConnection_() {
    const ws = this.realtimeManager_.getWebSocket();

    if (ws) {
      // Listen for connection open to send handshake
      ws.addEventListener('open', () => {
        this.sendHandshake();
      });

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
    const handshake = new HandshakeMessage();
    this.realtimeManager_.send(handshake.serialize());
  }

  /**
   * Sends an app initialization message
   * @param {string} lockedIdData - Locked ID data
   * @param {number} newVisitor - New visitor flag
   * @param {number} extension - Extension status
   * @param {string=} url - Page URL
   */
  sendAppInit(lockedIdData, newVisitor, extension, url) {
    const appInit = new AppInitMessage(
      lockedIdData,
      newVisitor,
      extension,
      url
    );
    this.realtimeManager_.send(appInit);
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
    this.realtimeManager_.send(unitInit);
  }

  /**
   * Sends an ad unit visibility snapshot
   * @param {string} code - Ad unit code
   * @param {number} visible - Visibility percentage (0-1)
   */
  sendUnitVisibility(code, visible) {
    const snapshot = new UnitSnapshotMessage(code, visible);
    this.realtimeManager_.send(snapshot);
  }

  /**
   * Sends a page status update
   * @param {boolean} isEngaged - Whether user is engaged
   * @param {Object=} metrics - Performance metrics
   */
  sendPageStatus(isEngaged, metrics = {}) {
    const status = new AppStatusMessage(isEngaged, metrics);
    this.realtimeManager_.send(status);
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
