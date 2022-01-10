import {AmpStoryShoppingAttachment} from './amp-story-shopping-attachment';
import {AmpStoryShoppingConfig} from './amp-story-shopping-config';
import {AmpStoryShoppingTag} from './amp-story-shopping-tag';

import {CSS as shoppingCSS} from '../../../build/amp-story-shopping-0.1.css';

/**
 * Language and currency sensitive number formatting.
 * @param {../../../src/service/localization.LocalizationService} i18nService
 * @param {Element} element
 * @param {string} currency // An ISO 4217 currency code.
 * @param {number} price
 * @return {string}
 */
export const formatI18nNumber = (i18nService, element, currency, price) => {
  const langCode = i18nService.getLanguageCodesForElement(element)[0];
  return new Intl.NumberFormat(langCode, {style: 'currency', currency}).format(
    price
  );
};

AMP.extension('amp-story-shopping', '0.1', (AMP) => {
  AMP.registerElement('amp-story-shopping-config', AmpStoryShoppingConfig);
  AMP.registerElement(
    'amp-story-shopping-tag',
    AmpStoryShoppingTag,
    shoppingCSS
  );
  AMP.registerElement(
    'amp-story-shopping-attachment',
    AmpStoryShoppingAttachment
  );
});
