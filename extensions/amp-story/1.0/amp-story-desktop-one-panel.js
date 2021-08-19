import {isExperimentOn} from '#experiments';

/**
 * Returns true if desktop one panel experiment is enabled.
 * @param {!Window} win
 * @return {boolean}
 */
export const isDesktopOnePanelExperimentOn = (win) => {
  return isExperimentOn(win, 'amp-story-desktop-one-panel');
};
