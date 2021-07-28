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

import {Brightcove} from './component';
import {VideoBaseElement} from '../../amp-video/1.0/video-base-element';

export class BaseElement extends VideoBaseElement {}

/** @override */
BaseElement['Component'] = Brightcove;

/** @override */
BaseElement['props'] = {
  'account': {attr: 'data-account', type: 'string'},
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'embed': {attr: 'data-embed', type: 'string', default: 'default'},
  'player': {
    attrs: ['data-player', 'data-player-id'],
    parseAttrs: (element) =>
      element.getAttribute('data-player') ||
      element.getAttribute('data-player-id') ||
      'default',
  },
  'playlistId': {attr: 'data-playlist-id', type: 'string'},
  'referrer': {attr: 'data-referrer', type: 'string'},
  'urlParams': {attrPrefix: 'data-param-', type: 'string'},
  'videoId': {attr: 'data-video-id', type: 'string'},
  // TODO(wg-bento): These props have no internal implementation yet.
  'dock': {attr: 'dock', media: true},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
