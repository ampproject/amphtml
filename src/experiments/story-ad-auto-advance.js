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

import {randomlySelectUnsetExperiments} from '#experiments';

// typedef imports
import {ExperimentInfoDef} from './experiments.type';

/** @const {!Object<string, string>} */
export const AdvanceExpToTime = {
  '31060905': '6s',
  '31060906': '8s',
  '31060907': '10s',
};

/** @const */
export const StoryAdAutoAdvance = {
  ID: 'story-ad-auto-advance',
  CONTROL: '31060904',
  SIX_SECONDS: '31060905',
  EIGHT_SECONDS: '31060906',
  TEN_SECONDS: '31060907',
};

/**
 * Choose what time value to auto advance story ads.
 * @param {!Window} win
 */
export function divertStoryAdAutoAdvance(win) {
  /** @type {!ExperimentInfoDef} */
  const experimentInfo = {
    experimentId: StoryAdAutoAdvance.ID,
    isTrafficEligible: () => true,
    branches: [
      StoryAdAutoAdvance.CONTROL,
      StoryAdAutoAdvance.SIX_SECONDS,
      StoryAdAutoAdvance.EIGHT_SECONDS,
      StoryAdAutoAdvance.TEN_SECONDS,
    ],
  };
  randomlySelectUnsetExperiments(win, [experimentInfo]);
}
