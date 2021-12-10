export {BentoSoundcloud as Component} from './component';

export const props = {
  'children': {passthroughNonEmpty: true},
  'color': {attr: 'data-color'},
  'playlistId': {attr: 'data-playlistid'},
  'secretToken': {attr: 'data-secret-token'},
  'trackId': {attr: 'data-trackid'},
  'visual': {attr: 'data-visual', type: 'boolean', default: false},
};

export const layoutSizeDefined = true;

export const usesShadowDom = true;

export const loadable = true;

export const preconnects = ['https://api.soundcloud.com/'];
