import {Observable} from '#core/data-structures/observable';

export class VideoSessionManager {
  /**
   * Creates an instance of VideoSessionManager.
   */
  constructor() {
    /** @private */
    this.isSessionActive_ = false;

    /** @private */
    this.endSessionObservable_ = new Observable();
  }

  /**
   * Register a listener to be notified when a session has ended
   * @param {!Function} listener
   */
  onSessionEnd(listener) {
    this.endSessionObservable_.add(listener);
  }

  /**
   * Begin a session.
   */
  beginSession() {
    this.isSessionActive_ = true;
  }

  /**
   * End a session.
   */
  endSession() {
    if (this.isSessionActive_) {
      this.endSessionObservable_.fire();
    }
    this.isSessionActive_ = false;
  }

  /**
   * Get the current session state.
   * @return {*} TODO(#23582): Specify return type
   */
  isSessionActive() {
    return this.isSessionActive_;
  }
}
