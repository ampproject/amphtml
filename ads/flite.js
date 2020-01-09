/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function flite(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['guid', 'mixins']);
  const {guid} = data,
    o = global,
    e = encodeURIComponent,
    x = 0;
  let r = '',
    dep = '';
  o.FLITE = o.FLITE || {};
  o.FLITE.config = o.FLITE.config || {};
  o.FLITE.config[guid] = o.FLITE.config[guid] || {};
  o.FLITE.config[guid].cb = Math.random();
  o.FLITE.config[guid].ts = +Number(new Date());
  r = global.context.location.href;
  const m = r.match(new RegExp('[A-Za-z]+:[/][/][A-Za-z0-9.-]+'));
  dep = data.mixins ? '&dep=' + data.mixins : '';
  const url = [
    'https://r.flite.com/syndication/uscript.js?i=',
    e(guid),
    '&v=3',
    dep,
    '&x=us',
    x,
    '&cb=',
    o.FLITE.config[guid].cb,
    '&d=',
    e((m && m[0]) || r),
    '&tz=',
    new Date().getTimezoneOffset(),
  ].join('');
  loadScript(o, url);
}
