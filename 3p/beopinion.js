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

// TODO(malteubl) Move somewhere else since this is not an ad.

import {loadScript} from './3p';
import {setStyles} from '../src/style';
import {parseUrl} from '../src/url';

/**
 * Produces the Twitter API object for the passed in callback. If the current
 * frame is the master frame it makes a new one by injecting the respective
 * script, otherwise it schedules the callback for the script from the master
 * window.
 * @param {!Window} global
 * @param {function(!Object)} cb
 */
function getBeOpinion(global, cb) {
  loadScript(global, 'https://widget.beopinion.com/sdk.js', function() {
  // loadScript(global, 'http://localhost:8081/dist/widget/fr/sdk-4.0.0.js', function() {
    cb(global.beopinion);
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function beopinion(global, data) {
  const canonicalUrl = global.context.canonicalUrl;
  if (canonicalUrl) {
    const link = global.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonicalUrl);
    global.document.head.appendChild(link);
  }

  const div = global.document.createElement('div');
  div.className = "BeOpinionWidget";
  // if (data['content'] !== null) {
    div.setAttribute('data-content', null);//data['content']);
  // }
  if (data['my-content'] !== null) {
    div.setAttribute('data-my-content', data['my-content']);
  }
  if (data['name'] !== null) {
    div.setAttribute('data-name', data['name']);
  }
  setStyles(div, {
    width: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  global.document.getElementById('c').appendChild(div);
  getBeOpinion(global, function(beopinion) {
    global.BeOpinionSDK.init({
      account: data.account
    });
    global.BeOpinionSDK.watch();
    //     global.context.noContentAvailable();
  });

  function resize(container) {
    const height = container./*OK*/offsetHeight;
    // 0 height is always wrong and we should get another resize request
    // later.
    if (height == 0) {
      return;
    }
    context.updateDimensions(
        container./*OK*/offsetWidth,
        height + /* margins */ 20);
  }
}
