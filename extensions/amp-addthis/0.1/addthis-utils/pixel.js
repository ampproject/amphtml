import {createElementWithAttributes} from '#core/dom';
import {setStyles, toggle} from '#core/dom/style';
import {isObject} from '#core/types';
import {parseJson} from '#core/types/object/json';

import {Services} from '#service';

import {getData} from '#utils/event-helper';

import {addParamsToUrl, parseUrlDeprecated} from '../../../../src/url';
import {COOKIELESS_API_SERVER} from '../constants';

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
const groupPixelsByTime = (pixelList) => {
  // Clean delay value; if it's empty/doesn't exist, default to [0]
  const cleanedPixels = pixelList.map((pixel) => {
    const {delay} = pixel;
    return {
      ...pixel,
      delay: Array.isArray(delay) && delay.length ? delay : [0],
    };
  });

  const delayMap = cleanedPixels
    .map((pixel) => {
      const delays = pixel.delay;
      return delays.map((delay) => ({
        delay,
        pixels: [pixel],
      }));
    })
    .reduce((a, b) => a.concat(b), []) // flatten
    .reduce((currentDelayMap, curDelay) => {
      const {delay, pixels} = curDelay;
      if (!currentDelayMap[delay]) {
        currentDelayMap[delay] = [];
      }
      currentDelayMap[delay] = currentDelayMap[delay].concat(pixels);
      return currentDelayMap;
    }, {});

  return Object.keys(delayMap).map((delay) => ({
    delay: Number(delay),
    pixels: delayMap[delay],
  }));
};

export const pixelDrop = (url, ampDoc) => {
  const doc = ampDoc.win.document;
  const ampPixel = createElementWithAttributes(doc, 'amp-pixel', {
    'layout': 'nodisplay',
    'referrerpolicy': 'no-referrer',
    'src': url,
  });
  doc.body.appendChild(ampPixel);
};

const getIframeName = (url) =>
  parseUrlDeprecated(url)
    .host.split('.')
    .concat(pixelatorFrameTitle.toLowerCase().replace(/\s/, '_'));

const iframeDrop = (url, ampDoc, data) => {
  const {name, title} = data;
  const doc = ampDoc.win.document;
  const iframe = createElementWithAttributes(doc, 'iframe', {
    'frameborder': 0,
    'width': 0,
    'height': 0,
    'name': name,
    'title': title,
    'src': url,
  });
  toggle(iframe, false);
  setStyles(iframe, {
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
 * @param  {Array<{delay: number, id: string,url: string}>} pixels
 * @param  {{sid: string, ampDoc: *}} options
 */
const dropPixelGroups = (pixels, options) => {
  const {ampDoc, sid} = options;
  const pixelGroups = groupPixelsByTime(pixels);
  pixelGroups.forEach((pixelGroup) => {
    const {delay, pixels} = pixelGroup;
    setTimeout(() => {
      const pids = pixels.map((pixel) => {
        dropPixelatorPixel(pixel.url, ampDoc);
        return pixel.id;
      });
      const data = {
        'delay': `${delay}`,
        'ids': pids.join('-'),
        'sid': sid,
      };
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
  const params = {};

  if (object === undefined || object === null) {
    return params;
  }
  const stringifiedObject =
    typeof object === 'string' ? object : JSON.stringify(object);

  try {
    const parsedObject = parseJson(stringifiedObject);
    if (isObject(parsedObject)) {
      for (const key in parsedObject) {
        params[key] = parsedObject[key];
      }
    }
  } catch (error) {}
  return params;
}

export const callPixelEndpoint = (event) => {
  const {ampDoc, endpoint} = event;
  const eventData = getJsonObject_(getData(event));
  const url = addParamsToUrl(endpoint, eventData);

  Services.xhrFor(ampDoc.win)
    .fetchJson(url, {
      mode: 'cors',
      method: 'GET',
      // This should be cacheable across publisher domains, so don't append
      // __amp_source_origin to the URL.
      ampCors: false,
      credentials: 'include',
    })
    .then((res) => res.json())
    .then(
      (json) => {
        const {pixels = []} = json;
        if (pixels.length > 0) {
          dropPixelGroups(pixels, {
            sid: eventData['sid'],
            ampDoc,
          });
        }
      },
      () => {}
    );
};
