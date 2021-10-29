/** @const */
export const StoryAdSegmentExp = {
  ID: 'story-ad-progress-segment',
  CONTROL: '31063366', // No ad advance, no page advance, no new cta.
  NO_ADVANCE_BOTH: '31063367', // No ad advance, no page advance, new cta.
  NO_ADVANCE_AD: '31063367', // No ad advance, page=10s, new cta.
  TEN_SECONDS: '31063368', // Advance ad with new cta for the rest, page=10s.
  TWELVE_SECONDS: '31063369',
  FOURTEEN_SECONDS: '31063370',
};

/** @const */
export const StoryAdSegmentTimes = {
  SENTINEL: '999999ms',
  TEN_SECONDS: '10000ms',
  TWELVE_SECONDS: '12000ms',
  FOURTEEN_SECONDS: '14000ms',
};

/** @const */
export const BranchToTimeValues = {
  [StoryAdSegmentExp.TEN_SECONDS]: StoryAdSegmentTimes.TEN_SECONDS,
  [StoryAdSegmentExp.TWELVE_SECONDS]: StoryAdSegmentTimes.TWELVE_SECONDS,
  [StoryAdSegmentExp.FOURTEEN_SECONDS]: StoryAdSegmentTimes.FOURTEEN_SECONDS,
};
