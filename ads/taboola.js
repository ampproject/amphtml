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

import {writeScript} from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function taboola(global, data) {
    let params = {
        referrer: data.referrer || global.context.referrer,
        url: data.url || global.context.canonicalUrl
    };


    ['article', 'video', 'photo', 'search', 'category', 'homepage'].forEach(function (p) {
        if(data[p]) {
            params[p] = data[p];
        }
    });

    (global._taboola = global._taboola || []).push([{
            pageId:    global.context.pageViewId,
            publisher: data.publisher,
            placement: data.placement,
            mode:      data.mode,
            container: 'c'
        },
        params]);

    global.context.observeIntersection(function(changes) {
        changes.forEach(function(c) {
            console.info('Effie Height of intersection', c.intersectionRect.height);
        });
    });

    writeScript(global, `https://cdn.taboola.com/libtrc/${data.publisher}/loader.js`);
}

