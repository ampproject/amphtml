import {Services} from '#service';

/**
 * Used for tracking whether or not an item is near the viewport. This is set
 * from the IntersectionObserver and consumed by a flush.
 */
const NEAR_VIEWPORT_FLAG = '__AMP_CAROUSEL_NEAR_VIEWPORT';

/**
 * Used for tracking whether or not an item is in the viewport. This is set
 * from the IntersectionObserver and consumed by a flush.
 */
const IN_VIEWPORT_FLAG = '__AMP_CAROUSEL_IN_VIEWPORT';

/**
 * The value for having no margin for intersection. That is, the item must
 * intersect the intersection root itself.
 */
const NO_INTERSECTION_MARGIN = '0%';

/**
 * The default margin around the scrolling element. This is a percentage of the
 * width of the element.
 */
const DEFAULT_NEARBY_MARGIN = 100;

/**
 * Additional margin before something is unlaidout. This is a percentage of the
 * width of the element. This is used to avoid a rapid back and forth between
 * layout and unlayout at the threshold of the nearby margin.
 */
const UNLAYOUT_MARGIN = 10;

/**
 * What percentage of an Element must intersect before being considered as
 * visible. This defaults to 1%, as the value for zero is not intuitive. For
 * example, a horizontal scrolling container that has full width items will
 * intersect on the second element if you have an intersection margin/threshold
 * of 0, since the left edge of the second element "intersects" with the
 * scrolling container, even though none of element is visible (not even 1 pixel).
 *
 * While the sepc says a value of "0" means "any non-zero number of pixels",
 * there are actual no pixels actually visible at this threshold.
 */
const DEFAULT_INTERSECTION_THRESHOLD = 0.01;

/**
 * @enum {number}
 */
const ViewportChangeState = {
  ENTER: 0,
  LEAVE: 1,
};

/**
 * Manages scheduling layout/unlayout for children of an AMP component as they
 * intersect with the AMP component. The parent AMP component should notify the
 * manager as its own layout state changes so that the children can be updated
 * accordingly.
 *
 * Note: For Safari 12, this does not schedule layout for slides until they
 * enter the viewport, since `rootMargin` on `IntersectionObserver` is not
 * properly handled.
 *
 * Usage:
 *
 * Parent element:
 * ```
 * constructor() {
 *   this.childLayoutManager = new ChildLayoutManager({
 *     ampElement: this,
 *   });
 * }

 * buildCallback() {
 *   // Call this each time the effective children you want to manage change.
 *   this.childLayoutManager.updateChildren(children);
 * }
 *
 * layoutCallback() {
 *   this.childLayoutManager.wasLaidOut();
 * }
 *
 *
 * unlayoutCallback() {
 *   this.childLayoutManager.wasUnlaidOut();
 * }
 * ```
 */
export class ChildLayoutManager {
  /**
   * Creates a ChildLayoutManager for a given intersection container.
   *
   * Note: If the children live within a scrolling container, the
   * intersectionElement must be the scrolling container, and not an
   * ancestor in order for `nearbyMarginInPercent` to work.
   * @param {{
   *  ampElement: !AMP.BaseElement,
   *  intersectionElement: !Element,
   *  intersectionThreshold: (number|undefined),
   *  nearbyMarginInPercent: (number|undefined),
   *  viewportIntersectionThreshold: (number|undefined),
   *  viewportIntersectionCallback: (function(!Element, boolean)|undefined)
   * }} config
   */
  constructor(config) {
    const {
      ampElement,
      intersectionElement,
      intersectionThreshold = DEFAULT_INTERSECTION_THRESHOLD,
      nearbyMarginInPercent = DEFAULT_NEARBY_MARGIN,
      viewportIntersectionThreshold = intersectionThreshold,
      viewportIntersectionCallback = () => {},
    } = config;

    /** @private @const */
    this.ampElement_ = ampElement;

    /** @private @const */
    this.owners_ = Services.ownersForDoc(ampElement.element);

    /** @private @const */
    this.intersectionElement_ = intersectionElement;

    /** @private @const */
    this.intersectionThreshold_ = intersectionThreshold;

    /** @private @const */
    this.nearbyMarginInPercent_ = nearbyMarginInPercent;

    /** @private @const */
    this.viewportIntersectionThreshold_ = viewportIntersectionThreshold;

    /** @private @const */
    this.viewportIntersectionCallback_ = viewportIntersectionCallback;

    /** @private */
    this.queueChanges_ = false;

    /** @private {!IArrayLike<!Element>} */
    this.children_ = [];

    /** @private {?IntersectionObserver} */
    this.nearingViewportObserver_ = null;

    /** @private {?IntersectionObserver} */
    this.backingAwayViewportObserver_ = null;

    /** @private {?IntersectionObserver} */
    this.inViewportObserver_ = null;

    /** @private {boolean} */
    this.laidOut_ = false;
  }

