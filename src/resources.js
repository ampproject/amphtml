/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Pass} from './pass';
import {assert} from './asserts';
import {log} from './log';
import {retriablePromise} from './retriable-promise';
import {timer} from './timer';
import {viewport} from './viewport';

let TAG_ = 'Resources';


export class Resources {
  constructor(window) {
    /** @const {!Window} */
    this.win = window;

    /** @private @const {!Array<!Resource>} */
    this.resources_ = [];

    /** @private @const {!Object<string, !Resource>} */
    this.resourceMap_ = Object.create(null);

    /** @private {boolean} */
    this.rebuild_ = false;

    /** @private {number} */
    this.lastVelocity_ = 0;

    /** @const {!Pass} */
    this.pass_ = new Pass(() => this.doPass_());

    /** @const {!Array<!Resource>} */
    this.loading_ = [];

    /** @private {number} */
    this.lastLoading_ = 0;

    viewport.onChanged((event) => {
      this.lastVelocity_ = event.velocity;
      this.schedulePass(event.rebuild);
    });
    this.schedulePass(/* rebuild */ true);
  }

  /**
   * @param {boolean} rebuild
   * @param {number=} opt_delay
   */
  schedulePass(rebuild, opt_delay) {
    this.rebuild_ = this.rebuild_ || rebuild;
    this.pass_.schedule(opt_delay);
  }

  /**
   * @private
   */
  doPass_() {
    log.fine(TAG_, 'PASS rebuild=' + this.rebuild_);

    let now = timer.now();

    // TODO(dvoytenko): vsync separation may be needed for different phases

    // Ensure all resources layout phase complete; when rebuild is requested
    // force re-layout.
    let rebuild = this.rebuild_;
    this.rebuild_ = false;

    // Phase 1: Relayout as needed.
    let relayoutCount = 0;
    for (let r of this.resources_) {
      if (!r.isLayoutReady() || rebuild) {
        r.applyMediaQuery();
        r.layout();
        relayoutCount++;
      }
    }

    // Phase 2: Remeasure if there were any relayouts.
    if (relayoutCount > 0) {
      // TODO(dvoytenko): optimize: most likely not everything has to be
      // re-measured.
      for (let r of this.resources_) {
        r.measure();
      }
      this.resources_.sort((r1, r2) => {
        let box1 = r1.getLayoutBox();
        let box2 = r2.getLayoutBox();
        if (box1.top != box2.top) {
          return box1.top - box2.top;
        }
        // Ensure that order is deterministic.
        return (r1.element.compareDocumentPosition(r2.element) & 10) ? -1 : 1;
      });
    }

    var viewportTop = viewport.getTop();
    var viewportSize = viewport.getSize();
    var viewportHeight = viewportSize.height;
    var viewportBottom = viewportTop + viewportHeight;

    // Phase 3: Trigger loading. Loading window is 1 window up/down + 1 window
    // in the direction of motion.
    var loadTop = viewportTop - viewportHeight;
    var loadBottom = viewportBottom + viewportHeight;
    if (this.lastVelocity_ >= 0) {
      loadBottom += viewportHeight;
    } else {
      loadTop -= viewportHeight;
    }
    // TODO(dvoytenko): should we always go from the document top instead? What
    // if this is a video up top and users typically expect those to take a
    // little longer and they'd start scrolling while waiting for load?
    // TODO(dvoytenko): some priority is needed here. E.g. amp-ad may need to
    // wait for other non-ad content.
    // TODO(dvoytenko): what about slides? All of its content is at the same
    // box.top, but only few are visible at a time.
    // TODO(dvoytenko): some elements are explicitly not visible (amp-pixel)
    for (let r of this.resources_) {
      let box = r.getLayoutBox();
      if (box.height == 0) {
        // Not visible
        continue;
      }
      if (box.top <= loadBottom && loadTop <= box.bottom) {
        if (!r.isLoaded() && !r.isLoadingFailed() && !this.isLoading_(r)) {
          this.enqueLoading_(r);
        }
      }
    }

    // Phase 4: Trigger active. Active window = viewport window + 25% up/down.
    var activeTop = viewportTop - viewportHeight / 4;
    var activeBottom = viewportBottom + viewportHeight / 4;
    log.fine(TAG_, 'activate window: ' + activeTop + '/' + activeBottom + ', ' +
        viewportBottom + ', ' + viewportHeight);
    for (let r of this.resources_) {
      let box = r.getLayoutBox();
      if (box.height == 0) {
        // Not visible
        continue;
      }
      log.fine(TAG_, 'bottom: ' + box.bottom + ',' + box.top);
      var shouldBeActive = (box.top <= activeBottom && activeTop <= box.bottom);
      if (r.isActive() != shouldBeActive) {
        r.setActive(shouldBeActive);
      }
    }

    log.fine(TAG_, 'currently loading: ' + this.loading_.length);
    if (this.loading_.length > 0) {
      this.lastLoading_ = now;
    }

    // Phase 5: Idle loading
    // TODO(dvoytenko): document/estimate IDLE timeouts and other constants
    if (now > this.lastLoading_ + 3000) {
      for (let r of this.resources_) {
        let box = r.getLayoutBox();
        if (box.height == 0) {
          // Not visible
          continue;
        }
        if (!r.isLoaded() && !r.isLoadingFailed() && !this.isLoading_(r)) {
          log.fine(TAG_, 'idle load: ' + r.element.id + '');
          this.enqueLoading_(r);
          if (this.loading_.length >= 4) {
            break;
          }
        }
      }
    }
    if (this.loading_.length > 0) {
      this.lastLoading_ = now;
    }

    // Finally, schedule the next pass.
    var nextPassDelay = (now - this.lastLoading_) * 2;
    nextPassDelay = Math.max(Math.min(30000, nextPassDelay), 5000);
    this.schedulePass(/* rebuild */ false, nextPassDelay);
  }

