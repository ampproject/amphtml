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

/**
 * Vendors who have IAB viewability certification may use iframe transport
 * (see ../amp-analytics.md and ../integrating-analytics.md). In this case,
 * put only the specification of the iframe location in the object below,
 * and put everything else (requests, triggers, etc.) in the object above.
 * @const {!JsonObject}
 */
export const ANALYTICS_IFRAME_TRANSPORT_CONFIG = /** @type {!JsonObject} */ ({
  'bg': {
    'transport': {
      'iframe': 'https://tpc.googlesyndication.com/b4a/b4a-runner.html',
    },
  },
});
