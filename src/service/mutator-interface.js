/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @interface
 */
export class MutatorInterface {
  /**
   * Requests the runtime to change the element's size. When the size is
   * successfully updated then the opt_callback is called.
   * @param {!Element} element
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {function()=} opt_callback A callback function.
   * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
   */
  forceChangeSize(element, newHeight, newWidth, opt_callback, opt_newMargins) {}

  /**
   * Return a promise that requests the runtime to update the size of
   * this element to the specified value.
   * The runtime will schedule this request and attempt to process it
   * as soon as possible. However, unlike in {@link forceChangeSize}, the runtime
   * may refuse to make a change in which case it will reject promise, call the
   * `overflowCallback` method on the target resource with the height value.
   * Overflow callback is expected to provide the reader with the user action
   * to update the height manually.
   * Note that the runtime does not call the `overflowCallback` method if the
   * requested height is 0 or negative.
   * If the height is successfully updated then the promise is resolved.
   * @param {!Element} element
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
   * @return {!Promise}
   * @param {?Event=} opt_event
   */
  requestChangeSize(element, newHeight, newWidth, opt_newMargins, opt_event) {}

  /**
   * Expands the element.
   * @param {!Element} element
   */
  expandElement(element) {}

  /**
   * Return a promise that requests runtime to collapse this element.
   * The runtime will schedule this request and first attempt to resize
   * the element to height and width 0. If success runtime will set element
   * display to none, and notify element owner of this collapse.
   * @param {!Element} element
   * @return {!Promise}
   */
  attemptCollapse(element) {}

  /**
   * Collapses the element: ensures that it's `display:none`, notifies its
   * owner and updates the layout box.
   * @param {!Element} element
   */
  collapseElement(element) {}

  /**
   * Runs the specified measure, which is called in the "measure" vsync phase.
   * This is simply a proxy to the privileged vsync service.
   *
   * @param {function()} measurer
   * @return {!Promise}
   */
  measureElement(measurer) {}

  /**
   * Runs the specified mutation on the element and ensures that remeasures and
   * layouts performed for the affected elements.
   *
   * This method should be called whenever a significant mutations are done
   * on the DOM that could affect layout of elements inside this subtree or
   * its siblings. The top-most affected element should be specified as the
   * first argument to this method and all the mutation work should be done
   * in the mutator callback which is called in the "mutation" vsync phase.
   *
   * By default, all mutations force a remeasure. If you know that a mutation
   * cannot cause a change to the layout, you may use the skipRemeasure arg.
   *
   * @param {!Element} element
   * @param {function()} mutator
   * @param {boolean=} skipRemeasure
   * @return {!Promise}
   */
  mutateElement(element, mutator, skipRemeasure) {}

  /**
   * Runs the specified mutation on the element and ensures that remeasures and
   * layouts performed for the affected elements.
   *
   * This method should be called whenever a significant mutations are done
   * on the DOM that could affect layout of elements inside this subtree or
   * its siblings. The top-most affected element should be specified as the
   * first argument to this method and all the mutation work should be done
   * in the mutator callback which is called in the "mutation" vsync phase.
   *
   * @param {!Element} element
   * @param {?function()} measurer
   * @param {function()} mutator
   * @return {!Promise}
   */
  measureMutateElement(element, measurer, mutator) {}
}
