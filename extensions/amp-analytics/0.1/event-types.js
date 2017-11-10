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
import {dev, user} from '../../../src/log';
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
const TRACKER_TYPE = Object.freeze({
  'click': {
    name: 'click',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES + ['timer'],
    // Escape the temporal dead zone by not referencing a class directly.
    klass: function(root) { return new ClickEventTracker(root); },
  },
  'custom': {
    name: 'custom',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES + ['timer'],
    klass: function(root) { return new CustomEventTracker(root); },
  },
  'render-start': {
    name: 'render-start',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES + ['timer', 'visible'],
    klass: function(root) { return new SignalTracker(root); },
  },
  'ini-load': {
    name: 'ini-load',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES + ['timer', 'visible'],
    klass: function(root) { return new IniLoadTracker(root); },
  },
  'timer': {
    name: 'timer',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: function(root) { return new TimerEventTracker(root); },
  },
  'visible': {
    name: 'visible',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES + ['timer'],
    klass: function(root) { return new VisibilityTracker(root); },
  },
  'hidden': {
    name: 'visible', // Reuse tracker with visibility
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES + ['timer'],
    klass: function(root) { return new VisibilityTracker(root); },
  },
  'video': {
    name: 'video',
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES + ['timer'],
    klass: function(root) { return new VideoEventTracker(root); },
  },
});

/**
 * @param {string} triggerType
 * @return {bool}
 */
export function isVideoTriggerType(triggerType) {
  return startsWith(triggerType, 'video-');
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
 * @param {string} triggerType
 * @return {bool}
 */
export function isDeprecatedListenerEvent(triggerType) {
  return triggerType == 'scroll';
}

/**
 * @param {string} eventType
 * @return {string}
 */
export function getTrackerKeyName(eventType) {
  if (isVideoTriggerType(eventType)) {
    return 'video';
  }
  if (!isReservedTriggerType(eventType)) {
    return 'custom';
  }
  return TRACKER_TYPE.hasOwnProperty(eventType) ?
      TRACKER_TYPE[eventType].name : eventType;
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
    return trackerProfile.allowedFor.indexOf('visible') != -1;
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
  const filtered = {};
  Object.keys(TRACKER_TYPE).forEach(key => {
    if (TRACKER_TYPE.hasOwnProperty(key) && predicate(TRACKER_TYPE[key])) {
      filtered[key] = TRACKER_TYPE[key].klass;
    }
  }, this);
  return filtered;
}
