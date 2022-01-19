import {PreactBaseElement} from '#preact/base-element';

import {CarouselContextProp} from './carousel-props';
import {BentoBaseCarousel} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?number} */
    this.slide_ = null;
  }

  /** @override */
  init() {
    const {element} = this;
    this.slide_ = parseInt(element.getAttribute('slide'), 10);
    return {
      'defaultSlide': this.slide_ || 0,
      'onSlideChange': (index) => {
        this.triggerEvent(element, 'slideChange', {'index': index});
      },
    };
  }

  /** @override */
  mutationObserverCallback() {
    const slide = parseInt(this.element.getAttribute('slide'), 10);
    if (slide === this.slide_) {
      return;
    }
    this.slide_ = slide;
    if (!isNaN(slide)) {
      this.api().goToSlide(slide);
    }
  }
}

/** @override */
BaseElement['Component'] = BentoBaseCarousel;

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['props'] = {
  'advanceCount': {attr: 'advance-count', type: 'number', media: true},
  'arrowPrevAs': {
    selector: '[slot="prev-arrow"]',
    single: true,
    as: true,
  },
  'arrowNextAs': {
    selector: '[slot="next-arrow"]',
    single: true,
    as: true,
  },
  'autoAdvance': {attr: 'auto-advance', type: 'boolean', media: true},
  'autoAdvanceCount': {attr: 'auto-advance-count', type: 'number', media: true},
  'autoAdvanceInterval': {
    attr: 'auto-advance-interval',
    type: 'number',
    media: true,
  },
  'autoAdvanceLoops': {attr: 'auto-advance-loops', type: 'number', media: true},
  'controls': {attr: 'controls', media: true},
  'orientation': {attr: 'orientation', media: true, default: 'horizontal'},
  'loop': {attr: 'loop', type: 'boolean', media: true},
  'mixedLength': {attr: 'mixed-length', type: 'boolean', media: true},
  'outsetArrows': {attr: 'outset-arrows', type: 'boolean', media: true},
  'snap': {attr: 'snap', type: 'boolean', media: true, default: true},
  'snapBy': {attr: 'snap-by', type: 'number', media: true},
  'snapAlign': {attr: 'snap-align', media: true},
  'visibleCount': {attr: 'visible-count', type: 'number', media: true},
  'children': {
    props: {
      'thumbnailSrc': {attr: 'data-thumbnail-src'},
    },
    selector: '*', // This should be last as catch-all.
    single: false,
  },
};

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;

/** @override */
BaseElement['useContexts'] = [CarouselContextProp];
