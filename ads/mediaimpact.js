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

import {loadScript,writeScript} from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */

export function mediaimpact(global, data) {
    global.fif = false;
    writeScript(global, "https://ec-ns.sascdn.com/diff/251/divscripte/amp.js?dom=" + window.context.location.host, () => {
        asmi.sas.call(data.site + '/(' + data.page + ')', data.format, data.target, '', 'sas_' + data.slot.replace('sas_',''), 1);
        document.getElementsByTagName('body')[0].style.margin = "0px";
    });
}