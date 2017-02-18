/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

// TODO(dvoytenko): rename file to `visibility.js`.

import {
  DEFAULT_THRESHOLD,
  IntersectionObserverPolyfill,
  nativeIntersectionObserverSupported,
} from '../../../src/intersection-observer-polyfill';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {map} from '../../../src/utils/object';
import {resourcesForDoc} from '../../../src/resources';
import {viewerForDoc} from '../../../src/viewer';
import {viewportForDoc} from '../../../src/viewport';

const VISIBILITY_ID_PROP = '__AMP_VIS_ID';

/** @type {number} */
let visibilityIdCounter = 1;


/**
 * @param {!Element} element
 * @return {number}
 */
function getElementId(element) {
  let id = element[VISIBILITY_ID_PROP];
  if (!id) {
    id = ++visibilityIdCounter;
    element[VISIBILITY_ID_PROP] = id;
  }
  return id;
}


/**
 * This class implements visibility calculations based on the
 * visibility ratio. It's used for documents, embeds and individual element.
 * @implements {../../../src/service.Disposable}
 */
export class VisibilityModel {
  /**
   * @param {?VisibilityModel} parent
   * @param {!Object<string, *>} spec
   * @param {number=} opt_iniVisibility
   * @param {boolean=} opt_shouldFactorParent
   */
  constructor(parent, spec, opt_iniVisibility, opt_shouldFactorParent) {
    /** @const @private */
    this.parent_ = parent;

    /**
     * Whether this visibility is in the intersection with parent. Thus the
     * final visibility will be this visibility times parent.
     * @const @private {boolean}
     */
    this.shouldFactorParent_ = opt_shouldFactorParent || false;

    /**
     * Spec parameters.
     * @private {{
     *   visiblePercentageMin: number,
     *   visiblePercentageMax: number,
     *   totalTimeMin: number,
     *   totalTimeMax: number,
     *   continuousTimeMin: number,
     *   continuousTimeMax: number,
     * }}
     */
    this.spec_ = {
      visiblePercentageMin: Number(spec['visiblePercentageMin']) / 100 || 0,
      visiblePercentageMax: Number(spec['visiblePercentageMax']) / 100 || 1,
      totalTimeMin: Number(spec['totalTimeMin']) || 0,
      totalTimeMax: Number(spec['totalTimeMax']) || Infinity,
      continuousTimeMin: Number(spec['continuousTimeMin']) || 0,
      continuousTimeMax: Number(spec['continuousTimeMax']) || Infinity,
    };

    /** @private {?function()} */
    this.eventResolver_ = null;

    /** @const @private */
    this.eventPromise_ = new Promise(resolve => {
      this.eventResolver_ = resolve;
    });

    /** @private {?Array<!VisibilityModel>} */
    this.children_ = null;

    /** @private {!Array<!UnlistenDef>} */
    this.unsubscribe_ = [];

    /** @const @private {time} */
    this.createdTime_ = Date.now();

    /** @private {number} */
    this.ownVisibility_ = opt_iniVisibility || 0;

    /** @private {boolean} */
    this.ready_ = true;

    /** @private {?number} */
    this.scheduledRunId_ = null;

    /** @private {boolean} */
    this.matchesVisibility_ = false;

    /** @private {boolean} */
    this.everMatchedVisibility_ = false;

    /** @private {time} */
    this.continuousTime_ = 0;

    /** @private {time} */
    this.maxContinuousVisibleTime_ = 0;

    /** @private {time} */
    this.totalVisibleTime_ = 0;

    /** @private {time} */
    this.firstSeenTime_ = 0;

    /** @private {time} */
    this.lastSeenTime_ = 0;

    /** @private {time} */
    this.fistVisibleTime_ = 0;

    /** @private {time} */
    this.lastVisibleTime_ = 0;

    /** @private {time} */
    this.loadTimeVisibility_ = 0;

    /** @private {number} */
    this.minVisiblePercentage_ = 0;

    /** @private {number} */
    this.maxVisiblePercentage_ = 0;

    /** @private {time} */
    this.lastVisibleUpdateTime_ = 0;

    if (this.parent_) {
      this.parent_.addChild_(this);
    }
  }

