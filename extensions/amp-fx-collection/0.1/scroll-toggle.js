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
import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';
import {devAssert, user} from '../../../src/log';
import {once} from '../../../src/utils/function';
import {px, setImportantStyles, setStyle} from '../../../src/style';

const TAG = 'amp-fx';

/** @enum {string} */
export const ScrollTogglePosition = {
  TOP: 'top',
  BOTTOM: 'bottom',
};

// The following constants match the Google SERP viewer's.
// See go/amp-viewer-scroll-thresholds internally.
export const HEIGHT_PX = 36;
export const RETURN_THRESHOLD_PX = 20;
export const ANIMATION_THRESHOLD_PX = 80;
export const ANIMATION_CURVE = 'ease';
export const ANIMATION_DURATION_MS = 300;


/**
 * Dispatches a signal when an element is supposed to be toggled on scroll.
 * @implements {../../../src/service.Disposable}
 */
export class ScrollToggleDispatch {

  /** @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {

    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {function()} */
    this.initOnce_ = once(() => this.init_());

    /** @private {?Observable<boolean>} */
    this.observable_ = new Observable();

    /** @private {?UnlistenDef} */
    this.unlistener_ = null;

    /**
     * The last scroll position at which the header was shown or hidden.
     * @private {number}
     */
    this.baseScrollTop_ = 0;

    /** @private {number} */
    this.lastScrollTop_ = 0;

    /** @private {boolean} */
    this.isShown_ = true;

    /** @private {boolean} */
    this.isEnabled_ = false;
  }

  /** @param {function(boolean)} handler Takes whether the element is shown. */
  observe(handler) {
    this.observable_.add(handler);
    this.initOnce_();
  }

  /** @private */
  init_() {
    devAssert(!this.isEnabled_);

    const viewport = Services.viewportForDoc(this.ampdoc_);
    this.isEnabled_ = true;
    this.unlistener_ = viewport.onScroll(() => {
      if (!this.isEnabled_) {
        return;
      }
      this.onScroll_(viewport.getScrollTop());
    });
  }

  /**
   * Handles scroll events from the viewport service.
   * The logic here matches the Google SERP viewer's.
   * See go/amp-viewer-scroll internally.
   * @param {number} scrollTop
   * @private
   */
  onScroll_(scrollTop) {
    this.lastScrollTop_ = scrollTop;

    const delta = this.lastScrollTop_ - this.baseScrollTop_;

    // If we are scrolling in the direction that doesn't change our
    // header status, update the base scroll position.
    if ((!this.isShown_ && delta > 0) ||
        (this.isShown_ && delta < 0)) {
      this.baseScrollTop_ = this.lastScrollTop_;
    }

    if (!this.isShown_ &&
        this.lastScrollTop_ <= HEIGHT_PX) {
      // If we reached the top, then we need to immediately animate
      // the target back in irrespective of our current animation
      // state.
      this.toggle_(true);
      this.baseScrollTop_ = this.lastScrollTop_;
      return;
    }
    if (!this.isShown_ &&
        delta < -RETURN_THRESHOLD_PX) {
      // If we scrolled up enough up to show the target again, do so.
      this.toggle_(true);
      this.baseScrollTop_ = this.lastScrollTop_;
      return;
    }
    if (this.isShown_ &&
        delta > ANIMATION_THRESHOLD_PX) {
      // If we scrolled down enough to animate the target out, do so.
      this.toggle_(false);
      this.baseScrollTop_ = this.lastScrollTop_;
    }
  }

  /**
   * @param {boolean} isShown
   * @private
   */
  toggle_(isShown) {
    if (!this.isEnabled_) {
      return;
    }
    if (this.isShown_ == isShown) {
      return;
    }
    this.isShown_ = isShown;
    devAssert(this.observable_).fire(isShown);
  }

  /** @override */
  dispose() {
    if (!this.isEnabled_) {
      return;
    }
    if (this.unlistener_) {
      this.unlistener_();
    }
    this.isEnabled_ = false;
    this.observable_ = null; // GC
    this.unlistener_ = null; // GC
  }
}

const withAmpFxType = type => `with amp-fx=${type}`;

/**
 * MUST be done inside mutate phase.
 * @param {!Element} element
 * @param {number} offset
 */
export function scrollToggleFloatIn(element, offset) {
  setImportantStyles(element, {
    'transition': `transform ${ANIMATION_DURATION_MS}ms ${ANIMATION_CURVE}`,
    'transform': `translate(0, ${px(offset)})`,
  });
}

/**
 * MUST be done inside measure phase.
 * @param {!Element} element
 * @param {boolean} isShown
 * @param {!ScrollTogglePosition} position
 * @return {number}
 */
export function getScrollToggleFloatInOffset(element, isShown, position) {
  if (isShown) {
    return 0;
  }
  const offset = element./*OK*/getBoundingClientRect().height;
  if (position == ScrollTogglePosition.TOP) {
    return -offset;
  }
  return offset;
}

/**
 * @param {!Element} element
 * @param {string} type
 * @param {!Object<string, string>} computedStyle
 * @return {boolean}
 */
