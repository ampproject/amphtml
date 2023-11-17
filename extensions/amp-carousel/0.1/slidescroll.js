import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Keys_Enum} from '#core/constants/key-codes';
import {bezierCurve} from '#core/data-structures/curve';
import {dispatchCustomEvent} from '#core/dom';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {
  observeContentSize,
  unobserveContentSize,
} from '#core/dom/layout/size-observer';
import {observeIntersections} from '#core/dom/layout/viewport-observer';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {getStyle, setStyle} from '#core/dom/style';
import {numeric} from '#core/dom/transition';
import {isFiniteNumber} from '#core/types';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {triggerAnalyticsEvent} from '#utils/analytics';
import {Animation} from '#utils/animation';
import {createCustomEvent, listen} from '#utils/event-helper';
import {dev, user, userAssert} from '#utils/log';

import {
  ClassNames,
  buildDom,
  getNextButtonTitle,
  getPrevButtonTitle,
} from './build-dom';
import {CarouselControls} from './carousel-controls';

/** @const {string} */

/** @const {number} */
const NATIVE_SNAP_TIMEOUT = 200;

/** @const {number} */
const IOS_CUSTOM_SNAP_TIMEOUT = 45;

/** @const {number} */
const NATIVE_TOUCH_TIMEOUT = 100;

/** @const {number} */
const IOS_TOUCH_TIMEOUT = 45;

/** @const {number} */
const CUSTOM_SNAP_TIMEOUT = 100;

const TAG = 'AMP-CAROUSEL';

export class AmpSlideScroll extends AMP.BaseElement {
  /** @param {AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = null;

    /** @private {boolean} */
    this.hasNativeSnapPoints_ = false;

    /** @private {Array<Element>} */
    this.slides_ = [];

    /** @private {number} */
    this.noOfSlides_ = 0;

    /** @private {?Element} */
    this.slidesContainer_ = null;

    /** @private {Array<Element>} */
    this.slideWrappers_ = [];

    /** @private {boolean} */
    this.snappingInProgress_ = false;

    /** @private {?number} */
    this.scrollTimeout_ = null;

    /** @private {boolean} */
    this.isTouching_ = false;

    /** @private {?number} */
    this.autoplayTimeoutId_ = null;

    /** @private {boolean} */
    this.hasLoop_ = false;

    /** @private {boolean} */
    this.loopAdded_ = false;

    /** @private {boolean} */
    this.hasAutoplay_ = false;

    /** @private {number} */
    this.autoplayDelay_ = 5000;

    /** @private {?number} */
    this.autoplayLoops_ = null;

    /** @private {number} */
    this.loopsMade_ = 0;

    /** @private {boolean} */
    this.shouldLoop_ = false;

    /** @private {boolean} */
    this.shouldAutoplay_ = false;

    /**
     * 0 - not in an elastic state.
     * -1 - elastic scrolling (back) to the left of scrollLeft 0.
     * 1 - elastic scrolling (fwd) to the right of the max scrollLeft possible.
     * @private {number}
     */
    this.elasticScrollState_ = 0;

    /**
     * If not laid out yet, null. Otherwise, index of current displayed slide.
     * @private {?number}
     */
    this.slideIndex_ = null;

    /**
     * The slide index that should be shown on first layout.
     * @private {number}
     */
    this.initialSlideIndex_ = 0;

    /** @private {number} */
    this.slideWidth_ = 0;

    /** @private {number} */
    this.previousScrollLeft_ = 0;

    /** @private {Array<?string>} */
    this.dataSlideIdArr_ = [];

    const platform = Services.platformFor(this.win);

    /** @private @const {boolean} */
    this.isIos_ = platform.isIos();

    /** @private @const {boolean} */
    this.isSafari_ = platform.isSafari();

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    // Keep CSS Scroll Snap points turned on for the following:
    // - All iOS devices except for 10.3
    // - All places where the experiment flag is deliberately set.
    // Conversely turn CSS Scroll Snap points off for the following:
    // - iOS devices on version 10.3
    // - Non iOS devices with the flag turned off.
    /** @private {boolean} */
    this.shouldDisableCssSnap_ = Services.platformFor(this.win)
      .getIosVersionString()
      .startsWith('10.3')
      ? true
      : this.isIos_
        ? false
        : !isExperimentOn(this.win, 'amp-carousel-chrome-scroll-snap');

