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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function outbrain(global, data) {

  // ensure we have valid widgetId, htmlURL and ampURL
  validateData(data, ['widgetid', 'htmlurl', 'ampurl']);

  const widgetData = {
    viewId: global.context.pageViewId,
    widgetId: data.widgetid,
    htmlURL: data.htmlurl || global.context.canonicalUrl,
    ampURL: data.ampurl,
    fbk: data.fbk || '',
    testMode: data.testmode || 'false',
    styleFile: data.stylefile || '',
    referrer: data.referrer || global.context.referrer
  };

  // push the two object into the '_outbrain' global
  (global._outbrain = global._outbrain || []);

  // observation on entering/leaving the view
  global.context.observeIntersection(function(changes) {
    changes.forEach(function(c) {
      if (c && c.intersectionRect && c.intersectionRect.height) {
        global._outbrain.push({
          visible: true,
          rects: c,
          placement: data.placement
        });
      }
    });
  });

  // load the Outbrain AMP JS file
  loadScript(global, 'https://25d64758.ngrok.io/widgetAMP/outbrainAMP.js', () => {
    window.ampOBR.init(widgetData);
  });
}
