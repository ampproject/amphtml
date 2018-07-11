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
import {CommonSignals} from '../../../src/common-signals';
import {Deferred} from '../../../src/utils/promise';
import {Platform} from '../../../src/service/platform-impl';
import {bezierCurve} from '../../../src/curve';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {numeric} from '../../../src/transition';
import {setStyle} from '../../../src/style';
import {user} from '../../../src/log';

const EXPERIMENT = 'amp-image-slider';

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

    const platform_ = new Platform(this.win);
    /** @private {boolean} */
    this.isMobile_ = platform_.isAndroid() || platform_.isIos();

    /** @private {boolean} */
    this.isHoverSlider_ = (this.element.getAttribute('type') === 'hover')
        && !this.isMobile_; // coerce to drag slider on mobile

    /** @private {!Element} */
    this.container_ = this.win.document.createElement('div');

    /** @private {?Element} */
    this.rightAmpImage_ = null;

    /** @private {?Element} */
    this.leftAmpImage_ = null;

    /** @private {?Element} */
    this.leftRealImage_ = null;

    /** @private {!Element} */
    this.mask_ = this.win.document.createElement('div');

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
  }

  /** @override */
  buildCallback() {
    if (!isExperimentOn(this.getWin(), EXPERIMENT)) {
      user().warn('Experiment %s is not turned on.', EXPERIMENT);
      return;
    }

    this.container_.classList.add('i-amphtml-image-slider-container');
    this.element.appendChild(this.container_);

    const children = this.getRealChildren();

    // at least 2 children
    if (children.length < 2) {
      return null;
    }

    this.leftAmpImage_ = children[0];
    this.rightAmpImage_ = children[1];

    const buildDeferred = new Deferred();

    this.mutateElement(() => {
      this.buildImages();
      this.buildBar();
      buildDeferred.resolve();
    });

    // Ensure layoutCallback is execute after build finishes
    return buildDeferred.promise;
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

    if (this.leftRealImage_) {
      this.updateTranslateX(this.mask_, leftPercentage - 1);
      this.updateTranslateX(this.leftRealImage_, 1 - leftPercentage);
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
      this.container_.addEventListener('mousemove', this.handleHover);
    } else {
      // Use container_ for drag operation instead
      // element for click/tap operations
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
    if (this.isHoverSlider_) {
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
   * Handle hover event
   * @param {Event} e
   */
  handleHover(e) {
    // This offsetWidth may change if user resize window
    // Thus not cached
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
    const {left: containerLeft, width: containerWidth}
        = this.container_.getBoundingClientRect();
    const {left: barLeft} = this.bar_.getBoundingClientRect();

    const fromPercentage = (barLeft - containerLeft) / containerWidth;
    const interpolate = numeric(fromPercentage, toPercentage);
    const curve = bezierCurve(0.4, 0, 0.2, 1); // fast-out-slow-in
    const duration = 200;
    // Single animation ensure elements have props updated at same pace
    // Multiple animations would be scheduled at different raf
    return Animation.animate(this.element, pos => {
      const posInterpolated = interpolate(pos);
      this.updateTranslateX(this.bar_, posInterpolated);
      if (this.leftRealImage_) {
        this.updateTranslateX(this.mask_, posInterpolated - 1);
        this.updateTranslateX(this.leftRealImage_, 1 - posInterpolated);
      }
    }, duration, curve).thenAlways();
  }

  /**
   * Add listeners on drag start
   * @param {Event} e
   */
  dragStart(e) {
    e.preventDefault();
    e.stopPropagation();

    this.win.addEventListener('mousemove', this.dragMove);
    this.win.addEventListener('mouseup', this.dragEnd);

    this.moveOffset_ = e.pageX;
    this.splitOffset_ = this.bar_.getBoundingClientRect().left;
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
   * @param {?Event} e
   */
  dragEnd(e) {
    if (e) {
      e.stopPropagation();
    }

    this.win.removeEventListener('mousemove', this.dragMove);
    this.win.removeEventListener('mouseup', this.dragEnd);

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;
  }
  /**
   * Add listeners on drag start
   * @param {Event} e
   */
  touchStart(e) {
    this.container_.addEventListener('touchmove', this.touchMove);
    this.container_.addEventListener('touchend', this.touchEnd);

    this.moveOffset_ = e.touches[0].pageX;
    this.splitOffset_ = this.bar_.getBoundingClientRect().left;
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
    const {width} = this.container_.getBoundingClientRect();
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
    if (!isExperimentOn(this.getWin(), EXPERIMENT)) {
      user().warn('Experiment %s is not turned on.', EXPERIMENT);
      return;
    }

    return Promise.all([
      // On load_start, <img>s are already created.
      this.leftAmpImage_.signals().whenSignal(CommonSignals.LOAD_START),
      this.rightAmpImage_.signals().whenSignal(CommonSignals.LOAD_START),
    ]).then(() => {
      // Here we have our real image tag
      // this.leftRealImage_
      //   = this.leftAmpImage_.getElementsByTagName('img')[0];
      this.leftRealImage_ = this.leftAmpImage_.firstChild;
      this.registerEvents();
    });
  }

  /** @override */
  unlayoutCallback() {
    this.unregisterEvents();
  }
}

AMP.extension('amp-image-slider', '0.1', AMP => {
  AMP.registerElement('amp-image-slider', AmpImageSlider, CSS);
});
