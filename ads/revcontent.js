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
    checkData(data, ['id']);
    const serve_protocol = 'https://';
    const serve_host = 'trends-stg.revcontent.com/serve.js.php';
    const serve_parms = '?w=' + data.id;
    const serve_url = serve_protocol + serve_host + serve_parms;
    //validateSrcPrefix('https:', serve_url);
    //validateSrcContains('/serve.js.php/', serve_url);
    writeScript(global, serve_url);
}
