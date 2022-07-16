import {validateData, writeScript} from '#3p/3p';

import {getMultiSizeDimensions} from '#ads/google/utils';

import {parseJson} from '#core/types/object/json';

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
