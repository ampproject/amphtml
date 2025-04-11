/**
 * Handles communication between the AMP ad and the extension iframe
 */
export class ExtensionCommunicator {
  queue = [];

  /**
   * @param {function()} handler message handler
   */
  constructor(handler) {
    this.handler = handler;
  }

  /**
   * Create Extension Communication Channel
   */
  initExtensionCommunication() {
    if (!this.listener) {
      !this.listenerAttacher &&
        (this.listenerAttacher = setInterval(
          () => this.initExtensionCommunication(),
          2000
        ));
      this.listener = window.frames['TG-listener'];
    }
    if (this.listener) {
      this.listener.addEventListener('message', this.handler);
      // this.listener./*OK*/ postMessage('extensionReady', '*');
      while (this.queue.length !== 0) {
        this.listener./*OK*/ postMessage(this.queue.shift(), '*');
      }
      if (this.listenerAttacher) {
        clearInterval(this.listenerAttacher);
      }
    }
  }

  /**
   * Send a message to the extension iframe
   * @param {string} type - The message type
   * @param {object} data - The message data
   */
  sendIframeMessage(type, data) {
    const msg = {
      type,
      data,
    };

    this.queue.push(msg);
    this.initExtensionCommunication();
  }

  /**
   * Cleanup event listeners and intervals
   */
  destroy() {
    if (this.listener) {
      this.listener.removeEventListener('message', this.handler);
    }

    if (this.listenerAttacher) {
      clearInterval(this.listenerAttacher);
      this.listenerAttacher = null;
    }

    this.listener = null;
    this.queue = [];
  }
}
