import {PreactBaseElement} from '#preact/base-element';

import {BentoAudio} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoAudio;

/** @override */
BaseElement['props'] = {
  album: {attr: 'album', type: 'string'},
  'aria-describedby': {attr: 'aria-describedby', type: 'string'},
  'aria-label': {attr: 'aria-label', type: 'string'},
  'aria-labelledby': {attr: 'aria-labelledby', type: 'string'},
  artist: {attr: 'artist', type: 'string'},
  artwork: {attr: 'artwork', type: 'string'},
  // TODO(dmanek): Use InOb hook for autoplay.
  // autoplay: {attr: 'autoplay', type: 'boolean'},
  controlsList: {attr: 'controlsList'},
  loop: {attr: 'loop', type: 'boolean'},
  muted: {attr: 'muted', type: 'boolean'},
  preload: {attr: 'preload'},
  sources: {selector: 'source', single: false, clone: true},
  src: {attr: 'src'},
  title: {attr: 'title', type: 'string'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
