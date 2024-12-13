import {BentoVideoBaseElement} from '#bento/components/bento-video/1.0/base-element';

import {BentoVideoIframe} from './component';

export class BaseElement extends BentoVideoBaseElement {}

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
  // TODO(wg-components): Current behavior defaults to loading="auto".
  // Refactor to make loading="lazy" as the default.
  'loading': {attr: 'data-loading'},

  // TODO(alanorozco): These props have no internal implementation yet.
  'dock': {attr: 'dock'},
  'rotate-to-fullscreen': {attr: 'rotate-to-fullscreen', type: 'boolean'},
};

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['loadable'] = true;
