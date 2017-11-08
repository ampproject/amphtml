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

import {
  ClickEventTracker,
  CustomEventTracker,
  IniLoadTracker,
  SignalTracker,
  TimerEventTracker,
  VideoEventTracker,
  VisibilityTracker,
} from './events';
import {isEnumValue} from '../../../src/types';
import {startsWith} from '../../../src/string';

/**
 * Events that can result in analytics data to be sent.
 * @const
 * @enum {string}
 */
export const AnalyticsEventType = {
  VISIBLE: 'visible',
  CLICK: 'click',
  TIMER: 'timer',
  SCROLL: 'scroll',
  HIDDEN: 'hidden',
};

const ALLOWED_FOR_ALL_ROOT_TYPES = ['ampdoc', 'embed'];

/**
 * Events that can result in analytics data to be sent.
 * @const {!Object<string, {
 *     name: string,
 *     allowedFor: !Array<string>,
 *     klass: function(new:./events.EventTracker)
 *   }>}
 */
const TRACKER_TYPE = {
  'click': {
    name: 'click',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: ClickEventTracker,
  },
  'custom': {
    name: 'custom',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: CustomEventTracker,
  },
  'render-start': {
    name: 'render-start',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: SignalTracker,
  },
  'ini-load': {
    name: 'ini-load',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: IniLoadTracker,
  },
  'timer': {
    name: 'timer',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: TimerEventTracker,
  },
  'visible': {
    name: 'visible',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: VisibilityTracker,
  },
  'hidden': {
    name: 'visible', // Reuse tracker with visibility
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: VisibilityTracker,
  },
  'video': {
    name: 'video',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: VideoEventTracker,
  },
};

/**
 * @param {string} triggerType
 * @return {bool}
 */
export function isVideoTriggerType(triggerType) {
  return triggerType.startsWith('video-');
}

/**
 * @param {string} triggerType
 * @return {bool}
 */
export function isReservedTriggerType(triggerType) {
  return !!TRACKER_TYPE[triggerType] ||
      !!isEnumValue(AnalyticsEventType, triggerType);
}

/**
 * @param {string} rootType
 * @return {!Object<string, function(new:./events.EventTracker)}
 */
export function getTrackerTypesForRootType(rootType) {
  return filterTrackers(function(trackerProfile) {
    return trackerProfile.allowedFor.indexOf(rootType) != -1;
  });
}

export function getTrackerTypesForVisibilityTracker() {
  return filterTrackers(function(trackerProfile) {
    return trackerProfile.allowedFor.indexOf('visibility') != -1;
  });
}

export function getTrackerTypesForTimerEventTracker() {
  return filterTrackers(function(trackerProfile) {
    return trackerProfile.allowedFor.indexOf('timer') != -1;
  });
}

/**
 * @param {function(): bool}
 * @return {!Object<string, function(new:./events.EventTracker)}
 * @private
 */
function filterTrackers(predicate) {
  let filtered = {};
  for (key in TRACKER_TYPE) {
    if (TRACKER_TYPE.hasOwnProperty(key) && predicate(TRACKER_TYPE[key])) {
      filtered[key] = TRACKER_TYPE[key]['klass'];
    }
  }
  return filtered;
}
