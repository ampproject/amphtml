/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
 * Registred singleton on AMP doc.
 * @enum {number}
 */
export const AMPDOC_SINGLETON_NAME = {
  TRACKING_IFRAME: 1,
  LINKER: 2,
};

/**
 * Enum for tick labels (used by Performance service)
 * @enum {string}
 */
export const TickLabel = {
  ACCESS_AUTHORIZATION: 'aaa',
  ACCESS_AUTHORIZATION_VISIBLE: 'aaav',
  ADS_LAYOUT_DELAY: 'adld',
  BAD_FRAMES: 'bf',
  BATTERY_DROP: 'bd',
  CONTENT_LAYOUT_DELAY: 'cld',
  CUMULATIVE_LAYOUT_SHIFT: 'cls',
  CUMULATIVE_LAYOUT_SHIFT_2: 'cls-2',
  DOCUMENT_READY: 'dr',
  END_INSTALL_STYLES: 'e_is',
  FIRST_CONTENTFUL_PAINT: 'fcp',
  FIRST_CONTENTFUL_PAINT_VISIBLE: 'fcpv',
  FIRST_PAINT: 'fp',
  FIRST_INPUT_DELAY: 'fid',
  FIRST_INPUT_DELAY_POLYFILL: 'fid-polyfill',
  FIRST_VIEWPORT_READY: 'pc',
  GOOD_FRAME_PROBABILITY: 'gfp',
  INSTALL_STYLES: 'is',
  LARGEST_CONTENTFUL_PAINT_VISIBLE: 'lcpv',
  LARGEST_CONTENTFUL_PAINT_LOAD: 'lcpl',
  LARGEST_CONTENTFUL_PAINT_RENDER: 'lcpr',
  LONG_TASKS_CHILD: 'ltc',
  LONG_TASKS_SELF: 'lts',
  MAKE_BODY_VISIBLE: 'mbv',
  MESSAGING_READY: 'msr',
  ON_FIRST_VISIBLE: 'ofv',
  ON_LOAD: 'ol',
  SLOW_ELEMENT_RATIO: 'ser',
  TIME_ORIGIN: 'timeOrigin',
  VIDEO_CACHE_STATE: 'vcs',
  VIDEO_ERROR: 'verr',
  VIDEO_JOINT_LATENCY: 'vjl',
  VIDEO_MEAN_TIME_BETWEEN_REBUFFER: 'vmtbrb',
  VIDEO_REBUFFERS: 'vrb',
  VIDEO_REBUFFER_RATE: 'vrbr',
  VIDEO_WATCH_TIME: 'vwt',
};
