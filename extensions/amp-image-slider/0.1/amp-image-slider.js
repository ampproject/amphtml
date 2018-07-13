/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Animation} from '../../../src/animation';
import {CSS} from '../../../build/amp-image-slider-0.1.css';
import {bezierCurve} from '../../../src/curve';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listen} from '../../../src/event-helper';
import {map} from '../../../src/utils/object';
import {numeric} from '../../../src/transition';
import {setStyle} from '../../../src/style';
import {user} from '../../../src/log';

// event-helper.js -> listen; option: passive = true
// mount both mouse & touch listener ()
// Test: mainly describes.integration
// Visual diffing tests

// Wrap <a> anchor around amp-image
// This is actually creating some trouble with gesture

// this.mutateElement(callback), in which move children

// TODO(kqian): fix gesture collision between drag mouseup and click to move
export class AmpImageSlider extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.isMobile_ = /Android|iPhone|iPad|iPod/i.test(this.win.navigator.userAgent);

    /** @private {boolean} */
    this.isHoverSlider_ = (this.element.getAttribute('type') === 'hover')
        && !this.isMobile_; // coerce to drag slider on mobile

    /** @private {!Element} */
    this.container_ = this.win.document.createElement('div');

    /** @private {?Element} */
    this.leftAmpImage_ = null;

    /** @private {?Element} */
    this.rightAmpImage_ = null;

    /** @private {?Element} */
    this.leftLabelWrapper_ = null;
    /** @private {?Element} */
    this.leftLabel_ = null;

    /** @private {?Element} */
    this.rightLabelWrapper_ = null;
    /** @private {?Element} */
    this.rightLabel_ = null;

    /** @private {!Element} */
    this.leftMask_ = this.win.document.createElement('div');

    /** @private {!Element} */
    this.rightMask_ = this.win.document.createElement('div');

    /** @private {!Element} */
    this.bar_ = this.win.document.createElement('div');

    /** @private {!Element} */
    this.barStick_ = this.win.document.createElement('div');

    /** @private {?Element} */
    this.barButton_ = null;
    /** @private {?Element} */
    this.barButtonIcon_ = null;

    /** @private {number} */
    this.moveOffset_ = 0;

    /** @private {number} */
    this.splitOffset_ = 0;

    // Bind this of handlers
    this.handleHover = this.handleHover.bind(this);
    this.handleClickImage = this.handleClickImage.bind(this);
    this.handleTapImage = this.handleTapImage.bind(this);

    this.dragStart = this.dragStart.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);

    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);

    this.pointerMoveX_ = this.pointerMoveX_.bind(this);

    /** @private {object} */
    this.elementListeners_ = map();
    /** @private {object} */
    this.barButtonListeners_ = map();
    /** @private {object} */
    this.containerListeners_ = map();
    /** @private {object} */
    this.winListeners_ = map();
  }

  /**
   * Select the listeners map
   * @param {Element} element
   * @return {Object}
   * @private
   */
  selectListeners_(element) {
    switch (element) {
      case this.element:
        return this.elementListeners_;
      case this.container_:
        return this.containerListeners_;
      case this.barButton_:
        return this.barButtonListeners_;
      case this.win:
        return this.winListeners_;
      default:
        return null;
    }
  }

  /**
   * Add an event listener on element
   * @param {Element} element
   * @param {string} eventType
   * @param {Function} listener
   * @private
   */
  listen_(element, eventType, listener) {
    const listeners = this.selectListeners_(element);
    if (!listeners) {
      return;
    }

    if (!listeners[eventType]) {
      listeners[eventType] = [];
    }

    listeners[eventType].push(listen(element, eventType, listener));
  }

  /**
   * Call unlisten on listener by event type
   * @param {Element} element
   * @param {string} eventType
   * @private
   */
  unlistenEvent_(element, eventType) {
    const listeners = this.selectListeners_(element);
    const events = listeners ? listeners[eventType] : null;
    if (!listeners || !events) {
      return;
    }

    for (let i = 0; i < events.length; i++) {
      events[i]();
    }

    delete listeners[eventType];
  }

  /** @override */
  buildCallback() {
    // From https://github.com/ampproject/amphtml/pull/16688
    user().assert(isExperimentOn(this.win, 'amp-image-slider'),
        'Experiment <amp-image-slider> disabled');

    const children = this.getRealChildren();

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.hasAttribute('before')) {
        switch (child.tagName.toLowerCase()) {
          case 'amp-img':
            this.leftAmpImage_ = child;
            break;
          case 'div':
            this.leftLabel_ = child;
            break;
        }
      } else if (child.hasAttribute('after')) {
        switch (child.tagName.toLowerCase()) {
          case 'amp-img':
            this.rightAmpImage_ = child;
            break;
          case 'div':
            this.rightLabel_ = child;
            break;
        }
      }
    }

    if (!this.leftAmpImage_ || !this.rightAmpImage_) {
      return null;
    }

    this.container_.classList.add('i-amphtml-image-slider-container');
    this.element.appendChild(this.container_);

    this.buildImages();
    this.buildBar();

    return Promise.resolve();
  }

  /**
   * Build image structures
   */
  buildImages() {
    // Hierarchy:
    // leftMask
    //   |_ leftAmpImage
    // rightAmpImage
    this.container_.appendChild(this.rightMask_);
    this.container_.appendChild(this.leftMask_);

    this.rightMask_.appendChild(this.rightAmpImage_);
    this.rightMask_.classList.add('i-amphtml-image-slider-right-mask');

    if (this.rightLabel_) {
      this.rightLabelWrapper_ = this.win.document.createElement('div');
      this.rightLabelWrapper_.classList
          .add('i-amphtml-image-slider-right-label-wrapper');
      this.rightLabel_.classList.add('i-amphtml-image-slider-right-label');
      this.rightLabelWrapper_.appendChild(this.rightLabel_);
      this.rightMask_.appendChild(this.rightLabelWrapper_);
    }
    this.leftMask_.appendChild(this.leftAmpImage_);

    this.leftMask_.classList.add('i-amphtml-image-slider-left-mask');
    this.leftAmpImage_.classList.add('i-amphtml-image-slider-over-image');

    if (this.leftLabel_) {
      this.leftLabelWrapper_ = this.win.document.createElement('div');
      this.leftLabelWrapper_.classList
          .add('i-amphtml-image-slider-left-label-wrapper');
      this.leftLabel_.classList.add('i-amphtml-image-slider-left-label');
      this.leftLabelWrapper_.appendChild(this.leftLabel_);
      this.leftMask_.appendChild(this.leftLabelWrapper_);
    }
  }

  /**
   * Build the image slider bar
   */
  buildBar() {
    if (this.isHoverSlider_) {
      this.buildHoverSliderBar();
    } else {
      this.buildTapSliderBar();
    }
  }

  /**
   * Build slider bar that follows mouse movement
   */
  buildHoverSliderBar() {
    this.container_.appendChild(this.bar_);
    this.bar_.appendChild(this.barStick_);

    this.bar_.classList.add('i-amphtml-image-slider-bar');
    this.barStick_.classList.add('i-amphtml-image-slider-bar-stick');
  }

  /**
   * Build slider bar that could be drag by button
   */
  buildTapSliderBar() {
    this.barButton_ = this.win.document.createElement('div');
    this.barButton_.classList.add('i-amphtml-image-slider-bar-button');
    // TODO(kqian): UI design
    this.barButtonIcon_ = htmlFor(this.win.document)`<div>&lt;~&gt;</div>`;
    this.barButton_.appendChild(this.barButtonIcon_);

    this.container_.appendChild(this.bar_);
    this.barStick_.appendChild(this.barButton_);
    this.bar_.appendChild(this.barStick_);

    this.bar_.classList.add('i-amphtml-image-slider-bar');
    this.barStick_.classList.add('i-amphtml-image-slider-bar-stick');
  }

  /**
   * Update element positions based on percentage
   * @param {number} leftPercentage
   */
  updatePositions(leftPercentage) {
    this.updateTranslateX(this.bar_, leftPercentage);

    this.updateTranslateX(this.leftMask_, leftPercentage - 1);
    this.updateTranslateX(this.leftAmpImage_, 1 - leftPercentage);
    if (this.leftLabelWrapper_) {
      this.updateTranslateX(this.leftLabelWrapper_, 1 - leftPercentage);
    }
  }

  /**
   * Set translateX of the element
   * @param {!Element} element
   * @param {number} percentage
   */
  updateTranslateX(element, percentage) {
    setStyle(element, 'transform', `translateX(${percentage * 100}%)`);
  }

  /**
   * Register event handlers
   */
  registerEvents() {
    if (this.isHoverSlider_) {
      this.listen_(this.container_, 'mousemove', this.handleHover);
    } else {
      // Use container_ for drag operation instead
      // element for click/tap operations
      this.listen_(this.element, 'click', this.handleClickImage);
      this.listen_(this.element, 'touchend', this.handleTapImage);
      this.listen_(this.barButton_, 'mousedown', this.dragStart);
      this.listen_(this.barButton_, 'touchstart', this.touchStart);
    }
  }

  /**
   * Unregister event handlers
   */
  unregisterEvents() {
    if (this.isHoverSlider_) {
      this.unlistenEvent_(this.container_, 'mousemove');
    } else {
      this.unlistenEvent_(this.element, 'click');
      this.unlistenEvent_(this.element, 'touchend');
      // remove pointer related events below
      // clearup actions needed
      this.dragEnd(null);
      this.touchEnd(null);
    }
  }

  /**
   * Handle hover event
   * @param {Event} e
   */
  handleHover(e) {
    // This offsetWidth may change if user resize window
    // Thus not cached
    const {left, width} = this.container_./*OK*/getBoundingClientRect();
    const leftPercentage = (e.pageX - left) / width;
    this.updatePositions(leftPercentage);
  }

  /**
   * Handle click on the image
   * @param {Event} e
   */
  handleClickImage(e) {
    const {left, width} = this.container_./*OK*/getBoundingClientRect();
    const leftPercentage = (e.pageX - left) / width;
    this.animateUpdatePositions(leftPercentage);
  }

  /**
   * Handle tap on the image
   * @param {Event} e
   */
  handleTapImage(e) {
    const {left, width} = this.container_./*OK*/getBoundingClientRect();
    if (e.touches.length > 0) {
      const leftPercentage = (e.touches[0].pageX - left) / width;
      this.animateUpdatePositions(leftPercentage);
    }
  }

  /**
   * Animated, update element positions based on percentage
   * @param {number} toPercentage
   */
  animateUpdatePositions(toPercentage) {
    const {left: containerLeft, width: containerWidth}
        = this.container_./*OK*/getBoundingClientRect();
    const {left: barLeft} = this.bar_./*OK*/getBoundingClientRect();

    const fromPercentage = (barLeft - containerLeft) / containerWidth;
    const interpolate = numeric(fromPercentage, toPercentage);
    const curve = bezierCurve(0.4, 0, 0.2, 1); // fast-out-slow-in
    const duration = 200;
    // Single animation ensure elements have props updated at same pace
    // Multiple animations would be scheduled at different raf
    return Animation.animate(this.element, pos => {
      this.updatePositions(interpolate(pos));
    }, duration, curve).thenAlways();
  }

  /**
   * Add listeners on drag start
   * @param {Event} e
   */
  dragStart(e) {
    e.preventDefault();
    e.stopPropagation();

    this.listen_(this.win, 'mousemove', this.dragMove);
    this.listen_(this.win, 'mouseup', this.dragEnd);

    this.moveOffset_ = e.pageX;
    this.splitOffset_ = this.bar_./*OK*/getBoundingClientRect().left;
  }
  /**
   * Handle drag move
   * @param {Event} e
   */
  dragMove(e) {
    e.preventDefault();
    e.stopPropagation(); // avoid clashing with clickImage
    this.pointerMoveX_(e.pageX);
  }
  /**
   * Remove listeners on drag end
   * e is optional since dragEnd will also be used for unregister cleanup
   * @param {Event|null} e
   */
  dragEnd(e) {
    if (e) {
      e.stopPropagation();
    }

    this.unlistenEvent_(this.win, 'mousemove');
    this.unlistenEvent_(this.win, 'mouseup');

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;
  }
  /**
   * Add listeners on drag start
   * @param {Event} e
   */
  touchStart(e) {
    this.listen_(this.container_, 'touchmove', this.touchMove);
    this.listen_(this.container_, 'touchend', this.touchEnd);

    this.moveOffset_ = e.touches[0].pageX;
    this.splitOffset_ = this.bar_./*OK*/getBoundingClientRect().left;
  }
  /**
   * Handle touch move
   * @param {Event} e
   */
  touchMove(e) {
    // When we are holding bar button (or its icon)
    // Do not scroll page
    if (e.target === this.barButton_ ||
        (this.barButtonIcon_ && e.target === this.barButtonIcon_)) {
      e.preventDefault();
    }
    e.stopPropagation(); // avoid clashing with clickImage
    if (e.touches.length > 0) {
      this.pointerMoveX_(e.touches[0].pageX);
    }
  }
  /**
   * Cleanup when touch released
   * @param {Event|null} e
   */
  touchEnd(e) {
    if (e) {
      // Avoid bubbling up to element
      e.stopPropagation();
    }
    this.unlistenEvent_(this.container_, 'touchmove');
    this.unlistenEvent_(this.container_, 'touchend');

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;
  }

  /**
   * Pointer move X logic
   * @param {number} pointerX
   * @private
   */
  pointerMoveX_(pointerX) {
    const {width} = this.container_./*OK*/getBoundingClientRect();
    const {left: leftBound, right: rightBound}
        = this.container_./*OK*/getBoundingClientRect();

    const moveX = pointerX - this.moveOffset_;
    const newPos = Math.max(leftBound,
        Math.min(this.splitOffset_ + moveX, rightBound));
    const newPercentage = (newPos - leftBound) / width;
    this.updatePositions(newPercentage);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    // https://github.com/ampproject/amphtml/pull/16688
    user().assert(isExperimentOn(this.win, 'amp-image-slider'),
        'Experiment <amp-image-slider> disabled');

    // amp-img initially have no size as amp-image-slider
    // is not yet completely built.
    // scheduleLayout without setAsOwner seems work
    // as a hint that the new layout should be inspected
    if (this.leftAmpImage_ && this.rightAmpImage_) {
      this.scheduleLayout(this.leftAmpImage_);
      this.scheduleLayout(this.rightAmpImage_);
    }

    this.registerEvents();

    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.unregisterEvents();
    return true;
  }
}

AMP.extension('amp-image-slider', '0.1', AMP => {
  AMP.registerElement('amp-image-slider', AmpImageSlider, CSS);
});
