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
import {dev} from '../log';
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
  }

  /** @override */
  dispose() {
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
    this.ampdoc_
      .whenReady()
      .then(resource.build.bind(resource))
      .then(this.schedulePass.bind(this));
    dev().fine(TAG, 'resource upgraded:', resource.debugid);
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
      if (!resource.isLayoutPending()) {
        return;
      }
      resource.measure();
    });
    // mutation in a batch
    this.resources_.forEach((resource) => {
      if (
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
}

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installInaboxResourcesServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'resources', InaboxResources);
}
