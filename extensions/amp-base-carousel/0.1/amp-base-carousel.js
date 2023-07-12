import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Keys_Enum} from '#core/constants/key-codes';
import {
  dispatchCustomEvent,
  isRTL,
  iterateCursor,
  toggleAttribute,
} from '#core/dom';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {scopedQuerySelectorAll} from '#core/dom/query';
import {htmlFor} from '#core/dom/static-template';
import {toArray} from '#core/types/array';

import {Services} from '#service';

import {createCustomEvent, getDetail} from '#utils/event-helper';
import {dev, devAssert} from '#utils/log';

import {ActionSource} from './action-source';
import {Carousel} from './carousel';
import {CarouselEvents} from './carousel-events';
import {ChildLayoutManager} from './child-layout-manager';
import {
  ResponsiveAttributes,
  getResponsiveAttributeValue,
} from './responsive-attributes';

import {CSS} from '../../../build/amp-base-carousel-0.1.css';

/**
 * @enum {number}
 */
const Controls = {
  ALWAYS: 0,
  NEVER: 1,
  AUTO: 2,
};

/**
 * @param {!Element} el The Element to check.
 * @return {boolean} Whether or not the Element is a sizer Element.
 */
function isSizer(el) {
  return el.tagName === 'I-AMPHTML-SIZER';
}

