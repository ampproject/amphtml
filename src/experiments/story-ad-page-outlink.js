import {randomlySelectUnsetExperiments} from '#experiments';

import {ExperimentInfoDef} from './experiments.type';

/** @const */
export const StoryAdPageOutlink = {
  ID: 'story-ad-page-outlink',
  CONTROL: '20212524',
  EXPERIMENT: '20212523',
};

/**
 * Choose what time value to auto advance story ads.
 * @param {!Window} win
 */
export function divertStoryAdPageOutlink(win) {
  /** @type {!ExperimentInfoDef} */
  const experimentInfo = {
    experimentId: StoryAdPageOutlink.ID,
    isTrafficEligible: () => true,
    branches: [StoryAdPageOutlink.CONTROL, StoryAdPageOutlink.EXPERIMENT],
  };
  randomlySelectUnsetExperiments(win, [experimentInfo]);
}
