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

// characters to be used in the creation of guids
const BASE60 = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ_abcdefghijkmnopqrstuvwxyz';

// make a 12-digit base-60 number for performance tracking
let guid = '';
for (let i = 0; i < 12; i = i + 1) {
  guid = guid + BASE60.substr(Math.floor(Math.random() * 60), 1);
}

/**
 * Prepare the render data, create the node and add handlers
 * @param {string} queryParams - optional query string to append
 */
function log(queryParams) {
  const call = new Image();
  let query = 'https://log.pinterest.com/?guid=' + guid;
  query = query + '&amp=1';
  if (queryParams) {
    query = query + queryParams;
  }
  query = query + '&via=' + encodeURIComponent(window.location.href);
  call.src = query;
}

/**
 * Pinterest provides text HTML encoded. This utility transforms it back
 * into UTF-8 text.
 * @param {string} str - the string to filter
 * @return {string}
 */
function filter(str) {
  try {
    return new DOMParser().parseFromString(str, 'text/html').body.textContent;
  } catch (e) {
    return str;
  }
}

/**
 * Create a DOM element with attributes
 * @param {Document} doc
 * @param {Object} data - the string to filter
 * @return {Element}
 */
function make(doc, data) {
  let el = null,
    tag,
    attr;
  for (tag in data) {
    el = doc.createElement(tag);
    for (attr in data[tag]) {
      if (typeof data[tag][attr] === 'string') {
        set(el, attr, data[tag][attr]);
      }
    }
    break;
  }
  return el;
}

/**
 * Set a DOM element attribute
 * @param {Element} el - The element
 * @param {string} attr - the attribute key
 * @param {string} value - the attribute value
 */
function set(el, attr, value) {
  if (typeof el[attr] === 'string') {
    el[attr] = value;
  } else {
    el.setAttribute(attr, value);
  }
}

export const Util = {filter, guid, log, make, set};
