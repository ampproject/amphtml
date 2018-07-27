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
import {CSS} from '../../../build/amp-image-slider-0.1.css';
import {Gestures} from '../../../src/gesture';
import {Services} from '../../../src/services';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';
import {clamp} from '../../../src/utils/math';
import {dev, user} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listen} from '../../../src/event-helper';
import {setStyles} from '../../../src/style';

export class AmpImageSlider extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {Document} */
    this.doc_ = this.win.document;

    /** @private {Element|null} */
    this.container_ = null;

    /** @private {Element|null} */
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

    /** @private {Element|null} */
    this.leftMask_ = null;

    /** @private {Element|null} */
    this.rightMask_ = null;

    /** @private {Element|null} */
    this.bar_ = null;

    /** @private {Element|null} */
    this.barStick_ = null;

    /** @private {Element|null} */
    this.hint_ = null;

    /** @private {UnlistenDef|null} */
    this.unlistenMouseDown_ = null;
    /** @private {UnlistenDef|null} */
    this.unlistenMouseUp_ = null;
    /** @private {UnlistenDef|null} */
    this.unlistenMouseMove_ = null;
    /** @private {UnlistenDef|null} */
    this.unlistenKeyDown_ = null;

    // Step size on keyboard action, 0.1 = 10%
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
    /** @private {boolean} */
    this.isHintHidden_ = false;

    /** @private {boolean} */
    this.disabled_ = false; // for now, will be set later

    /** @private {Gestures|null} */
    this.gestures_ = null;
  }

  /** @override */
  buildCallback() {
    // From https://github.com/ampproject/amphtml/pull/16688
    user().assert(isExperimentOn(this.win, 'amp-image-slider'),
        'Experiment <amp-image-slider> disabled');

    const children = this.getRealChildren();

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tagName.toLowerCase() === 'amp-img') {
        // First encountered = left image
        // Second encountered = right image
        if (!this.leftAmpImage_) {
          this.leftAmpImage_ = child;
        } else if (!this.rightAmpImage_) {
          this.rightAmpImage_ = child;
        }
      }

      if (child.tagName.toLowerCase() === 'div') {
        if (child.hasAttribute('before')) {
          this.leftLabel_ = child;
        } else if (child.hasAttribute('after')) {
          this.rightLabel_ = child;
        } else if (child.hasAttribute('hint')) {
          this.hint_ = child;
        }
      }
    }

    user().assert(this.leftAmpImage_ && this.rightAmpImage_,
        '2 <amp-img>s must be provided for comparison');

    // TODO(kqian): remove this after layer launch
    if (!isExperimentOn(this.win, 'layers')) {
      // When layers not enabled
      this.setAsOwner(dev().assertElement(this.leftAmpImage_));
      this.setAsOwner(dev().assertElement(this.rightAmpImage_));
    }

    this.container_ = this.doc_.createElement('div');
    this.container_.classList.add('i-amphtml-image-slider-container');

    this.buildImageWrappers_();
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
          value *= 0.01; // percentage to 0-1 value
        }
        if (value !== undefined) {
          this.updatePositions_(value);
        }
      }
    }, ActionTrust.LOW);

    // TODO(kqian): move this before building child components on issue
    // This is the only step when content tree is attached to document
    return this.mutateElement(() => {
      this.element.appendChild(this.container_);
      // Ensure ampdoc exists on the amp-imgs
      this.leftMask_.appendChild(this.leftAmpImage_);
      this.rightMask_.appendChild(this.rightAmpImage_);
    });
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const newDisabled = mutations['disabled'];
    if (newDisabled) {
      this.disable_(); // this.disabled_ is set in this call
    } else {
      this.enable_(); // this.disabled_ is set in this call
    }
  }

  /**
   * Enable user interaction
   * @private
   */
  enable_() {
    if (!this.disabled_) {
      return;
    }
    // Show hint if needed
    if (!this.disableHint_) {
      this.animateShowHint_();
    }
    this.registerEvents_();
    this.disabled_ = false;
  }

  /**
   * Disable user interaction
   * @private
   */
  disable_() {
    if (this.disabled_) {
      return;
    }
    // Hide hint if needed
    if (!this.disableHint_) {
      // need to clear timeout handle inside
      // thus not directly calling animateHideHint_
      this.resetHintInterval_(true); // no restart
      this.isHintHidden_ = true;
    }
    this.unregisterEvents_();
    this.disabled_ = true;
  }

  /**
   * Build images
   * @private
   */
  buildImageWrappers_() {
    this.leftMask_ = this.doc_.createElement('div');
    this.rightMask_ = this.doc_.createElement('div');
    this.container_.appendChild(this.rightMask_);
    this.container_.appendChild(this.leftMask_);

    this.rightMask_.classList.add('i-amphtml-image-slider-right-mask');

    if (this.rightLabel_) {
      this.rightLabelWrapper_ = this.doc_.createElement('div');
      this.rightLabelWrapper_.classList
          .add('i-amphtml-image-slider-right-label-wrapper');
      this.rightLabel_.classList.add('i-amphtml-image-slider-right-label');
      this.rightLabelWrapper_.appendChild(this.rightLabel_);
      this.rightMask_.appendChild(this.rightLabelWrapper_);
    }

    this.leftMask_.classList.add('i-amphtml-image-slider-left-mask');
    this.leftAmpImage_.classList.add('i-amphtml-image-slider-image-on-top');

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
   * @private
   */
  buildBar_() {
    this.bar_ = this.doc_.createElement('div');
    this.barStick_ = this.doc_.createElement('div');
    this.container_.appendChild(this.bar_);
    this.bar_.appendChild(this.barStick_);

    this.bar_.classList.add('i-amphtml-image-slider-bar');
    this.barStick_.classList.add('i-amphtml-image-slider-bar-stick');
  }

  /**
   * Build hint
   * @private
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

    this.barStick_.appendChild(this.hint_);
  }

  /**
   * Install gestures for touch
   * @private
   */
  registerTouchGestures_() {
    if (this.gestures_) {
      return;
    }

    this.gestures_ = Gestures.get(this.element);

    this.gestures_.onGesture(SwipeXRecognizer, e => {
      // We need the initial offset, yet gesture event seems not providing
      if (e.data.first) {
        // Disable hint reappearance timeout if needed
        this.resetHintInterval_(true);
      }
      this.pointerMoveX_(
          e.data.startX + e.data.deltaX);
      if (e.data.last) {
        // Reset hint reappearance timeout if needed
        this.resetHintInterval_(!this.shouldHintLoop_);
      }
    });

    this.gestures_.onPointerDown(e => {
      // Ensure touchstart changes slider position
      this.pointerMoveX_(e.touches[0].pageX);
      // Use !this.shouldHintLoop here
      // It is possible that after onPointerDown
      // SwipeXRecognizer callback is not triggered
      this.resetHintInterval_(!this.shouldHintLoop_);
    });
  }

  /**
   * Uninstall gestures for touch
   * @private
   */
  unregisterTouchGestures_() {
    if (!this.gestures_) {
      return;
    }
    this.gestures_.cleanup();
    this.gestures_ = null;
  }

  /**
   * Reset interval when the hint would reappear
   * Call this when an user interaction is done
   * Specify opt_noRestart to true if no intent to start a timeout for
   * showing hint again.
   * @param {boolean=} opt_noRestart
   * @private
   */
  resetHintInterval_(opt_noRestart) {
    if (this.disableHint_) {
      return;
    }

    if (!this.isHintHidden_) {
      this.animateHideHint_();
    }

    if (this.hintTimeoutHandle_ !== null) {
      Services.timerFor(this.win).cancel(this.hintTimeoutHandle_);
    }

    if (opt_noRestart === true) {
      this.hintTimeoutHandle_ = null;
      return;
    }

    // Use timer instead of default setTimeout
    this.hintTimeoutHandle_ = Services.timerFor(this.win).delay(() => {
      this.animateShowHint_();
    }, this.hintInactiveInterval_);
  }

  /**
   * Show hint with animation
   * @private
   */
  animateShowHint_() {
    this.hint_.classList.remove('i-amphtml-image-slider-hint-hidden');
    this.isHintHidden_ = false;
  }

  /**
   * Hide hint with animation
   * @private
   */
  animateHideHint_() {
    this.hint_.classList.add('i-amphtml-image-slider-hint-hidden');
    this.isHintHidden_ = true;
  }

  /**
   * Handler on mouse button down
   * @param {Event} e
   * @private
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
   * Handler on mouse move
   * @param {Event} e
   * @private
   */
  onMouseMove_(e) {
    e.preventDefault();
    this.pointerMoveX_(e.pageX);
  }

  /**
   * Handler on mouse button up
   * @param {Event} e
   * @private
   */
  onMouseUp_(e) {
    e.preventDefault();
    this.unlisten_(this.unlistenMouseMove_);
    this.unlisten_(this.unlistenMouseUp_);

    this.resetHintInterval_(!this.shouldHintLoop_);
  }

  /**
   * Handler on key down
   * @param {Event} e
   * @private
   */
  onKeyDown_(e) {
    // Check if current element has focus
    if (this.doc_.activeElement !== this.element) {
      return;
    }

    this.resetHintInterval_(!this.shouldHintLoop_);

    switch (e.key.toLowerCase()) {
      case 'arrowleft':
        this.stepLeft_();
        break;
      case 'arrowright':
        this.stepRight_();
        break;
      case 'pageup':
        // prevent scrolling the page
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
   * Unlisten a listener and clear. If null, does nothing
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
   * @private
   */
  registerEvents_() {
    this.unlistenMouseDown_ =
        listen(dev().assertElement(this.container_),
            'mousedown', this.onMouseDown_.bind(this));
    this.unlistenKeyDown_ =
        listen(this.element, 'keydown', this.onKeyDown_.bind(this));
    this.registerTouchGestures_();
  }

  /**
   * Unregister events
   * @private
   */
  unregisterEvents_() {
    this.unlisten_(this.unlistenMouseDown_);
    this.unlisten_(this.unlistenMouseMove_);
    this.unlisten_(this.unlistenMouseUp_);
    this.unlisten_(this.unlistenKeyDown_);
    this.unregisterTouchGestures_();
  }

  /**
   * Get current slider's percentage to the left
   * Should be wrapped inside measureElement
   * @private
   */
  getCurrentSliderPercentage_() {
    const {left: barLeft} =
        this.bar_./*OK*/getBoundingClientRect();
    const {left: boxLeft, width: boxWidth} = this.getLayoutBox();
    return (barLeft - boxLeft) / boxWidth;
  }

  /**
   * One step left
   * @param {boolean=} opt_toEnd
   * @private
   */
  stepLeft_(opt_toEnd) {
    // To the very end of left
    if (opt_toEnd === true) {
      this.mutateElement(() => {
        this.updatePositions_(0);
      });
    } else {
      let newPercentage;
      this.measureMutateElement(() => {
        newPercentage = this.limitPercentage_(
            this.getCurrentSliderPercentage_() - this.stepSize_);
      }, () => {
        this.updatePositions_(newPercentage);
      });
    }
  }

  /**
   * Step to the center
   * @private
   */
  stepExactCenter_() {
    this.mutateElement(() => {
      this.updatePositions_(0.5);
    });
  }

  /**
   * One step right
   * @param {boolean=} opt_toEnd
   * @private
   */
  stepRight_(opt_toEnd) {
    // To the very end of right
    if (opt_toEnd === true) {
      this.mutateElement(() => {
        this.updatePositions_(1);
      });
    } else {
      let newPercentage;
      this.measureMutateElement(() => {
        newPercentage = this.limitPercentage_(
            this.getCurrentSliderPercentage_() + this.stepSize_);
      }, () => {
        this.updatePositions_(newPercentage);
      });
    }
  }

  /**
   * Move slider based on given pointer x position
   * Do NOT wrap this in mutateElement!
   * @param {number} pointerX
   * @private
   */
  pointerMoveX_(pointerX) {
    const {width, left, right} = this.getLayoutBox();
    const newPos = Math.max(left, Math.min(pointerX, right));
    const newPercentage = (newPos - left) / width;
    this.mutateElement(() => {
      this.updatePositions_(newPercentage);
    });
  }

  /**
   * Update element positions based on percentage
   * Should be wrapped inside mutateElement
   * @param {number} leftPercentage
   * @private
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
   * @private
   */
  limitPercentage_(percentage) {
    return clamp(percentage, 0, 1);
  }

  /**
   * Set translateX of the element
   * Only used in updatePositions_, which should be wrapped in mutateElement
   * @param {Element} element
   * @param {number} percentage
   * @private
   */
  updateTranslateX_(element, percentage) {
    setStyles(dev().assertElement(element), {
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

    // TODO(kqian): remove this after layer launch
    if (!isExperimentOn(this.win, 'layers')) {
      this.scheduleLayout(dev().assertElement(this.leftAmpImage_));
      this.scheduleLayout(dev().assertElement(this.rightAmpImage_));
    }

    this.registerEvents_();

    // disabled is checked here instead, after all construction is done
    if (this.element.hasAttribute('disabled')) {
      this.disable_();
    }

    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.unregisterEvents_();
    return true;
  }

  /** @override */
  pauseCallback() {
    this.unregisterEvents_();
  }

  /** @override */
  resumeCallback() {
    this.registerEvents_();
  }
}

AMP.extension('amp-image-slider', '0.1', AMP => {
  AMP.registerElement('amp-image-slider', AmpImageSlider, CSS);
});
