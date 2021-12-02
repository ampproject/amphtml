import {PreactBaseElement} from '#preact/base-element';

import {BentoBeopinion} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoBeopinion;

/** @override */
BaseElement['unloadOnPause'] = true;

/** @override */
BaseElement['props'] = {
  account: {attr: 'data-account'},
  content: {attr: 'data-content'},
  myContent: {attr: 'data-my-content'},
  name: {attr: 'data-name'},
  title: {attr: 'title'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
