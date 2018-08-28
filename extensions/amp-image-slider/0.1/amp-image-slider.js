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
import {CommonSignals} from '../../../src/common-signals';
import {Gestures} from '../../../src/gesture';
import {Services} from '../../../src/services';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';
import {clamp} from '../../../src/utils/math';
import {dev, user} from '../../../src/log';
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
    this.hintLeftArrow_ = null;
    /** @private {Element|null} */
    this.hintRightArrow_ = null;
    /** @private {Element|null} */
    this.hintLeftBody_ = null;
    /** @private {Element|null} */
    this.hintRightBody_ = null;

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
    this.shouldHintReappear_ =
      !this.element.hasAttribute('disable-hint-reappear');

    /** @private {Gestures|null} */
    this.gestures_ = null;

    /** @private {boolean} */
    this.isEdge_ = Services.platformFor(this.win).isEdge();

    /** @public {boolean} */
    this.isEventRegistered = false; // for test purpose
  }

  /** @override */
  buildCallback() {
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
        } else {
          user().error('AMP-IMAGE-SLIDER',
              'Should not contain more than 2 <amp-img>s.');
        }
      } else if (child.tagName.toLowerCase() === 'div') {
        if (child.hasAttribute('first')) {
          this.leftLabel_ = child;
        } else if (child.hasAttribute('second')) {
          this.rightLabel_ = child;
        } else {
          user().error('AMP-IMAGE-SLIDER',
              'Should not contain <div>s without ' +
              '"first" or "second" attributes.');
        }
      }
    }

    user().assert(this.leftAmpImage_ && this.rightAmpImage_,
        '2 <amp-img>s must be provided for comparison');

    // TODO(kqian): remove this after layer launch
    if (!isExperimentOn(this.win, 'layers')) {
      // see comment in layoutCallback
      // When layers not enabled
      this.setAsOwner(dev().assertElement(this.leftAmpImage_));
      this.setAsOwner(dev().assertElement(this.rightAmpImage_));
    }

    this.container_ = this.doc_.createElement('div');
    this.container_.classList.add('i-amphtml-image-slider-container');

    this.buildImageWrappers_();
    this.buildBar_();
    // Notice: hints are attached after amp-img finished loading
    this.buildHint_();
    this.checkARIA_();

    this.registerAction('seekTo', invocation => {
      const {args} = invocation;
      if (args) {
        if (args['percent'] !== undefined) {
          const percent = args['percent'];
          user().assertNumber(percent,
              'value to seek to must be a number');
          this.mutateElement(() => {
            this.updatePositions_(percent);
          });
        }
      }
    }, ActionTrust.LOW);

    const initialPositionString =
        this.element.getAttribute('initial-slider-position');
    // TODO(kqian): move this before building child components on issue
    // This is the only step when content tree is attached to document
    return this.mutateElement(() => {
      this.element.appendChild(this.container_);
      // Ensure ampdoc exists on the amp-imgs
      this.leftMask_.appendChild(this.leftAmpImage_);
      this.rightMask_.appendChild(this.rightAmpImage_);
      // Set initial positioning
      if (initialPositionString) {
        const initialPosition = Number(initialPositionString);
        this.updatePositions_(initialPosition);
      }
      // Prevent Edge horizontal swipe for go back/forward
      if (this.isEdge_) {
        setStyles(this.element, {
          'touch-action': 'pan-y', // allow browser only default y behavior
        });
      }
    });
  }

  /**
   * Build images
   * @private
   */
  buildImageWrappers_() {
    this.leftMask_ = this.doc_.createElement('div');
    this.rightMask_ = this.doc_.createElement('div');
    this.container_.appendChild(this.leftMask_);
    this.container_.appendChild(this.rightMask_);

    this.leftMask_.classList.add('i-amphtml-image-slider-left-mask');

    if (this.leftLabel_) {
      this.leftLabelWrapper_ = this.doc_.createElement('div');
      this.leftLabelWrapper_.classList
          .add('i-amphtml-image-slider-label-wrapper');
      this.leftLabelWrapper_.appendChild(this.leftLabel_);
      this.leftMask_.appendChild(this.leftLabelWrapper_);
    }

    this.rightMask_.classList.add('i-amphtml-image-slider-right-mask');
    this.rightMask_.classList.add('i-amphtml-image-slider-push-right');
    this.rightAmpImage_.classList.add('i-amphtml-image-slider-push-left');
    if (this.rightLabel_) {
      this.rightLabelWrapper_ = this.doc_.createElement('div');
      this.rightLabelWrapper_.classList
          .add('i-amphtml-image-slider-label-wrapper');
      this.rightLabelWrapper_.classList
          .add('i-amphtml-image-slider-push-left');
      this.rightLabelWrapper_.appendChild(this.rightLabel_);
      this.rightMask_.appendChild(this.rightLabelWrapper_);
    }
  }

  /**
   * Build bar
   * @private
   */
  buildBar_() {
    this.bar_ = this.doc_.createElement('div');
    this.barStick_ = this.doc_.createElement('div');
    this.bar_.appendChild(this.barStick_);

    this.bar_.classList.add('i-amphtml-image-slider-bar');
    this.bar_.classList.add('i-amphtml-image-slider-push-right');
    this.barStick_.classList.add('i-amphtml-image-slider-bar-stick');
    this.barStick_.classList.add('i-amphtml-image-slider-push-left');

    this.container_.appendChild(this.bar_);
  }

  /**
   * Build hint
   * @private
   */
  buildHint_() {
    // Switch to attach left and right hint separately
    // and translate each of the two independently.
    // This addresses:
    // 1. Safari glitch that causes flashing arrows when 2 arrows are placed
    //   in any kind of normal DOM flow (inline-block, flex, grid, etc.)
    // 2. Edge glitch that forgets to update second child position if its
    //   parent have updated its own transform
    this.hintLeftBody_ = this.doc_.createElement('div');
    this.hintLeftBody_.classList.add('i-amphtml-image-slider-hint');
    this.hintRightBody_ = this.doc_.createElement('div');
    this.hintRightBody_.classList.add('i-amphtml-image-slider-hint');

    const leftHintWrapper = this.doc_.createElement('div');
    leftHintWrapper.classList.add('i-amphtml-image-slider-hint-left-wrapper');
    const rightHintWrapper = this.doc_.createElement('div');
    rightHintWrapper.classList.add('i-amphtml-image-slider-hint-right-wrapper');

    this.hintLeftArrow_ = this.doc_.createElement('div');
    this.hintLeftArrow_.classList.add('amp-image-slider-hint-left');
    this.hintRightArrow_ = this.doc_.createElement('div');
    this.hintRightArrow_.classList.add('amp-image-slider-hint-right');

    leftHintWrapper.appendChild(this.hintLeftArrow_);
    rightHintWrapper.appendChild(this.hintRightArrow_);
    this.hintLeftBody_.appendChild(leftHintWrapper);
    this.hintRightBody_.appendChild(rightHintWrapper);
    // Notice: hints are attached after amp-img finished loading
  }

  /**
   * Check if aria attributes are correctly set
   * If not, apply default and warn user in console
   * @private
   */
  checkARIA_() {
    const leftAmpImage = dev().assertElement(this.leftAmpImage_);
    const rightAmpImage = dev().assertElement(this.rightAmpImage_);
    leftAmpImage.signals().whenSignal(CommonSignals.LOAD_END).then(() => {
      if (leftAmpImage.childElementCount > 0) {
        const img = leftAmpImage.querySelector('img');
        let newAltText;
        this.measureMutateElement(() => {
          const ariaSuffix =
            leftAmpImage.getAttribute('data-left-image-aria-suffix')
              || 'left image';
          if (leftAmpImage.hasAttribute('alt')) {
            newAltText = `${leftAmpImage.getAttribute('alt')}, ${ariaSuffix}`;
          } else {
            newAltText = ariaSuffix;
          }
        }, () => {
          img.setAttribute('alt', newAltText);
        });
      }
    });
    rightAmpImage.signals().whenSignal(CommonSignals.LOAD_END).then(() => {
      if (rightAmpImage.childElementCount > 0) {
        const img = rightAmpImage.querySelector('img');
        let newAltText;
        this.measureMutateElement(() => {
          const ariaSuffix =
            rightAmpImage.getAttribute('data-right-image-aria-suffix')
              || 'right image';
          if (rightAmpImage.hasAttribute('alt')) {
            newAltText = `${rightAmpImage.getAttribute('alt')}, ${ariaSuffix}`;
          } else {
            newAltText = ariaSuffix;
          }
        }, () => {
          img.setAttribute('alt', newAltText);
        });
      }
    });
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
      if (e.data.first) {
        // Disable hint reappearance timeout if needed
        this.animateHideHint_();
      }
      this.pointerMoveX_(
          e.data.startX + e.data.deltaX);
    });

    this.gestures_.onPointerDown(e => {
      // Ensure touchstart changes slider position
      this.pointerMoveX_(e.touches[0].pageX, true);
      this.animateHideHint_();
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
   * Show hint with animation
   * @private
   */
  animateShowHint_() {
    this.mutateElement(() => {
      this.hintLeftBody_.classList
          .remove('i-amphtml-image-slider-hint-hidden');
      this.hintRightBody_.classList
          .remove('i-amphtml-image-slider-hint-hidden');
    });
  }

  /**
   * Hide hint with animation
   * @private
   */
  animateHideHint_() {
    this.mutateElement(() => {
      this.hintLeftBody_.classList.add('i-amphtml-image-slider-hint-hidden');
      this.hintRightBody_.classList.add('i-amphtml-image-slider-hint-hidden');
    });
  }

  /**
   * Handler on mouse button down
   * @param {Event} e
   * @private
   */
  onMouseDown_(e) {
    e.preventDefault();
    this.pointerMoveX_(e.pageX, true);

    // In case, clear up remnants
    // This is to prevent right mouse button down when left still down
    this.unlisten_(this.unlistenMouseMove_);
    this.unlisten_(this.unlistenMouseUp_);

    this.unlistenMouseMove_ =
        listen(this.win, 'mousemove', this.onMouseMove_.bind(this));
    this.unlistenMouseUp_ =
        listen(this.win, 'mouseup', this.onMouseUp_.bind(this));

    this.animateHideHint_();
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

    this.animateHideHint_();

    switch (e.key.toLowerCase()) {
      case 'left': // Edge non-standard, pre EdgeHTML 17
      case 'arrowleft':
        e.preventDefault();
        e.stopPropagation();
        this.stepLeft_();
        break;
      case 'right': // Edge non-standard, pre EdgeHTML 17
      case 'arrowright':
        e.preventDefault();
        e.stopPropagation();
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
    if (this.isEventRegistered) {
      return;
    }
    this.unlistenMouseDown_ =
        listen(this.element, 'mousedown', this.onMouseDown_.bind(this));
    this.unlistenKeyDown_ =
        listen(this.element, 'keydown', this.onKeyDown_.bind(this));
    this.registerTouchGestures_();
    this.isEventRegistered = true;
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
    this.isEventRegistered = false;
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
   * @param {boolean} opt_recal recalibrate rect
   * @private
   */
  pointerMoveX_(pointerX, opt_recal = false) {
    if (!opt_recal) {
      const {width, left, right} = this.getLayoutBox();
      const newPos = Math.max(left, Math.min(pointerX, right));
      const newPercentage = (newPos - left) / width;
      this.mutateElement(() => {
        this.updatePositions_(newPercentage);
      });
    } else {
      // Fix cases where getLayoutBox() cannot be trusted (when in carousel)!
      // This is to address the "snap to leftmost" bug that occurs on
      // pointer down after scrolling away and back 3+ slides
      // layoutBox is not updated correctly when first landed on page
      let width, left, right;
      this.measureMutateElement(() => {
        const rect = this.element./*OK*/getBoundingClientRect();
        width = rect.width;
        left = rect.left;
        right = rect.right;
      }, () => {
        const newPos = Math.max(left, Math.min(pointerX, right));
        const newPercentage = (newPos - left) / width;
        this.updatePositions_(newPercentage);
      });
    }
  }

  /**
   * Update element positions based on percentage
   * Should be wrapped inside mutateElement
   * @param {number} percentFromLeft
   * @private
   */
  updatePositions_(percentFromLeft) {
    percentFromLeft = this.limitPercentage_(percentFromLeft);

    this.updateTranslateX_(this.bar_, percentFromLeft);
    this.updateTranslateX_(this.rightMask_, percentFromLeft);
    this.updateTranslateX_(this.rightAmpImage_, -percentFromLeft);
    const adjustedDeltaFromLeft = percentFromLeft - 0.5;
    this.updateTranslateX_(this.hintLeftBody_, adjustedDeltaFromLeft);
    this.updateTranslateX_(this.hintRightBody_, adjustedDeltaFromLeft);
    if (this.rightLabelWrapper_) {
      this.updateTranslateX_(this.rightLabelWrapper_, -percentFromLeft);
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
    // Extensions such as amp-carousel still uses .setAsOwner()
    // This would break the rendering of the images as carousel
    // will call .scheduleLayout on the slider but not the contents
    // while Resources would found amp-imgs' parent has owner and
    // refuse to run the normal scheduling in discoverWork_.
    // SIMPLER SOL: simply always call scheduleLayout no matter what
    this.scheduleLayout(dev().assertElement(this.leftAmpImage_));
    this.scheduleLayout(dev().assertElement(this.rightAmpImage_));

    this.registerEvents_();

    return Promise.all([
      dev().assertElement(this.leftAmpImage_)
          .signals().whenSignal(CommonSignals.LOAD_END),
      dev().assertElement(this.rightAmpImage_)
          .signals().whenSignal(CommonSignals.LOAD_END),
    ]).then(() => {
      // Notice: hints are attached after amp-img finished loading
      this.container_.appendChild(this.hintLeftBody_);
      this.container_.appendChild(this.hintRightBody_);
    }, () => {
      // Do the same thing when signal rejects
      this.container_.appendChild(this.hintLeftBody_);
      this.container_.appendChild(this.hintRightBody_);
    });
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

  /** @override */
  viewportCallback(inViewport) {
    // Show hint if back into viewport and user does not explicitly
    // disable this
    if (inViewport && this.shouldHintReappear_) {
      this.animateShowHint_();
    }
  }
}

AMP.extension('amp-image-slider', '0.1', AMP => {
  AMP.registerElement('amp-image-slider', AmpImageSlider, CSS);
});
