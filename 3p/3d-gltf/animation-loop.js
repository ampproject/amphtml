export default class AnimationLoop {
  /**
   * Creates an instance of AnimationLoop.
   * @param {!Function} task
   */
  constructor(task) {
    /** @private */
    this.task_ = task;

    /** @private {boolean} */
    this.isRunning_ = false;

    /** @private {number} */
    this.currentRAF_ = 0;

    /** @public {boolean} */
    this.needsUpdate = true;

    /** @private */
    this.loop_ = this.loop_.bind(this);
  }

  /**
   * Runs the task
   * @return {boolean}
   */
  run() {
    if (this.isRunning_) {
      return false;
    }
    this.isRunning_ = true;
    this.loop_();
    return true;
  }

  /**
   * Stops the task execution.
   */
  stop() {
    this.isRunning_ = false;
    if (this.currentRAF_ !== 0) {
      cancelAnimationFrame(this.currentRAF_);
      this.currentRAF_ = 0;
    }
  }

  /** @private */
  loop_() {
    if (!this.isRunning_) {
      return;
    }

    if (this.needsUpdate) {
      this.needsUpdate = false;
      this.task_();
    }

    this.currentRAF_ = requestAnimationFrame(this.loop_);
  }
}
