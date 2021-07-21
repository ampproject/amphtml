/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {Audio} from './component';
import {EMPTY_METADATA} from '../../../src/mediasession-helper';
import {PreactBaseElement} from '#preact/base-element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Audio;

/** @override */
BaseElement['props'] = {
  //'children': {passthroughNonEmpty: true},
  'children': {passthrough: true},
  album: {attr: 'album', type: 'string', default: EMPTY_METADATA.album},
  artist: {attr: 'artist', type: 'string', default: EMPTY_METADATA.artist},
  artwork: {attr: 'artwork', type: 'string', default: EMPTY_METADATA.artwork},
  autoplay: {attr: 'autoplay', type: 'boolean', default: false},
  controlsList: {attr: 'controlsList'},
  loop: {attr: 'loop', type: 'boolean', default: false},
  muted: {attr: 'muted', type: 'boolean', default: false},
  preload: {attr: 'preload'},
  src: {attr: 'src'},
  title: {attr: 'title', type: 'string', default: EMPTY_METADATA.title},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
