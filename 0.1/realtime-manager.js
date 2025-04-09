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

  /** @private {boolean} */
  handshakeComplete_ = false;

  /** @private {Array<Object>} */
  messageQueue_ = [];

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
      // Listen for connection open to send handshake
      this.ws.addEventListener('open', () => {
        this.sendHandshake();
        this.processQueuedMessages_();
      });
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
   * Process all queued messages after handshake completes
   * @private
   */
  processQueuedMessages_() {
    console /*OK*/
      .log(`Processing ${this.messageQueue_.length} queued messages`);

    // Send all queued messages
    while (this.messageQueue_.length > 0) {
      const queuedMessage = this.messageQueue_.shift();
      this.sendImmediately_(queuedMessage);
    }
  }

  /**
   * Sends a message through the WebSocket connection
   * @param {!Object} message - The message to send
   * @return {boolean} - True if message was sent or queued, false otherwise
   */
  send(message) {
    // If handshake isn't complete, queue the message
    if (!this.handshakeComplete_) {
      console /*OK*/
        .log('Handshake not complete, queueing message');
      this.messageQueue_.push(message);

      // If WebSocket is open but handshake isn't sent yet, send it now
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendHandshake();
      }

      return true; // Message was queued
    }

    // Handshake is complete, send the message immediately
    return this.sendImmediately_(message);
  }

  /**
   * Sends a handshake message to initialize the connection
   * @return {boolean} - True if handshake was sent, false otherwise
   */
  sendHandshake() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console /*OK*/
        .error('Cannot send handshake - WebSocket not connected');
      return false;
    }

    try {
      const handshakeMsg = JSON.stringify({
        protocol: 'json',
        version: 1,
      });

      this.ws.send(handshakeMsg + '\u001e');
      console /*OK*/
        .log('Handshake sent');
      return true;
    } catch (e) {
      console /*OK*/
        .error('Failed to send handshake', e);
      return false;
    }
  }

  /**
   * Immediately sends a message without checking handshake status
   * @param {!Object} message - The message to send
   * @return {boolean} - True if message was sent, false otherwise
   * @private
   */
  sendImmediately_(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console /*OK*/
        .error('WebSocket not connected');
      return false;
    }

    try {
      const payload = {
        arguments: message,
        target: 'SendMessage',
        type: 1,
      };
      this.ws.send(JSON.stringify(payload) + '\u001e');
      return true;
    } catch (e) {
      console /*OK*/
        .error('Failed to send message', e);
      return false;
    }
  }
}
