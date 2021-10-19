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

import {VideoBaseElement} from '../../amp-video/1.0/video-base-element';
import {Vimeo} from './component';

export class BaseElement extends VideoBaseElement {}

/** @override */
BaseElement['Component'] = Vimeo;

/** @override */
BaseElement['props'] = {
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'controls': {attr: 'controls', type: 'boolean'},
  'videoid': {attr: 'data-videoid'},
  'doNotTrack': {attr: 'do-not-track'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
