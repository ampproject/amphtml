/**
 * Registred singleton on AMP doc.
 * @enum {number}
 */
export const AMPDOC_SINGLETON_NAME_ENUM = {
  TRACKING_IFRAME: 1,
  LINKER: 2,
};

/**
 * Enum for tick labels (used by Performance service)
 * @enum {string}
 */
export const TickLabel_Enum = {
  ACCESS_AUTHORIZATION: 'aaa',
  ACCESS_AUTHORIZATION_VISIBLE: 'aaav',
  CUMULATIVE_LAYOUT_SHIFT: 'cls',
  // The enum union of all source types contributing to the CLS
  CUMULATIVE_LAYOUT_SHIFT_TYPE_UNION: 'clstu',
  CUMULATIVE_LAYOUT_SHIFT_1: 'cls-1',
  CUMULATIVE_LAYOUT_SHIFT_2: 'cls-2',
  DOCUMENT_READY: 'dr',
  END_INSTALL_STYLES: 'e_is',
  FIRST_CONTENTFUL_PAINT: 'fcp',
  FIRST_CONTENTFUL_PAINT_VISIBLE: 'fcpv',
  FIRST_PAINT: 'fp',
  FIRST_INPUT_DELAY: 'fid',
  FIRST_VIEWPORT_READY: 'pc',
  INSTALL_STYLES: 'is',
  INTERACTION_TO_NEXT_PAINT: 'inp',
  LARGEST_CONTENTFUL_PAINT: 'lcp',
  LARGEST_CONTENTFUL_PAINT_TYPE: 'lcpt',
  LARGEST_CONTENTFUL_PAINT_VISIBLE: 'lcpv',
  LONG_TASKS_SELF: 'lts',
  MAKE_BODY_VISIBLE: 'mbv',
  MESSAGING_READY: 'msr',
  ON_FIRST_VISIBLE: 'ofv',
  ON_LOAD: 'ol',
  TIME_ORIGIN: 'timeOrigin',
  VIDEO_CACHE_STATE: 'vcs',
  VIDEO_ERROR: 'verr',
  VIDEO_ON_FIRST_PAGE: 'vofp',
  VIDEO_JOINT_LATENCY: 'vjl',
  VIDEO_MEAN_TIME_BETWEEN_REBUFFER: 'vmtbrb',
  VIDEO_REBUFFERS: 'vrb',
  VIDEO_REBUFFER_RATE: 'vrbr',
  VIDEO_WATCH_TIME: 'vwt',
};