  /**
   * Sets whether visibility changes should be applied immediately or queued
   * for a later flush. This is useful on iOS, as doing layout during scrolling
   * can cause flickering due to paint.
   * @param {boolean} queueChanges
   */
  setQueueChanges(queueChanges) {
    this.queueChanges_ = queueChanges;
  }

  /**
   * @param {!Element} target
   * @param {boolean} isIntersecting
   */
  triggerLayout_(target, isIntersecting) {
    if (isIntersecting) {
      // TODO(sparhami) do we want to delay the layout for the farther
      // away elements? Do we want schedule preload farther away elements?
      this.owners_.scheduleLayout(this.ampElement_.element, target);
    } else {
      this.owners_./*OK */ scheduleUnlayout(this.ampElement_.element, target);
    }
  }

  /**
   * @param {!Element} target
   * @param {boolean} isIntersecting
   */
  triggerVisibility_(target, isIntersecting) {
    this.viewportIntersectionCallback_(target, isIntersecting);
  }

  /**
   * Sets up for intersection monitoring, creating IntersectionObserver
   * instances for doing layout  as well as those that are actually visible.
   *
   * We set up separate observers for layout and unlayout. When the element is
   * near to the viewport, we trigger layout. However, we have some extra
   * buffer space before triggering unlayout, to prevent cycling between the
   * two on the threshold, which can cause problems in Safari.
   */
  setup_() {
    if (
      this.nearingViewportObserver_ &&
      this.backingAwayViewportObserver_ &&
      this.inViewportObserver_
    ) {
      return;
    }

    const {win} = this.ampElement_;

    this.nearingViewportObserver_ = new win.IntersectionObserver(
      (entries) => this.processNearingChanges_(entries),
      {
        root: this.intersectionElement_,
        rootMargin: `${this.nearbyMarginInPercent_}%`,
        threshold: this.intersectionThreshold_,
      }
    );

    this.backingAwayViewportObserver_ = new win.IntersectionObserver(
      (entries) => this.processBackingAwayChanges_(entries),
      {
        root: this.intersectionElement_,
        rootMargin: `${this.nearbyMarginInPercent_ + UNLAYOUT_MARGIN}%`,
        threshold: this.intersectionThreshold_,
      }
    );

    this.inViewportObserver_ = new win.IntersectionObserver(
      (entries) => this.processInViewportChanges_(entries),
      {
        root: this.intersectionElement_,
        rootMargin: NO_INTERSECTION_MARGIN,
        threshold: this.viewportIntersectionThreshold_,
      }
    );
  }

  /**
   * Processes the intersection entries for things nearing the viewport,
   * marking them applying the changes if needed.
   * @param {!Array<!IntersectionObserverEntry>} entries
   */
  processNearingChanges_(entries) {
    entries
      .filter((entry) => {
        const {isIntersecting} = entry;
        return isIntersecting;
      })
      .forEach((entry) => {
        const {target} = entry;
        target[NEAR_VIEWPORT_FLAG] = ViewportChangeState.ENTER;
      });

    if (!this.queueChanges_) {
      this.flushNearingViewportChanges_();
    }
  }

  /**
   * Processes the intersection entries for things backing away from viewport,
   * marking them applying the changes if needed.
   * @param {!Array<!IntersectionObserverEntry>} entries
   */
  processBackingAwayChanges_(entries) {
    entries
      .filter((entry) => {
        const {isIntersecting} = entry;
        return !isIntersecting;
      })
      .forEach((entry) => {
        const {target} = entry;
        target[NEAR_VIEWPORT_FLAG] = ViewportChangeState.LEAVE;
      });

    if (!this.queueChanges_) {
      this.flushBackingAwayViewportChanges_();
    }
  }

