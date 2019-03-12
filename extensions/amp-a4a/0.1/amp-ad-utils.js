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
import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {isArray, isObject} from '../../../src/types';
import {isSecureUrlDeprecated} from '../../../src/url';
import {parseJson} from '../../../src/json';

const TAG = 'amp-ad-util';

/**
 * Sends a CORS XHR request to the given URL.
 * @param {!Window} win
 * @param {string} url Request URL to send XHR to.
 * @return {!Promise<!Response>}
 */
export function sendXhrRequest(win, url) {
  return Services.xhrFor(win).fetch(url, {
    mode: 'cors',
    method: 'GET',
    credentials: 'include',
  });
}

/** @type {Array<string>} */
const METADATA_STRINGS = [
  '<script amp-ad-metadata type=application/json>',
  '<script type="application/json" amp-ad-metadata>',
  '<script type=application/json amp-ad-metadata>'];

/**
 *
 * Throws {@code SyntaxError} if the metadata block delimiters are missing
 * or corrupted or if the metadata content doesn't parse as JSON.
 * @param {string} creative from which CSS is extracted
 * @return {?./amp-ad-type-defs.CreativeMetaDataDef} Object result of parsing
 *     JSON data blob inside the metadata markers on the ad text, or null if
 *     no metadata markers are found.
 * TODO(keithwrightbos@): report error cases
 */
export function getAmpAdMetadata(creative) {
  let metadataStart = -1;
  let metadataString;
  for (let i = 0; i < METADATA_STRINGS.length; i++) {
    metadataString = METADATA_STRINGS[i];
    metadataStart = creative.lastIndexOf(metadataString);
    if (metadataStart >= 0) {
      break;
    }
  }
  if (metadataStart < 0) {
    // Couldn't find a metadata blob.
    dev().warn(
        TAG, `Could not locate start index for amp meta data in: ${creative}`);
    return null;
  }
  const metadataEnd = creative.lastIndexOf('</script>');
  if (metadataEnd < 0) {
    // Couldn't find a metadata blob.
    dev().warn(TAG,
        'Could not locate closing script tag for amp meta data in: %s',
        creative);
    return null;
  }
  try {
    const metaDataObj = parseJson(
        creative.slice(metadataStart + metadataString.length, metadataEnd));
    let ampRuntimeUtf16CharOffsets =
      metaDataObj['ampRuntimeUtf16CharOffsets'];
    if (!isArray(ampRuntimeUtf16CharOffsets) ||
        ampRuntimeUtf16CharOffsets.length != 2 ||
        typeof ampRuntimeUtf16CharOffsets[0] !== 'number' ||
        typeof ampRuntimeUtf16CharOffsets[1] !== 'number') {
      const headStart = creative.indexOf('<head>');
      const headEnd = creative.indexOf('</head>');
      const headSubstring = creative.slice(
          headStart, headEnd + '</head>'.length);
      ampRuntimeUtf16CharOffsets = [
          headStart + headSubstring.indexOf('<script'),
          headStart + headSubstring.lastIndexOf('</script>') +
              '</script>'.length
      ];
    }
    const metaData = {};
    if (metaDataObj['customElementExtensions']) {
      metaData.customElementExtensions =
        metaDataObj['customElementExtensions'];
      if (!isArray(metaData.customElementExtensions)) {
        throw new Error(
            'Invalid extensions', metaData.customElementExtensions);
      }
    } else {
      metaData.customElementExtensions = [];
    }
    if (metaDataObj['customStylesheets']) {
      // Expect array of objects with at least one key being 'href' whose
      // value is URL.
      metaData.customStylesheets = metaDataObj['customStylesheets'];
      const errorMsg = 'Invalid custom stylesheets';
      if (!isArray(metaData.customStylesheets)) {
        throw new Error(errorMsg);
      }
      metaData.customStylesheets.forEach(stylesheet => {
        if (!isObject(stylesheet) || !stylesheet['href'] ||
            typeof stylesheet['href'] !== 'string' ||
            !isSecureUrlDeprecated(stylesheet['href'])) {
          throw new Error(errorMsg);
        }
      });
    }
    if (isArray(metaDataObj['images'])) {
      // Load maximum of 5 images.
      metaData.images = metaDataObj['images'].splice(0, 5);
    }
    // TODO(keithwrightbos): OK to assume ampRuntimeUtf16CharOffsets is before
    // metadata as its in the head?
    metaData.minifiedCreative =
      creative.slice(0, ampRuntimeUtf16CharOffsets[0]) +
      creative.slice(ampRuntimeUtf16CharOffsets[1], metadataStart) +
      creative.slice(metadataEnd + '</script>'.length);
    return metaData;
  } catch (err) {
    dev().warn(
        TAG, 'Invalid amp metadata: %s',
        creative.slice(metadataStart + metadataString.length, metadataEnd));
    return null;
  }
}
