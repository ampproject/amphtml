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

import {loadScript, writeScript, validateData} from '../3p/3p';
import {setStyles} from '../src/style';

const APPNEXUS_AST_URL = 'https://acdn.adnxs.com/ast/ast.js';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function appnexus(global, data) {
  const args = [];
  args.push('size=' + data.width + 'x' + data.height);
  if (data.tagid) {
    validateData(data, ['tagid']);
    args.push('id=' + encodeURIComponent(data.tagid));
    writeScript(global, constructTtj(args));
    return;
  } else if (data.member && data.code) {
    validateData(data, ['member', 'code']);
    args.push('member=' + encodeURIComponent(data.member));
    args.push('inv_code=' + encodeURIComponent(data.code));
    writeScript(global, constructTtj(args));
    return;
  }

  /**
   * Construct the TTJ URL. Note params should be properly encoded first (use encodeURIComponent);
   * @param  {!Array<string>} args query string params to add to the base URL.
   * @return {string}      Formated TTJ URL.
   */
  function constructTtj(args) {
    let url = 'https://ib.adnxs.com/ttj?';
    for (let i = 0; i < args.length; i++) {
      //append arg to query. Please encode arg first.
      url += args[i] + '&';
    }

    return url;
  }

  appnexusAst(global, data);

}

function appnexusAst(global, data) {
  validateData(data, ['adUnits']);
  let apntag;
  if (context.isMaster) { // in case we are in the master iframe, we load AST
    context.master.apntag = context.master.apntag || {};
    context.master.apntag.anq = context.master.apntag.anq || [];
    apntag = context.master.apntag;

    apntag.anq.push(() => {
      if (data.pageOpts) {
        apntag.anq.push(() => {
          //output console information
          apntag.debug = data.debug || false;
          apntag.setPageOpts(data.pageOpts);
        });
      }

      data.adUnits.forEach(adUnit => {
        apntag.defineTag(adUnit);
      });

    });
    loadScript(global, APPNEXUS_AST_URL, () => {
      apntag.anq.push(() => {
        apntag.loadTags();
      });
    });
  }

  const div = global.document.createElement('div');
  div.setAttribute('id', data.target);
  const divContainer = global.document.getElementById('c');
  if (divContainer) {
    divContainer.appendChild(div);
    setStyles(divContainer, {
      top: '50%',
      left: '50%',
      bottom: '',
      right: '',
      transform: 'translate(-50%, -50%)',
    });
  }

  if (!apntag) {
    apntag = context.master.apntag;

    //preserve a global reference
    global.apntag = context.master.apntag;
  }

  // check for ad responses received for a slot but before listeners are registered,
  // for example when an above-the-fold ad is scrolled into view
  apntag.anq.push(() => {
    apntag.checkAdAvailable(data.target)
        .getAd({ resolve: isAdAvailable, reject: noAdAvailable });
  });

  apntag.anq.push(() => {
    apntag.onEvent('adAvailable', data.target, isAdAvailable);
    apntag.onEvent('adNoBid', data.target, noAdAvailable);
  });
}

function isAdAvailable(adObj) {
  global.context.renderStart({width: adObj.width, height: adObj.height});
  apntag.showTag(adObj.targetId, global.window);
}

function noAdAvailable() {
  context.noContentAvailable();
}