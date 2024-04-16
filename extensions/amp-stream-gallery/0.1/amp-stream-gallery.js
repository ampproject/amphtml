import {ActionTrust_Enum} from '#core/constants/action-constants';
import {
  dispatchCustomEvent,
  isRTL,
  iterateCursor,
  toggleAttribute,
} from '#core/dom';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {htmlFor} from '#core/dom/static-template';
import {setStyle} from '#core/dom/style';
import {toArray} from '#core/types/array';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {createCustomEvent, getDetail} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-stream-gallery-0.1.css';
import {ActionSource} from '../../amp-base-carousel/0.1/action-source';
import {Carousel} from '../../amp-base-carousel/0.1/carousel';
import {CarouselEvents} from '../../amp-base-carousel/0.1/carousel-events';
import {ChildLayoutManager} from '../../amp-base-carousel/0.1/child-layout-manager';
import {
  ResponsiveAttributes,
  getResponsiveAttributeValue,
} from '../../amp-base-carousel/0.1/responsive-attributes';

/** @enum {number} */
const InsetArrowVisibility = {
  NEVER: 0,
  AUTO: 1,
  ALWAYS: 2,
};

/** Maps attribute values to enum values. */
const insetArrowVisibilityMapping = {
  'never': InsetArrowVisibility.NEVER,
  'auto': InsetArrowVisibility.AUTO,
  'always': InsetArrowVisibility.ALWAYS,
};

/**
 * @param {!Element} el The Element to check.
 * @return {boolean} Whether or not the Element is a sizer Element.
 */
function isSizer(el) {
  return el.tagName == 'I-AMPHTML-SIZER';
}

const TAG = 'amp-stream-gallery';

/**
 * A gallery of slides, used for things like related products or articles. The
 * main way of using this component is to specify the min and max width for
 * each slide, which the carousel uses to determine how many slides should be
 * shown at a time.
 *
 * This component differs from amp-base-carousel in the following ways:
 *
 * - Supports sizing via min-item-width and max-item-width
 * - Supports outset arrows
 * - Does not snap by default
 * - Does not support autoplay
 */
