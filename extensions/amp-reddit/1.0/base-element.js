import {PreactBaseElement} from '#preact/base-element';

import {Reddit} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Reddit;

/** @override */
BaseElement['props'] = {
  'src': {attr: 'data-src'},
  'embedType': {attr: 'data-src'},
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
