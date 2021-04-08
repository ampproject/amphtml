/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {getMultiSizeDimensions} from '../../ads/google/utils';
import {parseJson} from '../../src/json';
import {validateData, writeScript} from '../../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sas(global, data) {
  let url, adHost, whSize;
  const plainFields = ['site', 'area', 'mid'];
  validateData(
    data,
    ['customerName'],
    ['adHost', 'site', 'size', 'area', 'mid', 'tags', 'multiSize']
  );

  if (typeof data.adHost === 'undefined') {
    adHost = encodeURIComponent(data['customerName']) + '-ads.aimatch.com';
  } else {
    adHost = encodeURIComponent(data['adHost']);
  }

  url = '//' + adHost + '/' + data['customerName'] + '/jserver';

  const {multiSize} = data;
  const primaryWidth = parseInt(data.width, 10);
  const primaryHeight = parseInt(data.height, 10);
  let dimensions;
  let multiSizeValid = false;

  if (multiSize) {
    try {
      dimensions = getMultiSizeDimensions(
        multiSize,
        primaryWidth,
        primaryHeight,
        true
      );
      multiSizeValid = true;
      dimensions.unshift([primaryWidth, primaryHeight]);
    } catch (e) {
      // okay to error here
    }
  }

  for (let idx = 0; idx < plainFields.length; idx++) {
    if (data[plainFields[idx]]) {
      if (typeof data[plainFields[idx]] !== 'undefined') {
        url +=
          '/' +
          plainFields[idx] +
          '=' +
          encodeURIComponent(data[plainFields[idx]]);
      }
    }
  }

  //Size and multi-size
  if (typeof data.size !== 'undefined') {
    url += '/SIZE=' + encodeURIComponent(data.size);
    if (typeof multiSize !== 'undefined' && multiSizeValid) {
      url += ',' + encodeURIComponent(multiSize);
    }
  } else if (typeof multiSize !== 'undefined' && multiSizeValid) {
    whSize = primaryWidth + 'x' + primaryHeight;
    url +=
      '/SIZE=' +
      encodeURIComponent(whSize) +
      ',' +
      encodeURIComponent(multiSize);
  }

  // Tags
  if (typeof data.tags !== 'undefined') {
    const tags = parseJson(data.tags);
    for (const tag in tags) {
      url += '/' + tag + '=' + encodeURIComponent(tags[tag]);
    }
  }
  writeScript(global, url, () => {
    global.context.renderStart();
  });
}
