import {PreactBaseElement} from '#preact/base-element';

import {CSS as CSS_AUTOPLAY} from './autoplay.jss';
import {BentoVideo} from './component';
import {CSS} from './component.jss';

export class BentoVideoBaseElement extends PreactBaseElement {}
// export with alias for bento builds
export {BentoVideoBaseElement as BaseElement};

/** @override */
BentoVideoBaseElement['Component'] = BentoVideo;

/** @override */
BentoVideoBaseElement['loadable'] = true;

/** @override */
BentoVideoBaseElement['layoutSizeDefined'] = true;

/**
 * Defaults to `{component: 'video'}` from `BentoVideo` component.
 * Subclasses may set:
 * ```
 *   AmpMyPlayer['staticProps'] = {
 *     'component': MyPlayerComponent,
 *   };
 * ```
 * @override
 */
BentoVideoBaseElement['staticProps'];

/** @override */
BentoVideoBaseElement['props'] = {
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

/** @override */
BentoVideoBaseElement['shadowCss'] = CSS + CSS_AUTOPLAY;

/** @override */
BentoVideoBaseElement['usesShadowDom'] = true;
