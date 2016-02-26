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

import {
  writeScript, validateSrcPrefix, validateSrcContains
}
from '../src/3p';

const APPNEXUS_AST_URL = 'https://acdn.adnxs.com/ast/ast.js';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function appnexus(global, data) {
  // in case we pass the ttj url to use, simply call it and return
  if (data.src) {
    validateSrcPrefix('https:', data.src);
    validateSrcContains('/ttj?', data.src);
    try {
      validateSrcContains('size=', data.src);
    } catch (e) {
      //append sizes from data
      const sizes = 'size=' + data.width + 'x' + data.height;
      data.src = data.src + '&' + sizes;
    }
    writeScript(global, data.src);
    return;
  }
  // otherwise, use json configuration to load ast
  if (context.isMaster) { // in case we are in the master iframe, we load AST
    apntag = (typeof apntag !== 'undefined') ? apntag : {};
    apntag.anq = apntag.anq || [];

    writeScript(global, APPNEXUS_AST_URL);

    if (data.pageOpts) {
      apntag.anq.push(function() {
        //output console information
        apntag.debug = data.debug || false;
        //set global page options
        apntag.setPageOpts(data.pageOpts);
      });
    }

    for (let i = 0; i < data.adUnits.length; ++i) {
      (function(i) {
        apntag.anq.push(function() {
          //define ad tag
          apntag.defineTag(data.adUnits[i]);
        });
      })(i);
    }

    apntag.anq.push(function() {
      apntag.loadTags();
    });
  }
  // then for all ad units, define the ad placement and show the ad
  global.docEndCallback = function() {
    const div = global.document.createElement('div'),
      c = context;
    div.setAttribute('id', data.target);
    // create and insert the div for the ad to render in
    const divContainer = global.document.getElementById('c');
    if (divContainer) {
      divContainer.appendChild(div);
    }
    c.master.apntag = c.master.apntag || {};
    c.master.apntag.anq = c.master.apntag.anq || [];
    c.master.apntag.anq.push(function() {
      // in case we are not in the master iframe, we create a reference to the apntag in the master iframe
      if (!this.isMaster) {
        global.apntag = c.master.apntag;
      }
      // collapse on no ad is handle here.
      c.master.apntag.onEvent('adNoBid', data.target, function() {
        c.noContentAvailable();
      });
      c.master.apntag.showTag(data.target, global.window);
    });
  };
}
