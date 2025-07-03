import {EngagementTracker} from './engagement-tracking';
import {ExtensionCommunication} from './extension';
import {LockedId} from './lockedid';
import {
  AppInitMessage,
  HandshakeMessage,
  MessageFactory,
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
  /** @private {!EngagementTracker} */
  engagement_ = null;

  /**
   * Constructs the Core instance.
   */
  constructor() {
    this.lockedId_ = new LockedId().getLockedIdData();
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

    this.lockedid_ = new LockedId().getLockedIdData();
    this.extension_ = new ExtensionCommunication();

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
      ws.onReceiveMessage = this._dispatchMessage_.bind(this);
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
      this.lockedId_,
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

  /**
   * Central dispatcher for all incoming WebSocket messages.
   * Routes messages to the correct ad unit handler.
   * Brodcasts global messages
   * @param {string} raw The raw message string from the WebSocket.
   * @private
   */
  _dispatchMessage_(raw) {
    const messages = raw.split('\u001e').filter(Boolean);

    messages.forEach((rawMessage) => {
      try {
        const messageData = JSON.parse(rawMessage);
        const action = messageData.arguments[0];
        const data = JSON.parse(messageData.arguments[1]);

        const parsedMessage = MessageFactory.createMessage(action, data);
        if (!parsedMessage) {
          return;
        }

        if (action === 'app-init-response') {
          // Global message, should brodcast to all adUnits
          for (const code in this.adUnitHandlerMap) {
            this.adUnitHandlerMap[code].messageHandlers.processMessage(
              parsedMessage
            );
          }
          // Save relevant data for core
          this.processAppInitResponse_(parsedMessage);
        }

        const adUnitCode = parsedMessage.message.code;

        if (adUnitCode && this.adUnitHandlerMap[adUnitCode]) {
          const adUnitHandlers = this.adUnitHandlerMap[adUnitCode];
          adUnitHandlers.messageHandlers.processMessage(parsedMessage);
        }
      } catch (e) {
        console /*Ok*/
          .error('Error processing incoming message:', e, rawMessage);
      }
    });
  }

  /**
   * Handles app initialization messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  processAppInitResponse_(message) {
    // TODO: WIP keep only necessary data
    this.status = message.status;
    this.reason = message.reason || '';
    this.appEnabled = message.status > 0 ? true : false;
    this.ivm = !!message.ivm;
    this.requiredKeys = message.requiredKeys;
    this.iabTaxonomy = message.iabTaxonomy;

    console /*OK*/
      .log('App Init:', message);

    if (!this.engagement_) {
      const config = {
        ivm: this.ivm,
      };
      this.engagement_ = EngagementTracker.get(this.win, config);
      // TODO: Remove listeners on destroy
      this.unlistenEngagement_ = this.engagement_.registerListener(
        this.updateEngagementStatus_.bind(this)
      );
    }
  }

  /**
   * Handles user engagement changes
   * @param {!Object} state - Engagement state object
   * @private
   */
  updateEngagementStatus_(state) {
    if (this.core_) {
      this.core_.sendPageStatus(state);
    }

    if (this.extension_) {
      // TODO: Create BrowserStates and extend with Idle,etc
      this.extension_.engagementStatus({
        index: state.isEngaged ? 1 : 0,
        name: state.isEngaged ? 'Active' : 'Inactive',
      });
    }

    console /*OK*/
      .log('Engagement changed:', state.isEngaged, state);
  }

  /**
   * Destroy implementation
   * This is called when the ad is removed from the DOM or refreshed
   * @public
   */
  destroy() {
    // Already Validated. is called when the ad is refreshed or unlayoutCallback
    // A: Does the teardown happen in every refresh?
    // B: OR Does the teardown happen when the ad is removed from the DOM // Slot Collapsed?
    // If A:
    // Don't destroy the extension, as it will be used in the next refresh
    // Don't destroy the realtime messaging, as it will be used in the next refresh
    // Don't destroy the engagement tracker, as it will be used in the next refresh
    // Don't destroy the visibility tracker, as it will be used in the next refresh
    // If B: - IT IS B: tearDownSlot is called when the ad is refreshed or unlayoutCallback
    // Don't destroy all the components, as they will be used in the next refresh
    // TODO: Find a proper place to proper cleanup of the components (commented bellow)

    if (this.engagement_) {
      this.unlistenEngagement_();
      this.unlistenEngagement_.release();
    }

    if (this.core_) {
      // TODO: Shall we disconnect/destroy the realtime messaging if no more instances present?
      this.core_.disconnect();
      this.core_ = null;
    }

    if (this.extension_) {
      this.extension_.adUnitRemoved(this.getAdUnitId());
      this.extension_.destroy();
      this.extension_ = null;
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
