import {VideoBaseElement} from '#bento/components/amp-video/video-base-element';

import {BentoYoutube} from './component';

export class BaseElement extends VideoBaseElement {}

/** @override */
BaseElement['Component'] = BentoYoutube;

/** @override */
BaseElement['props'] = {
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'loop': {attr: 'loop', type: 'boolean'},
  'controls': {attr: 'controls', type: 'boolean'},
  'videoid': {attr: 'data-videoid'},
  'liveChannelid': {attr: 'data-live-channelid'},
  'dock': {attr: 'dock', media: true},
  'credentials': {attr: 'credentials'},
  'params': {attrPrefix: 'data-param-'},
};

/** @override */
BaseElement['usesShadowDom'] = true;
