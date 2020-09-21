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
import {dict} from '../../../src/utils/object';
import {isLayoutSizeDefined} from '../../../src/layout';
import {useStyles as useAutoplayStyles} from './autoplay.jss';

/** @extends {PreactBaseElement<VideoWrapperDef.Api>} */
export class VideoBaseElement extends PreactBaseElement {
  /** @override */
  init() {
    this.registerApiAction_('play', (api) => api.play());
    this.registerApiAction_('pause', (api) => api.pause());
    this.registerApiAction_('mute', (api) => api.mute());
    this.registerApiAction_('unmute', (api) => api.unmute());

    // Ugly that this action has three names, but:
    // - requestFullscreen for consistency with Element.requestFullscreen
    // - fullscreenenter / fullscreen are for backwards compatibility
    const requestFullscreen = (api) => api.requestFullscreen();
    this.registerApiAction_('requestFullscreen', requestFullscreen);
    this.registerApiAction_('fullscreenenter', requestFullscreen);
    this.registerApiAction_('fullscreen', requestFullscreen);

    return dict({'component': this.constructor['PlayerComponent']});
  }

  /**
   * @param {string} alias
   * @param {function(!API_TYPE, !../service/action-impl.ActionInvocation)} handler
   * @param {../action-constants.ActionTrust=} minTrust
   * @private
   */
  registerApiAction_(alias, handler, minTrust = ActionTrust.HIGH) {
    this.registerApiAction(
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

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

/** @override */
VideoBaseElement['Component'] = VideoWrapper;

/** @override */
VideoBaseElement['layoutSizeDefined'] = true;

/**
 * `component` prop on VideoWrapper (defaults to 'video').
 * @protected {string|PreactDef.FunctionalComponent|undefined}
 */
VideoBaseElement['PlayerComponent'] = undefined;

/** @override */
VideoBaseElement['props'] = {
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
VideoBaseElement['children'] = {
  'sources': {
    name: 'sources',
    selector: 'source',
    single: false,
    clone: true,
  },
};

/** @override */
// eslint-disable-next-line
VideoBaseElement['shadowCss'] = useAutoplayStyles().CSS;
