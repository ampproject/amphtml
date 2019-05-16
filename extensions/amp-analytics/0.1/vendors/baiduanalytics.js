/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

export const BAIDUANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'host': 'https://hm.baidu.com',
    'base': '${host}/hm.gif?si=${token}&nv=0&st=4&v=pixel-1.0&rnd=${timestamp}',
    'pageview': '${base}&et=0',
    'event': '${base}&ep=${category}*${action}*${label}*${value}&et=4&api=8_0',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
