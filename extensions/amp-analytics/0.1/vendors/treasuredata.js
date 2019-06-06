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

export const TREASUREDATA_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'host': 'in.treasuredata.com',
    'writeKey': '',
    'database': '',
    'table': 'events',
  },
  'requests': {
    'base': 'https://${host}/postback/v3/event/${database}',
    'baseParams': 'td_write_key=${writeKey}' +
      '&td_global_id=td_global_id' +
      '&td_client_id=CLIENT_ID(_td)' +
      '&td_charset=DOCUMENT_CHARSET' +
      '&td_language=BROWSER_LANGUAGE' +
      '&td_color=SCREEN_COLOR_DEPTH' +
      '&td_screen=${screenWidth}x${scrollHeight}' +
      '&td_viewport=${availableScreenWidth}x${availableScreenHeight}' +
      '&td_title=TITLE' +
      '&td_url=SOURCE_URL' +
      '&td_user_agent=USER_AGENT' +
      '&td_host=SOURCE_HOST' +
      '&td_path=SOURCE_PATH' +
      '&td_referrer=DOCUMENT_REFERRER' +
      '&td_ip=td_ip',
    'pageview': '${base}/${table}?${baseParams}',
    'event': '${base}/${table}?${baseParams}',
  },
});