  /**
   * @param {!Resource} resource
   */
  enqueLoading_(resource) {
    this.loading_.push(resource);
    resource.load().then(() => {
      this.dequeueLoading_(resource);
    }, (error) => {
      this.dequeueLoading_(resource);
      console.error(error);
    });
  }

  /**
   * @param {!Resource} resource
   */
  dequeueLoading_(resource) {
    var removedCount = 0;
    for (let i = 0; i < this.loading_.length; i++) {
      if (resource == this.loading_[i]) {
        removedCount++;
        this.loading_.splice(i, 1);
        break;
      }
    }
    if (removedCount > 0 && this.loading_.length == 0) {
      this.schedulePass(/* rebuild */ false, /* delay */ 300);
    }
  }

  /**
   * @param {!Resource} resource
   * @return {boolean}
   */
  isLoading_(resource) {
    for (let i = 0; i < this.loading_.length; i++) {
      if (resource == this.loading_[i]) {
        return true;
      }
    }
  }

  get() {
    return this.resources_;
  }

  getResource(element) {
    return this.resourceMap_[element.id];
  }

  add(element) {
    var id = element.id;
    if (!id) {
      id = 'AMP_' + this.resources_.length;
      element.id = id;
    }
    log.fine(TAG_, 'add element: ' + element.tagName + ': #' + element.id);
    var r = new Resource(element);
    this.resources_.push(r);
    this.resourceMap_[element.id] = r;
    this.schedulePass(/* rebuild */ false);
  }

  remove(element) {
    delete this.resourceMap_[element.id];
    this.resources_ = this.resources_.filter((r) => {
      return r.element != element;
    });
  }
}

class Resource {
  constructor(element) {
    /* @const {!Element} */
    this.element = element;

    /** @private {boolean} */
    this.layoutReady_ = false;

    /** @type {?LayoutRect} */
    this.boundingBox_ = null;

    /** @private {boolean} */
    this.isLoaded_ = this.element.isContentLoaded();

    /** @private {boolean} */
    this.isLoadingFailed_ = false;

    /** @private {?Promise} */
    this.loadingPromise_ = null;

    /** @private {boolean} */
    this.isActive_ = false;

    /** @private {?Promise} */
    this.activatingPromise_ = null;
  }

