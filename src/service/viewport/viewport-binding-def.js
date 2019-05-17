/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * ViewportBindingDef is an interface that defines an underlying technology
 * behind the {@link Viewport}.
 * @interface
 */
export class ViewportBindingDef {
  /**
   * Called before a first AMP element is added to resources. The final
   * preparations must be completed here. Called in the mutate context.
   */
  ensureReadyForElements() {}

  /**
   * Add listeners for global resources.
   */
  connect() {}

  /**
   * Remove listeners for global resources.
   */
  disconnect() {}

  /**
   * Returns the width of top border if this type of viewport needs border
   * offsetting. This is currently only needed for iOS to avoid scroll freeze.
   * @return {number}
   */
  getBorderTop() {}

  /**
   * Whether the binding requires fixed elements to be transfered to a
   * independent fixed layer.
   * @return {boolean}
   */
  requiresFixedLayerTransfer() {}

  /**
   * Whether the binding requires the global window's `scrollTo` to be
   * indirected via methods of this binding.
   * @return {boolean}
   */
  overrideGlobalScrollTo() {}

  /**
   * Whether the binding supports fix-positioned elements.
   * @return {boolean}
   */
  supportsPositionFixed() {}

  /**
   * Register a callback for scroll events.
   * @param {function()} unusedCallback
   */
  onScroll(unusedCallback) {}

  /**
   * Register a callback for resize events.
   * @param {function()} unusedCallback
   */
  onResize(unusedCallback) {}

  /**
   * Updates binding with the new padding.
   * @param {number} unusedPaddingTop
   */
  updatePaddingTop(unusedPaddingTop) {}

  /**
   * Updates binding with the new padding when hiding viewer header.
   * @param {boolean} unusedTransient
   * @param {number} unusedLastPaddingTop
   */
  hideViewerHeader(unusedTransient, unusedLastPaddingTop) {}

  /**
   * Updates binding with the new padding when showing viewer header.
   * @param {boolean} unusedTransient
   * @param {number} unusedPaddingTop
   */
  showViewerHeader(unusedTransient, unusedPaddingTop) {}

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
   * Updates the viewport whether it's currently in the lightbox or a normal
   * mode.
   * @param {boolean} unusedLightboxMode
   * @return {!Promise}
   */
  updateLightboxMode(unusedLightboxMode) {}

  /**
   * Returns the size of the viewport.
   * @return {!{width: number, height: number}}
   */
  getSize() {}

  /**
   * Returns the top scroll position for the viewport.
   * @return {number}
   */
  getScrollTop() {}

  /**
   * Sets scroll top position to the specified value or the nearest possible.
   * @param {number} unusedScrollTop
   */
  setScrollTop(unusedScrollTop) {}

  /**
   * Returns the left scroll position for the viewport.
   * @return {number}
   */
  getScrollLeft() {}

  /**
   * Returns the scroll width of the content of the document.
   * @return {number}
   */
  getScrollWidth() {}

  /**
   * Returns the scroll height of the content of the document, including the
   * padding top for the viewer header.
   * The scrollHeight will be the viewport height if there's not enough content
   * to fill up the viewport.
   * @return {number}
   */
  getScrollHeight() {}

  /**
   * Returns the height of the content of the document, including the
   * padding top for the viewer header.
   * contentHeight will match scrollHeight in all cases unless the viewport is
   * taller than the content.
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
   * Returns the rect of the element within the document.
   * @param {!Element} unusedEl
   * @param {number=} unusedScrollLeft Optional arguments that the caller may
   *     pass in, if they cached these values and would like to avoid
   *     remeasure. Requires appropriate updating the values on scroll.
   * @param {number=} unusedScrollTop Same comment as above.
   * @return {!../../layout-rect.LayoutRectDef}
   */
  getLayoutRect(unusedEl, unusedScrollLeft, unusedScrollTop) {}

  /**
   * Returns the client rect of the current window.
   * @return {Promise<null>|Promise<!../../layout-rect.LayoutRectDef>}
   */
  getRootClientRectAsync() {}

  /**
   * Returns the element considered the root scroller for this binding.
   * @return {!Element}
   */
  getScrollingElement() {}

  /**
   * Whether the root scroller is a native root scroller (behaves like a
   * viewport), or an overflow scroller (scrolls like an element).
   * @return {boolean}
   */
  getScrollingElementScrollsLikeViewport() {}
}
