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
import {bezierCurve} from '../../../src/curve';
import {CSS} from '../../../build/amp-image-slider-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {htmlFor} from '../../../src/static-template';
import {isLayoutSizeDefined} from '../../../src/layout';
import {numeric} from '../../../src/transition';
import {Platform} from '../../../src/service/platform-impl';
import {setStyle} from '../../../src/style';

// event-helper.js -> listen; option: passive = true
// mount both mouse & touch listener ()
// Test: mainly describes.integration
// Visual diffing tests

// this.mutateElement(callback), in which move children


export class AmpImageSlider extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    const platform_ = new Platform(this.win);
    /** @private {boolean} */
    this.isMobile_ = platform_.isAndroid() || platform_.isIos();

    /** @private {boolean} */
    this.isFollowSlider_ = (this.element.getAttribute('type') === 'follow')
        && !this.isMobile_; // coerce to drag slider on mobile

    /** @private {!Element} */
    this.container_ = this.win.document.createElement('div');

    /** @private {?Element} */
    this.rightAmpImage_ = null;

    /** @private {?Element} */
    this.leftAmpImage_ = null;

    /** @private {!Element} */
    this.mask_ = this.win.document.createElement('div');

    /** @private {!Element} */
    this.bar_ = this.win.document.createElement('div');

    /** @private {!Element} */
    this.barStick_ = this.win.document.createElement('div');

    /** @private {?Element} */
    this.barButton_ = null;

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

    this.vsync_ = this.getVsync();

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;

    this.isMouseButtonDown_ = false;
  }

  /** @override */
  buildCallback() {
    this.container_.classList.add('i-amphtml-image-slider-container');
    this.element.appendChild(this.container_);

    const children = this.getRealChildren();

    // at least 2 children
    if (children.length < 2) {
      return null;
    }

    // TODO(kqian): check children type
    this.leftAmpImage_ = children[0];
    this.rightAmpImage_ = children[1];

    this.buildImages();
    this.buildBar();
  }

  /**
   * Build image structures
   */
  buildImages() {
    // Hierarchy:
    // leftMask
    //   |_ leftAmpImage
    // rightAmpImage
    this.container_.appendChild(this.mask_);
    this.container_.appendChild(this.rightAmpImage_);
    this.mask_.appendChild(this.leftAmpImage_);

    this.mask_.classList.add('i-amphtml-image-slider-mask');
    this.leftAmpImage_.classList.add('i-amphtml-image-slider-over-image');

    // seems that if I do not take their ownership
    // they would just never rendered (no layout, not even built)
    this.setAsOwner(this.leftAmpImage_);
    this.setAsOwner(this.rightAmpImage_);
  }

  /**
   * Build the image slider bar
   */
  buildBar() {
    if (this.isFollowSlider_) {
      this.buildFollowSliderBar();
    } else {
      this.buildTapSliderBar();
    }
  }

  /**
   * Build slider bar that follows mouse movement
   */
  buildFollowSliderBar() {
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
    this.barButton_.appendChild(
        htmlFor(this.win.document)`<div>&lt;~&gt;</div>`);

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

    const wrappedImage = this.leftAmpImage_.firstChild;
    if (wrappedImage) {
      this.updateTranslateX(this.mask_, leftPercentage - 1);
      this.updateTranslateX(wrappedImage, 1 - leftPercentage);
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
    if (this.isFollowSlider_) {
      this.container_.addEventListener('mousemove', this.handleHover);
    } else {
      // TODO(kqian): DESIGN CHOICE DISCUSSION PENDING

      // Use container_ for drag operation instead
      // element for click/tap operations
      this.element.addEventListener('click', this.handleClickImage);
      this.element.addEventListener('touchend', this.handleTapImage);
      // TODO(kqian): merge dragStart and touchStart to a single method
      // once the actual design is settled
      this.barButton_.addEventListener('mousedown', this.dragStart);
      this.barButton_.addEventListener('touchstart', this.touchStart);
    }
  }

  /**
   * Unregister event handlers
   */
  unregisterEvents() {
    if (this.isFollowSlider_) {
      this.container_.removeEventListener('mousemove', this.handleHover);
    } else {
      this.element.removeEventListener('click', this.handleClickImage);
      this.element.removeEventListener('touchend', this.handleTapImage);
      // remove pointer related events below
      this.dragEnd();
      this.touchEnd();
    }
  }

  /**
   * Set mouse button as down
   * RESERVED FOR LATER
   */
  setMouseButtonDown_() { this.isMouseButtonDown_ = true; }

  /**
   * Set mouse button as up
   * RESERVED FOR LATER
   */
  setMouseButtonUp_() { this.isMouseButtonDown_ = false; }

  /**
   * Handle hover event
   * @param {Event} e
   */
  handleHover(e) {
    // This offsetWidth may change if user resize window
    // Thus not cached
    // TODO(kqian): vsync measure?
    const {left, right} = this.container_.getBoundingClientRect();
    const leftPercentage = (e.pageX - left) / (right - left);
    this.updatePositions(leftPercentage);
  }

  /**
   * Handle click on the image
   * @param {Event} e
   */
  handleClickImage(e) {
    const {left, right} = this.container_.getBoundingClientRect();
    const leftPercentage = (e.pageX - left) / (right - left);
    this.animateUpdatePositions(leftPercentage);
  }

  /**
   * Handle tap on the image
   * @param {Event} e
   */
  handleTapImage(e) {
    const {left, right} = this.container_.getBoundingClientRect();
    if (e.touches.length > 0) {
      const leftPercentage = (e.touches[0].pageX - left) / (right - left);
      this.animateUpdatePositions(leftPercentage);
    }
  }

  /**
   * Animated, update element positions based on percentage
   * @param {number} toPercentage
   */
  animateUpdatePositions(toPercentage) {
    // TODO(kqian): this part of the code is very fragile
    // TOO implementation specific. Seek for improvement and replacement
    const {left: containerLeft, width: containerWidth}
        = this.container_.getBoundingClientRect();
    const {left: barLeft} = this.bar_.getBoundingClientRect();

    const fromPercentage = (barLeft - containerLeft) / containerWidth;
    const wrappedImage = this.leftAmpImage_.firstChild;
    const interpolate = numeric(fromPercentage, toPercentage);
    const curve = bezierCurve(0.4, 0, 0.2, 1); // fast-out-slow-in
    const duration = 200;
    // Using this.bar_ as a standard element
    // to hack and create non-delayed animations on all 3 elements
    return Animation.animate(this.element, pos => {
      setStyle(this.bar_, 'transform',
          `translateX(${interpolate(pos) * 100}%)`);
      if (wrappedImage) {
        setStyle(this.mask_, 'transform',
            `translateX(${(interpolate(pos) - 1) * 100}%)`);
        setStyle(wrappedImage, 'transform',
            `translateX(${(1 - interpolate(pos)) * 100}%)`);
      }
    }, duration, curve).thenAlways();
  }

  /**
   * TODO
   * @param {Event} e
   */
  dragStart(e) {
    e.preventDefault();

    // TODO(kqian): container or window???
    // this.container_.addEventListener('mousemove', this.dragMove);
    // this.container_.addEventListener('mouseup', this.dragEnd);
    this.win.addEventListener('mousemove', this.dragMove);
    this.win.addEventListener('mouseup', this.dragEnd);

    this.moveOffset_ = e.pageX;
    this.splitOffset_ = this.bar_.getBoundingClientRect().left;
  }
  /**
   * TODO
   * @param {Event} e
   */
  dragMove(e) {
    e.preventDefault();
    e.stopPropagation(); // avoid clashing with clickImage
    this.pointerMoveX_(e.pageX);
  }
  /**
   * TODO
   */
  dragEnd() {
    // TODO(kqian): container or window???
    // this.container_.removeEventListener('mousemove', this.dragMove);
    // this.container_.removeEventListener('mouseup', this.dragEnd);
    this.win.removeEventListener('mousemove', this.dragMove);
    this.win.removeEventListener('mouseup', this.dragEnd);

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;
  }
  /**
   * TODO
   * @param {Event} e
   */
  touchStart(e) {
    this.container_.addEventListener('touchmove', this.touchMove);
    this.container_.addEventListener('touchend', this.touchEnd);

    this.moveOffset_ = e.touches[0].pageX;
    this.splitOffset_ = this.bar_.getBoundingClientRect().left;
  }
  /**
   * TODO
   * @param {Event} e
   */
  touchMove(e) {
    e.stopPropagation(); // avoid clashing with clickImage
    if (e.touches.length > 0) {
      this.pointerMoveX_(e.touches[0].pageX);
    }
  }
  /**
   * TODO
   * @param {?Event} e
   */
  touchEnd(e) {
    if (e) {
      // Avoid bubbling up to element
      e.stopPropagation();
    }
    this.container_.removeEventListener('touchmove', this.touchMove);
    this.container_.removeEventListener('touchend', this.touchEnd);

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;
  }

  /**
   * Pointer move X logic
   * @param {number} pointerX
   */
  pointerMoveX_(pointerX) {
    const width = this.container_.offsetWidth;
    const {left: leftBound, right: rightBound}
        = this.container_.getBoundingClientRect();

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
    this.scheduleLayout(this.leftAmpImage_);
    this.scheduleLayout(this.rightAmpImage_);

    Promise.all([
      // LOAD_START
      this.leftAmpImage_.signals().whenSignal(CommonSignals.LOAD_END),
      this.rightAmpImage_.signals().whenSignal(CommonSignals.LOAD_END),
    ]).then(() => this.registerEvents());
  }

  /** @override */
  unlayoutCallback() {
    this.unregisterEvents();
  }
}

AMP.registerElement('amp-image-slider', AmpImageSlider, CSS);