    /** @private {boolean} */
    this.hasFirstResizedOccured_ = false;

    this.onResized_ = this.onResized_.bind(this);

    /** @private {?UnlistenDef} */
    this.unobserveIntersections_ = null;

    /** @private {CarouselControls} */
    this.controls_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /**
   * Attaches event handlers
   * @private
   */
  setupBehavior_() {
    const autoplayVal = this.element.getAttribute('autoplay');
    if (autoplayVal) {
      this.autoplayLoops_ = parseInt(autoplayVal, 10);
      userAssert(isFiniteNumber(this.autoplayLoops_));
    }
    if (this.shouldAutoplay_ && this.autoplayLoops_ != 0) {
      this.setupAutoplay_();
    }

    this.registerAction(
      'toggleAutoplay',
      (invocation) => {
        const {args} = invocation;
        if (args && args['toggleOn'] !== undefined) {
          this.toggleAutoplay_(args['toggleOn']);
        } else {
          this.toggleAutoplay_(!this.hasAutoplay_);
        }
      },
      ActionTrust_Enum.LOW
    );
  }

  /**
   * Attaches event listeners for slides.
   * Also creates client-specific DOM for various bugfixes.
   */
  setupSlideBehavior_() {
    this.vsync_ = this.getVsync();
    this.action_ = Services.actionServiceForDoc(this.element);
    /** If the element is in an email document, allow its `goToSlide` action. */
    this.action_.addToAllowlist(TAG, 'goToSlide', ['email']);

    this.hasNativeSnapPoints_ =
      getStyle(this.element, 'scrollSnapType') != undefined;

    if (this.shouldDisableCssSnap_) {
      this.hasNativeSnapPoints_ = false;
    }

    // Snap point is buggy in IOS 10.3 (beta), so it is disabled in beta.
    // https://bugs.webkit.org/show_bug.cgi?id=169800
    this.slidesContainer_.classList.toggle(
      ClassNames.SLIDES_CONTAINER_NOSNAP,
      this.shouldDisableCssSnap_
    );

    // Workaround - https://bugs.webkit.org/show_bug.cgi?id=158821
    if (this.hasNativeSnapPoints_) {
      const start = this.win.document.createElement('div');
      start.classList.add('i-amphtml-carousel-start-marker');
      this.slidesContainer_.appendChild(start);

      const end = this.win.document.createElement('div');
      end.classList.add('i-amphtml-carousel-end-marker');
      this.slidesContainer_.appendChild(end);
    }

    this.slides_.forEach((slide, index) => {
      const id = slide.getAttribute('data-slide-id') || index.toString();
      this.dataSlideIdArr_.push(id);
      Services.ownersForDoc(this.element).setOwner(slide, this.element);
    });

    this.cancelTouchEvents_();

    this.slidesContainer_.addEventListener(
      'scroll',
      this.scrollHandler_.bind(this)
    );
    this.slidesContainer_.addEventListener(
      'keydown',
      this.keydownHandler_.bind(this)
    );

    listen(
      this.slidesContainer_,
      'touchmove',
      this.touchMoveHandler_.bind(this),
      {passive: true}
    );

    listen(
      this.slidesContainer_,
      'touchend',
      this.touchEndHandler_.bind(this),
      {passive: true}
    );

    this.registerAction(
      'goToSlide',
      (invocation) => {
        const {args} = invocation;
        if (args) {
          this.goToSlide(args['index'], ActionTrust_Enum.HIGH);
        }
      },
      ActionTrust_Enum.LOW
    );
  }

  /** @override */
  attachedCallback() {
    observeContentSize(this.element, this.onResized_);
  }

  /** @override */
  detachedCallback() {
    unobserveContentSize(this.element, this.onResized_);
  }

  /**
   * Checks if a carousel is eligible to loop, regardless of the loop attribute.
   * @return {boolean}
   */
  isLoopingEligible() {
    return this.noOfSlides_ > 1;
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const slide = mutations['slide'];
    if (slide !== undefined) {
      this.goToSlide(slide, ActionTrust_Enum.HIGH);
    }
  }

  /**
   * Handles touchmove event.
   * @private
   */
  touchMoveHandler_() {
    this.clearAutoplayTimer_();
    this.isTouching_ = true;
  }

