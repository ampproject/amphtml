/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yandex(global, data) {
    validateData(data, ['blockId'], ['data', 'isAdfox']);

    setAdToQueue(global, data);
    loadContext(global);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function setAdToQueue(global, data) {
    const n = 'yandexContextAsyncCallbacks';

    global[n] = [];
    global[n].push(() => {
        const containerName = 'yandex_rtb';

        // Create container
        createContainer(global, containerName);

        // Ahow Ad in container
        Ya.Context.AdvManager.render({
            blockId: data.blockId,
            statId: data.statId,
            renderTo: containerName,
            data: data.data,
            async: true,
            onRender: () => {
                window.context.renderStart();

                // Move adfox queue
                if (data.isAdfox && window.Ya.adfoxCode.onRender) {
                    window.Ya.adfoxCode.onRender();
                }
            }
        }, () => window.context.noContentAvailable());
    });
}

/**
 * @param {!Window} global
 */
function loadContext(global) {
    loadScript(global, 'https://an.yandex.ru/system/context.js');
}

/**
 * @param {?Window} global
 * @param {string} name
 */
function createContainer(global, name) {
    const d = global.document.createElement('div');
    d.id = name;
    global.document.getElementById('c').appendChild(d);
}