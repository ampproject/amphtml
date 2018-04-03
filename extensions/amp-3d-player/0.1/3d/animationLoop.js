export default (() => {
  function now() {
    const performance = window.performance;
    return performance && performance.now ? performance.now() : Date.now();
  }

  function AnimationLoop(tasks) {
    this.fpsLimit = 0;
    /** @private {Array<function>} */
    this.tasks_ = tasks;
    /** @private {boolean} */
    this.isRunning_ = false;
    /** @private {(number)} */
    this.currentRAF_ = 0;
    /** @private {number} */
    this.prevFrameTime_ = now();

    /** @public {boolean} */
    this.needsUpdate = true;

    this.loop_ = this.loop_.bind(this);
  }

  AnimationLoop.prototype = {
    constructor: AnimationLoop,
    /** @private */
    performTasks_() {
      this.tasks_.forEach(t => {t();});
    },

    run() {
      if (this.isRunning_) {
        return false;
      }
      this.isRunning_ = true;
      this.loop_();
    },

    stop() {
      this.isRunning_ = false;
      if (this.currentRAF_ !== 0) {
        cancelAnimationFrame(this.currentRAF_);
        this.currentRAF_ = 0;
      }
    },

    /** @private */
    loop_() {
      if (this.isNeedToRender_) {
        this.performTasks_();
      }
      this.currentRAF_ = requestAnimationFrame(this.loop_);
    },

    /** @private {boolean} */
    get isNeedToRender_() {
      if (!this.needsUpdate) {
        return false;
      }

      if (!this.fpsLimit) {
        this.needsUpdate = false;
        return true;
      }

      const time = now();
      const dt = time - this.prevFrameTime_;
      const result = dt > 1000 / this.fpsLimit;
      if (!result) {
        return false;
      }
      this.prevFrameTime_ = time;
      this.needsUpdate = false;
      return true;
    },
  };

  window.AnimationLoop = AnimationLoop;
});