export function assertValidScrollToggleElement(element, type, computedStyle) {
  const suffix = withAmpFxType(type);
  return (
    assertStyleOrWarn(computedStyle, 'overflow', 'hidden', element, suffix) &&
    assertStyleOrWarn(computedStyle, 'position', 'fixed', element, suffix));
}

/**
 * @param {!Element} element
 * @param {string} type
 * @param {!Object<string, string>} computedStyle
 * @return {?ScrollTogglePosition}
 */
export function getScrollTogglePosition(element, type, computedStyle) {
  const position = type.replace(/^float\-in\-([^\s]+)$/, '$1');

  devAssert(position == 'top' || position == 'bottom');

  // naming convention win:
  // position `top` should have `top: 0` and `bottom` should have `bottom: 0`
  if (!assertStyleOrWarn(
      computedStyle, position, px(0), element, withAmpFxType(type))) {
    return null;
  }

  return /** @type {!ScrollTogglePosition} */ (position);
}


/**
 * @param {!Element} element
 * @param {boolean} isShown
 * @param {!ScrollTogglePosition} position
 */
function scrollToggle(element, isShown, position) {
  let offset = 0;
  Services.resourcesForDoc(element).measureMutateElement(element, () => {
    offset = getScrollToggleFloatInOffset(element, isShown, position);
  }, () => {
    scrollToggleFloatIn(element, offset);
  });
}

/**
 * MUST be done inside mutate phase.
 * @param {!ScrollToggleDispatch} dispatch
 * @param {!Element} element
 * @param {!ScrollTogglePosition} position
 */
export function installScrollToggleFloatIn(dispatch, element, position) {
  const viewport = Services.viewportForDoc(element);

  if (viewport.getPaddingTop() <= 0) {
    dispatch.observe(isShown => {
      scrollToggle(element, isShown, position);
    });
  }

  let lastEvent = 0;

  // Use viewport's "padding top" as a proxy signal for whether there's a
  // viewer header displayed. If displayed, we display float-in-* elements as
  // well.
  viewport.setFixedElementMeasurer(element,
      (afterAnimation, prevPaddingTop, paddingTop) => {
        const curEvent = ++lastEvent;

        const resources = Services.resourcesForDoc(element);
        const isShown = isShownPerViewportPaddingTop(paddingTop);

        // Disable scroll dispatch to rely on viewport instead.
        if (isShown) {
          dispatch.dispose();
        }

        (isShown ? Promise.resolve() : afterAnimation).then(() => {
          resources.mutateElement(element, () => {
            if (lastEvent != curEvent) {
              return;
            }
            setVisibilityStyles(element, isShown);
          });
        });

        const {top, bottom, animOffset} = measureFloatInFromViewport(
            element, position, prevPaddingTop, paddingTop);

        resources.mutateElement(element, () => {
          if (top !== undefined) {
            setStyle(element, 'top', px(top));
          }
          if (bottom !== undefined) {
            setStyle(element, 'bottom', px(bottom));
          }
        });

        return animOffset;
      });
}

// TODO(alanorozco): Use the following for scroll-dispatched transition.
/**
 * MUST be done inside mutate phase.
 * @param {!Element} element
 * @param {boolean} isShown
 */
function setVisibilityStyles(element, isShown) {
  setImportantStyles(element, {
    'pointer-events': isShown ? '' : 'none',
    'opacity': isShown ? '' : 0,
  });
}

/**
 * MUST be done inside measure phase.
 * @param {!Element} element
 * @param {!ScrollTogglePosition} position
 * @param {number} prevPaddingTop
 * @param {number} paddingTop
 * @return {{
 *   top: (number|undefined),
 *   bottom: (number|undefined),
 *   animOffset: number,
 * }}
 */
function measureFloatInFromViewport(
  element, position, prevPaddingTop, paddingTop) {

  const isShown = isShownPerViewportPaddingTop(paddingTop);
  const {height} = element./*OK*/getBoundingClientRect();

  if (position == ScrollTogglePosition.TOP) {
    if (isShown) {
      return {top: paddingTop, animOffset: -(height + paddingTop)};
    }
    return {top: -height, animOffset: prevPaddingTop + height};
  }

  if (isShown) {
    return {bottom: 0, animOffset: height};
  }
  return {bottom: -height, animOffset: -height};
}

/**
 * @param {!Object<string, string>} computed
 * @param {string} prop
 * @param {string} expected
 * @param {!Element} element
 * @param {string=} opt_suffix
 * @return {boolean}
 */
function assertStyleOrWarn(computed, prop, expected, element, opt_suffix) {
  if (computed[prop] == expected) {
    return true;
  }
  const elementSuffix = opt_suffix ? ` ${opt_suffix}` : '';
  user().warn(TAG,
      'Element%s must have `%s: %s` style. %s',
      elementSuffix, prop, expected, element);
  return false;
}

/**
 * Use viewport's "padding top" as a proxy signal for whether an element should
 * be displayed on toggle. If the viewer's header is displayed, then this
 * returns true.
 * @param {number} paddingTop
 * @return {boolean}
 */
function isShownPerViewportPaddingTop(paddingTop) {
  return paddingTop > 0;
}
