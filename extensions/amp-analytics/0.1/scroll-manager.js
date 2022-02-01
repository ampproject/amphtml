import {Observable} from '#core/data-structures/observable';

import {Services} from '#service';

import {devAssert} from '#utils/log';

/**
 * @typedef {{
 *   top: number,
 *   left: number,
 *   width: number,
 *   height: number,
 *   scrollHeight: number,
 *   scrollWidth: number,
 *   initialSize: {
 *      scrollHeight: number,
 *      scrollWidth: number
 *  }
 * }}
 */
export let ScrollEventDef;

/**
 * A manager for handling multiple Scroll Event Trackers.
 * The instance of this class corresponds 1:1 to `AnalyticsRoot`. It represents
 * a collection of all scroll triggers declared within the `AnalyticsRoot`.
 * @implements {../../../src/service.Disposable}
 */
export class ScrollManager {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    /** @const @private {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(root.ampdoc);

    /** @const @private {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(root.ampdoc);

    /** @private {?UnlistenDef} */
    this.viewportOnChangedUnlistener_ = null;

    /** @private {!Observable<!./scroll-manager.ScrollEventDef>} */
    this.scrollObservable_ = new Observable();

    /** @const @private {!Element} */
    this.root_ = root.getRootElement();

    /**  @private {?Promise} */
    this.initialRootRectPromise_ = null;
  }

  /**
   * Function to dispose of all handlers on the scroll observable
   */
  dispose() {
    this.scrollObservable_.removeAll();
    this.removeViewportOnChangedListener_();
  }

  /**
   * @param {function(!Object)} handler
   */
  removeScrollHandler(handler) {
    this.scrollObservable_.remove(handler);

    if (this.scrollObservable_.getHandlerCount() <= 0) {
      this.removeViewportOnChangedListener_();
    }
  }

  /**
   * @param {function(!Object)} handler
   * @return {!UnlistenDef}
   */
  addScrollHandler(handler) {
    // Trigger an event to fire events that might have already happened.
    const size = this.viewport_.getSize();

    this.getInitRootElementRect_().then((initRootElementRect) => {
      // In the case of shadow/embedded documents, the root element's
      // layoutRect is relative to the parent doc's origin
      const {
        height: scrollHeight,
        left: scrollLeft,
        top: scrollTop,
        width: scrollWidth,
      } = initRootElementRect;

      /** {./scroll-manager.ScrollEventDef} */
      const scrollEvent = {
        // In the case of shadow documents (e.g. amp-next-page), we offset
        // the event's top and left coordinates by the top/left position of
        // the document's container element (so that scroll triggers become relative to
        // container instead of the top-level host page). In the case of a top-level
        // page, the container/root is the document body so scrollTop and scrollLeft
        // are both 0 and the measurements are not affected
        top: this.viewport_.getScrollTop() - scrollTop,
        left: this.viewport_.getScrollLeft() - scrollLeft,
        width: size.width,
        height: size.height,
        scrollHeight,
        scrollWidth,
        initialSize: {scrollHeight, scrollWidth},
      };
      handler(scrollEvent);
    });

    if (this.scrollObservable_.getHandlerCount() === 0) {
      this.addViewportOnChangedListener_();
    }

    return this.scrollObservable_.add(handler);
  }

  /**
   * @param {!../../../src/service/viewport/viewport-interface.ViewportChangedEventDef} e
   * @return {!Promise}
   * @private
   */
  onScroll_(e) {
    return Promise.all([
      // Initial root layout rectangle
      this.getInitRootElementRect_(),
      // Current root layout rectangle
      this.measureRootElement_(),
    ]).then((rects) => {
      // Initial root layout rectangle
      const {height: initialScrollHeight, width: initialScrollWidth} = rects[0];
      // Current root layout rectangle
      const {
        height: scrollHeight,
        left: scrollLeft,
        top: scrollTop,
        width: scrollWidth,
      } = rects[1];
      /** {./scroll-manager.ScrollEventDef} */
      const scrollEvent = {
        // In the case of shadow documents (e.g. amp-next-page), we offset
        // the event's top and left coordinates by the top/left position of
        // the document's container element (so that scroll triggers become relative to
        // container instead of the top-level host page). In the case of a top-level
        // page, the container/root is the document body so scrollTop and scrollLeft
        // are both 0 and the measurements are not affected
        top: e.top - scrollTop,
        left: e.left - scrollLeft,
        width: e.width,
        height: e.height,
        scrollWidth,
        scrollHeight,
        initialSize: {
          scrollHeight: initialScrollHeight,
          scrollWidth: initialScrollWidth,
        },
      };
      // Fire all of our children scroll observables
      this.scrollObservable_.fire(scrollEvent);
    });
  }

  /**
   * Function to remove the viewport onChanged listener
   * @private
   */
  removeViewportOnChangedListener_() {
    if (this.viewportOnChangedUnlistener_) {
      this.viewportOnChangedUnlistener_();
      this.viewportOnChangedUnlistener_ = null;
    }
  }

  /**
   * Function to add the viewport onChanged listener
   * @private
   */
  addViewportOnChangedListener_() {
    this.viewportOnChangedUnlistener_ = this.viewport_.onChanged(
      this.onScroll_.bind(this)
    );
  }

  /**
   * Gets the cached layout rectangle of the root element
   * @return {!Promise<!../../../src/layout-rect.LayoutRectDef>}
   */
  getInitRootElementRect_() {
    return devAssert(
      this.initialRootRectPromise_ || this.measureRootElement_()
    );
  }

  /**
   * Gets the layout rectangle of the root element
   * @return {!Promise<!../../../src/layout-rect.LayoutRectDef>}
   */
  measureRootElement_() {
    const rectPromise = this.mutator_.measureElement(() =>
      this.viewport_.getLayoutRect(this.root_)
    );
    this.initialRootRectPromise_ = this.initialRootRectPromise_ || rectPromise;
    return rectPromise;
  }
}
