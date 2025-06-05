export class RealtimeManager {
  /** @const {string} */
  static HUB_URL_TEMPLATE =
    'wss://amp-messaging.insurads.com/rt-pub/node/hub?appId=78&dev=$DEV$&br=$BR$&os=$OS$&cc=$CC$&rc=$RC$&v=0.2';
  static HUB_URL_TEMPLATE_DEV =
    'wss://localhost:5082/rt-pub/node2/hub?pid=$SELLERID$&ht=$HT$&v=$V$&url=$URL$';
  /** @private {?RealtimeManager} */
  static instance_ = null;

  /** @private {?WebSocket} */
  ws = null;

  /** @private {string} */
  sellerId_ = '';

  /** @private {string} */
  canonicalUrl_ = '';

  /** @private {boolean} */
  handshakeComplete_ = false;

  /** @private {Array<Object>} */
  messageQueue_ = [];

  // Events and callbacks
  /** @private {?function():void} */
  onConnect = null;
  /** @private {?function():void} */
  onFailedConnect = null;
  /** @private {?function():void} */
  onDisconnect = null;
  /** @private {?function(string):void} */
  onReceiveMessage = null;
  /** @private {?function(*):void} */
  onLogMessage = null;
  /** @private {?function():void} */
  onHandshakeComplete = null;

  /**
   * Creates a new RealtimeManager
   * @param {string=} sellerId - Optional seller ID
   * @param {string=} canonicalUrl - Optional canonical URL
   */
  constructor(sellerId = '', canonicalUrl = '') {
    this.sellerId_ = sellerId;
    this.canonicalUrl_ = canonicalUrl;
  }

  /**
   * Returns the singleton instance of RealtimeManager.
   * @param {string} sellerId - The seller ID
   * @param {string} canonicalUrl - The canonical URL
   * @return {!RealtimeManager}
   * @public
   */
  static start(sellerId, canonicalUrl) {
    if (!RealtimeManager.instance_) {
      RealtimeManager.instance_ = new RealtimeManager(sellerId, canonicalUrl);
      RealtimeManager.instance_.connect();
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
   * Initializes event handlers for WebSocket events
   *  @private
   * */
  onOpen_() {
    console /*OK*/
      .log('WebSocket connection opened');

    if (this.onConnect) {
      this.onConnect();
    }
  }

  /**
   * Handles connection closed event
   * @param {CloseEvent} event - The close event
   * @private
   */
  onDisconnect_(event) {
    if (this.onDisconnect) {
      this.onDisconnect(event);
    }

    console /*OK*/
      .log('Connection closed', event);
    this.handshakeComplete_ = false;
    this.ws = null;
  }

  /**
   * Handles WebSocket error events
   * @param {Event} event - The error event
   *  @private
   * */
  onError_(event) {
    if (this.onFailedConnect) {
      this.onFailedConnect(event);
    }

    console /*OK*/
      .error('WebSocket error:', event);
  }

  /**
   * Handles incoming messages from the WebSocket
   * @param {MessageEvent} event - The message event
   *  @private
   * */
  onReceiveMessage_(event) {
    console /*OK*/
      .log('Received message:', event.data);

    if (this.onReceiveMessage) {
      this.onReceiveMessage(event.data);
    }
  }

  /**
   *  Handles the completion of the handshake
   *  @private
   * */
  onHandshakeComplete_() {
    console /*OK*/
      .log('Handshake completed successfully');

    this.handshakeComplete_ = true;

    if (this.onHandshakeComplete) {
      this.onHandshakeComplete();
    }

    // Process any queued messages now that handshake is complete
    this.processQueuedMessages_();
  }

  /**
   * Process all queued messages after handshake completes
   * @private
   */
  processQueuedMessages_() {
    console /*OK*/
      .log(`Processing ${this.messageQueue_.length} queued messages`);

    while (this.messageQueue_.length > 0) {
      const queuedMessage = this.messageQueue_.shift();
      this.sendImmediately_(queuedMessage);
    }
  }

  /**
   * Connect to the WebSocket
   * @param {string=} sellerId - Optional seller ID (will use stored value if not provided)
   * @param {string=} canonicalUrl - Optional canonical URL (will use stored value if not provided)
   * @return {boolean} - True if connection was initiated, false otherwise
   * @public
   */
  connect(sellerId, canonicalUrl) {
    // Store the parameters if provided
    if (sellerId) {
      this.sellerId_ = sellerId;
    }

    if (canonicalUrl) {
      this.canonicalUrl_ = canonicalUrl;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console /*OK*/
        .log('Already connected');
      return true;
    }

    try {
      if (!this.sellerId_ || !this.canonicalUrl_) {
        console /*OK*/
          .error('Missing sellerId or canonicalUrl for connection');
        return false;
      }

      const url = RealtimeManager.HUB_URL_TEMPLATE_DEV.replace(
        '$SELLERID$',
        this.sellerId_
      )
        .replace('$HT$', '1')
        .replace('$V$', '0.5')
        .replace('$URL$', encodeURIComponent(this.canonicalUrl_));

      const ws = new WebSocket(url);
      this.setWebSocket_(ws);

      ws.addEventListener('open', this.onOpen_.bind(this));
      ws.addEventListener('close', this.onDisconnect_.bind(this));
      ws.addEventListener('error', this.onError_.bind(this));
      ws.addEventListener('message', this.onReceiveMessage_.bind(this));

      console /*OK*/
        .log('Connection initiated');
      return true;
    } catch (e) {
      console /*OK*/
        .error('Failed to connect:', e);
      return false;
    }
  }

  /**
   * Disconnect the WebSocket
   * @param {boolean=} clearQueue - Whether to clear the message queue (default: false)
   * @public
   */
  disconnect(clearQueue = false) {
    if (!this.ws) {
      return;
    }

    try {
      this.handshakeComplete_ = false;

      if (clearQueue) {
        this.messageQueue_ = [];
      }

      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close(1000, 'Manual disconnect');
      }

      this.ws.removeEventListener('open', this.onOpen_.bind(this));
      this.ws.removeEventListener('close', this.onDisconnect_.bind(this));
      this.ws.removeEventListener('error', this.onError_.bind(this));
      this.ws.removeEventListener('message', this.onReceiveMessage_.bind(this));

      this.onConnect = null;
      this.onFailedConnect = null;
      this.onDisconnect = null;
      this.onReceiveMessage = null;
      this.onLogMessage = null;
      this.onHandshakeComplete = null;

      this.ws = null;
      console /*OK*/
        .log('Disconnected from WebSocket server');
    } catch (e) {
      console /*OK*/
        .error('Error during disconnect:', e);
    }
  }

  /**
   * Sends a message through the WebSocket connection
   * @param {!Object} message - The message to send
   * @return {boolean} - True if message was sent or queued, false otherwise
   */
  send(message) {
    if (!this.handshakeComplete_) {
      console /*OK*/
        .log('Handshake not complete, queueing message');
      this.messageQueue_.push(message);

      return true;
    }

    return this.sendImmediately_(message);
  }

  /**
   * Sends a handshake message to initialize the connection
   * @param {string=} message - handshake
   * @return {boolean} - True if handshake was sent, false otherwise
   */
  sendHandshake(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console /*OK*/
        .error('Cannot send handshake - WebSocket not connected');
      return false;
    }

    try {
      this.ws.send(message);
      console /*OK*/
        .log('Handshake sent');

      this.onHandshakeComplete_();

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
