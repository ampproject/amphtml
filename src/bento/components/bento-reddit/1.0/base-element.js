import {BentoReddit} from '#bento/components/bento-reddit/1.0/component';

import {PreactBaseElement} from '#preact/base-element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoReddit;

/** @override */
BaseElement['props'] = {
  'src': {attr: 'data-src'},
  'embedType': {attr: 'data-embedtype'},
  'uuid': {attr: 'data-uuid'},
  'embedCreated': {attr: 'data-embedcreated'},
  'embedParent': {attr: 'data-embedparent'},
  'embedLive': {attr: 'data-embedlive'},
  'title': {attr: 'title'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
