/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function voluum(global, data) {

  validateData(data, ['domain', 'publisher', 'placement']);
  const VISIBILITY_MIN_PERCENTAGE = 70;

  global._voluum = global._voluum || new VLM(data);

  global.context.observeIntersection(function(changes) {
    changes.forEach(function(c) {
      if (c.intersectionRect.height) {
        const ratio = Math.round(c.intersectionRatio * 100);
        global._voluum.appendIntersect({
          visible: ratio >= VISIBILITY_MIN_PERCENTAGE,
          visiblePercentage: ratio,
          rects: c,
          placement: data.placement,
        });
      }
    });
  });

  writeScript(global, `//${data.domain}/index.js?b=${Date.now()}`);
}

VLM.prototype.appendIntersect = function(o) {
  this.intersects.push(o);
  if (typeof this.visibilityCallback === 'function') {
    this.visibilityCallback(o);
  }
};

function VLM(data) {
  this.framework = 'amp';
  this.publisher = data.publisher;
  this.placement = data.placement;
  this.intersects = [];
}