  /** @override */
  dispose() {
    if (this.parent_) {
      this.parent_.removeChild_(this);
    }
    if (this.scheduledRunId_) {
      clearTimeout(this.scheduledRunId_);
      this.scheduledRunId_ = null;
    }
    this.unsubscribe_.forEach(unsubscribe => {
      unsubscribe();
    });
    this.unsubscribe_.length = 0;
    this.eventResolver_ = null;
  }

  /**
   * Adds the unsubscribe handler that will be called when this visibility
   * model is destroyed.
   * @param {!UnlistenDef} handler
   */
  unsubscribe(handler) {
    this.unsubscribe_.push(handler);
  }

  /**
   * Adds the event handler that will be called when all visibility conditions
   * have been met.
   * @param {function()} handler
   */
  onEvent(handler) {
    this.eventPromise_.then(handler);
  }

  /**
   * Sets visibility of this object. See `getVisibility()` for the final
   * visibility calculations.
   * @param {number} visibility
   */
  setVisibility(visibility) {
    this.ownVisibility_ = visibility;
    this.update();
  }

  /**
   * Sets whether this object is ready. Ready means that visibility is
   * ready to be calculated, e.g. because an element has been
   * sufficiently rendered. See `getVisibility()` for the final
   * visibility calculations.
   * @param {boolean} ready
   */
  setReady(ready) {
    this.ready_ = ready;
    this.update();
  }

  /**
   * Returns the final visibility. It depends on the following factors:
   *  1. This object's visibility.
   *  2. Whether the object is ready.
   *  3. The parent's visibility.
   * @return {number}
   */
  getVisibility() {
    const ownVisibility = this.ready_ ? this.ownVisibility_ : 0;
    if (!this.parent_) {
      return ownVisibility;
    }
    if (this.shouldFactorParent_) {
      return ownVisibility * this.parent_.getVisibility();
    }
    return this.parent_.getVisibility() > 0 ? ownVisibility : 0;
  }

  /**
   * Runs the calculation cycle.
   */
  update() {
    const visibility = this.getVisibility();
    this.update_(visibility);
    if (this.children_) {
      for (let i = 0; i < this.children_.length; i++) {
        this.children_[i].update();
      }
    }
  }

  /**
   * Returns the calculated state of visibility.
   * @param {time} startTime
   * @return {!Object<string, string|number>}
   */
  getState(startTime) {
    return {
      // Observed times, relative to the `startTime`.
      firstSeenTime: timeBase(this.firstSeenTime_, startTime),
      lastSeenTime: timeBase(this.lastSeenTime_, startTime),
      lastVisibleTime: timeBase(this.lastVisibleTime_, startTime),
      fistVisibleTime: timeBase(this.fistVisibleTime_, startTime),

      // Durations.
      maxContinuousVisibleTime: this.maxContinuousVisibleTime_,
      totalVisibleTime: this.totalVisibleTime_,

      // Visibility percents.
      loadTimeVisibility: this.loadTimeVisibility_ * 100 || 0,
      minVisiblePercentage: this.minVisiblePercentage_ * 100,
      maxVisiblePercentage: this.maxVisiblePercentage_ * 100,
    };
  }

  /**
   * @param {number} visibility
   * @private
   */
  update_(visibility) {
    if (!this.eventResolver_) {
      return;
    }
    // Update state and check if all conditions are satisfied
    const conditionsMet = this.updateCounters_(visibility);
    if (conditionsMet) {
      if (this.scheduledRunId_) {
        clearTimeout(this.scheduledRunId_);
        this.scheduledRunId_ = null;
      }
      this.eventResolver_();
      this.eventResolver_ = null;
    } else if (this.matchesVisibility_ && !this.scheduledRunId_) {
      // There is unmet duration condition, schedule a check
      const timeToWait = this.computeTimeToWait_();
      if (timeToWait > 0) {
        this.scheduledRunId_ = setTimeout(() => {
          this.scheduledRunId_ = null;
          this.update();
        }, timeToWait);
      }
    } else if (!this.matchesVisibility_ && this.scheduledRunId_) {
      clearTimeout(this.scheduledRunId_);
      this.scheduledRunId_ = null;
    }
  }

