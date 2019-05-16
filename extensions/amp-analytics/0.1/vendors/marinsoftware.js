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

export const MARINSOFTWARE_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'base': 'https://tracker.marinsm.com/tp',
    'baseParams':
      'cid=${trackerId}' +
      '&ampVersion=${ampVersion}' +
      '&ds=AMP' +
      '&ref=${externalReferrer}' +
      '&page=${sourceUrl}' +
      '&uuid=${clientId(marin_amp_id)}' +
      '&rnd=${random}',
    'pageView': '${base}?' + '${baseParams}' + '&act=1',
    'conversion':
      '${base}?' +
      '${baseParams}' +
      '&act=2' +
      '&trans=UTM:I' +
      '|${orderId}' +
      '|${marinConversionType}' +
      '|${productName}' +
      '|${category}' +
      '|${price}' +
      '|${quantity}',
  },
  'transport': {
    'beacon': true,
    'xhrpost': false,
    'image': true,
  },
});
