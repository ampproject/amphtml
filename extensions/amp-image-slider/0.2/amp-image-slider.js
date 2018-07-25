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

import {ActionTrust} from '../../../src/action-constants';
import {Animation} from '../../../src/animation';
import {CSS} from '../../../build/amp-image-slider-0.2.css';
import {getStyle, setStyles} from '../../../src/style';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listen} from '../../../src/event-helper';
import {numeric} from '../../../src/transition';
import {user} from '../../../src/log';

export class AmpImageSlider extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {Document} */
    this.doc_ = this.win.document;

    /** @private {!Element} */
    this.container_ = this.doc_.createElement('div');

    /** @private {?Element} */
    this.leftAmpImage_ = null;

    /** @private {Element|null} */
    this.rightAmpImage_ = null;

    /** @private {Element|null} */
    this.leftLabelWrapper_ = null;
    /** @private {Element|null} */
    this.leftLabel_ = null;

    /** @private {Element|null} */
    this.rightLabelWrapper_ = null;
    /** @private {Element|null} */
    this.rightLabel_ = null;

    /** @private {!Element} */
    this.leftMask_ = this.doc_.createElement('div');

    /** @private {!Element} */
    this.rightMask_ = this.doc_.createElement('div');

    /** @private {!Element} */
    this.bar_ = this.doc_.createElement('div');

    /** @private {!Element} */
    this.barStick_ = this.doc_.createElement('div');

    /** @private {Element|null} */
    this.hint_ = null;

    /** @private {UnlistenDef|null} */
    this.unlistenMouseDown_ = null;
    /** @private {UnlistenDef|null} */
    this.unlistenMouseUp_ = null;
    /** @private {UnlistenDef|null} */
    this.unlistenMouseMove_ = null;
    /** @private {UnlistenDef|null} */
    this.unlistenTouchStart_ = null;
    /** @private {UnlistenDef|null} */
    this.unlistenTouchMove_ = null;
    /** @private {UnlistenDef|null} */
    this.unlistenTouchEnd_ = null;
    /** @private {UnlistenDef|null} */
    this.unlistenKeyDown_ = null;

    /** @private {number} */
    this.stepSize_ = this.element.hasAttribute('step-size') ?
      (Number(this.element.getAttribute('step-size')) || 0.1) : 0.1;

    /** @private {boolean} */
    this.disableHint_ = this.element.hasAttribute('disable-hint');
    /** @private {number} */
    this.hintInactiveInterval_ = 10000;
    /** @private {boolean} */
    this.shouldHintLoop_ = false;
    /** @private {number|null} */
    this.hintTimeoutHandle_ = null;

    this.isHintHidden_ = false;

    /** @private {boolean} */
    this.disabled_ = false; // for now, will be set later

    /** @private {MutationObserver|null} */
    this.observer_ = null;
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
      } else if (child.hasAttribute('hint') &&
          child.tagName.toLowerCase() === 'div') {
        this.hint_ = child;
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

    this.buildImages_();
    this.buildBar_();
    this.buildHint_();

    this.registerAction('seekTo', invocation => {
      const {args} = invocation;
      if (args) {
        let value;
        if (args['value'] !== undefined) {
          value = args['value'];
          user().assertNumber(value,
              'value to seek to must be a number');
        } else if (args['percent'] !== undefined) {
          value = args['percent'];
          user().assertNumber(value,
              'percent to seek to must be a number');
          value *= 0.01; // to 0-1 value
        }
        if (value !== undefined) {
          this.updatePositions_(value);
        }
      }
    }, ActionTrust.LOW);

    this.observer_ = new MutationObserver(this.mutationCallback_.bind(this));

    return Promise.resolve();
  }

  /**
   * Mutation callback, observing only [disabled] changes currently
   * @param {sequence<MutationRecord>} mutationList
   */
  mutationCallback_(mutationList) {
    for (let i = 0; i < mutationList.length; i++) {
      const mutation = mutationList[i];
      if (mutation.type === 'attributes') {
        if (mutation.attributeName === 'disabled') {
          const newDisabled = this.element.hasAttribute('disabled');
          if (newDisabled) {
            this.disable_();
          } else {
            this.enable_();
          }
        }
      }
    }
  }

  /**
   * Enable user interaction
   */
  enable_() {
    if (!this.disabled_) {
      return;
    }
    if (!this.disableHint_) {
      this.animateShowHint_();
    }
    this.registerEvents_();
    this.disabled_ = false;
  }

  /**
   * Disable user interaction
   */
  disable_() {
    if (this.disabled_) {
      return;
    }

    if (!this.disableHint_) {
      // need to clear timeout handle inside
      // thus not directly calling animateHideHint_
      this.resetHintInterval_(true);
      this.isHintHidden_ = true;
    }

    this.unregisterEvents_();
    this.disabled_ = true;
  }

  /**
   * Build images
   */
  buildImages_() {
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
   * Build bar
   */
  buildBar_() {
    this.container_.appendChild(this.bar_);
    this.bar_.appendChild(this.barStick_);

    this.bar_.classList.add('i-amphtml-image-slider-bar');
    this.barStick_.classList.add('i-amphtml-image-slider-bar-stick');
  }

  /**
   * Build hint
   */
  buildHint_() {
    if (this.hint_) {
      this.hint_.parentNode.removeChild(this.hint_);
    } else {
      this.hint_ = this.doc_.createElement('div');
    }
    if (this.disableHint_) {
      this.hint_ = null;
      return;
    }

    if (this.hint_.hasAttribute('hint-loop')) {
      this.shouldHintLoop_ = true;
    }

    if (this.hint_.hasAttribute('hint-inactive-interval')) {
      this.hintInactiveInterval_ =
          Number(this.hint_.getAttribute('hint-inactive-interval')) ||
          this.hintInactiveInterval_;
    }

    const hintIcon = htmlFor(this.doc_)
    `<div class="i-amphtml-image-slider-hint-icon">← →</div>`;

    for (let i = 0; i < this.hint_.classList.length; i++) {
      hintIcon.classList.add(this.hint_.classList[i]);
    }
    this.hint_.appendChild(hintIcon);
    this.hint_.className = '';
    this.hint_.classList.add('i-amphtml-image-slider-hint');
    setStyles(this.hint_, {
      opacity: 0.7,
    });

    this.barStick_.appendChild(this.hint_);
  }

  /**
   * Reset interval when the hint would resurface
   * @param {boolean=} opt_noRestart
   */
  resetHintInterval_(opt_noRestart) {
    if (this.disableHint_) {
      return;
    }

    if (!this.isHintHidden_) {
      this.animateHideHint_();
    }

    if (this.hintTimeoutHandle_ !== null) {
      clearTimeout(this.hintTimeoutHandle_);
    }

    if (opt_noRestart === true) {
      this.hintTimeoutHandle_ = null;
      return;
    }

    this.hintTimeoutHandle_ = setTimeout(() => {
      this.animateShowHint_();
    }, this.hintInactiveInterval_);
  }

  /**
   * Animate show hint
   */
  animateShowHint_() {
    const interpolate = numeric(
        Number(getStyle(this.hint_, 'opacity')), 0.7);
    this.isHintHidden_ = false;
    return Animation.animate(this.hint_, v => {
      setStyles(this.hint_, {
        opacity: interpolate(v),
      });
    }, 200).thenAlways();
  }

  /**
   * Animate show hint
   */
  animateHideHint_() {
    const interpolate = numeric(
        Number(getStyle(this.hint_, 'opacity')), 0);
    return Animation.animate(this.hint_, v => {
      setStyles(this.hint_, {
        opacity: interpolate(v),
      });
    }, 200).then(() => this.isHintHidden_ = true);
  }

  /**
   * Drag start
   * @param {Event} e
   */
  onMouseDown_(e) {
    e.preventDefault();
    this.pointerMoveX_(e.pageX);

    // In case, clear up remnants
    // This is to prevent right mouse button down when left still down
    this.unlisten_(this.unlistenMouseMove_);
    this.unlisten_(this.unlistenMouseUp_);

    this.unlistenMouseMove_ =
        listen(this.win, 'mousemove', this.onMouseMove_.bind(this));
    this.unlistenMouseUp_ =
        listen(this.win, 'mouseup', this.onMouseUp_.bind(this));

    this.resetHintInterval_(true);
  }

  /**
   * Drag move
   * @param {Event} e
   */
  onMouseMove_(e) {
    e.preventDefault();
    this.pointerMoveX_(e.pageX);
  }

  /**
   * Drag end
   * @param {Event} e
   */
  onMouseUp_(e) {
    e.preventDefault();
    this.unlisten_(this.unlistenMouseMove_);
    this.unlisten_(this.unlistenMouseUp_);

    this.resetHintInterval_(!this.shouldHintLoop_);
  }

  /**
   * Touch start
   * @param {Event} e
   */
  onTouchStart_(e) {
    e.stopPropagation();
    this.pointerMoveX_(e.touches[0].pageX);

    // In case, clear up remnants
    this.unlisten_(this.unlistenTouchMove_);
    this.unlisten_(this.unlistenTouchEnd_);

    this.unlistenTouchMove_ =
        listen(this.win, 'touchmove', this.onTouchMove_.bind(this));
    this.unlistenTouchEnd_ =
        listen(this.win, 'touchend', this.onTouchEnd_.bind(this));

    this.resetHintInterval_(true);
  }

  /**
   * Touch move
   * @param {Event} e
   */
  onTouchMove_(e) {
    e.stopPropagation();
    this.pointerMoveX_(e.touches[0].pageX);
  }

  /**
   * Touch end
   * @param {Event} e
   */
  onTouchEnd_(e) {
    e.stopPropagation();
    this.unlisten_(this.unlistenTouchMove_);
    this.unlisten_(this.unlistenTouchEnd_);

    this.resetHintInterval_(!this.shouldHintLoop_);
  }

  /**
   * On key down
   * @param {Event} e
   */
  onKeyDown_(e) {
    if (this.doc_.activeElement !== this.element) {
      return;
    }

    this.resetHintInterval_(!this.shouldHintLoop_);

    switch (e.key.toLowerCase()) {
      case 'arrowup':
      case 'arrowleft':
        this.stepLeft_();
        break;
      case 'arrowdown':
      case 'arrowright':
        this.stepRight_();
        break;
      case 'pageup':
        e.preventDefault();
        e.stopPropagation();
        this.stepLeft_(true);
        break;
      case 'pagedown':
        e.preventDefault();
        e.stopPropagation();
        this.stepRight_(true);
        break;
      case 'home':
        e.preventDefault();
        e.stopPropagation();
        this.stepExactCenter_();
        break;
    }
  }

  /**
   * Unlisten a listener. If null, does nothing
   * @param {UnlistenDef|null} unlistenHandle
   * @private
   */
  unlisten_(unlistenHandle) {
    if (unlistenHandle) {
      unlistenHandle();
      unlistenHandle = null;
    }
  }

  /**
   * Register events
   */
  registerEvents_() {
    this.unlistenMouseDown_ =
        listen(this.element, 'mousedown', this.onMouseDown_.bind(this));
    this.unlistenTouchStart_ =
        listen(this.element, 'touchstart', this.onTouchStart_.bind(this));
    this.unlistenKeyDown_ =
        listen(this.element, 'keydown', this.onKeyDown_.bind(this));
  }

  /**
   * Unregister events
   */
  unregisterEvents_() {
    this.unlisten_(this.unlistenMouseDown_);
    this.unlisten_(this.unlistenMouseMove_);
    this.unlisten_(this.unlistenMouseUp_);

    this.unlisten_(this.unlistenTouchStart_);
    this.unlisten_(this.unlistenTouchMove_);
    this.unlisten_(this.unlistenTouchEnd_);

    this.unlisten_(this.unlistenKeyDown_);
  }

  /**
   * Get current slider's percentage to the left
   */
  getCurrentSliderPercentage_() {
    const {left: barLeft} =
        this.bar_./*OK*/getBoundingClientRect();
    const {left: boxLeft, width: boxWidth}
    //    = this.getLayoutBox();
        = this.container_./*OK*/getBoundingClientRect();
    return (barLeft - boxLeft) / boxWidth;
  }

  /**
   * One step left
   * @param {boolean=} opt_toEnd
   */
  stepLeft_(opt_toEnd) {
    if (opt_toEnd === true) {
      this.updatePositions_(0);
    } else {
      this.updatePositions_(this.limitPercentage_(
          this.getCurrentSliderPercentage_() - this.stepSize_));
    }
  }

  /**
   * Step to the center
   */
  stepExactCenter_() {
    this.updatePositions_(0.5);
  }

  /**
   * One step right
   * @param {boolean=} opt_toEnd
   */
  stepRight_(opt_toEnd) {
    if (opt_toEnd === true) {
      this.updatePositions_(1);
    } else {
      this.updatePositions_(this.limitPercentage_(
          this.getCurrentSliderPercentage_() + this.stepSize_));
    }
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

    const newPos = Math.max(leftBound, Math.min(pointerX, rightBound));
    const newPercentage = (newPos - leftBound) / width;
    this.updatePositions_(newPercentage);
  }

  /**
   * Update element positions based on percentage
   * @param {number} leftPercentage
   */
  updatePositions_(leftPercentage) {
    leftPercentage = this.limitPercentage_(leftPercentage);

    this.updateTranslateX_(this.bar_, leftPercentage);

    this.updateTranslateX_(this.leftMask_, leftPercentage - 1);
    this.updateTranslateX_(this.leftAmpImage_, 1 - leftPercentage);
    if (this.leftLabelWrapper_) {
      this.updateTranslateX_(this.leftLabelWrapper_, 1 - leftPercentage);
    }
  }

  /**
   * Limit percentage between 0 and 1
   * @param {number} percentage
   */
  limitPercentage_(percentage) {
    return Math.max(0, Math.min(percentage, 1));
  }

  /**
   * Set translateX of the element
   * @param {Element} element
   * @param {number} percentage
   */
  updateTranslateX_(element, percentage) {
    setStyles(element, {
      transform: `translateX(${percentage * 100}%)`,
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    // From https://github.com/ampproject/amphtml/pull/16688
    user().assert(isExperimentOn(this.win, 'amp-image-slider'),
        'Experiment <amp-image-slider> disabled');

    if (this.leftAmpImage_ && this.rightAmpImage_) {
      this.scheduleLayout(this.leftAmpImage_);
      this.scheduleLayout(this.rightAmpImage_);
    }

    this.registerEvents_();

    // disabled is done here instead
    if (this.element.hasAttribute('disabled')) {
      this.disable_();
    }

    this.observer_.observe(this.element, {attributes: true});
  }

  /** @override */
  unlayoutCallback() {
    this.unregisterEvents_();
    this.observer_.disconnect();
  }

  /** @override */
  pauseCallback() {
    this.unregisterEvents_();
    this.observer_.disconnect();
  }

  /** @override */
  resumeCallback() {
    this.registerEvents_();
    this.observer_.observe(this.element, {attributes: true});
  }
}

AMP.extension('amp-image-slider', '0.2', AMP => {
  AMP.registerElement('amp-image-slider', AmpImageSlider, CSS);
});
