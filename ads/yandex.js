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

    validateData(data, [], [
        'blockId',
        'statId',

        'subType',
        'adfoxParams',
        'ownerId',
    ]);

    if (data.subType === 'adfox') {
        loadAdFox(global, () => initAdFox(global, data));
    } else {
        setAdToQueue(global, data);
        loadContext(global);
    }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function setAdToQueue(global, data) {
    const n = 'yandexContextAsyncCallbacks';
    console.log('>>>', global.context);

    global[n] = [];
    global[n].push(() => {

        // Create container
        createContainer(global, 'yandex_rtb');

        // Ahow Ad in container
        Ya.Context.AdvManager.render({
            blockId: data.blockId,
            statId: data.statId,
            renderTo: 'yandex_rtb',
            async: true,
            onRender: () => {

                // Ad found and rendered
                console.log('onSuccess');
                window.context.renderStart({
                    width: data.width,
                    height: data.height
                });
            }
        }, () => {
            console.log('onError');

            // No Ad found and rendered
            window.context.noContentAvailable();
        });
    });
}

/**
 * @param {!Window} global
 */
function loadContext(global) {
    loadScript(global, 'https://an.yandex.ru/system/context.js');
}

/**
 * @param {!Window} global
 * @param {!Function} cb
 */
function loadAdFox(global, cb) {
    loadScript(global, 'https://yastatic.net/pcode/adfox/loader.js', cb);
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

/**
 * @param {?Window} global
 * @param {Object} data
 */
function initAdFox(global, data) {
    const params = JSON.parse(data.adfoxParams);

    createContainer(global, 'adfox_container');

    global.Ya.adfoxCode.create({
        ownerId: data.ownerId,
        containerId: 'adfox_container',
        params: params,
        onRender: () => window.context.renderStart(),
        onError: () => window.context.noContentAvailable()
    });
}