  /**
   * @param {number} visibility
   * @return {boolean} true
   * @private
   */
  updateCounters_(visibility) {
    const now = Date.now();

    if (visibility > 0) {
      this.firstSeenTime_ = this.firstSeenTime_ || now;
      this.lastSeenTime_ = now;
      // Consider it as load time visibility if this happens within 300ms of
      // page load.
      if (!this.loadTimeVisibility_ && (now - this.createdTime_) < 300) {
        this.loadTimeVisibility_ = visibility;
      }
    }

    const prevMatchesVisibility = this.matchesVisibility_;
    const timeSinceLastUpdate =
        this.lastVisibleUpdateTime_ ? now - this.lastVisibleUpdateTime_ : 0;
    this.matchesVisibility_ = (
        visibility > this.spec_.visiblePercentageMin &&
        visibility <= this.spec_.visiblePercentageMax);

    if (this.matchesVisibility_) {
      this.everMatchedVisibility_ = true;
      if (prevMatchesVisibility) {
        // Keep counting.
        this.totalVisibleTime_ += timeSinceLastUpdate;
        this.continuousTime_ += timeSinceLastUpdate;
        this.maxContinuousVisibleTime_ =
            Math.max(this.maxContinuousVisibleTime_, this.continuousTime_);
      } else {
        // The resource came into view: start counting.
        dev().assert(!this.lastVisibleUpdateTime_);
        this.fistVisibleTime_ = this.fistVisibleTime_ || now;
      }
      this.lastVisibleUpdateTime_ = now;
      this.minVisiblePercentage_ =
          this.minVisiblePercentage_ > 0 ?
          Math.min(this.minVisiblePercentage_, visibility) :
          visibility;
      this.maxVisiblePercentage_ =
          Math.max(this.maxVisiblePercentage_, visibility);
      this.lastVisibleTime_ = now;
    } else if (prevMatchesVisibility) {
      // The resource went out of view. Do final calculations and reset state.
      dev().assert(this.lastVisibleUpdateTime_ > 0);

      this.maxContinuousVisibleTime_ = Math.max(
          this.maxContinuousVisibleTime_,
          this.continuousTime_ + timeSinceLastUpdate);

      // Reset for next visibility event.
      this.lastVisibleUpdateTime_ = 0;
      this.totalVisibleTime_ += timeSinceLastUpdate;
      this.continuousTime_ = 0;  // Clear only after max is calculated above.
      this.lastVisibleTime_ = now;
    }

    return this.everMatchedVisibility_ &&
        (this.totalVisibleTime_ >= this.spec_.totalTimeMin) &&
        (this.totalVisibleTime_ <= this.spec_.totalTimeMax) &&
        (this.maxContinuousVisibleTime_ >= this.spec_.continuousTimeMin) &&
        (this.maxContinuousVisibleTime_ <= this.spec_.continuousTimeMax);
  }

  /**
   * Computes time, assuming the object is currently visible, that it'd take
   * it to match all timing requirements.
   * @return {time}
   * @private
   */
  computeTimeToWait_() {
    const waitForContinuousTime = Math.max(
        this.spec_.continuousTimeMin - this.continuousTime_, 0);
    const waitForTotalTime = Math.max(
        this.spec_.totalTimeMin - this.totalVisibleTime_, 0);
    const maxWaitTime = Math.max(waitForContinuousTime, waitForTotalTime);
    return Math.min(
        maxWaitTime,
        waitForContinuousTime || Infinity,
        waitForTotalTime || Infinity);
  }

  /**
   * @param {!VisibilityModel} child
   * @private
   */
  addChild_(child) {
    if (!this.children_) {
      this.children_ = [];
    }
    this.children_.push(child);
  }

  /**
   * @param {!VisibilityModel} child
   * @private
   */
  removeChild_(child) {
    if (this.children_) {
      const index = this.children_.indexOf(child);
      if (index != -1) {
        this.children_.splice(index, 1);
      }
    }
  }
}


/**
 * Calculates the specified time based on the given `baseTime`.
 * @param {time} time
 * @param {time} baseTime
 * @return {time}
 */
