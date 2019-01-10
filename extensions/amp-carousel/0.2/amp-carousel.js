import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-carousel-0.2.css';
import {Carousel} from './carousel.js';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {toArray} from '../../../src/types';

/**
 * @param {!Element} el The Element to check.
 * @return {boolean} Whether or not the Element is a sizer Element.
 */
function isSizer(el) {
  return el.tagName == 'I-AMPHTML-SIZER';
}

class AmpCarousel extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.advanceCount_ = 1;

    /** @private {?Carousel} */
    this.carousel_ = null;

    /** @private {!Array<!Element>} */
    this.slides_ = [];
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const {element} = this;
    // Grab the slides up front so we can place them later.
    this.slides_ = toArray(element.children).filter(c => !isSizer(c));
    // Create the carousel's inner DOM.
    element.appendChild(this.renderContainerDom_());

    this.carousel_ = new Carousel({
      win,
      element,
      scrollContainer: this.element.querySelector('.i-amphtml-carousel-scroll'),
      runMutate: cb => this.mutateElement(cb),
    });

    // Handle the initial set of attributes
    Array.from(this.element.attributes).forEach(attr => {
      this.attributeMutated_(attr.name, attr.value);
    });

    this.setupActions_();

    // Do some manual "slot" distribution
    const scrollContainer = element.querySelector('.i-amphtml-carousel-scroll');
    this.slides_.forEach(slide => {
      slide.classList.add('i-amphtml-carousel-slotted');
      scrollContainer.appendChild(slide);
    });

    this.carousel_.updateSlides(this.slides_);
    // Signal for runtime to check children for layout.
    return this.mutateElement(() => {});
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    this.carousel_.updateUi();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    for (const key in mutations) {
      this.attributeMutated_(key, mutations[key]);
    }
  }

  /**
   * @private
   */
  renderContainerDom_() {
    const html = htmlFor(this.element);
    return html`
      <div class="i-amphtml-carousel-scroll"></div>
    `;
  }

  /**
   * @private
   */
  setupActions_() {
    this.registerAction('prev', () => this.carousel_.prev(), ActionTrust.LOW);
    this.registerAction('next', () => this.carousel_.next(), ActionTrust.LOW);
    this.registerAction('goToSlide', ({args}) => {
      this.carousel_.goToSlide(args['index'] || -1);
    }, ActionTrust.LOW);
  }

  /**
   * @param {string} name The name of the attribute.
   * @param {string} newValue The new value of the attribute.
   * @private
   */
  attributeMutated_(name, newValue) {
    switch (name) {
      case 'auto-advance':
        this.carousel_.updateAutoAdvance(newValue == 'true');
        break;
      case 'auto-advance-count':
        this.carousel_.updateAutoAdvanceCount(Number(newValue) || 0);
        break;
      case 'auto-advance-interval':
        this.carousel_.updateAutoAdvanceInterval(Number(newValue) || 0);
        break;
      case 'horizontal':
        this.carousel_.updateHorizontal(newValue == 'true');
        break;
      case 'initial-index':
        this.carousel_.updateInitialIndex(Number(newValue) || 0);
        break;
      case 'loop':
        this.carousel_.updateLoop(newValue == 'true');
        break;
      case 'mixed-length':
        this.carousel_.updateMixedLength(newValue == 'true');
        break;
      case 'side-slide-count':
        this.carousel_.updateSideSlideCount(Number(newValue) || 0);
        break;
      case 'snap':
        this.carousel_.updateSnap(newValue == 'true');
        break;
      case 'snap-align':
        this.carousel_.updateAlignment(newValue);
        break;
      case 'snap-by':
        this.carousel_.updateSnapBy(Number(newValue) || 0);
        break;
      case 'visible-count':
        this.carousel_.updateVisibleCount(Number(newValue) || 0);
        break;
    }
  }
}

AMP.extension('amp-carousel', '0.2', AMP => {
  if (!isExperimentOn(AMP.win, 'amp-carousel-v2')) {
    return;
  }

  AMP.registerElement('amp-carousel', AmpCarousel, CSS);
});
