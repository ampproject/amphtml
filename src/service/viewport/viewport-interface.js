import {Disposable} from '../../service-helpers';

/**
 * @typedef {{
 *   relayoutAll: boolean,
 *   top: number,
 *   left: number,
 *   width: number,
 *   height: number,
 *   velocity: number
 * }}
 */
export let ViewportChangedEventDef;

/**
 * @typedef {{
 *   relayoutAll: boolean,
 *   width: number,
 *   height: number
 * }}
 */
export let ViewportResizedEventDef;

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @interface
 */
export class ViewportInterface extends Disposable {
  /**
   * Called before a first AMP element is added to resources. Called in the
   * mutate context.
   */
  ensureReadyForElements() {}

  /**
   * Returns the top padding mandated by the viewer.
   * @return {number}
   */
  getPaddingTop() {}

  /**
   * Returns the viewport's vertical scroll position.
   * @return {number}
   */
  getScrollTop() {}

  /**
   * Returns the viewport's horizontal scroll position.
   * @return {number}
   */
  getScrollLeft() {}

  /**
   * Sets the desired scroll position on the viewport.
   * @param {number} scrollPos
   */
  setScrollTop(scrollPos) {}

  /**
   * Sets the body padding bottom to the specified value.
   * @param {number} paddingBottom
   */
  updatePaddingBottom(paddingBottom) {}

  /**
   * Returns the size of the viewport.
   * @return {!{width: number, height: number}}
   */
  getSize() {}

  /**
   * Returns the height of the viewport.
   * @return {number}
   */
  getHeight() {}

  /**
   * Returns the width of the viewport.
   * @return {number}
   */
  getWidth() {}

  /**
   * Returns the scroll width of the content of the document. Note that this
   * method is not cached since we there's no indication when it might change.
   * @return {number}
   */
  getScrollWidth() {}

  /**
   * Returns the scroll height of the content of the document, including the
   * padding top for the viewer header.
   * The scrollHeight will be the viewport height if there's not enough content
   * to fill up the viewport.
   * Note that this method is not cached since we there's no indication when
   * it might change.
   * @return {number}
   */
  getScrollHeight() {}

  /**
   * Returns the height of the content of the document, including the
   * padding top for the viewer header.
   * contentHeight will match scrollHeight in all cases unless the viewport is
   * taller than the content.
   * Note that this method is not cached since we there's no indication when
   * it might change.
   * @return {number}
   */
  getContentHeight() {}

  /**
   * Resource manager signals to the viewport that content height is changed
   * and some action may need to be taken.
   * @restricted Use is restricted due to potentially very heavy performance
   *   impact. Can only be called when not actively scrolling.
   */
  contentHeightChanged() {}

  /**
   * Returns the rect of the viewport which includes scroll positions and size.
   * @return {!../../layout-rect.LayoutRectDef}}
   */
  getRect() {}

  /**
   * Returns the rect of the element within the document.
   * Note that this function should be called in vsync measure. Please consider
   * using `getClientRectAsync` instead.
   * @param {!Element} el
   * @return {!../../layout-rect.LayoutRectDef}
   */
  getLayoutRect(el) {}

  /**
   * Returns the clientRect of the element.
   * Note: This method does not taking intersection into account.
   * @param {!Element} el
   * @return {!Promise<!../../layout-rect.LayoutRectDef>}
   */
  getClientRectAsync(el) {}

  /**
   * Whether the binding supports fix-positioned elements.
   * @return {boolean}
   */
  supportsPositionFixed() {}

  /**
   * Whether the element is declared as fixed in any of the user's stylesheets.
   * Will include any matches, not necessarily currently fixed elements.
   * @param {!Element} element
   * @return {boolean}
   */
  isDeclaredFixed(element) {}

  /**
   * Scrolls element into view much like Element. scrollIntoView does but
   * in the AMP/Viewer environment.
   * @param {!Element} element
   * @return {!Promise}
   */
  scrollIntoView(element) {}

