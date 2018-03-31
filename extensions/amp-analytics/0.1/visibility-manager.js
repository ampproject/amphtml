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

import {
  DEFAULT_THRESHOLD,
  IntersectionObserverPolyfill,
  nativeIntersectionObserverSupported,
} from '../../../src/intersection-observer-polyfill';
import {Services} from '../../../src/services';
import {VisibilityModel} from './visibility-model';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isArray, isFiniteNumber} from '../../../src/types';
import {layoutRectLtwh} from '../../../src/layout-rect';
import {map} from '../../../src/utils/object';

const TAG = 'VISIBILITY-MANAGER';

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
 * A base class for `VisibilityManagerForDoc` and `VisibilityManagerForEmbed`.
 * The instance of this class corresponds 1:1 to `AnalyticsRoot`. It represents
 * a collection of all visibility triggers declared within the `AnalyticsRoot`.
 * @implements {../../../src/service.Disposable}
 * @abstract
 */
export class VisibilityManager {
  /**
   * @param {?VisibilityManager} parent
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(parent, ampdoc) {
    /** @const @protected */
    this.parent = parent;

    /** @const @protected */
    this.ampdoc = ampdoc;

    /** @const @private */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    /** @private {number} */
    this.rootVisibility_ = 0;

    /** @const @private {!Array<!VisibilityModel>}> */
    this.models_ = [];

    /** @private {?Array<!VisibilityManager>} */
    this.children_ = null;

    /** @const @private {!Array<!UnlistenDef>} */
    this.unsubscribe_ = [];