  /**
   * Handles when carousel comes into and out of viewport.
   * @param {boolean} inViewport
   */
  viewportCallback(inViewport) {
    if (inViewport) {
      this.autoplay_();
      this.controls_?.hintControls();
    } else {
      this.clearAutoplayTimer_();
    }
  }

  /** Used by amp-lightbox-gallery */
  interactionNext() {
    this.controls_.handleNext();
  }

  /** Used by amp-lightbox-gallery */
  interactionPrev() {
    this.controls_.handlePrev();
  }

  /**
   * Does all the work needed to proceed to next
   * desired direction.
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   * @param {boolean=} opt_autoplay
   */
  goCallback(dir, animate, opt_autoplay) {
    this.go(dir, animate, opt_autoplay);
  }

  /**
   * Does all the work needed to proceed to next
   * desired direction.
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   * @param {boolean=} opt_autoplay
   */
  go(dir, animate, opt_autoplay) {
    const trust = opt_autoplay ? ActionTrust_Enum.LOW : ActionTrust_Enum.HIGH;
    this.moveSlide(dir, animate, trust);
    if (opt_autoplay) {
      this.autoplay_();
    } else {
      this.clearAutoplayTimer_();
    }
  }

  /**
   *
   * @param {number} timeout The timeout to wait for before considering scroll
   *    settled, unless this method is called again.
   */
  waitForScrollSettled_(timeout) {
    if (this.scrollTimeout_) {
      Services.timerFor(this.win).cancel(this.scrollTimeout_);
    }

    this.scrollTimeout_ = /** @type {number} */ (
      Services.timerFor(this.win).delay(() => {
        this.scrollTimeout_ = null;

        if (this.snappingInProgress_ || this.isTouching_) {
          return;
        }

        const currentScrollLeft = this.slidesContainer_./*OK*/ scrollLeft;

        if (this.hasNativeSnapPoints_) {
          this.updateOnScroll_(currentScrollLeft, ActionTrust_Enum.LOW);
        } else {
          this.customSnap_(currentScrollLeft, undefined, ActionTrust_Enum.HIGH);
        }
      }, timeout)
    );
  }

  /**
   * Handles touchend event.
   * @private
   */
  touchEndHandler_() {
    const timeout = this.shouldDisableCssSnap_
      ? IOS_TOUCH_TIMEOUT
      : NATIVE_TOUCH_TIMEOUT;
    this.isTouching_ = false;
    this.waitForScrollSettled_(timeout);
  }

  /**
   * @param {import('#core/dom/layout/rect').LayoutSizeDef} size
   * @private
   */
  onResized_(size) {
    this.slideWidth_ = size.width;
    this.hasFirstResizedOccured_ = true;
  }

  /** @override */
  buildCallback() {
    const {nextButton, prevButton, slideWrappers, slides, slidesContainer} =
      buildDom(this.element);
    this.slides_ = slides;
    this.slidesContainer_ = slidesContainer;
    this.slideWrappers_ = slideWrappers;
    this.noOfSlides_ = this.slides_.length;
    this.hasLoop_ = this.element.hasAttribute('loop');
    this.hasAutoplay_ = this.element.hasAttribute('autoplay');
    this.shouldLoop_ = this.hasLoop_ && this.isLoopingEligible();
    this.shouldAutoplay_ = this.hasAutoplay_ && this.isLoopingEligible();

    this.controls_ = new CarouselControls({
      element: this.element,
      go: this.go.bind(this),
      nextButton,
      prevButton,
    });
    this.controls_.updateButtonTitles(
      this.getPrevButtonTitle(),
      this.getNextButtonTitle()
    );
    this.setupBehavior_();
    this.setupSlideBehavior_();
  }

