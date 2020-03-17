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

import {Services} from '../services';
import {registerServiceBuilderForDoc} from '../service';

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
    const owner = resource.getOwner();
    if (owner) {
      owner.expandedCallback(element);
    }
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
