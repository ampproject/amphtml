/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData} from '../../3p/3p';

/**
 * @param {!Window} global
 * @description Make canonicalUrl available from iframe
 */
function addCanonicalLinkTag(global) {
  if (global.context.canonicalUrl) {
    const link = global.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', global.context.canonicalUrl);
    global.document.head.appendChild(link);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 * @return {?Node}
 */
function createContainer(global, data) {
  // create div
  const div = global.document.createElement('div');
  if (data.poll) {
    div.className = 'opinary-widget-embed';
    div.dataset.customer = data.client;
    div.dataset.poll = data.poll;
  } else {
    div.setAttribute('id', 'opinary-automation-placeholder');
  }

  return div;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function opinary(global, data) {
  validateData(data, ['client']);

  addCanonicalLinkTag(global);

  // c element is created by AMP
  const c = global.document.getElementById('c');

  // create div to detect if we are in AMP context
  const isAmp = global.document.createElement('div');
  isAmp.setAttribute('id', 'opinaryAMP');
  c.appendChild(isAmp);

  // create div where poll should be shown
  c.appendChild(createContainer(global, data));

  // load script
  if (data.poll) {
    loadScript(global, `https://widgets.opinary.com/embed.js`);
  } else {
    loadScript(global, `https://widgets.opinary.com/a/${data.client}.js`);
  }
}
