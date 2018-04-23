/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/**
 * Embedly platform library url to create cards.
 * @const {string}
 */
const EMBEDLY_SDK_URL = 'https://cdn.embedly.com/widgets/platform.js';

/**
 * Event name emitted by embedly's SDK.
 * @type {string}
 */
const RESIZE_EVENT_NAME = 'card.resize';

/**
 * Css class expected by embedly library to style card.
 * @const {string}
 */
const CARD_CSS_CLASS = 'embedly-card';

/**
 * Loads embedly card SDK that is consumed by this 3p integration.
 *
 * @param {!Window} global
 * @param {function(!Object)} callback
 */
function getEmbedly(global, callback) {
  loadScript(global, EMBEDLY_SDK_URL, function() {
    callback();
  });
}

/**
 * Creates embedly card using sdk.
 *
 * @param {!Window} global
 * @param {!Object} data
 */
export function embedly(global, data) {
  const card = global.document.createElement('a');

  card.href = data.url;
  card.classList.add(CARD_CSS_CLASS);

  global.document.getElementById('c').appendChild(card);

  getEmbedly(global, function() {
    // Given by the parent frame.
    delete data.width;
    delete data.height;

    // Use embedly SDK to listen to resize event from loaded card
    global.window.embedly('on', RESIZE_EVENT_NAME, function(iframe) {
      context.requestResize(
          iframe./*OK*/offsetWidth,
          iframe./*OK*/offsetHeight
      );
    });
  });
}
