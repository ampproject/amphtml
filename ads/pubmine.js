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
import {getSourceOrigin, getSourceUrl} from '../src/url';

const pubmineOptional = ['adsafe', 'section', 'wordads'],
  pubmineRequired = ['siteid'],
  pubmineURL = 'https://s.pubmine.com/showad.js';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pubmine(global, data) {
  validateData(data, pubmineRequired, pubmineOptional);

  let __ATA;
  (function(__ATA, global, data) {
    const ipwCustom = {
        adSafe: 'adsafe' in data ? data.adsafe : '0',
        amznPay: [],
        domain: getSourceOrigin(global.context.location.href),
        pageURL: getSourceUrl(global.context.location.href),
        wordAds: 'wordads' in data ? data.wordads : '0',
      },
      unitData = {
        sectionId: data['siteid'] + ('section' in data ? data.section : '1'),
        height: data.height,
        width: data.width,
      };

    __ATA.customParams = ipwCustom;
    __ATA.slotPrefix = 'automattic-id-';

    __ATA.displayAd = function(id) {
      __ATA.ids = __ATA.ids || {};
      __ATA.ids[id] = 1;
    };

    __ATA.id = function() {
      return __ATA.slotPrefix +
        (parseInt(Math.random() * 10000, 10) +
          1 + (new Date()).getMilliseconds());
    };

    __ATA.initAd = function() {
      const o = unitData || {},
        g = global,
        d = g.document,
        wr = d.write,
        id = __ATA.id();

      wr.call(d, '<body style="margin:0;">');
      wr.call(d, '<div id="' + id + '" data-section="' + (o.sectionId || 0) +
        '"' + (o.type ? ('data-type="' + o.type + '"') : '') +
        ' ' + (o.forcedUrl ? ('data-forcedurl="' + o.forcedUrl + '"') : '') +
        ' style="width:' + (o.width || 0) + 'px; height:' + (o.height || 0) +
        'px; margin: 0;">');
      __ATA.displayAd(id);
      wr.call(d, '</div></body>');
    };
  })(__ATA || (__ATA = {}), global, data);

  global.__ATA = __ATA;
  __ATA.initAd();
  loadScript(global, pubmineURL);
}