    if (this.parent) {
      this.parent.addChild_(this);
    }
  }

  /**
   * @param {!VisibilityManager} child
   * @private
   */
  addChild_(child) {
    if (!this.children_) {
      this.children_ = [];
    }
    this.children_.push(child);
  }

  /**
   * @param {!VisibilityManager} child
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

  /** @override */
  dispose() {
    // Give the chance for all events to complete.
    this.setRootVisibility(0);

    // Dispose all models.
    for (let i = this.models_.length - 1; i >= 0; i--) {
      this.models_[i].dispose();
    }

    // Unsubscribe everything else.
    this.unsubscribe_.forEach(unsubscribe => {
      unsubscribe();
    });
    this.unsubscribe_.length = 0;

    if (this.parent) {
      this.parent.removeChild_(this);
    }
    if (this.children_) {
      for (let i = 0; i < this.children_.length; i++) {
        this.children_[i].dispose();
      }
    }
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
   * Returns the root's layout rect.
   * @return {!../../../src/layout-rect.LayoutRectDef}}
   * @abstract
   */
  getRootLayoutBox() {}

  /**
   * @return {number}
   */
  getRootVisibility() {
    if (!this.parent) {
      return this.rootVisibility_;
    }
    return this.parent.getRootVisibility() > 0 ? this.rootVisibility_ : 0;
  }

  /**
   * @param {number} visibility
   */
  setRootVisibility(visibility) {
    this.rootVisibility_ = visibility;
    this.updateModels_();
    if (this.children_) {
      for (let i = 0; i < this.children_.length; i++) {
        this.children_[i].updateModels_();
      }
    }
  }

  /** @private */
  updateModels_() {
    for (let i = 0; i < this.models_.length; i++) {
      this.models_[i].update();
    }
  }

  /**
   * Listens to the visibility events on the root as the whole and the given
   * visibility spec. The visibility tracking can be deferred until
   * `readyPromise` is resolved, if specified.
   * @param {!Object<string, *>} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!Object<string, *>)} callback
   * @return {!UnlistenDef}
   */
  listenRoot(spec, readyPromise, createReportPromiseFunc, callback) {
    const calcVisibility = this.getRootVisibility.bind(this);
    return this.createModelAndListen_(calcVisibility, spec, readyPromise,
        createReportPromiseFunc, callback);
  }

  /**
   * Listens to the visibility events for the specified element and the given
   * visibility spec. The visibility tracking can be deferred until
   * `readyPromise` is resolved, if specified.
   * @param {!Element} element
   * @param {!Object<string, *>} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!Object<string, *>)} callback
   * @return {!UnlistenDef}
   */
  listenElement(
    element, spec, readyPromise, createReportPromiseFunc, callback) {
    const calcVisibility = this.getElementVisibility.bind(this, element);
    return this.createModelAndListen_(calcVisibility, spec, readyPromise,
        createReportPromiseFunc, callback, element);
  }

  /**
   * Create visibilityModel and listen to visible events.
   * @param {function():number} calcVisibility
   * @param {!Object<string, *>} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!Object<string, *>)} callback
   * @param {!Element=} opt_element
   * @return {!UnlistenDef}
   */
  createModelAndListen_(calcVisibility, spec,
    readyPromise, createReportPromiseFunc, callback, opt_element) {
    if (spec['visiblePercentageThresholds'] &&
        spec['visiblePercentageMin'] == undefined &&
        spec['visiblePercentageMax'] == undefined) {
      const unlisteners = [];
      const ranges = spec['visiblePercentageThresholds'];
      if (!ranges || !isArray(ranges)) {
        user().error(TAG, 'invalid visiblePercentageThresholds');
        return () => {};
      }
      for (let i = 0; i < ranges.length; i++) {
        const percents = ranges[i];
        if (!isArray(percents) || percents.length != 2) {
          user().error(TAG,
              'visiblePercentageThresholds entry length is not 2');
          continue;
        }
        if (!isFiniteNumber(percents[0]) || !isFiniteNumber(percents[1])) {
          // not valid number
          user().error(TAG,
              'visiblePercentageThresholds entry is not valid number');
          continue;
        }
        const min = Number(percents[0]);
        const max = Number(percents[1]);
        // Min and max must be valid percentages. Min may not be more than max.
        // Max is inclusive. Min is usually exclusive, but there are two
        // special cases: if min and max are both 0, or both 100, then both
        // are inclusive. Otherwise it would not be possible to trigger an
        // event on exactly 0% or 100%.
        if (min < 0 || max > 100 || min > max ||
            (min == max && min != 100 && max != 0)) {
          user().error(TAG,
              'visiblePercentageThresholds entry invalid min/max value');
          continue;
        }
        const newSpec = spec;
        newSpec['visiblePercentageMin'] = min;
        newSpec['visiblePercentageMax'] = max;
        const model = new VisibilityModel(newSpec, calcVisibility);
        unlisteners.push(this.listen_(model, spec, readyPromise,
            createReportPromiseFunc, callback, opt_element));
      }
      return () => {
        unlisteners.forEach(unlistener => unlistener());
      };
    }

    const model = new VisibilityModel(spec, calcVisibility);
    return this.listen_(model, spec, readyPromise,
        createReportPromiseFunc, callback, opt_element);
  }

  /**
   * @param {!VisibilityModel} model
   * @param {!Object<string, *>} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!Object<string, *>)} callback
   * @param {!Element=} opt_element
   * @return {!UnlistenDef}
   * @private
   */
  listen_(model, spec,
    readyPromise, createReportPromiseFunc, callback, opt_element) {
    // Block visibility.
    if (readyPromise) {
      model.setReady(false);
      readyPromise.then(() => {
        model.setReady(true);
      });
    }

    if (createReportPromiseFunc) {
      model.setReportReady(createReportPromiseFunc);
    }

    // Process the event.
    model.onTriggerEvent(() => {
      const startTime = this.getStartTime();
      const state = model.getState(startTime);

      // Additional doc-level state.
      state['backgrounded'] = this.isBackgrounded() ? 1 : 0;
      state['backgroundedAtStart'] = this.isBackgroundedAtStart() ? 1 : 0;
      state['totalTime'] = Date.now() - startTime;

      // Optionally, element-level state.
      let layoutBox;
      if (opt_element) {
        const resource =
            this.resources_.getResourceForElementOptional(opt_element);
        layoutBox =
            resource ?
              resource.getLayoutBox() :
              Services.viewportForDoc(this.ampdoc).getLayoutRect(opt_element);
        const intersectionRatio = this.getElementVisibility(opt_element);
        const intersectionRect = this.getElementIntersectionRect(opt_element);
        Object.assign(state, {
          'intersectionRatio': intersectionRatio,
          'intersectionRect': JSON.stringify(intersectionRect),
        });

      } else {
        layoutBox = this.getRootLayoutBox();
      }
      model.maybeDispose();

      if (layoutBox) {
        Object.assign(state, {
          'elementX': layoutBox.left,
          'elementY': layoutBox.top,
          'elementWidth': layoutBox.width,
          'elementHeight': layoutBox.height,
        });
      }
      callback(state);
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
      model.unsubscribe(this.observe(opt_element, () => model.update()));
    }

    // Start update.
    model.update();
    return function() {
      model.dispose();
    };
  }

  /**
   * Observes the intersections of the specified element in the viewport.
   * @param {!Element} unusedElement
   * @param {function(number)} unusedListener
   * @return {!UnlistenDef}
   * @protected
   * @abstract
   */
  observe(unusedElement, unusedListener) {}

  /**
   * @param {!Element} unusedElement
   * @return {number}
   * @abstract
   */
  getElementVisibility(unusedElement) {}

  /**
   * @param {!Element} unusedElement
   * @return {?JsonObject}
   * @abstract
   */
  getElementIntersectionRect(unusedElement) {}
}


