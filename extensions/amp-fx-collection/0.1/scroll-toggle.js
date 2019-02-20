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
import {devAssert, userAssert} from '../../../src/log';
import {isEnumValue} from '../../../src/types';
import {once} from '../../../src/utils/function';
import {px, setImportantStyles} from '../../../src/style';

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


/** Dispatches a signal when an element is supposed to be toggled on scroll. */
export class ScrollToggleDispatcher {

  /** @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {

    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!Observable<boolean>} */
    this.observable_ = new Observable();

    /** @private @const {function()} */
    this.initOnce_ = once(() => this.init_());

    /**
     * The last scroll position at which the header was shown or hidden.
     * @private {number}
     */
    this.baseScrollTop_ = 0;

    /** @private {number} */
    this.lastScrollTop_ = 0;

    /** @private {boolean} */
    this.isShown_ = true;
  }

  /** @param {function(boolean)} handler Takes whether the element is shown. */
  observe(handler) {
    this.observable_.add(handler);
    this.initOnce_();
  }

  /** @private */
  init_() {
    const viewport = Services.viewportForDoc(this.ampdoc_);
    viewport.onScroll(() => {
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
    if (this.isShown_ == isShown) {
      return;
    }
    this.isShown_ = isShown;
    this.observable_.fire(isShown);
  }
}

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
 * @param {!Object<string, string>} computedStyle
 * @param {!Element} element
 */
export function userAsertValidScrollToggleElement(computedStyle, element) {
  userAssertComputedStyle(computedStyle, 'overflow', 'hidden', element);
  userAssertComputedStyle(computedStyle, 'position', 'fixed', element);
}

/**
 * @param {!Object<string, string>} computedStyle
 * @param {!Element} element
 * @return {!ScrollTogglePosition}
 */
export function getScrollTogglePosition(computedStyle, element) {
  const attr = devAssert(element.getAttribute('amp-fx'));
  const position = /** @type {!ScrollTogglePosition} */ (
    attr.replace(/^.*float\-in\-([^\s]+).*$/, '$1'));

  if (!isEnumValue(ScrollTogglePosition, position)) {
    userAssert(false, // not asserting direclty since elementShorthand is costly
        'Position must be one of [top, bottom] [%s]',
        elementShorthand(element));
  }

  if (position == ScrollTogglePosition.TOP) {
    userAssertComputedStyle(computedStyle, 'top', px(0), element,
        `with position="${ScrollTogglePosition.TOP}"`);
  } else {
    userAssertComputedStyle(computedStyle, 'bottom', px(0), element,
        `with position="${ScrollTogglePosition.BOTTOM}"`);
  }

  return position;
}

/**
 * MUST be done inside mutate phase.
 * @param {!Element} element
 */
export function installScrollToggleStyles(element) {
  setImportantStyles(element, {'will-change': 'transform'});
}

/**
 * @param {!Object<string, string>} computed
 * @param {string} prop
 * @param {string} expected
 * @param {!Element} element
 * @param {string=} opt_suffix
 */
function userAssertComputedStyle(
  computed, prop, expected, element, opt_suffix) {

  if (computed[prop] == expected) {
    return;
  }
  const suffix = opt_suffix ? ` ${opt_suffix}` : '';
  userAssert(false, // not asserting direclty since elementShorthand is costly
      `FX element must have \`${prop}: ${expected}\` style ` +
      `[${elementShorthand(element)}]${suffix}.`);
}


/**
 * Creates a human-readable shorthand for an element similar to a CSS selector.
 * e.g.
 * ```
 * elementShorthand(anElementWithId);
 *   // gives '#my-element-id'
 *
 * elementShorthand(divWithClassInAnotherDiv);
 *   // gives 'div > div.my-class'
 *
 * elementShorthand(divWithMultipleClassesInAnotherDiv);
 *   // gives 'div > div.my-class...'
 *
 * elementShorthand(firstChildH1InHeaderNoClassesOrIds);
 *   // gives 'header > h1:first-child'
 *
 * elementShorthand(onlyDivInBodyWithouIdOrClass);
 *   // gives 'body:last-child > div'
 *
 * elementShorthand(detachedDivOnlyInTestsProlly);
 *   // gives 'div (detached)'
 * ```
 * @param {!Element} element
 * @param {number=} depth
 * @return {string}
 */
function elementShorthand(element, depth = 0) {
  const {tagName, id, classList, parentElement} = element;
  if (id) {
    return `#${id}`;
  }
  const tagNameLower = tagName.toLowerCase();
  let suffix = tagNameLower;
  if (classList.length > 0) {
    const ellipsis = classList.length > 1 ? '...' : '';
    suffix += `.${classList[0]}${ellipsis}`;
  }
  if (!parentElement) {
    return `${suffix} (detached)`;
  }
  const {firstElementChild, lastElementChild} = parentElement;
  if (!(element == firstElementChild && element == lastElementChild)) {
    if (element == firstElementChild) {
      suffix += ':first-child';
    } else if (element == lastElementChild) {
      suffix += ':last-child';
    }
  }
  if (depth > 0) {
    return suffix;
  }
  return `${elementShorthand(parentElement, depth + 1)} > ${suffix}`;
}
