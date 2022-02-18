import {PreactBaseElement} from '#preact/base-element';

import {BentoList} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoList;

/** @override */
BaseElement['props'] = {
  'src': {attr: 'src'},
  'itemsKey': {attr: 'items'},
  'maxItems': {attr: 'max-items', type: 'number'},
  'loadMore': {attr: 'load-more'},
  'loadMoreBookmark': {attr: 'load-more-bookmark'},
  'viewportBuffer': {attr: 'viewport-buffer', type: 'number'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['usesTemplate'] = true;
