/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {validateData, writeScript} from '../3p/3p';
/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function firstimpression(global, data) {
  validateData(data, ['zoneId', 'websiteId']);

  const getURLHashParameter_ = function (name) {
    const result = decodeURI(
      (RegExp('[#|&]' + name + '=(.+?)(&|$)').exec(
        window.context.sourceUrl
      ) || [, null])[1]
    );
    return result === 'null' ? null : result;
  };

  const cdnHost =
    'https://' +
    (getURLHashParameter_('fi_ecdnhost') || 'ecdn.firstimpression.io');

  const cdnpath = getURLHashParameter_('fi_ecdnpath') || '/static/js/fiamp.js';

  global.params = data;

  writeScript(global, cdnHost + cdnpath);
}
