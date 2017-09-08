/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
export function mywidget(global, data) {
  validateData(data, ['cid']);

  let isReady = false;

  /**
   * `data.height` can be not a number (`undefined`, if attribute is not set,
   * for example), that's why condition is not `data.height < 0`
   */
  if (!(data.height >= 0)) {
    return;
  }

  global.myWidget = {
    params: {
      cid: data.cid,
      container: 'c',
    },

    renderStart: global.context.renderStart,
    noContentAvailable: global.context.noContentAvailable,

    /**
     * @param {{firstIntersectionCallback:function()}} opts
     */
    ready(opts) {
      // Make sure ready() is called only once.
      if (isReady) {
        return;
      } else {
        isReady = true;
      }

      if (!opts || !opts.firstIntersectionCallback) {
        return;
      }

      /**
       * Widget want to be informed, when it gets into viewport, so we start
       * to listen when it happens for the first time.
       */
      const unlisten = global.context.observeIntersection(changes => {
        changes.forEach(c => {
          if (c.intersectionRect.height) {
            opts.firstIntersectionCallback();
            unlisten();
          }
        });
      });
    },
  };

  // load the myWidget initializer asynchronously
  loadScript(global, 'https://likemore-go.imgsmail.ru/widget.amp.js', () => {},
      global.context.noContentAvailable);
}