  /**
   * Processes the intersection entries for things in the viewport,
   * marking them applying the changes if needed.
   * @param {!Array<!IntersectionObserverEntry>} entries
   */
  processInViewportChanges_(entries) {
    entries.forEach((entry) => {
      const {isIntersecting, target} = entry;
      target[IN_VIEWPORT_FLAG] = isIntersecting
        ? ViewportChangeState.ENTER
        : ViewportChangeState.LEAVE;
    });

    if (!this.queueChanges_) {
      this.flushInViewportChanges_();
    }
  }

  /**
   * Flush all intersection changes previously picked up.
   */
  flushChanges() {
    this.flushNearingViewportChanges_();
    this.flushBackingAwayViewportChanges_();
    this.flushInViewportChanges_();
  }

  /**
   * Flush changes for things nearing the viewport.
   */
  flushNearingViewportChanges_() {
    for (let i = 0; i < this.children_.length; i++) {
      const child = this.children_[i];

      if (child[NEAR_VIEWPORT_FLAG] == ViewportChangeState.ENTER) {
        this.triggerLayout_(child, true);
        child[NEAR_VIEWPORT_FLAG] = null;
      }
    }
  }

  /**
   * Flush changes for things backing away from the viewport.
   */
  flushBackingAwayViewportChanges_() {
    for (let i = 0; i < this.children_.length; i++) {
      const child = this.children_[i];

      if (child[NEAR_VIEWPORT_FLAG] == ViewportChangeState.LEAVE) {
        this.triggerLayout_(child, false);
        child[NEAR_VIEWPORT_FLAG] = null;
      }
    }
  }

  /**
   * Flush changes for things in the viewport.
   */
  flushInViewportChanges_() {
    for (let i = 0; i < this.children_.length; i++) {
      const child = this.children_[i];

      if (child[IN_VIEWPORT_FLAG] == ViewportChangeState.ENTER) {
        this.triggerLayout_(child, true);
        this.triggerVisibility_(child, true);
      } else if (child[IN_VIEWPORT_FLAG] == ViewportChangeState.LEAVE) {
        this.triggerVisibility_(child, false);
      }

      child[IN_VIEWPORT_FLAG] = null;
    }
  }

  /**
   * @param {boolean} observe Whether or not the parent element is laid out.
   */
  monitorChildren_(observe) {
    // TODO(sparhami) Load a polyfill for browsers that do not support it? We
    // currently just rely on Resource's periodic scan if we do not have
    // IntersectionObserver. This means slides may get loaded later than might
    // be ideal.
    if (!('IntersectionObserver' in this.ampElement_.win)) {
      return;
    }

    this.setup_();

    // Simply disconnect, in case the children have changed, we can make sure
    // everything is detached.
    if (!observe) {
      this.nearingViewportObserver_.disconnect();
      this.backingAwayViewportObserver_.disconnect();
      this.inViewportObserver_.disconnect();
      return;
    }

    for (let i = 0; i < this.children_.length; i++) {
      this.nearingViewportObserver_.observe(this.children_[i]);
      this.backingAwayViewportObserver_.observe(this.children_[i]);
      this.inViewportObserver_.observe(this.children_[i]);
    }
  }

  /**
   * Updates the children that should have their layout managed. Should be
   * called whenever the children change.
   * @param {!IArrayLike<!Element>} children
   */
  updateChildren(children) {
    this.children_ = children;

    if (!('IntersectionObserver' in this.ampElement_.win)) {
      return;
    }

    for (let i = 0; i < this.children_.length; i++) {
      this.owners_.setOwner(this.children_[i], this.ampElement_.element);
    }

    // Update the layout state to false so that we stop observing (and holding
    // on to a reference for) any children that stopped existing.
    this.monitorChildren_(false);
    this.monitorChildren_(this.laidOut_);
  }

  /**
   * This should be called from the `layoutCallback` of the AMP element that
   * constructed this manager.
   */
  wasLaidOut() {
    this.laidOut_ = true;
    this.monitorChildren_(this.laidOut_);
  }

  /**
   * This should be called from the `unlayoutCallback` of the AMP element that
   * constructed this manager.
   */
  wasUnlaidOut() {
    this.laidOut_ = false;
    this.monitorChildren_(this.laidOut_);

    for (let i = 0; i < this.children_.length; i++) {
      this.triggerLayout_(this.children_[i], false);
      this.triggerVisibility_(this.children_[i], false);
    }
  }
}
