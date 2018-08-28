

export default class EventMessenger {
  /**
   * Constructor
   */
  constructor() {
    this.listeners_ = {};
  }

  /**
   * Send synchronous event to listeners.
   * @param {string} eventName
   * @param {Object=} data - Optional data
   */
  send(eventName, data) {
    const handlers = this.listeners_[eventName];
    if (!handlers) {
      return;
    }

    handlers.forEach(handler => {
      handler(data);
    });
  }

  /**
   * Listen for a specific event and call callback function when event is received.
   * @param {string} eventName
   * @param {Function} callback
   */
  on(eventName, callback) {
    if (this.listeners_[eventName]) {
      this.listeners_[eventName].push(callback);
    } else {
      this.listeners_[eventName] = [callback];
    }
  }
}