  /** @return {boolean} */
  isLayoutReady() {
    return this.layoutReady_;
  }

  /** */
  layout() {
    // TODO(dvoytenko): call to the component
    this.layoutReady_ = true;
    this.boundingBox_ = null;
  }

  /**
   * If the resource has a media attribute, evaluates the value as a media
   * query and based on the result adds or removes the class
   * `-amp-hidden-by-media-query`. The class adds display:none to the element
   * which in turn prevents any of the resource loading to happen for the
   * element.
   * @private
   */
  applyMediaQuery() {
    var mediaQuery = this.element.getAttribute('media');
    if (!mediaQuery) {
      return;
    }
    if (this.element.ownerDocument.defaultView
        .matchMedia(mediaQuery).matches) {
      log.fine(TAG_, 'MATCH ' + this.element.id)
      this.element.classList.remove('-amp-hidden-by-media-query')
    } else {
      log.fine(TAG_, 'NO MATCH ' + this.element.id)
      this.element.classList.add('-amp-hidden-by-media-query');
    }
  }

  /** */
  measure() {
    this.boundingBox_ = viewport.getLayoutRect(this.element);
  }

  /**
   * Notice! Calling this method before measure() was called may cause relayout.
   * @return {!LayoutRect}
   */
  getLayoutBox() {
    assert(this.boundingBox_, 'Bounding box was not measured yet');
    return this.boundingBox_;
  }

  /**
   * @return {boolean}
   */
  isLoaded() {
    return this.isLoaded_;
  }

  /**
   * @return {boolean}
   */
  isLoadingFailed() {
    return this.isLoadingFailed_;
  }

  /**
   * @return {!Promise}
   */
  load() {
    if (this.isLoaded_) {
      return Promise.resolve();
    }
    if (this.isLoadingFailed_) {
      return Promise.reject('already failed');
    }

    if (!this.loadingPromise_) {
      log.fine(TAG_, 'load: ' + this.element.id);
      let promise = retriablePromise(() => {
        return this.element.initiateLoadContent();
      }, /* maxAttempts */ 2, /* delay */ 5000, /* backoffFactor */ 1.5);
      this.loadingPromise_ = promise.then(() => {
        log.fine(TAG_, 'loaded: ' + this.element.id);
        this.isLoaded_ = true;
      }, (reason) => {
        log.fine(TAG_, 'loading failed: ' + this.element.id + ': ' + reason);
        this.isLoadingFailed_ = true;
      });
    }
    return this.loadingPromise_;
  }

  /**
   * @return {boolean}
   */
  isActive() {
    return this.isActive_;
  }

  /**
   * @param {boolean} active
   */
  setActive(active) {
    if (active == this.isActive_) {
      return;
    }
    this.isActive_ = active;
    if (active) {
      if (!this.activatingPromise_) {
        log.fine(TAG_, 'activate: ' + this.element.id);
        this.activatingPromise_ = this.load().then(() => {
          this.doActivate_();
          this.activatingPromise_ = null;
        }, (reason) => {
          log.fine(TAG_, 'activation failed: ' + this.element.id + ': ' +
              reason);
          this.activatingPromise_ = null;
        });
      }
    } else {
      log.fine(TAG_, 'deactivate: ' + this.element.id);
      if (this.activatingPromise_) {
        this.activatingPromise_.then(() => this.doDeactivate_(),
            () => this.doDeactivate_());
        this.activatingPromise_ = null;
      } else if (this.isLoaded_) {
        this.doDeactivate_();
      }
    }
  }

  /**
   * @private
   */
  doActivate_() {
    if (this.isActive_) {
      log.fine(TAG_, 'activated: ' + this.element.id);
      this.element.activateContentCallback();
    }
  }

  /**
   * @private
   */
  doDeactivate_() {
    if (!this.isActive_) {
      this.element.deactivateContentCallback();
    }
  }
}


export const resources = new Resources(window);
