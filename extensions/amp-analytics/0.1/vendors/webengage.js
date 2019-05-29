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

export const WEBENGAGE_CONFIG = /** @type {!JsonObject} */ ({
  requests: {
    base:
      "https://c.webengage.com/amp?licenseCode=${licenseCode}&luid=${clientId(we_luid)}&pageUrl=${canonicalUrl}&pageTitle=${title}&referrer=${documentReferrer}&vh=${viewportHeight}&vw=${viewportWidth}&category=application",
    we_amp_pageview_request: {
      baseUrl: "${base}&eventName=Page Viewed"
    }
  },
  extraUrlParams: {
    is_amp: 1
  },
  triggers: {
    we_amp_pageview: {
      on: "visible",
      request: "we_amp_pageview_request"
    }
  }
});
