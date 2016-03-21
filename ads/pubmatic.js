/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { writeScript } from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pubmatic(global, data) {

    var loaded = new Promise((resolve, reject) = > {
        var s = document.createElement('script');
        s.src = 'https://ads.pubmatic.com/AdServer/js/amp.js';
        s.onload = resolve;
        s.onerror = reject;
        global.document.body.appendChild(s);
    });

    loaded.then(() = > {
        data.kadpageurl = context.location.href;
        PubMatic.showAd(data);
    }, () => {
        console.log("Failed to load.");
    });

}