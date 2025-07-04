import {Cookie} from './cookie';
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

  /** @private {!EngagementTracker} */
  engagement_ = null;

  /** @private {?AppInitResponseMessage} */
  appInitResponse_ = null;

  /**
   * Constructs the Core instance.
   * @param {Window} win
   * @param {string} canonicalUrl - Canonical URL
   */
  constructor(win, canonicalUrl) {
    this.win = win;
    this.canonicalUrl = canonicalUrl;

    /** @private {!LockedId} */
    this.lockedData_ = new LockedId().getLockedIdData();
    /** @private {!ExtensionCommunication} */
    this.extension_ = new ExtensionCommunication();
    /** @private {!CookieMonster} */
    this.cookies_ = new Cookie(this.win, this.canonicalUrl);
  }

  /**
   * Returns the singleton instance of Core.
   * @param {Window} win
   * @param {string} canonicalUrl - The canonical URL
   * @param {string} adUnitCode - Ad unit code
   * @param {function()} reconnectHandler - Handler for reconnection logic
   * @param {Object=} handlers - Message handlers
   * @return {!Core}
   * @public
   */
  static start(win, canonicalUrl, adUnitCode, reconnectHandler, handlers = {}) {
    if (!Core.instance_) {
      Core.instance_ = new Core(win, canonicalUrl);
      Core.instance_.setupRealtimeConnection_();
    }

    Core.instance_.adUnitHandlerMap[adUnitCode] = new AdUnitHandlers(
      reconnectHandler,
      new MessageHandler(handlers)
    );

    if (Core.instance_.appInitResponse_) {
      // If app init response is already received, send it to the ad unit handler
      Core.instance_.adUnitHandlerMap[
        adUnitCode
      ].messageHandlers.processMessage(Core.instance_.appInitResponse_);
    }

    return Core.instance_;
  }

  /**
   * Sets up the realtime connection and event handlers
   * @param {boolean} reconnect
   * @private
   */
  setupRealtimeConnection_(reconnect = false) {
    /** @private {!RealtimeManager} */
    this.realtimeManager_ = RealtimeManager.start();

    const ws = this.realtimeManager_.getWebSocket();

    if (ws) {
      ws.onReceiveMessage = this._dispatchMessage_.bind(this);
      ws.onConnect = () => {
        this.sendHandshake();
        this.sendAppInit(reconnect);
        if (reconnect) {
          for (const code in this.adUnitHandlerMap) {
            this.adUnitHandlerMap[code].reconnectHandler();
          }
        }
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
   * @param {boolean=} reconnect - Reconnect flag
   */
  sendAppInit(reconnect = false) {
    const appInit = new AppInitMessage(
      this.lockedData_,
      !!this.extension_,
      this.cookies_.isNewVisitor(),
      reconnect
    );
    this.realtimeManager_.send(appInit.serialize());
  }

  /**
   * Sends an ad unit initialization message
   * @param {UnitInfo} unitInfo - Ad unit information
   * @param {boolean=} reconnect - Reconnect flag
   * @param {boolean=} passback - Passback flag
   */
  sendUnitInit(unitInfo, reconnect = false, passback = false) {
    const info = {
      ...unitInfo,
      reconnect,
      passback,
    };
    const unitInit = new UnitInitMessage(info);
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
      this.setupRealtimeConnection_(true);
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
          return;
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
   * @param {!AppInitResponseMessage} appInitMessage - The app initialization message
   * @private
   */
  processAppInitResponse_(appInitMessage) {
    const {message} = appInitMessage;

    // Merge the app init response with the existing one
    // This allows us to accumulate configuration data
    // and avoid overwriting previous responses.
    if (!this.appInitResponse_) {
      this.appInitResponse_ = appInitMessage;
    } else {
      const existingPayload = this.appInitResponse_.message;
      const newPayload = appInitMessage.message;
      const mergedPayload = {...existingPayload, ...newPayload};
      this.appInitResponse_.message = mergedPayload;
    }

    // It is a app init response with general configuration,
    // Set app status, start engagement and extension if exists.
    if (message.status !== undefined) {
      this.status = message.status;
      this.appEnabled = message.status > 0 ? true : false;

      // TODO: Verify this, should we destroy?
      if (!this.appEnabled) {
        this.destroy();
        return;
      }

      console /*OK*/
        .log('App Init:', message);

      if (!this.engagement_) {
        const config = {
          ivm: message.ivm,
        };
        this.engagement_ = new EngagementTracker(this.win, config);
        // TODO: Remove listeners on destroy
        this.unlistenEngagement_ = this.engagement_.registerListener(
          this.updateEngagementStatus_.bind(this)
        );
      }

      // Setup the extension with the initial parameters
      // TODO: We don't have all the parameters
      // TODO: Do this only once, we receive multiple app inits
      if (this.extension_) {
        this.extension_.setup(
          message.applicationId, // applicationId
          message.countryCode, // country
          message.sectionId, // section
          this.cookies_.getSessionCookie(), // sessionId
          this.ivm,
          this.engagement_.isEngaged() ? 1 : 0 // state
        );
      }
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
    if (this.engagement_) {
      this.unlistenEngagement_();
      this.engagement_.destroy();
      this.engagement_ = null;
    }

    if (this.core_) {
      // TODO: Shall we disconnect/destroy the realtime messaging if no more instances present?
      this.core_.disconnect();
      this.core_ = null;
    }

    if (this.realtimeManager_) {
      this.realtimeManager_.destroy();
      this.realtimeManager_ = null;
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
