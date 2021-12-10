import {createParseAttrsWithPrefix} from '#preact/parse-props';

export {BentoYoutube as Component} from './component';

export const loadable = true;

export const props = {
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

export const usesShadowDom = true;
