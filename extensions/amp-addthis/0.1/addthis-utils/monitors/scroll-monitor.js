import {Services} from '#service';

export class ScrollMonitor {
  /**
   * Creates an instance of ScrollMonitor.
   */
  constructor() {
    this.viewport_ = null;
    this.initialViewHeight_ = 0;
    this.maxScrollTop_ = 0;
    this.maxScrollPlusHeight_ = 0;
  }

  /**
   * Starts scroll monitor for the given AMP document.
   *
   * @param {!../../../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   */
  startForDoc(ampDoc) {
    this.viewport_ = Services.viewportForDoc(ampDoc);
    this.initialViewHeight_ = this.viewport_.getHeight() || 0;
    this.maxScrollTop_ = this.viewport_.getScrollTop() || 0;
    this.maxScrollPlusHeight_ = this.maxScrollTop_ + this.initialViewHeight_;

    this.viewport_.onScroll(this.listener.bind(this));
  }

  /**
   * Calculates max scroll top.
   */
  listener() {
    const scrollTop = this.viewport_.getScrollTop() || 0;
    this.maxScrollTop_ = Math.max(this.maxScrollTop_, scrollTop);
    this.maxScrollPlusHeight_ = Math.max(
      this.maxScrollPlusHeight_,
      (this.viewport_.getHeight() || 0) + scrollTop
    );
  }

  /**
   * Returns the initial height of viewport.
   *
   * @return {number}
   */
  getInitialViewHeight() {
    return this.initialViewHeight_;
  }

  /**
   * Returns the max scroll height.
   *
   * @return {number}
   */
  getScrollHeight() {
    return this.maxScrollPlusHeight_ - this.maxScrollTop_;
  }
}