function timeBase(time, baseTime) {
  return time >= baseTime ? time - baseTime : 0;
}


/**
 * A base class for `VisibilityRootForDoc` and `VisibilityRootForEmbed`. The
 * instance of this class corresponds 1:1 to `AnalyticsRoot`. It represents a
 * collection of all visibility triggers declared within the `AnalyticsRoot`.
 * @implements {../../../src/service.Disposable}
 * @abstract
 */
export class VisibilityRoot {
  /**
   * @param {?VisibilityRoot} parent
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(parent, ampdoc) {
    /** @const @protected */
    this.parent = parent;

    /** @const @protected */
    this.ampdoc = ampdoc;

    /** @const @private */
    this.resources_ = resourcesForDoc(ampdoc);

    /** @const @private {!Array<!VisibilityModel>}> */
    this.models_ = [];

    /** @const @private {!Array<!UnlistenDef>} */
    this.unsubscribe_ = [];
  }

  /** @override */
  dispose() {
    // Give the chance for all events to complete.
    this.getRootModel().setVisibility(0);

    // Dispose all models.
    this.getRootModel().dispose();
    for (let i = this.models_.length - 1; i >= 0; i--) {
      this.models_[i].dispose();
    }

    // Unsubscribe everything else.
    this.unsubscribe_.forEach(unsubscribe => {
      unsubscribe();
    });
    this.unsubscribe_.length = 0;
  }

  /**
   * @param {!UnlistenDef} handler
   */
  unsubscribe(handler) {
    this.unsubscribe_.push(handler);
  }

  /**
   * The start time from which all visibility events and times are measured.
   * @return {number}
   * @abstract
   */
  getStartTime() {}

  /**
   * Whether the visibility root is currently in the background.
   * @return {boolean}
   * @abstract
   */
  isBackgrounded() {}

  /**
   * Whether the visibility root has been created in the background mode.
   * @return {boolean}
   * @abstract
   */
  isBackgroundedAtStart() {}

  /**
   * Returns the visibility model for this root. If the root is not visibile,
   * it returns the value of 0, otherwise the value greater than 0 and less
   * than 1.
   * @return {!VisibilityModel}
   * @abstract
   */
  getRootModel() {}

  /**
   * Listens to the visibility events on the root as the whole and the given
   * visibility spec. The visibility tracking can be deferred until
   * `readyPromise` is resolved, if specified.
   * @param {!Object<string, *>} spec
   * @param {?Promise} readySignal
   * @param {function(!Object<string, *>)} listener
   * @return {!UnlistenDef}
   */
  listenRoot(spec, readySignal, listener) {
    const model = new VisibilityModel(
        this.getRootModel(),
        spec,
        /* ownVisibility */ 1,
        /* factorParent */ true);
    return this.listen_(model, spec, listener, readySignal);
  }

  /**
   * Listens to the visibility events for the specified element and the given
   * visibility spec. The visibility tracking can be deferred until
   * `readyPromise` is resolved, if specified.
   * @param {!Element} element
   * @param {!Object<string, *>} spec
   * @param {?Promise} readySignal
   * @param {function(!Object<string, *>)} listener
   * @return {!UnlistenDef}
   */
  listenElement(element, spec, readySignal, listener) {
    const model = new VisibilityModel(this.getRootModel(), spec);
    return this.listen_(model, spec, listener, readySignal, element);
  }

  /**
   * @param {!VisibilityModel} model
   * @param {!Object<string, *>} spec
   * @param {function(!Object<string, *>)} listener
   * @param {?Promise} readySignal
   * @param {!Element=} opt_element
   * @return {!UnlistenDef}
   * @private
   */
  listen_(model, spec, listener, readySignal, opt_element) {
    // Block visibility.
    if (readySignal) {
      model.setReady(false);
      readySignal.then(() => {
        model.setReady(true);
      });
    }

    // Process the event.
    model.onEvent(() => {
      const startTime = this.getStartTime();
      const state = model.getState(startTime);
      model.dispose();

      // Additional doc-level state.
      state['backgrounded'] = this.isBackgrounded() ? 1 : 0;
      state['backgroundedAtStart'] = this.isBackgroundedAtStart() ? 1 : 0;
      state['totalTime'] = Date.now() - startTime;

      // Optionally, element-level state.
      const resource = opt_element ?
          this.resources_.getResourceForElementOptional(opt_element) : null;
      if (resource) {
        const layoutBox = resource.getLayoutBox();
        state['elementX'] = layoutBox.left;
        state['elementY'] = layoutBox.top;
        state['elementWidth'] = layoutBox.width;
        state['elementHeight'] = layoutBox.height;
      }

      listener(state);
    });

    this.models_.push(model);
    model.unsubscribe(() => {
      const index = this.models_.indexOf(model);
      if (index != -1) {
        this.models_.splice(index, 1);
      }
    });

    // Observe the element via InOb.
    if (opt_element) {
      // It's important that this happens after all the setup is done, b/c
      // intersection observer can fire immedidately. Per spec, this should
      // NOT happen. However, all of the existing InOb polyfills, as well as
      // some versions of native implementations, make this mistake.
      this.observe(opt_element, model);
    }

    // Start update.
    model.update();
    return function() {
      model.dispose();
    };
  }

  /**
   * Observes the intersections of the specified element in the viewport.
   * @param {!Element} element
   * @param {!VisibilityModel} unusedModel
   * @protected
   * @abstract
   */
  observe(element, unusedModel) {}
}


