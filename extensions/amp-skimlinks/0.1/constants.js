export const AMP_SKIMLINKS_VERSION = '1.0.3';
export const XCUST_ATTRIBUTE_NAME = 'data-skimlinks-custom-tracking-id';
export const WAYPOINT_BASE_URL = 'https://go.skimresources.com';
export const PLATFORM_NAME = 'amp@' + AMP_SKIMLINKS_VERSION;
export const SKIMLINKS_REWRITER_ID = 'amp-skimlinks';

const DOMAIN_RESOLVER_API_URL = 'https://r.skimresources.com/api';
const TRACKING_API_URL = 'https://t.skimresources.com/api';
const PAGE_IMPRESSION_TRACKING_URL = `${TRACKING_API_URL}/track.php?data=\${data}`;
const LINKS_IMPRESSIONS_TRACKING_URL = `${TRACKING_API_URL}/link?data=\${data}`;
const NA_CLICK_TRACKING_URL = `${TRACKING_API_URL}/?call=track&rnd=\${rnd}&data=\${data}`;

export const DEFAULT_CONFIG = {
  pageTrackingUrl: PAGE_IMPRESSION_TRACKING_URL,
  linksTrackingUrl: LINKS_IMPRESSIONS_TRACKING_URL,
  nonAffiliateTrackingUrl: NA_CLICK_TRACKING_URL,
  beaconUrl: DOMAIN_RESOLVER_API_URL,
};

// Domains excluded from impressions & affiliation & NA click tracking.
export const GLOBAL_DOMAIN_DENYLIST = [
  'facebook.com',
  'go.redirectingat.com',
  'go.skimresources.com',
  'instagram.com',
  'twitter.com',
  'youtube.com',
];

export const OPTIONS_ERRORS = {
  INVALID_PUBCODE: '"publisher-code" is required.',
  INVALID_XCUST:
    '"custom-tracking-id" should be <=50 characters and only contain upper ' +
    'and lowercase characters, numbers, underscores and pipes.',
  INVALID_TRACKING_STATUS: '"tracking" possible values are "true" or "false".',
};
