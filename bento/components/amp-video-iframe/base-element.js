import {VideoBaseElement} from '#bento/components/amp-video/video-base-element';

import {BentoVideoIframe} from './component';

export class BaseElement extends VideoBaseElement {}

/** @override */
BaseElement['Component'] = BentoVideoIframe;

/** @override */
BaseElement['props'] = {
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'referrerpolicy': {attr: 'referrerpolicy'},
  'implements-media-session': {attr: 'mediasession', type: 'boolean'},
  'poster': {attr: 'poster'},
  'src': {attr: 'src'},
  'controls': {attr: 'controls', type: 'boolean'},

  // TODO(alanorozco): These props have no internal implementation yet.
  'dock': {attr: 'dock'},
  'rotate-to-fullscreen': {attr: 'rotate-to-fullscreen', type: 'boolean'},
};

/** @override */
BaseElement['usesShadowDom'] = true;
