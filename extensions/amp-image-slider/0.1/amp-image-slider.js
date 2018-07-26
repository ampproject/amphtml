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
import {dev, user} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {numeric} from '../../../src/transition';
import {setStyle} from '../../../src/style';

// event-helper.js -> listen; option: passive = true
// mount both mouse & touch listener ()
// Test: mainly describes.integration
// Visual diffing tests

// Wrap <a> anchor around amp-image
// This is actually creating some trouble with gesture

// this.mutateElement(callback), in which move children

// INTERESTING EXPERIMENT:
// getLayoutBox()?
// this seems to be remeasured and updated on viewport update

// TODO(kqian): fix gesture collision between drag mouseup and click to move
export class AmpImageSlider extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {Document} */
    this.doc_ = this.win.document;

    /** @private {boolean} */
    this.isMobile_ = /Android|iPhone|iPad|iPod/i.test(this.win.navigator.userAgent);

    /** @private {boolean} */
    this.isHoverSlider_ = (this.element.getAttribute('type') === 'hover')
        && !this.isMobile_; // coerce to drag slider on mobile

    /** @private {!Element} */
    this.container_ = this.doc_.createElement('div');

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
    this.leftMask_ = this.doc_.createElement('div');

    /** @private {!Element} */
    this.rightMask_ = this.doc_.createElement('div');

    /** @private {!Element} */
    this.bar_ = this.doc_.createElement('div');

    /** @private {!Element} */
    this.barStick_ = this.doc_.createElement('div');

    /** @private {?Element} */
    this.barButton_ = null;
    /** @private {?Element} */
    this.barButtonIcon_ = null;
    /** @private {?Element} */
    this.barHint_ = null;
    /** @private {boolean} */
    this.isBarHintHidden_ = false;

    /** @private {number} */
    this.moveOffset_ = 0;

    /** @private {number} */
    this.splitOffset_ = 0;

    // Bind this of handlers
    this.handleHover = this.handleHover.bind(this);
    this.handleClickImage = this.handleClickImage.bind(this);
    this.handleTapImage = this.handleTapImage.bind(this);
    this.handleHideHint = this.handleHideHint.bind(this);

    this.dragStart = this.dragStart.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);

    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);

    this.pointerMoveX_ = this.pointerMoveX_.bind(this);

    /** @private {boolean} */
    this.isEventRegistered_ = false;
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

    if (!isExperimentOn(this.win, 'layers')) {
      // When layers not enabled
      this.setAsOwner(this.leftAmpImage_);
      this.setAsOwner(this.rightAmpImage_);
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
    // rightMask
    //   |_ rightAmpImage
    this.container_.appendChild(this.rightMask_);
    this.container_.appendChild(this.leftMask_);

    this.rightMask_.appendChild(this.rightAmpImage_);
    this.rightMask_.classList.add('i-amphtml-image-slider-right-mask');

    if (this.rightLabel_) {
      this.rightLabelWrapper_ = this.doc_.createElement('div');
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
      this.leftLabelWrapper_ = this.doc_.createElement('div');
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

    this.buildBarHint();
  }

  /**
   * Build slider bar that could be drag by button
   */
  buildTapSliderBar() {
    this.barButton_ = this.doc_.createElement('div');
    this.barButton_.classList.add('i-amphtml-image-slider-bar-button');
    // TODO(kqian): UI design
    this.barButtonIcon_ = htmlFor(this.doc_)`<div>&lt;~&gt;</div>`;
    this.barButton_.appendChild(this.barButtonIcon_);

    this.buildBarHint();

    this.container_.appendChild(this.bar_);
    this.barStick_.appendChild(this.barButton_);
    this.bar_.appendChild(this.barStick_);

    this.bar_.classList.add('i-amphtml-image-slider-bar');
    this.barStick_.classList.add('i-amphtml-image-slider-bar-stick');
  }

  /**
   * Build hiding hint
   * A weird thing is adding the fading animation
   * brings back the old quirky chrome bug of display
   */
  buildBarHint() {
    if (!this.barStick_) {
      return;
    }
    this.barHint_ = this.doc_.createElement('div');
    this.barHint_.classList.add('i-amphtml-image-slider-hint');
    // TODO(kqian): UI design choice
    const barHintIcon = htmlFor(this.doc_)`<div>← →</div>`;
    barHintIcon.classList.add('i-amphtml-image-slider-hint-icon');
    this.barHint_.appendChild(barHintIcon);

    this.barStick_.appendChild(this.barHint_);
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
   * @param {Element} element
   * @param {number} percentage
   */
  updateTranslateX(element, percentage) {
    setStyle(element, 'transform', `translateX(${percentage * 100}%)`);
  }

  /**
   * Register event handlers
   */
  registerEvents() {
    if (this.isEventRegistered_) { // avoid dup
      return;
    }

    if (this.isHoverSlider_) {
      this.element.addEventListener('mousemove', this.handleHideHint, true);
      this.container_.addEventListener('mousemove', this.handleHover);
    } else {
      // Use container_ for drag operation instead
      // element for click/tap operations
      this.element.addEventListener('mousedown', this.handleHideHint, true);
      this.element.addEventListener('touchstart', this.handleHideHint, true);
      this.element.addEventListener('click', this.handleClickImage);
      this.element.addEventListener('touchend', this.handleTapImage);
      dev().assertElement(this.barButton_)
          .addEventListener('mousedown', this.dragStart);
      dev().assertElement(this.barButton_)
          .addEventListener('touchstart', this.touchStart);
    }

    this.isEventRegistered_ = true;
  }

  /**
   * Unregister event handlers
   */
  unregisterEvents() {
    if (this.isHoverSlider_) {
      this.element.removeEventListener('mousemove', this.handleHideHint, true);
      this.container_.removeEventListener('mousemove', this.handleHover);
    } else {
      this.element.removeEventListener('mousedown', this.handleHideHint, true);
      this.element.removeEventListener('touchstart', this.handleHideHint, true);
      this.element.removeEventListener('click', this.handleClickImage);
      this.element.removeEventListener('touchend', this.handleTapImage);
      dev().assertElement(this.barButton_)
          .removeEventListener('mousedown', this.dragStart);
      dev().assertElement(this.barButton_)
          .removeEventListener('touchstart', this.touchStart);
      // remove pointer related events below
      this.dragEnd(null);
      this.touchEnd(null);
    }

    this.isEventRegistered_ = false;
  }

  /**
   * Handle hover event
   * @param {Event} e
   */
  handleHover(e) {
    // This offsetWidth may change if user resize window
    // Thus not cached
    // const {left, width} = this.getLayoutBox();
    const {left, width} = this.container_./*OK*/getBoundingClientRect();
    const leftPercentage = (e.pageX - left) / width;
    this.updatePositions(leftPercentage);
  }

  /**
   * Handle click on the image
   * @param {Event} e
   */
  handleClickImage(e) {
    // const {left, width} = this.getLayoutBox();
    const {left, width} = this.container_./*OK*/getBoundingClientRect();
    const leftPercentage = (e.pageX - left) / width;
    this.animateUpdatePositions(leftPercentage);
  }

  /**
   * Handle tap on the image
   * @param {Event} e
   */
  handleTapImage(e) {
    // const {left, width} = this.getLayoutBox();
    const {left, width} = this.container_./*OK*/getBoundingClientRect();
    if (e.touches.length > 0) {
      const leftPercentage = (e.touches[0].pageX - left) / width;
      this.animateUpdatePositions(leftPercentage);
    }
  }

  /**
   * Handle hinding the hint
   * @param {Event} unusedEvent
   */
  handleHideHint(unusedEvent) {
    if (!this.isBarHintHidden_ && this.barHint_) {
      this.isBarHintHidden_ = true;
      this.barHint_.classList.add('i-amphtml-image-slider-hint-hidden');
    }
  }

  /**
   * Animated, update element positions based on percentage
   * @param {number} toPercentage
   */
  animateUpdatePositions(toPercentage) {
    const {left: containerLeft, width: containerWidth}
    //    = this.getLayoutBox();
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

    this.win.addEventListener('mousemove', this.dragMove);
    this.win.addEventListener('mouseup', this.dragEnd);

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
    this.container_.removeEventListener('touchmove', this.touchMove);
    this.container_.removeEventListener('touchend', this.touchEnd);

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;
  }

  /**
   * Pointer move X logic
   * @param {number} pointerX
   * @private
   */
  pointerMoveX_(pointerX) {
    // const {width} = this.getLayoutBox();
    const {width} = this.container_./*OK*/getBoundingClientRect();
    const {left: leftBound, right: rightBound}
    //    = this.getLayoutBox();
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

    // Actually, now they are no longer useful
    // But kept since there is an layer experiment check
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

  /** @override */
  pauseCallback() {
    this.unregisterEvents();
  }

  /** @override */
  resumeCallback() {
    this.registerEvents();
  }
}

AMP.extension('amp-image-slider', '0.1', AMP => {
  AMP.registerElement('amp-image-slider', AmpImageSlider, CSS);
});
