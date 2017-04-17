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
import {yandex} from './yandex';
import {createElementWithAttributes} from '../src/dom';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adfox(global, data) {

    validateData(data, [
        'adfoxParams',
        'ownerId',
    ]);

    loadAdFox(global, () => initAdFox(global, data));
}

/**
 * @param {!Window} global
 * @param {!Function} cb
 */
function loadAdFox(global, cb) {
    loadScript(global, 'https://yastatic.net/pcode/adfox/loader.js', cb);
}

/**
 * @param {!Window} global
 * @param {string} name
 */
function createContainer(global, name) {
    const d = createElementWithAttributes(global.document, 'div', {
        id: name
    });
    global.document.getElementById('c').appendChild(d);
}

/**
 * @param {!Window} global
 * @param {Object} data
 */
function initAdFox(global, data) {
    const container_name = 'adfox_container';
    const params = JSON.parse(data.adfoxParams);

    createContainer(global, container_name);

    global.Ya.adfoxCode.create({
        ownerId: data.ownerId,
        containerId: container_name,
        params: params,
        onLoad: (data) => checkLoading(global, data),
        onRender: () => window.context.renderStart(),
        onError: () => window.context.noContentAvailable(),
        onStub: () => window.context.noContentAvailable()
    });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function checkLoading(global, data) {
    if (data.bundleName === 'banner.direct') {
        const dblParams = {
            blockId: data.bundleParams.blockId,
            data: data.bundleParams.data,
            isAdfox: true
        };

        yandex(global, dblParams);
        return false;
    }
}
