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
import {COOKIELESS_API_SERVER} from '../constants';
import {Services} from '../../../../src/services';
import {addParamsToUrl} from '../../../../src/url';
import {createElementWithAttributes} from '../../../../src/dom';
import {dict} from '../../../../src/utils/object';
import {getData} from '../../../../src/event-helper';
import {isObject} from '../../../../src/types';
import {parseJson} from '../../../../src/json';

import {parseUrl} from '../../../../src/url';
import {setStyles} from '../../../../src/style';

const RE_IFRAME = /#iframe$/;
const pixelatorFrameTitle = 'Pxltr Frame';

/**
 * Returns a sorted array of objects like [{delay: 1000, pixels: [...]}]
 * @param  {Array<{
 *   delay: number,
 *   id: string,
 *   url: string
 * }>} pixelList
 * @return {Array}
 */
const groupPixelsByTime = pixelList => {
  // Clean delay value; if it's empty/doesn't exist, default to [0]
  const cleanedPixels = pixelList.map(pixel => {
    const {delay} = pixel;
    return Object.assign({}, pixel, {
      delay: Array.isArray(delay) && delay.length ? delay : [0],
    });
  });

  const delayMap = cleanedPixels
      .map(pixel => {
        const delays = pixel.delay;
        return delays.map(delay => ({
          delay,
          pixels: [pixel],
        }));
      })
      .reduce((a, b) => a.concat(b), []) // flatten
      .reduce((currentDelayMap, {delay, pixels}) => {
        if (!currentDelayMap[delay]) {
          currentDelayMap[delay] = [];
        }
        currentDelayMap[delay] = currentDelayMap[delay].concat(pixels);
        return currentDelayMap;
      }, {});

  return Object.keys(delayMap).map(delay => ({
    delay: Number(delay),
    pixels: delayMap[delay],
  }));
};

export const pixelDrop = (url, ampDoc) => {
  const doc = ampDoc.win.document;
  const ampPixel = createElementWithAttributes(
      doc,
      'amp-pixel',
      dict({
        'layout': 'nodisplay',
        'referrerpolicy': 'no-referrer',
        'src': url,
      })
  );
  doc.body.appendChild(ampPixel);
};

const getIframeName = url => parseUrl(url).host
    .split('.')
    .concat(pixelatorFrameTitle.toLowerCase().replace(/\s/, '_'));

const iframeDrop = (url, ampDoc, {name, title}) => {
  const doc = ampDoc.win.document;
  const iframe = createElementWithAttributes(
      doc,
      'iframe',
      dict({
        'frameborder': 0,
        'width': 0,
        'height': 0,
        'name': name,
        'title': title,
        'src': url,
      })
  );
  setStyles(iframe, {
    display: 'none',
    position: 'absolute',
    clip: 'rect(0px 0px 0px 0px)',
  });
  doc.body.appendChild(iframe);
};

const dropPixelatorPixel = (url, ampDoc) => {
  const requiresIframe = RE_IFRAME.test(url);

  // if it's not an absolute URL, don't pixelate
  if (url.indexOf('//') === -1) {
    return;
  }

  if (requiresIframe) {
    const name = getIframeName(url);
    return iframeDrop(url, ampDoc, {name, title: pixelatorFrameTitle});
  }

  return pixelDrop(url, ampDoc);
};

/**
 * Requests groups of pixels at specified delays
 * @param  {Array<{
 * delay: number,
 * id: string,
 * url: string
 * }>} pixels
 * @param  {{
 * sid: string,
 * ampDoc: *
 * }} options
 */
const dropPixelGroups = (pixels, {sid, ampDoc}) => {
  const pixelGroups = groupPixelsByTime(pixels);
  pixelGroups.forEach(({delay, pixels}) => {
    setTimeout(() => {
      const pids = pixels.map(pixel => {
        dropPixelatorPixel(pixel.url, ampDoc);
        return pixel.id;
      });
      const data = dict({
        'delay': `${delay}`,
        'ids': pids.join('-'),
        'sid': sid,
      });
      const url = addParamsToUrl(`${COOKIELESS_API_SERVER}/live/prender`, data);

      if (ampDoc.win.navigator.sendBeacon) {
        ampDoc.win.navigator.sendBeacon(url, '{}');
      } else {
        pixelDrop(url, ampDoc);
      }
    }, delay * 1000);
  });
};

/**
 * Requests groups of pixels at specified delays
 * @param  {(?JsonObject|string|undefined|null)} object
 * @return {!JsonObject}
 */
function getJsonObject_(object) {
  const params = dict();

  if (object === undefined || object === null) {
    return params;
  }
  const stringifiedObject = typeof object === 'string' ?
    object : JSON.stringify(object);

  try {
    const parsedObject = parseJson(stringifiedObject);
    if (isObject(parsedObject)) {
      for (const key in parsedObject) {
        params[key] = parsedObject[key];
      }
    }
  } catch (error) {
  }
  return params;
}

export const callPixelEndpoint = event => {
  const {ampDoc, endpoint} = event;
  const eventData = getJsonObject_(getData(event));
  const url = addParamsToUrl(endpoint, eventData);

  Services.xhrFor(ampDoc.win).fetchJson(url, {
    mode: 'cors',
    method: 'GET',
    // This should be cacheable across publisher domains, so don't append
    // __amp_source_origin to the URL.
    ampCors: false,
    credentials: 'include',
  }).then(res => res.json()).then(json => {
    const {pixels = []} = json;
    if (pixels.length > 0) {
      dropPixelGroups(pixels, {
        sid: eventData['sid'],
        ampDoc,
      });
    }
  });
};
