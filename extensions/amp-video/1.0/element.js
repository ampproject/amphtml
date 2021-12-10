import {CSS} from './component.jss';
import {CSS as CSS_AUTOPLAY} from './autoplay.jss';

export {BentoVideo as Component} from './component';

export const loadable = true;

export const layoutSizeDefined = true;

export const props = {
  'album': {attr: 'album'},
  'alt': {attr: 'alt'},
  'artist': {attr: 'artist'},
  'artwork': {attr: 'artwork'},
  'attribution': {attr: 'attribution'},
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'controls': {attr: 'controls', type: 'boolean'},
  'controlslist': {attr: 'controlslist'},
  'crossorigin': {attr: 'crossorigin'},
  'disableremoteplayback': {attr: 'disableremoteplayback'},
  'loop': {attr: 'loop', type: 'boolean'},
  'noaudio': {attr: 'noaudio', type: 'boolean'},
  'poster': {attr: 'poster'},
  'sources': {
    selector: 'source',
    single: false,
    clone: true,
  },
  'src': {attr: 'src'},
  'title': {attr: 'title'},

  // TODO(alanorozco): These props have no internal implementation yet.
  'dock': {attr: 'dock', media: true},
  'rotate-to-fullscreen': {
    attr: 'rotate-to-fullscreen',
    type: 'boolean',
    media: true,
  },
};
export const shadowCss = CSS + CSS_AUTOPLAY;

export const usesShadowDom = true;