  /** @override */
  layoutCallback() {
    this.unobserveIntersections_ = observeIntersections(
      this.element,
      ({isIntersecting}) => this.viewportCallback(isIntersecting)
    );

    // TODO(sparhami) #19259 Tracks a more generic way to do this. Remove once
    // we have something better.
    const isScaled = closestAncestorElementBySelector(
      this.element,
      '[i-amphtml-scale-animation]'
    );
    if (isScaled) {
      return Promise.resolve();
    }

    // Account for race when onResized_ has not fired before layoutCallback,
    // since we need slideWidth_ to proceed.
    if (!this.hasFirstResizedOccured_) {
      this.slideWidth_ = this.slidesContainer_./*OK*/ clientWidth;
    }

    if (this.slideIndex_ === null) {
      this.showSlide_(this.initialSlideIndex_);
    } else {
      const index = user().assertNumber(
        this.slideIndex_,
        'E#19457 this.slideIndex_'
      );
      const scrollLeft = this.getScrollLeftForIndex_(index);
      // When display is toggled on a partcular media or element resizes,
      // it will need to be re-laid-out. This is only needed when the slide
      // does not change (example when browser window size changes,
      // or orientation changes)
      Services.ownersForDoc(this.element).scheduleLayout(
        this.element,
        this.slides_[index]
      );
      // Reset scrollLeft on orientationChange or anything that changes the
      // size of the carousel.
      this.slidesContainer_./*OK*/ scrollLeft = scrollLeft;
      this.previousScrollLeft_ = scrollLeft;
    }
    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.unobserveIntersections_?.();
    this.unobserveIntersections_ = null;
    this.slideIndex_ = null;
    return true;
  }

  /**
   * @return  {boolean}
   * @private
   */
  hasPrev_() {
    return this.shouldLoop_ || this.slideIndex_ > 0;
  }

  /**
   * @return  {boolean}
   * @private
   */
  hasNext_() {
    return this.shouldLoop_ || this.slideIndex_ < this.slides_.length - 1;
  }

  /**
   * Proceeds to the next slide in the desired direction.
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   * @param {ActionTrust_Enum} trust
   */
  moveSlide(dir, animate, trust) {
    if (this.slideIndex_ !== null) {
      const hasNext = this.hasNext_();
      const hasPrev = this.hasPrev_();
      if ((dir == 1 && hasNext) || (dir == -1 && hasPrev)) {
        let newIndex = dev().assertNumber(this.slideIndex_) + dir;
        if (newIndex == -1) {
          newIndex = this.noOfSlides_ - 1;
        } else if (newIndex >= this.noOfSlides_) {
          newIndex = 0;
        }
        if (animate) {
          const currentScrollLeft = dir == 1 && !hasPrev ? 0 : this.slideWidth_;
          this.customSnap_(currentScrollLeft, dir, trust);
        } else {
          this.showSlideAndTriggerAction_(newIndex, trust);
        }
      }
    }
  }

  /**
   * Handles scroll on the slides container.
   * @param {Event} unusedEvent Event object.
   * @private
   */
  scrollHandler_(unusedEvent) {
    const currentScrollLeft = this.slidesContainer_./*OK*/ scrollLeft;

    if (!this.isIos_ && !this.isSafari_) {
      this.handleCustomElasticScroll_(currentScrollLeft);
    }

    const timeout = this.hasNativeSnapPoints_
      ? NATIVE_SNAP_TIMEOUT
      : this.isIos_
        ? IOS_CUSTOM_SNAP_TIMEOUT
        : CUSTOM_SNAP_TIMEOUT;
    // Timer that detects scroll end and/or end of snap scroll.
    this.waitForScrollSettled_(timeout);

    this.previousScrollLeft_ = currentScrollLeft;
  }

  /**
   * Escapes Left and Right arrow key events on the carousel container.
   * This is to prevent them from doubly interacting with surrounding viewer
   * contexts such as email clients when interacting with the amp-carousel.
   * @param {KeyboardEvent} event
   * @private
   */
  keydownHandler_(event) {
    const {key} = event;
    if (key == Keys_Enum.LEFT_ARROW || key == Keys_Enum.RIGHT_ARROW) {
      event.stopPropagation();
    }
  }

