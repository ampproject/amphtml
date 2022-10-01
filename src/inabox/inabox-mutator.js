import {Services} from '#service';

import {registerServiceBuilderForDoc} from '../service-helpers';

/**
 * @implements {../service/mutator-interface.MutatorInterface}
 */
export class InaboxMutator {
  /**
   * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!../service/resources-interface.ResourcesInterface} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    /** @private @const {!../service/vsync-impl.Vsync} */
    this.vsync_ = Services./*OK*/ vsyncFor(ampdoc.win);
  }

  /** @override */
  forceChangeSize(element, newHeight, newWidth, opt_callback, opt_newMargins) {
    this.requestChangeSize(element, newHeight, newWidth, opt_newMargins).then(
      () => {
        if (opt_callback) {
          opt_callback();
        }
      }
    );
  }

  /** @override */
  requestChangeSize(element, newHeight, newWidth, opt_newMargins) {
    return this.mutateElement(element, () => {
      this.resources_
        .getResourceForElement(element)
        .changeSize(newHeight, newWidth, opt_newMargins);
    });
  }

  /** @override */
  expandElement(element) {
    const resource = this.resources_.getResourceForElement(element);
    resource.completeExpand();
    this.resources_./*OK*/ schedulePass();
  }

  /** @override */
  attemptCollapse(element) {
    return this.mutateElement(element, () => {
      this.resources_.getResourceForElement(element).completeCollapse();
    });
  }

  /** @override */
  collapseElement(element) {
    this.resources_.getResourceForElement(element).completeCollapse();
    this.resources_./*OK*/ schedulePass();
  }

  /** @override */
  measureElement(measurer) {
    return this.vsync_.measurePromise(measurer);
  }

  /** @override */
  mutateElement(element, mutator) {
    return this.measureMutateElement(element, null, mutator);
  }

  /** @override */
  measureMutateElement(element, measurer, mutator) {
    return this.vsync_.runPromise({
      measure: () => {
        if (measurer) {
          measurer();
        }
      },
      mutate: () => {
        mutator();
        this.resources_./*OK*/ schedulePass();
      },
    });
  }
}

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installInaboxMutatorServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'mutator', InaboxMutator);
}
