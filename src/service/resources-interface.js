/** @const {string} */
export const READY_SCAN_SIGNAL = 'ready-scan';

/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   newMargins: !../layout-rect.LayoutMarginsChangeDef,
 *   currentMargins: !../layout-rect.LayoutMarginsDef
 * }}
 */
export let MarginChangeDef;

/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   resource: !./resource.Resource,
 *   newHeight: (number|undefined),
 *   newWidth: (number|undefined),
 *   marginChange: (!MarginChangeDef|undefined),
 *   event: (?Event|undefined),
 *   force: boolean,
 *   callback: (function(boolean)|undefined),
 * }}
 */
export let ChangeSizeRequestDef;

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @interface
 */
export class ResourcesInterface {
  /**
   * Returns a list of resources.
   * @return {!Array<!./resource.Resource>}
   */
  get() {}

  /**
   * @return {!./ampdoc-impl.AmpDoc}
   */
  getAmpdoc() {}

  /**
   * Returns the {@link Resource} instance corresponding to the specified AMP
   * Element. If no Resource is found, the exception is thrown.
   * @param {!AmpElement} element
   * @return {!./resource.Resource}
   */
  getResourceForElement(element) {}

  /**
   * Returns the {@link Resource} instance corresponding to the specified AMP
   * Element. Returns null if no resource is found.
   * @param {!AmpElement} element
   * @return {?./resource.Resource}
   */
  getResourceForElementOptional(element) {}

  /**
   * Returns the direction the user last scrolled.
   *  - -1 for scrolling up
   *  - 1 for scrolling down
   *  - Defaults to 1
   * TODO(lannka): this method should not belong to resources.
   * @return {number}
   */
  getScrollDirection() {}

  /**
   * Signals that an element has been added to the DOM. Resources manager
   * will start tracking it from this point on.
   * @param {!AmpElement} element
   */
  add(element) {}

  /**
   * Signals that an element has been upgraded to the DOM. Resources manager
   * will perform build and enable layout/viewport signals for this element.
   * @param {!AmpElement} element
   */
  upgraded(element) {}

  /**
   * Signals that an element has been removed to the DOM. Resources manager
   * will stop tracking it from this point on.
   * @param {!AmpElement} element
   */
  remove(element) {}

  /**
   * Schedules layout or preload for the specified resource.
   * @param {!./resource.Resource} resource
   * @param {boolean} layout
   * @param {number=} opt_parentPriority
   * @param {boolean=} opt_forceOutsideViewport
   */
  scheduleLayoutOrPreload(
    resource,
    layout,
    opt_parentPriority,
    opt_forceOutsideViewport
  ) {}

  /**
   * Schedules the work pass at the latest with the specified delay.
   * @param {number=} opt_delay
   * @param {boolean=} opt_relayoutAll
   * @return {boolean}
   */
  schedulePass(opt_delay, opt_relayoutAll) {}

  /**
   * Enqueue, or update if already exists, a mutation task for a resource.
   * @param {./resource.Resource} resource
   * @param {ChangeSizeRequestDef} newRequest
   * @package
   */
  updateOrEnqueueMutateTask(resource, newRequest) {}

  /**
   * Schedules the work pass at the latest with the specified delay.
   * @package
   */
  schedulePassVsync() {}

  /**
   * Registers a callback to be called when the next pass happens.
   * @param {function()} callback
   */
  onNextPass(callback) {}

  /**
   * @return {!Promise} when first pass executed.
   */
  whenFirstPass() {}

  /**
   * Called when main AMP binary is fully initialized.
   * May never be called in Shadow Mode.
   */
  ampInitComplete() {}

  /**
   * @param {number} relayoutTop
   * @package
   */
  setRelayoutTop(relayoutTop) {}

  /**
   * Flag that the height could have been changed.
   * @package
   */
  maybeHeightChanged() {}

  /**
   * Updates the priority of the resource. If there are tasks currently
   * scheduled, their priority is updated as well.
   * @param {!Element} element
   * @param {number} newLayoutPriority
   */
  updateLayoutPriority(element, newLayoutPriority) {}
}
