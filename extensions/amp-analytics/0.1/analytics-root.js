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

import {ScrollManager} from './scroll-manager';
import {Services} from '../../../src/services';
import {
  closestAncestorElementBySelector,
  getDataParamsFromAttributes,
  matches,
  scopedQuerySelector,
} from '../../../src/dom';
import {dev, user, userAssert} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isArray} from '../../../src/core/types/array';
import {isExperimentOn} from '../../../src/experiments';
import {layoutRectLtwh} from '../../../src/layout-rect';
import {map} from '../../../src/utils/object';
import {provideVisibilityManager} from './visibility-manager';
import {tryResolve} from '../../../src/utils/promise';
import {whenContentIniLoad} from '../../../src/ini-load';

const TAG = 'amp-analytics/analytics-root';
const VARIABLE_DATA_ATTRIBUTE_KEY = /^vars(.+)/;

/**
 * An analytics root. Analytics can be scoped to either ampdoc, embed or
 * an arbitrary AMP element.
 *
 * TODO(#22733): merge analytics root properties into ampdoc.
 *
 * @implements {../../../src/service.Disposable}
 * @abstract
 */
export class AnalyticsRoot {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const */
    this.trackers_ = map();

    /** @private {?./visibility-manager.VisibilityManager} */
    this.visibilityManager_ = null;

