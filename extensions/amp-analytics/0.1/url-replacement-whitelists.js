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

/**
 * Used for inserted scoped analytics element.
 * @const {!Object<string, boolean>}
 */
export const ScopedElementWhiteList = {
  // TODO: Please Review the list!
  'RANDOM': true,
  'COUNTER': true,
  'CANONICAL_URL': true,
  'CANONICAL_HOST': true,
  'CANONICAL_HOSTNAME': true,
  'CANONICAL_PATH': true,
  'DOCUMENT_REFERRER': false,
  'TITLE': true,
  'AMPDOC_URL': true,
  'AMPDOC_HOST': true,
  'AMPDOC_HOSTNAME': true,
  'SOURCE_URL': true,
  'SOURCE_HOST': true,
  'SOURCE_HOSTNAME': true,
  'SOURCE_PATH': true,
  'PAGE_VIEW_ID': false,
  'QUERY_PARAM': false,
  'CLIENT_ID': false,
  'VARIANT': false,
  'VARIANTS': false,
  'SHARE_TRACKING_INCOMING': false,
  'SHARE_TRACKING_OUTGOING': false,
  'TIMESTAMP': true,
  'TIMEZONE': true,
  'SCROLL_TOP': false,
  'SCROLL_LEFT': false,
  'SCROLL_HEIGHT': false,
  'SCROLL_WIDTH': false,
  'VIEWPORT_HEIGHT': true,
  'VIEWPORT_WIDTH': true,
  'SCREEN_WIDTH': true,
  'SCREEN_HEIGHT': true,
  'AVAILABLE_SCREEN_HEIGHT': true,
  'AVAILABLE_SCREEN_WIDTH': true,
  'SCREEN_COLOR_DEPTH': true,
  'DOCUMENT_CHARSET': true,
  'BROWSER_LANGUAGE': true,
  'PAGE_LOAD_TIME': false,
  'DOMAIN_LOOKUP_TIME': false,
  'TCP_CONNECT_TIME': false,
  'SERVER_RESPONSE_TIME': false,
  'PAGE_DOWNLOAD_TIME': false,
  'REDIRECT_TIME': false,
  'DOM_INTERACTIVE_TIME': false,
  'CONTENT_LOAD_TIME': false,
  'ACCESS_READER_ID': false,
  'AUTHDATA': false,
  'VIEWER': false,
  'TOTAL_ENGAGED_TIME': false,
  'NAV_TIMING': false,
  'NAV_TYPE': false,
  'NAV_REDIRECT_COUNT': false,
  'AMP_VERSION': true,
  'BACKGROUND_STATE': true,
};
