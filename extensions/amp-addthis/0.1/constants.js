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

export const CONFIGURATION_EVENT = 'addthis.amp.configuration';
export const SHARE_EVENT = 'addthis.share';
export const ORIGIN = 'https://s7.addthis.com';
export const API_SERVER = 'https://m.addthis.com';
export const COOKIELESS_API_SERVER = 'https://m.addthisedge.com';
export const SHARECOUNTER_SERVER = 'https://api-public.addthis.com';
export const ICON_SIZE = '32';
export const ALT_TEXT = 'AddThis Website Tools';
export const SHARE_CONFIG_KEYS = [
  'url',
  'title',
  'media',
  'description',
  'email_template',
  'email_vars',
  'passthrough',
  'url_transforms',
];
export const AT_CONFIG_KEYS = [
  'services_exclude',
  'services_compact',
  'services_expanded',
  'services_custom',
  'ui_click',
  'ui_disable',
  'ui_delay',
  'ui_hover_direction',
  'ui_language',
  'ui_offset_top',
  'ui_offset_left',
  'ui_tabindex',
  'track_addressbar',
  'track_clickback',
  'ga_property',
  'ga_social',
];
export const RE_ALPHA = /[A-Z]/gi;
export const RE_NONALPHA = /[^a-zA-Z]/g;
export const RE_WHITESPACE = /\s/g;