/**
 * The implementation of `VisibilityManager` for an AMP document. Two
 * distinct modes are supported: the main AMP doc and a in-a-box doc.
 */
export class VisibilityManagerForDoc extends VisibilityManager {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    super(/* parent */ null, ampdoc);

    /** @const @private */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @const @private */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {boolean} */
    this.backgrounded_ = !this.viewer_.isVisible();

    /** @const @private {boolean} */
    this.backgroundedAtStart_ = this.isBackgrounded();

    /**
     * @const
     * @private {!Object<number, {
     *   element: !Element,
     *   intersectionRatio: number,
     *   listeners: !Array<function(number)>
     * }>}
     */
    this.trackedElements_ = map();

    /** @private {?IntersectionObserver|?IntersectionObserverPolyfill} */
    this.intersectionObserver_ = null;

    if (getMode(this.ampdoc.win).runtime == 'inabox') {
      // In-a-box: visibility depends on the InOb.
      const root = this.ampdoc.getRootNode();
      const rootElement = dev().assertElement(
          root.documentElement || root.body || root);
      this.unsubscribe(this.observe(
          rootElement,
          this.setRootVisibility.bind(this)));
    } else {
      // Main document: visibility is based on the viewer.
      this.setRootVisibility(this.viewer_.isVisible() ? 1 : 0);
      this.unsubscribe(this.viewer_.onVisibilityChanged(() => {
        const isVisible = this.viewer_.isVisible();
        if (!isVisible) {
          this.backgrounded_ = true;
        }
        this.setRootVisibility(isVisible ? 1 : 0);
      }));
    }
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
  getRootLayoutBox() {
    // This code is the same for "in-a-box" and standalone doc.
    const root = this.ampdoc.getRootNode();
    const rootElement = dev().assertElement(
        root.documentElement || root.body || root);
    return this.viewport_.getLayoutRect(rootElement);
  }

  /** @override */
  observe(element, listener) {
    this.polyfillAmpElementIfNeeded_(element);

    const id = getElementId(element);
    let trackedElement = this.trackedElements_[id];
    if (!trackedElement) {
      trackedElement = {
        element,
        intersectionRatio: 0,
        intersectionRect: null,
        listeners: [],
      };
      this.trackedElements_[id] = trackedElement;
    } else if (trackedElement.intersectionRatio > 0) {
      // This has already been tracked and the `intersectionRatio` is fresh.
      listener(trackedElement.intersectionRatio);
    }
    trackedElement.listeners.push(listener);
    this.getIntersectionObserver_().observe(element);
    return () => {
      const trackedElement = this.trackedElements_[id];
      if (trackedElement) {
        const index = trackedElement.listeners.indexOf(listener);
        if (index != -1) {
          trackedElement.listeners.splice(index, 1);
        }
        if (trackedElement.listeners.length == 0) {
          this.intersectionObserver_.unobserve(element);
          delete this.trackedElements_[id];
        }
      }
    };
  }