/**
 * The implementation of `VisibilityRoot` for an AMP document. Two
 * distinct modes are supported: the main AMP doc and a in-a-box doc.
 */
export class VisibilityRootForDoc extends VisibilityRoot {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    super(/* parent */ null, ampdoc);

    /** @const @private */
    this.viewer_ = viewerForDoc(ampdoc);

    /** @const @private */
    this.viewport_ = viewportForDoc(ampdoc);

    /** @private {boolean} */
    this.backgrounded_ = !this.viewer_.isVisible();

    /** @const @private {boolean} */
    this.backgroundedAtStart_ = this.isBackgrounded();

    /**
     * @const
     * @private {!Object<number, {
     *   element: !Element,
     *   intersectionRatio: number,
     *   models: !Array<!VisibilityModel>
     * }>}
     */
    this.trackedElements_ = map();

    /** @private {?IntersectionObserver|?IntersectionObserverPolyfill} */
    this.intersectionObserver_ = null;

    let rootModel;
    if (getMode(this.ampdoc.win).runtime == 'inabox') {
      // In-a-box: visibility depends on the InOb.
      const root = this.ampdoc.getRootNode();
      const rootElement = dev().assertElement(
          root.documentElement || root.body || root);
      rootModel = new VisibilityModel(/* parent */ null, {});
      this.observe(rootElement, rootModel);
    } else {
      // Main document: visibility is based on the viewer.
      rootModel = new VisibilityModel(
          /* parent */ null,
          {},
          this.viewer_.isVisible() ? 1 : 0);
      this.unsubscribe(this.viewer_.onVisibilityChanged(() => {
        const isVisible = this.viewer_.isVisible();
        if (!isVisible) {
          this.backgrounded_ = true;
        }
        rootModel.setVisibility(isVisible ? 1 : 0);
      }));
    }
    /** @private @const */
    this.rootModel_ = rootModel;
  }

  /** @override */
  dispose() {
    super.dispose();
    if (this.intersectionObserver_) {
      this.intersectionObserver_.disconnect();
      this.intersectionObserver_ = null;
    }
  }

  /** @override */
  getStartTime() {
    return dev().assertNumber(this.viewer_.getFirstVisibleTime());
  }

  /** @override */
  isBackgrounded() {
    return this.backgrounded_;
  }

  /** @override */
  isBackgroundedAtStart() {
    return this.backgroundedAtStart_;
  }

  /** @override */
  getRootModel() {
    return this.rootModel_;
  }

  /** @override */
  observe(element, model) {
    this.polyfillAmpElementAsRootIfNeeded_(element);
    this.getIntersectionObserver_().observe(element);

    const id = getElementId(element);
    let trackedElement = this.trackedElements_[id];
    if (!trackedElement) {
      trackedElement = {
        element,
        intersectionRatio: 0,
        models: [],
      };
      this.trackedElements_[id] = trackedElement;
    } else if (trackedElement.intersectionRatio > 0) {
      // This has already been tracked and the `intersectionRatio` is fresh.
      model.setVisibility(trackedElement.intersectionRatio);
    }
    trackedElement.models.push(model);
    model.unsubscribe(() => {
      const trackedElement = this.trackedElements_[id];
      if (trackedElement) {
        const index = trackedElement.models.indexOf(model);
        if (index != -1) {
          trackedElement.models.splice(index, 1);
        }
        if (trackedElement.models.length == 0) {
          this.intersectionObserver_.unobserve(element);
          delete this.trackedElements_[id];
        }
      }
    });
  }

  /**
   * @return {!IntersectionObserver|!IntersectionObserverPolyfill}
   * @private
   */
  getIntersectionObserver_() {
    if (!this.intersectionObserver_) {
      this.intersectionObserver_ = this.createIntersectionObserver_();
    }
    return this.intersectionObserver_;
  }

  /**
   * @return {!IntersectionObserver|!IntersectionObserverPolyfill}
   * @private
   */
  createIntersectionObserver_() {
    // Native.
    const win = this.ampdoc.win;
    if (nativeIntersectionObserverSupported(win)) {
      return new win.IntersectionObserver(
          this.onIntersectionChanges_.bind(this),
          {threshold: DEFAULT_THRESHOLD});
    }

    // Polyfill.
    const intersectionObserverPolyfill = new IntersectionObserverPolyfill(
        this.onIntersectionChanges_.bind(this),
        {threshold: DEFAULT_THRESHOLD});
    const ticker = () => {
      intersectionObserverPolyfill.tick(this.viewport_.getRect());
    };
    this.unsubscribe(this.viewport_.onScroll(ticker));
    this.unsubscribe(this.viewport_.onChanged(ticker));
    setTimeout(ticker, 1);
    return intersectionObserverPolyfill;
  }

  /**
   * @param {!Element} element
   * @private
   */
  polyfillAmpElementAsRootIfNeeded_(element) {
    const win = this.ampdoc.win;
    if (nativeIntersectionObserverSupported(win)) {
      return;
    }

    // InOb polyfill requires partial AmpElement implementation.
    if (typeof element.getLayoutBox == 'function') {
      return;
    }
    element.getLayoutBox = () => {
      return this.viewport_.getRect();
    };
    element.getOwner = () => null;
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @private
   */
  onIntersectionChanges_(entries) {
    entries.forEach(change => {
      this.onIntersectionChange_(change.target, change.intersectionRatio);
    });
  }

  /**
   * @param {!Element} target
   * @param {number} intersectionRatio
   * @private
   */
  onIntersectionChange_(target, intersectionRatio) {
    const id = getElementId(target);
    const trackedElement = this.trackedElements_[id];
    if (trackedElement) {
      trackedElement.intersectionRatio = intersectionRatio;
      for (let i = 0; i < trackedElement.models.length; i++) {
        trackedElement.models[i].setVisibility(intersectionRatio);
      }
    }
  }
}


/**
 * The implementation of `VisibilityRoot` for a FIE embed. This visibility
 * root delegates most of tracking functions to its parent, the ampdoc root.
 */
export class VisibilityRootForEmbed extends VisibilityRoot {
  /**
   * @param {!VisibilityRoot} parent
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} embed
   */
  constructor(parent, embed) {
    super(parent, parent.ampdoc);

    /** @const */
    this.embed = embed;

    /** @const @private {boolean} */
    this.backgroundedAtStart_ = this.parent.isBackgrounded();

    /** @private @const */
    this.rootModel_ = new VisibilityModel(this.parent.getRootModel(), {});
    this.parent.observe(dev().assertElement(embed.host), this.rootModel_);
  }

  /** @override */
  getStartTime() {
    return this.embed.getStartTime();
  }

  /** @override */
  isBackgrounded() {
    return this.parent.isBackgrounded();
  }

  /** @override */
  isBackgroundedAtStart() {
    return this.backgroundedAtStart_;
  }

  /** @override */
  getRootModel() {
    return this.rootModel_;
  }

  /** @override */
  observe(element, model) {
    this.parent.observe(element, model);
  }
}