export class AmpCarousel extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const */
    this.responsiveAttributes_ = this.getAttributeConfig_();

    /** @private @const {boolean} */
    this.isIos_ = Services.platformFor(this.win).isIos();

    /** @private {?Element} */
    this.scrollContainer_ = null;

    /** @private {?Carousel} */
    this.carousel_ = null;

    /** @private {!Array<!Element>} */
    this.slides_ = [];

    /** @private {?Element} */
    this.nextArrowSlot_ = null;

    /** @private {?Element} */
    this.prevArrowSlot_ = null;

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

    /** @private {!Controls} */
    this.controls_ = Controls.AUTO;
  }

  /**
   * The configuration for handling attributes on this element.
   * @return {!{[key: string]: function(string)}}
   * @private
   */
  getAttributeConfig_() {
    return new ResponsiveAttributes({
      'advance-count': (newValue) => {
        this.carousel_.updateAdvanceCount(Number(newValue) || 0);
      },
      'auto-advance': (newValue) => {
        this.carousel_.updateAutoAdvance(newValue === 'true');
      },
      'auto-advance-count': (newValue) => {
        this.carousel_.updateAutoAdvanceCount(Number(newValue) || 0);
      },
      'auto-advance-interval': (newValue) => {
        this.carousel_.updateAutoAdvanceInterval(Number(newValue) || 0);
      },
      'auto-advance-loops': (newValue) => {
        this.carousel_.updateAutoAdvanceLoops(Number(newValue) || 0);
      },
      'controls': (newValue) => {
        this.updateControls_(newValue);
      },
      'dir': (newValue) => {
        this.carousel_.updateForwards(newValue != 'rtl');
      },
      'horizontal': (newValue) => {
        this.carousel_.updateHorizontal(newValue === 'true');
      },
      'loop': (newValue) => {
        this.carousel_.updateLoop(newValue === 'true' || newValue === '');
      },
      'mixed-length': (newValue) => {
        this.carousel_.updateMixedLength(newValue === 'true');
      },
      'slide': (newValue) => {
        this.carousel_.goToSlide(Number(newValue));
      },
      'snap': (newValue) => {
        this.carousel_.updateSnap(newValue === 'true');
      },
      'snap-align': (newValue) => {
        this.carousel_.updateAlignment(newValue);
      },
      'snap-by': (newValue) => {
        this.carousel_.updateSnapBy(Number(newValue) || 0);
      },
      'visible-count': (newValue) => {
        this.carousel_.updateVisibleCount(Number(newValue) || 0);
      },
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.action_ = Services.actionServiceForDoc(this.element);

    this.buildCarouselDom_();

    this.carousel_ = new Carousel({
      win: this.win,
      element: this.element,
      scrollContainer: dev().assertElement(this.scrollContainer_),
      initialIndex: this.getInitialIndex_(),
      runMutate: (cb) => this.mutateElement(cb),
    });

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
   * @return {!Array<!Element>} The slides in the carousel.
   */
  getSlides() {
    return this.slides_;
  }

  /**
   * Moves the Carousel to a given index.
   * @param {number} index
   * @param {{
   *   smoothScroll: (boolean|undefined),
   *   actionSource: (!ActionSource|undefined),
   * }=} options
   */
  goToSlide(index, options = {}) {
    const {actionSource, smoothScroll = false} = options;
    this.carousel_.goToSlide(index, {smoothScroll, actionSource});
  }

  /**
   * Goes to the next slide. This should be called from a user interaction.
   */
  interactionNext() {
    this.carousel_.next(ActionSource.GENERIC_HIGH_TRUST);
  }

  /**
   * Goes to the previous slide. This should be called from a user interaction.
   */
  interactionPrev() {
    this.carousel_.prev(ActionSource.GENERIC_HIGH_TRUST);
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
      if (slot === 'prev-arrow') {
        prevArrow = c;
      } else if (slot === 'next-arrow') {
        nextArrow = c;
      } else if (!isSizer(c)) {
        this.slides_.push(c);
      }
    });

    // Create the DOM, get references to elements.
    element.appendChild(this.renderContainerDom_());
    this.scrollContainer_ = element.querySelector('.i-amphtml-carousel-scroll');
    this.prevArrowSlot_ = this.element.querySelector(
      '.i-amphtml-base-carousel-arrow-prev-slot'
    );
    this.nextArrowSlot_ = this.element.querySelector(
      '.i-amphtml-base-carousel-arrow-next-slot'
    );

    // Do some manual "slot" distribution
    this.slides_.forEach((slide) => {
      slide.classList.add('i-amphtml-carousel-slotted');
      this.scrollContainer_.appendChild(slide);
    });

    this.prevArrowSlot_.appendChild(prevArrow || this.createPrevArrow_());
    this.nextArrowSlot_.appendChild(nextArrow || this.createNextArrow_());
  }

  /**
   * @return {!Element}
   * @private
   */
  renderContainerDom_() {
    const html = htmlFor(this.element);
    return html`
      <div class="i-amphtml-carousel-content">
        <div class="i-amphtml-carousel-scroll" tabindex="-1"></div>
        <div class="i-amphtml-base-carousel-arrows">
          <div class="i-amphtml-base-carousel-arrow-prev-slot"></div>
          <div class="i-amphtml-base-carousel-arrow-next-slot"></div>
        </div>
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
      <button
        class="i-amphtml-base-carousel-arrow"
        aria-label="Next item in carousel"
      >
        <div class="i-amphtml-base-carousel-arrow-frosting"></div>
        <div class="i-amphtml-base-carousel-arrow-backdrop"></div>
        <div class="i-amphtml-base-carousel-arrow-background"></div>
        <svg class="i-amphtml-base-carousel-arrow-icon" viewBox="0 0 24 24">
          <path
            d="M10,7.4 L14.6,12 L10,16.6"
            fill="none"
            stroke-width="2px"
            stroke-linejoin="round"
            stroke-linecap="round"
          ></path>
        </svg>
      </button>
    `;
  }

  /**
   * @return {!Element}
   * @private
   */
  createPrevArrow_() {
    const html = htmlFor(this.element);
    return html`
      <button
        class="i-amphtml-base-carousel-arrow"
        aria-label="Previous item in carousel"
      >
        <div class="i-amphtml-base-carousel-arrow-frosting"></div>
        <div class="i-amphtml-base-carousel-arrow-backdrop"></div>
        <div class="i-amphtml-base-carousel-arrow-background"></div>
        <svg class="i-amphtml-base-carousel-arrow-icon" viewBox="0 0 24 24">
          <path
            d="M14,7.4 L9.4,12 L14,16.6"
            fill="none"
            stroke-width="2px"
            stroke-linejoin="round"
            stroke-linecap="round"
          ></path>
        </svg>
      </button>
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

    // For amp-inline-gallery-slide, we need to actually monitor the content,
    // which is transformed instead of the slide.
    const monitoredDescendants = this.slides_
      .map((slide) => {
        return slide.localName === 'amp-inline-gallery-slide'
          ? toArray(scopedQuerySelectorAll(slide, '> :not([slot])'))
          : slide;
      })
      .reduce((arr, children) => arr.concat(children), []);
    this.childLayoutManager_.updateChildren(monitoredDescendants);
  }

  /**
   * @private
   */
  initializeActions_() {
    this.registerAction(
      'prev',
      (actionInvocation) => {
        const {trust} = actionInvocation;
        this.carousel_.prev(this.getActionSource_(trust));
      },
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'next',
      (actionInvocation) => {
        const {trust} = actionInvocation;
        this.carousel_.next(this.getActionSource_(trust));
      },
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'goToSlide',
      (actionInvocation) => {
        const {args, trust} = actionInvocation;
        this.carousel_.goToSlide(Number(args['index'] ?? -1), {
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
    this.element.addEventListener('goToSlide', (event) => {
      const detail = getDetail(event);
      this.carousel_.goToSlide(detail['index']);
    });
    this.element.addEventListener('keydown', (event) => {
      this.onKeydown_(event);
    });
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
   * @return {boolean} Whether or not controls should be hidden.
   */
  shouldHideControls_() {
    if (this.controls_ === Controls.NEVER) {
      return true;
    }

    if (this.controls_ === Controls.ALWAYS) {
      return false;
    }

    return this.hadTouch_;
  }

  /**
   * @param {string} controls
   * @private
   */
  updateControls_(controls) {
    switch (controls) {
      case 'always':
        this.controls_ = Controls.ALWAYS;
        break;
      case 'never':
        this.controls_ = Controls.NEVER;
        break;
      default:
        this.controls_ = Controls.AUTO;
        break;
    }
    this.updateUi_();
  }

  /**
   * Updates the UI of the <amp-base-carousel> itself, but not the internal
   * implementation.
   * @private
   */
  updateUi_() {
    const index = this.carousel_.getCurrentIndex();
    const loop = this.carousel_.isLooping();
    const visibleCount = this.carousel_.getVisibleCount();
    const isAtEnd = this.carousel_.isAtEnd();
    const isAtStart = this.carousel_.isAtStart();
    // TODO(sparhami) for Shadow DOM, we will need to get the assigned nodes
    // instead.
    iterateCursor(this.prevArrowSlot_.children, (child) => {
      const disabled = (!loop && index === 0) || isAtStart;
      toggleAttribute(child, 'disabled', disabled);
    });
    iterateCursor(this.nextArrowSlot_.children, (child) => {
      const disabled =
        (!loop && index >= this.slides_.length - visibleCount) || isAtEnd;
      toggleAttribute(child, 'disabled', disabled);
    });
    toggleAttribute(
      this.element,
      'i-amphtml-base-carousel-hide-buttons',
      this.shouldHideControls_()
    );
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
   * Handle a keyup, potentially going to the next/previous set of slides,
   * depending on the carousel configuration.
   * @param {!Event} event
   */
  onKeydown_(event) {
    const isRight = event.key === Keys_Enum.RIGHT_ARROW;
    const isLeft = event.key === Keys_Enum.LEFT_ARROW;

    if (!isRight && !isLeft) {
      return;
    }

    const rtl = isRTL(devAssert(this.element.ownerDocument));
    const next = (isRight && !rtl) || (isLeft && rtl);

    if (next) {
      this.carousel_.next();
    } else {
      this.carousel_.prev();
    }

    event.preventDefault();
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
   * @param {!ActionSource|undefined} actionSource
   * @return {boolean} Whether or not the action is a high trust action.
   * @private
   */
  isHighTrustActionSource_(actionSource) {
    return (
      actionSource === ActionSource.WHEEL ||
      actionSource === ActionSource.TOUCH ||
      actionSource === ActionSource.GENERIC_HIGH_TRUST
    );
  }

  /**
   * @private
   * @param {!Event} event
   */
  onIndexChanged_(event) {
    const detail = getDetail(event);
    const index = detail['index'];
    const actionSource = detail['actionSource'];
    const data = {'index': index};
    const name = 'slideChange';
    const isHighTrust = this.isHighTrustActionSource_(actionSource);
    const trust = isHighTrust ? ActionTrust_Enum.HIGH : ActionTrust_Enum.LOW;

    const action = createCustomEvent(this.win, `slidescroll.${name}`, data);
    this.action_.trigger(this.element, name, action, trust);
    dispatchCustomEvent(this.element, name, data);
    this.hadTouch_ = this.hadTouch_ || actionSource === ActionSource.TOUCH;
    this.updateUi_();
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
   * Used by amp-lightbox-gallery
   *
   * Does all the work needed to proceed to next
   * desired direction.
   * @param {number} dir -1 or 1
   */
  goCallback(dir) {
    if (dir === 1) {
      this.interactionNext();
    } else {
      this.interactionPrev();
    }
  }
}

AMP.extension('amp-base-carousel', '0.1', (AMP) => {
  AMP.registerElement('amp-base-carousel', AmpCarousel, CSS);
});
