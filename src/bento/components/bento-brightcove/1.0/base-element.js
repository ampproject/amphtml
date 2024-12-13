import {BentoVideoBaseElement} from '#bento/components/bento-video/1.0/base-element';

import {createParseAttrsWithPrefix} from '#preact/parse-props';

import {BentoBrightcove} from './component';

export class BaseElement extends BentoVideoBaseElement {}

/** @override */
BaseElement['Component'] = BentoBrightcove;

/** @override */
BaseElement['props'] = {
  'account': {attr: 'data-account'},
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'embed': {attr: 'data-embed', default: 'default'},
  'player': {
    attrs: ['data-player', 'data-player-id'],
    parseAttrs(element) {
      const {'player': player, 'playerId': playerId} = element.dataset;
      return player || playerId || 'default';
    },
  },
  'playlistId': {attr: 'data-playlist-id'},
  'referrer': {attr: 'data-referrer'},
  'urlParams': createParseAttrsWithPrefix('data-param-'),
  'videoId': {attr: 'data-video-id'},
  // TODO(wg-bento): These props have no internal implementation yet.
  'dock': {attr: 'dock', media: true},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
