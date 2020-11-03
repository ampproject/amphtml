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

// TODO(powerivq)
// Resource.setOwner, Resource.getOwner should be moved here.
// ResourceState.NOT_BUILT might not be needed here.
import {OwnersInterface} from './owners-interface';
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
 * @implements {OwnersInterface}
 * @visibleForTesting
 */
export class OwnersImpl {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!./resources-interface.ResourcesInterface} */
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

    this.findResourcesInElements_(parentResource, subElements, (resource) => {
      resource.pause();
    });
  }

  /** @override */
  scheduleResume(parentElement, subElements) {
    const parentResource = this.resources_.getResourceForElement(parentElement);
    subElements = elements(subElements);

    this.findResourcesInElements_(parentResource, subElements, (resource) => {
      resource.resume();
    });
  }

  /** @override */
  scheduleUnlayout(parentElement, subElements) {
    const parentResource = this.resources_.getResourceForElement(parentElement);
    subElements = elements(subElements);

    this.findResourcesInElements_(parentResource, subElements, (resource) => {
      resource.unlayout();
    });
  }

  /** @override */
  updateInViewport(parentElement, subElements, inLocalViewport) {
    this.updateInViewportForSubresources_(
      this.resources_.getResourceForElement(parentElement),
      elements(subElements),
      inLocalViewport
    );
  }

  /** @override */
  requireLayout(element, opt_parentPriority) {
    const promises = [];
    this.discoverResourcesForElement_(element, (resource) => {
      if (resource.getState() == ResourceState.LAYOUT_COMPLETE) {
        return;
      }
      if (resource.getState() != ResourceState.LAYOUT_SCHEDULED) {
        promises.push(
          resource.whenBuilt().then(() => {
            resource.measure();
            if (!resource.isDisplayed()) {
              return;
            }
            this.resources_.scheduleLayoutOrPreload(
              resource,
              /* layout */ true,
              opt_parentPriority
            );
            return resource.loadedOnce();
          })
        );
      } else if (resource.isDisplayed()) {
        promises.push(resource.loadedOnce());
      }
    });
    return Promise.all(promises);
  }

  /**
   * Finds resources within the parent resource's shallow subtree.
   * @param {!Resource} parentResource
   * @param {!Array<!Element>} elements
   * @param {function(!Resource)} callback
   * @private
   */
  findResourcesInElements_(parentResource, elements, callback) {
    elements.forEach((element) => {
      devAssert(parentResource.element.contains(element));
      this.discoverResourcesForElement_(element, callback);
    });
  }

  /**
   * @param {!Element} element
   * @param {function(!Resource)} callback
   */
  discoverResourcesForElement_(element, callback) {
    // Breadth-first search.
    if (element.classList.contains('i-amphtml-element')) {
      callback(this.resources_.getResourceForElement(element));
      // Also schedule amp-element that is a placeholder for the element.
      const placeholder = element.getPlaceholder();
      if (placeholder) {
        this.discoverResourcesForElement_(placeholder, callback);
      }
    } else {
      const ampElements = element.getElementsByClassName('i-amphtml-element');
      const seen = [];
      for (let i = 0; i < ampElements.length; i++) {
        const ampElement = ampElements[i];
        let covered = false;
        for (let j = 0; j < seen.length; j++) {
          if (seen[j].contains(ampElement)) {
            covered = true;
            break;
          }
        }
        if (!covered) {
          seen.push(ampElement);
          callback(this.resources_.getResourceForElement(ampElement));
        }
      }
    }
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
    this.findResourcesInElements_(parentResource, subElements, (resource) => {
      if (resource.getState() === ResourceState.NOT_BUILT) {
        resource.whenBuilt().then(() => {
          this.measureAndTryScheduleLayout_(
            resource,
            /* isPreload */ !layout,
            parentResource.getLayoutPriority()
          );
        });
      } else {
        this.measureAndTryScheduleLayout_(
          resource,
          /* isPreload */ !layout,
          parentResource.getLayoutPriority()
        );
      }
    });
  }

  /**
   * @param {!Resource} resource
   * @param {boolean} isPreload
   * @param {number=} opt_parentPriority
   * @private
   */
  measureAndTryScheduleLayout_(resource, isPreload, opt_parentPriority) {
    resource.measure();
    if (
      resource.getState() === ResourceState.READY_FOR_LAYOUT &&
      resource.isDisplayed()
    ) {
      this.resources_.scheduleLayoutOrPreload(
        resource,
        /* layout */ !isPreload,
        opt_parentPriority
      );
    }
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
    this.findResourcesInElements_(parentResource, subElements, (resource) => {
      resource.setInViewport(inViewport);
    });
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installOwnersServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'owners', OwnersImpl);
}