class AmpStreamGallery extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const */
    this.responsiveAttributes_ = new ResponsiveAttributes(
      this.getAttributeConfig_()
    );

    /** @private @const {boolean} */
    this.isIos_ = Services.platformFor(this.win).isIos();

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?Carousel} */
    this.carousel_ = null;

    /** @private {?Element} */
    this.content_ = null;

    /** @private {?Element} */
    this.nextArrowSlot_ = null;

    /** @private {?Element} */
    this.prevArrowSlot_ = null;

    /** @private {?Element} */
    this.scrollContainer_ = null;

    /** @private {?Element} */
    this.slidesContainer_ = null;

    /** @private {!InsetArrowVisibility} */
    this.insetArrowVisibility_ = InsetArrowVisibility.AUTO;

    /** @private {number} */
    this.maxItemWidth_ = Number.MAX_VALUE;

    /** @private {number} */
    this.maxVisibleCount_ = Number.MAX_VALUE;

    /** @private {number} */
    this.minItemWidth_ = 1;

    /** @private {number} */
    this.minVisibleCount_ = 1;

    /** @private {boolean} */
    this.outsetArrows_ = false;

    /** @private {number} */
    this.peek_ = 0;

    /** @private {!Array<!Element>} */
    this.slides_ = [];

    /** @private {?number} */
    this.currentIndex_ = null;

    /**
     * Whether or not the user has interacted with the carousel using touch in
     * the past at any point.
     * @private {boolean}
     */
    this.hadTouch_ = false;

    /** @private {?ChildLayoutManager} */
    this.childLayoutManager_ = null;
  }

  /**
   * The configuration for handling attributes on this element.
   * @return {!{[key: string]: function(string)}}
   * @private
   */
  getAttributeConfig_() {
    return {
      'extra-space': (newValue) => {
        this.updateExtraSpace_(newValue);
      },
      'inset-arrow-visibility': (newValue) => {
        this.updateInsetArrowVisibility_(newValue);
      },
      'loop': (newValue) => {
        this.updateLoop_(newValue == 'true');
      },
      'outset-arrows': (newValue) => {
        this.updateOutsetArrows_(newValue == 'true');
      },
      'peek': (newValue) => {
        this.updatePeek_(Number(newValue));
      },
      'slide': (newValue) => {
        this.carousel_.goToSlide(Number(newValue));
      },
      'slide-align': (newValue) => {
        this.carousel_.updateAlignment(newValue);
      },
      'snap': (newValue) => {
        this.carousel_.updateSnap(newValue != 'false');
      },
      'max-item-width': (newValue) => {
        this.updateMaxItemWidth_(Number(newValue));
      },
      'max-visible-count': (newValue) => {
        this.updateMaxVisibleCount_(Number(newValue));
      },
      'min-item-width': (newValue) => {
        this.updateMinItemWidth_(Number(newValue));
      },
      'min-visible-count': (newValue) => {
        this.updateMinVisibleCount_(Number(newValue));
      },
    };
  }

  /**
   * Sets up the actions supported by this element.
   * @private
   */
  initializeActions_() {
    this.registerAction(
      'prev',
      (invocation) => {
        const {trust} = invocation;
        this.carousel_.prev(this.getActionSource_(trust));
      },
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'next',
      (invocation) => {
        const {trust} = invocation;
        this.carousel_.next(this.getActionSource_(trust));
      },
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'goToSlide',
      (invocation) => {
        const {args, trust} = invocation;
        this.carousel_.goToSlide(args['index'] || -1, {
          actionSource: this.getActionSource_(trust),
        });
      },
      ActionTrust_Enum.LOW
    );
  }

  /**
   * @private
   */
  initializeListeners_() {
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
    this.prevArrowSlot_.addEventListener('click', (event) => {
      // Make sure the slot itself was not clicked, since that fills the
      // entire height of the gallery.
      if (event.target != event.currentTarget) {
        this.carousel_.prev(ActionSource.GENERIC_HIGH_TRUST);
      }
    });
    this.nextArrowSlot_.addEventListener('click', (event) => {
      // Make sure the slot itself was not clicked, since that fills the
      // entire height of the gallery.
      if (event.target != event.currentTarget) {
        this.carousel_.next(ActionSource.GENERIC_HIGH_TRUST);
      }
    });
  }

  /**
   * Moves the Carousel to a given index.
   * @param {number} index
   */
  goToSlide(index) {
    this.carousel_.goToSlide(index, {smoothScroll: false});
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    userAssert(
      isExperimentOn(this.win, 'amp-stream-gallery'),
      'The amp-stream-gallery experiment must be enabled to use the ' +
        'component'
    );

    this.action_ = Services.actionServiceForDoc(this.element);

    this.buildCarouselDom_();

    // Create the internal carousel implementation.
    this.carousel_ = new Carousel({
      win: this.win,
      element: this.element,
      scrollContainer: dev().assertElement(this.scrollContainer_),
      initialIndex: this.getInitialIndex_(),
      runMutate: (cb) => this.mutateElement(cb),
    });
    this.carousel_.updateSnap(false);
    // This is not correct, we really get the computed style of the element
    // and check the direction, but that will force a style calculation.
    this.carousel_.updateForwards(
      !isRTL(devAssert(this.element.ownerDocument))
    );

    // Handle the initial set of attributes
    toArray(this.element.attributes).forEach((attr) => {
      this.attributeMutated_(attr.name, attr.value);
    });

    this.carousel_.updateSlides(this.slides_);
    this.initializeChildLayoutManagement_();
    this.initializeActions_();
    this.initializeListeners_();
    this.updateUi_();
  }

  /**
   * Creates the DOM for the carousel, placing the children into their correct
   * spot.
   */
  buildCarouselDom_() {
    const {element} = this;
    const children = toArray(element.children);
    let prevArrow;
    let nextArrow;

    // Figure out which "slot" the children go into.
    children.forEach((c) => {
      const slot = c.getAttribute('slot');
      if (slot == 'prev-arrow') {
        prevArrow = c;
      } else if (slot == 'next-arrow') {
        nextArrow = c;
      } else if (!isSizer(c)) {
        this.slides_.push(c);
      }
    });

    // Create the DOM, get references to elements.
    element.appendChild(this.renderContainerDom_());
    this.scrollContainer_ = element.querySelector('.i-amphtml-carousel-scroll');
    this.slidesContainer_ = element.querySelector(
      '.i-amphtml-stream-gallery-slides'
    );
    this.content_ = element.querySelector('.i-amphtml-carousel-content');
    this.prevArrowSlot_ = element.querySelector(
      '.i-amphtml-stream-gallery-arrow-prev-slot'
    );
    this.nextArrowSlot_ = element.querySelector(
      '.i-amphtml-stream-gallery-arrow-next-slot'
    );

    // Do some manual "slot" distribution
    this.slides_.forEach((slide) => {
      slide.classList.add('i-amphtml-carousel-slotted');
      this.scrollContainer_.appendChild(slide);
    });
    this.prevArrowSlot_.appendChild(prevArrow || this.createPrevArrow_());
    this.nextArrowSlot_.appendChild(nextArrow || this.createNextArrow_());
  }

  /** @override */
  isRelayoutNeeded() {
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
  layoutCallback() {
    this.updateVisibleCount_();
    this.carousel_.updateUi();
    this.childLayoutManager_.wasLaidOut();

    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.childLayoutManager_.wasUnlaidOut();
    return true;
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    for (const key in mutations) {
      // Stringify since the attribute logic deals with strings and amp-bind
      // may not (e.g. value could be a Number).
      this.attributeMutated_(key, String(mutations[key]));
    }
  }

  /**
   * @param {string} name The name of the attribute.
   * @param {string} newValue The new value of the attribute.
   * @private
   */
  attributeMutated_(name, newValue) {
    this.responsiveAttributes_.updateAttribute(name, newValue);
  }

  /**
   * @return {!Element}
   * @private
   */
  renderContainerDom_() {
    const html = htmlFor(this.element);
    return html`
      <div class="i-amphtml-carousel-content">
        <div class="i-amphtml-stream-gallery-slides">
          <div class="i-amphtml-carousel-scroll"></div>
        </div>
        <div class="i-amphtml-stream-gallery-arrow-prev-slot"></div>
        <div class="i-amphtml-stream-gallery-arrow-next-slot"></div>
      </div>
    `;
  }

  /**
   * @return {!Element}
   * @private
   */
  createNextArrow_() {
    const html = htmlFor(this.element);
    return html`
      <button class="i-amphtml-stream-gallery-next" aria-hidden="true"></button>
    `;
  }

  /**
   * @return {!Element}
   * @private
   */
  createPrevArrow_() {
    const html = htmlFor(this.element);
    return html`
      <button class="i-amphtml-stream-gallery-prev" aria-hidden="true"></button>
    `;
  }

  /**
   * Gets the ActionSource to use for a given ActionTrust_Enum.
   * @param {!ActionTrust_Enum} trust
   * @return {!ActionSource}
   * @private
   */
  getActionSource_(trust) {
    return trust == ActionTrust_Enum.HIGH
      ? ActionSource.GENERIC_HIGH_TRUST
      : ActionSource.GENERIC_LOW_TRUST;
  }

  /**
   * @return {number} The initial index for the carousel.
   * @private
   */
  getInitialIndex_() {
    const attr = this.element.getAttribute('slide') || '0';
    return Number(getResponsiveAttributeValue(attr));
  }

  /**
   * Determines how many whole items in addition to the current peek value can
   * fit for a given item width. This can be rounded up or down to satisfy a
   * max/min size constraint.
   * @param {number} containerWidth The width of the container element.
   * @param {number} itemWidth The width of each item.
   * @return {number} The number of items to show.
   */
  getItemsForWidth_(containerWidth, itemWidth) {
    const availableWidth = containerWidth - this.peek_ * itemWidth;
    const fractionalItems = availableWidth / itemWidth;
    const wholeItems = Math.floor(fractionalItems);
    // Always show at least 1 whole item.
    return Math.max(1, wholeItems) + this.peek_;
  }

  /**
   * @return {number} The amount of horizontal space the arrows require. When
   * the arrows are inset, this is zero as they do not take space.
   * @private
   */
  getWidthTakenByArrows_() {
    if (!this.outsetArrows_) {
      return 0;
    }

    return (
      this.prevArrowSlot_./* OK */ getBoundingClientRect().width +
      this.nextArrowSlot_./* OK */ getBoundingClientRect().width
    );
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
   * TODO(sparhami) If swipe is disabled, then auto should show the inset arrow
   * buttons, even if there is a peek value.
   * @return {boolean}
   * @private
   */
  shouldHideInsetButtons_() {
    if (this.insetArrowVisibility_ == InsetArrowVisibility.ALWAYS) {
      return false;
    }

    if (this.insetArrowVisibility_ == InsetArrowVisibility.NEVER) {
      return true;
    }

    return this.hadTouch_ || this.peek_ != 0;
  }

  /**
   *
   * @param {number} peek
   */
  updatePeek_(peek) {
    this.peek_ = Math.max(0, peek || 0);
    this.updateVisibleCount_();
  }

  /**
   *
   * @param {number} maxItemWidth
   */
  updateMaxItemWidth_(maxItemWidth) {
    this.maxItemWidth_ = maxItemWidth || Number.MAX_VALUE;
    this.updateVisibleCount_();
  }

  /**
   *
   * @param {number} maxVisibleCount
   */
  updateMaxVisibleCount_(maxVisibleCount) {
    this.maxVisibleCount_ = maxVisibleCount || Number.MAX_VALUE;
    this.updateVisibleCount_();
  }

  /**
   *
   * @param {number} minItemWidth
   */
  updateMinItemWidth_(minItemWidth) {
    this.minItemWidth_ = minItemWidth || 1;
    this.updateVisibleCount_();
  }

  /**
   *
   * @param {number} minVisibleCount
   */
  updateMinVisibleCount_(minVisibleCount) {
    this.minVisibleCount_ = minVisibleCount || 1;
    this.updateVisibleCount_();
  }

  /**
   * Updates the number of items visible for the internal carousel based on
   * the min/max item widths and how much space is available.
   */
  updateVisibleCount_() {
    const {
      maxItemWidth_,
      maxVisibleCount_,
      minItemWidth_,
      minVisibleCount_,
      slides_,
    } = this;
    // Need to subtract out the width of the next/prev arrows. If these are
    // inset, they will have no width.
    const width =
      this.element./* OK */ getBoundingClientRect().width -
      this.getWidthTakenByArrows_();
    const items = this.getItemsForWidth_(width, minItemWidth_);
    const maxVisibleSlides = Math.min(slides_.length, maxVisibleCount_);
    // Cannot use clamp, maxVisibleSlides can be less than minVisibleCount_.
    const visibleCount = Math.min(
      Math.max(minVisibleCount_, items),
      maxVisibleSlides
    );
    const advanceCount = Math.floor(visibleCount);

    this.mutateElement(() => {
      /*
       * When we are going to show more slides than we have, cap the width so
       * that we do not go over the max requested slide width. Otherwise,
       * cap the max width based on how many items are showing and the max
       * width for each item.
       */
      const maxContainerWidth =
        items > maxVisibleSlides
          ? `${maxVisibleSlides * maxItemWidth_}px`
          : `${items * maxItemWidth_}px`;

      setStyle(this.slidesContainer_, 'max-width', maxContainerWidth);
    });
    this.carousel_.updateSlides(this.slides_);
    this.carousel_.updateAdvanceCount(advanceCount);
    this.carousel_.updateSnapBy(advanceCount);
    this.carousel_.updateVisibleCount(visibleCount);
  }

  /**
   * @param {boolean} outsetArrows
   * @private
   */
  updateOutsetArrows_(outsetArrows) {
    this.outsetArrows_ = outsetArrows;
    this.updateUi_();
  }

  /**
   * @param {string} extraSpace
   * @private
   */
  updateExtraSpace_(extraSpace) {
    this.content_.setAttribute(
      'i-amphtml-stream-gallery-extra-space',
      extraSpace
    );
  }

  /**
   * @param {string} insetArrowVisibility
   * @private
   */
  updateInsetArrowVisibility_(insetArrowVisibility) {
    this.insetArrowVisibility_ =
      insetArrowVisibilityMapping[insetArrowVisibility] ||
      InsetArrowVisibility.AUTO;
    this.updateUi_();
  }

  /**
   * @param {boolean} loop
   */
  updateLoop_(loop) {
    // For iOS, do not allow looping as scrolling, then touching during the
    // momentum scrolling can cause very broken behavior, since the carousel
    // is not aware that the user is touching the carousel.
    if (loop && Services.platformFor(this.win).isIos()) {
      user().warn(
        TAG,
        'amp-stream-gallery does not support looping on iOS due ' +
          'to https://bugs.webkit.org/show_bug.cgi?id=191218.'
      );
      return;
    }

    this.carousel_.updateLoop(loop);
  }

  /**
   * Updates the UI of the <amp-base-carousel> itself, but not the internal
   * implementation.
   * @private
   */
  updateUi_() {
    // TODO(sparhami) for Shadow DOM, we will need to get the assigned nodes
    // instead.
    iterateCursor(this.prevArrowSlot_.children, (child) => {
      toggleAttribute(child, 'disabled', this.carousel_.isAtStart());
    });
    iterateCursor(this.nextArrowSlot_.children, (child) => {
      toggleAttribute(child, 'disabled', this.carousel_.isAtEnd());
    });
    toggleAttribute(
      dev().assertElement(this.content_),
      'i-amphtml-stream-gallery-hide-inset-buttons',
      this.shouldHideInsetButtons_()
    );
    toggleAttribute(
      dev().assertElement(this.content_),
      'amp-stream-gallery-outset-arrows',
      this.outsetArrows_
    );
  }

  /**
   * Setups up visibility tracking for the child elements, laying them out
   * when needed.
   */
  initializeChildLayoutManagement_() {
    // Set up management of layout for the child slides.
    const owners = Services.ownersForDoc(this.element);
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

    const action = createCustomEvent(this.win, `streamGallery.${name}`, data);
    this.action_.trigger(this.element, name, action, trust);
    dispatchCustomEvent(this.element, name, data);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onIndexChanged_(event) {
    const detail = getDetail(event);
    const index = detail['index'];
    const actionSource = detail['actionSource'];

    this.hadTouch_ = this.hadTouch_ || actionSource == ActionSource.TOUCH;
    this.updateCurrentIndex_(index, actionSource);
    this.updateUi_();
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStreamGallery, CSS);
});
