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

import {hasOwn} from '../src/utils/object';
import {loadScript} from './3p';
import {setStyle} from '../src/style';

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
 * Whitelisted card options.
 *
 * - Key is in camel case as received in "data".
 * - The value is in the format expected by embedly.
 *
 * @see {@link http://docs.embed.ly/docs/cards#customize}
 * @const @enum {string}
 */
export const CardOptions = {
  cardVia: 'card-via',
  cardTheme: 'card-theme',
  cardImage: 'card-image',
  cardControls: 'card-controls',
  cardAlign: 'card-align',
  cardRecommend: 'card-recommend',
  cardEmbed: 'card-embed',
  cardKey: 'card-key',
};

/**
 * Loads embedly card SDK that is consumed by this 3p integration.
 *
 * @param {!Window} global
 * @param {function()} callback
 * @visibleForTesting
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

  // Add whitelisted data attributes and values to card
  // when these are provided by component.
  for (const key in CardOptions) {
    if (hasOwn(CardOptions, key) && typeof data[key] !== 'undefined') {
      card.setAttribute(`data-${CardOptions[key]}`, data[key]);
    }
  }

  const container = global.document.getElementById('c');

  // Adds support to embedly dark theme not set by the sdk
  if (data['cardTheme'] === 'dark') {
    setStyle(container, 'background', 'rgba(51, 51, 51)');
  }

  container.appendChild(card);

  getEmbedly(global, function() {
    // Given by the parent frame.
    delete data.width;
    delete data.height;

    global.window['embedly']('card', card);

    // Use embedly SDK to listen to resize event from loaded card
    global.window['embedly']('on', RESIZE_EVENT_NAME, function(iframe) {
      context.requestResize(
        iframe./*OK*/ width,
        parseInt(iframe./*OK*/ height, 10) + /* margin */ 5
      );
    });
  });
}
