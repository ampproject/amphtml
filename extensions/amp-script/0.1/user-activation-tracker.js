import {devAssert} from '#utils/log';

export const ACTIVATION_TIMEOUT = 5000; // 5 seconds.

const ACTIVATION_EVENTS = [
  'change',
  'click',
  'dblclick',
  'input',
  'keypress',
  'submit',
  'keydown',
];

/**
 * See https://github.com/dtapuska/useractivation for inspiration.
 * @implements {../../../src/service.Disposable}
 */
export class UserActivationTracker {
  /**
   * @param {!Element} root
   */
  constructor(root) {
    /** @private @const */
    this.root_ = root;
    /** @private @const */
    this.boundActivated_ = this.activated_.bind(this);
    /** @private {number} */
    this.lastActivationTime_ = 0;
    /** @private {boolean} */
    this.inLongTask_ = false;

    ACTIVATION_EVENTS.forEach((type) => {
      this.root_.addEventListener(
        type,
        this.boundActivated_,
        /* capture */ true
      );
    });
  }

  /** @override */
  dispose() {
    ACTIVATION_EVENTS.forEach((type) => {
      this.root_.removeEventListener(
        type,
        this.boundActivated_,
        /* capture */ true
      );
    });
  }

  /**
   * Whether the element has ever been active since this tracker was alive.
   * @return {boolean}
   */
  hasBeenActive() {
    return this.lastActivationTime_ > 0;
  }

  /**
   * Whether the element is currently considered to be active.
   * @return {boolean}
   */
  isActive() {
    return (
      (this.lastActivationTime_ > 0 &&
        Date.now() - this.lastActivationTime_ <= ACTIVATION_TIMEOUT) ||
      this.inLongTask_
    );
  }

  /**
   * The time of the last activation.
   * @return {time}
   */
  getLastActivationTime() {
    return this.lastActivationTime_;
  }

  /**
   * @param {!Promise} promise
   */
  expandLongTask(promise) {
    if (!this.isActive()) {
      return;
    }
    devAssert(
      !this.inLongTask_,
      'Should not expand while a longTask is already ongoing.'
    );
    this.inLongTask_ = true;

    const longTaskComplete = () => {
      this.inLongTask_ = false;
      // Add additional "activity window" after a long task is done.
      this.lastActivationTime_ = Date.now();
    };
    promise.then(longTaskComplete, longTaskComplete);
  }

  /**
   * @return {boolean}
   */
  isInLongTask() {
    return this.inLongTask_;
  }

  /**
   * @param {!Event} event
   * @private
   */
  activated_(event) {
    if (event.isTrusted) {
      this.lastActivationTime_ = Date.now();
    }
  }
}
