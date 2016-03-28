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
export function colombia(global, data) {
	checkData(data, ["clmb_slot", "clmb_position", "clmb_section","clmb_divid",'loadingStrategy']);
	global.clmb_slot = data.clmb_slot;
	global.clmb_position = data.clmb_position;
	global.clmb_section = data.clmb_section;
	global.clmb_divid = data.clmb_divid;
	writeScript(global, "https://static.clmbtech.com/ad/commons/js/colombia-amp.js");
}
