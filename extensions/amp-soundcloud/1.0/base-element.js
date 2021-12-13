import {PreactBaseElement} from '#preact/base-element';

import {BentoSoundcloud} from './component';

export class BaseElement extends PreactBaseElement {
  /** @override */
  static getPreconnects() {
    return ['https://api.soundcloud.com/'];
  }
}

/** @override */
BaseElement['Component'] = BentoSoundcloud;

/** @override */
BaseElement['props'] = {
  'children': {passthroughNonEmpty: true},
  'color': {attr: 'data-color'},
  'playlistId': {attr: 'data-playlistid'},
  'secretToken': {attr: 'data-secret-token'},
  'trackId': {attr: 'data-trackid'},
  'visual': {attr: 'data-visual', type: 'boolean', default: false},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['loadable'] = true;
