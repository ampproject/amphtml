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
   * @param {string} sellerId - Seller ID
   * @param {string} canonicalUrl - Canonical URL
   * @param {Object=} handlers - Message handlers
   */
  constructor(sellerId, canonicalUrl, handlers = {}) {
    this.setupRealtimeConnection_(sellerId, canonicalUrl);

    /** @private {!MessageHandler} */
    this.messageHandler_ = new MessageHandler(handlers);
  }

  /**
   * Sets up the realtime connection and event handlers
   * @param {string} sellerId - Seller ID
   * @param {string} canonicalUrl - Canonical URL
   * @private
   */
  setupRealtimeConnection_(sellerId = '', canonicalUrl = '') {
    /** @private {!RealtimeManager} */
    this.realtimeManager_ = RealtimeManager.start(sellerId, canonicalUrl);

    const ws = this.realtimeManager_.getWebSocket();

    if (ws) {
      ws.onReceiveMessage = this.messageHandler_.processMessage;
      ws.onConnect = () => {
        this.sendHandshake();
      };
      ws.onDisconnect = () => {
        console /*OK*/
          .log('WebSocket disconnected');
      };
    }
  }

  /**
   * Sends a handshake message
   */
  sendHandshake() {
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
   * @param {number} parentMawId - Parent MAW ID
   */
  sendUnitInit(
    code,
    path,
    lineItemId,
    creativeId,
    servedSize,
    sizes,
    keyValues,
    provider,
    parentMawId
  ) {
    const unitInit = new UnitInitMessage(
      code,
      path,
      lineItemId,
      creativeId,
      servedSize,
      sizes,
      keyValues,
      provider,
      parentMawId
    );
    this.realtimeManager_.send(unitInit.serialize());
  }

  /**
   * Sends an ad unit visibility snapshot
   * @param {string} code - Ad unit code
   * @param {number} visible - Visibility percentage (0-1)
   */
  sendUnitSnapshot(code, visible) {
    const snapshot = new UnitSnapshotMessage(code, visible);
    this.realtimeManager_.send(snapshot.serialize());
  }

  /**
   * Sends a page status update
   * @param {boolean} isEngaged - Whether user is engaged
   */
  sendPageStatus(isEngaged) {
    // TODO Check for engagement state is true and if websocket is closed, open it
    if (
      isEngaged &&
      this.realtimeManager_ &&
      !this.realtimeManager_.isConnected()
    ) {
      console /*OK*/
        .log('User is active, reconnecting WebSocket');
      this.setupRealtimeConnection_();
    }

    const status = new AppStatusMessage(isEngaged);
    this.realtimeManager_.send(status.serialize());
  }
}
