var _ViewerSetTimeToBranc, _BranchToTimeValues;function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} /**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/** @const */
export var StoryAdSegmentExp = {
  ID: 'story-ad-progress-segment',
  CONTROL: '31061402',
  SIX_SECONDS: '31061403',
  EIGHT_SECONDS: '31061404',
  TEN_SECONDS: '31061405' };


/** @const */
export var StoryAdSegmentTimes = {
  SENTINEL: '999999ms',
  SIX_SECONDS: '6000ms',
  EIGHT_SECONDS: '8000ms',
  TEN_SECONDS: '10000ms' };


/** @const */
export var ViewerSetTimeToBranch = (_ViewerSetTimeToBranc = {}, _defineProperty(_ViewerSetTimeToBranc,
StoryAdSegmentTimes.SIX_SECONDS, StoryAdSegmentExp.SIX_SECONDS), _defineProperty(_ViewerSetTimeToBranc,
StoryAdSegmentTimes.EIGHT_SECONDS, StoryAdSegmentExp.EIGHT_SECONDS), _defineProperty(_ViewerSetTimeToBranc,
StoryAdSegmentTimes.TEN_SECONDS, StoryAdSegmentExp.TEN_SECONDS), _defineProperty(_ViewerSetTimeToBranc,
StoryAdSegmentTimes.SENTINEL, StoryAdSegmentExp.CONTROL), _ViewerSetTimeToBranc);


/** @const */
export var BranchToTimeValues = (_BranchToTimeValues = {}, _defineProperty(_BranchToTimeValues,
StoryAdSegmentExp.SIX_SECONDS, StoryAdSegmentTimes.SIX_SECONDS), _defineProperty(_BranchToTimeValues,
StoryAdSegmentExp.EIGHT_SECONDS, StoryAdSegmentTimes.EIGHT_SECONDS), _defineProperty(_BranchToTimeValues,
StoryAdSegmentExp.TEN_SECONDS, StoryAdSegmentTimes.TEN_SECONDS), _BranchToTimeValues);
// /Users/mszylkowski/src/amphtml/src/experiments/story-ad-progress-segment.js