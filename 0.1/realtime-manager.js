export class RealtimeManager {
  /** @const {string} */
  static HUB_URL_TEMPLATE =
    'wss://amp-messaging.insurads.com/rt-pub/node/hub?appId=78&dev=$DEV$&br=$BR$&os=$OS$&cc=$CC$&rc=$RC$&v=0.2';
  static HUB_URL_TEMPLATE_DEV =
    'ws://localhost:5082/amp-poc/server/hub?pid=WQWFLKD&ht=1&v=1';
  /** @private {?RealtimeManager} */
  static instance_ = null;

  /** @private {?WebSocket} */
  ws = null;

  /** constructor */
  constructor() {}

  /**
   * Returns the singleton instance of RealtimeManager.
   * @return {!RealtimeManager}
   * @public
   */
  static start() {
    if (!RealtimeManager.instance_) {
      RealtimeManager.instance_ = new RealtimeManager();

      const ws = new WebSocket(RealtimeManager.HUB_URL_TEMPLATE_DEV);
      RealtimeManager.instance_.setWebSocket_(ws);
      RealtimeManager.instance_.setupWebSocketEventListeners_();
    }

    return RealtimeManager.instance_;
  }

  /**
   * Returns the WebSocket instance.
   * @return {?WebSocket}
   */
  getWebSocket() {
    return this.ws;
  }

  /**
   * Sets the WebSocket instance.
   * @param {WebSocket} ws
   * @private
   */
  setWebSocket_(ws) {
    this.ws = ws;
  }

  /**
   * Starts the WebSocket connection and sets up event listeners
   * @private
   */
  setupWebSocketEventListeners_() {
    if (this.ws) {
      this.ws.addEventListener('close', this.onDisconnect_.bind(this));
      this.ws.addEventListener('error', (event) => {
        console /*OK*/
          .error('WebSocket error:', event);
      });
    } else {
      console /*OK*/
        .error('WebSocket not initialized');
    }
  }

  /**
   * Handles connection closed event
   * @param {CloseEvent} event - The close event
   * @private
   */
  onDisconnect_(event) {
    console /*OK*/
      .log('Connection closed', event);
    this.ws = null;
  }

  /**
   * Sends a message through the WebSocket connection
   * @param {!Object} message - The message to send
   * @return {boolean} - True if message was sent, false otherwise
   */
  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console /*OK*/
        .error('WebSocket not connected');
      return false;
    }

    try {
      const messageString = JSON.stringify(message);
      this.ws.send(messageString + '');
      return true;
    } catch (e) {
      console /*OK*/
        .error('Failed to send message', e);
      return false;
    }
  }
}
