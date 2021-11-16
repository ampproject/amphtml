import {ActionTrust_Enum} from '#core/constants/action-constants';
import {CommonSignals_Enum} from '#core/constants/common-signals';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {observeIntersections} from '#core/dom/layout/viewport-observer';
import {realChildElements} from '#core/dom/query';
import {htmlFor} from '#core/dom/static-template';
import {setStyle} from '#core/dom/style';
import {clamp} from '#core/math';

import {Services} from '#service';

import {listen, loadPromise} from '#utils/event-helper';
import {dev, user, userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-image-slider-0.1.css';
import {Gestures} from '../../../src/gesture';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';

const VALID_IMAGE_TAGNAMES = new Set(['AMP-IMG', 'IMG']);

export class AmpImageSlider extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {Document} */
    this.doc_ = this.win.document;

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?Element} */
    this.leftImage_ = null;
    /** @private {?Element} */
    this.rightImage_ = null;
    /** @private {boolean} */
    this.containsAmpImages_ = false;

    /** @private {?Element} */
    this.leftLabelWrapper_ = null;
    /** @private {?Element} */
    this.leftLabel_ = null;

    /** @private {?Element} */
    this.rightLabelWrapper_ = null;
    /** @private {?Element} */
    this.rightLabel_ = null;

    /** @private {?Element} */
    this.leftMask_ = null;
    /** @private {?Element} */
    this.rightMask_ = null;

    /** @private {?Element} */
    this.bar_ = null;

    /** @private {?Element} */
    this.hintLeftArrow_ = null;
    /** @private {?Element} */
    this.hintRightArrow_ = null;
    /** @private {?Element} */
    this.hintLeftBody_ = null;
    /** @private {?Element} */
    this.hintRightBody_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenMouseDown_ = null;
    /** @private {?UnlistenDef} */
    this.unlistenMouseUp_ = null;
    /** @private {?UnlistenDef} */
    this.unlistenMouseMove_ = null;
    /** @private {?UnlistenDef} */
    this.unlistenKeyDown_ = null;

    // Step size on keyboard action, 0.1 = 10%
    /** @private {number} */
    this.stepSize_ = this.element.hasAttribute('step-size')
      ? Number(this.element.getAttribute('step-size')) || 0.1
      : 0.1;

    /** @private {boolean} */
    this.shouldHintReappear_ = !this.element.hasAttribute(
      'disable-hint-reappear'
    );

    /** @private {?Gestures} */
    this.gestures_ = null;

    /** @private {boolean} */
    this.isEdge_ = Services.platformFor(this.win).isEdge();

    /** @public {boolean} */
    this.isEventRegistered = false; // for test purpose

    /** @private {?UnlistenDef} */
    this.unobserveIntersections_ = null;
  }

  /** @override */
  buildCallback() {
    const children = realChildElements(this.element);

    for (const child of children) {
      if (VALID_IMAGE_TAGNAMES.has(child.tagName)) {
        // First encountered = left image
        // Second encountered = right image
        if (!this.leftImage_) {
          this.leftImage_ = child;
        } else if (!this.rightImage_) {
          this.rightImage_ = child;
        } else {
          user().error(
            'AMP-IMAGE-SLIDER',
            'Should not contain more than 2 images.'
          );
        }
      } else if (child.tagName === 'DIV') {
        if (child.hasAttribute('first')) {
          this.leftLabel_ = child;
        } else if (child.hasAttribute('second')) {
          this.rightLabel_ = child;
        } else {
          user().error(
            'AMP-IMAGE-SLIDER',
            'Should not contain <div>s without ' +
              '"first" or "second" attributes.'
          );
        }
      }
    }

    userAssert(
      this.leftImage_ && this.rightImage_,
      '2 images must be provided for comparison'
    );

    // see comment in layoutCallback
    // When layers not enabled
    const owners = Services.ownersForDoc(this.element);
    if (this.leftImage_.tagName === 'AMP-IMG') {
      owners.setOwner(dev().assertElement(this.leftImage_), this.element);
      this.containsAmpImages_ = true;
    }
    if (this.rightImage_.tagName === 'AMP-IMG') {
      owners.setOwner(dev().assertElement(this.rightImage_), this.element);
      this.containsAmpImages_ = true;
    }

    this.container_ = htmlFor(
      this.doc_
    )`<div class='i-amphtml-image-slider-container'></div>`;

    this.buildImageWrappers_();
    this.buildBar_();
    // Notice: hints are attached after amp-img finished loading
    this.buildHint_();
    this.checkARIA_();

    this.registerAction(
      'seekTo',
      (invocation) => {
        const {args} = invocation;
        if (args) {
          if (args['percent'] !== undefined) {
            const percent = args['percent'];
            user().assertNumber(percent, 'value to seek to must be a number');
            this.mutateElement(() => {
              this.updatePositions_(percent);
            });
          }
        }
      },
      ActionTrust_Enum.LOW
    );

    const initialPositionString = this.element.getAttribute(
      'initial-slider-position'
    );
    // TODO(kqian): move this before building child components on issue
    // This is the only step when content tree is attached to document
    return this.mutateElement(() => {
      this.element.appendChild(this.container_);
      // Ensure ampdoc exists on the amp-imgs
      this.leftMask_.appendChild(this.leftImage_);
      this.rightMask_.appendChild(this.rightImage_);
      // Set initial positioning
      if (initialPositionString) {
        const initialPosition = Number(initialPositionString);
        this.updatePositions_(initialPosition);
      }
      // Prevent Edge horizontal swipe for go back/forward
      if (this.isEdge_) {
        setStyle(this.element, 'touch-action', 'pan-y'); // allow browser only default y behavior
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
      this.leftLabelWrapper_.classList.add(
        'i-amphtml-image-slider-label-wrapper'
      );
      this.leftLabelWrapper_.appendChild(this.leftLabel_);
      this.leftMask_.appendChild(this.leftLabelWrapper_);
    }

    this.rightMask_.classList.add('i-amphtml-image-slider-right-mask');
    this.rightMask_.classList.add('i-amphtml-image-slider-push-right');
    this.rightImage_.classList.add('i-amphtml-image-slider-push-left');
    if (this.rightLabel_) {
      this.rightLabelWrapper_ = this.doc_.createElement('div');
      this.rightLabelWrapper_.classList.add(
        'i-amphtml-image-slider-label-wrapper'
      );
      this.rightLabelWrapper_.classList.add('i-amphtml-image-slider-push-left');
      this.rightLabelWrapper_.appendChild(this.rightLabel_);
      this.rightMask_.appendChild(this.rightLabelWrapper_);
    }
  }

  /**
   * Build bar
   * @private
   */
  buildBar_() {
    this.bar_ = htmlFor(
      this.doc_
    )`<div class='i-amphtml-image-slider-bar i-amphtml-image-slider-push-right'>
      <div class='i-amphtml-image-slider-bar-stick i-amphtml-image-slider-push-left'></div>
    </div>`;

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
    if (!this.containsAmpImages_) {
      return;
    }

    // Only if there are AMP-IMG Elements in use should this pathway execute.
    const leftAmpImage = dev().assertElement(this.leftImage_);
    const rightAmpImage = dev().assertElement(this.rightImage_);
    leftAmpImage
      .signals()
      .whenSignal(CommonSignals_Enum.LOAD_END)
      .then(() => {
        if (leftAmpImage.childElementCount > 0) {
          const img = leftAmpImage.querySelector('img');
          let newAltText;
          this.measureMutateElement(
            () => {
              const ariaSuffix =
                leftAmpImage.getAttribute('data-left-image-aria-suffix') ||
                'left image';
              if (leftAmpImage.hasAttribute('alt')) {
                newAltText = `${leftAmpImage.getAttribute(
                  'alt'
                )}, ${ariaSuffix}`;
              } else {
                newAltText = ariaSuffix;
              }
            },
            () => {
              img.setAttribute('alt', newAltText);
            }
          );
        }
      });
    rightAmpImage
      .signals()
      .whenSignal(CommonSignals_Enum.LOAD_END)
      .then(() => {
        if (rightAmpImage.childElementCount > 0) {
          const img = rightAmpImage.querySelector('img');
          let newAltText;
          this.measureMutateElement(
            () => {
              const ariaSuffix =
                rightAmpImage.getAttribute('data-right-image-aria-suffix') ||
                'right image';
              if (rightAmpImage.hasAttribute('alt')) {
                newAltText = `${rightAmpImage.getAttribute(
                  'alt'
                )}, ${ariaSuffix}`;
              } else {
                newAltText = ariaSuffix;
              }
            },
            () => {
              img.setAttribute('alt', newAltText);
            }
          );
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

    this.gestures_.onGesture(SwipeXRecognizer, (e) => {
      if (e.data.first) {
        // Disable hint reappearance timeout if needed
        this.animateHideHint_();
      }
      this.pointerMoveX_(e.data.startX + e.data.deltaX);
    });

    this.gestures_.onPointerDown((e) => {
      // Ensure touchstart changes slider position
      this.pointerMoveX_(e.touches[0].pageX);
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
      this.hintLeftBody_.classList.remove('i-amphtml-image-slider-hint-hidden');
      this.hintRightBody_.classList.remove(
        'i-amphtml-image-slider-hint-hidden'
      );
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
    this.pointerMoveX_(e.pageX);

    // In case, clear up remnants
    // This is to prevent right mouse button down when left still down
    this.unlisten_(this.unlistenMouseMove_);
    this.unlisten_(this.unlistenMouseUp_);

    this.unlistenMouseMove_ = listen(
      this.win,
      'mousemove',
      this.onMouseMove_.bind(this)
    );
    this.unlistenMouseUp_ = listen(
      this.win,
      'mouseup',
      this.onMouseUp_.bind(this)
    );

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
   * @param {?UnlistenDef} unlistenHandle
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
    this.unlistenMouseDown_ = listen(
      this.element,
      'mousedown',
      this.onMouseDown_.bind(this)
    );
    this.unlistenKeyDown_ = listen(
      this.element,
      'keydown',
      this.onKeyDown_.bind(this)
    );
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
   * @return {number}
   */
  getCurrentSliderPercentage_() {
    const {left: barLeft} = this.bar_./*OK*/ getBoundingClientRect();
    const {left: boxLeft, width: boxWidth} =
      this.element./*OK*/ getBoundingClientRect();
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
      this.measureMutateElement(
        () => {
          newPercentage = this.limitPercentage_(
            this.getCurrentSliderPercentage_() - this.stepSize_
          );
        },
        () => {
          this.updatePositions_(newPercentage);
        }
      );
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
      this.measureMutateElement(
        () => {
          newPercentage = this.limitPercentage_(
            this.getCurrentSliderPercentage_() + this.stepSize_
          );
        },
        () => {
          this.updatePositions_(newPercentage);
        }
      );
    }
  }

  /**
   * Move slider based on given pointer x position
   * Do NOT wrap this in mutateElement!
   * @param {number} pointerX
   * @private
   */
  pointerMoveX_(pointerX) {
    let width, left, right;
    // This is to address the "snap to leftmost" bug that occurs on
    // pointer down after scrolling away and back 3+ slides
    // layoutBox is not updated correctly when first landed on page
    this.measureMutateElement(
      () => {
        const rect = this.element./*OK*/ getBoundingClientRect();
        width = rect.width;
        left = rect.left;
        right = rect.right;
      },
      () => {
        const newPos = clamp(pointerX, left, right);
        const newPercentage = (newPos - left) / width;
        this.updatePositions_(newPercentage);
      }
    );
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
    this.updateTranslateX_(this.rightImage_, -percentFromLeft);
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
   * @return {number}
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
    setStyle(
      dev().assertElement(element),
      'transform',
      `translateX(${percentage * 100}%)`
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    this.unobserveIntersections_ = observeIntersections(
      this.element,
      ({isIntersecting}) => this.viewportCallback_(isIntersecting)
    );

    const appendHints = () => {
      this.container_.appendChild(this.hintLeftBody_);
      this.container_.appendChild(this.hintRightBody_);
    };

    this.registerEvents_();

    if (this.containsAmpImages_) {
      // Extensions such as amp-carousel still uses .setOwner()
      // This would break the rendering of the images as carousel
      // will call .scheduleLayout on the slider but not the contents
      // while Resources would found amp-imgs' parent has owner and
      // refuse to run the normal scheduling in discoverWork_.
      // SIMPLER SOL: simply always call scheduleLayout no matter what
      const owners = Services.ownersForDoc(this.element);
      owners.scheduleLayout(this.element, dev().assertElement(this.leftImage_));
      owners.scheduleLayout(
        this.element,
        dev().assertElement(this.rightImage_)
      );

      return Promise.all([
        dev()
          .assertElement(this.leftImage_)
          .signals()
          .whenSignal(CommonSignals_Enum.LOAD_END),
        dev()
          .assertElement(this.rightImage_)
          .signals()
          .whenSignal(CommonSignals_Enum.LOAD_END),
      ]).then(appendHints, appendHints);
    }

    return Promise.all([
      loadPromise(this.leftImage_),
      loadPromise(this.rightImage_),
    ]).then(appendHints, appendHints);
  }

  /** @override */
  unlayoutCallback() {
    this.unobserveIntersections_?.();
    this.unobserveIntersections_ = null;
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

  /**
   * @param {boolean} inViewport
   * @private
   */
  viewportCallback_(inViewport) {
    // Show hint if back into viewport and user does not explicitly
    // disable this
    if (inViewport && this.shouldHintReappear_) {
      this.animateShowHint_();
    }
  }
}

AMP.extension('amp-image-slider', '0.1', (AMP) => {
  AMP.registerElement('amp-image-slider', AmpImageSlider, CSS);
});
