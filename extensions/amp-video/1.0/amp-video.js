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

import {CSS} from '../../../build/amp-video-1.0.css';
import {VideoBaseElement} from './base-element';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-video';

class AmpVideo extends VideoBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-video'),
      'expected global "bento" or specific "bento-video" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/** @override */
AmpVideo['props'] = {
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
  'src': {attr: 'src'},
  'title': {attr: 'title'},

  // TODO(alanorozco): These props have no internal implementation yet.
  'dock': {attr: 'dock'},
  'rotate-to-fullscreen': {attr: 'rotate-to-fullscreen', type: 'boolean'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVideo, CSS);
});
