import {Cookie} from './cookie';
import {EngagementTracker} from './engagement-tracking';
import {ExtensionCommunication} from './extension';
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
import {LockedId} from './utilities';

/**
 * Insurads Core
 */
export class Core {
  /** @private {?Core} */
  static instance_ = null;

  /** @private {!Object<string, UnitHandlers>} */
  unitHandlerMap = {};

  /** @private {!EngagementTracker} */
  engagement_ = null;

  /** @private {?AppInitResponseMessage} */
  appInitResponse_ = null;

  /**
   * Constructs the Core instance.
   * @param {Window} win
   * @param {string} canonicalUrl - Canonical URL
   * @param {string} publicId - The public ID
   */
  constructor(win, canonicalUrl, publicId) {
    this.win = win;
    this.canonicalUrl = canonicalUrl;
    this.publicId = publicId;

    /** @private {!LockedId} */
    this.lockedData_ = new LockedId().getLockedIdData();
    /** @private {!ExtensionCommunication} */
    this.extension_ = win.frames['TG-listener']
      ? new ExtensionCommunication()
      : null;
    /** @private {!Cookie} */
    this.cookies_ = new Cookie(this.win);
  }

  /**
   * Returns the singleton instance of Core.
   * @param {Window} win - The window object
   * @param {string} canonicalUrl - The canonical URL
   * @param {string} publicId - The public ID
   * @return {!Core}
   * @public
   */
  static start(win, canonicalUrl, publicId) {
    if (!Core.instance_) {
      Core.instance_ = new Core(win, canonicalUrl, publicId);
      Core.instance_.setupRealtimeConnection_();
    }

    return Core.instance_;
  }

  /**
   * Registers a new ad unit with the Core service.
   * Each ad unit instance on the page should call this.
   * @param {string} unitCode - The unique code for the ad unit.
   * @param {function()} reconnectHandler - Handler for reconnection logic.
   * @param {Object=} handlers - Message handlers for this specific ad unit.
   */
  registerUnit(unitCode, reconnectHandler, handlers = {}) {
    this.unitHandlerMap[unitCode] = new UnitHandlers(
      reconnectHandler,
      new MessageHandler(handlers)
    );

    // If the app is already initialized, immediately send the config to the new ad unit.
    if (this.appInitResponse_) {
      this.unitHandlerMap[unitCode].messageHandlers.processMessage(
        this.appInitResponse_
      );
    }
  }

  /**
   * Sets up the realtime connection and event handlers
   * @param {boolean} reconnect
   * @private
   */
  setupRealtimeConnection_(reconnect = false) {
    /** @private {!RealtimeManager} */
    this.realtimeManager_ = RealtimeManager.start(
      this.publicId,
      this.canonicalUrl
    );

    if (this.realtimeManager_) {
      this.realtimeManager_.onReceiveMessage = this.dispatchMessage_.bind(this);
      this.realtimeManager_.onConnect = this.onRealtimeConnect_.bind(
        this,
        reconnect
      );
      this.realtimeManager_.onDisconnect = (event) => {
        if (event.code !== 1000) {
          this.destroy();
        }
      };
    }
  }

  /**
   * Sends a handshake message
   * @private
   */
  sendHandshake_() {
    const handshake = new HandshakeMessage();
    this.realtimeManager_.sendHandshake(handshake.serialize());
  }

  /**
   * Sends an app initialization message
   * @param {boolean=} reconnect - Reconnect flag
   * @private
   */
  sendAppInit_(reconnect = false) {
    const appInit = new AppInitMessage({
      lockedId: this.lockedData_,
      newVisitor: this.cookies_.isNewVisitor(),
      lastTimestamp: this.cookies_.getLastTimeStamp(),
      extension: !!this.extension_,
      reconnect,
    });
    this.realtimeManager_.send(appInit.serialize());
  }

  /**
   * Sends an ad unit initialization message
   * @param {{
   *   unitCode: string,
   *   creativeId: (string|undefined),
   *   isHouseDemand: (boolean|undefined),
   *   keyValues: (Array|undefined),
   *   lineItemId: (string|undefined),
   *   parentMawId: (number|undefined),
   *   path: (string|undefined),
   *   position: (number|undefined),
   *   servedSize: (string|undefined)
   *   sizes: (Array|undefined)
   * }} unitInfo - Ad unit information object.
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
   * @param {string} unitCode - Ad unit code
   * @param {boolean} visible - Visibility
   */
  sendUnitSnapshot(unitCode, visible) {
    const snapshot = new UnitSnapshotMessage(unitCode, visible);
    this.realtimeManager_.send(snapshot.serialize());
  }

