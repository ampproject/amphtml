import {BentoBrightcove} from './component';
import {createParseAttrsWithPrefix} from '#preact/parse-props';
import {PreactBaseElement} from '#preact/base-element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoBrightcove;

/** @override */
BaseElement['props'] = {
  'account': {attr: 'data-account', type: 'string'},
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'embed': {attr: 'data-embed', type: 'string', default: 'default'},
  'player': {
    attrs: ['data-player', 'data-player-id'],
    parseAttrs(element) {
      const {'player': player, 'playerId': playerId} = element.dataset;
      return player || playerId || 'default';
    },
  },
  'playlistId': {attr: 'data-playlist-id', type: 'string'},
  'referrer': {attr: 'data-referrer', type: 'string'},
  'urlParams': createParseAttrsWithPrefix('data-param-'),
  'videoId': {attr: 'data-video-id', type: 'string'},
  // TODO(wg-bento): These props have no internal implementation yet.
  'dock': {attr: 'dock', media: true},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
