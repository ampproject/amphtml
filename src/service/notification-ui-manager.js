export const NOTIFICATION_UI_MANAGER = 'notificationUIManager';

export class NotificationUiManager {
  /**
   * Creates an instance of NotificationUiManager.
   */
  constructor() {
    /** @private {number} */
    this.queueSize_ = 0;

    /** @private {!Promise} */
    this.queuePromise_ = Promise.resolve();

    /** @private {function()} */
    this.queueEmptyHandler_ = () => {}; // Make this an observable if requested

    /** @private {function()} */
    this.queueNotEmptyHandler_ = () => {};
  }

  /**
   * Register handler to be called when UI queue becomes empty
   * @param {function()} handler
   */
  onQueueEmpty(handler) {
    this.queueEmptyHandler_ = handler;
    if (this.queueSize_ == 0) {
      handler();
    }
  }

  /**
   * Register handler to be called when UI queue becomes not empty
   * @param {function()} handler
   */
  onQueueNotEmpty(handler) {
    this.queueNotEmptyHandler_ = handler;
    if (this.queueSize_ > 0) {
      handler();
    }
  }

  /**
   * Register to display UI. Notification will be blocked until previous one has
   * been dismissed.
   * @param {function():!Promise} show
   * @return {!Promise}
   */
  registerUI(show) {
    if (this.queueSize_ == 0) {
      this.queueNotEmptyHandler_();
    }
    this.queueSize_++;
    const promise = this.queuePromise_.then(() => {
      return show().then(() => {
        this.queueSize_--;
        if (this.queueSize_ == 0) {
          this.queueEmptyHandler_();
        }
      });
    });
    this.queuePromise_ = promise;
    return promise;
  }
}