  /**
   * Handles custom elastic scroll (snap points polyfill).
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   */
  handleCustomElasticScroll_(currentScrollLeft) {
    const scrollWidth = this.slidesContainer_./*OK*/ scrollWidth;
    if (
      this.elasticScrollState_ == -1 &&
      currentScrollLeft >= this.previousScrollLeft_
    ) {
      // Elastic Scroll is reversing direction take control.
      this.customSnap_(currentScrollLeft).then(() => {
        this.elasticScrollState_ = 0;
      });
    } else if (
      this.elasticScrollState_ == 1 &&
      currentScrollLeft <= this.previousScrollLeft_
    ) {
      // Elastic Scroll is reversing direction take control.
      this.customSnap_(currentScrollLeft).then(() => {
        this.elasticScrollState_ = 0;
      });
    } else if (currentScrollLeft < 0) {
      // Direction = -1.
      this.elasticScrollState_ = -1;
    } else if (currentScrollLeft + this.slideWidth_ > scrollWidth) {
      // Direction = +1.
      this.elasticScrollState_ = 1;
    } else {
      this.elasticScrollState_ = 0;
    }
  }

  /**
   * Animate and snap to the correct slide for a given scrollLeft.
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   * @param {number=} opt_forceDir if a valid direction is given force it to
   * move 1 slide in that direction.
   * @param {ActionTrust_Enum=} opt_trust
   * @return {Promise}
   */
  customSnap_(currentScrollLeft, opt_forceDir, opt_trust) {
    this.snappingInProgress_ = true;
    const newIndex = this.getNextSlideIndex_(currentScrollLeft);
    // Default behavior should be stays on current slide
    let diff = newIndex - this.slideIndex_;
    const hasPrev = this.hasPrev_();
    let toScrollLeft = hasPrev ? this.slideWidth_ : 0;

    if (diff == 0 && (opt_forceDir == 1 || opt_forceDir == -1)) {
      diff = opt_forceDir;
    }

    if (diff == 1 || (diff != -1 && diff == -1 * (this.noOfSlides_ - 1))) {
      // Move fwd.
      toScrollLeft = hasPrev ? this.slideWidth_ * 2 : this.slideWidth_;
    } else if (diff == -1 || diff == this.noOfSlides_ - 1) {
      // Move backward.
      toScrollLeft = 0;
    }
    return this.animateScrollLeft_(currentScrollLeft, toScrollLeft).then(() => {
      this.updateOnScroll_(toScrollLeft, opt_trust);
    });
  }

  /**
   * Gets the slideIndex of the potential next slide based on the
   *    current scrollLeft.
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   * @return {number} a number representing the next slide index.
   */
  getNextSlideIndex_(currentScrollLeft) {
    // Addresses race where slideWidth is 0, due to being hidden
    // while snapping is occuring.
    if (!currentScrollLeft && !this.slideWidth_) {
      return 0;
    }
    // This can be only 0, 1 or 2, since only a max of 3 slides are shown at
    // a time.
    const scrolledSlideIndex = Math.round(currentScrollLeft / this.slideWidth_);
    // Update value can be -1, 0 or 1 depending upon the index of the current
    // shown slide.
    let updateValue = 0;

    const hasPrev = this.hasPrev_();
    const hasNext = this.hasNext_();

    if (hasPrev && hasNext) {
      updateValue = scrolledSlideIndex - 1;
    } else if (hasNext) {
      // Has next and does not have a prev. (slideIndex 0)
      updateValue = scrolledSlideIndex;
    } else if (hasPrev) {
      // Has prev and no next slide (last slide)
      updateValue = scrolledSlideIndex - 1;
    }

    let newIndex = this.slideIndex_ + updateValue;

    if (this.shouldLoop_) {
      newIndex =
        newIndex < 0
          ? this.noOfSlides_ - 1
          : newIndex >= this.noOfSlides_
            ? 0
            : newIndex;
    } else {
      newIndex =
        newIndex < 0
          ? 0
          : newIndex >= this.noOfSlides_
            ? this.noOfSlides_ - 1
            : newIndex;
    }
    return newIndex;
  }

  /** @return {string} */
  getPrevButtonTitle() {
    const prevIndex = this.getPrevIndex_(this.slideIndex_);
    const index = (prevIndex == null ? 0 : prevIndex) + 1;
    return getPrevButtonTitle(this.element, {
      index: String(index),
      total: String(this.noOfSlides_),
    });
  }

  /** @return {string} */
  getNextButtonTitle() {
    const nextIndex = this.getNextIndex_(this.slideIndex_);
    const index = (nextIndex == null ? this.noOfSlides_ - 1 : nextIndex) + 1;
    return getNextButtonTitle(this.element, {
      index: String(index),
      total: String(this.noOfSlides_),
    });
  }

