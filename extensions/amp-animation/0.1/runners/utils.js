/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {userAssert} from '../../../../src/log';

/**
 * @param {!Array<!../web-animation-types.InternalWebAnimationRequestDef>} requests
 * @return {number} total duration in milliseconds.
 * @throws {Error} If timeline is infinite.
 */
export function getTotalDuration(requests) {
  let maxTotalDuration = 0;
  for (let i = 0; i < requests.length; i++) {
    const {timing} = requests[i];

    userAssert(
      isFinite(timing.iterations),
      'Animation has infinite ' +
        'timeline, we can not seek to a relative position within an infinite ' +
        'timeline. Use "time" for seekTo or remove infinite iterations'
    );

    const iteration = timing.iterations - timing.iterationStart;
    const totalDuration =
      timing.duration * iteration + timing.delay + timing.endDelay;

    if (totalDuration > maxTotalDuration) {
      maxTotalDuration = totalDuration;
    }
  }

  return maxTotalDuration;
}
