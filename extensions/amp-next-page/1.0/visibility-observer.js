import {RelativePositions_Enum} from '#core/dom/layout/rect';
import {throttle} from '#core/types/function';

import {Services} from '#service';
import {
  PositionObserver, // eslint-disable-line @typescript-eslint/no-unused-vars
  installPositionObserverServiceForDoc,
} from '#service/position-observer/position-observer-impl';
import {
  PositionInViewportEntryDef,
  PositionObserverFidelity_Enum,
} from '#service/position-observer/position-observer-worker';

import {devAssert} from '#utils/log';

/** @enum {number} */
export const ViewportRelativePos = {
  INSIDE_VIEWPORT: 1,
  OUTSIDE_VIEWPORT: 2,
  LEAVING_VIEWPORT: 3,
  ENTERING_VIEWPORT: 4,
  CONTAINS_VIEWPORT: 5,
};

/** @const {number} */
const SCROLL_THROTTLE_THRESHOLD = 20;

// TODO(wassgha): Consolidate with amp-video-docking
// and other places where ScrollDirection is used
/** @enum {number} */
export const ScrollDirection = {UP: 1, DOWN: -1};

export class VisibilityObserverEntry {
  /**
   * @param {!VisibilityObserver} observer
   * @param {function(!ViewportRelativePos)} callback
   */
  constructor(observer, callback) {
    /** @private {!VisibilityObserver} */
    this.observer_ = observer;
    /** @private {?RelativePositions_Enum} */
    this.topSentinelPosition_ = null;
    /** @private {?RelativePositions_Enum} */
    this.bottomSentinelPosition_ = null;
    /** @const {function(!ViewportRelativePos)} */
    this.callback = callback;
  }

  /**
   * @return {?RelativePositions_Enum}
   */
  get top() {
    return this.topSentinelPosition_;
  }

  /**
   * @return {?RelativePositions_Enum}
   */
  get bottom() {
    return this.bottomSentinelPosition_;
  }

  /**
   * @param {!Element} element
   * @param {!Element} parent
   */
  observe(element, parent) {
    const top = element.ownerDocument.createElement('div');
    top.classList.add('i-amphtml-next-page-document-top-sentinel');
    const bottom = element.ownerDocument.createElement('div');
    bottom.classList.add('i-amphtml-next-page-document-bottom-sentinel');

    parent.insertBefore(top, element);
    parent.insertBefore(bottom, element.nextSibling);

    this.observer_
      .getPositionObserver()
      .observe(top, PositionObserverFidelity_Enum.LOW, (position) =>
        this.topSentinelPositionChanged_(position)
      );
    this.observer_
      .getPositionObserver()
      .observe(bottom, PositionObserverFidelity_Enum.LOW, (position) =>
        this.bottomSentinelPositionChanged_(position)
      );
  }

  /**
   * Called when a position change is detected on the injected
   * top sentinel element
   * @param {?PositionInViewportEntryDef} position
   */
  topSentinelPositionChanged_(position) {
    this.topSentinelPosition_ = position.relativePos;
    this.observer_.updateRelativePos(this);
  }

  /**
   * Called when a position change is detected on the injected
   * bottom sentinel element
   * @param {?PositionInViewportEntryDef} position
   */
  bottomSentinelPositionChanged_(position) {
    this.bottomSentinelPosition_ = position.relativePos;
    this.observer_.updateRelativePos(this);
  }

  /**
   * @return {boolean}
   */
  usesSentinel() {
    return true;
  }
}

class VisibilityObserverHostEntry extends VisibilityObserverEntry {
  /**
   * @param {!VisibilityObserver} observer
   * @param {function(!ViewportRelativePos)} callback
   * @param {!Element} nextPageEl
   */
  constructor(observer, callback, nextPageEl) {
    super(observer, callback);

    /** @private {!Element} */
    this.nextPageEl_ = nextPageEl;
  }

  /**
   * @override
   */
  usesSentinel() {
    return false;
  }

  /**
   * @return {!Element}
   */
  get nextPageEl() {
    return this.nextPageEl_;
  }
}

export default class VisibilityObserver {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {Array<!VisibilityObserverEntry>} */
    this.entries_ = [];

    /** @private {number} */
    this.lastScrollTop_ = 0;

    /** @private {!ScrollDirection} */
    this.scrollDirection_ = ScrollDirection.DOWN;

    /** @private {?ScrollDirection} */
    this.lastScrollDirection_ = null;

    /**
     * @private
     * @const {!../../../src/service/viewport/viewport-interface.ViewportInterface}
     */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {number} */
    this.viewportHeight_ = 0;

    /** @private {boolean} */
    this.measuring_ = false;

    /**
     * @private
     * @const {!../../../src/service/mutator-interface.MutatorInterface}
     */
    this.mutator_ = Services.mutatorForDoc(ampdoc);

    const updateScrollThrottled = throttle(
      ampdoc.win,
      this.updateScroll_.bind(this),
      200
    );

