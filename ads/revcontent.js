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

import {writeScript, checkData} from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function revcontent(global, data) {
    checkData(data, ['id', 'width', 'height', 'endpoint', 'ssl', 'wrapper']);
    (function(window, document, data, undefined) {

        const serve_protocol = data.ssl === 'true' ? 'https://' : 'http://';
        const serve_host = data.endpoint;
        const serve_script = '/serve.js.php';
        var rcjsload = document.createElement("div");
        rcjsload.id = data.wrapper !== undefined ? data.wrapper : "rcjsload_2ff711";
        document.body.appendChild(rcjsload);
        var rcel = document.createElement("script");
        rcel.id = 'rc_' + Math.floor(Math.random() * 1000);
        rcel.type = 'text/javascript';
        var serve_parms = "?uitm=1&w=" + data.id + "&t=" + rcel.id + "&c=" + (new Date()).getTime() + "&width=" + (window.outerWidth || document.documentElement.clientWidth);
        var serve_url = serve_protocol + serve_host + serve_script + serve_parms;
        rcel.src = serve_url;
        rcel.async = true;
        var rcds = document.getElementById(rcjsload.id); rcds.appendChild(rcel);

        /**
         *
         * @type {*|!Function}
         * @todo Implement Resize Handlers...
         */
        var unlisten = window.context.onResizeSuccess(function(requestedHeight) {


        });


    })(global, global.document, data);
}
