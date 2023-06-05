import {randomlySelectUnsetExperiments} from '#experiments';

/**
 * @const
 * @type {{[key: string]: string}}
 */
export const StoryAdPlacements = {
  ID: 'story-ad-placements',
  CONTROL: '31060567',
  PREDETERMINED_EIGHT: '31060568',
  PREDETERMINED_TEN: '31060817',
  PREDETERMINED_TWELVE: '31060569',
};

/**
 * Choose which placement algorithm and density for given win.
 * @param {Window} win
 */
export function divertStoryAdPlacements(win) {
  /** @type {import('./types.d').ExperimentInfo} */
  const experimentInfo = {
    experimentId: StoryAdPlacements.ID,
    isTrafficEligible: () => true,
    branches: [
      StoryAdPlacements.CONTROL,
      StoryAdPlacements.PREDETERMINED_EIGHT,
      StoryAdPlacements.PREDETERMINED_TEN,
      StoryAdPlacements.PREDETERMINED_TWELVE,
    ],
  };
  randomlySelectUnsetExperiments(win, [experimentInfo]);
}
