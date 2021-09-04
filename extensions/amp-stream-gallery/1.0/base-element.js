import {CSS as CAROUSEL_CSS} from '../../amp-base-carousel/1.0/component.jss';
import {CSS as GALLERY_CSS} from './component.jss';
import {PreactBaseElement} from '#preact/base-element';
import {StreamGallery} from './component';
import {dict} from '#core/types/object';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    const {element} = this;
    return dict({
      'onSlideChange': (index) => {
        this.triggerEvent(element, 'slideChange', dict({'index': index}));
      },
    });
  }
}

/** @override */
BaseElement['Component'] = StreamGallery;

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['props'] = {
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
  'controls': {attr: 'controls', type: 'string', media: true},
  'extraSpace': {attr: 'extra-space', type: 'string', media: true},
  'loop': {attr: 'loop', type: 'boolean', media: true},
  'minItemWidth': {attr: 'min-item-width', type: 'number', media: true},
  'maxItemWidth': {attr: 'max-item-width', type: 'number', media: true},
  'maxVisibleCount': {attr: 'max-visible-count', type: 'number', media: true},
  'minVisibleCount': {attr: 'min-visible-count', type: 'number', media: true},
  'outsetArrows': {attr: 'outset-arrows', type: 'boolean', media: true},
  'peek': {attr: 'peek', type: 'number', media: true},
  'slideAlign': {attr: 'slide-align', type: 'string', media: true},
  'snap': {attr: 'snap', type: 'boolean', media: true},
  'children': {
    selector: '*', // This should be last as catch-all.
    single: false,
  },
};

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = GALLERY_CSS + CAROUSEL_CSS;
