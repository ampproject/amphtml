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

import {validateData, loadScript} from '../3p/3p';


/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function zedo(global, data) {
  // check mandatory fields
  validateData(data,
      ['superId', 'network', 'placementId', 'channel', 'publisher', 'dim'],
      ['charset', 'callback', 'renderer']);

  loadScript(global, 'https://ss3.zedo.com/gecko/tag/Gecko.amp.min.js', () => {
    const ZGTag = global.ZGTag;
    const charset = data.charset || '';
    const callback = data.callback || function() {};
    const geckoTag = new ZGTag(data.superId, data.network, '', '',
      charset, callback);
    geckoTag.setAMP();
    // define placement
    const placement = geckoTag.addPlacement(data.placementId,
        data.channel, data.publisher, data.dim, data.width, data.height);
    if (data.renderer) {
      for (const key in data.renderer) {
        placement.includeRenderer(data.renderer[key].name,
            data.renderer[key].value);
      }
    } else {
      placement.includeRenderer('display', {});
    }
    //create a slot div to display ad
    const slot = global.document.createElement('div');
    slot.id = 'zdt_' + data.placementId;

    const divContainer = global.document.getElementById('c');
    if (divContainer) {
      divContainer.appendChild(slot);
    }

    // call load ads
    geckoTag.loadAds();

    // call div ready
    geckoTag.placementReady(data.placementId);
  });
}
