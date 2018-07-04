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
import {setStyle} from '../../../src/style';

export class AmpImageSlider extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.isFollowSlider_ = (this.element.getAttribute('type') === 'follow');
    // TODO(kqian): consider splitting into 2 different upgradable slider
    // that base on this same base class

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

    /** @private {boolean} */
    this.isChrome_ = !!this.win.chrome;
    // chrome has an interesting glitch with translate
    // use left/right as temp solution
    // TODO(kqian): find a better chrome detection method


    this.handleHover = this.handleHover.bind(this);
    this.handleClickImage = this.handleClickImage.bind(this);
    this.handleTapImage = this.handleTapImage.bind(this);

    this.dragStart = this.dragStart.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);

    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);

    this.vsync_ = this.getVsync();

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;
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
    // TODO(kqian): force button slider when on mobile
    // need a nice way to detect
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
    // TODO(kqian): adjust these percentages
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
      // Use container_ for drag operation instead
      this.element.addEventListener('click', this.handleClickImage);
      this.element.addEventListener('touchend', this.handleTapImage);
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
      this.element.addEventListener('touchend', this.handleTapImage);
      this.dragEnd();
      this.touchEnd();
    }
  }

  /**
   * Handle hover event
   * @param {Event} e
   */
  handleHover(e) {
    e.preventDefault();

    // This offsetWidth may change if user resize window
    // Thus not cached
    // TODO(kqian): vsync measure?
    const {left, right} = this.container_.getBoundingClientRect();
    const leftPercentage = (e.clientX - left) / (right - left);

    this.updatePositions(leftPercentage);
  }

  /**
   * Handle click on the image
   * @param {Event} e
   */
  handleClickImage(e) {
    const {left, right} = this.container_.getBoundingClientRect();
    const leftPercentage = (e.clientX - left) / (right - left);
    this.animateUpdatePositions(leftPercentage);
  }

  /**
   * Handle tap on the image
   * @param {Event} e
   */
  handleTapImage(e) {
    const {left, right} = this.container_.getBoundingClientRect();
    const leftPercentage = (e.touches[0].pageX - left) / (right - left);
    this.animateUpdatePositions(leftPercentage);
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
    const duration = 100;
    // Using this.bar_ as a standard element
    // to hack and create non-delayed animations on all 3 elements
    return Animation.animate(this.bar_, pos => {
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

    this.container_.addEventListener('mousemove', this.dragMove);
    this.container_.addEventListener('mouseup', this.dragEnd);
    this.container_.addEventListener('mouseleave', this.dragEnd);

    this.moveOffset_ = e.clientX;
    this.splitOffset_ = this.bar_.getBoundingClientRect().left;
  }
  /**
   * TODO
   * @param {Event} e
   */
  dragMove(e) {
    e.preventDefault();
    e.stopPropagation(); // avoid clashing with clickImage

    const currX = e.clientX;

    const width = this.container_.offsetWidth;
    const {left: leftBound, right: rightBound}
        = this.container_.getBoundingClientRect();

    const moveX = currX - this.moveOffset_;
    const newPos = Math.max(leftBound,
        Math.min(this.splitOffset_ + moveX, rightBound));
    const newPercentage = (newPos - leftBound) / width;
    this.updatePositions(newPercentage);
  }
  /**
   * TODO
   */
  dragEnd() {
    this.container_.removeEventListener('mousemove', this.dragMove);
    this.container_.removeEventListener('mouseup', this.dragEnd);
    this.container_.removeEventListener('mouseleave', this.dragEnd);

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

    const currX = e.touches[0].pageX;

    const width = this.container_.offsetWidth;
    const {left: leftBound, right: rightBound}
        = this.container_.getBoundingClientRect();

    const moveX = currX - this.moveOffset_;
    const newPos = Math.max(leftBound,
        Math.min(this.splitOffset_ + moveX, rightBound));
    const newPercentage = (newPos - leftBound) / width;
    this.updatePositions(newPercentage);
  }
  /**
   * TODO
   * @param {?Event} e
   */
  touchEnd(e) {
    if (e) {
      e.stopPropagation();
    }
    this.container_.removeEventListener('touchmove', this.touchMove);
    this.container_.removeEventListener('touchend', this.touchEnd);

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;
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
