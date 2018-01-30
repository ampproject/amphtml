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
  // loadScript(global, 'https://widget.beopinion.com/sdk.js', function() {
  loadScript(global, 'http://localhost:8081/sdk-4.0.0.js', function() {
    cb(global.beopinion);
  });
}

/**
 * @param {!Window} global
 * @description Make canonicalUrl available from iframe
 */
function addCanonicalLinkTag(global) {
  const canonicalUrl = global.context.canonicalUrl;
  if (canonicalUrl) {
    const link = global.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonicalUrl);
    global.document.head.appendChild(link);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function createContainer(global, data) {
  // create div
  const container = global.document.createElement('container');
  container.className = "BeOpinionWidget";

  // get content id
  if (data['content'] !== null) {
    container.setAttribute('data-content', data['content']);
  }

  // get my-content value, forcing it to "1" if it is not an amp-ad
  if (global.context.tagName === 'AMP-BEOPINION') {
    container.setAttribute('data-my-content', "1");
  } else if (data['my-content'] !== null) {
    container.setAttribute('data-my-content', data['my-content']);
  }

  // get slot name
  if (data['name'] !== null) {
    container.setAttribute('data-name', data['name']);
  }

  setStyles(container, {
    width: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function beopinion(global, data) {
  const container = createContainer(global, data);
  global.document.getElementById('c').appendChild(container);

  getBeOpinion(global, function(beopinion) {
    global.BeOpinionSDK.init({
      account: data.account
    });
    global.BeOpinionSDK.watch();
    // global.BeOpinionSDK.setAMPContext(global.context); ?
    // global.context.noContentAvailable(); to be called when no content
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