    /** @private {?./scroll-manager.ScrollManager} */
    this.scrollManager_ = null;
  }

  /** @override */
  dispose() {
    for (const k in this.trackers_) {
      this.trackers_[k].dispose();
      delete this.trackers_[k];
    }
    if (this.visibilityManager_) {
      this.visibilityManager_.dispose();
    }
    if (this.scrollManager_) {
      this.scrollManager_.dispose();
    }
  }

  /**
   * Returns the type of the tracker.
   * @return {string}
   * @abstract
   */
  getType() {}

  /**
   * The root node the analytics is scoped to.
   *
   * @return {!Document|!ShadowRoot}
   * @abstract
   */
  getRoot() {}

  /**
   * The viewer of analytics root
   * @return {!../../../src/service/viewer-interface.ViewerInterface}
   */
  getViewer() {
    return Services.viewerForDoc(this.ampdoc);
  }

  /**
   * The root element within the analytics root.
   *
   * @return {!Element}
   */
  getRootElement() {
    const root = this.getRoot();
    // In the case of a shadow doc, its host will be used as
    // a refrence point
    return dev().assertElement(
      root.host || root.documentElement || root.body || root
    );
  }

  /**
   * The host element of the analytics root.
   *
   * @return {?Element}
   * @abstract
   */
  getHostElement() {}

  /**
   * The signals for the root.
   *
   * @return {!../../../src/utils/signals.Signals}
   * @abstract
   */
  signals() {}

  /**
   * Whether this analytics root contains the specified node.
   *
   * @param {!Node} node
   * @return {boolean}
   */
  contains(node) {
    return this.getRoot().contains(node);
  }

  /**
   * Returns the element with the specified ID in the scope of this root.
   *
   * @param {string} unusedId
   * @return {?Element}
   * @abstract
   */
  getElementById(unusedId) {}

  /**
   * Returns the tracker for the specified name and list of allowed types.
   *
   * @param {string} name
   * @param {!Object<string, typeof ./events.EventTracker>} allowlist
   * @return {?./events.EventTracker}
   */
  getTrackerForAllowlist(name, allowlist) {
    const trackerProfile = allowlist[name];
    if (trackerProfile) {
      return this.getTracker(name, trackerProfile);
    }
    return null;
  }

  /**
   * Returns the tracker for the specified name and type. If the tracker
   * has not been requested before, it will be created.
   *
   * @param {string} name
   * @param {typeof ./events.CustomEventTracker|typeof ./events.ClickEventTracker|typeof ./events.ScrollEventTracker|typeof ./events.SignalTracker|typeof ./events.IniLoadTracker|typeof ./events.VideoEventTracker|typeof ./events.VideoEventTracker|typeof ./events.VisibilityTracker|typeof ./events.AmpStoryEventTracker} klass
   * @return {!./events.EventTracker}
   */
  getTracker(name, klass) {
    let tracker = this.trackers_[name];
    if (!tracker) {
      tracker = new klass(this);
      this.trackers_[name] = tracker;
    }
    return tracker;
  }

  /**
   * Returns the tracker for the specified name or `null`.
   * @param {string} name
   * @return {?./events.EventTracker}
   */
  getTrackerOptional(name) {
    return this.trackers_[name] || null;
  }

  /**
   * Searches the element that matches the selector within the scope of the
   * analytics root in relationship to the specified context node.
   *
   * @param {!Element} context
   * @param {string} selector DOM query selector.
   * @param {?string=} selectionMethod Allowed values are `null`,
   *   `'closest'` and `'scope'`.
   * @return {!Promise<!Element>} Element corresponding to the selector.
   */
  getElement(context, selector, selectionMethod = null) {
    // Special case selectors. The selection method is irrelavant.
    // And no need to wait for document ready.
    if (selector == ':root') {
      return tryResolve(() => this.getRootElement());
    }
    if (selector == ':host') {
      return new Promise((resolve) => {
        resolve(
          user().assertElement(
            this.getHostElement(),
            `Element "${selector}" not found`
          )
        );
      });
    }

    // Wait for document-ready to avoid false missed searches
    return this.ampdoc.whenReady().then(() => {
      let found;
      let result = null;
      // Query search based on the selection method.
      try {
        if (selectionMethod == 'scope') {
          found = scopedQuerySelector(context, selector);
        } else if (selectionMethod == 'closest') {
          found = closestAncestorElementBySelector(context, selector);
        } else {
          found = this.getRoot().querySelector(selector);
        }
      } catch (e) {
        userAssert(false, `Invalid query selector ${selector}`);
      }

      // DOM search can "look" outside the boundaries of the root, thus make
      // sure the result is contained.
      if (found && this.contains(found)) {
        result = found;
      }
      return user().assertElement(result, `Element "${selector}" not found`);
    });
  }

  /**
   * @param {!Array<string>} selectors Array of DOM query selectors.
   * @return {!Promise<!Array<!Element>>} Element corresponding to the selector.
   */
  getElementsByQuerySelectorAll_(selectors) {
    // Wait for document-ready to avoid false missed searches
    return this.ampdoc.whenReady().then(() => {
      let elements = [];
      for (let i = 0; i < selectors.length; i++) {
        let nodeList;
        let elementArray = [];
        const selector = selectors[i];
        try {
          nodeList = this.getRoot().querySelectorAll(selector);
        } catch (e) {
          userAssert(false, `Invalid query selector ${selector}`);
        }
        for (let j = 0; j < nodeList.length; j++) {
          if (this.contains(nodeList[j])) {
            elementArray.push(nodeList[j]);
          }
        }
        elementArray = this.getDataVarsElements_(elementArray, selector);
        userAssert(elementArray.length, `Element "${selector}" not found`);
        elements = elements.concat(elementArray);
      }
      // Return unique
      return elements.filter(
        (element, index) => elements.indexOf(element) === index
      );
    });
  }

  /**
   * Return all elements that have a data-vars attribute.
   * @param {!Array<!Element>} elementArray
   * @param {string} selector
   * @return {!Array<!Element>}
   */
  getDataVarsElements_(elementArray, selector) {
    let removedCount = 0;
    const dataVarsArray = [];
    for (let i = 0; i < elementArray.length; i++) {
      const dataVarKeys = Object.keys(
        getDataParamsFromAttributes(
          elementArray[i],
          /* computeParamNameFunc */ undefined,
          VARIABLE_DATA_ATTRIBUTE_KEY
        )
      );
      if (dataVarKeys.length) {
        dataVarsArray.push(elementArray[i]);
      } else {
        removedCount++;
      }
    }
    if (removedCount) {
      user().warn(
        TAG,
        '%s element(s) ommited from selector "%s"' +
          ' because no data-vars-* attribute was found.',
        removedCount,
        selector
      );
    }
    return dataVarsArray;
  }

  /**
   * Searches the AMP element that matches the selector within the scope of the
   * analytics root in relationship to the specified context node.
   *
   * @param {!Element} context
   * @param {string} selector DOM query selector.
   * @param {?string=} selectionMethod Allowed values are `null`,
   *   `'closest'` and `'scope'`.
   * @return {!Promise<!AmpElement>} AMP element corresponding to the selector if found.
   */
  getAmpElement(context, selector, selectionMethod) {
    return this.getElement(context, selector, selectionMethod).then(
      (element) => {
        this.verifyAmpElements_([element], selector);
        return element;
      }
    );
  }

  /**
   * Searches for the element(s) that matches the selector
   * within the scope of the analytics root in relationship to
   * the specified context node.
   *
   * @param {!Element} context
   * @param {!Array<string>|string} selectors DOM query selector(s).
   * @param {?string=} selectionMethod Allowed values are `null`,
   *   `'closest'` and `'scope'`.
   * @return {!Promise<!Array<!Element>>} Array of elements corresponding to the selector if found.
   */
  getElements(context, selectors, selectionMethod) {
    if (
      isExperimentOn(this.ampdoc.win, 'visibility-trigger-improvements') &&
      isArray(selectors)
    ) {
      userAssert(
        !selectionMethod,
        'Cannot have selectionMethod %s defined with an array selector.',
        selectionMethod
      );
      return this.getElementsByQuerySelectorAll_(
        /** @type {!Array<string>} */ (selectors)
      );
    }
    return this.getElement(
      context,
      /** @type {string} */ (selectors),
      selectionMethod
    ).then((element) => [element]);
  }

  /**
   * @param {!Array<Element>} elements
   * @param {string} selector
   */
  verifyAmpElements_(elements, selector) {
    for (let i = 0; i < elements.length; i++) {
      userAssert(
        elements[i].classList.contains('i-amphtml-element'),
        'Element "%s" is required to be an AMP element',
        selector
      );
    }
  }

  /**
   * Creates listener-filter for DOM events to check against the specified
   * selector. If the node (or its ancestors) match the selector the listener
   * will be called.
   *
   * @param {function(!Element, !Event)} listener The first argument is the
   *   matched target node and the second is the original event.
   * @param {!Element} context
   * @param {string} selector DOM query selector.
   * @param {?string=} selectionMethod Allowed values are `null`,
   *   `'closest'` and `'scope'`.
   * @return {function(!Event)}
   */
  createSelectiveListener(listener, context, selector, selectionMethod = null) {
    return (event) => {
      if (selector == ':host') {
        // `:host` is not reachable via selective listener b/c event path
        // cannot be retargeted across the boundary of the embed.
        return;
      }

      // Navigate up the DOM tree to find the actual target.
      const rootElement = this.getRootElement();
      const isSelectAny = selector == '*';
      const isSelectRoot = selector == ':root';
      let {target} = event;
      while (target) {
        // Target must be contained by this root.
        if (!this.contains(target)) {
          break;
        }
        // `:scope` context must contain the target.
        if (
          selectionMethod == 'scope' &&
          !isSelectRoot &&
          !context.contains(target)
        ) {
          break;
        }
        // `closest()` target must contain the conext.
        if (selectionMethod == 'closest' && !target.contains(context)) {
          // However, the search must continue!
          target = target.parentElement;
          continue;
        }

        // Check if the target matches the selector.
        if (
          isSelectAny ||
          (isSelectRoot && target == rootElement) ||
          tryMatches_(target, selector)
        ) {
          listener(target, event);
          // Don't fire the event multiple times even if the more than one
          // ancestor matches the selector.
          break;
        }

        target = target.parentElement;
      }
    };
  }

  /**
   * Returns the promise that will be resolved as soon as the elements within
   * the root have been loaded inside the first viewport of the root.
   * @return {!Promise}
   * @abstract
   */
  whenIniLoaded() {}

  /**
   * Returns the visibility root corresponding to this analytics root (ampdoc
   * or embed). The visibility root is created lazily as needed and takes
   * care of all visibility tracking functions.
   * @return {!./visibility-manager.VisibilityManager}
   */
  getVisibilityManager() {
    if (!this.visibilityManager_) {
      this.visibilityManager_ = provideVisibilityManager(this.getRoot());
    }
    return this.visibilityManager_;
  }

  /**
   *  Returns the Scroll Managet corresponding to this analytics root.
   * The Scroll Manager is created lazily as needed, and will handle
   * calling all handlers for a scroll event.
   * @return {!./scroll-manager.ScrollManager}
   */
  getScrollManager() {
    // TODO (zhouyx@): Disallow scroll trigger with host API
    if (!this.scrollManager_) {
      this.scrollManager_ = new ScrollManager(this);
    }

    return this.scrollManager_;
  }
}