  /**
   * Updates to the right state of the new index on scroll.
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   * @param {ActionTrust_Enum=} opt_trust
   */
  updateOnScroll_(currentScrollLeft, opt_trust) {
    if (!isFiniteNumber(currentScrollLeft) || this.slideIndex_ === null) {
      return;
    }
    this.snappingInProgress_ = true;
    const newIndex = this.getNextSlideIndex_(currentScrollLeft);
    this.vsync_.mutate(() => {
      // Scroll to new slide and update scrollLeft to the correct slide.
      this.showSlideAndTriggerAction_(newIndex, opt_trust);
      this.vsync_.mutate(() => {
        this.snappingInProgress_ = false;
      });
    });
  }

  /**
   * Parses given value as integer and shows the slide with that index value
   * when element has been laid out.
   * @param {*} value
   * @param {ActionTrust_Enum} trust
   */
  goToSlide(value, trust) {
    const index = parseInt(value, 10);

    if (!isFinite(index) || index < 0 || index >= this.noOfSlides_) {
      this.user().error(TAG, 'Invalid [slide] value: ', value);
      return;
    }

    // If we haven't been laid out, set `initialSlideIndex_` for layout time.
    if (this.slideIndex_ === null) {
      this.initialSlideIndex_ = index;
      return;
    }

    this.showSlideAndTriggerAction_(index, trust);
  }

  /**
   * @param {?number} currentIndex
   * @return {?number} The previous index that would be navigated to, or null
   *    if at the start and not looping.
   * @private
   */
  getPrevIndex_(currentIndex) {
    return currentIndex - 1 >= 0
      ? currentIndex - 1
      : this.shouldLoop_
        ? this.noOfSlides_ - 1
        : null;
  }

  /**
   * @param {?number} currentIndex
   * @return {?number} The next index that would be navigated to, or null if at
   *    the end and not looping.
   * @private
   */
  getNextIndex_(currentIndex) {
    return currentIndex + 1 < this.noOfSlides_
      ? currentIndex + 1
      : this.shouldLoop_
        ? 0
        : null;
  }

  /**
   * Makes the slide corresponding to the given index and the slides surrounding
   *     it available for display.
   * Note: Element must be laid out.
   * @param {number} newIndex Index of the slide to be displayed.
   * @return {boolean} true if the slide changed, otherwise false.
   * @private
   */
  showSlide_(newIndex) {
    const {noOfSlides_} = this;
    newIndex = dev().assertNumber(newIndex);
    if (
      newIndex < 0 ||
      newIndex >= noOfSlides_ ||
      this.slideIndex_ == newIndex
    ) {
      return false;
    }
    const prevIndex = this.getPrevIndex_(newIndex);
    const nextIndex = this.getNextIndex_(newIndex);

    const showIndexArr = [];
    if (prevIndex != null) {
      showIndexArr.push(prevIndex);
    }
    showIndexArr.push(newIndex);
    if (nextIndex != null && nextIndex !== prevIndex) {
      showIndexArr.push(nextIndex);
    }
    const newSlideInView = this.slides_[newIndex];

    if (newSlideInView === undefined) {
      dev().error(
        TAG,
        'Attempting to access a non-existant slide %s / %s',
        newIndex,
        noOfSlides_
      );
      return false;
    }
    showIndexArr.forEach((showIndex, loopIndex) => {
      if (this.shouldLoop_) {
        setStyle(this.slideWrappers_[showIndex], 'order', loopIndex + 1);
      }
      this.slideWrappers_[showIndex].classList.add(ClassNames.SLIDES_ITEM_SHOW);
      const owners = Services.ownersForDoc(this.element);
      if (showIndex == newIndex) {
        owners.scheduleLayout(this.element, this.slides_[showIndex]);
        owners.scheduleResume(this.element, this.slides_[showIndex]);
        this.slides_[showIndex].setAttribute('aria-hidden', 'false');
      } else {
        owners.schedulePreload(this.element, this.slides_[showIndex]);
        this.slides_[showIndex].setAttribute('aria-hidden', 'true');
      }
    });
    this.slidesContainer_./*OK*/ scrollLeft =
      this.getScrollLeftForIndex_(newIndex);
    this.triggerAnalyticsEvent_(newIndex);
    this.slideIndex_ = newIndex;
    // If we have a specified number of autoplay loops and
    // we have reached the last slide in the set
    // carry out removing autoplay logic.
    // This only works because the initial Slide is always the first slide.
    if (this.autoplayLoops_ && this.slideIndex_ === this.noOfSlides_ - 1) {
      this.loopsMade_++;
      if (this.loopsMade_ == this.autoplayLoops_) {
        this.removeAutoplay_();
      }
    }
    this.hideRestOfTheSlides_(showIndexArr);
    this.controls_?.setControlsState({
      prev: this.hasPrev_(),
      next: this.hasNext_(),
    });
    this.controls_?.updateButtonTitles(
      this.getPrevButtonTitle(),
      this.getNextButtonTitle()
    );
    return true;
  }

