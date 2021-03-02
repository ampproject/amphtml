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

import {Deferred} from '../utils/promise';
import {Observable} from '../observable';
import {Pass} from '../pass';
import {READY_SCAN_SIGNAL} from '../service/resources-interface';
import {Resource, ResourceState} from '../service/resource';
import {Services} from '../services';
import {VisibilityState} from '../visibility-state';
import {dev} from '../log';
import {getMode} from '../mode';
import {hasNextNodeInDocumentOrder} from '../dom';
import {registerServiceBuilderForDoc} from '../service';

const TAG = 'inabox-resources';
const FOUR_FRAME_DELAY = 70;

/**
 * @implements {../service/resources-interface.ResourcesInterface}
 * @implements {../service.Disposable}
 * @visibleForTesting
 */
export class InaboxResources {
  /**
   * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!../service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {!Array<!Resource>} */
    this.resources_ = [];

    /** @private {number} */
    this.resourceIdCounter_ = 0;

    /** @const @private {!Pass} */
    this.pass_ = new Pass(this.win, this.doPass_.bind(this), FOUR_FRAME_DELAY);

    /** @private @const {!Observable} */
    this.passObservable_ = new Observable();

    /** @const @private {!Deferred} */
    this.firstPassDone_ = new Deferred();

    /** @private {?IntersectionObserver} */
    this.inViewportObserver_ = null;

    const input = Services.inputFor(this.win);
    input.setupInputModeClasses(ampdoc);

    // TODO(#31246): launch the visibility logic in inabox as well.
    if (getMode(this.win).runtime != 'inabox') {
      ampdoc.onVisibilityChanged(() => {
        switch (ampdoc.getVisibilityState()) {
          case VisibilityState.PAUSED:
            this.resources_.forEach((r) => r.pause());
            break;
          case VisibilityState.VISIBLE:
            this.resources_.forEach((r) => r.resume());
            this./*OK*/ schedulePass();
            break;
        }
      });
    }

    /** @private {!Array<Resource>} */
    this.pendingBuildResources_ = [];

    /** @private {boolean} */
    this.documentReady_ = false;

    this.ampdoc_.whenReady().then(() => {
      this.documentReady_ = true;
      this.buildReadyResources_();
      this./*OK*/ schedulePass(1);
    });
  }

  /** @override */
  dispose() {
    this.resources_.forEach((r) => r.unload());
    this.resources_.length = 0;
    if (this.inViewportObserver_) {
      this.inViewportObserver_.disconnect();
      this.inViewportObserver_ = null;
    }
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

  /** @override */
  add(element) {
    const resource = new Resource(++this.resourceIdCounter_, element, this);
    this.resources_.push(resource);
    dev().fine(TAG, 'resource added:', resource.debugid);
  }

  /** @override */
  upgraded(element) {
    const resource = Resource.forElement(element);
    this.pendingBuildResources_.push(resource);
    this.buildReadyResources_();
  }

  /** @override */
  remove(element) {
    const resource = Resource.forElementOptional(element);
    if (!resource) {
      return;
    }
    if (this.inViewportObserver_) {
      this.inViewportObserver_.unobserve(element);
    }
    const index = this.resources_.indexOf(resource);
    if (index !== -1) {
      this.resources_.splice(index, 1);
    }
    dev().fine(TAG, 'element removed:', resource.debugid);
  }

  /** @override */
  scheduleLayoutOrPreload(unusedResource) {
    this.pass_.schedule();
  }

  /** @override */
  schedulePass(opt_delay) {
    return this.pass_.schedule(opt_delay);
  }

  /** @override */
  updateOrEnqueueMutateTask(unusedResource, unusedNewRequest) {}

  /** @override */
  schedulePassVsync() {}

  /** @override */
  onNextPass(callback) {
    this.passObservable_.add(callback);
  }

  /** @override */
  ampInitComplete() {}

  /** @override */
  updateLayoutPriority(unusedElement, unusedNewLayoutPriority) {
    // concept of element priority does not exist in inabox
  }

  /** @override */
  setRelayoutTop(unusedRelayoutTop) {}

  /** @override */
  maybeHeightChanged() {}

  /**
   * @return {!Promise} when first pass executed.
   */
  whenFirstPass() {
    return this.firstPassDone_.promise;
  }

  /** @override */
  isIntersectionExperimentOn() {
    return false;
  }

  /**
   * @private
   */
  doPass_() {
    const now = Date.now();
    dev().fine(TAG, 'doPass');
    // measure in a batch
    this.resources_.forEach((resource) => {
      if (!resource.isLayoutPending() || resource.element.V1()) {
        return;
      }
      resource.measure();
    });
    // mutation in a batch
    this.resources_.forEach((resource) => {
      if (
        !resource.element.V1() &&
        resource.getState() === ResourceState.READY_FOR_LAYOUT &&
        resource.isDisplayed()
      ) {
        resource.layoutScheduled(now);
        resource.startLayout();
      }
    });

    this.ampdoc_.signals().signal(READY_SCAN_SIGNAL);
    this.passObservable_.fire();
    this.firstPassDone_.resolve();
  }

  /**
   * Builds any pending resouces if document is ready, or next element has been
   * added to DOM.
   * @private
   */
  buildReadyResources_() {
    for (let i = this.pendingBuildResources_.length - 1; i >= 0; i--) {
      const resource = this.pendingBuildResources_[i];
      if (
        this.documentReady_ ||
        hasNextNodeInDocumentOrder(resource.element, this.ampdoc_.getRootNode())
      ) {
        this.pendingBuildResources_.splice(i, 1);
        resource.build().then(() => this./*OK*/ schedulePass());
        dev().fine(TAG, 'resource upgraded:', resource.debugid);
      }
    }
  }
}

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installInaboxResourcesServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'resources', InaboxResources);
}
