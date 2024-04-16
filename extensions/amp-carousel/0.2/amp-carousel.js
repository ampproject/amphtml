import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Keys_Enum} from '#core/constants/key-codes';
import {dispatchCustomEvent} from '#core/dom';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {
  closestAncestorElementBySelector,
  realChildElements,
} from '#core/dom/query';
import {htmlFor} from '#core/dom/static-template';
import {computedStyle} from '#core/dom/style';

import {Services} from '#service';

import {triggerAnalyticsEvent} from '#utils/analytics';
import {createCustomEvent, getDetail, listen} from '#utils/event-helper';
import {dev, devAssert, userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-carousel-0.2.css';
import {ActionSource} from '../../amp-base-carousel/0.1/action-source';
import {Carousel} from '../../amp-base-carousel/0.1/carousel';
import {CarouselEvents} from '../../amp-base-carousel/0.1/carousel-events';
import {ChildLayoutManager} from '../../amp-base-carousel/0.1/child-layout-manager';

/**
 * @enum {string}
 */
const CarouselType = {
  CAROUSEL: 'carousel',
  SLIDES: 'slides',
};

class AmpCarousel extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /**
   * @private
   */
  setupActions_() {
    this.registerAction(
      'goToSlide',
      (actionInvocation) => {
        const {args, trust} = actionInvocation;
        const slide = Number(args['index'] || 0);
        userAssert(
          !isNaN(slide),
          'Unexpected slide index for goToSlide action: %s. %s',
          args['index'],
          this.element
        );
        this.carousel_.goToSlide(slide, {
          actionSource: this.getActionSource_(trust),
        });
      },
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'toggleAutoplay',
      (actionInvocation) => {
        const {args} = actionInvocation;
        // args will be `null` if not present, so we cannot use a default value above
        const toggle = args ? args['toggleOn'] : undefined;
        this.toggleAutoplay_(toggle);
      },
      ActionTrust_Enum.LOW
    );
    /** If the element is in an email document, allow its `goToSlide` action. */
    this.action_.addToAllowlist('AMP-CAROUSEL', 'goToSlide', ['email']);
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {boolean} */
    this.isIos_ = Services.platformFor(this.win).isIos();

    /** @private {?Carousel} */
    this.carousel_ = null;

    /** @private {?Element} */
    this.scrollContainer_ = null;

    /** @private {!Array<!Element>} */
    this.slides_ = [];

    /** @private {?number} */
    this.currentIndex_ = null;

    /** @private {string} */
    this.type_ = 'carousel';

    /** @private {boolean} */
    this.autoplay_ = false;

    /** @private {?Element} */
    this.nextButton_ = null;

    /** @private {?Element} */
    this.prevButton_ = null;

    /**
     * Whether or not the user has interacted with the carousel using touch in
     * the past at any point.
     * @private {boolean}
     */
    this.hadTouch_ = false;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?ChildLayoutManager} */
    this.childLayoutManager_ = null;

    /**
     * Whether to show control buttons
     * @private {boolean}
     */
    this.showControls_ = false;

    /** If the ampdoc is in the Viewer */
    this.isViewerEmbeded_ = Services.viewerForDoc(element).isEmbedded();
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.action_ = Services.actionServiceForDoc(this.element);

    const {element, win} = this;
    const slides = realChildElements(this.element);

    element.appendChild(this.renderContainerDom_());
    this.scrollContainer_ = this.element.querySelector(
      '.i-amphtml-carousel-scroll'
    );
    this.prevButton_ = this.element.querySelector('.amp-carousel-button-prev');
    this.nextButton_ = this.element.querySelector('.amp-carousel-button-next');

    this.carousel_ = new Carousel({
      win,
      element,
      scrollContainer: dev().assertElement(this.scrollContainer_),
      initialIndex: Number(this.element.getAttribute('slide') || '0'),
      runMutate: (cb) => this.mutateElement(cb),
    });
    this.configureCarousel_(slides);

    // Setup actions and listeners
    this.setupActions_();
    this.element.addEventListener(CarouselEvents.INDEX_CHANGE, (event) => {
      this.onIndexChanged_(event);
    });
    this.element.addEventListener(CarouselEvents.SCROLL_START, () => {
      this.onScrollStarted_();
    });
    this.element.addEventListener(
      CarouselEvents.SCROLL_POSITION_CHANGED,
      () => {
        this.onScrollPositionChanged_();
      }
    );
    this.setupButtonInteraction(this.nextButton_, () => this.interactionNext());
    this.setupButtonInteraction(this.prevButton_, () => this.interactionPrev());
    this.handlePropagationInViewer_();

    const owners = Services.ownersForDoc(element);
    this.childLayoutManager_ = new ChildLayoutManager({
      ampElement: this,
      intersectionElement: dev().assertElement(this.scrollContainer_),
      // For iOS, we queue changes until scrolling stops, which we detect
      // ~200ms after it actually stops. Load items earlier so they have time
      // to load.
      nearbyMarginInPercent: this.isIos_ ? 200 : 100,
      viewportIntersectionCallback: (child, isIntersecting) => {
        if (isIntersecting) {
          owners.scheduleResume(this.element, child);
        } else {
          owners.schedulePause(this.element, child);
        }
      },
    });
    // For iOS, we cannot trigger layout during scrolling or the UI will
    // flicker, so tell the layout to simply queue the changes, which we
    // flush after scrolling stops.
    this.childLayoutManager_.setQueueChanges(this.isIos_);

    this.childLayoutManager_.updateChildren(this.slides_);
    this.carousel_.updateSlides(this.slides_);
    // Need to wait for slides to exist first.
    this.carousel_.goToSlide(Number(this.element.getAttribute('slide') || '0'));
    // Signal for runtime to check children for layout.

    if (this.element.hasAttribute('controls')) {
      this.showControls_ = true;
    } else {
      Services.inputFor(this.win).onMouseDetected((mouseDetected) => {
        if (mouseDetected) {
          this.showControls_ = true;
          this.updateUi_();
        }
      }, true);
    }

    return this.mutateElement(() => {});
  }

  /**
   * @param {!HTMLDivElement} button
   * @param {*} onInteraction
   */
  setupButtonInteraction(button, onInteraction) {
    button.addEventListener('click', onInteraction);
    button.addEventListener('keydown', (event) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key == Keys_Enum.ENTER || event.key == Keys_Enum.SPACE) {
        event.preventDefault();
        onInteraction();
      }
    });
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    // TODO(sparhami) #19259 Tracks a more generic way to do this. Remove once
    // we have something better.
    const isScaled = closestAncestorElementBySelector(
      this.element,
      '[i-amphtml-scale-animation]'
    );
    if (isScaled) {
      return Promise.resolve();
    }

    this.childLayoutManager_.wasLaidOut();
    this.carousel_.updateUi();
    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.childLayoutManager_.wasUnlaidOut();
    return true;
  }

  /** @override */
  pauseCallback() {
    this.carousel_.pauseLayout();
  }

  /** @override */
  resumeCallback() {
    this.carousel_.resumeLayout();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (mutations['slide'] !== undefined) {
      this.carousel_.goToSlide(Number(mutations['slide']));
    }
  }

  /**
   * Moves the Carousel to a given index.
   * @param {number} index
   */
  goToSlide(index) {
    this.carousel_.goToSlide(index, {smoothScroll: false});
  }

  /**
   * Performs the next action (e.g. for a click from the next button). For a
   * carousel, this moves one carousel viewport forwards. For slides, this
   * moves to the next slide. The direction moved depends on the directionality
   * of the component.
   */
  interactionNext() {
    if (this.type_ == CarouselType.CAROUSEL) {
      this.moveScrollOneViewport_(true);
      return;
    }

    this.carousel_.next(ActionSource.GENERIC_HIGH_TRUST);
  }

  /**
   * Performs the prev action (e.g. for a click from the prev button). For a
   * carousel, this moves one carousel viewport backwards. For slides, this
   * moves to the previous slide. The direction moved depends on the
   * directionality of the component.
   */
  interactionPrev() {
    if (this.type_ == CarouselType.CAROUSEL) {
      this.moveScrollOneViewport_(false);
      return;
    }

    this.carousel_.prev(ActionSource.GENERIC_HIGH_TRUST);
  }

  /**
   * Moves the scroll position by one viewport, either forwards or backwards.
   * This reverses the actual scroll position moved based on directionality.
   * @param {boolean} forwards
   * @private
   */
  moveScrollOneViewport_(forwards) {
    const el = devAssert(this.scrollContainer_);
    const {direction} = computedStyle(this.win, el);
    const forwardsMultiplier = forwards ? 1 : -1;
    const directionMulitplier = direction == 'rtl' ? -1 : 1;

    el./*OK*/ scrollLeft +=
      el./*OK*/ offsetWidth * forwardsMultiplier * directionMulitplier;
  }

  /**
   * @return {!Element}
   * @private
   */
  renderContainerDom_() {
    const html = htmlFor(this.element);
    return html`
      <div class="i-amphtml-carousel-content">
        <div class="i-amphtml-carousel-scroll"></div>
        <div class="i-amphtml-carousel-arrows">
          <div
            tabindex="0"
            class="amp-carousel-button amp-carousel-button-prev"
          ></div>
          <div
            tabindex="0"
            class="amp-carousel-button amp-carousel-button-next"
          ></div>
        </div>
      </div>
    `;
  }

  /**
   * Gets the ActionSource to use for a given ActionTrust_Enum.
   * @param {!ActionTrust_Enum} trust
   * @return {!ActionSource}
   */
  getActionSource_(trust) {
    return trust >= ActionTrust_Enum.DEFAULT
      ? ActionSource.GENERIC_HIGH_TRUST
      : ActionSource.GENERIC_LOW_TRUST;
  }

  /**
   * @param {!Array<!Element>} slides
   * @private
   */
  configureCarousel_(slides) {
    const dir =
      this.element.getAttribute('dir') ||
      computedStyle(this.win, this.element).direction;
    const loop = this.element.hasAttribute('loop');
    const autoplay = this.element.getAttribute('autoplay');
    const delay = this.element.getAttribute('delay');
    const type = this.element.getAttribute('type');
    const autoAdvance = autoplay != null;
    const autoAdvanceLoops = autoplay
      ? Number(autoplay)
      : Number.POSITIVE_INFINITY;
    const autoAdvanceInterval = Math.max(Number(delay) || 5000, 1000);

    this.carousel_.updateForwards(dir != 'rtl');
    this.carousel_.updateLoop(loop || autoAdvance);
    this.carousel_.updateAutoAdvanceLoops(autoAdvanceLoops);
    this.carousel_.updateAutoAdvanceInterval(autoAdvanceInterval);
    this.mutateElement(() => {
      this.prevButton_.setAttribute('dir', dir);
      this.nextButton_.setAttribute('dir', dir);
    });
    this.toggleAutoplay_(autoAdvance);
    this.updateType_(type, slides);

    this.updateUi_();
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
      : this.element.hasAttribute('loop')
        ? this.slides_.length - 1
        : null;
  }

  /**
   * @param {?number} currentIndex
   * @return {?number} The next index that would be navigated to, or null if at
   *    the end and not looping.
   * @private
   */
  getNextIndex_(currentIndex) {
    return currentIndex + 1 < this.slides_.length
      ? currentIndex + 1
      : this.element.hasAttribute('loop')
        ? 0
        : null;
  }

  /**
   * @return {string} The title to use for the next button.
   * @private
   */
  getNextButtonTitlePrefix_() {
    return (
      this.element.getAttribute('data-next-button-aria-label') ||
      'Next item in carousel'
    );
  }

  /**
   * @return {string} The title to use for the pevious button.
   * @private
   */
  getPrevButtonTitlePrefix_() {
    return (
      this.element.getAttribute('data-prev-button-aria-label') ||
      'Previous item in carousel'
    );
  }

  /**
   * A format string for the button label. Should be a string, containing two
   * placeholders of "%s", where the index and total count will go.
   * @return {string}
   * @private
   */
  getButtonSuffixFormat_() {
    return (
      this.element.getAttribute('data-button-count-format') || '(%s of %s)'
    );
  }

  /**
   * @param {number} buttonIndex The index that the button will take the user
   *    to.
   * @return {string} The formatted suffix for the button title.
   */
  getButtonTitleSuffix_(buttonIndex) {
    const index = String(buttonIndex + 1);
    const count = String(this.slides_.length);
    return (
      ' ' +
      this.getButtonSuffixFormat_().replace('%s', index).replace('%s', count)
    );
  }

  /**
   * @param {number} index
   * @return {string} The title of the button.
   * @private
   */
  getPrevButtonTitle_(index) {
    const prevIndex = this.getPrevIndex_(index);
    const labelIndex = prevIndex == null ? 0 : prevIndex;
    return (
      this.getPrevButtonTitlePrefix_() + this.getButtonTitleSuffix_(labelIndex)
    );
  }

  /**
   * @param {number} index
   * @return {string} The title of the button.
   * @private
   */
  getNextButtonTitle_(index) {
    const nextIndex = this.getNextIndex_(index);
    const labelIndex = nextIndex == null ? this.slides_.length - 1 : nextIndex;
    return (
      this.getNextButtonTitlePrefix_() + this.getButtonTitleSuffix_(labelIndex)
    );
  }

  /**
   * Updates the UI of the <amp-carousel> itself, but not the internal
   * implementation.
   * @private
   */
  updateUi_() {
    const index = this.carousel_.getCurrentIndex();
    const bothDisabled = this.hadTouch_ && !this.showControls_;
    const prevDisabled = bothDisabled || this.carousel_.isAtStart();
    const nextDisabled = bothDisabled || this.carousel_.isAtEnd();

    this.prevButton_.classList.toggle('amp-disabled', prevDisabled);
    this.prevButton_.setAttribute('aria-disabled', prevDisabled);
    this.prevButton_.title = this.getPrevButtonTitle_(index);
    this.prevButton_.tabIndex = prevDisabled ? -1 : 0;
    this.nextButton_.classList.toggle('amp-disabled', nextDisabled);
    this.nextButton_.setAttribute('aria-disabled', nextDisabled);
    this.nextButton_.title = this.getNextButtonTitle_(index);
    this.nextButton_.tabIndex = nextDisabled ? -1 : 0;
  }

  /**
   * @param {string} type
   * @param {!Array<!Element>} slides
   */
  updateType_(type, slides) {
    const isSlides = type == CarouselType.SLIDES;

    this.type_ = isSlides ? CarouselType.SLIDES : CarouselType.CAROUSEL;
    // Use center alignment for slides to make sure fractional widths
    // do not cause the wrong slide to be considered as active. For example,
    // a slide is positioned at 100.5px, but the updated scroll position is
    // truncated to 100px.
    this.carousel_.updateAlignment(isSlides ? 'center' : 'start');
    this.carousel_.updateHideScrollbar(isSlides);
    this.carousel_.updateMixedLength(!isSlides);
    this.carousel_.updateSnap(isSlides);
    const buttonRole = isSlides ? 'button' : 'presentation';
    this.prevButton_.setAttribute('role', buttonRole);
    this.nextButton_.setAttribute('role', buttonRole);

    this.slides_ = slides.map((slide) => {
      slide.classList.add('amp-carousel-slide');

      if (isSlides) {
        const wrapper = document.createElement('div');
        wrapper.classList.add(
          'i-amphtml-carousel-slotted',
          'i-amphtml-carousel-wrapper'
        );
        wrapper.appendChild(slide);
        return wrapper;
      }

      return slide;
    });
    this.slides_.forEach((slide) => {
      this.scrollContainer_.appendChild(slide);

      if (isSlides) {
        slide.classList.add('i-amphtml-carousel-slide-item');
      } else {
        slide.classList.add('amp-scrollable-carousel-slide');
      }
    });
  }

  /**
   * Updates the current index, triggering actions and analytics events.
   * @param {number} index
   * @param {!ActionSource} actionSource
   */
  updateCurrentIndex_(index, actionSource) {
    const prevIndex = this.currentIndex_;
    this.currentIndex_ = index;

    // Ignore the first indexChange, we do not want to trigger any events.
    if (prevIndex == null) {
      return;
    }

    const data = {'index': index};
    const name = 'slideChange';
    const isHighTrust = this.isHighTrustActionSource_(actionSource);
    const trust = isHighTrust ? ActionTrust_Enum.HIGH : ActionTrust_Enum.LOW;
    const dataWithActionTrust = {'index': index, 'actionTrust': trust};

    const action = createCustomEvent(this.win, `slidescroll.${name}`, data);
    this.action_.trigger(this.element, name, action, trust);
    dispatchCustomEvent(this.element, name, dataWithActionTrust);
    this.triggerAnalyticsEvent_(prevIndex, index);
  }

  /**
   *
   * @param {?number} index
   * @return {string} An identifier to use for the slide for analytics.
   */
  getSlideId_(index) {
    if (index == null) {
      return 'null';
    }

    return this.slides_[index].getAttribute('data-slide-id') || String(index);
  }

  /**
   * @param {number?} prevIndex
   * @param {number} newIndex
   * @private
   */
  triggerAnalyticsEvent_(prevIndex, newIndex) {
    const delta = newIndex - prevIndex;
    const total = this.slides_.length;
    // Note this is approximate, we do not get index change events if the user
    // is quickly moving through the carousel, so we approximate by checking if
    // they moved less than half the distance when looping. We could change the
    // logic to check on every scroll for the index to change, if this is a
    // problem in practuce.
    const isNext = this.carousel_.isLooping()
      ? (delta > 0 && delta / total < 0.5) ||
        (delta < 0 && delta / total < -0.5)
      : delta > 0;
    const directionEventName = isNext
      ? 'amp-carousel-next'
      : 'amp-carousel-prev';

    const vars = {
      'fromSlide': this.getSlideId_(prevIndex),
      'toSlide': this.getSlideId_(newIndex),
    };
    triggerAnalyticsEvent(this.element, 'amp-carousel-change', vars);
    triggerAnalyticsEvent(this.element, directionEventName, vars);
  }

  /**
   * @param {!ActionSource|undefined} actionSource
   * @return {boolean} Whether or not the action is a high trust action.
   * @private
   */
  isHighTrustActionSource_(actionSource) {
    return (
      actionSource == ActionSource.WHEEL ||
      actionSource == ActionSource.TOUCH ||
      actionSource == ActionSource.GENERIC_HIGH_TRUST
    );
  }

  /**
   * Attach singal onto touchmove event to stop propagation to viewer
   * to be handled at the viewer integration layer in bubble phase.
   */
  handlePropagationInViewer_() {
    if (!this.isViewerEmbeded_) {
      return;
    }
    listen(this.scrollContainer_, 'touchmove', (event) => {
      event.shouldViewerCancelPropagation = true;
    });
  }

  /**
   * Toggles the current autoplay state, or forces it if the enable
   *  argument is given.
   * @param {boolean=} enable
   */
  toggleAutoplay_(enable) {
    this.autoplay_ = enable !== undefined ? enable : !this.autoplay_;
    this.carousel_.updateAutoAdvance(this.autoplay_);
  }

  /**
   * Starts queuing all intersection based changes when scrolling starts, to
   * prevent paint flickering on iOS.
   */
  onScrollStarted_() {
    this.childLayoutManager_.setQueueChanges(this.isIos_);
  }

  /**
   * Update the UI (buttons) for the new scroll position. This occurs when
   * scrolling has settled.
   */
  onScrollPositionChanged_() {
    // Now that scrolling has settled, flush any layout changes for iOS since
    // it will not cause flickering.
    this.childLayoutManager_.flushChanges();
    this.childLayoutManager_.setQueueChanges(false);

    this.updateUi_();
  }

  /**
   * @private
   * @param {!Event} event
   */
  onIndexChanged_(event) {
    const detail = getDetail(event);
    const index = detail['index'];
    const actionSource = detail['actionSource'];

    this.hadTouch_ = this.hadTouch_ || actionSource == ActionSource.TOUCH;
    this.updateUi_();

    // Do not fire events, analytics for type="carousel".
    if (this.type_ == CarouselType.CAROUSEL) {
      return;
    }

    this.updateCurrentIndex_(index, actionSource);
  }
}

AMP.extension('amp-carousel', '0.2', (AMP) => {
  AMP.registerElement('amp-carousel', AmpCarousel, CSS);
});