/**
 * The implementation of the analytics root for an ampdoc.
 */
export class AmpdocAnalyticsRoot extends AnalyticsRoot {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    super(ampdoc);
  }

  /** @override */
  getType() {
    return 'ampdoc';
  }

  /** @override */
  getRoot() {
    return this.ampdoc.getRootNode();
  }

  /** @override */
  getHostElement() {
    // ampdoc is always the root of everything - no host.
    return null;
  }

  /** @override */
  signals() {
    return this.ampdoc.signals();
  }

  /** @override */
  getElementById(id) {
    return this.ampdoc.getElementById(id);
  }

  /** @override */
  whenIniLoaded() {
    const viewport = Services.viewportForDoc(this.ampdoc);
    let rect;
    if (getMode(this.ampdoc.win).runtime == 'inabox') {
      // TODO(dvoytenko, #7971): This is currently addresses incorrect position
      // calculations in a in-a-box viewport where all elements are offset
      // to the bottom of the embed. The current approach, even if fixed, still
      // creates a significant probability of risk condition.
      // Once address, we can simply switch to the 0/0 approach in the `else`
      // clause.
      rect = viewport.getLayoutRect(this.getRootElement());
    } else {
      const size = viewport.getSize();
      rect = layoutRectLtwh(0, 0, size.width, size.height);
    }
    return whenContentIniLoad(this.ampdoc, this.ampdoc.win, rect);
  }
}

/**
 * The implementation of the analytics root for FIE.
 * TODO(#22733): merge into AnalyticsRoot once ampdoc-fie is launched.
 */
export class EmbedAnalyticsRoot extends AnalyticsRoot {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} embed
   */
  constructor(ampdoc, embed) {
    super(ampdoc);
    /** @const */
    this.embed = embed;
  }

  /** @override */
  getType() {
    return 'embed';
  }

  /** @override */
  getRoot() {
    return this.embed.win.document;
  }

  /** @override */
  getHostElement() {
    return this.embed.iframe;
  }

  /** @override */
  signals() {
    return this.embed.signals();
  }

  /** @override */
  getElementById(id) {
    return this.embed.win.document.getElementById(id);
  }

  /** @override */
  whenIniLoaded() {
    return this.embed.whenIniLoaded();
  }
}

/**
 * @param  {!Element} el
 * @param  {string} selector
 * @return {boolean}
 */
function tryMatches_(el, selector) {
  try {
    return matches(el, selector);
  } catch (e) {
    user().error(TAG, 'Bad query selector.', selector, e);
    return false;
  }
}
