import {BentoVideoBaseElement} from '#bento/components/bento-video/1.0/base-element';

import {createParseAttrsWithPrefix} from '#preact/parse-props';

import {BentoYoutube} from './component';

export class BaseElement extends BentoVideoBaseElement {}

/** @override */
BaseElement['Component'] = BentoYoutube;

/** @override */
BaseElement['loadable'] = true;

/** @override */
BaseElement['props'] = {
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'loop': {attr: 'loop', type: 'boolean'},
  'controls': {attr: 'controls', type: 'boolean'},
  'videoid': {attr: 'data-videoid'},
  'liveChannelid': {attr: 'data-live-channelid'},
  'dock': {attr: 'dock', media: true},
  'credentials': {attr: 'credentials'},
  // TODO(wg-components): Current behavior defaults to loading="auto".
  // Refactor to make loading="lazy" as the default.
  'loading': {attr: 'data-loading'},
  'params': createParseAttrsWithPrefix('data-param-'),
};

/** @override */
BaseElement['usesShadowDom'] = true;
