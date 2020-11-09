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
import {BUBBLE_MESSAGE_EVENTS} from '../0.1/amp-video-iframe';
import {VideoBaseElement} from '../../amp-video/1.0/base-element';
import {VideoIframe} from '../../amp-video/1.0/video-iframe';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';

/** @const {string} */
const TAG = 'amp-video-iframe';

class AmpVideoIframe extends VideoBaseElement {}

/**
 * @param {!MessageEvent} e
 */
const onMessage = (e) => {
  const method = e.data?.method;
  if (method) {
    if (method == 'getIntersection') {
      // TODO
      return;
    }
    throw new Error(`Unknown method ${method}`);
  }
  const event = e.data?.event;
  if (!event) {
    return;
  }
  if (event === 'analytics') {
    // TODO
    return;
  }
  if (event === 'error') {
    // TODO
    return;
  }
  if (BUBBLE_MESSAGE_EVENTS.indexOf(event) > -1) {
    e.currentTarget.dispatchEvent(
      createCustomEvent(window, event, /* detail */ null, {
        bubbles: true,
        cancelable: true,
      })
    );
    return;
  }
};

/**
 * @param {string} method
 * @return {method}
 */
const makeMethodMessage = (method) =>
  JSON.stringify({
    'event': 'method',
    'method': method.toLowerCase(),
  });

AmpVideoIframe['staticProps'] = dict({
  'component': VideoIframe,
  'onMessage': onMessage,
  'makeMethodMessage': makeMethodMessage,
});

/** @override */
AmpVideoIframe['props'] = {
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'referrerpolicy': {attr: 'referrerpolicy'},
  'implements-media-session': {attr: 'mediasession', type: 'boolean'},
  'poster': {attr: 'poster'},
  'src': {attr: 'src'},

  // TODO(alanorozco): These props have no internal implementation yet.
  'dock': {attr: 'dock'},
  'rotate-to-fullscreen': {attr: 'rotate-to-fullscreen', type: 'boolean'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVideoIframe);
});
