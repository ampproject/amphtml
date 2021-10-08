const BASE_API_URL = 'https://api.narrativ.com/api';
/** @const @enum {string} */
export const ENDPOINTS = {
  PAGE_IMPRESSION_ENDPOINT: `${BASE_API_URL}/v1/events/impressions/page_impression/`,
  NRTV_CONFIG_ENDPOINT: `${BASE_API_URL}/v0/publishers/.nrtv_slug./amp_config/`,
  LINKMATE_ENDPOINT: `${BASE_API_URL}/v1/publishers/.pub_id./linkmate/smart_links/`,
};
