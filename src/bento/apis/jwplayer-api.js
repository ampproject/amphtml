import {addParamsToUrl} from '../../url';

/**
 * Makes iframe src url
 * @param {string} playerId
 * @param {string} playlistId
 * @param {string} mediaId
 * @param {string} contentSearch
 * @param {string} contentRecency
 * @param {boolean} contentBackfill
 * @param {object} queryParams
 * @param {{policyInfo, policyMetadata, policyState}} consentParams
 * @return {string} iframe src
 */
export function makeJwplayerIframeSrc(
  playerId,
  playlistId,
  mediaId,
  contentSearch,
  contentRecency,
  contentBackfill,
  queryParams,
  consentParams
) {
  if (!playerId) {
    return null;
  }
  const pid = encodeURIComponent(playerId);
  let cid = encodeURIComponent(playlistId || mediaId);
  if (cid === 'outstream') {
    cid = 'oi7pAMI1';
  }

  let url = `https://content.jwplatform.com/players/${cid}-${pid}.html`;

  const {policyInfo, policyMetadata, policyState} = consentParams;

  url = addParamsToUrl(url, {
    ...queryParams,
    'search': contentSearch || undefined,
    'recency': contentRecency || undefined,
    'backfill': contentBackfill || undefined,
    'isAMP': true,
    'consentState': policyState || undefined,
    'consentValue': policyInfo || undefined,
    'consentGdpr': policyMetadata?.gdprApplies || undefined,
  });
  return url;
}

export const JwplayerEvents = {
  PLAYING: 'playing',
  PAUSE: 'pause',
  ENDED: 'ended',
  VISIBILITY: 'amp:video:visibility',
  AD_START: 'ad_start',
  AD_END: 'ad_end',
};

export const JwplayerToDom = {
  'play': JwplayerEvents.PLAYING, // playing
  'pause': JwplayerEvents.PAUSE, // pause
  'complete': JwplayerEvents.ENDED, // ended
  'visible': JwplayerEvents.VISIBILITY, // amp:video:visibility
  'adImpression': JwplayerEvents.AD_START, // ad_start
  'adComplete': JwplayerEvents.AD_END, // ad_end
};
