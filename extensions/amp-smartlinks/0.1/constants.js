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

const BASE_API_URL = 'https://api.narrativ.com/api';
/** @const @enum {string} */
export const ENDPOINTS = {
  PAGE_IMPRESSION_ENDPOINT: `${BASE_API_URL}/v1/events/impressions/page_impression/`,
  NRTV_CONFIG_ENDPOINT: `${BASE_API_URL}/v0/publishers/.nrtv_slug./amp_config/`,
  LINKMATE_ENDPOINT: `${BASE_API_URL}/v1/publishers/.pub_id./linkmate/smart_links/`,
};
