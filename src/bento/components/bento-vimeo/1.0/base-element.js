import {BentoVideoBaseElement} from '#bento/components/bento-video/1.0/base-element';

import {BentoVimeo} from './component';

export class BaseElement extends BentoVideoBaseElement {}

/** @override */
BaseElement['Component'] = BentoVimeo;

/** @override */
BaseElement['props'] = {
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'controls': {attr: 'controls', type: 'boolean'},
  'videoid': {attr: 'data-videoid'},
  'doNotTrack': {attr: 'do-not-track'},
  // TODO(wg-components): Current behavior defaults to loading="auto".
  // Refactor to make loading="lazy" as the default.
  'loading': {attr: 'data-loading'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['loadable'] = true;
