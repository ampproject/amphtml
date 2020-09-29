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

import {PreactBaseElement} from '../../../src/preact/base-element';
import {Youtube} from './youtube';

/** @const {string} */
const TAG = 'amp-fit-text';

class AmpYoutube extends PreactBaseElement {}

/** @override */
AmpYoutube['Component'] = Youtube;

/** @override */
AmpYoutube['props'] = {
  'autoplay': {attr: 'autoplay'},
  'loop': {attr: 'loop'},
  'videoid': {attr: 'data-videoid'},
  'liveChannelid': {attr: 'data-liveChannelid'},
  'dock': {attr: 'dock'},
  'style': {attr: 'style'},
};

/** @override */
AmpYoutube['passthrough'] = true;

/** @override */
AmpYoutube['layoutSizeDefined'] = true;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpYoutube);
});
