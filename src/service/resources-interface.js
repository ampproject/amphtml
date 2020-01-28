/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {MutatorInterface} from './mutator-interface';

/** @const {string} */
export const READY_SCAN_SIGNAL = 'ready-scan';

/* eslint-disable no-unused-vars */
/**
 * @interface
 */
export class ResourcesInterface extends MutatorInterface {
  /**
   * Returns a list of resources.
   * @return {!Array<!./resource.Resource>}
   * @export
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
   * @package
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
   * Updates the priority of the resource. If there are tasks currently
   * scheduled, their priority is updated as well.
   * @param {!Element} element
   * @param {number} newLayoutPriority
   */
  updateLayoutPriority(element, newLayoutPriority) {}
}
/* eslint-enable no-unused-vars */