  /**
   * Shows the slide at the given index and triggers a `slideChange` event.
   * @param {number} newIndex
   * @param {ActionTrust_Enum=} opt_trust LOW by default.
   * @private
   */
  showSlideAndTriggerAction_(newIndex, opt_trust = ActionTrust_Enum.LOW) {
    const slideChanged = this.showSlide_(newIndex);

    if (slideChanged) {
      const name = 'slideChange';
      const event = createCustomEvent(this.win, `slidescroll.${name}`, {
        'index': newIndex,
      });
      this.action_.trigger(this.element, name, event, opt_trust);

      dispatchCustomEvent(this.element, name, {
        index: newIndex,
        actionTrust: opt_trust,
      });
    }
  }

  /**
   * Returns the scrollLeft position for a given slide index.
   * @param {number} index Index of the slide to be displayed.
   * @return {number}
   * @private
   */
  getScrollLeftForIndex_(index) {
    // A max of 3 slides are displayed at a time - we show the first slide
    // (which is at scrollLeft 0) when slide 0 is requested - for all other
    // instances we show the second slide (middle slide at
    // scrollLeft = slide's width).
    let newScrollLeft = this.slideWidth_;
    if ((!this.shouldLoop_ && index == 0) || this.slides_.length <= 1) {
      newScrollLeft = 0;
    }
    return newScrollLeft;
  }

  /**
   * Given an index, hides rest of the slides that are not needed.
   * @param {Array<number>} indexArr Array of indices that
   *    should not be hidden.
   * @private
   */
  hideRestOfTheSlides_(indexArr) {
    const {noOfSlides_} = this;
    for (let i = 0; i < noOfSlides_; i++) {
      if (
        !this.slideWrappers_[i].classList.contains(ClassNames.SLIDES_ITEM_SHOW)
      ) {
        continue;
      }
      // Hide if not shown anymore
      if (!indexArr.includes(i)) {
        if (this.shouldLoop_) {
          setStyle(this.slideWrappers_[i], 'order', '');
        }
        this.slideWrappers_[i].classList.remove(ClassNames.SLIDES_ITEM_SHOW);
        this.slides_[i].removeAttribute('aria-hidden');
      }
      // Pause if not the current slide
      if (this.slideIndex_ != i) {
        Services.ownersForDoc(this.element).schedulePause(
          this.element,
          this.slides_[i]
        );
      }
    }
  }

  /**
   * Animate scrollLeft of the container.
   * @param {number} fromScrollLeft
   * @param {number} toScrollLeft
   * @return {Promise}
   * @private
   */
  animateScrollLeft_(fromScrollLeft, toScrollLeft) {
    if (fromScrollLeft == toScrollLeft) {
      return Promise.resolve();
    }
    /** @const {TransitionDef<number>} */
    const interpolate = numeric(fromScrollLeft, toScrollLeft);
    const curve = bezierCurve(0.8, 0, 0.6, 1); // ease-in
    const duration = 80;
    const slidesContainer = dev().assertElement(this.slidesContainer_);
    return Animation.animate(
      slidesContainer,
      (pos) => {
        this.slidesContainer_./*OK*/ scrollLeft = interpolate(pos);
      },
      duration,
      curve
    ).thenAlways();
  }

  /**
   * Cancels the touchmove events for the element so that viewer does not
   * consider the swipes in the carousel as swipes for changing AMP documents.
   * @private
   */
  cancelTouchEvents_() {
    // TODO(aghassemi, #4754): Ideally we only stop propagation of horizontal
    // touchmove events.
    listen(this.element, 'touchmove', (event) => event.stopPropagation(), {
      passive: true,
    });
  }

