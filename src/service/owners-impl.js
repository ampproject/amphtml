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

/* eslint-disable no-unused-vars */

// TODO(powerivq)
// Resource.setOwner, Resource.getOwner should be moved here.
// ResourceState.NOT_BUILT might not be needed here.
import {Resource, ResourceState} from './resource';
import {Services} from '../services';
import {devAssert} from '../log';
import {isArray} from '../types';
import {registerServiceBuilderForDoc} from '../service';

/**
 * @param {!Element|!Array<!Element>} elements
 * @return {!Array<!Element>}
 */
function elements(elements) {
  return /** @type {!Array<!Element>} */ (isArray(elements)
    ? elements
    : [elements]);
}

/**
 * @interface
 */
export class OwnersDef {
  /**
   * Assigns an owner for the specified element. This means that the resources
   * within this element will be managed by the owner and not Resources manager.
   * @param {!Element} element
   * @param {!AmpElement} owner
   * @package
   */
  setOwner(element, owner) {}

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
   * A parent resource, especially in when it's an owner (see {@link setOwner}),
   * may request the Resources manager to update children's inViewport state.
   * A child's inViewport state is a logical AND between inLocalViewport
   * specified here and parent's own inViewport state.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   * @param {boolean} inLocalViewport
   */
  updateInViewport(parentElement, subElements, inLocalViewport) {}
}

/**
 * @implements {OwnersDef}
 * @visibleForTesting
 */
export class Owners {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!./resources-impl.ResourcesDef} */
    this.resources_ = Services.resourcesForDoc(ampdoc);
  }

  /** @override */
  setOwner(element, owner) {
    Resource.setOwner(element, owner);
  }

  /** @override */
  schedulePreload(parentElement, subElements) {
    this.scheduleLayoutOrPreloadForSubresources_(
      this.resources_.getResourceForElement(parentElement),
      /* layout */ false,
      elements(subElements)
    );
  }

  /** @override */
  scheduleLayout(parentElement, subElements) {
    this.scheduleLayoutOrPreloadForSubresources_(
      this.resources_.getResourceForElement(parentElement),
      /* layout */ true,
      elements(subElements)
    );
  }

  /** @override */
  schedulePause(parentElement, subElements) {
    const parentResource = this.resources_.getResourceForElement(parentElement);
    subElements = elements(subElements);

    this.resources_.findResourcesInElements(
      parentResource,
      subElements,
      resource => {
        resource.pause();
      }
    );
  }

  /** @override */
  scheduleResume(parentElement, subElements) {
    const parentResource = this.resources_.getResourceForElement(parentElement);
    subElements = elements(subElements);

    this.resources_.findResourcesInElements(
      parentResource,
      subElements,
      resource => {
        resource.resume();
      }
    );
  }

  /** @override */
  scheduleUnlayout(parentElement, subElements) {
    const parentResource = this.resources_.getResourceForElement(parentElement);
    subElements = elements(subElements);

    this.resources_.findResourcesInElements(
      parentResource,
      subElements,
      resource => {
        resource.unlayout();
      }
    );
  }

  /** @override */
  updateInViewport(parentElement, subElements, inLocalViewport) {
    this.updateInViewportForSubresources_(
      this.resources_.getResourceForElement(parentElement),
      elements(subElements),
      inLocalViewport
    );
  }

  /**
   * Schedules layout or preload for the sub-resources of the specified
   * resource.
   * @param {!Resource} parentResource
   * @param {boolean} layout
   * @param {!Array<!Element>} subElements
   * @private
   */
  scheduleLayoutOrPreloadForSubresources_(parentResource, layout, subElements) {
    this.resources_.findResourcesInElements(
      parentResource,
      subElements,
      resource => {
        if (resource.getState() === ResourceState.NOT_BUILT) {
          resource.whenBuilt().then(() => {
            this.resources_.measureAndTryScheduleLayout(
              resource,
              !layout,
              parentResource.getLayoutPriority()
            );
          });
        } else {
          this.resources_.measureAndTryScheduleLayout(
            resource,
            !layout,
            parentResource.getLayoutPriority()
          );
        }
      }
    );
  }

  /**
   * Updates inViewport state for the specified sub-resources of a resource.
   * @param {!Resource} parentResource
   * @param {!Array<!Element>} subElements
   * @param {boolean} inLocalViewport
   * @private
   */
  updateInViewportForSubresources_(
    parentResource,
    subElements,
    inLocalViewport
  ) {
    const inViewport = parentResource.isInViewport() && inLocalViewport;
    this.resources_.findResourcesInElements(
      parentResource,
      subElements,
      resource => {
        resource.setInViewport(inViewport);
      }
    );
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installOwnersServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'owners', Owners);
}
