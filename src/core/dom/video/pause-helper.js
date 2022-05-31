import {
  observeBorderBoxSize,
  unobserveBorderBoxSize,
} from '#core/dom/layout/size-observer';

export class PauseHelper {
  /**
   * @param {HTMLElement & IPausable} element
   */
  constructor(element) {
    /**
     * @private
     * @const
     * @type {HTMLElement & IPausable}
     */
    this.element_ = element;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private {boolean} */
    this.hasSize_ = false;

    this.pauseWhenNoSize_ = this.pauseWhenNoSize_.bind(this);
  }

  /**
   * @param {boolean} isPlaying
   */
  updatePlaying(isPlaying) {
    if (isPlaying === this.isPlaying_) {
      return;
    }
    this.isPlaying_ = isPlaying;
    if (isPlaying) {
      // Pause will not be called until transitioning from "has size" to
      // "no size". Which means a measurement must first be received that
      // has size, then a measurement that does not have size.
      this.hasSize_ = false;
      observeBorderBoxSize(this.element_, this.pauseWhenNoSize_);
    } else {
      unobserveBorderBoxSize(this.element_, this.pauseWhenNoSize_);
    }
  }

  /**
   * @param {ResizeObserverSize} size
   * @private
   */
  pauseWhenNoSize_({blockSize, inlineSize}) {
    const hasSize = inlineSize > 0 && blockSize > 0;
    if (hasSize === this.hasSize_) {
      return;
    }
    this.hasSize_ = hasSize;

    const element = this.element_;
    if (!hasSize) {
      element.pause();
    }
  }
}
