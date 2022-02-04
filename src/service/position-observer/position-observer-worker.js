import {
  layoutRectEquals,
  layoutRectLtwh,
  layoutRectsRelativePos,
  rectsOverlap,
} from '#core/dom/layout/rect';

import {Services} from '#service';

import {devAssert} from '#utils/log';

/** @enum {number} */
export const PositionObserverFidelity_Enum = {
  HIGH: 1,
  LOW: 0,
};

/** @const @private */
const LOW_FIDELITY_FRAME_COUNT = 4;

/**
 * TODO (@zhouyx): rename relativePos to relativePositions
 * The positionObserver returned position value which includes the position rect
 * relative to viewport. And viewport rect which always has top 0, left 0, and
 * viewport width and height.
 * @typedef {{
 *  positionRect: ?../../layout-rect.LayoutRectDef,
 *  viewportRect: !../../layout-rect.LayoutRectDef,
 *  relativePos: ?../../layout-rect.RelativePositions_Enum,
 * }}
 */
export let PositionInViewportEntryDef;

export class PositionObserverWorker {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} element
   * @param {!PositionObserverFidelity_Enum} fidelity
   * @param {function(?PositionInViewportEntryDef)} handler
   */
  constructor(ampdoc, element, fidelity, handler) {
    /** @const {!Element} */
    this.element = element;

    /** @const {function(?PositionInViewportEntryDef)} */
    this.handler_ = handler;

    /** @type {!PositionObserverFidelity_Enum} */
    this.fidelity = fidelity;

    /** @type {number} */
    this.turn =
      fidelity == PositionObserverFidelity_Enum.LOW
        ? Math.floor(Math.random() * LOW_FIDELITY_FRAME_COUNT)
        : 0;

    /** @type {?PositionInViewportEntryDef} */
    this.prevPosition_ = null;

    /** @private {!../viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(ampdoc);
  }

  /**
   * Call to trigger an entry handler
   * @param {!PositionInViewportEntryDef} position
   * @private
   */
  trigger_(position) {
    const prevPos = this.prevPosition_;
    if (
      prevPos &&
      layoutRectEquals(prevPos.positionRect, position.positionRect) &&
      layoutRectEquals(prevPos.viewportRect, position.viewportRect)
    ) {
      // position didn't change, do nothing.
      return;
    }

    devAssert(
      position.positionRect,
      'PositionObserver should always trigger entry with clientRect'
    );
    const positionRect = /** @type {!../../layout-rect.LayoutRectDef} */ (
      position.positionRect
    );
    // Add the relative position of the element to its viewport
    position.relativePos = layoutRectsRelativePos(
      positionRect,
      position.viewportRect
    );

    if (rectsOverlap(positionRect, position.viewportRect)) {
      // Update position
      this.prevPosition_ = position;
      // Only call handler if entry element overlap with viewport.
      this.handler_(position);
    } else if (this.prevPosition_) {
      // Need to notify that element gets outside viewport
      // NOTE: This is required for inabox position observer.
      this.prevPosition_ = null;
      position.positionRect = null;
      this.handler_(position);
    }
  }

  /**
   * To update the position of entry element when it is ready.
   * Called when updateAllEntries, or when first observe an element.
   * @param {boolean=} opt_force
   */
  update(opt_force) {
    if (!opt_force) {
      if (this.turn != 0) {
        this.turn--;
        return;
      }

      if (this.fidelity == PositionObserverFidelity_Enum.LOW) {
        this.turn = LOW_FIDELITY_FRAME_COUNT;
      }
    }

    const viewportSize = this.viewport_.getSize();
    const viewportBox = layoutRectLtwh(
      0,
      0,
      viewportSize.width,
      viewportSize.height
    );
    this.viewport_.getClientRectAsync(this.element).then((elementBox) => {
      this.trigger_(
        /** @type {./position-observer-worker.PositionInViewportEntryDef}*/ ({
          positionRect: elementBox,
          viewportRect: viewportBox,
          relativePos: null,
        })
      );
    });
  }
}
