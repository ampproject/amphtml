/**
 * @const
 * @type {Object<string, string>}
 */
export const StoryAdSegmentExp = {
  ID: 'story-ad-progress-segment',
  CONTROL: '31063379', // No ad advance, no page advance, no new cta.
  NO_ADVANCE_BOTH: '31063380', // No ad advance, no page advance, new cta.
  NO_ADVANCE_AD: '31063381', // No ad advance, page=10s, new cta.
  TEN_SECONDS: '31063382', // Advance ad with new cta for the rest, page=10s.
  TWELVE_SECONDS: '31063383',
  FOURTEEN_SECONDS: '31063384',
};

/**
 * @const
 * @type {Object<string, string>}
 */
export const StoryAdSegmentTimes = {
  SENTINEL: '999999ms',
  TEN_SECONDS: '10000ms',
  TWELVE_SECONDS: '12000ms',
  FOURTEEN_SECONDS: '14000ms',
};

/**
 * @const
 * @type {Object<string, string>}
 */
export const BranchToTimeValues = {
  [StoryAdSegmentExp.TEN_SECONDS]: StoryAdSegmentTimes.TEN_SECONDS,
  [StoryAdSegmentExp.TWELVE_SECONDS]: StoryAdSegmentTimes.TWELVE_SECONDS,
  [StoryAdSegmentExp.FOURTEEN_SECONDS]: StoryAdSegmentTimes.FOURTEEN_SECONDS,
};
