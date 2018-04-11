export default (() => {
  function now() {
    const performance = window.performance;
    return performance && performance.now ? performance.now() : Date.now();
  }

  /** @constructor
   * @callback task */
  function AnimationLoop(task) {
    /** @public {number} */
    this.fpsLimit = 0;

    /** @function
     * @private */
    this.task_ = task;

    /** @private {boolean} */
    this.isRunning_ = false;
    /** @private {(number)} */
    this.currentRAF_ = 0;
    /** @private {number} */
    this.prevFrameTime_ = now();

    /** @public {boolean} */
    this.needsUpdate = true;

    /** @function
     * @private */
    this.loop_ = this.loop_.bind(this);
  }

  AnimationLoop.prototype = {
    constructor: AnimationLoop,

    /** @private */
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
        this.performTask_();
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
