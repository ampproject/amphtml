import {isArray} from '#core/types';

import {Services} from '#service';

import {devAssert} from '#utils/log';

import {OwnersInterface} from './owners-interface';
import {Resource} from './resource';

import {registerServiceBuilderForDoc} from '../service-helpers';

/**
 * @param {!Element|!Array<!Element>} elements
 * @return {!Array<!Element>}
 */
function elements(elements) {
  return /** @type {!Array<!Element>} */ (
    isArray(elements) ? elements : [elements]
  );
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
  requireLayout(element, opt_parentPriority) {
    const promises = [];
    this.discoverResourcesForElement_(element, (resource) => {
      promises.push(resource.element.ensureLoaded());
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
    for (const element of elements) {
      devAssert(parentResource.element.contains(element));
      this.discoverResourcesForElement_(element, callback);
    }
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
      resource.element.ensureLoaded(parentResource.getLayoutPriority());
    });
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installOwnersServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'owners', OwnersImpl);
}
