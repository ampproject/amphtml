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

import {getElementService} from './element-service';

/**
 * @param {!Window} win
 * @return {!Promise<!../extensions/amp-analytics/0.1/visibility-impl.Visibility>}
 */
export function visibilityFor(win) {
  return (/** @type {!Promise<
      !../extensions/amp-analytics/0.1/visibility-impl.Visibility>}} */ (
      getElementService(win, 'visibility', 'amp-analytics')));
};
