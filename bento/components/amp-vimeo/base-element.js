import {VideoBaseElement} from '#bento/components/amp-video/video-base-element';

import {BentoVimeo} from './component';

export class BaseElement extends VideoBaseElement {}

/** @override */
BaseElement['Component'] = BentoVimeo;

/** @override */
BaseElement['props'] = {
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'controls': {attr: 'controls', type: 'boolean'},
  'videoid': {attr: 'data-videoid'},
  'doNotTrack': {attr: 'do-not-track'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
