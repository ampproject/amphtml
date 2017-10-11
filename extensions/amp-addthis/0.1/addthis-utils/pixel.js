/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {createElementWithAttributes} from '../../../../src/dom';
import {dict} from '../../../src/utils/object';
import {parseUrl} from '../../../src/url';
import {setStyles} from '../../../src/style';

import {callPRender} from './prender';

const RE_IFRAME = /#iframe$/;
const pixelatorFrameTitle = 'Pxltr Frame';

/**
 * Returns a sorted array of objects like [{delay: 1000, pixels: [...]}]
 * @param  {Array<Pixel>} pixelList
 * @return {Array<PixelGroup>}
 */
const groupPixelsByTime = pixelList => {
  // Clean delay value; if it's empty/doesn't exist, default to [0]
  const cleanedPixels = pixelList.map(pixel => {
    const {delay} = pixel;
    return {
      ...pixel,
      delay: Array.isArray(delay) && delay.length ? delay : [0],
    };
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
  if (!url.includes('//')) {
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
 * @param  {Array<Pixel>}    pixels
 * @param  {String}     options.sid - session (view) id
 */
export const dropPixelGroups = (pixels, {sid, ampDoc}) => {
  const pixelGroups = groupPixelsByTime(pixels);
  pixelGroups.forEach(({delay, pixels}) => {
    setTimeout(() => {
      const pids = pixels.map(pixel => {
        dropPixelatorPixel(pixel.url, ampDoc);
        return pixel.id;
      });

      const data = {
        delay,
        ids: pids.join('-'),
        sid,
      };

      callPRender({data, ampDoc});
    }, delay * 1000);
  });
};
