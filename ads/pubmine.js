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

import {validateData, writeScript} from '../3p/3p';

const pubmineOptional = ['section', 'pt', 'ht'],
    pubmineRequired = ['siteid'],
    pubmineURL = 'https://s.pubmine.com/head.js';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pubmine(global, data) {
  validateData(data, pubmineRequired, pubmineOptional);

  global.__ATA_PP = {
    renderStartCallback: () => global.context.renderStart(),
    pt: 'pt' in data ? data.pt : 1,
    ht: 'ht' in data ? data.ht : 1,
    tn: 'amp',
    amp: true,
  };

  global.__ATA = global.__ATA || {};
  global.__ATA.cmd = global.__ATA.cmd || [];
  global.__ATA.criteo = global.__ATA.criteo || {};
  global.__ATA.criteo.cmd = global.__ATA.criteo.cmd || [];
  writeScript(global, pubmineURL);

  const o = {
        sectionId: data['siteid'] + ('section' in data ? data.section : '1'),
        height: data.height == 250 ? 250 : data.height - 15,
        width: data.width,
      },
      wr = global.document.write;

  wr.call(global.document,
      `<div id="atatags-${o.sectionId}">
        <script type="text/javascript">
          __ATA.cmd.push(function() {
            __ATA.initSlot('atatags-${o.sectionId}', {
              collapseEmpty: 'before',
              sectionId: ${o.sectionId},
              width: ${o.width},
              height: ${o.height}
            });
          });
        </script>
      </div>`
  );
}
