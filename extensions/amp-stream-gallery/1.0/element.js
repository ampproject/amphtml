import {CSS as CAROUSEL_CSS} from '../../amp-base-carousel/1.0/component.jss';
import {CSS as GALLERY_CSS} from './component.jss';
import {BentoStreamGallery} from './component';
import {dict} from '#core/types/object';

/**
 * @param {*} element
 * @param {*} triggerEvent
 * @return {JsonObject}
 */
export function elementInit(element, triggerEvent) {
  return dict({
    'onSlideChange': (index) => {
      triggerEvent(element, 'slideChange', dict({'index': index}));
    },
  });
}

export const Component = BentoStreamGallery;

export const layoutSizeDefined = true;

export const props = {
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
  'controls': {attr: 'controls', media: true},
  'extraSpace': {attr: 'extra-space', media: true},
  'loop': {attr: 'loop', type: 'boolean', media: true},
  'minItemWidth': {attr: 'min-item-width', type: 'number', media: true},
  'maxItemWidth': {attr: 'max-item-width', type: 'number', media: true},
  'maxVisibleCount': {attr: 'max-visible-count', type: 'number', media: true},
  'minVisibleCount': {attr: 'min-visible-count', type: 'number', media: true},
  'outsetArrows': {attr: 'outset-arrows', type: 'boolean', media: true},
  'peek': {attr: 'peek', type: 'number', media: true},
  'slideAlign': {attr: 'slide-align', media: true},
  'snap': {attr: 'snap', type: 'boolean', media: true},
  'children': {
    selector: '*', // This should be last as catch-all.
    single: false,
  },
};

export const usesShadowDom = true;

export const shadowCss = GALLERY_CSS + CAROUSEL_CSS;
