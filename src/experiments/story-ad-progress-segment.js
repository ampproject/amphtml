/** @const */
export const StoryAdSegmentExp = {
  ID: 'story-ad-progress-segment',
  CONTROL: '31061402',
  SIX_SECONDS: '31061403',
  EIGHT_SECONDS: '31061404',
  TEN_SECONDS: '31061405',
};

/** @const */
export const StoryAdSegmentTimes = {
  SENTINEL: '999999ms',
  SIX_SECONDS: '6000ms',
  EIGHT_SECONDS: '8000ms',
  TEN_SECONDS: '10000ms',
};

/** @const */
export const ViewerSetTimeToBranch = {
  [StoryAdSegmentTimes.SIX_SECONDS]: StoryAdSegmentExp.SIX_SECONDS,
  [StoryAdSegmentTimes.EIGHT_SECONDS]: StoryAdSegmentExp.EIGHT_SECONDS,
  [StoryAdSegmentTimes.TEN_SECONDS]: StoryAdSegmentExp.TEN_SECONDS,
  [StoryAdSegmentTimes.SENTINEL]: StoryAdSegmentExp.CONTROL,
};

/** @const */
export const BranchToTimeValues = {
  [StoryAdSegmentExp.SIX_SECONDS]: StoryAdSegmentTimes.SIX_SECONDS,
  [StoryAdSegmentExp.EIGHT_SECONDS]: StoryAdSegmentTimes.EIGHT_SECONDS,
  [StoryAdSegmentExp.TEN_SECONDS]: StoryAdSegmentTimes.TEN_SECONDS,
};
