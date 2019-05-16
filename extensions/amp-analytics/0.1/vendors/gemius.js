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

export const GEMIUS_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'dnt': '0',
  },
  'requests': {
    'base':
      'https://${prefix}.hit.gemius.pl/_${timestamp}/redot.gif?l=91&id=${identifier}&screen=${screenWidth}x${screenHeight}&window=${viewportWidth}x${viewportHeight}&fr=1&href=${sourceUrl}&ref=${documentReferrer}&extra=gemamp%3D1%7Campid%3D${clientId(gemius)}%7C${extraparams}&nc=${dnt}',
    'pageview': '${base}&et=view&hsrc=1',
    'event': '${base}&et=action&hsrc=3',
  },
  'triggers': {
    'defaultPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
