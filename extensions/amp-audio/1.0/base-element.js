import {PreactBaseElement} from '#preact/base-element';

import {Audio} from './component';

import {EMPTY_METADATA} from '../../../src/mediasession-helper';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Audio;

/** @override */
BaseElement['props'] = {
  album: {attr: 'album', type: 'string', default: EMPTY_METADATA.album},
  'aria-describedby': {attr: 'aria-describedby', type: 'string'},
  'aria-label': {attr: 'aria-label', type: 'string'},
  'aria-labelledby': {attr: 'aria-labelledby', type: 'string'},
  artist: {attr: 'artist', type: 'string'},
  artwork: {attr: 'artwork', type: 'string'},
  autoplay: {attr: 'autoplay', type: 'boolean', default: false},
  controlsList: {attr: 'controlsList'},
  loop: {attr: 'loop', type: 'boolean'},
  muted: {attr: 'muted', type: 'boolean'},
  preload: {attr: 'preload'},
  sources: {selector: 'source', single: false, clone: true},
  src: {attr: 'src'},
  title: {attr: 'title', type: 'string', default: EMPTY_METADATA.title},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
