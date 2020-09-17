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

import {ActionTrust} from '../../../src/action-constants';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {VideoWrapper} from './video-wrapper';
import {isLayoutSizeDefined} from '../../../src/layout';

/** @const {string} */
const TAG = 'amp-video';

/**
 * @param {PreactBaseElement<VideoDef.VideoApi>} impl
 * @param {string} alias
 * @param {function(!API_TYPE, !../service/action-impl.ActionInvocation)} handler
 * @param {../action-constants.ActionTrust=} minTrust
 */
export function registerVideoAction(
  impl,
  alias,
  handler,
  minTrust = ActionTrust.HIGH
) {
  impl.registerApiAction(
    alias,
    (api, invocation) => {
      if (invocation.trust >= ActionTrust.HIGH) {
        api.userInteracted();
      }
      handler(api, invocation);
    },
    minTrust
  );
}

/**
 * @param {PreactBaseElement<VideoDef.VideoApi>} impl
 */
export function registerVideoActions(impl) {
  registerVideoAction(impl, 'play', (api) => api.play());
  registerVideoAction(impl, 'pause', (api) => api.pause());
  registerVideoAction(impl, 'mute', (api) => api.mute());
  registerVideoAction(impl, 'unmute', (api) => api.unmute());

  // Ugly that this action has three names, but:
  // - requestFullscreen for consistency with Element.requestFullscreen
  // - fullscreenenter / fullscreen are for backwards compatibility
  const requestFullscreen = (api) => api.requestFullscreen();
  registerVideoAction(impl, 'requestFullscreen', requestFullscreen);
  registerVideoAction(impl, 'fullscreenenter', requestFullscreen);
  registerVideoAction(impl, 'fullscreen', requestFullscreen);
}

/** @extends {PreactBaseElement<VideoDef.VideoApi>} */
class AmpVideo extends PreactBaseElement {
  /** @override */
  init() {
    registerVideoActions(this);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

/** @override */
AmpVideo['Component'] = VideoWrapper;

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

/** @override */
AmpVideo['layoutSizeDefined'] = true;

/** @override */
AmpVideo['children'] = {
  'sources': {
    name: 'children',
    selector: 'source',
    single: false,
    clone: true,
  },
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVideo);
});
