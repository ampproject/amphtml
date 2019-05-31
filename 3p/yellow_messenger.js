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
 * Get the correct script for the container.
 * @param {!Window} global
 * @param {string} scriptSource The source of the script, different for post and comment embeds.
 */
function getContainerScript(global, scriptSource) {
  loadScript(global, scriptSource);
}

/**
 *
 * @param {*} global
 * @param {*} data
 */
function getChatBotWidget(global, data) {
  const container = global.document.createElement('div');
  console.log('Inside iframe, data is:', data);
  container.setAttribute('bot-id', data.botid);
  return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yellow_messenger(global, data) {
  const container = getChatBotWidget(global, data);
  global.document.getElementById('c').appendChild(container);
  const scriptSource = 'https://app.yellowmessenger.com/api/ml/prediction?bot=' + encodeURIComponent(data.botid) +'&text=hi&language=en';
  getContainerScript(global, scriptSource);
}
