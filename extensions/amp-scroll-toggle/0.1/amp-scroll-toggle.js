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

import {Layout} from '../../../src/layout';
import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';
import {computedStyle, px, setImportantStyles} from '../../../src/style';
import {dev, userAssert} from '../../../src/log';
import {getElementServiceForDoc} from '../../../src/element-service';
import {isEnumValue} from '../../../src/types';
import {once} from '../../../src/utils/function';

const TAG = 'amp-scroll-toggle';
const SERVICE = 'scroll-toggle-dispatcher';

/** @enum {string} */
const Position = {
  TOP: 'top',
  BOTTOM: 'bottom',
};

// The following constants match the Google SERP viewer's.
// See go/amp-viewer-scroll-thresholds internally.
const HEIGHT_PX = 36;
const RETURN_THRESHOLD_PX = 20;
const ANIMATION_THRESHOLD_PX = 80;
const ANIMATION_CURVE = 'ease';
const ANIMATION_DURATION_MS = 300;

/**
 * @param {!Object<string, string>} computed
 * @param {string} prop
 * @param {string} expected
 * @param {string} targetId
 * @param {string=} opt_sufix
 */
function userAssertComputedStyle(
  computed, prop, expected, targetId, opt_sufix) {

  userAssert(computed[prop] == expected,
      `Target element must have \`${prop}: ${expected}\` style, target ` +
      `#${targetId}${opt_sufix ? ` ${opt_sufix}` : ''}.`);
}

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

  /** @param {function(boolean)} handler */
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


export class AmpScrollToggle extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.target_ = null;

    /** @private {!Position} */
    this.position_ = Position.TOP;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    const {element} = this;
    const targetId = userAssert(element.getAttribute('target'),
        'target attribute is required for `amp-scroll-toggle`.');

    const positionAttr = 'position';

    if (element.hasAttribute(positionAttr)) {
      const position = element.getAttribute(positionAttr).toLowerCase();
      userAssert(isEnumValue(Position, position),
          'Position must be one of [top, bottom]');
      this.position_ = position;
    }

    this.target_ = userAssert(
        element.ownerDocument.getElementById(targetId),
        `Target by id absent: ${targetId}`);

    this.measureElement(() => {
      const target = dev().assertElement(this.target_);
      const computed = computedStyle(this.win, target);

      userAssertComputedStyle(computed, 'overflow', 'hidden', targetId);
      userAssertComputedStyle(computed, 'position', 'fixed', targetId);

      if (this.position_ == Position.TOP) {
        userAssertComputedStyle(computed, 'top', px(0), targetId,
            `with position="${Position.TOP}"`);
      } else {
        userAssertComputedStyle(computed, 'bottom', px(0), targetId,
            `with position="${Position.BOTTOM}"`);
      }

      scrollDispatcherForDoc(element).then(dispatcher => {
        dispatcher.observe(isShown => this.toggle_(isShown));
      });
    });
  }

  /**
   * @param {boolean} isShown
   * @private
   */
  toggle_(isShown) {
    const target = dev().assertElement(this.target_);

    let offset = 0;

    this.measureMutateElement(() => {
      if (isShown) {
        return;
      }
      offset = target./*OK*/getBoundingClientRect().height;
      if (this.position_ == Position.TOP) {
        offset *= -1;
      }
    }, () => {
      setImportantStyles(target, {
        'transition': `transform ${ANIMATION_DURATION_MS}ms ${ANIMATION_CURVE}`,
        'transform': `translate(0, ${px(offset)})`,
      });
    });
  }

}

/**
 * @param {!Element} element
 * @return {!Promise<?ScrollToggleDispatcher>}
 */
function scrollDispatcherForDoc(element) {
  return /** @type {!Promise<?ScrollToggleDispatcher>} */ (
    getElementServiceForDoc(element, SERVICE, TAG));
}

AMP.extension(TAG, 0.1, AMP => {
  AMP.registerElement(TAG, AmpScrollToggle);
  AMP.registerServiceForDoc(SERVICE, ScrollToggleDispatcher);
});
