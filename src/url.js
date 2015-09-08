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

import {assert} from './asserts';


/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * @return {!Location}
 */
export function parseUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  var info = {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash
  };
  info.origin = a.origin || getOrigin(info);
  assert(info.origin, 'Origin must exist');
  return info;
}

/**
 * @param {!Location} info
 * @return {string}
 */
function getOrigin(info) {
  return info.protocol + '//' + info.host
}
