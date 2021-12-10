import {CSS as COMPONENT_CSS} from './component.jss';
import {CarouselContextProp} from './carousel-props';
import {dict} from '#core/types/object';
export {BentoBaseCarousel as Component} from './component';

/**
 * @param {*} element
 * @param {*} triggerEvent
 * @return {*}
 */
export function elementInit(element, triggerEvent) {
  const slide = parseInt(element.getAttribute('slide'), 10);
  return {
    slide,
    props: dict({
      'defaultSlide': slide || 0,
      'onSlideChange': (index) => {
        triggerEvent(element, 'slideChange', dict({'index': index}));
      },
    }),
  };
}

/**
 * @param {*} element
 * @param {*} prevSlide
 * @param {*} goToSlide
 * @return {number}
 */
export function mutationObserverCallback(element, prevSlide, goToSlide) {
  const slide = parseInt(element.getAttribute('slide'), 10);
  if (slide === prevSlide) {
    return;
  }
  if (!isNaN(slide)) {
    goToSlide(slide);
  }
  return slide;
}

export const layoutSizeDefined = true;

export const props = {
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

export const usesShadowDom = true;

export const shadowCss = COMPONENT_CSS;

export const useContexts = [CarouselContextProp];
