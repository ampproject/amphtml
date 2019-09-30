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

if (isLongTaskApiSupported(self)) {
  detectLongTasks(self);
}

/**
 * @param {!Window} win
 */
function detectLongTasks(win) {
  const observer = new win.PerformanceObserver(function(entryList) {
    const entries = entryList.getEntries();
    for (let i = 0; i < entries.length; i++) {
      if (
        entries[i].entryType != 'longtask' ||
        entries[i].name != 'cross-origin-descendant'
      ) {
        continue;
      }
      const attr = entries[i].attribution[0];
      if (!attr || !attr.containerSrc) {
        continue;
      }

      const {duration} = entries[i];
      let culprit = attr.containerSrc;
      if (attr.containerName) {
        const match = attr.containerName.match(/"type":"([^\"]*)"/);
        if (match.length > 1) {
          culprit = `<amp-ad type="${match[1]}">`;
        }
      }
      console./*OK*/ log(
        `%c LONG TASK %c ${duration}ms from ${culprit}`,
        'background: red; color: white',
        'background: #fff; color: #000'
      );
    }
  });
  observer.observe({entryTypes: ['longtask']});
}

/**
 * @param {!Window} win
 * @return {boolean}
 */
function isLongTaskApiSupported(win) {
  return (
    !!win.PerformanceObserver &&
    !!win.TaskAttributionTiming &&
    'containerName' in win.TaskAttributionTiming.prototype
  );
}
