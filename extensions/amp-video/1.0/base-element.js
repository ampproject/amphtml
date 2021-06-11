/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {CSS} from './autoplay.jss';
import {PreactBaseElement} from '#preact/base-element';
import {VideoWrapper} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = VideoWrapper;

/** @override */
BaseElement['loadable'] = true;

/** @override */
BaseElement['layoutSizeDefined'] = true;

/**
 * Defaults to `{component: 'video'}` from `VideoWrapper` component.
 * Subclasses may set:
 * ```
 *   AmpMyPlayer['staticProps'] = dict({
 *     'component': MyPlayerComponent,
 *   });
 * ```
 * @override
 */
BaseElement['staticProps'];

/** @override */
BaseElement['props'] = {
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
BaseElement['shadowCss'] = CSS;

/** @override */
BaseElement['usesShadowDom'] = true;
