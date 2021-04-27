/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const WIDGET_DEFAULT_NODE_ID = 'rcm-widget';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rcmwidget(global, data) {
  validateData(
    data,
    ['rcmId', 'nodeId', 'blockId', 'templateName', 'projectId'],
    ['contextItemId']
  );

  global.rcmWidgetInit = data;

  createContainer(global, data.nodeId);

  // load the rcmwidget initializer asynchronously
  loadScript(global, 'https://rcmjs.rambler.ru/static/rcmw/rcmw-amp.js');
}

/**
 * @param {!Window} global
 * @param {string} nodeId
 */
function createContainer(global, nodeId = WIDGET_DEFAULT_NODE_ID) {
  const container = global.document.createElement('div');
  container.id = nodeId;

  global.document.getElementById('c').appendChild(container);
}
