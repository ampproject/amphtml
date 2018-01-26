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

/**
 * @param {!Window} global
 * @param {!Object} data
 */

export function medyanet(global, data) {
    global.adunit = data.slot;
    global.size = "[" + data.width + "," + data.height + "]";

    if (global.adunit && global.size) {
        medyanetAds(global, data);
    }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function medyanetAds(global, data) {
    var f = document.createElement('iframe');
    f.id = "adframe";
    f.width = data.width;
    f.height = data.height;
    f.marginheight = "0";
    f.marginwidth = "0";
    f.style = "border:0 none transparent; position: relative;";
    f.frameborder = "0";
    f.allowfullscreen = "true";
    f.scrolling = "no";
    f.onload = function () {
        window.context.renderStart();
    };
    f.src = 'https://medyanet.doracdn.com/devteam/AMP/Test17.html?bidderData=fanatik.com.tr&adunit=' + global.adunit + '&' + 'size=' + global.size;
    document.body.appendChild(f);
}