  /**
   * @param {number} newSlideIndex
   * @private
   */
  triggerAnalyticsEvent_(newSlideIndex) {
    let direction = newSlideIndex - this.slideIndex_;
    if (direction == 0) {
      return;
    } else if (Math.abs(direction) !== 1) {
      // When the direction is not +1 or -1 (happens with loops or when
      // this.slideIndex_ is null (first slide))
      // Set the correct direction.
      direction = direction < 0 ? 1 : -1;
      if (this.slideIndex_ === null) {
        direction = 1;
      }
    }
    const fromSlide =
      this.slideIndex_ === null
        ? 'null'
        : this.dataSlideIdArr_[dev().assertNumber(this.slideIndex_)];

    const vars = {
      'fromSlide': fromSlide,
      'toSlide': this.dataSlideIdArr_[newSlideIndex],
    };
    this.analyticsEvent_('amp-carousel-change', vars);
    // At this point direction can be only +1 or -1.
    if (direction == 1) {
      this.analyticsEvent_('amp-carousel-next', vars);
    } else {
      this.analyticsEvent_('amp-carousel-prev', vars);
    }
  }

  /**
   * @param {string} eventType
   * @param {JsonObject} vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, vars) {
    triggerAnalyticsEvent(this.element, eventType, vars);
  }

  /**
   * Sets up the `autoplay` configuration.
   * @private
   */
  setupAutoplay_() {
    const delayValue = Number(this.element.getAttribute('delay'));
    // If it isn't a number and is not greater than 0 then don't assign
    // and use the default.
    if (delayValue > 0) {
      // Guard against autoplayValue that is lower than 1s to prevent
      // people from crashing the runtime with providing very low delays.
      this.autoplayDelay_ = Math.max(1000, delayValue);
    }

    // By default `autoplay` should also mean that the current carousel slide
    // is looping. (to be able to advance past the last item)
    if (!this.hasLoop_) {
      this.element.setAttribute('loop', '');
      this.loopAdded_ = true;
      this.hasLoop_ = true;
      this.shouldLoop_ = true;
    }
  }

  /**
   * Starts the autoplay delay if allowed.
   * @private
   */
  autoplay_() {
    if (!this.shouldAutoplay_ || this.autoplayLoops_ == 0) {
      return;
    }
    this.clearAutoplayTimer_();
    this.autoplayTimeoutId_ = /** @type {number} */ (
      Services.timerFor(this.win).delay(
        this.go.bind(
          this,
          /* dir */ 1,
          /* animate */ true,
          /* autoplay */ true
        ),
        this.autoplayDelay_
      )
    );
  }

  /**
   * Called by toggleAutoplay action to toggle the autoplay feature.
   * @param {boolean} toggleOn
   * @private
   */
  toggleAutoplay_(toggleOn) {
    if (toggleOn == this.shouldAutoplay_) {
      return;
    }

    const prevAutoplayStatus = this.shouldAutoplay_;

    this.hasAutoplay_ = toggleOn;
    this.shouldAutoplay_ = this.hasAutoplay_ && this.isLoopingEligible();

    if (!prevAutoplayStatus && this.shouldAutoplay_) {
      this.setupAutoplay_();
    }

    if (this.shouldAutoplay_) {
      this.autoplay_();
    } else {
      this.clearAutoplayTimer_();
    }
  }

  /**
   * Clear the autoplay timer.
   * @private
   */
  clearAutoplayTimer_() {
    if (this.autoplayTimeoutId_ !== null) {
      Services.timerFor(this.win).cancel(this.autoplayTimeoutId_);
      this.autoplayTimeoutId_ = null;
    }
  }

  /**
   * Remove autoplay.
   * @private
   */
  removeAutoplay_() {
    this.clearAutoplayTimer_();
    if (this.loopAdded_) {
      // Only remove if specified due to the `autoplay` attribute
      this.element.removeAttribute('loop');
      this.loopAdded_ = false;
      this.hasLoop_ = false;
      this.shouldLoop_ = false;
    }
    this.hasAutoplay_ = false;
    this.shouldAutoplay_ = this.hasAutoplay_ && this.isLoopingEligible();
  }
}
