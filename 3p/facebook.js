/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript} from './3p';
import {user} from '../src/log';


/**
 * Produces the Facebook SDK object for the passed in callback.
 *
 * Note: Facebook SDK fails to render multiple posts when the SDK is only loaded
 * in one frame. To Allow the SDK to render them correctly we load the script
 * per iframe.
 *
 * @param {!Window} global
 * @param {function(!Object)} cb
 */
function getFacebookSdk(global, cb) {
  loadScript(global, 'https://connect.facebook.net/en_US/sdk.js', () => {
    cb(global.FB);
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function facebook(global, data) {
  const embedAs = data.embedAs || 'post';
  user().assert(['post', 'video'].indexOf(embedAs) !== -1,
      'Attribute data-embed-as  for <amp-facebook> value is wrong, should be' +
      ' "post" or "video" was: %s', embedAs);
  const fbPost = global.document.createElement('div');
  fbPost.className = 'fb-' + embedAs;
  fbPost.setAttribute('data-href', data.href);
  global.document.getElementById('c').appendChild(fbPost);
  getFacebookSdk(global, FB => {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;

    // Only need to listen to post resizing as FB videos have a fixed ratio
    // and can automatically resize correctly given the initial width/height.
    if (embedAs === 'post') {
      FB.Event.subscribe('xfbml.resize', event => {
        context.updateDimensions(
            parseInt(event.width, 10),
            parseInt(event.height, 10) + /* margins */ 20);
      });
    }
    FB.init({xfbml: true, version: 'v2.5'});
  });

}
