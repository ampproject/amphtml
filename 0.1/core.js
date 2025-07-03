import {LockedId} from './lockedid';
import {
  AppInitMessage,
  HandshakeMessage,
  MessageHandler,
  PageStatusMessage,
  UnitInitMessage,
  UnitSnapshotMessage,
} from './messages';
import {RealtimeManager} from './realtime-manager';

/**
 * Insurads Core
 */
export class Core {
  /** @private {?Core} */
  static instance_ = null;

  /** @private {!Object<string, AdUnitHandlers>} */
  adUnitHandlerMap = {};

  /** @private {!LockedId} */
  lockedid_ = null;
  /** @private {!ExtensionCommunication} */
  extension_ = null;
  constructor() {
    this.lockedid_ = new LockedId().getLockedIdData();
    this.extension_ = new ExtensionCommunication();
  }

  /**
   * Returns the singleton instance of Core.
   * @param {string} publicId - The public ID
   * @param {string} canonicalUrl - The canonical URL
   * @param {string} adUnitCode - Ad unit code
   * @param {function()} reconnectHandler - Handler for reconnection logic
   * @param {Object=} handlers - Message handlers
   * @return {!Core}
   * @public
   */
  static start(
    publicId,
    canonicalUrl,
    adUnitCode,
    reconnectHandler,
    handlers = {}
  ) {
    if (!Core.instance_) {
      Core.instance_ = new Core();
      Core.instance_.setupRealtimeConnection_(publicId, canonicalUrl);
    }

    Core.instance_.adUnitHandlerMap[adUnitCode] = new AdUnitHandlers(
      reconnectHandler,
      new MessageHandler(handlers)
    );

    return Core.instance_;
  }

  /**
   * Sets up the realtime connection and event handlers
   * @param {string} publicId - Public ID
   * @param {string} canonicalUrl - Canonical URL
   * @private
   */
  setupRealtimeConnection_(publicId = '', canonicalUrl = '') {
    /** @private {!RealtimeManager} */
    this.realtimeManager_ = RealtimeManager.start(publicId, canonicalUrl);

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
   * @param {boolean} newVisitor - New visitor flag
   * @param {boolean=} reconnect - Reconnect flag
   */
  sendAppInit(newVisitor, reconnect = false) {
    const appInit = new AppInitMessage(
      this.lockedId,
      !!this.extension_,
      newVisitor,
      reconnect
    );
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
   * @param {!Object} state - Engagement state object
   */
  sendPageStatus(state) {
    if (
      state.isEngaged &&
      this.realtimeManager_ &&
      !this.realtimeManager_.isConnected()
    ) {
      console /*OK*/
        .log('User is active, reconnecting WebSocket');
      this.setupRealtimeConnection_();
      this.reconnectHandler_();
    }

    const status = new PageStatusMessage(state.isEngaged, state.isVisible);
    this.realtimeManager_.send(status.serialize());
  }

  /**
   * Disconnects the WebSocket connection
   * @param {boolean} clearQueue - Whether to clear the message queue on disconnect (default: true)
   * @param {number=} code - Optional close code (default: 1000 - normal closure)
   * @param {string=} reason - Optional reason for closing
   * @return {boolean} Whether disconnection was successful
   * @public
   */
  disconnect(clearQueue = true, code = 1000, reason = 'AMP is going away') {
    if (!this.realtimeManager_) {
      console /*OK*/
        .log('No active connection to disconnect');
      return false;
    }

    try {
      console /*OK*/
        .log(`Disconnecting WebSocket: ${reason} (code: ${code})`);

      // Perform the actual disconnection
      this.realtimeManager_.disconnect(clearQueue, code, reason);

      return true;
    } catch (e) {
      console /*OK*/
        .error('Error disconnecting WebSocket:', e);
      return false;
    }
  }
}

class AdUnitHandlers {
  /** @public {?function()} */
  reconnectHandler = null;
  /** @public {?MessageHandler} */
  messageHandlers = null;

  /**
   * @param {function()} reconnectHandler - Handler for reconnection logic
   * @param {Object=} handlers - Message handlers
   */
  constructor(reconnectHandler, handlers = {}) {
    this.reconnectHandler = reconnectHandler;
    this.messageHandlers = new MessageHandler(handlers);
  }
}
