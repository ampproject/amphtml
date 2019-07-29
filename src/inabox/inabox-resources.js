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

import {Resource} from '../service/resource';
import {dev} from '../log';
import {registerServiceBuilderForDoc} from '../service';

const TAG_ = 'inabox-resources';

/**
 * @implements {../service/resources-impl.ResourcesDef}
 */
class InaboxResources {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {!Array<!Resource>} */
    this.resources_ = [];

    /** @private {number} */
    this.resourceIdCounter_ = 0;

    /** @private {boolean} */
    this.ampInitialized_ = false;
  }

  /** @override */
  get() {
    return this.resources_.slice(0);
  }

  /** @override */
  getAmpdoc() {
    return this.ampdoc_;
  }

  /** @override */
  getMeasuredResources(hostWin, filterFn) {
    return Promise.resolve(this.get());
  }

  /** @override */
  getResourcesInRect(hostWin, rect, opt_isInPrerender) {
    return Promise.resolve(this.get());
  }

  /** @override */
  getResourceForElement(element) {
    return Resource.forElement(element);
  }

  /** @override */
  getResourceForElementOptional(element) {
    return Resource.forElementOptional(element);
  }

  /** @override */
  getScrollDirection() {
    return 1;
  }

  /**
   * Signals that an element has been added to the DOM. Resources manager
   * will start tracking it from this point on.
   * @param {!AmpElement} element
   */
  add(element) {
    const resource = new Resource(++this.resourceIdCounter_, element, this);
    this.resources_.push(resource);
    dev().fine(TAG_, 'resource added:', resource.debugid);
  }

  /**
   * Signals that an element has been upgraded to the DOM. Resources manager
   * will perform build and enable layout/viewport signals for this element.
   * @param {!AmpElement} element
   */
  upgraded(element) {
    const resource = this.getResourceForElement(element);
    this.buildResource_(resource);
  }

  /** @override */
  remove(element) {
    const resource = Resource.forElementOptional(element);
    if (!resource) {
      return;
    }
    const index = this.resources_.indexOf(resource);
    if (index != -1) {
      this.resources_.splice(index, 1);
    }
    dev().fine(TAG_, 'element removed:', resource.debugid);
  }

  /** @override */
  removeForChildWindow(childWin) {}

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
   * Called when main AMP binary is fully initialized.
   * May never be called in Shadow Mode.
   */
  ampInitComplete() {
    domContentLoaded(this.ampdoc_.win).then(() => {
      dev().fine(TAG_, 'start pass');
      this.ampInitialized_ = true;
      this.get().forEach(resource => {
        this.buildResource_(resource);
      });
    });
  }

  /**
   * Requires the layout of the specified element or top-level sub-elements
   * within.
   * @param {!Element} element
   * @param {number=} opt_parentPriority
   * @return {!Promise}
   * @restricted
   */
  requireLayout(element, opt_parentPriority) {}

  /**
   * Updates the priority of the resource. If there are tasks currently
   * scheduled, their priority is updated as well.
   * @param {!Element} element
   * @param {number} newLayoutPriority
   * @restricted
   */
  updateLayoutPriority(element, newLayoutPriority) {}

  /**
   * Requests the runtime to change the element's size. When the size is
   * successfully updated then the opt_callback is called.
   * @param {!Element} element
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {function()=} opt_callback A callback function.
   * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
   */
  changeSize(element, newHeight, newWidth, opt_callback, opt_newMargins) {}

  /**
   * Return a promise that requests the runtime to update the size of
   * this element to the specified value.
   * The runtime will schedule this request and attempt to process it
   * as soon as possible. However, unlike in {@link changeSize}, the runtime
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
   */
  attemptChangeSize(element, newHeight, newWidth, opt_newMargins) {}

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
   * @param {!Element} element
   * @param {function()} mutator
   * @return {!Promise}
   */
  mutateElement(element, mutator) {}

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

  /**
   * Assigns an owner for the specified element. This means that the resources
   * within this element will be managed by the owner and not Resources manager.
   * @param {!Element} element
   * @param {!AmpElement} owner
   * @package
   */
  setOwner(element, owner) {}

  /**
   * Schedules layout for the specified sub-elements that are children of the
   * parent element. The parent element may choose to send this signal either
   * because it's an owner (see {@link setOwner}) or because it wants the
   * layouts to be done sooner. In either case, both parent's and children's
   * priority is observed when scheduling this work.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  scheduleLayout(parentElement, subElements) {}

  /**
   * Invokes `unload` on the elements' resource which in turn will invoke
   * the `documentBecameInactive` callback on the custom element.
   * Resources that call `schedulePause` must also call `scheduleResume`.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  schedulePause(parentElement, subElements) {}

  /**
   * Invokes `resume` on the elements' resource which in turn will invoke
   * `resumeCallback` only on paused custom elements.
   * Resources that call `schedulePause` must also call `scheduleResume`.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  scheduleResume(parentElement, subElements) {}

  /**
   * Schedules unlayout for specified sub-elements that are children of the
   * parent element. The parent element can choose to send this signal when
   * it want to unload resources for its children.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  scheduleUnlayout(parentElement, subElements) {}

  /**
   * Schedules preload for the specified sub-elements that are children of the
   * parent element. The parent element may choose to send this signal either
   * because it's an owner (see {@link setOwner}) or because it wants the
   * preloads to be done sooner. In either case, both parent's and children's
   * priority is observed when scheduling this work.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  schedulePreload(parentElement, subElements) {}

  /**
   * A parent resource, especially in when it's an owner (see {@link setOwner}),
   * may request the Resources manager to update children's inViewport state.
   * A child's inViewport state is a logical AND between inLocalViewport
   * specified here and parent's own inViewport state.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   * @param {boolean} inLocalViewport
   */
  updateInViewport(parentElement, subElements, inLocalViewport) {}

  buildResource_(resource) {
    if (resource.isBuilt()) {
      return;
    }
    const buildPromise = resource.build();
    if (buildPromise) {
      buildPromise
        .then(() => {
          resource.startLayout();
        })
        .catch(error => {
          this.remove(resource);
          dev().error(TAG_, error);
        });
    } else {
      dev().fine(TAG_, 'resource not ready for build: ' + resource.debugid);
    }
  }
}

/**
 * @param {!Window} win
 * @return {Promise}
 */
function domContentLoaded(win) {
  return new Promise(resolve => {
    win.addEventListener('DOMContentLoaded', resolve);
  });
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installInaboxResourcesServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'resources', InaboxResources);
}
