import {rootNodeFor} from '#core/dom';
import {
  layoutPositionRelativeToScrolledViewport,
  layoutRectLtwh,
} from '#core/dom/layout/rect';
import {isArray, isFiniteNumber} from '#core/types';
import {map} from '#core/types/object';

import {Services} from '#service';

import {dev, user} from '#utils/log';

import {getMinOpacity} from './opacity';
import {VisibilityModel} from './visibility-model';

import {getFriendlyIframeEmbedOptional} from '../../../src/iframe-helper';
import {getMode} from '../../../src/mode';
import {getParentWindowFrameElement} from '../../../src/service-helpers';

const TAG = 'amp-analytics/visibility-manager';

const PROP = '__AMP_VIS';
const VISIBILITY_ID_PROP = '__AMP_VIS_ID';

export const DEFAULT_THRESHOLD = [
  0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65,
  0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1,
];

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
 * @param {!Node} rootNode
 * @return {!VisibilityManager}
 */
export function provideVisibilityManager(rootNode) {
  if (!rootNode[PROP]) {
    rootNode[PROP] = createVisibilityManager(rootNode);
  }
  return rootNode[PROP];
}

/**
 * @param {!Node} rootNode
 * @return {!VisibilityManager}
 */
function createVisibilityManager(rootNode) {
  // TODO(#22733): cleanup when ampdoc-fie is launched.
  const ampdoc = Services.ampdoc(rootNode);
  const frame = getParentWindowFrameElement(rootNode);
  const embed = frame && getFriendlyIframeEmbedOptional(frame);
  const frameRootNode = frame && rootNodeFor(frame);
  if (embed && frameRootNode) {
    return new VisibilityManagerForEmbed(
      provideVisibilityManager(frameRootNode),
      embed
    );
  }
  return new VisibilityManagerForDoc(ampdoc);
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

    /** @private {number} */
    this.rootVisibility_ = 0;

    /** @const @private {!Array<!VisibilityModel>}> */
    this.models_ = [];

    /** @private {?Array<!VisibilityManager>} */
    this.children_ = null;

    /** @const @private {!Array<!UnlistenDef>} */
    this.unsubscribe_ = [];

    /** @private {number} Maximum scroll position attained */
    this.maxScrollDepth_ = 0;

    if (this.parent) {
      this.parent.addChild_(this);
    }

    const viewport = Services.viewportForDoc(this.ampdoc);
    viewport.onChanged(() => {
      this.maybeUpdateMaxScrollDepth(viewport.getScrollTop());
    });
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
    this.unsubscribe_.forEach((unsubscribe) => {
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
   * Returns the root's, root's parent's and root's children's
   * lowest opacity value
   * @return {number}
   * @abstract
   */
  getRootMinOpacity() {}

  /**
   * Returns the root's layout rect.
   * @return {!../../../src/layout-rect.LayoutRectDef}
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

  /**
   * Update the maximum amount that the user has scrolled down the page.
   * @param {number} depth
   */
  maybeUpdateMaxScrollDepth(depth) {
    if (depth > this.maxScrollDepth_) {
      this.maxScrollDepth_ = depth;
    }
  }

  /**
   * Gets the maximum amount that the user has scrolled down the page.
   * @return {number} depth
   */
  getMaxScrollDepth() {
    return this.maxScrollDepth_;
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
   * @param {!JsonObject} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!JsonObject)} callback
   * @return {!UnlistenDef}
   */
  listenRoot(spec, readyPromise, createReportPromiseFunc, callback) {
    const calcVisibility = this.getRootVisibility.bind(this);
    return this.createModelAndListen_(
      calcVisibility,
      spec,
      readyPromise,
      createReportPromiseFunc,
      callback
    );
  }

  /**
   * Listens to the visibility events for the specified element and the given
   * visibility spec. The visibility tracking can be deferred until
   * `readyPromise` is resolved, if specified.
   * @param {!Element} element
   * @param {!JsonObject} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!JsonObject)} callback
   * @return {!UnlistenDef}
   */
  listenElement(
    element,
    spec,
    readyPromise,
    createReportPromiseFunc,
    callback
  ) {
    const calcVisibility = this.getElementVisibility.bind(this, element);
    return this.createModelAndListen_(
      calcVisibility,
      spec,
      readyPromise,
      createReportPromiseFunc,
      callback,
      element
    );
  }

  /**
   * Create visibilityModel and listen to visible events.
   * @param {function():number} calcVisibility
   * @param {!JsonObject} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!JsonObject)} callback
   * @param {!Element=} opt_element
   * @return {!UnlistenDef}
   */
  createModelAndListen_(
    calcVisibility,
    spec,
    readyPromise,
    createReportPromiseFunc,
    callback,
    opt_element
  ) {
    if (
      spec['visiblePercentageThresholds'] &&
      spec['visiblePercentageMin'] == undefined &&
      spec['visiblePercentageMax'] == undefined
    ) {
      const unlisteners = [];
      const ranges = spec['visiblePercentageThresholds'];
      if (!ranges || !isArray(ranges)) {
        user().error(TAG, 'invalid visiblePercentageThresholds');
        return () => {};
      }
      for (let i = 0; i < ranges.length; i++) {
        const percents = ranges[i];
        if (!isArray(percents) || percents.length != 2) {
          user().error(
            TAG,
            'visiblePercentageThresholds entry length is not 2'
          );
          continue;
        }
        if (!isFiniteNumber(percents[0]) || !isFiniteNumber(percents[1])) {
          // not valid number
          user().error(
            TAG,
            'visiblePercentageThresholds entry is not valid number'
          );
          continue;
        }
        const min = Number(percents[0]);
        const max = Number(percents[1]);
        // Min and max must be valid percentages. Min may not be more than max.
        // Max is inclusive. Min is usually exclusive, but there are two
        // special cases: if min and max are both 0, or both 100, then both
        // are inclusive. Otherwise it would not be possible to trigger an
        // event on exactly 0% or 100%.
        if (
          min < 0 ||
          max > 100 ||
          min > max ||
          (min == max && min != 100 && max != 0)
        ) {
          user().error(
            TAG,
            'visiblePercentageThresholds entry invalid min/max value'
          );
          continue;
        }
        const newSpec = spec;
        newSpec['visiblePercentageMin'] = min;
        newSpec['visiblePercentageMax'] = max;
        const model = new VisibilityModel(
          newSpec,
          calcVisibility,
          /** @type {?../../../src/service/viewport/viewport-impl.ViewportImpl} */
          (Services.viewportForDoc(this.ampdoc))
        );
        unlisteners.push(
          this.listen_(
            model,
            spec,
            readyPromise,
            createReportPromiseFunc,
            callback,
            opt_element
          )
        );
      }
      return () => {
        unlisteners.forEach((unlistener) => unlistener());
      };
    }
    const model = new VisibilityModel(
      spec,
      calcVisibility,
      /** @type {?../../../src/service/viewport/viewport-impl.ViewportImpl} */
      (Services.viewportForDoc(this.ampdoc))
    );
    return this.listen_(
      model,
      spec,
      readyPromise,
      createReportPromiseFunc,
      callback,
      opt_element
    );
  }

  /**
   * @param {!VisibilityModel} model
   * @param {!JsonObject} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!JsonObject)} callback
   * @param {!Element=} opt_element
   * @return {!UnlistenDef}
   * @private
   */
  listen_(
    model,
    spec,
    readyPromise,
    createReportPromiseFunc,
    callback,
    opt_element
  ) {
    if (createReportPromiseFunc) {
      model.setReportReady(createReportPromiseFunc);
    }

    const viewport = Services.viewportForDoc(this.ampdoc);
    const scrollDepth = viewport.getScrollTop();
    this.maybeUpdateMaxScrollDepth(scrollDepth);

    // Block visibility.
    if (readyPromise) {
      model.setReady(false);
      readyPromise.then(() => {
        model.setReady(true);
        model.maybeSetInitialScrollDepth(scrollDepth);
      });
    } else {
      model.maybeSetInitialScrollDepth(scrollDepth);
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
        state['elementId'] = opt_element.id;
        state['opacity'] = getMinOpacity(opt_element);
        layoutBox = viewport.getLayoutRect(opt_element);
        const intersectionRatio = this.getElementVisibility(opt_element);
        const intersectionRect = this.getElementIntersectionRect(opt_element);
        Object.assign(state, {
          'intersectionRatio': intersectionRatio,
          'intersectionRect': JSON.stringify(intersectionRect),
        });
      } else {
        state['opacity'] = this.getRootMinOpacity();
        state['intersectionRatio'] = this.getRootVisibility();
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
        state['initialScrollDepth'] = layoutPositionRelativeToScrolledViewport(
          layoutBox,
          viewport,
          model.getInitialScrollDepth()
        );
        state['maxScrollDepth'] = layoutPositionRelativeToScrolledViewport(
          layoutBox,
          viewport,
          this.getMaxScrollDepth()
        );
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
    return function () {
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
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {boolean} */
    this.backgrounded_ = !ampdoc.isVisible();

    /** @const @private {boolean} */
    this.backgroundedAtStart_ = this.isBackgrounded();

    /**
     * @const
     * @private {!Object<number, {
     *   element: !Element,
     *   intersectionRatio: number,
     *   isVisible: boolean,
     *   boundingClientRect: ?../../../src/layout-rect.LayoutRectDef,
     *   listeners: !Array<function(number)>
     * }>}
     */
    this.trackedElements_ = map();

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    if (getMode(this.ampdoc.win).runtime == 'inabox') {
      // In-a-box: visibility depends on the InOb.
      const root = this.ampdoc.getRootNode();
      const rootElement = dev().assertElement(
        root.documentElement || root.body || root
      );
      this.unsubscribe(
        this.observe(rootElement, this.setRootVisibility.bind(this))
      );
      // Observe inabox window resize event.
      const resizeListener = () => {
        const id = getElementId(rootElement);
        const trackedRoot = this.trackedElements_[id];
        if (!trackedRoot) {
          return;
        }
        if (
          this.ampdoc.win./*OK*/ innerHeight < 1 ||
          this.ampdoc.win./*OK*/ innerWidth < 1
        ) {
          trackedRoot.isVisible = false;
        } else {
          trackedRoot.isVisible = true;
        }
        this.setRootVisibility(
          trackedRoot.isVisible ? trackedRoot.intersectionRatio : 0
        );
      };
      this.ampdoc.win.addEventListener('resize', resizeListener);

      this.unsubscribe(() => {
        this.ampdoc.win.removeEventListener('resize', resizeListener);
      });
    } else {
      // Main document: visibility is based on the ampdoc.
      this.setRootVisibility(this.ampdoc.isVisible() ? 1 : 0);
      this.unsubscribe(
        this.ampdoc.onVisibilityChanged(() => {
          const isVisible = this.ampdoc.isVisible();
          if (!isVisible) {
            this.backgrounded_ = true;
          }
          this.setRootVisibility(isVisible ? 1 : 0);
        })
      );
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
    return dev().assertNumber(this.ampdoc.getFirstVisibleTime());
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
  getRootMinOpacity() {
    const root = this.ampdoc.getRootNode();
    const rootElement = dev().assertElement(
      root.documentElement || root.body || root
    );
    return getMinOpacity(rootElement);
  }

  /** @override */
  getRootLayoutBox() {
    // This code is the same for "in-a-box" and standalone doc.
    const root = this.ampdoc.getRootNode();
    const rootElement = dev().assertElement(
      root.documentElement || root.body || root
    );
    return this.viewport_.getLayoutRect(rootElement);
  }

  /** @override */
  observe(element, listener) {
    const id = getElementId(element);
    let trackedElement = this.trackedElements_[id];
    if (!trackedElement) {
      trackedElement = {
        element,
        intersectionRatio: 0,
        intersectionRect: null,
        isVisible: false,
        boundingClientRect: null,
        listeners: [],
      };
      this.trackedElements_[id] = trackedElement;
    } else if (
      trackedElement.intersectionRatio > 0 &&
      trackedElement.isVisible
    ) {
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
    return (
      (trackedElement &&
        trackedElement.isVisible &&
        trackedElement.intersectionRatio) ||
      0
    );
  }

  /**
   * Gets the intersection element.
   *
   * @param {!Element} element
   * @return {?JsonObject}
   */
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
   * @return {!IntersectionObserver}
   * @private
   */
  getIntersectionObserver_() {
    if (!this.intersectionObserver_) {
      const {win} = this.ampdoc;
      this.intersectionObserver_ = new win.IntersectionObserver(
        this.onIntersectionChanges_.bind(this),
        {threshold: DEFAULT_THRESHOLD}
      );
    }
    return this.intersectionObserver_;
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @private
   */
  onIntersectionChanges_(entries) {
    entries.forEach((change) => {
      let intersection = change.intersectionRect;
      // IntersectionRect type now changed from ClientRect to DOMRectReadOnly.
      // TODO(@zhouyx): Fix all InOb related type.
      intersection = layoutRectLtwh(
        Number(intersection.left),
        Number(intersection.top),
        Number(intersection.width),
        Number(intersection.height)
      );
      let {boundingClientRect} = change;
      boundingClientRect =
        boundingClientRect &&
        layoutRectLtwh(
          Number(boundingClientRect.left),
          Number(boundingClientRect.top),
          Number(boundingClientRect.width),
          Number(boundingClientRect.height)
        );
      this.onIntersectionChange_(
        change.target,
        change.intersectionRatio,
        intersection,
        boundingClientRect
      );
    });
  }

  /**
   * @param {!Element} target
   * @param {number} intersectionRatio
   * @param {!../../../src/layout-rect.LayoutRectDef} intersectionRect
   * @param {!../../../src/layout-rect.LayoutRectDef} boundingClientRect
   * @private
   */
  onIntersectionChange_(
    target,
    intersectionRatio,
    intersectionRect,
    boundingClientRect
  ) {
    intersectionRatio = Math.min(Math.max(intersectionRatio, 0), 1);
    const id = getElementId(target);
    const trackedElement = this.trackedElements_[id];

    // This is different from the InOb v2 isVisible definition.
    // isVisible here only checks for element size
    let isVisible = true;

    if (boundingClientRect.width < 1 || boundingClientRect.height < 1) {
      // Set isVisible to false when the element is not visible.
      // Use < 1 because the width/height can
      // be a double value on high resolution screen
      isVisible = false;
    }
    if (trackedElement) {
      trackedElement.isVisible = isVisible;
      trackedElement.intersectionRatio = intersectionRatio;
      trackedElement.intersectionRect = intersectionRect;
      trackedElement.boundingClientRect = boundingClientRect;
      for (let i = 0; i < trackedElement.listeners.length; i++) {
        trackedElement.listeners[i](
          trackedElement.isVisible ? intersectionRatio : 0
        );
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

    this.unsubscribe(
      this.parent.observe(
        dev().assertElement(embed.host),
        this.setRootVisibility.bind(this)
      )
    );
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
  getRootMinOpacity() {
    const rootElement = dev().assertElement(this.embed.iframe);
    return getMinOpacity(rootElement);
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
   * the visibility of the host element directly determines the embedded
   * document's visibility.
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

  /**
   * Returns intersecting element.
   * @override
   */
  getElementIntersectionRect(element) {
    if (this.getRootVisibility() == 0) {
      return null;
    }
    return this.parent.getElementIntersectionRect(element);
  }
}