  /**
   * Sends a page status update
   * @param {!Object} state - Engagement state object
   * @private
   */
  sendPageStatus_(state) {
    if (
      state.isEngaged &&
      this.realtimeManager_ &&
      !this.realtimeManager_.isConnected()
    ) {
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
      return false;
    }

    try {
      this.realtimeManager_.disconnect(clearQueue, code, reason);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Handles logic to run when the realtime connection is established.
   * @param {boolean} reconnect
   * @private
   */
  onRealtimeConnect_(reconnect) {
    this.sendHandshake_();
    this.sendAppInit_(reconnect);
    if (reconnect) {
      for (const unitCode in this.unitHandlerMap) {
        this.unitHandlerMap[unitCode].reconnectHandler();
      }
    }
  }

  /**
   * Central dispatcher for all incoming WebSocket messages.
   * Routes messages to the correct ad unit handler.
   * Broadcasts global messages
   * @param {string} raw The raw message string from the WebSocket.
   * @private
   */
  dispatchMessage_(raw) {
    const messages = raw.split('\u001e').filter(Boolean);

    messages.forEach((rawMessage) => {
      try {
        // TODO: Investigate the need for the double parsing,
        // maybe this can be improved on server/client
        const messageData = JSON.parse(rawMessage);
        const action = messageData.arguments[0];
        const data = JSON.parse(messageData.arguments[1]);

        const parsedMessage = MessageFactory.createMessage(action, data);
        if (!parsedMessage) {
          return;
        }

        if (action === 'app-init-response') {
          // Global message, should broadcast to all units
          for (const unitCode in this.unitHandlerMap) {
            this.unitHandlerMap[unitCode].messageHandlers.processMessage(
              parsedMessage
            );
          }

          this.processAppInitResponse_(parsedMessage);
          return;
        }

        const {unitCode} = parsedMessage.message;

        if (unitCode && this.unitHandlerMap[unitCode]) {
          const unitHandlers = this.unitHandlerMap[unitCode];
          unitHandlers.messageHandlers.processMessage(parsedMessage);
        }
      } catch (e) {}
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

    // It is an app init response with general configuration,
    // Set app status, start engagement and extension if exists.
    if (message.status !== undefined) {
      this.status = message.status;
      this.appEnabled = message.status > 0 ? true : false;

      if (!this.appEnabled) {
        this.destroy();
        return;
      }

      if (!this.engagement_) {
        const config = {
          ivm: message.ivm,
        };
        this.engagement_ = new EngagementTracker(this.win);
        this.engagement_.init(config);
        this.unlistenEngagement_ = this.engagement_.registerListener(
          this.updateEngagementStatus_.bind(this)
        );
      }

      if (this.extension_) {
        this.extension_.setup({
          applicationId: message.applicationId,
          country: message.countryCode,
          section: message.sectionId,
          sessionId: this.cookies_.getSessionCookie(),
          ivm: message.ivm,
          state: this.engagement_.isEngaged() ? 1 : 0,
        });
      }

      this.cookies_.updateVisitCookie(
        message.lockedId,
        message.serverTimestamp
      );
    }
  }

  /**
   * Handles user engagement changes
   * @param {!Object} state - Engagement state object
   * @private
   */
  updateEngagementStatus_(state) {
    this.sendPageStatus_(state);

    if (this.extension_) {
      this.extension_.engagementStatus({
        index: state.isEngaged ? 1 : 0,
        name: state.isEngaged ? 'Active' : 'Inactive',
      });
    }
  }

  /**
   * Destroy implementation
   * This is called when the ad is removed from the DOM or refreshed
   * @public
   */
  destroy() {
    if (this.unlistenEngagement_) {
      this.unlistenEngagement_();
      this.unlistenEngagement_ = null;
    }

    if (this.realtimeManager_) {
      this.realtimeManager_.disconnect(true, 1000, 'Core is being destroyed');
      this.realtimeManager_.destroy();
      this.realtimeManager_ = null;
    }

    if (this.engagement_) {
      this.engagement_.destroy();
      this.engagement_ = null;
    }

    if (this.extension_) {
      this.extension_.destroy();
      this.extension_ = null;
    }

    this.unitHandlerMap = {};
  }
}

class UnitHandlers {
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
