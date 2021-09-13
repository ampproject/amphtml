import {randomlySelectUnsetExperiments} from '#experiments';

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
