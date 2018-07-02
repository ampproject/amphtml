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

// import {appendEncodedParamStringToUrl} from '../../../src/url';
import {CSS} from '../../../build/amp-compare-slider-0.1.css';
import {isLayoutSizeDefined} from '../../../src/layout';
// import {Layout} from '../../../src/layout';
import {/*getStyle, */setStyle} from '../../../src/style';

export class AmpCompareSlider extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?Element} */
    this.leftImage_ = null;

    /** @private {?Element} */
    this.rightImage_ = null;

    /** @private {?Element} */
    this.leftContainer_ = null;

    /** @private {?Element} */
    this.rightContainer_ = null;

    /** @private {?Element} */
    this.leftMask_ = null;

    /** @private {?Element} */
    this.rightMask_ = null;

    /** @private {?Element} */
    this.barWrapper_ = null;

    /** @private {?Element} */
    this.vertSplitBar_ = null;

    /** @private {?Element} */
    this.dragButton_ = null;

    /** @private {number} */
    this.moveOffset_ = 0;
    
    /** @private {number} */
    this.splitOffset_ = 0;

    /** @private {?Document} */
    this.doc_ = this.win.document;

    // Binds
    this.initDrag = this.initDrag.bind(this);
    this.initTouch = this.initTouch.bind(this);
    this.moveDrag = this.moveDrag.bind(this);
    this.moveTouch = this.moveTouch.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.endTouch = this.endTouch.bind(this);
  }

  /** @override */
  buildCallback() {
    this.container_ = this.doc_.createElement('div');
    // setStyle(this.container_, 'position', 'relative');
    this.element.appendChild(this.container_);
    this.applyFillContent(this.container_, /* replacedContent */ true);

    this.buildContainedImages();
    this.buildSplitBar();
  }

  /**
   * Format wrapped images
   */
  buildContainedImages() {
    const children = this.getRealChildren();

    this.user().assert(children.length >= 2, 'two children images are required for building');
    this.leftImage_ = children[0];
    this.rightImage_ = children[1];

    this.setAsOwner(this.leftImage_);
    this.setAsOwner(this.rightImage_);

    this.leftContainer_ = this.doc_.createElement('div');
    this.leftContainer_.classList.add('i-amphtml-compare-slider-container-left');
    this.leftMask_ = this.doc_.createElement('div');
    this.leftMask_.classList.add('i-amphtml-compare-slider-mask-left');
    this.leftImage_.classList.add('i-amphtml-compare-slider-image-left');

    this.leftMask_.appendChild(this.leftImage_);
    this.leftContainer_.appendChild(this.leftMask_);
    this.container_.appendChild(this.leftContainer_);

    this.rightContainer_ = this.doc_.createElement('div');
    this.rightContainer_.classList.add('i-amphtml-compare-slider-container-right');
    this.rightMask_ = this.doc_.createElement('div');
    this.rightMask_.classList.add('i-amphtml-compare-slider-mask-right');
    this.rightImage_.classList.add('i-amphtml-compare-slider-image-right');

    this.rightMask_.appendChild(this.rightImage_);
    this.rightContainer_.appendChild(this.rightMask_);
    this.container_.appendChild(this.rightContainer_);
  }

  /**
   * Build vertical split bar and tweak images
   */
  buildSplitBar() {
    this.barWrapper_ = this.doc_.createElement('div');
    this.barWrapper_.classList.add('i-amphtml-compare-slider-bar-wrapper');

    this.vertSplitBar_ = this.doc_.createElement('div');
    this.vertSplitBar_.classList.add('i-amphtml-compare-slider-bar');

    this.dragButton_ = this.doc_.createElement('div');
    this.dragButton_.classList.add('i-amphtml-compare-slider-drag-button');
    const dragButtonText = this.doc_.createElement('div');
    dragButtonText.textContent = '< >';
    this.dragButton_.appendChild(dragButtonText);

    this.barWrapper_.appendChild(this.vertSplitBar_);
    this.barWrapper_.appendChild(this.dragButton_);
    this.container_.appendChild(this.barWrapper_);

    // Bounded in constructor
    this.dragButton_.addEventListener('mousedown', this.initDrag);
    this.dragButton_.addEventListener('touchstart', this.initTouch);
  }

  /**
   * Add drag handlers
   * @param {!Event} e
   */
  initDrag(e) {
    e.preventDefault();

    this.doc_.body.addEventListener('mousemove', this.moveDrag);
    this.doc_.body.addEventListener('mouseup', this.endDrag);

    this.moveOffset_ = e.clientX;
    this.splitOffset_ = this.barWrapper_.getBoundingClientRect().left;
  }

  /**
   * Add drag handlers
   * @param {!Event} e
   */
  initTouch(e) {
    e.preventDefault();

    this.doc_.body.addEventListener('touchmove', this.moveTouch);
    this.doc_.body.addEventListener('touchend', this.endTouch);

    this.moveOffset_ = e.touches[0].pageX;
    this.splitOffset_ = this.barWrapper_.getBoundingClientRect().left;
  }

  /**
   * Move dragging
   * @param {!Event} e
   */
  moveDrag(e) {
    e.preventDefault();

    const currX = e.clientX;

    const width = this.container_.offsetWidth;
    const {left: leftBound, right: rightBound}
        = this.container_.getBoundingClientRect();

    const moveX = currX - this.moveOffset_;
    const newPos = Math.max(leftBound,
        Math.min(this.splitOffset_ + moveX, rightBound));
    const newPercentage = ((newPos - leftBound) * 100 / width).toPrecision(4);

    setStyle(this.barWrapper_, 'left', `${newPercentage}%`);
    setStyle(this.leftMask_, 'right', `${100 - newPercentage}%`);
    // circumvent !import setting limitation
    setStyle(this.leftImage_.firstChild, 'cssText', `left: ${100 - newPercentage}% !important`);
  }

  /**
   * Move touch
   * @param {!Event} e
   */
  moveTouch(e) {
    e.preventDefault();

    const currX = e.touches[0].pageX;

    const width = this.container_.offsetWidth;
    const {left: leftBound, right: rightBound}
        = this.container_.getBoundingClientRect();

    const moveX = currX - this.moveOffset_;
    const newPos = Math.max(leftBound,
        Math.min(this.splitOffset_ + moveX, rightBound));
    const newPercentage = ((newPos - leftBound) * 100 / width).toPrecision(4);

    setStyle(this.barWrapper_, 'left', `${newPercentage}%`);
    setStyle(this.leftMask_, 'right', `${100 - newPercentage}%`);
    // circumvent !import setting limitation
    setStyle(this.leftImage_.firstChild, 'cssText', `left: ${100 - newPercentage}% !important`);
  }

  /**
   * End drag
   * @param {!Event} e
   */
  endDrag(e) {
    this.doc_.body.removeEventListener('mousemove', this.moveDrag);
    this.doc_.body.removeEventListener('mouseup', this.endDrag);

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;
  }

  /**
   * End touch
   * @param {!Event} e
   */
  endTouch(e) {
    this.doc_.body.removeEventListener('touchmove', this.moveTouch);
    this.doc_.body.removeEventListener('touchend', this.endTouch);

    this.moveOffset_ = 0;
    this.splitOffset_ = 0;
  }

  /** @override */
  layoutCallback() {
    //
    this.scheduleLayout(this.leftImage_);
    this.scheduleLayout(this.rightImage_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  unlayoutCallback() {
    // TODO(kqian): check if this has to be implemented
  }
}


AMP.extension('amp-compare-slider', '0.1', AMP => {
  AMP.registerElement('amp-compare-slider', AmpCompareSlider, CSS);
});
