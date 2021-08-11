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

import { randomlySelectUnsetExperiments } from "./";

import { ExperimentInfoDef } from "./experiments.type";

/** @const */
export var StoryAdPlacements = {
  ID: 'story-ad-placements',
  CONTROL: '31060567',
  PREDETERMINED_EIGHT: '31060568',
  PREDETERMINED_TEN: '31060817',
  PREDETERMINED_TWELVE: '31060569' };


/**
 * Choose which placement algorithm and density for given win.
 * @param {!Window} win
 */
export function divertStoryAdPlacements(win) {
  /** @type {!ExperimentInfoDef} */
  var experimentInfo = {
    experimentId: StoryAdPlacements.ID,
    isTrafficEligible: function isTrafficEligible() {return true;},
    branches: [
    StoryAdPlacements.CONTROL,
    StoryAdPlacements.PREDETERMINED_EIGHT,
    StoryAdPlacements.PREDETERMINED_TEN,
    StoryAdPlacements.PREDETERMINED_TWELVE] };


  randomlySelectUnsetExperiments(win, [experimentInfo]);
}
// /Users/mszylkowski/src/amphtml/src/experiments/story-ad-placements.js