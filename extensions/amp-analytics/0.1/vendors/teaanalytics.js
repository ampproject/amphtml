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

export const TEAANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
  vars: {
    userUniqueId: '${clientId(__tea_sdk__user_unique_id)}',
    debug: 0,
  },
  requests: {
    domain: 'https://${channel}/v1/amp',
    commonParams:
      'user.user_unique_id=${userUniqueId}' +
      '&header.app_id=${app_id}' +
      '&header.language=${browserLanguage}' +
      '&header.screen_height=${screenHeight}' +
      '&header.screen_width=${screenWidth}' +
      '&header.resolution=${screenHeight}x${screenWidth}' +
      '&header.tz_offset=${timezone}' +
      '&header.tz_name=${timezoneCode}' +
      '&header.referrer=${documentReferrer}' +
      '&header.custom.user_agent=${userAgent}' +
      '&event.local_time_ms=${timestamp}' +
      '&event.params._staging_flag=${debug}' +
      '&verbose=${debug}',
    base: '${domain}?${commonParams}&rnd=${random}',
    pageview:
      '${base}' +
      '&event=predefine_pageview' +
      '&event.params.url=${sourceUrl}' +
      '&event.params.url_path=${sourcePath}' +
      '&event.params.title=${title}',
    event: '${base}',
  },
});
