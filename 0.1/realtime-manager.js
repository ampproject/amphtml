export class RealtimeManager {
  /** @const {string} */
  static HUB_URL_TEMPLATE =
    'wss://amp-messaging.insurads.com/rt-pub/node2/hub?pid=$PUBLICID$&ht=$HT$&v=$V$&url=$URL$';
  static HUB_URL_TEMPLATE_DEV =
    'wss://localhost:5082/rt-pub/node2/hub?pid=$PUBLICID$&ht=$HT$&v=$V$&url=$URL$';
  /** @private {?RealtimeManager} */
  static instance_ = null;

  /** @private {?WebSocket} */
  ws = null;

  /** @private {string} */
  publicId_ = '';

  /** @private {string} */
  canonicalUrl_ = '';

  /** @private {boolean} */
  handshakeComplete_ = false;

  /** @private {Array<Object>} */
  messageQueue_ = [];

  // Bound event handlers
  /** @private {?function} */
  boundOnOpen_ = null;
  /** @private {?function} */
  boundOnDisconnect_ = null;
  /** @private {?function} */
  boundOnError_ = null;
  /** @private {?function} */
  boundOnReceiveMessage_ = null;

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

  maxRetries = 2;
  retryCount = 0;
  retryDelay = 2000;
  retryTimer = null;

  /**
   * Creates a new RealtimeManager
   * @param {string=} publicId - Optional public ID
   * @param {string=} canonicalUrl - Optional canonical URL
   */
  constructor(publicId = '', canonicalUrl = '') {
    if (publicId) {
      this.publicId_ = publicId;
    }
    if (canonicalUrl) {
      this.canonicalUrl_ = canonicalUrl;
    }

    this.boundOnOpen_ = this.onOpen_.bind(this);
    this.boundOnDisconnect_ = this.onDisconnect_.bind(this);
    this.boundOnError_ = this.onError_.bind(this);
    this.boundOnReceiveMessage_ = this.onReceiveMessage_.bind(this);
  }

  /**
   * Returns the singleton instance of RealtimeManager.
   * @param {string} publicId - The public ID
   * @param {string} canonicalUrl - The canonical URL
   * @return {!RealtimeManager}
   * @public
   */
  static start(publicId, canonicalUrl) {
    if (!RealtimeManager.instance_) {
      RealtimeManager.instance_ = new RealtimeManager(publicId, canonicalUrl);
      RealtimeManager.instance_.connect();
    }

    if (!RealtimeManager.instance_.isConnected()) {
      RealtimeManager.instance_.connect();
    }

    return RealtimeManager.instance_;
  }

  /**
   *  Checks if the WebSocket is connected.
   *  @return {boolean}
   *  @public
   * */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Initializes event handlers for WebSocket events
   *  @private
   * */
  onOpen_() {
    console /*OK*/
      .log('WebSocket connection opened');

    this.clearRetryTimer_();

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
    if (
      !this.retryTimer &&
      this.retryCount < this.maxRetries &&
      event.code !== 1000
    ) {
      this.retryCount++;
      console /*OK*/
        .log(
          `Connection closed, retrying (${this.retryCount}/${this.maxRetries})`
        );
      this.retryTimer = setTimeout(() => {
        this.connect();
      }, this.retryDelay);
      return;
    }

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

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
   * @return {boolean} - True if connection was initiated, false otherwise
   * @public
   */
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console /*OK*/
        .log('Already connected');
      return true;
    }

    try {
      if (!this.publicId_ || !this.canonicalUrl_) {
        console /*OK*/
          .error('Missing publicId or canonicalUrl for connection');
        return false;
      }

      const url = RealtimeManager.HUB_URL_TEMPLATE.replace(
        '$PUBLICID$',
        this.publicId_
      )
        .replace('$HT$', '2')
        .replace('$V$', '1.0')
        .replace('$URL$', encodeURIComponent(this.canonicalUrl_));

      this.ws = new WebSocket(url);

      this.ws.addEventListener('open', this.boundOnOpen_);
      this.ws.addEventListener('close', this.boundOnDisconnect_);
      this.ws.addEventListener('error', this.boundOnError_);
      this.ws.addEventListener('message', this.boundOnReceiveMessage_);

      console /*OK*/
        .log('Connection initiated');

      this.clearRetryTimer_();

      return true;
    } catch (e) {
      console /*OK*/
        .error('Failed to connect:', e);

      this.clearRetryTimer_();

      return false;
    }
  }

  /**
   * Disconnect the WebSocket
   * @param {boolean=} clearQueue - Whether to clear the message queue (default: true)
   * @param {number=} code - Optional close code (default: 1000 - normal closure)
   * @param {string=} reason - Optional reason for closing
   * @public
   */
  disconnect(clearQueue = true, code = 1000, reason = 'AMP is going away') {
    if (!this.ws) {
      this.handshakeComplete_ = false;
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
        this.ws.close(code, reason);
      }

      this.ws.removeEventListener('open', this.boundOnOpen_);
      this.ws.removeEventListener('close', this.boundOnDisconnect_);
      this.ws.removeEventListener('error', this.boundOnError_);
      this.ws.removeEventListener('message', this.boundOnReceiveMessage_);

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

  /**
   * Clears the retry timer and resets retry count
   * @private
   */
  clearRetryTimer_() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
      this.retryCount = 0;
      console /*OK*/
        .log('Retry timer cleared');
    }
  }
}
