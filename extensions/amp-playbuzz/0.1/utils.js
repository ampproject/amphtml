/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

import {rethrowAsync} from './../../../src/log';
import {serializeQueryString} from '../../../src/url';

export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) { func.apply(context, args); };
    }, wait);
    if (immediate && !timeout) { func.apply(context, args); }
  };
};

export function getElementCreator(document) {
  return function createElement(name, className, children) {
    const element = document.createElement(name);
    element.className = className;
    appendChildren(element, children);
    return element;
  };
}

function appendChildren(element, children) {
  children = (!children) ? [] : Array.isArray(children) ? children : [children];
  children.forEach(child => element.appendChild(child));
};

export function handleMessageByName(event, messageName, handler) {
  const isPlaybuzzItemEvent = event.origin &&
        event.origin.indexOf &&
        event.origin.indexOf('playbuzz.com') >= 0;

  if (isPlaybuzzItemEvent) {
    handlePlaybuzzItemEvent(event, messageName, handler);
  }
}

/**
 * @param {Object} event
 * @param {String} eventName
 * @param {Function} handler
 */
function handlePlaybuzzItemEvent(event, eventName, handler) {
  const data = parsePlaybuzzEventData(event.data);
  if (data[eventName]) {
    handler(data[eventName]);
  }
}

function parsePlaybuzzEventData(data) {
  if (typeof data === 'object') {
    return data;
  }
  const err = 'error parsing json message from playbuzz item: ' + data;
  try {
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
  }
  catch (e) {
    rethrowAsync('amp-playbuzz',err, e);
    return {};
  }

  rethrowAsync('amp-playbuzz',err, data);
  return {};
}

export function composeEmbedUrl(options) {
  const embedUrl = options.itemUrl + '?' + serializeQueryString({
    feed: true,
    implementation: 'amp',
    src: options.itemUrl,
    embedBy: '00000000-0000-0000-0000-000000000000',
    game: options.relativeUrl,
    comments: undefined,
    useComments: options.displayComments,
    gameInfo: options.displayItemInfo,
    useShares: options.displayShareBar,
    socialReferrer: false, //always false - will use parent url for sharing
    height: 'auto', //must pass as is - if not, makes problems in trivia (iframe height scrolling)
    parentUrl: options.parentUrl, //used for sharing
    parentHost: options.parentHost,
  });
  return embedUrl;
}
