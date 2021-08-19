/**
 * Registred singleton on AMP doc.
 * @enum {number}
 */
export const AMPDOC_SINGLETON_NAME = {
  TRACKING_IFRAME: 1,
  LINKER: 2,
};

/**
 * Enum for tick labels (used by Performance service)
 * @enum {string}
 */
export const TickLabel = {
  ACCESS_AUTHORIZATION: 'aaa',
  ACCESS_AUTHORIZATION_VISIBLE: 'aaav',
  ADS_LAYOUT_DELAY: 'adld',
  BAD_FRAMES: 'bf',
  BATTERY_DROP: 'bd',
  CONTENT_LAYOUT_DELAY: 'cld',
  CUMULATIVE_LAYOUT_SHIFT: 'cls',
  CUMULATIVE_LAYOUT_SHIFT_2: 'cls-2',
  // TODO(#33207): Remove after data collection
  CUMULATIVE_LAYOUT_SHIFT_BEFORE_FCP: 'cls-fcp',
  CUMULATIVE_LAYOUT_SHIFT_BEFORE_VISIBLE: 'cls-ofv',
  DOCUMENT_READY: 'dr',
  END_INSTALL_STYLES: 'e_is',
  FIRST_CONTENTFUL_PAINT: 'fcp',
  FIRST_CONTENTFUL_PAINT_VISIBLE: 'fcpv',
  FIRST_PAINT: 'fp',
  FIRST_INPUT_DELAY: 'fid',
  FIRST_INPUT_DELAY_POLYFILL: 'fid-polyfill',
  FIRST_VIEWPORT_READY: 'pc',
  GOOD_FRAME_PROBABILITY: 'gfp',
  INSTALL_STYLES: 'is',
  LARGEST_CONTENTFUL_PAINT: 'lcp',
  LARGEST_CONTENTFUL_PAINT_VISIBLE: 'lcpv',
  LONG_TASKS_CHILD: 'ltc',
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
