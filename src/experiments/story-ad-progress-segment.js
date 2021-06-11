/**
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

/** @const {!Object<string, string>} */
export const StoryAdSegmentExp = {
  ID: 'story-ad-progress-segment',
  CONTROL: '31061402',
  SIX_SECONDS: '31061403',
  EIGHT_SECONDS: '31061404',
  TEN_SECONDS: '31061405',
};

/** @const {!Object<string, string>} */
export const StoryAdSegmentTimes = {
  SENTINEL: '999999ms',
  SIX_SECONDS: '6000ms',
  EIGHT_SECONDS: '8000ms',
  TEN_SECONDS: '10000ms',
};

/** @const {!Object<string, string>} */
export const ViewerSetTimeToBranch = {
  [StoryAdSegmentTimes.SIX_SECONDS]: StoryAdSegmentExp.SIX_SECONDS,
  [StoryAdSegmentTimes.EIGHT_SECONDS]: StoryAdSegmentExp.EIGHT_SECONDS,
  [StoryAdSegmentTimes.TEN_SECONDS]: StoryAdSegmentExp.TEN_SECONDS,
  [StoryAdSegmentTimes.SENTINEL]: StoryAdSegmentExp.CONTROL,
};

/** @const {!Object<string, string>} */
export const BranchToTimeValues = {
  [StoryAdSegmentExp.SIX_SECONDS]: StoryAdSegmentTimes.SIX_SECONDS,
  [StoryAdSegmentExp.EIGHT_SECONDS]: StoryAdSegmentTimes.EIGHT_SECONDS,
  [StoryAdSegmentExp.TEN_SECONDS]: StoryAdSegmentTimes.TEN_SECONDS,
};
