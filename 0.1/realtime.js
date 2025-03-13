export class RealtimeManager {
  /** @const {string} */
  static HUB_URL_TEMPLATE =
    'wss://amp-messaging.insurads.com/rt-pub/node/hub?appId=78&dev=$DEV$&br=$BR$&os=$OS$&cc=$CC$&rc=$RC$&v=0.2';
  /** @private {?RealtimeManager} */
  static instance_ = null;

  /** @private {?WebSocket} */
  websocket_ = null;

  /** constructor */
  constructor() {}

  /**
   * Returns the singleton instance of RealtimeManager.
   * @return {!RealtimeManager}
   */
  static start() {
    if (!RealtimeManager.instance_) {
      RealtimeManager.instance_ = new RealtimeManager();
    }

    const ws = new WebSocket(RealtimeManager.HUB_URL_TEMPLATE);
    RealtimeManager.instance_.setWebSocket_(ws);
    RealtimeManager.instance_.setupWebSocketEventListeners_();

    return RealtimeManager.instance_;
  }

  /**
   * Returns the WebSocket instance.
   * @return {?WebSocket}
   */
  getWebSocket() {
    return this.websocket_;
  }

  /**
   * Sets the WebSocket instance.
   * @param {WebSocket} ws
   * @private
   */
  setWebSocket_(ws) {
    this.websocket_ = ws;
  }

  /**
   * Starts the WebSocket connection and sets up event listeners
   * @private
   */
  setupWebSocketEventListeners_() {
    if (this.websocket_) {
      this.websocket_.addEventListener('open', this.onConnect_.bind(this));
      this.websocket_.addEventListener('close', this.onDisconnect_.bind(this));
      this.websocket_.addEventListener(
        'message',
        this.onMessageReceive_.bind(this)
      );
      this.websocket_.addEventListener('error', (event) => {
        console /*OK*/
          .error('WebSocket error:', event);
      });
    } else {
      console /*OK*/
        .error('WebSocket not initialized');
    }
  }

  /**
   * Handles connection opened event
   * @param {Event} event - The connection event
   * @private
   */
  onConnect_(event) {
    console /*OK*/
      .log('Connection opened', event);
    this.websocket_.send('{"protocol":"json","version":1}');
  }

  /**
   * Handles connection closed event
   * @param {CloseEvent} event - The close event
   * @private
   */
  onDisconnect_(event) {
    console /*OK*/
      .log('Connection closed', event);
    this.websocket_ = null;
  }

  /**
   * Handles message received from WebSocket
   * @param {MessageEvent} event - The message event
   * @private
   */
  onMessageReceive_(event) {
    console /*OK*/
      .log('Message received', event.data);
    try {
      const data = JSON.parse(event.data);
      // Handle parsed data
      // Process incoming message
      // emit events
      console /*OK*/
        .log('Message data', data);
    } catch (e) {
      console /*OK*/
        .error('Failed to parse message', e);
    }
  }
}
