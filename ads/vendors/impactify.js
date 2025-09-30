import {loadScript, validateData} from '#3p/3p';

import {CONSENT_STRING_TYPE} from '#core/constants/consent-state';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function impactify(global, data) {
  validateData(data, ['appId', 'format', 'style']);

  const doc = global.document;
  const container = doc.createElement('div');
  const slotId = `impactify-slot-${Math.floor(Math.random() * 10000)}`;
  container.id = slotId;
  doc.getElementById('c').appendChild(container);

  // GDPR and consent handling
  const {
    initialConsentMetadata,
    initialConsentValue,
    noContentAvailable,
    renderStart,
  } = global.context;

  const gdprApplies = initialConsentMetadata?.gdprApplies;
  const gdprConsent =
    initialConsentMetadata?.consentStringType === CONSENT_STRING_TYPE.TCF_V2
      ? initialConsentValue
      : '';

  global.impactifyTag = global.impactifyTag || [];
  global.impactifyTag.push({
    appId: data['appId'],
    format: data['format'],
    style: data['style'],
    'gdpr_consent': gdprConsent,
    gdpr: gdprApplies,
    slotId,
    isAmp: true,
    codeName: `${data['width']}x${data['height']}`,
    onAd: () => renderStart(),
    onNoAd: () => noContentAvailable(),
  });

  loadScript(global, 'https://ad.impactify.io/static/ad/tag.js');
}