    this.viewport_.onScroll(updateScrollThrottled.bind(this));
    this.viewport_.onResize(updateScrollThrottled.bind(this));
    this.updateScroll_();
  }

  /** @return {!../../../src/service/mutator-interface.MutatorInterface} */
  get mutator() {
    return this.mutator_;
  }

  /**
   * @private
   */
  updateScroll_() {
    if (this.measuring_) {
      return;
    }
    this.measuring_ = true;
    this.mutator_
      .measureElement(() => {
        this.viewportHeight_ = this.viewport_.getHeight();
        const scrollTop = this.viewport_.getScrollTop();
        const delta = scrollTop - this.lastScrollTop_;
        // Throttle
        if (Math.abs(delta) < SCROLL_THROTTLE_THRESHOLD) {
          return;
        }
        const scrollDirection =
          delta > 0 ? ScrollDirection.DOWN : ScrollDirection.UP;

        this.entries_.forEach((entry) => {
          // Entries that rely on scroll should be updated on every scroll
          // while entries that reliy on sentinels should only be updated
          // if the scroll direction changes
          if (
            !entry.usesSentinel() ||
            this.lastScrollDirection_ !== scrollDirection
          ) {
            this.updateRelativePos(entry);
          }
        });

        this.lastScrollTop_ = scrollTop;
        this.lastScrollDirection_ = this.scrollDirection_;
        this.scrollDirection_ = scrollDirection;
      })
      .then(() => {
        this.measuring_ = false;
      });
  }

  /**
   * @return {boolean}
   */
  isScrollingUp() {
    return this.scrollDirection_ === ScrollDirection.UP;
  }

  /**
   * @return {boolean}
   */
  isScrollingDown() {
    return this.scrollDirection_ === ScrollDirection.DOWN;
  }

  /**
   * @param {!Element} element
   * @param {!Element} parent
   * @param {function(!ViewportRelativePos)} callback
   */
  observe(element, parent, callback) {
    const entry = new VisibilityObserverEntry(this, callback);
    this.entries_.push(entry);
    entry.observe(element, parent);
  }

  /**
   * @param {!Element} nextPageEl delimits the host page's document
   * @param {function(!ViewportRelativePos)} callback
   */
  observeHost(nextPageEl, callback) {
    const entry = new VisibilityObserverHostEntry(this, callback, nextPageEl);
    this.entries_.push(entry);
  }

  /**
   * @return {!PositionObserver}
   */
  getPositionObserver() {
    installPositionObserverServiceForDoc(this.ampdoc_);
    return Services.positionObserverForDoc(this.ampdoc_.getHeadNode());
  }

  /**
   * Calculates the position of the element relative to the viewport
   * based on the positions of the injected bottom and top sentinel elements
   *
   * @param {!VisibilityObserverEntry} entry
   */
  updateRelativePos(entry) {
    const relativePos = entry.usesSentinel()
      ? this.getRelativePosFromSentinel(entry)
      : this.getRelativePosFromScroll(
          /** @type {!VisibilityObserverHostEntry} */ (entry)
        );
    if (!relativePos) {
      return;
    }
    entry.callback(devAssert(relativePos));
  }

  /**
   * @param {!VisibilityObserverHostEntry} entry
   * @return {?ViewportRelativePos}
   */
  getRelativePosFromScroll(entry) {
    // Measure the position of the host page (edge case)
    const {lastScrollTop_: scroll, viewportHeight_: vh} = this;
    // Document height is the same as the distance from the top
    // to the <amp-next-page> element
    // TODO(wassgha): Synchronous access to position updates will
    // be deprecated, move to async getLayoutBox()
    const {top: height} = entry.nextPageEl.getLayoutBox();
    if (scroll < height - vh) {
      return ViewportRelativePos.CONTAINS_VIEWPORT;
    }
    if (scroll < height && height <= vh && scroll <= 0) {
      return ViewportRelativePos.INSIDE_VIEWPORT;
    }
    if (scroll < height) {
      return this.isScrollingDown()
        ? ViewportRelativePos.LEAVING_VIEWPORT
        : ViewportRelativePos.ENTERING_VIEWPORT;
    }
    return ViewportRelativePos.OUTSIDE_VIEWPORT;
  }

  /**
   * @param {!VisibilityObserverEntry} entry
   * @return {?ViewportRelativePos}
   */
  getRelativePosFromSentinel(entry) {
    const {bottom, top} = entry;
    const {BOTTOM, INSIDE, TOP} = RelativePositions_Enum;
    if (!top && !bottom) {
      // Early exit if this an intersection change happening before a
      // sentinel position change
      return null;
    }
    if (top === INSIDE && bottom === INSIDE) {
      // Both the top and bottom sentinel elements are within the
      // viewport bounds meaning that the document is short enough
      // to be contained inside the viewport
      return ViewportRelativePos.INSIDE_VIEWPORT;
    }
    if ((!top || top === TOP) && (!bottom || bottom === BOTTOM)) {
      // The head of the document is above the viewport and the
      // foot of the document is below it, meaning that the viewport
      // is looking at a section of the document
      return ViewportRelativePos.CONTAINS_VIEWPORT;
    }
    if (
      ((!top || top === TOP) && bottom === TOP) ||
      (top === BOTTOM && (!bottom || bottom === BOTTOM))
    ) {
      // Both the top and the bottom of the document are either
      // above or below the document meaning that the viewport hasn't
      // reached the document yet or has passed it
      return ViewportRelativePos.OUTSIDE_VIEWPORT;
    }
    const atBottom =
      (top === TOP || top === INSIDE) && (!bottom || bottom === BOTTOM);
    const scrollingUp = this.isScrollingUp();
    // The remaining case is the case where the document is halfway
    // through being scrolling into/out of the viewport in which case
    // we don't need to update the visibility
    return !!atBottom === !!scrollingUp
      ? ViewportRelativePos.LEAVING_VIEWPORT
      : ViewportRelativePos.ENTERING_VIEWPORT;
  }
}