  /**
   * Scrolls element into view much like Element. scrollIntoView does but
   * in the AMP/Viewer environment. Adds animation for the sccrollIntoView
   * transition.
   *
   * @param {!Element} element
   * @param {string=} pos (takes one of 'top', 'bottom', 'center')
   * @param {number=} opt_duration
   * @param {string=} opt_curve
   * @return {!Promise}
   */
  animateScrollIntoView(element, pos = 'top', opt_duration, opt_curve) {}

  /**
   * @param {!Element} element
   * @param {!Element} parent Should be scrollable.
   * @param {string} pos (takes one of 'top', 'bottom', 'center')
   * @param {number=} opt_duration
   * @param {string=} opt_curve
   * @return {!Promise}
   */
  animateScrollWithinParent(element, parent, pos, opt_duration, opt_curve) {}

  /**
   * @return {!Element}
   */
  getScrollingElement() {}

  /**
   * Registers the handler for ViewportChangedEventDef events.
   * @param {function(!ViewportChangedEventDef)} handler
   * @return {!UnlistenDef}
   */
  onChanged(handler) {}

  /**
   * Registers the handler for scroll events. These events DO NOT contain
   * scrolling offset and it's discouraged to read scrolling offset in the
   * event handler. The primary use case for this handler is to inform that
   * scrolling might be going on. To get more information {@link onChanged}
   * handler should be used.
   * @param {function()} handler
   * @return {!UnlistenDef}
   */
  onScroll(handler) {}

  /**
   * Registers the handler for ViewportResizedEventDef events.
   *
   * Note that there is a known bug in Webkit that causes window.innerWidth
   * and window.innerHeight values to be incorrect after resize. A temporary
   * fix is to add a 500 ms delay before computing these values.
   * Link: https://bugs.webkit.org/show_bug.cgi?id=170595
   *
   * @param {function(!ViewportResizedEventDef)} handler
   * @return {!UnlistenDef}
   */
  onResize(handler) {}

  /**
   * Instruct the viewport to enter lightbox mode.
   * @param {!Element=} opt_requestingElement Must be provided to be able to
   *     enter lightbox mode under FIE cases.
   * @param {!Promise=} opt_onComplete Optional promise that's resolved when
   *     the caller finishes opening the lightbox e.g. transition animations.
   * @return {!Promise}
   */
  enterLightboxMode(opt_requestingElement, opt_onComplete) {}

  /**
   * Instruct the viewport to leave lightbox mode.
   * @param {!Element=} opt_requestingElement Must be provided to be able to
   *     enter lightbox mode under FIE cases.
   * @return {!Promise}
   */
  leaveLightboxMode(opt_requestingElement) {}

  /**
   * Instruct the viewport to enter overlay mode.
   */
  enterOverlayMode() {}

  /**
   * Instruct the viewport to leave overlay mode.
   */
  leaveOverlayMode() {}

  /**
   * Disable the scrolling by setting overflow: hidden.
   * Should only be used for temporarily disabling scroll.
   */
  disableScroll() {}

  /**
   * Reset the scrolling by removing overflow: hidden.
   */
  resetScroll() {}

  /**
   * Resets touch zoom to initial scale of 1.
   */
  resetTouchZoom() {}

  /**
   * Disables touch zoom on this viewport. Returns `true` if any actual
   * changes have been done.
   * @return {boolean}
   */
  disableTouchZoom() {}

  /**
   * Restores original touch zoom parameters. Returns `true` if any actual
   * changes have been done.
   * @return {boolean}
   */
  restoreOriginalTouchZoom() {}

  /**
   * Updates the fixed layer.
   * @return {!Promise}
   */
  updateFixedLayer() {}

  /**
   * Adds the element to the fixed layer.
   * @param {!Element} element
   * @param {boolean=} opt_forceTransfer If set to true , then the element needs
   *    to be forcefully transferred to the fixed layer.
   * @return {!Promise}
   */
  addToFixedLayer(element, opt_forceTransfer) {}

  /**
   * Removes the element from the fixed layer.
   * @param {!Element} element
   */
  removeFromFixedLayer(element) {}

  /**
   * Create fixed layer from constructor (invoked by viewer integration)
   * @param {typeof ../fixed-layer.FixedLayer} constructor
   */
  createFixedLayer(constructor) {}
}