  /** @override */
  getElementVisibility(element) {
    if (this.getRootVisibility() == 0) {
      return 0;
    }
    const id = getElementId(element);
    const trackedElement = this.trackedElements_[id];
    return trackedElement && trackedElement.intersectionRatio || 0;
  }

  getElementIntersectionRect(element) {
    if (this.getElementVisibility(element) <= 0) {
      return null;
    }
    const id = getElementId(element);
    const trackedElement = this.trackedElements_[id];
    if (trackedElement) {
      return /** @type {!JsonObject} */ (trackedElement.intersectionRect);
    }
    return null;
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
    // Tick in the next event loop. That's how native InOb works.
    setTimeout(ticker);
    return intersectionObserverPolyfill;
  }

  /**
   * @param {!Element} element
   * @private
   */
  polyfillAmpElementIfNeeded_(element) {
    const win = this.ampdoc.win;
    if (nativeIntersectionObserverSupported(win)) {
      return;
    }

    // InOb polyfill requires partial AmpElement implementation.
    if (typeof element.getLayoutBox == 'function') {
      return;
    }
    element.getLayoutBox = () => {
      return this.viewport_.getLayoutRect(element);
    };
    element.getOwner = () => null;
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @private
   */
  onIntersectionChanges_(entries) {
    entries.forEach(change => {
      let intersection = change.intersectionRect;
      // IntersectionRect type now changed from ClientRect to DOMRectReadOnly.
      // TODO(@zhouyx): Fix all InOb related type.
      intersection = layoutRectLtwh(Number(intersection.left),
          Number(intersection.top),
          Number(intersection.width),
          Number(intersection.height));
      this.onIntersectionChange_(
          change.target,
          change.intersectionRatio,
          intersection);
    });
  }

  /**
   * @param {!Element} target
   * @param {number} intersectionRatio
   * @param {!../../../src/layout-rect.LayoutRectDef} intersectionRect
   * @private
   */
  onIntersectionChange_(target, intersectionRatio, intersectionRect) {
    intersectionRatio = Math.min(Math.max(intersectionRatio, 0), 1);
    const id = getElementId(target);
    const trackedElement = this.trackedElements_[id];
    if (trackedElement) {
      trackedElement.intersectionRatio = intersectionRatio;
      trackedElement.intersectionRect = intersectionRect;
      for (let i = 0; i < trackedElement.listeners.length; i++) {
        trackedElement.listeners[i](intersectionRatio);
      }
    }
  }
}


/**
 * The implementation of `VisibilityManager` for a FIE embed. This visibility
 * root delegates most of tracking functions to its parent, the ampdoc root.
 */
export class VisibilityManagerForEmbed extends VisibilityManager {
  /**
   * @param {!VisibilityManager} parent
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} embed
   */
  constructor(parent, embed) {
    super(parent, parent.ampdoc);

    /** @const */
    this.embed = embed;

    /** @const @private {boolean} */
    this.backgroundedAtStart_ = this.parent.isBackgrounded();

    this.unsubscribe(this.parent.observe(
        dev().assertElement(embed.host),
        this.setRootVisibility.bind(this)));
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

  /**
   * Gets the layout box of the embedded document. Note that this may be
   * smaller than the size allocated by the host. In that case, the document
   * will be centered, and the unfilled space will not be reflected in this
   * return value.
   * embed.iframe is used to calculate the root layoutbox, since it is more
   * important for the embedded document to know its own size, rather than
   * the size of the host rectangle which it may or may not entirely fill.
   * embed.host is used to calculate the root visibility, however, since
   * that will reflect whether the embedded document is embedded at all.
   * @override
   */
  getRootLayoutBox() {
    const rootElement = dev().assertElement(this.embed.iframe);
    return Services.viewportForDoc(this.ampdoc).getLayoutRect(rootElement);
  }

  /** @override */
  observe(element, listener) {
    return this.parent.observe(element, listener);
  }

  /** @override */
  getElementVisibility(element) {
    if (this.getRootVisibility() == 0) {
      return 0;
    }
    return this.parent.getElementVisibility(element);
  }

  getElementIntersectionRect(element) {
    if (this.getRootVisibility() == 0) {
      return null;
    }
    return this.parent.getElementIntersectionRect(element);
  }

}
