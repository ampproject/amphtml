export const XCUST_ATTRIBUTE_NAME = 'data-skimlinks-custom-tracking-id';
export const AFFILIATION_API = 'https://go.skimresources.com';
export const PLATFORM_NAME = 'amp';
export const SKIMLINKS_REWRITER_ID = 'amp-skimlinks';

export const DOMAIN_RESOLVER_API_URL = 'https://r.skimresources.com/api';
export const TRACKING_API_URL = 'https://t.skimresources.com/api';
export const PAGE_IMPRESSION_TRACKING_URL =
    `${TRACKING_API_URL}/track.php?data=\${data}`;
export const LINKS_IMPRESSIONS_TRACKING_URL =
    `${TRACKING_API_URL}/link?data=\${data}`;
export const NA_CLICK_TRACKING_URL =
    `${TRACKING_API_URL}/?call=track&rnd=\${rnd}&data=\${data}`;
